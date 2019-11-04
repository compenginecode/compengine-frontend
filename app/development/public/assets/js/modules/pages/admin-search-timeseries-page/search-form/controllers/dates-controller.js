/**
 *  Dates Controller Module
 *
 * @module modals/contribution-metadata-modal/controllers/source-controller
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
        Module.DatesController = Module.AbstractController.extend({

            /** String literals **/
            INVALID_DATE: "Please enter a valid date or leave blank",

            /**
             *  Initialization
             *
             * @param view {ManagedView} A view object for accessing methods inside the parent.
             */
            initialize: function(view){
                this.view = view;
            },

            bindToView: function(){
                var that = this;

                this.view.getStartDateInputField().datepicker({"dateFormat": "yy-mm-dd"});
                this.view.getEndDateInputField().datepicker({"dateFormat": "yy-mm-dd"});
            },

            /**
             *  Returns the user-entered values managed by this controller in a
             *  object.
             *
             * @returns {{endDate: String, startDate: String}}
             */
            serialize: function(){
                return {
                    startDate: this.view.getStartDateInputField().val(),
                    endDate: this.view.getEndDateInputField().val()
                };
            },

            /**
             *  Returns true if the DOM has valid user-entered data, and false
             *  otherwise. Also controls UI rendering of states.
             *
             * @returns {boolean}
             */
            validate: function(){
                var $field = this.view.getSourcesInputField();
                $field.siblings(".error-label-small").hide();

                if ($field.val().length > 0 && "" === $field.val().trim()){
                    $field.siblings(".error-label-small").text(this.STR_FIELD_ONLY_SPACES).show();

                    return false;
                }

                return true;
            }

        });

    });

});