/**
 *  Contributor controller
 *
 * @module modals/contribution-metadata-modal/controllers/contributor-controller
 * @memberof Controllers
 * @see Controllers
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");

    /** Local dependencies **/
    var AbstractController = require("./abstract-controller");
    var jQueryUI = require("jquery-ui");

    /**
     * Define module
     *
     * @constructor
     */
    App.module("AdminSearchTimeseriesPage.SearchForm.Controllers", function(Module, Application, Backbone) {

        /** Define module controller **/
        Module.ContributorController = Module.AbstractController.extend({

            /**
             *  Initialization
             *
             * @param view {ManagedView} A view object for accessing methods inside the parent.
             */
            initialize: function(view){
                this.view = view;
            },

            bindToView: function(){},

            /**
             *  Returns true if the DOM has valid user-entered data, and false
             *  otherwise. Also controls UI rendering of states.
             *
             * @returns {boolean}
             */
            validate: function(){
                var nameState = this.__validateName();

                return nameState;
            },

            /**
             *  Returns an object containing the values managed by this controller.
             *
             * @returns object
             */
            serialize: function(){
                return {
                    contributor: this.view.getContributorInformationName().val()
                };
            },

            /**
             *  Validates the contributor's name. Returns true if valid, and false otherwise.
             *
             * @returns {boolean}
             * @private
             */
            __validateName: function(){
                /** Always reset in case their intentions have changed **/
                var $nameField = this.view.getContributorInformationName();
                $nameField.siblings(".error-label-small").hide();

                return true;
            }

        });

    });

});