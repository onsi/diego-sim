Graph = function(canvas) {
  this.canvas = $(canvas);
  this.context = this.canvas[0].getContext('2d');
  this.plots = [];
}

Graph.prototype.width = function() {
  return this.canvas.width();
}

Graph.prototype.height = function() {
  return this.canvas.height();
}

Graph.prototype.setScale = function(scale) {
  this.scale = scale;
}

Graph.prototype.clear = function() {
  this.plots = [];
  this.context.clearRect(0, 0, this.width(), this.height());
}

Graph.prototype.add = function(plot) {
  this.plots.push(plot);
  return plot;
}

Graph.prototype.draw = function() {
  _.each(this.plots, function(plot) {
    this.context.save();
    plot.draw(this.scale, this.context);
    this.context.restore();
  }, this);
}