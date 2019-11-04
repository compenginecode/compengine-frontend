/**
 *  Results page
 *
 * @module pages/results-page
 * @memberof Pages
 * @see Pages
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");
    var Radio = require("backbone.radio");

    /** Local dependencies **/
    var ConfigurationStore = require("modules/common/controllers/configuration-store");
    var Footer = require("modules/common/views/footer/footer");
    var Navigation = require("modules/common/views/navigation/navigation");

    /** HTML template **/
    var Template = require("text!./nodata-page.html");

    /** Define module **/
    App.module("VisualizePage", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.NoDataView = Marionette.BossView.extend({

            events: {
                "click #upload-data-button": "onUploadDataButtonClick"
            },

            /**
             *  Subviews
             *
             * @protected
             */
            subViews: {
                footer: App.Common.Footer.View,
                navigation: App.Common.Navigation.View
            },

            /**
             *  Containers for the sub views
             *
             * @protected
             */
            subViewContainers: {
                footer: "#footer-container",
                navigation: "#navigation-container"
            },

            /**
             *  Called on render.
             *
             * @protected
             */
            onRender: function() {
                App.hidePageLoader();
            },

            /**
             *  Returns a rendered template.
             *
             * @param serializedModel
             * @returns {Function}
             * @protected
             */
            template: function(serializedModel){
                return _.template(Template, serializedModel);
            },

            /**
             *  When the upload data button is clicked, we want to navigate home.
             *
             * @param e {Event}
             */
            onUploadDataButtonClick: function(e){
                App.router.navigate("/#!", {
                    trigger: true
                });
            }

        });

    });

});