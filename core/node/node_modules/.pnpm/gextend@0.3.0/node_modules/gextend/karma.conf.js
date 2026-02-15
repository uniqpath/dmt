// Karma configuration
// Generated on Fri Jul 05 2013 01:57:57 GMT-0400 (EDT)
/*global basePath:true, exclude:true, reporters:true, files:true*/
/*global coverageReporter:true, junitReporter:true, reporters:true,
preprocessors:true, frameworks:true*/
/*global port:true, runnerPort:true, colors:true, logLevel:true*/
/*global autoWatch:true, browsers:true, captureTimeout:true, singleRun:true*/
/*global JASMINE:true, JASMINE_ADAPTER:true, REQUIRE:true, REQUIRE_ADAPTER:true*/
/*global LOG_INFO:true*/
module.exports = function(config) {
    config.set({

        // base path, that will be used to resolve files and exclude
        // basePath: 'tmp/public',
        basePath: '',

        // list of files / patterns to load in the browser
        files: [{
                pattern: 'lib/jquery/jquery.js',
                included: false
            }, {
                pattern: 'lib/requirejs/require.js',
                included: false
            }, {
                pattern: 'src/*.js',
                included: false
            }, {
                pattern: 'test/spec/*-spec.js',
                included: false
            },

            // helpers & fixtures for jasmine-jquery
            {
                pattern: 'test/helpers/*.js',
                included: true
            },
            'test/test-main.js',
        ],

        frameworks: ['jasmine', 'requirejs'],

        plugins: [
            'karma-qunit',
            'karma-jasmine',
            'karma-requirejs',
            'karma-coverage',
            'karma-phantomjs-launcher',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-safari-launcher'
        ],

        preprocessors: {
            '**/src/*.js': 'coverage'
        },

        // list of files to exclude
        exclude: [],

        // test results reporter to use
        // possible values: 'dots', 'progress', 'junit'
        reporters: 'coverage',

        coverageReporter: {
            type: ['text'],
            dir: '.coverage/'
            // type: 'cobertura',
            // dir: 'coverage/',
            // file: 'coverage.xml'
        },

        // web server port
        port: 9876,

        // cli runner port
        runnerPort: 9100,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_DISABLE,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['Chrome'],

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 60000,

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false
    });
};