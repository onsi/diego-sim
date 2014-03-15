package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
)

func main() {
	srcDir := os.Args[1]
	println("processing", srcDir)

	println("etcdstats")
	out := "window.diego = {"
	etcdStatsB, _ := ioutil.ReadFile(filepath.Join(srcDir, "etcdstats.log"))
	etcdStats := string(etcdStatsB)
	out += "etcd_stats:["
	out += strings.Join(strings.Split(etcdStats, "\n"), ",")
	out += "],\n"

	println("info")
	infoB, err := ioutil.ReadFile(filepath.Join(srcDir, "info.json"))
	if err != nil {
		panic(err)
	}
	info := string(infoB)
	out += "info:"
	out += strings.Join(strings.Split(info, "\n"), "")
	out += ",\n"

	println("result")
	resultB, err := ioutil.ReadFile(filepath.Join(srcDir, "result.json"))
	if err != nil {
		panic(err)
	}
	result := string(resultB)
	out += "result:"
	out += strings.Join(strings.Split(result, "\n"), "")
	out += ",\n"

	println("simulator log")
	errorLines := parseLogLines(filepath.Join(srcDir, "simulator.log"))

	println("exectors log")
	errorLines = append(errorLines, parseLogLines(filepath.Join(srcDir, "executors.log"))...)

	out += "errors:["
	out += strings.Join(errorLines, ",")
	out += "]"
	out += "}"

	ioutil.WriteFile("/Users/onsi/diego-workspace/src/github.com/cloudfoundry-incubator/simulator/viz/data/data.json", []byte(out), 0777)

	exec.Command("open", "/Users/onsi/diego-workspace/src/github.com/cloudfoundry-incubator/simulator/viz/application.html").Run()
}

func parseLogLines(file string) []string {
	errorLines := []string{}
	simulatorLogB, _ := ioutil.ReadFile(file)
	simulatorLog := string(simulatorLogB)
	for _, logLine := range strings.Split(simulatorLog, "\n") {
		if strings.Contains(logLine, "[ERR]") {
			pieces := strings.SplitN(logLine, " [ERR] ", 2)
			time, _ := strconv.ParseFloat(pieces[0], 64)
			errorLines = append(errorLines, fmt.Sprintf(`{"time":%.4f, "line":"%s"}`, time, pieces[1]))
		}
	}

	return errorLines
}
