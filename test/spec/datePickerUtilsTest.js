describe('Test date Picker Utils', function(){
  var utils, constants, tz = 'UTC', firstDay = 0 //Sunday;

  /**
   * Creates a moment object from an iso8601 string, using a pre-set timezone.
   */
  function dateBuilder(iso8601) {
    return moment.tz(iso8601, tz);
  }

  var model = dateBuilder('2014-06-29T19:00:00+00:00'); // sunday

  beforeEach(angular.mock.module('datePicker'));

  beforeEach(angular.mock.inject(function($injector){
    utils = $injector.get('datePickerUtils');
    constants = $injector.get('datePickerConfig');
    utils.setParams(tz, firstDay);
  }));

  /*
   * At no point do we ever need to get minutes, weeks, years, months, or hours for an unknown date. 
   *    * The only date building util function which is called without a specific date is getDaysOfWeek.
   *        * This is called via the update() function in datePicker.js if scope.weekdays is falsy.
   *    * These tests have therefore been removed.
   */

  it('get visible mins provided date', function(){
    var start = dateBuilder('2014-06-29T19:00:00+00:00'); // sunday
    var end = dateBuilder('2014-06-29T19:55:00+00:00'); // sunday
    var chosen = dateBuilder('2014-06-29T19:00:00+00:00'); // sunday
    var mins = utils.getVisibleMinutes(chosen, constants.step);

    expect(mins).toBeDefined();
    expect(start.isSame(mins[0])).toBe(true);
    expect(end.isSame(mins[mins.length-1])).toBe(true);
  });

  it('get visible weeks provided date', function(){
    var start = dateBuilder('2014-05-25T00:00:00+00:00'); // sunday
    var end = dateBuilder('2014-07-05T00:00:00+00:00');  // saturday
    var chosen = dateBuilder('2014-06-29T19:00:00+00:00'); // sunday
    var weeks = utils.getVisibleWeeks(chosen, constants.step);

    expect(weeks).toBeDefined();
    expect(start.isSame(weeks[0][0])).toBe(true);
    expect(end.isSame(weeks[5][weeks[5].length - 1])).toBe(true);
  });

  it('get visible years provided date', function(){
    var start = dateBuilder('2010-01-01T00:00:00+00:00'); // friday
    var end = dateBuilder('2021-01-01T00:00:00+00:00'); // friday
    var chosen = dateBuilder('2014-06-29T19:00:00+00:00'); // sunday
    var years = utils.getVisibleYears(chosen, constants.step);
    expect(years).toBeDefined();
    expect(start.isSame(years[0])).toBe(true);
    expect(end.isSame(years[years.length - 1])).toBe(true);
  });

  it('get default days of week', function(){
    var days = utils.getDaysOfWeek(null);

    expect(days).toBeDefined();
  });

  it('get days of week provided date', function(){
    var start = dateBuilder('2014-05-26T00:00:00+00:00'); // monday
    var end = dateBuilder('2014-06-01T00:00:00+00:00'); // sunday
    var days = utils.getDaysOfWeek(start);

    expect(days).toBeDefined();
    expect(start.isSame(days[0])).toBe(true);
    expect(end.isSame(days[days.length-1])).toBe(true);
  });


  it('get default months provided date', function(){
    var start = dateBuilder('2014-01-01T00:00:00+00:00'); // wednesday
    var end = dateBuilder('2014-12-01T00:00:00+00:00'); // monday
    var chosen = dateBuilder('2014-06-29T19:00:00+00:00'); // sunday
    var months = utils.getVisibleMonths(chosen);

    expect(months).toBeDefined();
    expect(start.isSame(months[0])).toBe(true);
    expect(end.isSame(months[months.length-1])).toBe(true);
  });


  it('get default hours provided date', function(){
    var start = dateBuilder('2014-06-29T00:00:00+00:00'); // sunday
    var end = dateBuilder('2014-06-29T23:00:00+00:00'); // sunday
    var chosen = dateBuilder('2014-06-29T19:00:00+00:00'); // sunday
    var hours = utils.getVisibleHours(chosen);

    expect(hours).toBeDefined();
    expect(start.isSame(hours[0])).toBe(true);
    expect(end.isSame(hours[hours.length-1])).toBe(true);
  });

  it('model is after date', function(){
    // model is 19h, dateAfter is 20h, so model should be before and not after
    var dateAfter =  dateBuilder('2014-06-29T20:00:00+00:00'); // sunday

    expect(utils.isAfter(model, dateAfter)).toBe(false);
    expect(utils.isBefore(model, dateAfter)).toBe(true);
  });

  it('model is before date', function(){
    // model is 19h, dateAfter is 18h, so model should be after and not before
    var dateAfter =  dateBuilder('2014-06-29T18:00:00+00:00'); // sunday

    expect(utils.isAfter(model, dateAfter)).toBe(true);
    expect(utils.isBefore(model, dateAfter)).toBe(false);
  });

  it('model is almost same', function(){
    var dateSimilar =  dateBuilder('2014-06-29T19:00:55.555'); // sunday

    expect(utils.isSameYear(model, dateSimilar)).toBe(true);
    expect(utils.isSameMonth(model, dateSimilar)).toBe(true);
    expect(utils.isSameDay(model, dateSimilar)).toBe(true);
    expect(utils.isSameHour(model, dateSimilar)).toBe(true);
    expect(utils.isSameMinutes(model, dateSimilar)).toBe(true);
  });

  //it('angular date format is a moment format', function () {
  //  //Angular formats: https://docs.angularjs.org/api/ng/filter/date
  //  //Moment formats: http://momentjs.com/docs/#/parsing/string-format/
  //  expect(utils.toMomentFormat('dd-MM-yyyy')).toBe('DD-MM-YYYY');
  //  expect(utils.toMomentFormat('EEEE MM/yy')).toBe('dddd MM/YY');
  //  expect(utils.toMomentFormat('dd MMMM yyyy HH:mm:ss.sss')).toBe('DD MMMM YYYY HH:mm:ss.SSS');
  //});
});
