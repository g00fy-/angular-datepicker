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
