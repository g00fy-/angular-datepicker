'use strict';
(function(angular){
/* global moment */
var Module = angular.module('datePicker', []);

Module.constant('datePickerConfig', {
  template: 'templates/datepicker.html',
  view: 'month',
  views: ['year', 'month', 'date', 'hours', 'minutes'],
  momentNames: {
    year: 'year',
    month: 'month',
    date: 'day',
    hours: 'hours',
    minutes: 'minutes',
  },
  viewConfig: {
    year: ['years', 'isSameYear'],
    month: ['months', 'isSameMonth'],
    hours: ['hours', 'isSameHour'],
    minutes: ['minutes', 'isSameMinutes'],
  },
  step: 5
});

//Moment format filter.
Module.filter('mFormat', function () {
  return function (m, format, tz) {
    if (!(moment.isMoment(m))) {
      return 'No date';
    }
    return tz ? moment.tz(m, tz).format(format) : m.format(format);
  };
});

Module.directive('datePicker', ['datePickerConfig', 'datePickerUtils', function datePickerDirective(datePickerConfig, datePickerUtils) {

  //noinspection JSUnusedLocalSymbols
  return {
    // this is a bug ?
    require: '?ngModel',
    template: '<div ng-include="template"></div>',
    scope: {
      model: '=datePicker',
      after: '=?',
      before: '=?'
    },
    link: function (scope, element, attrs, ngModel) {
      function prepareViews() {
        scope.views = datePickerConfig.views.concat();
        scope.view = attrs.view || datePickerConfig.view;

        scope.views = scope.views.slice(
          scope.views.indexOf(attrs.maxView || 'year'),
          scope.views.indexOf(attrs.minView || 'minutes') + 1
        );

        if (scope.views.length === 1 || scope.views.indexOf(scope.view) === -1) {
          scope.view = scope.views[0];
        }
      }

      function getDate(name) {
        return datePickerUtils.getDate(scope, attrs, name);
      }

      datePickerUtils.setParams(attrs.timezone);

      var arrowClick = false,
        tz = scope.tz = attrs.timezone,
        createMoment = datePickerUtils.createMoment,
        step = parseInt(attrs.step || datePickerConfig.step, 10),
        partial = !!attrs.partial,
        minDate = getDate('minDate'),
        maxDate = getDate('maxDate'),
        pickerID = element[0].id,
        now = scope.now = createMoment(),
        selected = scope.date = createMoment(scope.model || now),
        autoclose = attrs.autoClose === 'true';

      if (!scope.model) {
        selected.minute(Math.ceil(selected.minute() / step) * step).second(0);
      }

      scope.template = attrs.template || datePickerConfig.template;

      scope.watchDirectChanges = attrs.watchDirectChanges !== undefined;
      scope.callbackOnSetDate = attrs.dateChange ? datePickerUtils.findFunction(scope, attrs.dateChange) : undefined;

      prepareViews();

      scope.setView = function (nextView) {
        if (scope.views.indexOf(nextView) !== -1) {
          scope.view = nextView;
        }
      };

      scope.selectDate = function (date) {
        if (attrs.disabled) {
          return false;
        }
        if (isSame(scope.date, date)) {
          date = scope.date;
        }
        date = clipDate(date);
        if (!date) {
          return false;
        }
        scope.date = date;

        var nextView = scope.views[scope.views.indexOf(scope.view) + 1];
        if ((!nextView || partial) || scope.model) {
          setDate(date);
        }

        if (nextView) {
          scope.setView(nextView);
        } else if (autoclose) {
          element.addClass('hidden');
          scope.$emit('hidePicker');
        } else {
          prepareViewData();
        }
      };

      function setDate(date) {
        if (date) {
          scope.model = date;
          if (ngModel) {
            ngModel.$setViewValue(date);
          }
        }
        scope.$emit('setDate', scope.model, scope.view);

        //This is duplicated in the new functionality.
        if (scope.callbackOnSetDate) {
          scope.callbackOnSetDate();
        }
      }

      function update() {
        var view = scope.view;
        datePickerUtils.setParams(tz);

        if (scope.model && !arrowClick) {
          scope.date = createMoment(scope.model);
          arrowClick = false;
        }

        var date = scope.date;

        switch (view) {
          case 'year':
            scope.years = datePickerUtils.getVisibleYears(date);
            break;
          case 'month':
            scope.months = datePickerUtils.getVisibleMonths(date);
            break;
          case 'date':
            scope.weekdays = scope.weekdays || datePickerUtils.getDaysOfWeek();
            scope.weeks = datePickerUtils.getVisibleWeeks(date);
            break;
          case 'hours':
            scope.hours = datePickerUtils.getVisibleHours(date);
            break;
          case 'minutes':
            scope.minutes = datePickerUtils.getVisibleMinutes(date, step);
            break;
        }

        prepareViewData();
      }

      function watch() {
        if (scope.view !== 'date') {
          return scope.view;
        }
        return scope.date ? scope.date.month() : null;
      }

      scope.$watch(watch, update);

      if (scope.watchDirectChanges) {
        scope.$watch('model', function () {
          arrowClick = false;
          update();
        });
      }

      function prepareViewData() {
        var view = scope.view,
          date = scope.date,
          classes = [], classList = '',
          i, j;

        datePickerUtils.setParams(tz);

        if (view === 'date') {
          var weeks = scope.weeks, week;
          for (i = 0; i < weeks.length; i++) {
            week = weeks[i];
            classes.push([]);
            for (j = 0; j < week.length; j++) {
              classList = '';
              if (datePickerUtils.isSameDay(date, week[j])) {
                classList += 'active';
              }
              if (isNow(week[j], view)) {
                classList += ' now';
              }
              //if (week[j].month() !== date.month()) classList += ' disabled';
              if (week[j].month() !== date.month() || !inValidRange(week[j])) {
                classList += ' disabled';
              }
              classes[i].push(classList);
            }
          }
        } else {
          var params = datePickerConfig.viewConfig[view],
              dates = scope[params[0]],
              compareFunc = params[1];

          for (i = 0; i < dates.length; i++) {
            classList = '';
            if (datePickerUtils[compareFunc](date, dates[i])) {
              classList += 'active';
            }
            if (isNow(dates[i], view)) {
              classList += ' now';
            }
            if (!inValidRange(dates[i])) {
              classList += ' disabled';
            }
            classes.push(classList);
          }
        }
        scope.classes = classes;
      }

      scope.next = function (delta) {
        var date = moment(scope.date);
        delta = delta || 1;
        switch (scope.view) {
          case 'year':
            /*falls through*/
          case 'month':
            date.year(date.year() + delta);
            break;
          case 'date':
            date.month(date.month() + delta);
            break;
          case 'hours':
            /*falls through*/
          case 'minutes':
            date.hours(date.hours() + delta);
            break;
        }
        date = clipDate(date);
        if (date) {
          scope.date = date;
          setDate(date);
          arrowClick = true;
          update();
        }
      };

      function inValidRange(date) {
        var valid = true;
        if (minDate && minDate.isAfter(date)) {
          valid = isSame(minDate, date);
        }
        if (maxDate && maxDate.isBefore(date)) {
          valid &= isSame(maxDate, date);
        }
        return valid;
      }

      function isSame(date1, date2) {
        return date1.isSame(date2, datePickerConfig.momentNames[scope.view]) ? true : false;
      }

      function clipDate(date) {
        if (minDate && minDate.isAfter(date)) {
          return minDate;
        } else if (maxDate && maxDate.isBefore(date)) {
          return maxDate;
        } else {
          return date;
        }
      }

      function isNow(date, view) {
        var is = true;

        switch (view) {
          case 'minutes':
            is &= ~~(now.minutes() / step) === ~~(date.minutes() / step);
            /* falls through */
          case 'hours':
            is &= now.hours() === date.hours();
            /* falls through */
          case 'date':
            is &= now.date() === date.date();
            /* falls through */
          case 'month':
            is &= now.month() === date.month();
            /* falls through */
          case 'year':
            is &= now.year() === date.year();
        }
        return is;
      }

      scope.prev = function (delta) {
        return scope.next(-delta || -1);
      };

      if (pickerID) {
        scope.$on('pickerUpdate', function (event, pickerIDs, data) {
          if ((angular.isArray(pickerIDs) && pickerIDs.indexOf(pickerID) > -1) || pickerID === pickerIDs) {
            var updateViews = false, updateViewData = false;

            if (angular.isDefined(data.minDate)) {
              minDate = data.minDate ? data.minDate : false;
              updateViewData = true;
            }
            if (angular.isDefined(data.maxDate)) {
              maxDate = data.maxDate ? data.maxDate : false;
              updateViewData = true;
            }

            if (angular.isDefined(data.minView)) {
              attrs.minView = data.minView;
              updateViews = true;
            }
            if (angular.isDefined(data.maxView)) {
              attrs.maxView = data.maxView;
              updateViews = true;
            }
            attrs.view = data.view || attrs.view;

            if (updateViews) {
              prepareViews();
            }

            if (updateViewData) {
              update();
            }
          }
        });
      }
    }
  };
}]);
/* global moment */

angular.module('datePicker').factory('datePickerUtils', function () {
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
    }
  };
});
var Module = angular.module('datePicker');

