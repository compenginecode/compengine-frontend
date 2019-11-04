/**
 * Base page test
 */
define(function(require) {
    /** Require core backbone dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");
    var BossView = require("bossview");
    var jQuery = require("jquery");


    /** Required Testing Utilities **/
    var SinonJS = require("libs/managed/sinon/lib/sinon");

    /** View Dependencies **/
    var Typed = require("typed");
    var Modals = require("modals");

    /** View **/
    var BaseView = require("modules/pages/landing-page/views/landing-page");

    /**
     * Marionette Unit Testing
     */
    describe("Marionette Unit test", function() {
        /** stub the globals **/
        window.GLOBAL = {
            "statisticsMessages": [
                "12 billion data points",
                "6 million time series",
                "100k page hits"
            ],
            "version":"0.3.0",
            "settings":{
                "comparisonResultTimeout":86400000,
                "hardFileSizeLimit":500,
                "supportedFileExtensions":[
                    ".csv",
                    ".xlsx",
                    ".xls",
                    ".txt",
                    ".dat",
                    ".wav",
                    ".mp3"
                ]
            }
        };

        // inject the HTML fixture for the tests
        beforeEach(function() {
            var app = "<div class='app'></div>";

            document.body.insertAdjacentHTML("afterbegin", app);
        });

        it("App should have been started already", function(done) {

            expect(App).toBeTruthy();

            done();
        });

        /**
         * It should instantiate the Landing Page Module
         */
        describe("Instantiate Landing Page View", function () {
            /**
             * Initialize the view for the tests
             *
             * @type {Marionette.BossView}
             */
            var landingPageView = new App.LandingPage.View();
            var view = landingPageView.render();

            /**
             * It should have rendered the view
             */
            it("Should have rendered the Landing Page View", function(done) {
                expect(landingPageView.isRendered).toBe(true);

                done();
            });

            /**
             * Typed.js should be accessible
             */
            it("Typed.js should be accessible", function(done) {
                var $typed = landingPageView.$el.find(".typed");

                expect($typed.typed).toBeTruthy();


                done();
            });

        });
    });
});