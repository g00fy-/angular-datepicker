'use strict';
var Module = angular.module('datePicker');

Module.directive('dateRange', ['$compile', 'datePickerUtils', 'dateTimeConfig', function ($compile, datePickerUtils, dateTimeConfig) {
  function getTemplate(attrs, id, model, min, max) {
    return dateTimeConfig.template(angular.extend(attrs, {
      ngModel: model,
      minDate: min && moment.isMoment(min) ? min.format() : false,
      maxDate: max && moment.isMoment(max) ? max.format() : false
    }), id);
  }

  function randomName() {
    return 'picker' + Math.random().toString().substr(2);
  }

  return {
    scope: {
      start: '=',
      end: '='
    },
    link: function (scope, element, attrs) {
      var dateChange = null,
        pickerRangeID = element[0].id,
        pickerIDs = [randomName(), randomName()],
        createMoment = datePickerUtils.createMoment,
        eventIsForPicker = datePickerUtils.eventIsForPicker;

      scope.dateChange = function (modelName, newDate) {
        //Notify user if callback exists.
        if (dateChange) {
          dateChange(modelName, newDate);
        }
      };

      function setMax(date) {
        scope.$broadcast('pickerUpdate', pickerIDs[0], {
          maxDate: date
        });
      }

      function setMin(date) {
        scope.$broadcast('pickerUpdate', pickerIDs[1], {
          minDate: date
        });
      }

      if (pickerRangeID) {
        scope.$on('pickerUpdate', function (event, targetIDs, data) {
          if (eventIsForPicker(targetIDs, pickerRangeID)) {
            //If we received an update event, dispatch it to the inner pickers using their IDs.
            scope.$broadcast('pickerUpdate', pickerIDs, data);
          }
        });
      }

      datePickerUtils.setParams(attrs.timezone);

      scope.start = createMoment(scope.start);
      scope.end = createMoment(scope.end);

      scope.$watchGroup(['start', 'end'], function (dates) {
        //Scope data changed, update picker min/max
        setMin(dates[0]);
        setMax(dates[1]);
      });

      if (angular.isDefined(attrs.dateChange)) {
        dateChange = datePickerUtils.findFunction(scope, attrs.dateChange);
      }

      attrs.onSetDate = 'dateChange';

      var template = '<div><table class="date-range"><tr><td valign="top">' +
        getTemplate(attrs, pickerIDs[0], 'start', false, scope.end) +
        '</td><td valign="top">' +
        getTemplate(attrs, pickerIDs[1], 'end', scope.start, false) +
        '</td></tr></table></div>';

      var picker = $compile(template)(scope);
      element.append(picker);
    }
  };
}]);
