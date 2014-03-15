package main

import (
	"encoding/json"
	"fmt"
	"github.com/cloudfoundry-incubator/simulator/logger"
	"github.com/cloudfoundry-incubator/simulator/models"
	"io/ioutil"
	"path/filepath"
	"strconv"
	"sync"
	"time"
)

type runOnceData struct {
	Index          int     `json:"index"`
	DesiredTime    float64 `json:"desired_time"`
	CompletionTime float64 `json:"completed_time"`
	ExecutorIndex  int     `json:"executor"`
	NumCompletions int     `json:"num_completions"`
}

var simulationLock *sync.Mutex
var simulationWait *sync.WaitGroup
var runOnceTracker map[string]*runOnceData

func runSimulation() {
	simulationLock = &sync.Mutex{}
	simulationWait = &sync.WaitGroup{}
	runOnceTracker = map[string]*runOnceData{}

	t := time.Now()
	logger.Info("simulation.start", nRunOnces)
	simulationWait.Add(nRunOnces)
	go watchForCompletedRunOnces()
	desireAllRunOnces()
	simulationWait.Wait()
	dt := time.Since(t)
	logger.Info("simulation.end", nRunOnces, "runtime", dt)
	simulationResult(dt)
}

func desireAllRunOnces() {
	logger.Info("desiring.runonces", nRunOnces)

	dt := over / time.Duration(nRunOnces)

	allDesired := &sync.WaitGroup{}
	for index := 1; index <= nRunOnces; index++ {
		allDesired.Add(1)
		runOnce := models.RunOnce{
			Guid:     fmt.Sprintf("%d", index),
			MemoryMB: runOnceMemory,
		}
		innerIndex := index
		go func() {
			defer allDesired.Done()
			logger.Info("desiring.runonce", innerIndex)
			registerDesired(innerIndex)
			err := bbs.DesireRunOnce(runOnce)
			if err != nil {
				logger.Error("desire.runonce.failed", innerIndex, err)
			}
			logger.Info("desired.runonce", innerIndex)
		}()
		time.Sleep(dt)
	}
	allDesired.Wait()
	logger.Info("all.runonces.desired")
}

func registerDesired(index int) {
	simulationLock.Lock()
	runOnceTracker[fmt.Sprintf("%d", index)] = &runOnceData{
		Index:       index,
		DesiredTime: float64(time.Now().UnixNano()) / 1e9,
	}
	simulationLock.Unlock()
}

func watchForCompletedRunOnces() {
	for {
		logger.Info("watch.completed")
		runOnces, _, errs := bbs.WatchForCompletedRunOnce()
	waitForRunOnce:
		for {
			select {
			case runOnce, ok := <-runOnces:
				if !ok {
					logger.Info("watch.completed.closed")
					break waitForRunOnce
				}
				go handleCompletedRunOnce(runOnce)
			case err, ok := <-errs:
				if ok && err != nil {
					logger.Info("watch.completed.error", err)
				}
				break waitForRunOnce
			}
		}
	}
}

func handleCompletedRunOnce(runOnce models.RunOnce) {
	simulationLock.Lock()
	data, ok := runOnceTracker[runOnce.Guid]
	if !ok {
		logger.Error("uknown.runonce.completed", runOnce.Guid, "executor", runOnce.ExecutorID)
		simulationLock.Unlock()
		return
	}

	data.CompletionTime = float64(time.Now().UnixNano()) / 1e9
	logger.Info("runonce.completed", runOnce.Guid, "executor", runOnce.ExecutorID, "duration", data.CompletionTime-data.DesiredTime)
	data.ExecutorIndex, _ = strconv.Atoi(runOnce.ExecutorID)
	data.NumCompletions++
	numCompletions := data.NumCompletions
	simulationLock.Unlock()

	if numCompletions == 1 {
		defer simulationWait.Done()
		logger.Info("runonce.resolve", runOnce.Guid)
		err := bbs.ResolveRunOnce(runOnce)
		if err != nil {
			logger.Error("runonce.resolve.error", runOnce.Guid, err)
			return
		}
		logger.Info("runonce.resolved", runOnce.Guid)
	}
}

func simulationResult(dt time.Duration) {
	simulationLock.Lock()
	defer simulationLock.Unlock()

	executorDistribution := map[string]int{}
	for _, runData := range runOnceTracker {
		executorDistribution[fmt.Sprintf("%d", runData.ExecutorIndex)]++
	}
	executorDistributionData, _ := json.Marshal(executorDistribution)

	encodedRunOnceData, _ := json.Marshal(runOnceTracker)

	data := fmt.Sprintf(`{
	"elapsed_time": %.4f,
	"executor_distribution": %s,
	"run_once_data": %s
}
`, float64(dt)/1e9, string(executorDistributionData), string(encodedRunOnceData))

	ioutil.WriteFile(filepath.Join(outDir, "result.json"), []byte(data), 0777)
}