Module.directive('dateRange', function () {
  return {
    templateUrl: 'templates/daterange.html',
    scope: {
      start: '=',
      end: '='
    },
    link: function (scope, element, attrs) {

      /*
       * If no date is set on scope, set current date from user system
       */
      scope.start = new Date(scope.start || new Date());
      scope.end = new Date(scope.end || new Date());

      attrs.$observe('disabled', function (isDisabled) {
        scope.disableDatePickers = !!isDisabled;
      });
      scope.$watch('start.getTime()', function (value) {
        if (value && scope.end && value > scope.end.getTime()) {
          scope.end = new Date(value);
        }
      });
      scope.$watch('end.getTime()', function (value) {
        if (value && scope.start && value < scope.start.getTime()) {
          scope.start = new Date(value);
        }
      });
    }
  };
});

var PRISTINE_CLASS = 'ng-pristine',
    DIRTY_CLASS = 'ng-dirty';

var Module = angular.module('datePicker');

Module.constant('dateTimeConfig', {
  template: function (attrs) {
    return '' +
        '<div ' +
        'date-picker="' + attrs.ngModel + '" ' +
        (attrs.view ? 'view="' + attrs.view + '" ' : '') +
        (attrs.maxView ? 'max-view="' + attrs.maxView + '" ' : '') +
        (attrs.maxDate ? 'max-date="' + attrs.maxDate + '" ' : '') +
        (attrs.autoClose ? 'auto-close="' + attrs.autoClose + '" ' : '') +
        (attrs.template ? 'template="' + attrs.template + '" ' : '') +
        (attrs.minView ? 'min-view="' + attrs.minView + '" ' : '') +
        (attrs.minDate ? 'min-date="' + attrs.minDate + '" ' : '') +
        (attrs.partial ? 'partial="' + attrs.partial + '" ' : '') +
        (attrs.step ? 'step="' + attrs.step + '" ' : '') +
        (attrs.onSetDate ? 'on-set-date="' + attrs.onSetDate + '" ' : '') +
        (attrs.ngModel ? 'ng-model="' + attrs.ngModel + '" ' : '') +
        (attrs.timezone ? 'timezone="' + attrs.timezone + '" ' : '') +
        'class="date-picker-date-time"></div>';
  },
  format: 'YYYY-MM-DD HH:mm',
  views: ['date', 'year', 'month', 'hours', 'minutes'],
  autoClose: false,
  position: 'relative'
});

