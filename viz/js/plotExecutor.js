ExecutorPlot = function(graph) {
  this.graph = graph;
 }

ExecutorPlot.prototype = {
  compute: function() {
    this.targetRunOnces = diego.info.run_onces;
    
    this.startTime = diego.etcd_stats[0].time
    this.endTime = _.last(diego.etcd_stats).time
    this.duration = this.endTime - this.startTime

    this.time = []
    this.executors = []

    _.each(diego.etcd_stats, function(stat) {
      this.time.push(stat.time - this.startTime)
      this.executors.push(stat.present_executors)
    }, this)
    this.yMax = _.max(this.executors)
  },

  draw: function(time) {
    this.graph.clear();
    this.drawData(time);
    this.setScale();
    this.drawAxes();
    this.graph.draw();
  },

  drawData: function(time) {
    this.graph.add(new LinePlot(this.time, this.executors, '#000', 3));
    this.graph.add(new LinePlot([time, time], [0, this.yMax], "#333", 1));
    _.each(_.keys(window.errorLogs), function (time) {
      this.graph.add(new VerticalBar(parseFloat(time) - 0.5, parseFloat(time) + 0.5, "#f00", 0.2))
    }, this)
  },

  setScale: function() {
    this.graph.setScale(new PlotScale({
      xmin: 0,
      xmax: this.duration,
      ymin: 0,
      ymax: this.yMax * 1.01,
      width: this.graph.width(),
      height: this.graph.height(),
      leftMargin: 10,
      bottomMargin: 10,
      topMargin:40,
      rightMargin:60
    }));
  },

  drawAxes: function() {
    setUpCommonAxes(this.graph, 'north');
    this.graph.add(this.buildYAxis('east'));
    this.graph.add(new Axis({location:'west'}));
  },

  buildYAxis: function(location) {
    return new Axis({
      location: location,
      majorTicks: _.range(0, this.yMax, this.yMax / 10),
      minorTicks: _.range(0, this.yMax, this.yMax / 50),
      labels: _(_.range(0, this.yMax, this.yMax / 10)).map(function(y) {
        return {y: y, label: y}
      }).value(),
      font: '24px sans-serif'
    });
  }
}