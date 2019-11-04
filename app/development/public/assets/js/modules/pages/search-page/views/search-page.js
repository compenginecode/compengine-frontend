/**
 * Search page
 *
 * @module pages/search-page
 * @memberof Pages
 * @see Pages
 */
define(function(require) {

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");
    var Radio = require("backbone.radio");

    /** Local dependencies **/
    var Footer = require("modules/common/views/footer/footer");
    var Navigation = require("modules/common/views/navigation/navigation");
    var SocialView = require("modules/common/views/social-view/social-view");

    /** HTML template **/
    var SearchInput = require("text!./search-input.html");
    var SearchResults = require("text!./search-results.html");
    var Template = require("text!./search-page.html");

    /** Module definition **/
    App.module("SearchPage", function(Module, Application, Backbone) {

        /** Module **/
        Module.View = App.Common.Views.SocialView.View.extend({

            /**
             * Subviews
             *
             * @protected
             */
            subViews: {
                footer: App.Common.Footer.View,
                navigation: App.Common.Navigation.View
            },

            /**
             * Containers for the sub views
             *
             * @protected
             */
            subViewContainers: {
                footer: "#footer-container",
                navigation: "#navigation-container"
            },

            /**
             * Custom social tags for this view
             *
             * @protected
             */
            socialTags: {
                "og:title": "Search Timeseries' on CompEngine"
            },

            /**
             * Render the template
             *
             * @param serializedModel {Object} The serialized model
             * @returns {string} Stringified version of the rendered template
             */
            template: function(serializedModel) {
                return _.template(Template)(serializedModel);
            },

            /**
             * Determine which view to show.
             *
             * @method determineView
             * @return {string} The string name of what template to show
             */
            determineView: function() {
                var toReturn = SearchInput;

                if (undefined !== this.options.query) {
                    toReturn = SearchResults;
                }

                return toReturn;
            },

            /**
             * Get the data for a given state of the page.
             *
             * @return {Object} The data object
             */
            getData: function() {
                var that = this;
                return {
                    /**
                     * Get the query
                     */
                    query: function() {
                        var query = that.options.query;

                        return query.split("-").join(" ");
                    }
                };
            },

            initialize: function(options) {
                App.Common.Views.SocialView.View.prototype.initialize.call(this, options);

                var view = this.determineView();
                var data = this.getData();
                this.view = _.template(view)(data);
            },

            /**
             * When the page has rendered, hide the loader
             */
            onRender: function() {
                this.$el.find("#container").html(this.view);

                this.$el.find("form").submit(function (e) {
                    if (query = $(this).find("input").val()) {
                        window.location = "/#!search/" + query;
                    }
                    e.preventDefault();
                });

                App.hidePageLoader();
            }

        });

    });

});
