/**
 * Karma Configuration File
 *
 * Karma is used for code coverage reporting
 *
 * @author Jake Jarrett <jake@vokke.com.au>
 * @param config {Object} Config object
 */
module.exports = function(config) {
    config.set({
        /**
         * Base Path used to resolve all inclusion & exclusions
         *
         * The root directory you want everything to originate from (EG/ ~/dev/someSite/superlongDir/)
         */
        basePath: "../../",


        /**
         * Frameworks to use
         *
         * Suggested
         *      Jasmine
         *      RequireJS
         *
         * @see https://npmjs.org/browse/keyword/karma-adapter
         */
        frameworks: ["jasmine", "requirejs"],

        /**
         * List of files to load (or serve) for the tests
         *
         * @param pattern   {String}    (Default Value: "")
         * @param included  {Boolean}   (Default Value: true)
         * @param server    (Boolean}   (Default Value: true)
         */
        files: [
            "test/config/karma.rjs.js",
            {
                pattern: "modules/**",
                included: false
            },
            {
                pattern: "app/**",
                included: false
            },
            {
                pattern: "libs/**",
                included: false
            },
            {
                pattern: "test/**",
                included: false
            },
            {
                pattern: "test/specs/*.spec.js",
                included: false
            }
        ],

        /**
         * List of files to exclude
         */
        exclude: [],

        /**
         * Preprocessors
         *
         * @see https://npmjs.org/browse/keyword/karma-preprocessor
         */
        preprocessors: {
            "app/*.js": ["coverage"],
            "modules/**/**/**/**.js": ["coverage"]
        },

        /**
         * Test Results reporter
         *
         * Possible Values
         *      coverage
         *      dots
         *      progress
         *
         * @see https://npmjs.org/browse/keyword/karma-reporter
         */
        reporters: ["progress", "coverage"],

        /**
         * Web Server port,
         *
         * Recommended to keep as default (9876)
         */
        port: 9876,

        /**
         * Colour Outputs for reporter & Logs
         *
         * True/False
         */
        colors: true,

        /**
         * level of logging
         *  possible values
         *      config.LOG_DISABLE
         *      config.LOG_ERROR
         *      config.LOG_WARN
         *      config.LOG_INFO
         *      config.LOG_DEBUG
         */
        logLevel: config.LOG_INFO,


        /**
         * Auto Watch / Live Reload for Unit Tests
         *
         * enable or disable AutoWatch / Live Reload
         */
        autoWatch: true,

        /**
         * Start these browsers
         *
         * Suggested Browsers
         *      Chrome
         *      Firefox
         *      PhantomJS
         *
         * @see https://npmjs.org/browse/keyword/karma-launcher
         */
        browsers: ["Chrome"],

        /**
         * Continuous Integration mode
         *
         * If true, Karma will start a browser, Run the tests once and then exit.
         */
        singleRun: true,

        /**
         * Concurrency level
         *
         * how many browser should be started simultaneous
         */
        concurrency: Infinity,

        /**
         * Configure Coverage
         *
         * We'll put our coverage folder in development/coverage/
         */
        coverageReporter: {
            dir: "../../../coverage/",
            reporters: [
                {type: "html", subdir: "html"},
                {type: "lcovonly", subdir: "lcov"},
                {type: "cobertura", subdir: "cobertura"}
            ]
        }

    });
};