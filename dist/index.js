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

function getVisibleMinutes(date, step) {
  date = new Date(date || new Date());
  date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours());
  var minutes = [];
  var stop = date.getTime() + 60 * 60 * 1000;
  while (date.getTime() < stop) {
    minutes.push(date);
    date = new Date(date.getTime() + step * 60 * 1000);
  }
  return minutes;
}

function getVisibleWeeks(date) {
  date = new Date(date || new Date());
  var startMonth = date.getMonth(), startYear = date.getYear();
  date.setDate(1);
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  if (date.getDay() === 0) {
    date.setDate(-5);
  } else {
    date.setDate(date.getDate() - (date.getDay() - 1));
  }
  if (date.getDate() === 1) {
    date.setDate(-6);
  }

  var weeks = [];
  while (weeks.length < 6) {
    /*jshint -W116 */
    if(date.getYear()=== startYear && date.getMonth() > startMonth) break;
    var week = [];
    for (var i = 0; i < 7; i++) {
      week.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function getVisibleYears(date) {
  var years = [];
  date = new Date(date || new Date());
  date.setFullYear(date.getFullYear() - (date.getFullYear() % 10));
  for (var i = 0; i < 12; i++) {
    years.push(new Date(date.getFullYear() + (i - 1), 0, 1));
  }
  return years;
}

function getDaysOfWeek(date) {
  date = new Date(date || new Date());
  date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  date.setDate(date.getDate() - (date.getDay() - 1));
  var days = [];
  for (var i = 0; i < 7; i++) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function getVisibleMonths(date) {
  date = new Date(date || new Date());
  var year = date.getFullYear();
  var months = [];
  for (var month = 0; month < 12; month++) {
    months.push(new Date(year, month, 1));
  }
  return months;
}

function getVisibleHours(date) {
  date = new Date(date || new Date());
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  var hours = [];
  for (var i = 0; i < 24; i++) {
    hours.push(date);
    date = new Date(date.getTime() + 60 * 60 * 1000);
  }
  return hours;
}


function isAfter(model, date) {
  return model && model.getTime() <= date.getTime();
}

function isBefore(model, date) {
  return model.getTime() >= date.getTime();
}

function isSameYear(model, date) {
  return model && model.getFullYear() === date.getFullYear();
}

function isSameMonth(model, date) {
  return isSameYear(model, date) && model.getMonth() === date.getMonth();
}

function isSameDay(model, date) {
  return isSameMonth(model, date) && model.getDate() === date.getDate();
}

function isSameHour(model, date) {
  return isSameDay(model, date) && model.getHours() === date.getHours();
}

function isSameMinutes(model, date) {
  return isSameHour(model, date) && model.getMinutes() === date.getMinutes();
}

function isSame(model, date, level) {
  var methods = {
    'minute': isSameMinutes,
    'hour': isSameHour,
    'day': isSameDay,
    'month': isSameMonth,
    'year': isSameYear
  };

  return methods[level] && methods[level](model, date);
}


Module.directive('datePicker', ['datePickerConfig', function datePickerDirective(datePickerConfig) {

  //noinspection JSUnusedLocalSymbols
  return {
    // this is a bug ?
    template: '<div ng-include="template"></div>',
    scope: {
      model: '=datePicker',
      after: '=?',
      before: '=?',
      minDate: '=?',
      maxDate: '=?'
    },
    link: function (scope, element, attrs) {
      scope.date = new Date(scope.model || new Date());
      scope.views = datePickerConfig.views.concat();
      scope.view = attrs.view || datePickerConfig.view;
      scope.now = new Date();
      scope.template = attrs.template || datePickerConfig.template;

      var step = parseInt(attrs.step || datePickerConfig.step, 10);
      var partial = !!attrs.partial;

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
        scope.date = date;
        // change next view
        var nextView = scope.views[scope.views.indexOf(scope.view) + 1];
        if ((!nextView || partial) || scope.model) {

          scope.model = new Date(scope.model || date);
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
      };

      function update() {
        var view = scope.view;
        var date = scope.date;
        switch (view) {
        case 'year':
          scope.years = getVisibleYears(date);
          break;
        case 'month':
          scope.months = getVisibleMonths(date);
          break;
        case 'date':
          scope.weekdays = scope.weekdays || getDaysOfWeek();
          scope.weeks = getVisibleWeeks(date);
          break;
        case 'hours':
          scope.hours = getVisibleHours(date);
          break;
        case 'minutes':
          scope.minutes = getVisibleMinutes(date, step);
          break;
        }
      }

      function watch() {
        if (scope.view !== 'date') {
          return scope.view;
        }
        return scope.model ? scope.model.getMonth() : null;
      }


      scope.$watch(watch, update);

      scope.$watch('minDate', function () {
        if (scope.minDate && !(scope.minDate instanceof Date)) {
          scope.minDate = new Date(scope.minDate);
        }
      });

      scope.$watch('maxDate', function () {
        if (scope.maxDate && !(scope.maxDate instanceof Date)) {
          scope.maxDate = new Date(scope.maxDate);
        }
      });

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
          date.setMonth(date.getMonth() + delta);
          break;
        case 'hours':
        /*falls through*/
        case 'minutes':
          date.setHours(date.getHours() + delta);
          break;
        }
        update();
      };


      scope.isValid = function (date, view) {
        if (scope.minDate && date < scope.minDate && !isSame(date, scope.minDate, view)) {
          return false;
        }
        if (scope.maxDate && date > scope.maxDate && !isSame(date, scope.maxDate, view)) {
          return false;
        }
        return true;
      };

      scope.prev = function (delta) {
        return scope.next(-delta || -1);
      };

      scope.isAfter = function (date) {
        return scope.after && isAfter(date, scope.after);
      };

      scope.isBefore = function (date) {
        return scope.before && isBefore(date, scope.before);
      };

      scope.isSameMonth = function (date) {
        return isSameMonth(scope.date, date);
      };

      scope.isSameYear = function (date) {
        return isSameYear(scope.date, date);
      };

      scope.isSameDay = function (date) {
        return isSameDay(scope.date, date);
      };

      scope.isSameHour = function (date) {
        return isSameHour(scope.date, date);
      };

      scope.isSameMinutes = function (date) {
        return isSameMinutes(scope.date, date);
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

var Module = angular.module('datePicker');

Module.directive('dateRange', function () {
  return {
    templateUrl: 'templates/daterange.html',
    scope: {
      start: '=',
      end: '='
    },
    link: function (scope) {
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
        (attrs.template ? 'template="' + attrs.template + '" ' : '') +
        (attrs.minView ? 'min-view="' + attrs.minView + '" ' : '') +
        (attrs.partial ? 'partial="' + attrs.partial + '" ' : '') +
        'class="dropdown-menu"></div>';
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

Module.directive('dateTime', ['$compile', '$document', '$filter', 'dateTimeConfig', '$parse', function ($compile, $document, $filter, dateTimeConfig, $parse) {
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
      var dismiss = attrs.dismiss ? $parse(attrs.dismiss)(scope) : dateTimeConfig.dismiss;
      var minView = attrs.minView || dateTimeConfig.views[ dateTimeConfig.views.length - 1 ];
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
          if (dismiss && minView === view) {
            // Angular does not provide a "blur" equivalent
            if (document.activeElement !== document.body){
              document.activeElement.blur();
            }
          }
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
    "<div ng-switch=\"view\">\n" +
    "  <div ng-switch-when=\"date\">\n" +
    "    <table>\n" +
    "      <thead>\n" +
    "      <tr>\n" +
    "        <th ng-click=\"prev()\">‹</th>\n" +
    "        <th colspan=\"5\" class=\"switch\" ng-click=\"setView('month')\">{{date|date:\"yyyy MMMM\"}}</th>\n" +
    "        <th ng-click=\"next()\">›</i></th>\n" +
    "      </tr>\n" +
    "      <tr>\n" +
    "        <th ng-repeat=\"day in weekdays\" style=\"overflow: hidden\">{{ day|date:\"EEE\" }}</th>\n" +
    "      </tr>\n" +
    "      </thead>\n" +
    "      <tbody>\n" +
    "      <tr ng-repeat=\"week in weeks\">\n" +
    "        <td ng-repeat=\"day in week\">\n" +
    "          <span\n" +
    "            ng-class=\"{'now':isNow(day),'disabled':!isValid(day, 'day'), 'active':isSameDay(day),'disabled':(day.getMonth()!=date.getMonth()),'after':isAfter(day),'before':isBefore(day)}\"\n" +
    "            ng-click=\"isValid(day, 'day') && setDate(day)\" ng-bind=\"day.getDate()\"></span>\n" +
    "        </td>\n" +
    "      </tr>\n" +
    "      </tbody>\n" +
    "    </table>\n" +
    "  </div>\n" +
    "  <div ng-switch-when=\"year\">\n" +
    "    <table>\n" +
    "      <thead>\n" +
    "      <tr>\n" +
    "        <th ng-click=\"prev(10)\">‹</th>\n" +
    "        <th colspan=\"5\" class=\"switch\">{{years[0].getFullYear()}}-{{years[years.length-1].getFullYear()}}</th>\n" +
    "        <th ng-click=\"next(10)\">›</i></th>\n" +
    "      </tr>\n" +
    "      </thead>\n" +
    "      <tbody>\n" +
    "      <tr>\n" +
    "        <td colspan=\"7\">\n" +
    "          <span ng-class=\"{'active':isSameYear(year),'disabled':!isValid(year, 'year'), 'now':isNow(year)}\"\n" +
    "                ng-repeat=\"year in years\"\n" +
    "                ng-click=\"isValid(year, 'year') && setDate(year)\" ng-bind=\"year.getFullYear()\"></span>\n" +
    "        </td>\n" +
    "      </tr>\n" +
    "      </tbody>\n" +
    "    </table>\n" +
    "  </div>\n" +
    "  <div ng-switch-when=\"month\">\n" +
    "    <table>\n" +
    "      <thead>\n" +
    "      <tr>\n" +
    "        <th ng-click=\"prev()\">‹</th>\n" +
    "        <th colspan=\"5\" class=\"switch\" ng-click=\"setView('year')\">{{ date|date:\"yyyy\" }}</th>\n" +
    "        <th ng-click=\"next()\">›</i></th>\n" +
    "      </tr>\n" +
    "      </thead>\n" +
    "      <tbody>\n" +
    "      <tr>\n" +
    "        <td colspan=\"7\">\n" +
    "          <span ng-repeat=\"month in months\"\n" +
    "                ng-class=\"{'active':isSameMonth(month),'disabled':!isValid(month, 'month'), 'after':isAfter(month),'before':isBefore(month),'now':isNow(month)}\"\n" +
    "                ng-click=\"isValid(month, 'month') && setDate(month)\"\n" +
    "                ng-bind=\"month|date:'MMM'\"></span>\n" +
    "        </td>\n" +
    "      </tr>\n" +
    "      </tbody>\n" +
    "    </table>\n" +
    "  </div>\n" +
    "  <div ng-switch-when=\"hours\">\n" +
    "    <table>\n" +
    "      <thead>\n" +
    "      <tr>\n" +
    "        <th ng-click=\"prev(24)\">‹</th>\n" +
    "        <th colspan=\"5\" class=\"switch\" ng-click=\"setView('date')\">{{ date|date:\"dd MMMM yyyy\" }}</th>\n" +
    "        <th ng-click=\"next(24)\">›</i></th>\n" +
    "      </tr>\n" +
    "      </thead>\n" +
    "      <tbody>\n" +
    "      <tr>\n" +
    "        <td colspan=\"7\">\n" +
    "          <span ng-repeat=\"hour in hours\"\n" +
    "                ng-class=\"{'now':isNow(hour),'active':isSameHour(hour),'disabled':!isValid(hour, 'hour') }\"\n" +
    "                ng-click=\"isValid(hour, 'hour') && setDate(hour)\" ng-bind=\"hour|time\"></span>\n" +
    "        </td>\n" +
    "      </tr>\n" +
    "      </tbody>\n" +
    "    </table>\n" +
    "  </div>\n" +
    "  <div ng-switch-when=\"minutes\">\n" +
    "    <table>\n" +
    "      <thead>\n" +
    "      <tr>\n" +
    "        <th ng-click=\"prev()\">‹</th>\n" +
    "        <th colspan=\"5\" class=\"switch\" ng-click=\"setView('hours')\">{{ date|date:\"dd MMMM yyyy\" }}\n" +
    "        </th>\n" +
    "        <th ng-click=\"next()\">›</i></th>\n" +
    "      </tr>\n" +
    "      </thead>\n" +
    "      <tbody>\n" +
    "      <tr>\n" +
    "        <td colspan=\"7\">\n" +
    "          <span ng-repeat=\"minute in minutes\"\n" +
    "                ng-class=\"{active:isSameMinutes(minute), 'disabled':!isValid(minute, 'minute'), 'now':isNow(minute)}\"\n" +
    "                ng-click=\"isValid(minute, 'minute') && setDate(minute)\"\n" +
    "                ng-bind=\"minute|time\"></span>\n" +
    "        </td>\n" +
    "      </tr>\n" +
    "      </tbody>\n" +
    "    </table>\n" +
    "  </div>\n" +
    "</div>\n"
  );

  $templateCache.put("templates/daterange.html",
    "<div>\n" +
    "    <table>\n" +
    "        <tr>\n" +
    "            <td valign=\"top\">\n" +
    "                <div date-picker=\"start\" class=\"date-picker\" date after=\"start\" before=\"end\" min-view=\"date\" max-view=\"date\"></div>\n" +
    "            </td>\n" +
    "            <td valign=\"top\">\n" +
    "                <div date-picker=\"end\" class=\"date-picker\" date after=\"start\" before=\"end\"  min-view=\"date\" max-view=\"date\"></div>\n" +
    "            </td>\n" +
    "        </tr>\n" +
    "    </table>\n" +
    "</div>\n"
  );

}]);
})(angular);