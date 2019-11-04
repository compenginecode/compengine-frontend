/**
 *  Category Controller Module
 *
 * @module modals/contribution-metadata-modal/controllers/category-controller
 * @memberof Controllers
 * @see Controllers
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");

    /** Local dependencies **/
    var AbstractController = require("./abstract-controller");

    /**
     * Define module
     *
     * @constructor
     */
    App.module("AdminSearchTimeseriesPage.SearchForm.Controllers", function(Module, Application, Backbone) {

        /** Define module controller **/
        Module.StaticDataController = Module.AbstractController.extend({

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
             *  Returns an object containing the values managed by this controller.
             *
             * @returns object
             */
            serialize: function(){
                return {
                    name: this.view.getTimeSeriesNameInputField().val(),
                    description: this.view.getDescriptionInputField().val()
                };
            },

            /**
             *  Used to handle errors that come from the server. The controller
             *  can decide if and how it wants to handle it locally. In this case,
             *  we want to handle errors of classification "ETimeSeriesNameInUse".
             *
             *  @return null
             *
             */
            handleServerFail: function(classification){
                // if ("ETimeSeriesNameInUse" === classification){
                //     this.view.getTimeSeriesNameInputField().siblings(".error-label-small")
                //         .text(this.STR_NAME_IN_USE)
                //         .show();
                // }
            },

            /**
             *  Returns true if the DOM has valid user-entered data, and false
             *  otherwise. Also controls UI rendering of states.
             *
             * @returns {boolean}
             */
            validate: function(){
                var $field = this.view.getTimeSeriesNameInputField();
                $field.siblings(".error-label-small").hide();

                return true;
            }

        });

    });

});