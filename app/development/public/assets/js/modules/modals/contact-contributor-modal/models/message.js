/**
 *  Abstract Controller
 *
 * @module modals/contact-contributor-modal/models/message
 * @memberof Models
 * @see Models
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");

    /**
     * Define module
     *
     * @constructor
     */
    App.module("Modals.ContactContributor.Models", function(Module, Application, Backbone) {

        /** Define module controller **/
        Module.Message = Backbone.Model.extend({

            /**
             *  Returns the root URL for this resource.
             *
             * @returns {string}
             */
            urlRoot: function(){
                return App.apiEndpoint() + "/contributors";
            },

            url: function () {
                return this.urlRoot() + "/" + this.get("contributorId") + "/contact";
            }

        });

    });

});