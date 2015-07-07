'use strict';
(function(angular){
'use strict';

var Module = angular.module('datePicker', []);

Module.constant('datePickerConfig', {
  template: 'templates/datepicker.html',
  view: 'month',
  views: ['year', 'month', 'date', 'hours', 'minutes'],
  step: 5
});

Module.filter('time',function () {
  function format(date){
    return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
  }

  return function (date) {
    if (!(date instanceof Date)) {
      date = new Date(date);
      if (isNaN(date.getTime())) {
        return undefined;
      }
    }
    return format(date);
  };
});

Module.directive('datePicker', ['datePickerConfig', 'datePickerUtils', function datePickerDirective(datePickerConfig, datePickerUtils) {

  //noinspection JSUnusedLocalSymbols
  return {
    // this is a bug ?
    require:'?ngModel',
    template: '<div ng-include="template"></div>',
    scope: {
      model: '=datePicker',
      after: '=?',
      before: '=?'
    },
    link: function (scope, element, attrs, ngModel) {

      var arrowClick = false;

      scope.date = new Date(scope.model || new Date());
      scope.views = datePickerConfig.views.concat();
      scope.view = attrs.view || datePickerConfig.view;
      scope.now = new Date();
      scope.template = attrs.template || datePickerConfig.template;

      var step = parseInt(attrs.step || datePickerConfig.step, 10);
      var partial = !!attrs.partial;

      //if ngModel, we can add min and max validators
      if(ngModel)
      {
        if (angular.isDefined(attrs.minDate)) {
          var minVal;
          ngModel.$validators.min = function (value) {
            return !datePickerUtils.isValidDate(value) || angular.isUndefined(minVal) || value >= minVal;
          };
          attrs.$observe('minDate', function (val) {
            minVal = new Date(val);
            ngModel.$validate();
          });
        }

        if (angular.isDefined(attrs.maxDate)) {
          var maxVal;
          ngModel.$validators.max = function (value) {
            return !datePickerUtils.isValidDate(value) || angular.isUndefined(maxVal) || value <= maxVal;
          };
          attrs.$observe('maxDate', function (val) {
            maxVal = new Date(val);
            ngModel.$validate();
          });
        }
      }
      //end min, max date validator

      /** @namespace attrs.minView, attrs.maxView */
      scope.views =scope.views.slice(
        scope.views.indexOf(attrs.maxView || 'year'),
        scope.views.indexOf(attrs.minView || 'minutes')+1
      );

      if (scope.views.length === 1 || scope.views.indexOf(scope.view)===-1) {
        scope.view = scope.views[0];
      }

      scope.setView = function (nextView) {
        if (scope.views.indexOf(nextView) !== -1) {
          scope.view = nextView;
        }
      };

      scope.setDate = function (date) {
        if(attrs.disabled) {
          return;
        }
        scope.date = date;
        // change next view
        var nextView = scope.views[scope.views.indexOf(scope.view) + 1];
        if ((!nextView || partial) || scope.model) {

          scope.model = new Date(scope.model || date);
          //if ngModel , setViewValue and trigger ng-change, etc...
          if(ngModel) {
            ngModel.$setViewValue(scope.date);
          }

          var view = partial ? 'minutes' : scope.view;
          //noinspection FallThroughInSwitchStatementJS
          switch (view) {
          case 'minutes':
            scope.model.setMinutes(date.getMinutes());
          /*falls through*/
          case 'hours':
            scope.model.setHours(date.getHours());
          /*falls through*/
          case 'date':
            scope.model.setDate(date.getDate());
          /*falls through*/
          case 'month':
            scope.model.setMonth(date.getMonth());
          /*falls through*/
          case 'year':
            scope.model.setFullYear(date.getFullYear());
          }
          scope.$emit('setDate', scope.model, scope.view);
        }

        if (nextView) {
          scope.setView(nextView);
        }

        if(!nextView && attrs.autoClose === 'true'){
          element.addClass('hidden');
          scope.$emit('hidePicker');
        }
      };

      function update() {
        var view = scope.view;

        if (scope.model && !arrowClick) {
          scope.date = new Date(scope.model);
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
      }

      function watch() {
        if (scope.view !== 'date') {
          return scope.view;
        }
        return scope.date ? scope.date.getMonth() : null;
      }


      scope.$watch(watch, update);

      scope.next = function (delta) {
        var date = scope.date;
        delta = delta || 1;
        switch (scope.view) {
        case 'year':
        /*falls through*/
        case 'month':
          date.setFullYear(date.getFullYear() + delta);
          break;
        case 'date':
          /* Reverting from ISSUE #113
          var dt = new Date(date);
          date.setMonth(date.getMonth() + delta);
          if (date.getDate() < dt.getDate()) {
            date.setDate(0);
          }
          */
          date.setMonth(date.getMonth() + delta);
          break;
        case 'hours':
        /*falls through*/
        case 'minutes':
          date.setHours(date.getHours() + delta);
          break;
        }
        arrowClick = true;
        update();
      };

      scope.prev = function (delta) {
        return scope.next(-delta || -1);
      };

      scope.isAfter = function (date) {
        return scope.after && datePickerUtils.isAfter(date, scope.after);
      };

      scope.isBefore = function (date) {
        return scope.before && datePickerUtils.isBefore(date, scope.before);
      };

      scope.isSameMonth = function (date) {
        return datePickerUtils.isSameMonth(scope.model, date);
      };

      scope.isSameYear = function (date) {
        return datePickerUtils.isSameYear(scope.model, date);
      };

      scope.isSameDay = function (date) {
        return datePickerUtils.isSameDay(scope.model, date);
      };

      scope.isSameHour = function (date) {
        return datePickerUtils.isSameHour(scope.model, date);
      };

      scope.isSameMinutes = function (date) {
        return datePickerUtils.isSameMinutes(scope.model, date);
      };

      scope.isNow = function (date) {
        var is = true;
        var now = scope.now;
        //noinspection FallThroughInSwitchStatementJS
        switch (scope.view) {
        case 'minutes':
          is &= ~~(date.getMinutes()/step) === ~~(now.getMinutes()/step);
        /*falls through*/
        case 'hours':
          is &= date.getHours() === now.getHours();
        /*falls through*/
        case 'date':
          is &= date.getDate() === now.getDate();
        /*falls through*/
        case 'month':
          is &= date.getMonth() === now.getMonth();
        /*falls through*/
        case 'year':
          is &= date.getFullYear() === now.getFullYear();
        }
        return is;
      };
    }
  };
}]);

'use strict';

angular.module('datePicker').factory('datePickerUtils', function(){
  var createNewDate = function(year, month, day, hour, minute) {
    // without any arguments, the default date will be 1899-12-31T00:00:00.000Z
    return new Date(Date.UTC(year | 0, month | 0, day | 0, hour | 0, minute | 0));
  };
  return {
    getVisibleMinutes : function(date, step) {
      date = new Date(date || new Date());
      var year = date.getFullYear();
      var month = date.getMonth();
      var day = date.getDate();
      var hour = date.getUTCHours();
      var minutes = [];
      var minute, pushedDate;
      for (minute = 0 ; minute < 60 ; minute += step) {
        pushedDate = createNewDate(year, month, day, hour, minute);
        minutes.push(pushedDate);
      }
      return minutes;
    },
    getVisibleWeeks : function(date) {
      date = new Date(date || new Date());
      var startMonth = date.getMonth();
      var startYear = date.getYear();
      // set date to start of the week
      date.setDate(1);

      if (date.getDay() === 0) {
        // day is sunday, let's get back to the previous week
        date.setDate(-5);
      } else {
        // day is not sunday, let's get back to the start of the week
        date.setDate(date.getDate() - (date.getDay() - 1));
      }
      if (date.getDate() === 1) {
        // day is monday, let's get back to the previous week
        date.setDate(-6);
      }

      var weeks = [];
      var week;
      while (weeks.length < 6) {
        if (date.getYear() === startYear && date.getMonth() > startMonth) {
          break;
        }
        week = this.getDaysOfWeek(date);
        weeks.push(week);
        date.setDate(date.getDate() + 7);
      }
      return weeks;
    },
    getVisibleYears : function(date) {
      date = new Date(date || new Date());
      date.setFullYear(date.getFullYear() - (date.getFullYear() % 10));
      var year = date.getFullYear();
      var years = [];
      var pushedDate;
      for (var i = 0; i < 12; i++) {
        pushedDate = createNewDate(year);
        years.push(pushedDate);
        year++;
      }
      return years;
    },
    getDaysOfWeek : function(date) {
      date = new Date(date || new Date());
      date.setDate(date.getDate() - (date.getDay() - 1));
      var year = date.getFullYear();
      var month = date.getMonth();
      var day = date.getDate();
      var days = [];
      var pushedDate;
      for (var i = 0; i < 7; i++) {
        pushedDate = createNewDate(year, month, day);
        days.push(pushedDate);
        day++;
      }
      return days;
    },
    getVisibleMonths : function(date) {
      date = new Date(date || new Date());
      var year = date.getFullYear();
      var months = [];
      var pushedDate;
      for (var month = 0; month < 12; month++) {
        pushedDate = createNewDate(year, month, 1);
        months.push(pushedDate);
      }
      return months;
    },
    getVisibleHours : function(date) {
      date = new Date(date || new Date());
      var year = date.getFullYear();
      var month = date.getMonth();
      var day = date.getDate();
      var hours = [];
      var hour, pushedDate;
      for (hour = 0 ; hour < 24 ; hour++) {
        pushedDate = createNewDate(year, month, day, hour);
        hours.push(pushedDate);
      }
      return hours;
    },
    isAfter : function(model, date) {
      model = (model !== undefined) ? new Date(model) : model;
      date = new Date(date);
      return model && model.getTime() >= date.getTime();
    },
    isBefore : function(model, date) {
      model = (model !== undefined) ? new Date(model) : model;
      date = new Date(date);
      return model.getTime() <= date.getTime();
    },
    isSameYear :   function(model, date) {
      model = (model !== undefined) ? new Date(model) : model;
      date = new Date(date);
      return model && model.getFullYear() === date.getFullYear();
    },
    isSameMonth : function(model, date) {
      model = (model !== undefined) ? new Date(model) : model;
      date = new Date(date);
      return this.isSameYear(model, date) && model.getMonth() === date.getMonth();
    },
    isSameDay : function(model, date) {
      model = (model !== undefined) ? new Date(model) : model;
      date = new Date(date);
      return this.isSameMonth(model, date) && model.getDate() === date.getDate();
    },
    isSameHour : function(model, date) {
      model = (model !== undefined) ? new Date(model) : model;
      date = new Date(date);
      return this.isSameDay(model, date) && model.getHours() === date.getHours();
    },
    isSameMinutes : function(model, date) {
      model = (model !== undefined) ? new Date(model) : model;
      date = new Date(date);
      return this.isSameHour(model, date) && model.getMinutes() === date.getMinutes();
    },
    isValidDate : function(value) {
      // Invalid Date: getTime() returns NaN
      return value && !(value.getTime && value.getTime() !== value.getTime());
    }
  };
});
'use strict';

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

      attrs.$observe('disabled', function(isDisabled){
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

'use strict';

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
        (attrs.autoClose ? 'auto-close="' + attrs.autoClose + '" ' : '') +
        (attrs.template ? 'template="' + attrs.template + '" ' : '') +
        (attrs.minView ? 'min-view="' + attrs.minView + '" ' : '') +
        (attrs.partial ? 'partial="' + attrs.partial + '" ' : '') +
        (attrs.step ? 'step="' + attrs.step + '" ' : '') +
        'class="date-picker-date-time"></div>';
  },
  format: 'yyyy-MM-dd HH:mm',
  views: ['date', 'year', 'month', 'hours', 'minutes'],
  dismiss: false,
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

Module.directive('dateTime', ['$compile', '$document', '$filter', 'dateTimeConfig', '$parse', 'datePickerUtils',
                function ($compile, $document, $filter, dateTimeConfig, $parse, datePickerUtils) {
  var body = $document.find('body');
  var dateFilter = $filter('date');

  return {
    require: 'ngModel',
    scope:true,
    link: function (scope, element, attrs, ngModel) {
      var format = attrs.format || dateTimeConfig.format;
      var parentForm = element.inheritedData('$formController');
      var views = $parse(attrs.views)(scope) || dateTimeConfig.views.concat();
      var view = attrs.view || views[0];
      var index = views.indexOf(view);
      var dismiss = attrs.autoClose ? $parse(attrs.autoClose)(scope) : dateTimeConfig.autoClose;
      var picker = null;
      var position = attrs.position || dateTimeConfig.position;
      var container = null;

      if (index === -1) {
        views.splice(index, 1);
      }

      views.unshift(view);


      function formatter(value) {
        return dateFilter(value, format);
      }

      function parser() {
        return ngModel.$modelValue;
      }

      ngModel.$formatters.push(formatter);
      ngModel.$parsers.unshift(parser);


      //min. max date validators
      if (angular.isDefined(attrs.minDate)) {
        var minVal;
        ngModel.$validators.min = function (value) {
            return !datePickerUtils.isValidDate(value) || angular.isUndefined(minVal) || value >= minVal;
          };
        attrs.$observe('minDate', function (val) {
            minVal = new Date(val);
            ngModel.$validate();
          });
      }

      if (angular.isDefined(attrs.maxDate)) {
        var maxVal;
        ngModel.$validators.max = function (value) {
            return !datePickerUtils.isValidDate(value) || angular.isUndefined(maxVal) || value <= maxVal;
          };
        attrs.$observe('maxDate', function (val) {
            maxVal = new Date(val);
            ngModel.$validate();
          });
      }
      //end min, max date validator

      var template = dateTimeConfig.template(attrs);

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

      function showPicker() {
        if (picker) {
          return;
        }
        // create picker element
        picker = $compile(template)(scope);
        scope.$digest();

        scope.$on('setDate', function (event, date, view) {
          updateInput(event);
          if (dismiss && views[views.length - 1] === view) {
            clear();
          }
        });

        scope.$on('hidePicker', function () {
          element.triggerHandler('blur');
        });

        scope.$on('$destroy', clear);

        // move picker below input element

        if (position === 'absolute') {
          var pos = angular.extend(element.offset(), { height: element[0].offsetHeight });
          picker.css({ top: pos.top + pos.height, left: pos.left, display: 'block', position: position});
          body.append(picker);
        } else {
          // relative
          container = angular.element('<div date-picker-wrapper></div>');
          element[0].parentElement.insertBefore(container[0], element[0]);
          container.append(picker);
//          this approach doesn't work
//          element.before(picker);
          picker.css({top: element[0].offsetHeight + 'px', display: 'block'});
        }

        picker.bind('mousedown', function (evt) {
          evt.preventDefault();
        });
      }

      element.bind('focus', showPicker);
      element.bind('blur', clear);
    }
  };
}]);

angular.module("datePicker").run(["$templateCache", function($templateCache) {

  $templateCache.put("templates/datepicker.html",
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
    "        <th colspan=\"5\" class=\"switch\" ng-click=\"setView('month')\" ng-bind=\"date|date:'yyyy MMMM'\"></th>\r" +
    "\n" +
    "        <th ng-click=\"next()\">&rsaquo;</i></th>\r" +
    "\n" +
    "      </tr>\r" +
    "\n" +
    "      <tr>\r" +
    "\n" +
    "        <th ng-repeat=\"day in weekdays\" style=\"overflow: hidden\" ng-bind=\"day|date:'EEE'\"></th>\r" +
    "\n" +
    "      </tr>\r" +
    "\n" +
    "      </thead>\r" +
    "\n" +
    "      <tbody>\r" +
    "\n" +
    "      <tr ng-repeat=\"week in weeks\">\r" +
    "\n" +
    "        <td ng-repeat=\"day in week\">\r" +
    "\n" +
    "          <span\r" +
    "\n" +
    "            ng-class=\"{'now':isNow(day),'active':isSameDay(day),'disabled':(day.getMonth()!=date.getMonth()),'after':isAfter(day),'before':isBefore(day)}\"\r" +
    "\n" +
    "            ng-click=\"setDate(day)\" ng-bind=\"day.getDate()\"></span>\r" +
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
    "        <th colspan=\"5\" class=\"switch\"ng-bind=\"years[0].getFullYear()+' - '+years[years.length-1].getFullYear()\"></th>\r" +
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
    "          <span ng-class=\"{'active':isSameYear(year),'now':isNow(year)}\"\r" +
    "\n" +
    "                ng-repeat=\"year in years\"\r" +
    "\n" +
    "                ng-click=\"setDate(year)\" ng-bind=\"year.getFullYear()\"></span>\r" +
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
    "        <th colspan=\"5\" class=\"switch\" ng-click=\"setView('year')\" ng-bind=\"date|date:'yyyy'\"></th>\r" +
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
    "                ng-class=\"{'active':isSameMonth(month),'after':isAfter(month),'before':isBefore(month),'now':isNow(month)}\"\r" +
    "\n" +
    "                ng-click=\"setDate(month)\"\r" +
    "\n" +
    "                ng-bind=\"month|date:'MMM'\"></span>\r" +
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
    "        <th colspan=\"5\" class=\"switch\" ng-click=\"setView('date')\" ng-bind=\"date|date:'dd MMMM yyyy'\"></th>\r" +
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
    "                ng-class=\"{'now':isNow(hour),'active':isSameHour(hour)}\"\r" +
    "\n" +
    "                ng-click=\"setDate(hour)\" ng-bind=\"hour|time\"></span>\r" +
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
    "        <th colspan=\"5\" class=\"switch\" ng-click=\"setView('hours')\" ng-bind=\"date|date:'dd MMMM yyyy'\"></th>\r" +
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
    "                ng-class=\"{active:isSameMinutes(minute),'now':isNow(minute)}\"\r" +
    "\n" +
    "                ng-click=\"setDate(minute)\"\r" +
    "\n" +
    "                ng-bind=\"minute|time\"></span>\r" +
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
    "</div>\r" +
    "\n"
  );

  $templateCache.put("templates/daterange.html",
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