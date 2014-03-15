TrackerPlot = function(graph) {
  this.graph = graph;
  this.days = trackerExplorer.get('day');
  this.gitDays = gitExplorer.get('day');
  this.teamSize = gitExplorer.getForDays('team_size', this.days);
  this.iterationDays = this.computeIterationDays();
  this.yMax = 55;
}

TrackerPlot.prototype = {
  draw: function(options) {
    this.dayIndex = _.sortedIndex(this.days, this.gitDays[options.dayIndex]);
    this.dataExplorer = new Explorer(trackerExplorer.get(options.plotKey));
    this.smoothingWindow = options.smoothingWindow;

    this.graph.clear();
    if (options.showTeamSize) {
      plotTeamSize(this.graph);
    }

    this.drawData(options);
    this.setScale();
    this.drawAxes();
    this.graph.draw();
  },

  drawData: function(options) {
    this.bugs = this.computeSmoothedData('bug');
    this.features = this.computeSmoothedData('feature');
    this.chores = this.computeSmoothedData('chore');
    this.points = this.computeSmoothedData('points');
    this.pointsPerPair = this.computePointsPerPair();

    if (options.showBugs) {
      this.graph.add(new LinePlot(this.truncate(this.days), this.truncate(this.bugs), '#F00', 2, [2]));
    } 

    if (options.showFeatures) {
      this.graph.add(new LinePlot(this.truncate(this.days), this.truncate(this.features), '#00F', 2, [2]));
    }

    if (options.showChores) {
      this.graph.add(new LinePlot(this.truncate(this.days), this.truncate(this.chores), '#000', 2, [2]));
    }

    if (options.showPoints) {
      this.graph.add(new LinePlot(this.truncate(this.days), this.truncate(this.points), '#005', 2));
    }

    if (options.showPointsPerPair) {
      this.graph.add(new LinePlot(this.truncate(this.days), this.truncate(this.pointsPerPair), '#005', 4));
    }
  },

  truncate: function(data) {
    if (this.dayIndex) {
      return _.head(data, this.dayIndex);      
    } else {
      return data;
    }
  },

  normalizePoints: function(points) {
    return _.map(points, function(points, i) {
      return points * 5 / this.iterationDays[i];
    }, this);
  },

  computeSmoothedData: function(field) {
    var data = this.dataExplorer.get(field);
    if (field == 'points') {
      data = this.normalizePoints(data);
    }
    return movingAverage(data, this.smoothingWindow);
  },

  computePointsPerPair: function() {
    return _.map(this.points, function(points, i) {
      return points / this.teamSize[i] * 2;
    }, this);
  },

  setScale: function() {
    this.graph.setScale(new PlotScale({
      xmin: dateRange.firstDayIndex(),
      xmax: dateRange.lastDayIndex(),
      ymin: 0,
      ymax: this.yMax,
      width: this.graph.width(),
      height: this.graph.height(),
      leftMargin: 100,
      bottomMargin: 40,
      topMargin:0,
      rightMargin:100
    }));
  },
  
  drawAxes: function() {
    setUpCommonAxes(this.graph, 'south');
    this.graph.add(this.buildYAxis('west'));
    this.graph.add(this.buildYAxis('east'));
  },

  buildYAxis: function(location) {
    return new Axis({
      location: location,
      majorTicks: _.range(0, this.yMax, 10),
      minorTicks: _.range(0, this.yMax, 5),
      labels: _(_.range(0, this.yMax, 10)).map(function(y) {
        return {y: y, label: y}
      }).value(),
      font: '24px sans-serif'
    });
  },

  computeIterationDays: function() {
    var workDays = gitExplorer.get('day');
    var iterationBoundaries = this.days.concat(_.last(this.days) + 7);
    var iterationDays = [];
    var i = 0, j = 0;
    while (i < this.days.length) {
      var iterationStart = iterationBoundaries[i];
      var iterationEnd = iterationBoundaries[i + 1];
      var iterationStartJ = j;
      while (j < workDays.length && iterationStart <= workDays[j] && workDays[j] < iterationEnd) {
        j++;
      }
      iterationDays.push(j - iterationStartJ);
      i++;
    }

    return iterationDays;
  }
}