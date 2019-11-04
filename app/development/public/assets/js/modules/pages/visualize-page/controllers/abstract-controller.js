/**
 *  Abstract Controller
 *
 * @module modules/pages/results-page/controllers/abstract-controller
 * @memberof Controllers
 * @see Controllers
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");

    /** Local dependencies **/
    var jQueryUI = require("jquery-ui");

    /**
     * Define module
     *
     * @constructor
     */
    App.module("VisualizePage.Controllers", function(Module, Application, Backbone) {

        /** Define module controller **/
        Module.AbstractController = Marionette.Object.extend({

            /**
             *  Returns an object containing the values managed by this controller.
             *
             * @returns object
             */
            serialize: function(){
                return {};
            },

            /**
             *  Returns true if the DOM has valid user-entered data, and false
             *  otherwise. Also controls UI rendering of states.
             *
             * @returns {boolean}
             */
            validate: function(){
                return true;
            },

            /**
             *  Used to handle errors that come from the server. The controller
             *  can decide if and how it wants to handle it locally.
             *
             *  @return null
             *
             */
            handleServerFail: function(classification){
                return null;
            }

        });

    });

});