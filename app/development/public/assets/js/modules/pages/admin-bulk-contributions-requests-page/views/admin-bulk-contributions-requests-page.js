/**
 *  Admin Bulk Contribution Requests Page
 *
 * @module pages/admin-bulk-contributions-page
 * @memberof Pages
 * @see Pages
 */
define(function (require) {

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");
    var Radio = require("backbone.radio");

    /** Local dependencies **/
    var Footer = require("modules/common/views/footer/footer");
    var Navigation = require("modules/common/views/navigation/navigation");
    var NoDataView = require("modules/common/views/no-data/no-data");
    var BulkUploadRequestCollection = require("modules/common/models/bulk-upload-request-collection");
    var BulkUploadRequestRow = require("./bulk-upload-request-row");

    var Template = require("text!./admin-bulk-contributions-requests-page.html");

    /** Define module **/
    App.module("AdminBulkContributionRequests", function (Module, Application, Backbone) {

        /** Define module view **/
        Module.View = Backbone.Marionette.BossView.extend({

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
                table: "#bulk-upload-request-table",
                noData: "#bulk-upload-empty"
            },

            /**
             *  Listen to the events propagated from the subviews
             */
            subViewEvents: {
                "navigation render": "onXNavigationRender"
            },

            events: {
                'click [data-sort]': 'onClickSort',
                'input @ui.searchBox': 'onClickSearch'
            },

            ui: {
                'searchBox': '#search-box'
            },

            initialize: function (options) {
                var that = this;
                Backbone.Marionette.BossView.prototype.initialize.call(this, options);

                var collection = new App.Common.Models.BulkUploadRequestCollection();
                var deferred = collection.fetch();
                this._collection = collection;

                this.subViews.table = function () {
                    return new Backbone.Marionette.CollectionView({
                        tagName: "tbody",
                        childView: Module.BulkUploadRequestRow,
                        collection: collection
                    });
                };

                this.subViews.noData = function () {
                    return new App.NoData.View({
                        message: 'There are no new bulk contribution requests.'
                    });
                };

                deferred.done(function () {
                    if (collection.length === 0) {
                        that.$el.find("#bulk-upload-empty").show();
                    } else {
                        that.$el.find("#bulk-upload-empty").hide();
                        that.$el.find("#bulk-upload-request-table").show();
                    }
                });

                deferred.always(function () {
                    App.hidePageLoader();
                });

                this.tableChildRadio = Backbone.Radio.channel("bulkUploadRequest:childView");

                this.tableChildRadio.on("checkState", this.onXTableChildCheckState.bind(that))
            },

            /**
             *  Set active state on navigation once it has rendered.
             */
            onXNavigationRender: function () {
                this.navigation.setNavigationItemAsActive("admin-bulk-contribution-requests");
            },

            /**
             *  Returns a rendered template.
             *
             * @param serializedModel
             * @returns {Function}
             */
            template: function (serializedModel) {
                return _.template(Template, serializedModel);
            },

            templateHelpers: function () {
                return {
                    sortingBy: this._collection.searchMeta.get('sortByField'),
                    sortDirection: this._collection.searchMeta.get('sortByDirection'),
                    searchText: this._collection.searchMeta.get('searchText')
                }
            },

            /**
             * When one of the table's child views emit a "checkState" event, we'll check what state we should be in.
             */
            onXTableChildCheckState: function () {
                if (this._collection.length === 0) {
                    this.$el.find("#bulk-upload-request-table").hide();
                    this.$el.find("#bulk-upload-empty").show();
                } else {
                    this.$el.find("#bulk-upload-empty").hide();
                    this.$el.find("#bulk-upload-request-table").show();
                }
            },

            onClickSort: function (e) {
                var sortByField = $(e.target).data('sort');
                this._collection.sortByToggle(sortByField);
                this.render();
                this.onXTableChildCheckState();
            },

            onClickSearch: function () {
                var searchText = this.ui.searchBox.val();
                this._collection.search(searchText);
                this.table.render();
            },

        });

    });

});