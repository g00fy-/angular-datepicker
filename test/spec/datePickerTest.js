describe('Test date Picker Filter', function(){
  var mFormatFilter;

  beforeEach(angular.mock.module('datePicker'));

  beforeEach(angular.mock.inject(function($filter){
    mFormatFilter = $filter('mFormat');
  }));

  it('returns a formatted date when receiving a Moment instance', function(){
    var date = moment(new Date(2015, 0, 2));
    var formattedDate = mFormatFilter(date, 'YYYY_MM_DD');

    expect(formattedDate).toBe('2015_01_02');
  });

  it('returns a formatted date when receiving a Date instance', function(){
    var date = new Date(2015, 0, 2);
    var formattedDate = mFormatFilter(date, 'YYYY_MM_DD');

    expect(formattedDate).toBe('2015_01_02');
  });

  it('returns a formatted date when receiving a string', function(){
    var date = '2015-01-02T03:00:00.000Z';
    var formattedDate = mFormatFilter(date, 'YYYY_MM_DD');

    expect(formattedDate).toBe('2015_01_02');
  });
});

describe('Test date Picker Directive', function(){
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

  it('appends a div element with an ng-include attribute', function(){
    var t = '<div date-picker></div>';
    var el = compileAndDigest(t);
    expect(el.find(':scope > div[ng-include]').length).toBeGreaterThan(0);
  });

  it('stands on the date of the model', function(){
    $rootScope.date = moment(new Date(1973, 4, 7));
    var t = '<div date-picker="date"></div>';
    var el = compileAndDigest(t);
    expect(el.find('.switch').text()).toBe('1973');
  });

  describe('next button', function(){

    it('moves the view to the next year', function(){
      $rootScope.date = moment(new Date(1973, 4, 7));
      var t = '<div date-picker="date"></div>';
      var el = compileAndDigest(t);
      el.find('.switch').next().triggerHandler('click');
      expect(el.find('.switch').text()).toBe('1974');
    });

  });

  describe('prev button', function(){

    it('moves the view to the previous year', function(){
      $rootScope.date = moment(new Date(1973, 4, 7));
      var t = '<div date-picker="date"></div>';
      var el = compileAndDigest(t);
      el.find('.switch').parent().children().eq(0).triggerHandler('click');
      expect(el.find('.switch').text()).toBe('1972');
    });

    it('does not moves the view to the previous year if its less than min-date', function(){
      $rootScope.date = moment(new Date(1973, 4, 7));
      $rootScope.minDate = moment(new Date(1973, 0, 1));
      var t = '<div date-picker="date" min-date="minDate"></div>';
      var el = compileAndDigest(t);
      el.find('.switch').parent().children().eq(0).triggerHandler('click');
      expect(el.find('.switch').text()).toBe('1973');
    });

  });

  describe('date cell button', function(){

    it('is set to active if it corresponds to the model month', function(){
      $rootScope.date = moment(new Date(1973, 4, 7));
      var t = '<div date-picker="date"></div>';
      var el = compileAndDigest(t);
      expect(el.find('.active').text()).toBe('May');
    });

    it('goes to the next view', function(){
      $rootScope.date = moment(new Date(1973, 4, 7));
      var t = '<div date-picker="date"></div>';
      var el = compileAndDigest(t);
      el.find('table td span:first-child').triggerHandler('click');
      expect(el.find('.switch').text()).toBe('1973 January');
    });

    it('clips date if its less than min-date', function(){
      $rootScope.date = moment(new Date(1973, 4, 7));
      $rootScope.minDate = moment(new Date(1973, 2, 1));
      var t = '<div date-picker="date" min-date="minDate"></div>';
      var el = compileAndDigest(t);
      el.find('table td span:first-child').triggerHandler('click');
      expect(el.find('.switch').text()).toBe('1973 March');
    });

    it('is set to disabled if its date is less than min-date', function(){
      $rootScope.date = moment(new Date(1973, 4, 7));
      $rootScope.minDate = moment(new Date(1973, 1, 1));
      var t = '<div date-picker="date" min-date="minDate"></div>';
      var el = compileAndDigest(t);
      expect(el.find('.disabled').text()).toBe('Jan');
    });

  });
});
