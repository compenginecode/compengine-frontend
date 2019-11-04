"use strict";

define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var Footer = require("modules/common/views/footer/footer");
    var Navigation = require("modules/common/views/navigation/navigation");
    var ContributorCollection = require("../models/contributor-collection");
    var ContributorRow = require("./contributor-row");
    var Contributor = require("../models/contributor");

    var Template = require("text!./admin-contributors-page.html");

    /** Define module **/
    App.module("AdminContributorsPage", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.View = Backbone.Marionette.BossView.extend({

            DEFAULT_ERROR_TEXT: "Uh oh! That didn't work :(",

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
                navigation: "#navigation-container",
                table: "#contributors-table"
            },

            events: {
                'click [data-sort]': 'onClickSort',
                'input @ui.searchBox': 'onClickSearch'
            },

            /**
             *  Listen to the events propagated from the subviews
             */
            subViewEvents: {
                "navigation render": "onXNavigationRender"
            },

            ui: {
                'searchBox': '#search-box'
            },

            initialize: function (options) {
                Backbone.Marionette.BossView.prototype.initialize.call(this, options);
                var that = this;

                this.subViews.table = function () {
                    return new Backbone.Marionette.CollectionView({
                        tagName: "tbody",
                        childView: Module.ContributorRow,
                        collection: that.collection
                    });
                };
            },

            /**
             *  Set active state on navigation once it has rendered.
             */
            onXNavigationRender: function() {
                this.navigation.setNavigationItemAsActive("admin-contributors");
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

            templateHelpers: function () {
                return {
                    sortingBy: this.collection.searchMeta.get('sortByField'),
                    sortDirection: this.collection.searchMeta.get('sortByDirection'),
                    searchText: this.collection.searchMeta.get('searchText')
                }
            },

            /**
             * When the DOM is finished painting, we will hide the loader.
             */
            onRender: function(){
                App.hidePageLoader();
            },

            onClickSort: function (e) {
                var sortByField = $(e.target).data('sort');
                this.collection.sortByToggle(sortByField);
                this.render();
            },

            onClickSearch: function () {
                var searchText = this.ui.searchBox.val();
                this.collection.search(searchText);
                this.table.render();
            }

        });

    });

});
