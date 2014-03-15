package main

import (
	"flag"
	"fmt"
	"github.com/cloudfoundry-incubator/simulator/game_bbs"
	"github.com/cloudfoundry-incubator/simulator/logger"
	"github.com/cloudfoundry-incubator/simulator/models"
	"github.com/cloudfoundry/storeadapter/etcdstoreadapter"
	"github.com/cloudfoundry/storeadapter/workerpool"
	"github.com/onsi/ginkgo/cleanup"
	"math/rand"
	"strconv"
	"strings"
	"sync"
	"time"
)

var executorID = flag.String("executorID", "executor-id", "the executor's ID")
var etcdCluster = flag.String("etcdCluster", "http://127.0.0.1:4001", "comma-separated list of etcd addresses (http://ip:port)")
var containerCreationSleepRange = flag.String("containerCreationSleepRange", "100,500", "min,max in milliseconds")
var runSleepRange = flag.String("runSleepRange", "5000,5001", "min,max in milliseconds")
var heartbeatInterval = flag.Duration("heartbeatInterval", 60*time.Second, "the interval, in seconds, between heartbeats for maintaining presence")
var convergenceInterval = flag.Duration("convergenceInterval", 30*time.Second, "the interval, in seconds, between convergences")
var timeToClaimRunOnce = flag.Duration("timeToClaimRunOnce", 30*time.Minute, "unclaimed run onces are marked as failed, after this time (in seconds)")
var maxMemory = flag.Int("availableMemory", 1000, "amount of available memory")

var lock *sync.Mutex
var currentMemory int
var stop chan bool
var tasks *sync.WaitGroup

var RAND *rand.Rand

func init() {
	RAND = rand.New(rand.NewSource(time.Now().UnixNano()))
}

func main() {
	flag.Parse()
	cleanup.Register(func() {
		logger.Info("executor.shuttingdown")
		close(stop)
		tasks.Wait()
		logger.Info("executor.shutdown")
	})
	logger.Component = fmt.Sprintf("EXECUTOR %s", *executorID)

	lock = &sync.Mutex{}
	currentMemory = *maxMemory

	etcdAdapter := etcdstoreadapter.NewETCDStoreAdapter(
		strings.Split(*etcdCluster, ","),
		workerpool.NewWorkerPool(10),
	)

	tasks = &sync.WaitGroup{}
	stop = make(chan bool)

	bbs := game_bbs.New(etcdAdapter)
	err := etcdAdapter.Connect()
	if err != nil {
		logger.Fatal("etcd.connect.fatal", err)
	}

	go maintainPresence(bbs)
	go handleRunOnces(bbs)
	go convergeRunOnces(bbs)
	logger.Info("executor.up")
	select {}
}

func maintainPresence(bbs game_bbs.ExecutorBBS) {
	presence, maintainingPresenceErrors, err := bbs.MaintainExecutorPresence(*heartbeatInterval, *executorID)
	if err != nil {
		logger.Fatal("establish.presence.fatal", err)
	}

	tasks.Add(1)

	select {
	case err := <-maintainingPresenceErrors:
		tasks.Done()
		logger.Fatal("maintain.presence.fatal", err)
	case <-stop:
		presence.Remove()
		tasks.Done()
	}
}

func handleRunOnces(bbs game_bbs.ExecutorBBS) {
	tasks.Add(1)

	for {
		logger.Info("watch.desired")
		runOnces, stopWatching, errors := bbs.WatchForDesiredRunOnce()

	INNER:
		for {
			select {
			case runOnce, ok := <-runOnces:
				if !ok {
					logger.Info("watch.desired.closed")
					break INNER
				}

				go func() {
					tasks.Add(1)
					handleRunOnce(bbs, runOnce)
					tasks.Done()
				}()
			case err, ok := <-errors:
				if ok && err != nil {
					logger.Error("watch.desired.error", err)
				}
				break INNER
			case <-stop:
				stopWatching <- true
				tasks.Done()
			}
		}
	}
}

