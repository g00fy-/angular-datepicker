/* global moment */

angular.module('datePicker').factory('datePickerUtils', function () {
  'use strict';
  var tz, firstDay;
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

      //Set date to the first day of the month
      m.date(1);

      //Grab day of the week
      var day = m.day();

      //Go back the required number of days to arrive at the previous week start
      m.date(firstDay - (day + (firstDay >= day ? 6 : -1)));

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
      m = m ? m : (tz ? moment.tz(tz).day(firstDay) : moment().day(firstDay));

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
    setParams: function (zone, fd) {
      tz = zone;
      firstDay = fd;
    },
    scopeSearch: function (scope, name, comparisonFn) {
      var parentScope = scope,
          nameArray = name.split('.'),
          target, i, j = nameArray.length;

      do {
        target = parentScope = parentScope.$parent;

        //Loop through provided names.
        for (i = 0; i < j; i++) {
          target = target[nameArray[i]];
          if (!target) {
            continue;
          }
        }

        //If we reached the end of the list for this scope,
        //and something was found, trigger the comparison
        //function. If the comparison function is happy, return
        //found result. Otherwise, continue to the next parent scope
        if (target && comparisonFn(target)) {
          return target;
        }

      } while (parentScope.$parent);

      return false;
    },
    findFunction: function (scope, name) {
      //Search scope ancestors for a matching function.
      return this.scopeSearch(scope, name, function(target) {
        //Property must also be a function
        return angular.isFunction(target);
      });
    },
    findParam: function (scope, name) {
      //Search scope ancestors for a matching parameter.
      return this.scopeSearch(scope, name, function() {
        //As long as the property exists, we're good
        return true;
      });
    },
    createMoment: function (m) {
      if (tz) {
        return moment.tz(m, tz);
      } else {
        //If input is a moment, and we have no TZ info, we need to remove TZ 
        //info from the moment, otherwise the newly created moment will take 
        //the timezone of the input moment. The easiest way to do that is to
        //take the unix timestamp, and use that to create a new moment.
        //The new moment will use the local timezone of the user machine.
        return moment.isMoment(m) ? moment.unix(m.unix()) : moment(m);
      }
    },
    getDate: function (scope, attrs, name) {
      var result = false;
      if (attrs[name]) {
        result = this.createMoment(attrs[name]);
        if (!result.isValid()) {
          result = this.findParam(scope, attrs[name]);
          if (result) {
            result = this.createMoment(result);
          }
        }
      }

      return result;
    },
    eventIsForPicker: function (targetIDs, pickerID) {
      //Checks if an event targeted at a specific picker, via either a string name, or an array of strings.
      return (angular.isArray(targetIDs) && targetIDs.indexOf(pickerID) > -1 || targetIDs === pickerID);
    }
  };
});