DistributionPlot = function(graph) {
  this.graph = graph;
 }

DistributionPlot.prototype = {
  compute: function() {
    this.targetRunOnces = diego.info.run_onces;
    
    this.executors = []
    for (i = 1 ; i < diego.info.executors+1 ;i++) {
      this.executors.push(i-0.5)
      this.executors.push(i+0.5)
    }

    this.finalDistribution = this.computeDistribution(window.duration)

    this.yMax = Math.ceil(_.max(this.finalDistribution))
  },

  computeDistribution: function(time) {
    var distribution = []
    for (i = 1 ; i < diego.info.executors+1 ;i++) {
      distribution[i - 1] = 0
    }

    _.each(diego.result.run_once_data, function(data) {
      if (data.completed_time - window.startTime <= time) {
        distribution[data.executor - 1] += 1
      }
    })


    var finalDistribution = []
    for (i = 1 ; i < diego.info.executors+1 ;i++) {
      finalDistribution.push(distribution[i])
      finalDistribution.push(distribution[i])
    }

    return finalDistribution
  },

  draw: function(time) {
    this.graph.clear();
    this.drawData(time);
    this.setScale();
    this.drawAxes();
    this.graph.draw();
  },

  drawData: function(time) {
    this.graph.add(new LinePlot(this.executors, this.finalDistribution, '#000', 3));
    this.graph.add(new LinePlot(this.executors, this.computeDistribution(time), '#F00', 3));
  },

  setScale: function() {
    this.graph.setScale(new PlotScale({
      xmin: 1,
      xmax: diego.info.executors,
      ymin: 0,
      ymax: this.yMax * 1.01,
      width: this.graph.width(),
      height: this.graph.height(),
      leftMargin: 60,
      bottomMargin: 40,
      topMargin:10,
      rightMargin:60
    }));
  },

  drawAxes: function() {
    this.graph.add(this.buildXAxis('south'));
    this.graph.add(new Axis({location:'north'}));
    this.graph.add(this.buildYAxis('east'));
    this.graph.add(this.buildYAxis('west'));
  },

  buildXAxis: function(location) {
    return new Axis({
      location: location,
      majorTicks: _.range(1, diego.info.executors + 1, 10),
      minorTicks: _.range(1, diego.info.executors + 1, 5),
      labels: _(_.range(0, diego.info.executors, 10)).map(function(x) {
        return {x: x, label: x}
      }).value(),
      font: '24px sans-serif'
    });
  },

  buildYAxis: function(location) {
    return new Axis({
      location: location,
      majorTicks: _.range(0, this.yMax, this.yMax / 10),
      labels: _(_.range(0, this.yMax, this.yMax / 10)).map(function(y) {
        return {y: y, label: y}
      }).value(),
      font: '24px sans-serif'
    });
  }
}