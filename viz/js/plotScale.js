PlotScale = function(options) {
  this.xmin = options.xmin;
  this.xmax = options.xmax;
  this.width = options.width;
  this.ymin = options.ymin;
  this.ymax = options.ymax;
  this.height = options.height;

  this.topMargin = options.topMargin || 0;
  this.bottomMargin = options.bottomMargin || 0;
  this.leftMargin = options.leftMargin || 0;
  this.rightMargin = options.rightMargin || 0;
}

PlotScale.prototype.xDataToPlot = function(data) {
  var width = this.width - this.leftMargin - this.rightMargin;
  return _.map(data, function(datum) {
    return (datum - this.xmin) / (this.xmax - this.xmin) * width + this.leftMargin;
  }, this);
}

PlotScale.prototype.yDataToPlot = function(data) {
  var height = this.height - this.topMargin - this.bottomMargin;
  return _.map(data, function(datum) {
    return this.height - ((datum - this.ymin) / (this.ymax - this.ymin) * height + this.bottomMargin);
  }, this);
}

PlotScale.prototype.top = function() {
  return this.topMargin;
}

PlotScale.prototype.bottom = function() {
  return this.height - this.bottomMargin;
}

PlotScale.prototype.left = function() {
  return this.leftMargin;
}

PlotScale.prototype.right = function() {
  return this.width - this.rightMargin;
}