/**
 *  Error Page
 *
 * @module pages/error-page
 * @memberof Pages
 * @see Pages
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var Footer = require("modules/common/views/footer/footer");
    var Navigation = require("modules/common/views/navigation/navigation");

    var Template = require("text!./error-page.html");

    /** Define module **/
    App.module("ErrorPage", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.View = Backbone.Marionette.BossView.extend({

            errorMessage: "Something went wrong and we were unable to load the page.",

            /**
             *  Subviews
             */
            subViews: {
                footer: App.Common.Footer.View,
                navigation: App.Common.Navigation.View
            },

            /**
             *  Containers for the sub views
             */
            subViewContainers: {
                footer: "#footer-container",
                navigation: "#navigation-container"
            },

            ui: {
                "message": "#message"
            },

            templateHelpers: function () {
                var that = this;
                return {
                    "message": that.errorMessage
                }
            },

            /**
             *  On initialization, we'll setup a Configuration controller & listen to the navigation radio channel.
             */
            initialize: function(options) {
                this.errorMessage = options.message ? options.message : this.errorMessage;
                this.navigationChannel = Backbone.Radio.channel("navigation");
            },

            onRender: function () {
                App.hidePageLoader();
            },

            /**
             *  Returns a rendered template.
             *
             * @param serializedModel
             * @returns {Function}
             */
            template: function(serializedModel){
                return _.template(Template, serializedModel);
            }
        });

    });

});