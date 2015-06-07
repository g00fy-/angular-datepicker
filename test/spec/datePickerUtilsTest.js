describe('Test date Picker Utils', function(){
  var utils, constants;

  var model = new Date('2014-06-29T19:00:00.000Z'); // sunday

  beforeEach(angular.mock.module('datePicker'));

  beforeEach(angular.mock.inject(function($injector){
    utils = $injector.get('datePickerUtils');
    constants = $injector.get('datePickerConfig');
  }));

  it('get default visible minutes', function(){
    var mins = utils.getVisibleMinutes(null, constants.step);

    expect(mins).toBeDefined();
  });

  it('get visible mins provided date', function(){
    var start = new Date('2014-06-29T19:00:00.000Z'); // sunday
    var end = new Date('2014-06-29T19:55:00.000Z'); // sunday
    var mins = utils.getVisibleMinutes(start, constants.step);

    expect(mins).toBeDefined();
    expect(mins[0]).toEqual(start);
    expect(mins[mins.length-1]).toEqual(end);
  });

  it('get default visible weeks', function(){
    var weeks = utils.getVisibleWeeks(null, constants.step);

    expect(weeks).toBeDefined();
  });

  it('get visible weeks provided date', function(){
    var start = new Date('2014-05-26T00:00:00.000Z'); // monday
    var end = new Date('2014-07-06T00:00:00.000Z');  // sunday
    var chosen = new Date('2014-06-29T19:00:00.000Z'); // sunday
    var weeks = utils.getVisibleWeeks(chosen, constants.step);

    expect(weeks).toBeDefined();
    expect(weeks[0][0]).toEqual(start);
    expect(weeks[5][weeks[5].length-1]).toEqual(end);
  });

  it('get default visible years', function(){
    var years = utils.getVisibleYears(null, constants.step);

    expect(years).toBeDefined();
  });

  it('get visible years provided date', function(){
    var start = new Date('2009-01-01T00:00:00.000Z'); // thursday
    var end = new Date('2020-01-01T00:00:00.000Z'); // wednesday
    var chosen = new Date('2014-06-29T19:00:00.000Z'); // sunday
    var years = utils.getVisibleYears(chosen, constants.step);

    expect(years).toBeDefined();
    expect(years[0]).toEqual(start);
    expect(years[years.length-1]).toEqual(end);
  });

  it('get default days of week', function(){
    var days = utils.getDaysOfWeek(null);

    expect(days).toBeDefined();
  });

  it('get days of week provided date', function(){
    var start = new Date('2014-05-26T00:00:00.000Z'); // monday
    var end = new Date('2014-06-01T00:00:00.000Z'); // sunday
    var days = utils.getDaysOfWeek(start);

    expect(days).toBeDefined();
    expect(days[0]).toEqual(start);
    expect(days[days.length-1]).toEqual(end);
  });

  it('get default months', function(){
    var months = utils.getVisibleMonths(null);

    expect(months).toBeDefined();
  });

  it('get default months provided date', function(){
    var start = new Date('2014-01-01T00:00:00.000Z'); // wednesday
    var end = new Date('2014-12-01T00:00:00.000Z'); // monday
    var chosen = new Date('2014-06-29T19:00:00.000Z'); // sunday
    var months = utils.getVisibleMonths(chosen);

    expect(months).toBeDefined();
    expect(months[0]).toEqual(start);
    expect(months[months.length-1]).toEqual(end);
  });

  it('get default hours', function(){
    var hours = utils.getVisibleHours(null);

    expect(hours).toBeDefined();
  });

  it('get default hours provided date', function(){
    var start = new Date('2014-06-29T00:00:00.000Z'); // sunday
    var end = new Date('2014-06-29T23:00:00.000Z'); // sunday
    var chosen = new Date('2014-06-29T19:00:00.000Z'); // sunday
    var hours = utils.getVisibleHours(chosen);

    expect(hours).toBeDefined();
    expect(hours[0]).toEqual(start);
    expect(hours[hours.length-1]).toEqual(end);
  });

  it('model is after date', function(){
    // model is 19h, dateAfter is 20h, so model should be before and not after
    var dateAfter =  new Date('2014-06-29T20:00:00.000Z'); // sunday

    expect(utils.isAfter(model, dateAfter)).toBe(false);
    expect(utils.isBefore(model, dateAfter)).toBe(true);
  });

  it('model is before date', function(){
    // model is 19h, dateAfter is 18h, so model should be after and not before
    var dateAfter =  new Date('2014-06-29T18:00:00.000Z'); // sunday

    expect(utils.isAfter(model, dateAfter)).toBe(true);
    expect(utils.isBefore(model, dateAfter)).toBe(false);
  });

  it('model is almost same', function(){
    var dateSimilar =  new Date('2014-06-29T19:00:55.555Z'); // sunday

    expect(utils.isSameYear(model, dateSimilar)).toBe(true);
    expect(utils.isSameMonth(model, dateSimilar)).toBe(true);
    expect(utils.isSameDay(model, dateSimilar)).toBe(true);
    expect(utils.isSameHour(model, dateSimilar)).toBe(true);
    expect(utils.isSameMinutes(model, dateSimilar)).toBe(true);
  });
});