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
