Animator = function(callback) {
  this.callback = callback;
  this.deltaT = 0.03;
}

Animator.prototype = {
  start: function (startValue, endValue, time, doneCallback) {
    var that = this;
    this.value = startValue;
    this.startValue = startValue;
    this.endValue = endValue;
    this.time = time;
    this.deltaV = (this.endValue - this.startValue) / this.time * this.deltaT;
    this.doneCallback = doneCallback;

    this.callback(this.value);
    this.timer = setInterval(function() {
      that.value += that.deltaV;
      if (Math.abs(that.value - that.endValue) < that.deltaV) {
        that.fastForwardAndStop();
        that.doneCallback();
      } else {
        that.callback(that.value);        
      }
    }, 0.03);
  },

  fastForwardAndStop: function () {
    clearInterval(this.timer);
    this.callback(this.endValue);
  },

  stop: function () {
    clearInterval(this.timer);
  }
}
