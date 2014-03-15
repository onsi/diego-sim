RunOncePlot = function(graph) {
  this.graph = graph;
 }

RunOncePlot.prototype = {
  compute: function() {
    this.targetRunOnces = diego.info.run_onces;
    
    this.startTime = diego.etcd_stats[0].time
    this.endTime = _.last(diego.etcd_stats).time
    this.duration = this.endTime - this.startTime

    this.time = []
    this.pending = []
    this.claimed = []
    this.running = []
    this.completed = []

    _.each(diego.etcd_stats, function(stat) {
      this.time.push(stat.time - this.startTime)
      this.pending.push(stat.pending)
      this.claimed.push(stat.claimed)
      this.running.push(stat.running)
      this.completed.push(stat.completed)
    }, this)
    console.log(this.completed)
  },

  draw: function(time) {
    this.graph.clear();
    this.drawData(time);
    this.setScale();
    this.drawAxes();
    this.graph.draw();
  },

  drawData: function(time) {
    this.graph.add(new LinePlot([0, this.duration], [this.targetRunOnces, this.targetRunOnces], '#555', 1, [5]));
    this.graph.add(new LinePlot(this.time, this.pending, '#000', 3));
    this.graph.add(new LinePlot(this.time, this.claimed, '#F00', 2));
    this.graph.add(new LinePlot(this.time, this.running, '#00F', 2));
    this.graph.add(new LinePlot(this.time, this.completed, '#050', 2));
    this.graph.add(new LinePlot([time, time], [0, this.targetRunOnces], "#333", 1));
  },

  setScale: function() {
    this.graph.setScale(new PlotScale({
      xmin: 0,
      xmax: this.duration,
      ymin: 0,
      ymax: this.targetRunOnces,
      width: this.graph.width(),
      height: this.graph.height(),
      leftMargin: 60,
      bottomMargin: 10,
      topMargin:40,
      rightMargin:10
    }));
  },

  drawAxes: function() {
    setUpCommonAxes(this.graph, 'north');
    this.graph.add(this.buildYAxis('west'));
    this.graph.add(new Axis({location:'east'}));
  },

  buildYAxis: function(location) {
    return new Axis({
      location: location,
      majorTicks: _.range(0, this.targetRunOnces, this.targetRunOnces / 10),
      minorTicks: _.range(0, this.targetRunOnces, this.targetRunOnces / 50),
      labels: _(_.range(0, this.targetRunOnces, this.targetRunOnces / 10)).map(function(y) {
        return {y: y, label: y}
      }).value(),
      font: '24px sans-serif'
    });
  }
}