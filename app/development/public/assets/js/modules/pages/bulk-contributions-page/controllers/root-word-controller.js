/**
 *  Root Word Controller Module
 *
 * @module bulk-contributions/controllers
 * @memberof Controllers
 * @see Controllers
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");

    /** Local dependencies **/
    var AbstractController = require("modules/modals/contribution-metadata-modal/controllers/abstract-controller");

    /**
     * Define module
     *
     * @constructor
     */
    App.module("BulkContributions.Controllers", function(Module) {

        /** Define module controller **/
        Module.RootWordController = App.Modals.ContributionMetadata.Controllers.AbstractController.extend({
            initialize: function(view){
                this.view = view;
            },
            serialize: function () {
                return {
                    rootWord: this.view.getTimeSeriesNameInputField().val()
                }
            },
            bindToView: function() {

            }
        });

    });

});