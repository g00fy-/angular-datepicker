(function (angular) {
  'use strict';
  var Module = angular.module('datePicker', []);


  Module.directive('datePicker', function () {
    var viewOptions = ['month', 'date', 'year', 'month', 'hours', 'minutes'];

    function isValidDate(date) {
      return date instanceof Date && !isNaN(date.getTime());
    }

    function getVisibleMinutes(date) {
      date = new Date(date || new Date());
      date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours());
      var minutes = [];
      var step = 5;
      var stop = date.getTime() + 60 * 60 * 1000;
      while (date.getTime() < stop) {
        minutes.push(date);
        date = new Date(date.getTime() + step * 60 * 1000);
      }
      return minutes;
    }

    function getVisibleWeeks(date) {
      date = new Date(date || new Date());
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

    return {
      scope      : {
        date  : '=datePicker',
        after : '=?',
        before: '=?'
      },
      link       : function (scope, element, attrs) {

        scope.views = [];
        for (var attr in attrs) { //noinspection JSUnfilteredForInLoop
          if (viewOptions.indexOf(attr) !== -1) { //noinspection JSUnfilteredForInLoop
            scope.views.push(attr);
          }
        }
        if (!scope.views.length) {
          scope.views = ['date', 'month', 'year', 'hours', 'minutes'];
        }
        scope.view = scope.views[0];

        function hasView(view) {
          return scope.views.indexOf(view) !== -1;
        }

        function ensureDate() {
          // we need to return new instance as ngModel $watch watches only for identity - not for equality
          if (!(isValidDate(scope.date))) {
            scope.date = new Date(2000, 1, 1);
          }
          scope.date = new Date(scope.date);
        }

        function setYear(date) {
          ensureDate();
          scope.date.setFullYear(date.getFullYear());
        }

        function setMonth(date) {
          setYear(date);
          scope.date.setMonth(date.getMonth());
        }

        function setDate(date) {
          setMonth(date);
          scope.date.setDate(date.getDate());
        }

        function setHours(date) {
          setDate(date);
          scope.date.setHours(date.getHours());
        }

        function setMinutes(date) {
          setHours(date);
          scope.date.setMinutes(date.getMinutes());
        }

        scope.setYear = function (date) {
          setYear(date);
          scope.$emit('setYear', date);
        };

        scope.setMonth = function (date) {
          setMonth(date);
          scope.$emit('setMonth', date);
        };

        scope.setDate = function (date) {
          setDate(date);
          scope.$emit('setDate', date);
        };

        scope.setHours = function (date) {
          setHours(date);
          scope.$emit('setHours', date);
        };

        scope.setMinutes = function (date) {
          setMinutes(date);
          scope.$emit('setMinutes', date);
        };

        scope.setView = function setView(view) {
          if (hasView(view)) {
            scope.view = view;
            switch (view) {
            case 'minutes':
              scope.minutes = getVisibleMinutes(scope.visibleDate);
              break;
            case 'hours'  :
              scope.hours = getVisibleHours(scope.visibleDate);
              break;
            case 'date'   :
              scope.weeks = getVisibleWeeks(scope.visibleDate);
              break;
            case 'month'  :
              scope.months = getVisibleMonths(scope.visibleDate);
              break;
            case 'year'   :
              scope.years = getVisibleYears(scope.visibleDate);
              break;
            }
          }
        };

        scope.nextMonth = function (delta) {
          scope.visibleDate.setMonth(scope.visibleDate.getMonth() + (delta || 1));
        };

        scope.prevMonth = function (delta) {
          scope.nextMonth(-delta || -1);
        };

        scope.nextDay = function (delta) {
          scope.visibleDate.setDate(scope.visibleDate.getDate() + (delta || 1));
        };

        scope.prevDay = function (delta) {
          scope.nextDay(-delta || -1);
        };

        scope.nextHour = function (delta) {
          scope.visibleDate.setHours(scope.visibleDate.getHours() + (delta || 1));
        };

        scope.prevHour = function (delta) {
          scope.nextHour(-delta || -1);
        };

        scope.nextYear = function (delta) {
          scope.visibleDate.setFullYear(scope.visibleDate.getFullYear() + (delta || 1));
        };
        scope.prevYear = function (delta) {
          scope.nextYear(-delta || -1);
        };

        scope.visibleDate = new Date();

        scope.$watch('date', function (date) {
          if (date) {
            scope.visibleDate = new Date(date);
          }
        });

        scope.isAfter = function (date) {
          return date >= scope.after;
        };

        scope.isBefore = function (date) {
          return date <= scope.before;
        };

        function validDate() {
          return scope.date instanceof Date;
        }

        scope.isSameMinutes = function (date) {
          if (!validDate()){
            return false;
          }
          var b = scope.date;
          return (date.getTime() - date.getSeconds() * 1000 - date.getMilliseconds()) === (b.getTime() - b.getSeconds() * 1000 - b.getMilliseconds());
        };

        scope.isSameMonth = function (date) {
          if (!validDate()){
            return false;
          }
          return date.getFullYear() === scope.date.getFullYear() && date.getMonth() === scope.date.getMonth();
        };

        scope.isSameYear = function (date) {
          if (!validDate()){
            return false;
          }
          return date.getFullYear() === scope.date.getFullYear();
        };

        scope.isSameDate = function (date) {
          if (!validDate()){
            return false;
          }
          return scope.date.getDate() === date.getDate() && scope.isSameMonth(date);
        };

        scope.isSameHour = function (date) {
          if (!validDate()){
            return false;
          }
          return scope.date.getHours() === date.getHours() && scope.isSameDate(date);
        };

        scope.isOldMonth = function (date) {
          return date
            .getTime() < scope.visibleDate.getTime() && date.getMonth() !== scope.visibleDate.getMonth();
        };

        scope.isNewHour = function (date) {
          return date.getTime() > scope.visibleDate.getTime() && date.getHours() !== scope.visibleDate.getHours();
        };

        scope.isOldHour = function (date) {
          return date.getTime() < scope.visibleDate.getTime() && date.getHours() !== scope.visibleDate.getHours();
        };

        scope.isNewMonth = function (date) {
          return date.getTime() > scope.visibleDate.getTime() && date.getMonth() !== scope.visibleDate.getMonth();
        };


        scope.$on('setDate', scope.setView.bind(null, 'hours'));
        scope.$on('setMonth', scope.setView.bind(null, 'date'));
        scope.$on('setHours', scope.setView.bind(null, 'minutes'));
        scope.$on('setYear', scope.setView.bind(null, 'month'));

        scope.$watch(function () {
          return isValidDate(scope.visibleDate);
        }, function (valid) {
          if (!valid) {
            scope.visibleDate = new Date();
          }
        });

        //hours
        scope.$watch('[visibleDate.getDate(),visibleDate.getHours()].join()', function () {
          if (scope.view === 'hours') {
            scope.hours = getVisibleHours(scope.visibleDate);
          }
        });
        //date
        scope.$watch('[visibleDate.getFullYear(),visibleDate.getMonth(),visibleDate.getDate()].join()', function () {
          if (scope.view === 'date') {
            scope.weeks = getVisibleWeeks(scope.visibleDate);
            scope.weekdays = getDaysOfWeek(scope.visibleDate);
          }
        });

        scope.$watch('[visibleDate.getFullYear(),visibleDate.getMonth()].join()', function () {
          if (scope.view === 'month') {
            scope.months = getVisibleMonths(scope.visibleDate);
          }
        });

        scope.$watch('visibleDate.getYear()', function () {
          if (scope.view === 'year') {
            scope.years = getVisibleYears(scope.visibleDate);
          }
        });

        scope.$watch('visibleDate.getTime()', function () {
          if (scope.view === 'minutes') {
            scope.minutes = getVisibleMinutes(scope.visibleDate);
          }
        });

      },
      transclude : true,
      replace    : true,
      templateUrl: 'templates/datepicker.html'
    };
  });

  Module.directive('dateTime', function ($compile, $document, $filter) {
    var body = $document.find('body');
    var dateFilter = $filter('date');
    return {
      require: 'ngModel',
      link   : function (scope, element, attrs, ngModel) {
        var format = attrs.format || 'yyyy-MM-dd HH:mm';

        var viewsOptions = ['date', 'year', 'month', 'hours', 'minutes', 'month'];
        var views = [];
        for (var attr in attrs) {
          //noinspection JSUnfilteredForInLoop
          if (viewsOptions.indexOf(attr) !== -1) { //noinspection JSUnfilteredForInLoop
            views.push(attr);
          }
        }

        function formatter(value) {
          return dateFilter(value, format);
        }

        ngModel.$formatters.push(formatter);

        var picker = null;
        var clear = angular.noop;

        element.bind('focus', function () {
          if (!picker) {
            picker = $compile('<div date-picker="' + attrs.ngModel + '" class="datetimepicker datetimepicker-dropdown-bottom-left dropdown-menu" format="' + format + '" ' + views.join(' ') + '></div>')(scope);
            body.append(picker);
            scope.$digest();
            var pos = angular.extend(element.offset(), { height: element[0].offsetHeight });
            picker.css({ top: pos.top + pos.height, left: pos.left, display: 'block', position: 'absolute'});
            picker.bind('mousedown', function () {
              return false;
            });
          }
          return false;
        });
        element.bind('blur', function () {
          clear();
          clear = angular.noop;
          if (picker){
            picker.remove();
          }
          picker = null;
        });
      }
    };
  });

  Module.directive('dateRange', function () {
    return {
      templateUrl: 'templates/daterange.html',
      scope   : {
        start: '=',
        end  : '='
      },
      link    : function (scope) {
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
})(angular);