define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");

    /** Module definition **/
    App.module("AdminDiagnosticsPage", function(Module, Application, Backbone){

        /** Define model **/
        Module.DiagnosticsModel = Backbone.Model.extend({

            defaults: {
                processes: [],
                centralMeasures: {
                    percentiles: {},
                    histograms: []
                },
                jobs: []
            },

            /**
             *  Returns the root URL for this resource.
             *
             * @returns {string}
             */
            urlRoot: function(){
                return App.apiEndpoint() + "/admin/diagnostics";
            }

        });

    });

});