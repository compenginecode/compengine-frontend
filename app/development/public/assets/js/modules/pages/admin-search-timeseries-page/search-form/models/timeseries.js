/**
 *  Abstract Controller
 *
 * @module modals/contribution-metadata-modal/controllers/abstract-controller
 * @memberof Controllers
 * @see Controllers
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");

    /**
     * Define module
     *
     * @constructor
     */
    App.module("Modals.ContributionMetadata.Models", function(Module, Application, Backbone) {

        /** Define module controller **/
        Module.TimeSeries = Backbone.Model.extend({

            /**
             *  Returns the root URL for this resource.
             *
             * @returns {string}
             */
            urlRoot: function(){
                return App.apiEndpoint() + "/timeseries";
            }

        });

    });

});