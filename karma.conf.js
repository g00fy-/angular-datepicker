module.exports = function (config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath : '',

    // list of files / patterns to load in the browser
    files: ['app/components/angular/angular.js', 'app/components/angular-mocks/angular-mocks.js', 'app/components/moment/moment.js', 'app/components/moment-timezone/builds/moment-timezone-with-data.js', 'app/scripts/*.js', 'app/scripts/**/*.js', 'test/mock/**/*.js', 'test/spec/**/*.js'],

    // list of files to exclude
    exclude : [

    ],

    preprocessors : {

    },

    proxies : {

    },

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters : [ 'progress' ],

    // web server port
    port : 8080,

    // enable / disable colors in the output (reporters and logs)
    colors : true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR ||
    // config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel : config.LOG_INFO,

    autoWatch : true,

    // frameworks to use
    frameworks : [ 'jasmine' ],

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers : [ 'Chrome' ],

    plugins : [ 'karma-chrome-launcher', 'karma-firefox-launcher', 'karma-script-launcher', 'karma-phantomjs-launcher', 'karma-jasmine' ],

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout : 5000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun : false
  });
};
