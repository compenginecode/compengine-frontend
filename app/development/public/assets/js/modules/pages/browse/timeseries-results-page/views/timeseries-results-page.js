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
    var SearchMeta = require("modules/pages/browse/views/search-meta");
    var TimeseriesCardList = require("./timeseries-card-list");
    var PaginationLinks = require("modules/common/views/pagination-links/pagination-links");
    var SearchingBy = require("./searching-by");
    var SearchAgain = require("./search-again");
    var SocialView = require("modules/common/views/social-view/social-view");

    /** Template **/
    var Template = require("text!./timeseries-results-page.html");

    /** Define module **/
    App.module("Browse.TimeseriesResultsPage", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.View = App.Common.Views.SocialView.View.extend({

            /**
             * Subviews
             */
            subViews: {
                footer: App.Common.Footer.View,
                navigation: App.Common.Navigation.View
            },

            /**
             * Containers for the sub views
             */
            subViewContainers: {
                footer: "#footer-container",
                navigation: "#navigation-container",
                searchMeta: ".results-description",
                paginationLinks: ".pagination-links",
                resultsList: "#results-list",
                searchingBy: ".browsing"
            },

            subViewEvents: {
                '* download-all-results': '__onDownloadAllResults',
                'resultsList render': 'onResultsListRender'
            },

            onResultsListRender: function(){
                this.$el.find('[data-role="download-region"]').toggle(this.options.resultsList.length > 0);
            },

            __onDownloadAllResults: function(format){
                var ids = this.resultsList.collection.toJSON().map(function(x){
                    return x.id;
                }); 

                var data = {
                    ids: ids,
                    mode: 'all',
                    type: format
                };

                $.ajax({
                    type: "POST",
                    url: App.apiEndpoint() + "/time-series/export/search-results",
                    data: data,
                    success: function(rawJSON){
                        var token = JSON.parse(rawJSON).token;
                        window.open(App.apiEndpoint() + "/time-series/export/search-results?token=" + token);
                    }
                });
            },

            /**
             * Custom social tags for this view
             *
             * @protected
             */
            socialTags: function () {
                tags = {};
                var resultsType = this.options.resultsList.searchMeta.get("searchingBy").type;

                // title
                tags["og:title"] = ("term" === resultsType) ? "Search Timeseries' on CompEngine" : "Browse CompEngine";

                // url
                tags["og:url"] = GLOBALS.appUrl + "/#!";
                tags["og:url"] += ("term" === resultsType) ? "search" : "browse";

                // description
                if ("term" !== resultsType) {
                    tags["og:description"] = "Browse by category, source and tag";
                }

                return tags;
            },

            initialize: function(options) {
                App.Common.Views.SocialView.View.prototype.initialize.call(this, options);

                this.configStore = new App.ConfigurationStore.Controller();

                this.subViews.searchMeta = function () {
                    return new App.Browse.SearchMeta({model: options.resultsList.searchMeta});
                };

                this.subViews.resultsList = function(){
                    return new Module.TimeseriesCardList({collection: options.resultsList});
                };

                this.subViews.paginationLinks = function () {
                    return new App.Common.PaginationLinks.View({model: options.resultsList.searchMeta});
                };

                this.subViews.searchingBy = function () {
                    if ("term" === options.resultsList.searchMeta.get("searchingBy").type) {
                        return new Module.SearchAgain({model: options.resultsList.searchMeta});
                    }
                    return new Module.SearchingBy({model: options.resultsList.searchMeta});
                }

                this.options = options;
            },

            template: function(serializedModel){
                return _.template(Template, serializedModel);
            },

            onRender: function() {
                var that = this;
                setTimeout(function(){
                    that.$el.find('[data-role="download-region"]').toggle(that.options.resultsList.length > 0);
                    App.hidePageLoader();
                }, 1000);
            }

        });

    });

});
