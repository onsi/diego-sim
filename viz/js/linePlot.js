LinePlot = function(x, y, color, lineWidth, lineDash) {
  this.x = x;
  this.y = y;
  this.color = color || '#000';
  this.lineWidth = lineWidth || 1;
  this.lineDash = lineDash || [];
}

LinePlot.prototype.draw = function(scale, context) {
  var x = scale.xDataToPlot(this.x);
  var y = scale.yDataToPlot(this.y);
  context.lineWidth = this.lineWidth;
  context.strokeStyle = this.color;
  if (context.setLineDash) {
    context.setLineDash(this.lineDash);
  } else if (context.webkitLineDash) {
    context.webkitLineDash = this.lineDash;
  }

  context.beginPath();
  context.moveTo(x[0], y[0]);
  for (var i = 1; i < x.length ; i++) {
    context.lineTo(x[i], y[i]);
  }
  context.stroke();
  context.closePath();
}