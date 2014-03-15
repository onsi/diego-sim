  (function() {
  var js = [];
  js.push('./externals/jquery.js');
  js.push('./externals/moment.js');
  js.push('./externals/lodash.js');

  js.push('./data/data.json');

  js.push('./js/animator.js');
  js.push('./js/plotScale.js');
  js.push('./js/axes.js');
  js.push('./js/graph.js');
  js.push('./js/linePlot.js');
  js.push('./js/verticalBar.js');
  js.push('./js/label.js');

  js.push('./js/plotRunOnce.js');
  js.push('./js/plotExecutor.js');
  js.push('./js/plotDistribution.js');

  // js.push('./js/plotTracker.js');
  // js.push('./js/showTeam.js');

  js.push('./js/app.js');
  head.js.apply(head, js);
})()

head.ready(function() {

});