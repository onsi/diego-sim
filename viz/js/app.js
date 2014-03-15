setUpCommonAxes = function(graph, location) {
  var majorXTicks = _.range(0,window.duration,10)
  var minorXTicks = _.range(0,window.duration,5)
  var xLabels = _.map(majorXTicks, function(time) {
    return {
      x: time,
      label: time
    }
  });

  graph.add(new Axis({
    location: 'south',
    majorTicks: majorXTicks, 
    minorTicks: minorXTicks, 
    labels: location == 'south' ? xLabels : undefined,
    font: '24px sans-serif'
  }));

  graph.add(new Axis({
    location: 'north',
    majorTicks: majorXTicks, 
    minorTicks: minorXTicks, 
    labels: location == 'north' ? xLabels : undefined,
    font: '24px sans-serif'
  }));
}

computeErrorLogs = function() {
  window.errorLogs = {}
  _.each(diego.errors, function(error) {
      time = Math.round(error.time - window.startTime)
      if (time < 0 || time >= Math.floor(window.duration)) {
        return
      }
      if (!window.errorLogs[time]) {
        window.errorLogs[time] = []
      }
      window.errorLogs[time].push(error.line)
    })
}

updateErrors = function(time) {
  errors = window.errorLogs[time]
  $('#logs').empty()
  ul = $('<ul>')
  _.each(errors, function(error) {
    li = $('<li>').text(error)
    $('#logs').append(li)
  })
  $('#logs').append(ul)
}

head.ready(function() {
  var runOncePlot = new RunOncePlot(new Graph($('#run-onces')));
  runOncePlot.compute()
  window.startTime = runOncePlot.startTime
  window.endTime = runOncePlot.endTime
  window.duration = runOncePlot.duration

  computeErrorLogs()

  var executorsPlot = new ExecutorPlot(new Graph($('#executors')));
  executorsPlot.compute()

  var distributionPlot = new DistributionPlot(new Graph($('#distribution')));
  distributionPlot.compute()


  var update = function() {
    runOncePlot.draw($('#time').val())
    executorsPlot.draw($('#time').val())
    distributionPlot.draw($('#time').val())
    updateErrors($('#time').val())
    $('#info').text(diego.info.etcd_nodes + " ETCD, " + diego.info.executors + " Execs, " + diego.info.run_onces + " Apps in " + diego.info.over + "s | " + $('#time').val() + "/" + Math.floor(diego.result.elapsed_time) + " seconds")
  }

  $('input').change(update);
  $('#time').val(0)
  $('#time').attr('min', 0)
  $('#time').attr('max', window.duration)

  var anim = new Animator(function(value) {
    $('#time').val(value);
    update();
  });

  $('#time-button').click(function() {
    if ($('#time-button').hasClass('play')) {
      currentTime = parseFloat($('#time').val())
      anim.start(currentTime, window.duration, (window.duration - currentTime)/2, function() {
          $('#time-button').removeClass('stop').addClass('play');
      });
      $('#time-button').removeClass('play').addClass('stop');
    } else {      
      anim.stop();
      $('#time-button').removeClass('stop').addClass('play');
    }
  });
  
  update();
});