Module.directive('dateTimeAppend', function () {
  return {
    link: function (scope, element) {
      element.bind('click', function () {
        element.find('input')[0].focus();
      });
    }
  };
});

Module.directive('dateTime', ['$compile', '$document', '$filter', 'dateTimeConfig', '$parse', 'datePickerUtils', function ($compile, $document, $filter, dateTimeConfig, $parse, datePickerUtils) {
  var body = $document.find('body');
  var dateFilter = $filter('mFormat');

  return {
    require: 'ngModel',
    scope: true,
    link: function (scope, element, attrs, ngModel) {
      var format = attrs.format || dateTimeConfig.format,
        parentForm = element.inheritedData('$formController'),
          views = $parse(attrs.views)(scope) || dateTimeConfig.views.concat(),
          view = attrs.view || views[0],
          index = views.indexOf(view),
          dismiss = attrs.autoClose ? $parse(attrs.autoClose)(scope) : dateTimeConfig.autoClose,
          picker = null,
          pickerID = element[0].id,
          position = attrs.position || dateTimeConfig.position,
          container = null,
          minDate = null,
          maxDate = null,
          timezone = attrs.timezone || false,
          dateChange = null,
          shownOnce = false,
          template;

      if (index === -1) {
        views.splice(index, 1);
      }

      views.unshift(view);

      function formatter(value) {
        return dateFilter(value, format, timezone);
      }

      function parser(viewValue) {
        if (viewValue.length === format.length) {
          return viewValue;
        }
        return undefined;
      }

      ngModel.$formatters.push(formatter);
      ngModel.$parsers.unshift(parser);

      if (angular.isDefined(attrs.minDate)) {
        minDate = datePickerUtils.findParam(scope, attrs.minDate);
        attrs.minDate = minDate ? minDate.format() : minDate;
      }

      if (angular.isDefined(attrs.maxDate)) {
        maxDate = datePickerUtils.findParam(scope, attrs.maxDate);
        attrs.maxDate = maxDate ? maxDate.format() : maxDate;
      }

      if (angular.isDefined(attrs.dateChange)) {
        dateChange = datePickerUtils.findFunction(scope, attrs.dateChange);
      }

      function getTemplate() {
        template = dateTimeConfig.template(attrs);
      }

      function updateInput(event) {
        event.stopPropagation();
        if (ngModel.$pristine) {
          ngModel.$dirty = true;
          ngModel.$pristine = false;
          element.removeClass(PRISTINE_CLASS).addClass(DIRTY_CLASS);
          if (parentForm) {
            parentForm.$setDirty();
          }
          ngModel.$render();
        }
      }

      function clear() {
        if (picker) {
          picker.remove();
          picker = null;
        }
        if (container) {
          container.remove();
          container = null;
        }
      }

      if (pickerID) {
        scope.$on('pickerUpdate', function (event, pickerIDs, data) {
          if ((angular.isArray(pickerIDs) && pickerIDs.indexOf(pickerID) > -1) || pickerID === pickerIDs) {
            if (picker) {
              //Need to handle situation where the data changed but the picker is currently open.
              //However, this directive is not guaranteed to be present, as the date-picker directive can be used by itself.
              //Therefore, we need to somehow catch this situation and update the inner picker. Perhaps we can use the same event
              //for inner updates. If this directive exists, it will be caught here first, and then we can eat the event. Otherwise, 
              //the inner directive can catch the pickerUpdate event and update appropriately. We just need to pass the name
              //of the model to the inner picker (or get it there somehow else if this directive doesn't exist) to determine
              //which picker is being updated.
            } else {
              if (angular.isDefined(data.minDate)) {
                attrs.minDate = data.minDate ? data.minDate.format() : false;
              }
              if (angular.isDefined(data.maxDate)) {
                attrs.maxDate = data.maxDate ? data.maxDate.format() : false;
              }

              if (angular.isDefined(data.minView)) {
                attrs.minView = data.minView;
              }
              if (angular.isDefined(data.maxView)) {
                attrs.maxView = data.maxView;
              }
              attrs.view = data.view || attrs.view;

              if (angular.isDefined(data.format)) {
                format = attrs.format = data.format || dateTimeConfig.format;
                ngModel.$modelValue = -1; //Triggers formatters. This value will be discarded.
              }
              getTemplate();
            }
          }
        });
      }

      function showPicker() {
        if (picker) {
          return;
        }
        // create picker element
        picker = $compile(template)(scope);
        scope.$digest();

        //If the picker has already been shown before then we shouldn't be binding to events, as these events are already bound to in this scope.
        if (!shownOnce) {
          scope.$on('setDate', function (event, date, view) {
            updateInput(event);
            if (dateChange) {
              dateChange(attrs.ngModel, date);
            }
            if (dismiss && views[views.length - 1] === view) {
              clear();
            }
          });

          scope.$on('hidePicker', function () {
            element.triggerHandler('blur');
          });

          scope.$on('$destroy', clear);

          shownOnce = true;
        }


        // move picker below input element

        if (position === 'absolute') {
          var pos = angular.extend(element.offset(), { height: element[0].offsetHeight });
          picker.css({ top: pos.top + pos.height, left: pos.left, display: 'block', position: position });
          body.append(picker);
        } else {
          // relative
          container = angular.element('<div date-picker-wrapper></div>');
          element[0].parentElement.insertBefore(container[0], element[0]);
          container.append(picker);
          //          this approach doesn't work
          //          element.before(picker);
          picker.css({ top: element[0].offsetHeight + 'px', display: 'block' });
        }
        picker.bind('mousedown', function (evt) {
          evt.preventDefault();
        });
      }

      element.bind('focus', showPicker);
      element.bind('blur', clear);
      getTemplate();
    }
  };
}]);