func convergeRunOnces(bbs game_bbs.ExecutorBBS) {
	tasks.Add(1)

	for {
		lostLock, releaseLock, err := bbs.MaintainConvergeLock(*convergenceInterval, *executorID)
		if err != nil {
			logger.Info("maintain.converge.lock.failed", err)
			time.Sleep(1 * time.Second)
			continue
		}

		logger.Info("converging")
		t := time.Now()
		bbs.ConvergeRunOnce(*timeToClaimRunOnce)
		logger.Info("converged", time.Since(t))

		ticker := time.NewTicker(*convergenceInterval)

	dance:
		for {
			select {
			case <-ticker.C:
				logger.Info("converging")
				t := time.Now()
				bbs.ConvergeRunOnce(*timeToClaimRunOnce)
				logger.Info("converged", time.Since(t))

			case <-lostLock:
				logger.Error("lost.convergence.lock")
				ticker.Stop()
				break dance

			case <-stop:
				ticker.Stop()
				releaseLock <- make(chan bool)
				tasks.Done()
				return
			}
		}
	}
}

func handleRunOnce(bbs game_bbs.ExecutorBBS, runOnce models.RunOnce) {
	//hesitate
	logger.Info("handling.runonce", runOnce.Guid)
	sleepForARandomInterval("sleep.claim", 0, 100)

	//reserve memory
	ok := reserveMemory(runOnce.MemoryMB)
	if !ok {
		logger.Info("reserve.memory.failed", runOnce.Guid)
		return
	}
	defer releaseMemory(runOnce.MemoryMB)

	//mark claimed
	runOnce.ExecutorID = *executorID

	logger.Info("claiming.runonce", runOnce.Guid)

	err := bbs.ClaimRunOnce(runOnce)
	if err != nil {
		logger.Info("claim.runonce.failed", runOnce.Guid, err)
		return
	}

	logger.Info("claimed.runonce", runOnce.Guid)

	//create container

	sleepForContainerCreationInterval()
	runOnce.ContainerHandle = "container"

	//mark started

	logger.Info("starting.runonce", runOnce.Guid)

	err = bbs.StartRunOnce(runOnce)
	if err != nil {
		logger.Error("start.runonce.failed", runOnce.Guid, err)
		return
	}

	logger.Info("started.runonce", runOnce.Guid)

	//run

	sleepForRunInterval()
	runOnce.Failed = false

	//mark completed

	logger.Info("completing.runonce", runOnce.Guid)

	err = bbs.CompleteRunOnce(runOnce)
	if err != nil {
		logger.Error("complete.runonce.failed", runOnce.Guid, err)
		return
	}

	logger.Info("completed.runonce", runOnce.Guid)
}

func reserveMemory(memory int) bool {
	lock.Lock()
	defer lock.Unlock()
	if currentMemory >= memory {
		currentMemory = currentMemory - memory
		return true
	}
	return false
}

func releaseMemory(memory int) {
	lock.Lock()
	defer lock.Unlock()
	currentMemory = currentMemory + memory
	if currentMemory > *maxMemory {
		logger.Error("bookkeeping.fail", "current memory exceeds original max memory... how?")
		currentMemory = *maxMemory
	}
}

func sleepForContainerCreationInterval() {
	containerCreationSleep := strings.Split(*containerCreationSleepRange, ",")
	minContainerCreationSleep, err := strconv.Atoi(containerCreationSleep[0])
	if err != nil {
		logger.Fatal("container.creation.sleep.min.parse.fatal", err)
	}
	maxContainerCreationSleep, err := strconv.Atoi(containerCreationSleep[1])
	if err != nil {
		logger.Fatal("container.creation.sleep.min.parse.fatal", err)
	}
	sleepForARandomInterval("sleep.create", minContainerCreationSleep, maxContainerCreationSleep)
}

func sleepForRunInterval() {
	runSleep := strings.Split(*runSleepRange, ",")
	minRunSleep, err := strconv.Atoi(runSleep[0])
	if err != nil {
		logger.Fatal("run.sleep.min.parse.fatal", err)
	}
	maxRunSleep, err := strconv.Atoi(runSleep[1])
	if err != nil {
		logger.Fatal("run.sleep.min.parse.fatal", err)
	}
	sleepForARandomInterval("sleep.run", minRunSleep, maxRunSleep)
}

func sleepForARandomInterval(reason string, minSleepTime, maxSleepTime int) {
	interval := RAND.Intn(maxSleepTime-minSleepTime) + minSleepTime
	logger.Info(reason, fmt.Sprintf("%dms", interval))
	time.Sleep(time.Duration(interval) * time.Millisecond)
}
