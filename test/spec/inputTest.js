describe('Test date time input Directive', function(){
  var $rootScope, $compile;

  function compileAndDigest(template) {
    var el = $compile(template)($rootScope);
    $rootScope.$digest();
    return el;
  }

  beforeEach(angular.mock.module('datePicker'));

  beforeEach(angular.mock.module('templates/datepicker.html'));

  beforeEach(angular.mock.inject(function(_$compile_, _$rootScope_){
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('shows the model with the default format', function(){
    $rootScope.date = moment(new Date(1972, 2, 5));
    var t = '<input date-time ng-model="date">';
    var el = compileAndDigest(t);
    expect(el.val()).toBe('1972-03-05 00:00');
  });

  it('shows the model with the attribute format', function(){
    $rootScope.date = moment(new Date(1972, 2, 5));
    var t = '<input date-time ng-model="date" format="YYYY_MM_DD">';
    var el = compileAndDigest(t);
    expect(el.val()).toBe('1972_03_05');
  });

  it('updates the view when model is changed', function(){
    $rootScope.date = moment(new Date(1972, 2, 5));
    var t = '<input date-time ng-model="date">';
    var el = compileAndDigest(t);
    $rootScope.date = moment(new Date(1971, 1, 4));
    $rootScope.$digest();
    expect(el.val()).toBe('1971-02-04 00:00');
  });

  it('opens the datepicker on focus', function(){
    $rootScope.date = moment(new Date(1972, 2, 5));
    var t = '<div><input date-time ng-model="date"></div>';
    var el = compileAndDigest(t);
    
    expect(el.children().length).toBe(1);
    
    el.children().triggerHandler('focus');

    expect(el.children().length).toBe(2);
    expect(el.find('[date-picker]').length).toBe(1);
  });

  it('hides the datepicker on blur', function(){
    $rootScope.date = moment(new Date(1972, 2, 5));
    var t = '<div><input date-time ng-model="date"></div>';
    var el = compileAndDigest(t);
    
    el.children().triggerHandler('focus');
    el.children().triggerHandler('blur');

    expect(el.children().length).toBe(1);
    expect(el.find('[date-picker]').length).toBe(0);
  });
});
