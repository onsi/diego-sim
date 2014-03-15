DateRange = function(startDate, endDate) {
  this.startDate = moment(startDate);
  this.endDate = moment(endDate);
}

DateRange.prototype = {
  firstDayIndex: function() {
    return 1;
  },

  lastDayIndex: function() {
    return this.endDate.diff(this.startDate, 'days') + 1;
  },

  dayIndexForDate: function(date) {
    return moment(date).diff(this.startDate, 'days') + 1;
  },

  weeks: function() {
    if (this._weeks) return this._weeks;

    this._weeks = [];
    var date = moment(this.startDate);
    while (date.isBefore(this.endDate) || date.isSame(this.endDate)) {
      this._weeks.push(this.dayIndexForDate(date));
      date = date.add(7, 'days');
    }
    return this._weeks;
  },

  monthsWithLabels: function() {
    if (this._monthsWithLabels) return this._monthsWithLabels;

    this._monthsWithLabels = [];
    var date = moment(this.startDate);
    var lastMonth = date.month();
    while (date.isBefore(this.endDate) || date.isSame(this.endDate)) {
      if (date.month() !== lastMonth) {
        this._monthsWithLabels.push({
          dayIndex: this.dayIndexForDate(date),
          monthLabel: date.format('MMMM')
        });
        lastMonth = date.month();
      }
      date.add(1, 'days');
    }
    return this._monthsWithLabels;
  }
}