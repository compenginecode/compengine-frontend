/**
 *  About Page
 *
 * @module pages/about
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
    var ConfigurationStore = require("modules/common/controllers/configuration-store");
    var Footer = require("modules/common/views/footer/footer");
    var Modals = require("modals");
    var Navigation = require("modules/common/views/navigation/navigation");
    var Infographic = require("modules/common/views/infographic/index");
    var Typed = require("typed");

    /** Template **/
    var Template = require("text!./the-research.html");

    /** Define module **/
    App.module("ThePublicAPIPage", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.View = Backbone.Marionette.BossView.extend({

            /**
             * Subviews
             */
            subViews: {
                footer: App.Common.Footer.View,
                navigation: App.Common.Navigation.View,
                infographic: App.Common.Infographic.View
            },

            /**
             * Containers for the sub views
             */
            subViewContainers: {
                footer: "#footer-container",
                navigation: "#navigation-container",
                infographic: "[data-region='infographic']"
            },

            /**
             * On initialization, we'll setup a Configuration controller.
             */
            initialize: function() {
                this.configStore = new App.ConfigurationStore.Controller();
            },

            onRender: function () {
                if (this.options.anchor) {
                    var anchorElement = this.$el.find('#' + this.options.anchor);
                    if (anchorElement.length) {
                        var navHeight = 70;
                        setTimeout(function () {
                            var scrollTo = anchorElement.offset().top - navHeight;
                            setTimeout(function () {
                                $(document).scrollTop(scrollTo);
                            }, 16);
                        }, 16);
                    }
                }
                App.hidePageLoader();
            },

            /**
             * Returns a rendered template.
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