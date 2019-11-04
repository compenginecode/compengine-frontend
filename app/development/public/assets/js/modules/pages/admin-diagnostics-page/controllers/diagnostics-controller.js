define(function(require) {

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Module definition **/
    App.module("AdminDiagnosticsPage", function(Module, Application, Backbone) {

        /** Define controller **/
        Module.DiagnosticsController = Marionette.Object.extend({

            /**
             *  Initialization
             *
             * @param options
             */
            initialize: function(options) {
                this.model = options.model;

                /**
                 * Not ideal, but we save a reference to the view on initialize.
                 */
                this.view = options.view;
            },

            /**
             *  Checks the server for the diagnostics information and then returns what it got.
             *
             *  Ideally, this controller would also support diffing the results, but that may require more
             *  computation than it would save.
             *
             * @fires view:newDiagnosticValues {Object}
             */
            checkServerForUpdatedDiagnostics: function() {
                var that = this;

                var deferred = that.model.fetch();

                deferred.done(function() {
                    /** Trigger an event so nothing is blocked by this. **/
                    that.trigger("newDiagnosticValues");
                });
            },

            /**
             * Polling registrar.
             *
             * Should use Web Workers so this doesn't affect the DOM.
             *
             * @param name
             */
            registerPolling: function(name) {
                var that = this;

                /** We fire the first one, then set an interval after **/
                that.checkServerForUpdatedDiagnostics();

                window.setInterval(function() {
                    that.checkServerForUpdatedDiagnostics.apply(that);
                }, 5000);
            }

        });

    });

});