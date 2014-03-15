package main

import (
	"flag"
	"fmt"
	"github.com/cloudfoundry-incubator/simulator/game_bbs"
	"github.com/cloudfoundry-incubator/simulator/logger"
	"github.com/cloudfoundry/storeadapter/etcdstoreadapter"
	"github.com/cloudfoundry/storeadapter/storerunner/etcdstorerunner"
	"github.com/cloudfoundry/storeadapter/workerpool"
	"github.com/onsi/ginkgo/cleanup"
	"io"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

var etcdNodes int
var nExecutors int
var nRunOnces int
var executorMemory int
var runOnceMemory int
var outDir string
var verbose bool
var over time.Duration

func init() {
	flag.IntVar(&etcdNodes, "etcd-nodes", 1, "# of etcd nodes")
	flag.IntVar(&nExecutors, "executors", 1, "# of executors")
	flag.IntVar(&nRunOnces, "run-onces", 1, "# of run onces")
	flag.IntVar(&executorMemory, "executor-available-memory", 1000, "executor available memory")
	flag.IntVar(&runOnceMemory, "run-once-memory", 100, "RunOnce required memory")
	flag.StringVar(&outDir, "output-directory", "", "Output directory")
	flag.BoolVar(&verbose, "v", false, "Verbose mode")
	flag.DurationVar(&over, "over", 0, "Duration over which to emit the events")
}

var etcd *etcdstorerunner.ETCDClusterRunner
var etcdAdapter *etcdstoreadapter.ETCDStoreAdapter
var bbs *game_bbs.BBS

func main() {
	flag.Parse()

	//make the out dir
	logger.Component = "SIMULATOR"
	if outDir == "" {
		logger.Fatal("out.dir.unspecified")
	}
	err := os.MkdirAll(outDir, 0777)
	if err != nil {
		logger.Fatal("out.dir.creation.failed", err)
	}

	//set up logging
	outputFile, err := os.Create(filepath.Join(outDir, "simulator.log"))
	if err != nil {
		logger.Fatal("failed.to.create.simulator.log", err)
	}
	logger.Writer = io.MultiWriter(os.Stdout, outputFile)
	cleanup.Register(func() {
		outputFile.Sync()
	})

	//compile the executor
	logger.Info("compiling.executor")
	output, err := exec.Command("go", "install", "github.com/cloudfoundry-incubator/simulator/game_executor").CombinedOutput()
	if err != nil {
		logger.Fatal("failed.to.compile.executor", string(output))
	}

	//write info to the output dir
	writeInfo()

	//start etcd
	logger.Info("starting.etcd", etcdNodes)
	etcd = etcdstorerunner.NewETCDClusterRunner(4001, etcdNodes)
	etcd.Start()

	//set up the bbs
	pool := workerpool.NewWorkerPool(50)
	etcdAdapter = etcdstoreadapter.NewETCDStoreAdapter(etcd.NodeURLS(), pool)
	etcdAdapter.Connect()
	bbs = game_bbs.New(etcdAdapter)

	//monitor etcd
	monitorETCD()

	//start executors
	startExecutors()

	cleanup.Register(func() {
		logger.Info("stopping.etcd", etcdNodes)
		etcd.Stop()
	})

	//run the simulator
	runSimulation()

	cleanup.Exit(0)
}

func writeInfo() {
	data := fmt.Sprintf(`{
    etcd_nodes:%d,
    executors:%d,
    run_onces:%d,
    executor_available_memory:%d,
    run_once_memory:%d,
    over:%.4f
}
`, etcdNodes, nExecutors, nRunOnces, executorMemory, runOnceMemory, float64(over)/float64(time.Second))

	logger.Info("simulator.running", data)

	ioutil.WriteFile(filepath.Join(outDir, "info.json"), []byte(data), 0777)
}
