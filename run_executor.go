package main

import (
	"fmt"
	"github.com/cloudfoundry-incubator/simulator/logger"
	"github.com/onsi/ginkgo/cleanup"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

func startExecutors() {
	executorOutput, err := os.Create(filepath.Join(outDir, "executors.log"))
	if err != nil {
		logger.Fatal("executor.output.file.create.failed", err)
	}
	cleanup.Register(func() {
		executorOutput.Sync()
	})

	logger.Info("starting.all.executors", nExecutors)
	allExecutorsStarted := &sync.WaitGroup{}
	for index := 1; index <= nExecutors; index++ {
		allExecutorsStarted.Add(1)
		go startAndMonitorExecutor(index, executorOutput, allExecutorsStarted)
	}
	allExecutorsStarted.Wait()
	logger.Info("started.all.executors", nExecutors)
}

func startAndMonitorExecutor(index int, output *os.File, ready *sync.WaitGroup) {
	cmd := commandForExecutor(index, output)

	logger.Info("starting.executor", index)
	cmd.Start()
	time.Sleep(100 * time.Millisecond) //give it a second...
	ready.Done()

	shuttingDown := false
	cleanup.Register(func() {
		shuttingDown = true
		if cmd.Process != nil {
			cmd.Process.Kill()
		}
	})

	restartCount := 0
	for {
		err := cmd.Wait()
		logger.Error("executor.exited", index, err)
		if shuttingDown {
			return
		}
		restartCount++
		logger.Info("restarting.executor", index, restartCount)
		cmd = commandForExecutor(index, output)
		cmd.Start()
	}
}

func commandForExecutor(index int, writer io.Writer) *exec.Cmd {
	args := []string{
		"-executorID", fmt.Sprintf("%d", index),
		"-etcdCluster", strings.Join(etcd.NodeURLS(), ","),
		"-availableMemory", fmt.Sprintf("%d", executorMemory),
	}
	cmd := exec.Command("game_executor", args...)
	if verbose {
		writer = io.MultiWriter(writer, os.Stdout)
	}
	cmd.Stdout = writer
	cmd.Stderr = writer

	return cmd
}
