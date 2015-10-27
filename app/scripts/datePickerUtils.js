/* global moment */

angular.module('datePicker').factory('datePickerUtils', function () {
  'use strict';
  var tz;
  var createNewDate = function (year, month, day, hour, minute) {
    var utc = Date.UTC(year | 0, month | 0, day | 0, hour | 0, minute | 0);
    return tz ? moment.tz(utc, tz) : moment(utc);
  };

  return {
    getVisibleMinutes: function (m, step) {
      var year = m.year(),
        month = m.month(),
        day = m.date(),
        hour = m.hours(), pushedDate,
        offset = m.utcOffset() / 60,
        minutes = [], minute;

      for (minute = 0 ; minute < 60 ; minute += step) {
        pushedDate = createNewDate(year, month, day, hour - offset, minute);
        minutes.push(pushedDate);
      }
      return minutes;
    },
    getVisibleWeeks: function (m) {
      m = moment(m);
      var startYear = m.year(),
          startMonth = m.month();

      // set date to start of the week
      m.date(1);

      var day = m.day();

      if (day === 0) {
        // day is sunday, let's get back to the previous week
        m.date(-5);
      } else {
        // day is not sunday, let's get back to the start of the week
        m.date(m.date() - day);
      }
      if (m.date() === 1) {
        // day is monday, let's get back to the previous week
        m.date(-6);
      }

      var weeks = [];

      while (weeks.length < 6) {
        if (m.year() === startYear && m.month() > startMonth) {
          break;
        }
        weeks.push(this.getDaysOfWeek(m));
        m.add(7, 'd');
      }
      return weeks;
    },
    getVisibleYears: function (d) {
      var m = moment(d),
        year = m.year();

      m.year(year - (year % 10));
      year = m.year();

      var offset = m.utcOffset() / 60,
        years = [],
        pushedDate,
        actualOffset;

      for (var i = 0; i < 12; i++) {
        pushedDate = createNewDate(year, 0, 1, 0 - offset);
        actualOffset = pushedDate.utcOffset() / 60;
        if (actualOffset !== offset) {
          pushedDate = createNewDate(year, 0, 1, 0 - actualOffset);
          offset = actualOffset;
        }
        years.push(pushedDate);
        year++;
      }
      return years;
    },
    getDaysOfWeek: function (m) {
      m = m ? m : (tz ? moment.tz(tz).day(0) : moment().day(0));

      var year = m.year(),
        month = m.month(),
        day = m.date(),
        days = [],
        pushedDate,
        offset = m.utcOffset() / 60,
        actualOffset;

      for (var i = 0; i < 7; i++) {
        pushedDate = createNewDate(year, month, day, 0 - offset, 0, false);
        actualOffset = pushedDate.utcOffset() / 60;
        if (actualOffset !== offset) {
          pushedDate = createNewDate(year, month, day, 0 - actualOffset, 0, false);
        }
        days.push(pushedDate);
        day++;
      }
      return days;
    },
    getVisibleMonths: function (m) {
      var year = m.year(),
        offset = m.utcOffset() / 60,
        months = [],
        pushedDate,
        actualOffset;

      for (var month = 0; month < 12; month++) {
        pushedDate = createNewDate(year, month, 1, 0 - offset, 0, false);
        actualOffset = pushedDate.utcOffset() / 60;
        if (actualOffset !== offset) {
          pushedDate = createNewDate(year, month, 1, 0 - actualOffset, 0, false);
        }
        months.push(pushedDate);
      }
      return months;
    },
    getVisibleHours: function (m) {
      var year = m.year(),
        month = m.month(),
        day = m.date(),
        hours = [],
        hour, pushedDate, actualOffset,
        offset = m.utcOffset() / 60;

      for (hour = 0 ; hour < 24 ; hour++) {
        pushedDate = createNewDate(year, month, day, hour - offset, 0, false);
        actualOffset = pushedDate.utcOffset() / 60;
        if (actualOffset !== offset) {
          pushedDate = createNewDate(year, month, day, hour - actualOffset, 0, false);
        }
        hours.push(pushedDate);
      }

      return hours;
    },
    isAfter: function (model, date) {
      return model && model.unix() >= date.unix();
    },
    isBefore: function (model, date) {
      return model.unix() <= date.unix();
    },
    isSameYear: function (model, date) {
      return model && model.year() === date.year();
    },
    isSameMonth: function (model, date) {
      return this.isSameYear(model, date) && model.month() === date.month();
    },
    isSameDay: function (model, date) {
      return this.isSameMonth(model, date) && model.date() === date.date();
    },
    isSameHour: function (model, date) {
      return this.isSameDay(model, date) && model.hours() === date.hours();
    },
    isSameMinutes: function (model, date) {
      return this.isSameHour(model, date) && model.minutes() === date.minutes();
    },
    setParams: function (zone) {
      tz = zone;
    },
    findFunction: function (scope, name) {
      //Can probably combine these into a single search function and two comparison functions
      //Search scope ancestors for a matching function.
      var parentScope = scope;
      do {
        parentScope = parentScope.$parent;
        if (angular.isFunction(parentScope[name])) {
          return parentScope[name];
        }
      } while (parentScope.$parent);

      return false;
    },
    findParam: function (scope, name) {
      //Search scope ancestors for a matching parameter.
      var parentScope = scope;
      do {
        parentScope = parentScope.$parent;
        if (parentScope[name]) {
          return parentScope[name];
        }
      } while (parentScope.$parent);

      return false;
    }
  };
});