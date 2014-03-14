package main

import (
	"encoding/json"
	"fmt"
	"github.com/cloudfoundry-incubator/runtime-schema/models"
	"github.com/cloudfoundry-incubator/simulator/game_bbs"
	"github.com/cloudfoundry-incubator/simulator/logger"
	"github.com/onsi/ginkgo/cleanup"
	"io"
	"os"
	"path/filepath"
	"time"
)

type etcdData struct {
	Time              float64        `json:"time"`
	Pending           int            `json:"pending"`
	Claimed           int            `json:"claimed"`
	Running           int            `json:"running"`
	Completed         int            `json:"completed"`
	PresentExecutors  int            `json:"present_executors"`
	RunningByExecutor map[string]int `json:"running_by_executor"`
}

func (d *etcdData) toJson() []byte {
	data, err := json.Marshal(d)
	if err != nil {
		logger.Error("etcd.marshal.etcdData.failed", err)
	}
	return data
}

func (d *etcdData) String() string {
	return fmt.Sprintf("Executors: %d Pending: %d, Claimed: %d, Running: %d, Completed: %d", d.PresentExecutors, d.Pending, d.Claimed, d.Running, d.Completed)
}

func monitorETCD() {
	outputFile, err := os.Create(filepath.Join(outDir, "etcdstats.log"))
	if err != nil {
		logger.Fatal("etcd.log.creation.failure", err)
	}
	cleanup.Register(func() {
		outputFile.Sync()
	})

	go monitorRunOnces(outputFile)
}

func monitorRunOnces(out io.Writer) {
	go func() {
		ticker := time.NewTicker(time.Second)
		for {
			<-ticker.C
			t := time.Now()
			logger.Info("fetch.etcd.runonce.data")
			runOnceNodes, err := etcdAdapter.ListRecursively(game_bbs.RunOnceSchemaRoot)
			if err != nil {
				logger.Info("fetch.etcd.runOnceNodes.error", err)
			}

			executorNode, err := etcdAdapter.ListRecursively(game_bbs.ExecutorSchemaRoot)
			if err != nil {
				logger.Info("fetch.etcd.executorNode.error", err)
			}

			d := etcdData{
				Time:              float64(time.Now().UnixNano()) / 1e9,
				RunningByExecutor: map[string]int{},
				PresentExecutors:  len(executorNode.ChildNodes),
			}
			pending, ok := runOnceNodes.Lookup("pending")
			if ok {
				d.Pending = len(pending.ChildNodes)
			}

			claimed, ok := runOnceNodes.Lookup("pending")
			if ok {
				d.Claimed = len(claimed.ChildNodes)
			}

			running, ok := runOnceNodes.Lookup("running")
			if ok {
				d.Running = len(running.ChildNodes)
				for _, node := range running.ChildNodes {
					runOnce, err := models.NewRunOnceFromJSON(node.Value)
					if err != nil {
						logger.Error("etcd.decode.runonce", err)
					}
					d.RunningByExecutor[runOnce.ExecutorID] += 1
				}
			}

			completed, ok := runOnceNodes.Lookup("completed")
			if ok {
				d.Completed = len(completed.ChildNodes)
			}

			logger.Info("fetched.etcd.runonce.data", time.Since(t), d.String())
			out.Write(d.toJson())
			out.Write([]byte("\n"))
		}
	}()
}
