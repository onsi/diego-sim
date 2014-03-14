package logger

import (
	"fmt"
	"github.com/onsi/ginkgo/cleanup"
	"io"
	"os"
	"time"
)

var Component string
var Writer io.Writer

func init() {
	Writer = os.Stdout
}

func Info(args ...interface{}) {
	fmt.Fprintf(Writer, "%.4f [INF] %s - ", float64(time.Now().UnixNano())/1e9, Component)
	if len(args) == 0 {
		fmt.Fprintf(Writer, "\n")
	} else {
		fmt.Fprintln(Writer, args...)
	}
}

func Error(args ...interface{}) {
	fmt.Fprintf(Writer, "%.4f [ERR] %s - ", float64(time.Now().UnixNano())/1e9, Component)
	if len(args) == 0 {
		fmt.Fprintf(Writer, "\n")
	} else {
		fmt.Fprintln(Writer, args...)
	}
}

func Fatal(args ...interface{}) {
	fmt.Fprintf(Writer, "%.4f [FTL] %s - ", float64(time.Now().UnixNano())/1e9, Component)
	if len(args) == 0 {
		fmt.Fprintf(Writer, "\n")
	} else {
		fmt.Fprintln(Writer, args...)
	}

	cleanup.Exit(1)
}
