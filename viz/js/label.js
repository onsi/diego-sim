Label = function(options) {
  this.text = options.text;
  this.datax = options.datax;
  this.datay = options.datay;
  this.plotx = options.plotx;
  this.ploty = options.ploty;
  this.textAlign = options.textAlign || 'center';
  this.textBaseline = options.textBaseline || 'bottom';
  this.font = options.font || '10px sans-serif';
  this.color = options.color || '#000';
}

Label.prototype.draw = function(scale, context) {
  var x = this.plotx;
  var y = this.ploty;

  if (this.datax !== undefined) {
    x = scale.xDataToPlot([this.datax])[0];
  }
  if (this.datay !== undefined) {
    y = scale.yDataToPlot([this.datay])[0];
  }
  context.fillStyle = this.color;
  context.font = this.font;
  context.textAlign = this.textAlign;
  context.textBaseline = this.textBaseline;

  context.fillText(this.text, x, y);
}