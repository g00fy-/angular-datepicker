'use strict';

var PRISTINE_CLASS = 'ng-pristine',
    DIRTY_CLASS = 'ng-dirty';

var Module = angular.module('datePicker');

Module.constant('dateTimeConfig', {
  template: function (attrs, id) {
    return '' +
        '<div ' +
        (id ? 'id="' + id + '" ' : '') +
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
        (attrs.onSetDate ? 'date-change="' + attrs.onSetDate + '" ' : '') +
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