angular.module('datePicker').run(['$templateCache', function($templateCache) {
$templateCache.put('templates/datepicker.html',
    "<div ng-switch=\"view\">\r" +
    "\n" +
    "  <div ng-switch-when=\"date\">\r" +
    "\n" +
    "    <table>\r" +
    "\n" +
    "      <thead>\r" +
    "\n" +
    "      <tr>\r" +
    "\n" +
    "        <th ng-click=\"prev()\">&lsaquo;</th>\r" +
    "\n" +
    "        <th colspan=\"5\" class=\"switch\" ng-click=\"setView('month')\" ng-bind=\"date|mFormat:'YYYY MMMM':tz\"></th>\r" +
    "\n" +
    "        <th ng-click=\"next()\">&rsaquo;</i></th>\r" +
    "\n" +
    "      </tr>\r" +
    "\n" +
    "      <tr>\r" +
    "\n" +
    "        <th ng-repeat=\"day in weekdays\" style=\"overflow: hidden\" ng-bind=\"day|mFormat:'ddd':tz\"></th>\r" +
    "\n" +
    "      </tr>\r" +
    "\n" +
    "      </thead>\r" +
    "\n" +
    "      <tbody>\r" +
    "\n" +
    "      <tr ng-repeat=\"week in weeks\" ng-init=\"$index2 = $index\">\r" +
    "\n" +
    "        <td ng-repeat=\"day in week\">\r" +
    "\n" +
    "          <span\r" +
    "\n" +
    "            ng-class=\"classes[$index2][$index]\"\r" +
    "\n" +
    "            ng-click=\"selectDate(day)\" ng-bind=\"day|mFormat:'DD':tz\"></span>\r" +
    "\n" +
    "        </td>\r" +
    "\n" +
    "      </tr>\r" +
    "\n" +
    "      </tbody>\r" +
    "\n" +
    "    </table>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "  <div ng-switch-when=\"year\">\r" +
    "\n" +
    "    <table>\r" +
    "\n" +
    "      <thead>\r" +
    "\n" +
    "      <tr>\r" +
    "\n" +
    "        <th ng-click=\"prev(10)\">&lsaquo;</th>\r" +
    "\n" +
    "        <th colspan=\"5\" class=\"switch\"ng-bind=\"years[0].year()+' - '+years[years.length-1].year()\"></th>\r" +
    "\n" +
    "        <th ng-click=\"next(10)\">&rsaquo;</i></th>\r" +
    "\n" +
    "      </tr>\r" +
    "\n" +
    "      </thead>\r" +
    "\n" +
    "      <tbody>\r" +
    "\n" +
    "      <tr>\r" +
    "\n" +
    "        <td colspan=\"7\">\r" +
    "\n" +
    "          <span ng-class=\"classes[$index]\"\r" +
    "\n" +
    "                ng-repeat=\"year in years\"\r" +
    "\n" +
    "                ng-click=\"selectDate(year)\" ng-bind=\"year.year()\"></span>\r" +
    "\n" +
    "        </td>\r" +
    "\n" +
    "      </tr>\r" +
    "\n" +
    "      </tbody>\r" +
    "\n" +
    "    </table>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "  <div ng-switch-when=\"month\">\r" +
    "\n" +
    "    <table>\r" +
    "\n" +
    "      <thead>\r" +
    "\n" +
    "      <tr>\r" +
    "\n" +
    "        <th ng-click=\"prev()\">&lsaquo;</th>\r" +
    "\n" +
    "        <th colspan=\"5\" class=\"switch\" ng-click=\"setView('year')\" ng-bind=\"date|mFormat:'YYYY':tz\"></th>\r" +
    "\n" +
    "        <th ng-click=\"next()\">&rsaquo;</i></th>\r" +
    "\n" +
    "      </tr>\r" +
    "\n" +
    "      </thead>\r" +
    "\n" +
    "      <tbody>\r" +
    "\n" +
    "      <tr>\r" +
    "\n" +
    "        <td colspan=\"7\">\r" +
    "\n" +
    "          <span ng-repeat=\"month in months\"\r" +
    "\n" +
    "                ng-class=\"classes[$index]\"\r" +
    "\n" +
    "                ng-click=\"selectDate(month)\"\r" +
    "\n" +
    "                ng-bind=\"month|mFormat:'MMM':tz\"></span>\r" +
    "\n" +
    "        </td>\r" +
    "\n" +
    "      </tr>\r" +
    "\n" +
    "      </tbody>\r" +
    "\n" +
    "    </table>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "  <div ng-switch-when=\"hours\">\r" +
    "\n" +
    "    <table>\r" +
    "\n" +
    "      <thead>\r" +
    "\n" +
    "      <tr>\r" +
    "\n" +
    "        <th ng-click=\"prev(24)\">&lsaquo;</th>\r" +
    "\n" +
    "        <th colspan=\"5\" class=\"switch\" ng-click=\"setView('date')\" ng-bind=\"date|mFormat:'DD MMMM YYYY':tz\"></th>\r" +
    "\n" +
    "        <th ng-click=\"next(24)\">&rsaquo;</i></th>\r" +
    "\n" +
    "      </tr>\r" +
    "\n" +
    "      </thead>\r" +
    "\n" +
    "      <tbody>\r" +
    "\n" +
    "      <tr>\r" +
    "\n" +
    "        <td colspan=\"7\">\r" +
    "\n" +
    "          <span ng-repeat=\"hour in hours\"\r" +
    "\n" +
    "                ng-class=\"classes[$index]\"\r" +
    "\n" +
    "                ng-click=\"selectDate(hour)\" ng-bind=\"hour|mFormat:'HH:mm':tz\"></span>\r" +
    "\n" +
    "        </td>\r" +
    "\n" +
    "      </tr>\r" +
    "\n" +
    "      </tbody>\r" +
    "\n" +
    "    </table>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "  <div ng-switch-when=\"minutes\">\r" +
    "\n" +
    "    <table>\r" +
    "\n" +
    "      <thead>\r" +
    "\n" +
    "      <tr>\r" +
    "\n" +
    "        <th ng-click=\"prev()\">&lsaquo;</th>\r" +
    "\n" +
    "        <th colspan=\"5\" class=\"switch\" ng-click=\"setView('hours')\" ng-bind=\"date|mFormat:'DD MMMM YYYY':tz\"></th>\r" +
    "\n" +
    "        <th ng-click=\"next()\">&rsaquo;</i></th>\r" +
    "\n" +
    "      </tr>\r" +
    "\n" +
    "      </thead>\r" +
    "\n" +
    "      <tbody>\r" +
    "\n" +
    "      <tr>\r" +
    "\n" +
    "        <td colspan=\"7\">\r" +
    "\n" +
    "          <span ng-repeat=\"minute in minutes\"\r" +
    "\n" +
    "                ng-class=\"classes[$index]\"\r" +
    "\n" +
    "                ng-click=\"selectDate(minute)\"\r" +
    "\n" +
    "                ng-bind=\"minute|mFormat:'HH:mm':tz\"></span>\r" +
    "\n" +
    "        </td>\r" +
    "\n" +
    "      </tr>\r" +
    "\n" +
    "      </tbody>\r" +
    "\n" +
    "    </table>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>"
  );


  $templateCache.put('templates/daterange.html',
    "<div>\r" +
    "\n" +
    "    <table>\r" +
    "\n" +
    "        <tr>\r" +
    "\n" +
    "            <td valign=\"top\">\r" +
    "\n" +
    "                <div date-picker=\"start\" ng-disabled=\"disableDatePickers\"  class=\"date-picker\" date after=\"start\" before=\"end\" min-view=\"date\" max-view=\"date\"></div>\r" +
    "\n" +
    "            </td>\r" +
    "\n" +
    "            <td valign=\"top\">\r" +
    "\n" +
    "                <div date-picker=\"end\" ng-disabled=\"disableDatePickers\"  class=\"date-picker\" date after=\"start\" before=\"end\"  min-view=\"date\" max-view=\"date\"></div>\r" +
    "\n" +
    "            </td>\r" +
    "\n" +
    "        </tr>\r" +
    "\n" +
    "    </table>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );

}]);
})(angular);