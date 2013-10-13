(function (angular) {
  'use strict';

  var PRISTINE_CLASS = 'ng-pristine',
      DIRTY_CLASS = 'ng-dirty';

  var Module = angular.module('datePicker');

  Module.constant('dateTimeConfig', {
    template: function (attrs) {
      return '' +
          '<div ' +
          'date-picker="' + attrs.ngModel + '" ' +
          'view="' + attrs.view + '" ' +
          (attrs.maxView ? 'max-view="' + attrs.maxView + '" ' : '') +
          (attrs.template ? 'template="' + attrs.template + '" ' : '') +
          (attrs.minView ? 'min-view="' + attrs.minView + '" ' : '') +
          'class="dropdown-menu"></div>';
    },
    format: 'yyyy-MM-dd HH:mm',
    views: ['date', 'year', 'month', 'hours', 'minutes', 'month'],
    dismiss: false,
    position: 'relative'
  });

  Module.directive('dateTimeAppend', function () {
    return {
      link: function (scope, element) {
        element.bind('click', function () {
          element.find('input').focus();
        });
      }
    };
  });

  Module.directive('dateTime', function ($compile, $document, $filter, dateTimeConfig, $parse) {
    var body = $document.find('body');
    var dateFilter = $filter('date');

    return {
      require: 'ngModel',
      link: function (scope, element, attrs, ngModel) {
        var format = attrs.format || dateTimeConfig.format;
        var parentForm = element.inheritedData('$formController');
        var views = $parse(attrs.views)(scope) || dateTimeConfig.views.concat();
        var view = attrs.view || views[0];
        var index = views.indexOf(view);
        var dismiss = attrs.dismiss ? $parse(attrs.dismiss)(scope) : dateTimeConfig.dismiss;
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

          scope.$on('setDate', function (event) {
            updateInput(event);
            if (dismiss) {
              clear();
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
//            container = angular.element('<div date-picker-wrapper></div>');
//            element.before(container);
//            container.append(picker);
            element.before(picker);
            picker.css({position: 'relative', top: element[0].offsetHeight, display: 'block'});
          }

          picker.bind('mousedown', function () {
            return false;
          });
        }

        element.bind('focus', showPicker);
        element.bind('blur', clear);
      }
    };
  });
})(angular);
