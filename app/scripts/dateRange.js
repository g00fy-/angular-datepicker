'use strict';

var Module = angular.module('datePicker');

Module.directive('dateRange', ['$compile', 'datePickerUtils', 'dateTimeConfig', function ($compile, datePickerUtils, dateTimeConfig) {
  function getTemplate(attrs, id, model, minDate, maxDate) {
    /*  Assuming that minDate and maxDate are going to be either moment 
        objects or false (we will get an exception otherwise)       
     */
    return dateTimeConfig.template(angular.extend(attrs, {
      ngModel: model,
      minDate: minDate ? minDate.format() : false,
      maxDate: maxDate ? maxDate.format() : false
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
          pickerIDs = [randomName(),randomName()],
          createMoment = datePickerUtils.createMoment;

      scope.dateChange = function (modelName, newDate) {
        //Received updated data from one of the pickers. Update the max/min date of the other picker. 
        var data = {},
            pickerID;

        if (modelName === 'start') {
          //Start changed
          data.minDate = newDate;
          pickerID = pickerIDs[1];
        } else {
          //End changed
          data.maxDate = newDate;
          pickerID = pickerIDs[0];
        }

        scope.$broadcast('pickerUpdate', pickerID, data);

        //Notify user if callback exists.
        if (dateChange) {
          dateChange(modelName, newDate);
        }
      };

      if (pickerRangeID) {
        scope.$on('pickerUpdate', function (event, pickerIDs, data) {
          if ((angular.isArray(pickerIDs) && pickerIDs.indexOf(pickerRangeID) > -1) || pickerRangeID === pickerIDs) {
            //If we received an update event, dispatch it to the inner pickers using their IDs.
            scope.$broadcast('pickerUpdate', pickerIDs, data);
          }
        });
      }

      datePickerUtils.setParams(attrs.timezone);

      scope.start = createMoment(scope.start);
      scope.end = createMoment(scope.end);

      if (angular.isDefined(attrs.dateChange)) {
        dateChange = datePickerUtils.findFunction(scope, attrs.dateChange);
      }

      attrs.onSetDate = 'dateChange';

      var template = '<div><table><tr><td valign="top" style="width: 300px;">' +
                    getTemplate(attrs, pickerIDs[0], 'start', false, scope.end) +
                    '</td><td valign="top" style="width: 300px;">' +
                    getTemplate(attrs, pickerIDs[1], 'end', scope.start, false) +
                  '</td></tr></table></div>';

      var picker = $compile(template)(scope);
      var container = angular.element('<div date-picker-wrapper></div>');
      element[0].parentElement.insertBefore(container[0], element[0]);
      container.append(picker);
    }
  };
}]);