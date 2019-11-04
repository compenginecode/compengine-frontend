/**
 *  Browse Page
 *
 * @module pages/browse/browse-page
 * @memberof Browse
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
    var Navigation = require("modules/common/views/navigation/navigation");
    var BrowseSelector = require("modules/pages/browse/views/browse-selector");
    var SearchMeta = require("modules/pages/browse/views/search-meta");
    var SourceCard = require("./source-card");
    var SourceCardList = require("./source-card-list");
    var SocialView = require("modules/common/views/social-view/social-view");

    /** Template **/
    var Template = require("text!./browse-source-page.html");

    /** Define module **/
    App.module("Browse.BrowseSourcePage", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.View = App.Common.Views.SocialView.View.extend({

            /**
             * Subviews
             */
            subViews: {
                footer: App.Common.Footer.View,
                navigation: App.Common.Navigation.View,
                browseSelector: function () {
                    return new App.Browse.BrowseSelector({page: "source"});
                }
            },

            /**
             * Containers for the sub views
             */
            subViewContainers: {
                footer: "#footer-container",
                navigation: "#navigation-container",
                browseSelector: "#browse-selector-container",
                searchMeta: ".results-description",
                resultsList: "#results-list"
            },

            /**
             * Custom social tags for this view
             *
             * @protected
             */
            socialTags: {
                "og:title": "Browse CompEngine",
                "og:description": "Browse by category, source and tag"
            },

            initialize: function(options) {
                App.Common.Views.SocialView.View.prototype.initialize.call(this, options);

                this.configStore = new App.ConfigurationStore.Controller();

                this.subViews.searchMeta = function () {
                    return new App.Browse.SearchMeta({model: options.resultsList.searchMeta});
                };

                this.subViews.resultsList = function(){
                    return new Module.SourceCardList({collection: options.resultsList});
                };
            },

            template: function(serializedModel){
                return _.template(Template, serializedModel);
            },

            onRender: function() {
                App.hidePageLoader();
            }

        });

    });

});