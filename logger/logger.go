package logger

import (
	"fmt"
	"github.com/onsi/ginkgo/cleanup"
	"io"
	"os"
	"sync"
	"time"
)

var Component string
var Writer io.Writer
var lock *sync.Mutex

func init() {
	Writer = os.Stdout
	lock = &sync.Mutex{}
}

func Info(args ...interface{}) {
	lock.Lock()
	defer lock.Unlock()
	fmt.Fprintf(Writer, "%.4f [INF] %s - ", float64(time.Now().UnixNano())/1e9, Component)
	if len(args) == 0 {
		fmt.Fprintf(Writer, "\n")
	} else {
		fmt.Fprintln(Writer, args...)
	}
}

func Error(args ...interface{}) {
	lock.Lock()
	defer lock.Unlock()
	fmt.Fprintf(Writer, "%.4f [ERR] %s - ", float64(time.Now().UnixNano())/1e9, Component)
	if len(args) == 0 {
		fmt.Fprintf(Writer, "\n")
	} else {
		fmt.Fprintln(Writer, args...)
	}
}

func Fatal(args ...interface{}) {
	lock.Lock()
	fmt.Fprintf(Writer, "%.4f [FTL] %s - ", float64(time.Now().UnixNano())/1e9, Component)
	if len(args) == 0 {
		fmt.Fprintf(Writer, "\n")
	} else {
		fmt.Fprintln(Writer, args...)
	}
	lock.Unlock()

	cleanup.Exit(1)
}
