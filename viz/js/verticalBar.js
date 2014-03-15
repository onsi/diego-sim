VerticalBar = function(xmin, xmax, color, alpha) {
  this.xmin = xmin;
  this.xmax = xmax;
  this.color = color;
  this.alpha = alpha;
}

VerticalBar.prototype.draw = function(scale, context) {
   var x = scale.xDataToPlot([this.xmin, this.xmax]);
   var y = [scale.top(), scale.bottom()];
   context.fillStyle = this.color;
   context.globalAlpha = this.alpha;
   context.fillRect(x[0], y[0], x[1] - x[0], y[1] - y[0]);
}