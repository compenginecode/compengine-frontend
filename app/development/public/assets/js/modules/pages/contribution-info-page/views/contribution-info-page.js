/**
 *  Contribution Information Page
 *
 * @module pages/contribution-info-page
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
    var SocialView = require("modules/common/views/social-view/social-view");
    var BulkContributionModal = require("modules/modals/bulk-contribution-modal/modal");

    var Template = require("text!./contribution-info-page.html");

    /** Define module **/
    App.module("ContributionInfoPage", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.View = App.Common.Views.SocialView.View.extend({

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

            /**
             *  Listen to the events propagated from the subviews
             */
            subViewEvents: {
                "navigation render": "onXNavigationRender"
            },

            /**
             * Custom social tags for this view
             *
             * @protected
             */
            socialTags: {
                "og:title": "You can contribute to CompEngine"
            },

            events: {
                "click #bulk-contribute": "onBulkContributionClick"
            },

            /**
             *  Set active state on navigation once it has rendered.
             */
            onXNavigationRender: function() {
                this.navigation.setNavigationItemAsActive("contribution-info");
            },

            /**
             *  Returns a rendered template.
             *
             * @param serializedModel
             * @returns {Function}
             */
            template: function(serializedModel){
                return _.template(Template, serializedModel);
            },

            onRender: function(){
                App.hidePageLoader();
            },

            /**
             * When the user clicks the "Bulk Contribute" link, we'll open the bulk contribution modal.
             *
             * @param e {Event} The click event
             */
            onBulkContributionClick: function(e) {
                e.preventDefault();
                e.currentTarget.blur();
                var modal = new App.Modals.BulkContribution.Modal();
                App.showModal(modal);
            }

        });

    });

});