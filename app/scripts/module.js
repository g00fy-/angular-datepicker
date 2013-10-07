(function (angular) {
  'use strict';
  var Module = angular.module('datePicker', []);


  Module.directive('datePicker', function () {
    var views = ['year', 'month', 'date', 'hours', 'minutes'];
    var noop = angular.noop;

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
      templateUrl: 'templates/datepicker.html',
      replace:true,
      scope      : {
        model:  '=datePicker',
        view  : '=?',
        after : '=?',
        before: '=?'
      },
      link       : function (scope, element, attrs) {

        // if model value was updated or already existing;
        var updated = !!scope.model;

        scope.date = new Date();

        if(!scope.view){
          // set default view
          scope.view = views[0];
        }

        scope.setView= function(nextView){
          scope.view = nextView;
        };


        scope.setDate = function(date){
          scope.date = date;
          // change next view
          var nextView = views[views.indexOf(scope.view)+1];
          if(nextView){
            scope.view = nextView;
            updated = true;
          }
          if(!nextView || updated){
            scope.model = date;
          }
        };

        function update(){
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
              scope.minutes = getVisibleMinutes(date);
              break;
          }
        }

        scope.$watch('view', function (view) {
          update();
        });

        scope.next = function(delta){
          var date = scope.date;
          delta = delta || 1;
          switch(scope.view){
            case 'year':
            case 'month':
              date.setFullYear(date.getFullYear() + delta);
              break;
            case 'date':
              date.setMonth(date.getMonth() + delta);
              break;
            case 'hours':
            case 'minutes':
              date.setHours(date.getHours() + delta);
              break;
          }
          update();
        };

        scope.prev = function(delta){
          return scope.next(delta || -1);
        };

        scope.isAfter = function(date){
          return updated && scope.model ? scope.model.getTime() >= date.getTime(): false;
        };

        scope.isBefore = function(date){
          return scope.model ? scope.model.getTime() <= date.getTime(): false;
        };

        scope.isSameMonth = function(date){
          return scope.isSameYear(date) && scope.model ? scope.model.getMonth() == date.getMonth() : false;
        };

        scope.isSameYear= function(date){
          return (scope.model ? scope.model.getFullYear() == date.getFullYear(): false);
        };

        scope.isSameDay = function(date){
          return scope.isSameMonth(date) && scope.model ? scope.model.getDate() == date.getDate() : false;
        };
      }
    };
  });

//  Module.directive('dateTime', function ($compile, $document, $filter) {
//    var body = $document.find('body');
//    var dateFilter = $filter('date');
//    return {
//      require: 'ngModel',
//      link   : function (scope, element, attrs, ngModel) {
//        var format = attrs.format || 'yyyy-MM-dd HH:mm';
//
//        var viewsOptions = ['date', 'year', 'month', 'hours', 'minutes', 'month'];
//        var views = [];
//        for (var attr in attrs) {
//          //noinspection JSUnfilteredForInLoop
//          if (viewsOptions.indexOf(attr) !== -1) { //noinspection JSUnfilteredForInLoop
//            views.push(attr);
//          }
//        }
//
//        function formatter(value) {
//          return dateFilter(value, format);
//        }
//
//        ngModel.$formatters.push(formatter);
//
//        var picker = null;
//        var clear = function(){
//          if(picker){
//            picker.remove();
//            picker = null;
//          }
//        };
//        var template = '<div date-picker="' + attrs.ngModel + '" class="datetimepicker datetimepicker-dropdown-bottom-left dropdown-menu" format="' + format + '" ' + views.join(' ') + '></div>';
//
//        function update(obj,date){
//          ngModel.$setViewValue(date);
//        }
//
//        element.bind('focus', function () {
//          if (!picker) {
//            // create picker element
//            picker = $compile(template)(scope);
//            body.append(picker);
//            scope.$digest();
//
//
//            scope.$on('setDate', update);
//            scope.$on('setMonth',update);
//            scope.$on('setHours',update);
//            scope.$on('setYear', update);
//
//            var pos = angular.extend(element.offset(), { height: element[0].offsetHeight });
//            picker.css({ top: pos.top + pos.height, left: pos.left, display: 'block', position: 'absolute'});
//            picker.bind('mousedown', function () {
//              return false;
//            });
//          }
//          return false;
//        });
//        element.bind('blur', clear);
//      }
//    };
//  });

//  Module.directive('dateRange', function () {
//    return {
//      templateUrl: 'templates/daterange.html',
//      scope   : {
//        start: '=',
//        end  : '='
//      },
//      link    : function (scope) {
//        scope.$watch('start.getTime()', function (value) {
//          if (value && scope.end && value > scope.end.getTime()) {
//            scope.end = new Date(value);
//          }
//        });
//        scope.$watch('end.getTime()', function (value) {
//          if (value && scope.start && value < scope.start.getTime()) {
//            scope.start = new Date(value);
//          }
//        });
//      }
//    };
//  });
})(angular);
