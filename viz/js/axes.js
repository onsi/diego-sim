Axis = function(options) {
  this.location = options.location.toLowerCase() || 'south',
  this.majorTicks = options.majorTicks;
  this.minorTicks = options.minorTicks;
  this.labels = options.labels;
  this.color = options.color || '#000'
  this.minorTickWidth = options.minorTickWidth || 1;
  this.majorTickWidth = options.majorTickWidth || 2;
  this.frameWidth = options.frameWidth || 2;
  this.majorTickHeight = options.majorTickHeight || 10;
  this.minorTickHeight = options.minorTickHeight || 5;

  this.textSpacing = options.textSpacing || 2;
  this.font = options.font || '10px sans-serif'
}

Axis.prototype.draw = function(scale, context) {
  context.strokeStyle = this.color;
  context.fillStyle = this.color;
  context.font = this.font;
  var drawTicks, drawLabels;

  if (this.location == 'south') {
    this.frameLine = [{x: scale.left(), y:scale.bottom()}, {x:scale.right(), y:scale.bottom()}];
    this.tickDirection = -1;
    drawTicks = this.drawXTicks;
    drawLabels = this.drawXLabels;
    context.textAlign = 'center';
    context.textBaseline = 'top';
  } else if (this.location == 'north') {
    this.frameLine = [{x: scale.left(), y:scale.top()}, {x:scale.right(), y:scale.top()}];    
    this.tickDirection = 1;
    drawTicks = this.drawXTicks;
    drawLabels = this.drawXLabels;
    context.textAlign = 'center';
    context.textBaseline = 'bottom';
  } else if (this.location == 'west') {    
    this.frameLine = [{x: scale.left(), y:scale.bottom()}, {x:scale.left(), y:scale.top()}];    
    this.tickDirection = 1;
    drawTicks = this.drawYTicks;
    drawLabels = this.drawYLabels;
    context.textAlign = 'right';
    context.textBaseline = 'middle';
  } else if (this.location == 'east') {    
    this.frameLine = [{x: scale.right(), y:scale.bottom()}, {x:scale.right(), y:scale.top()}];    
    this.tickDirection = -1;
    drawTicks = this.drawYTicks;
    drawLabels = this.drawYLabels;
    context.textAlign = 'left';
    context.textBaseline = 'middle';
  }

  this.drawFrame(scale, context);
  if (this.majorTicks) {
    context.lineWidth = this.majorTickWidth;
    drawTicks.call(this, this.majorTicks, this.majorTickHeight, scale, context);
  }
  if (this.minorTicks) {
    context.lineWidth = this.minorTickWidth;
    drawTicks.call(this, this.minorTicks, this.minorTickHeight, scale, context);
  }
  if (this.labels) {
    drawLabels.call(this, scale, context);
  }
}

Axis.prototype.drawFrame = function(scale, context) {
  context.lineWidth = this.frameWidth;
  context.beginPath();
  context.moveTo(this.frameLine[0].x, this.frameLine[0].y);
  context.lineTo(this.frameLine[1].x, this.frameLine[1].y);
  context.stroke();
  context.closePath();
}

Axis.prototype.drawXTicks = function(ticks, tickHeight, scale, context) {
  var x = scale.xDataToPlot(ticks);
  var yBottom = this.frameLine[0].y;
  var yTop = this.frameLine[0].y + this.tickDirection * tickHeight;

  context.beginPath();
  for (var i = 0; i < x.length; i++) {
    context.moveTo(x[i], yBottom);
    context.lineTo(x[i], yTop);
  }
  context.stroke();
  context.closePath();
}

Axis.prototype.drawYTicks = function(ticks, tickHeight, scale, context) {
  var y = scale.yDataToPlot(ticks);
  var xLeft = this.frameLine[0].x;
  var xRight = this.frameLine[0].x + this.tickDirection * tickHeight;

  context.beginPath();
  for (var i = 0; i < y.length; i++) {
    context.moveTo(xLeft, y[i]);
    context.lineTo(xRight, y[i]);
  }
  context.stroke();
  context.closePath();
}

Axis.prototype.drawXLabels = function(scale, context) {
  var x = scale.xDataToPlot(_.pluck(this.labels, 'x'));
  var y = this.frameLine[0].y - this.tickDirection * this.textSpacing;
  
  for (var i = 0; i < x.length; i++) {
    context.fillText(this.labels[i].label, x[i], y);
  }
}

Axis.prototype.drawYLabels = function(scale, context) {
  var x = this.frameLine[0].x - this.tickDirection * this.textSpacing;
  var y = scale.yDataToPlot(_.pluck(this.labels, 'y'));
  
  for (var i = 0; i < y.length; i++) {
    context.fillText(this.labels[i].label, x, y[i]);
  }
}