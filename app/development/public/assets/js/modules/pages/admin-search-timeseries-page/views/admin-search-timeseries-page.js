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
    var SearchTimeseriesCollection = require("../models/search-timeseries-collection");
    var SearchTimeseriesRow = require("./search-timeseries-row");
    var PaginationLinks = require("modules/common/views/pagination-links/pagination-links");
    var SearchForm = require("../search-form/search-form");
    var NoDataView = require("modules/common/views/no-data/no-data");
    var DeleteTimeSeriesConfirmationModal = require("modules/modals/delete-time-series-confirmation-modal/modal");
    var ResultsThead = require("./results-thead/index");

    var Template = require("text!./admin-search-timeseries-page.html");

    /** Define module **/
    App.module("AdminSearchTimeseriesPage", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.View = Backbone.Marionette.BossView.extend({

            /**
             *  Subviews
             */
            subViews: {
                footer: App.Common.Footer.View,
                navigation: App.Common.Navigation.View,
                searchForm: Module.SearchForm.View
            },

            /**
             *  Containers for the sub views
             */
            subViewContainers: {
                footer: "#footer-container",
                navigation: "#navigation-container",
                table: "#search-timeseries-table",
                pagination: "#pagination-links",
                searchForm: "#search-form",
                noData: "#no-data",
                resultsThead: "#search-timeseries-table thead",
            },

            /**
             *  Listen to the events propagated from the subviews
             */
            subViewEvents: {
                "navigation render": "onXNavigationRender",
                "pagination page": function (page) {
                    this.fetchPage(page);
                },
                "searchForm search": function (searchFormModel) {
                    var searchParams = searchFormModel.toJSON();
                    var that = this;
                    /** Get rid of empty parameters */
                    Object.keys(searchParams).forEach(function (key) {
                        if (!searchParams[key]) {
                            delete searchParams[key];
                        }
                    });
                    this.searchParams = searchParams;
                    // var deferred = this.collection.fetch({data: searchParams});
                    var deferred = this.collection.searchCustomRemote(searchParams);

                    deferred.done(function() {
                        that.checkForNoData();
                    });
                }
            },

            ui: {
                "deleteSelectedButton": "[data-action='delete-selected']",
                "selectAllButton": "[data-action='select-all']",
                "unselectAllButton": "[data-action='unselect-all']",
                "deleteAllButton": "[data-action='delete-all']"
            },

            events: {
                "click @ui.deleteSelectedButton": "deleteSelectedTimeseries",
                "click @ui.selectAllButton": "selectAll",
                "click @ui.unselectAllButton": "unselectAll",
                "change [name='should-delete']": "shouldDeleteToggled",
                "click @ui.deleteAllButton": "deleteAllTimeseriesMatchingFilter"
            },

            searchParams: {},

            fetchPage: function (page) {
                var deferred = this.collection.fetchPage(page);
                deferred.then(this.checkForNoData.bind(this));
                return deferred;
            },

            initialize: function (options) {
                Backbone.Marionette.BossView.prototype.initialize.call(this, options);
                var that = this;

                this.modalChannel = Backbone.Radio.channel("modals");

                that.subViews.pagination = function () {
                    return new App.Common.PaginationLinks.View({urlBased: false, model: that.collection.searchMeta});
                };

                this.subViews.noData = function () {
                    return new App.NoData.View({
                        message: 'There are no time series matching the applied filters.'
                    });
                };

                this.subViews.table = function () {
                    return new Backbone.Marionette.CollectionView({
                        tagName: "tbody",
                        childView: Module.SearchTimeseriesRow,
                        collection: that.collection
                    });
                };

                this.subViews.resultsThead = function () {
                    return new Module.ResultsThead({
                        collection: this.collection
                    });
                };
            },

            /**
             *  Set active state on navigation once it has rendered.
             */
            onXNavigationRender: function() {
                this.navigation.setNavigationItemAsActive("admin-search-timeseries");
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

            /**
             * When the DOM is finished painting, we will hide the loader.
             */
            onRender: function() {
                this.checkForNoData();
                App.hidePageLoader();
            },

            checkForNoData: function () {
                if (this.collection.length === 0) {
                    this.$el.find("#no-data").show();
                    this.$el.find("#search-timeseries-table").hide();
                } else {
                    this.$el.find("#no-data").hide();
                    this.$el.find("#search-timeseries-table").show();
                }
            },

            deleteAllTimeseriesMatchingFilter: function () {
                var that = this;

                var confirmationModal = new App.Modals.DeleteTimeSeriesConfirmation.Modal({ model: new Backbone.Model({ fileCount: this.collection.searchMeta.get('total') }) });
                App.showModal(confirmationModal);

                this.modalChannel.off('modalSuccess').once('modalSuccess', function () {
                    App.showPageLoader();
                    that.collection.delete(that.searchParams).then(function () {
                        that.fetchPage(1).then(function () {
                            that.checkForNoData();
                            App.hidePageLoader();
                        });
                    }, function () {
                        App.hidePageLoader();
                    });
                });
            },

            deleteSelectedTimeseries: function () {
                var that = this;

                var idsToDelete = that.$el.find("[name='should-delete']:checked").toArray().map(function (input) {
                    return $(input).val();
                });

                if (0 === idsToDelete.length) {
                    return;
                }

                var confirmationModal = new App.Modals.DeleteTimeSeriesConfirmation.Modal({ model: new Backbone.Model({ fileCount: idsToDelete.length }) });
                App.showModal(confirmationModal);

                this.modalChannel.off('modalSuccess').once('modalSuccess', function () {

                    var defferedDeletes = idsToDelete.map(function (id) {
                        return that.collection.findWhere({id: id}).destroy();
                    });

                    // This should have a polyfill
                    Promise.all(defferedDeletes).then(function () {
                        var pageCount = Math.ceil(that.collection.searchMeta.get("total") / that.collection.searchMeta.get("pageSize"));
                        var page = parseInt(that.collection.searchMeta.get("page"));
                        /** if we are on the last page and now we've deleted everything on it, go to the previous page. */
                        if (pageCount === page && that.collection.isEmpty()) {
                            /** if there is a previous page, fetch it. Otherwise we're on the front page so we don't need to change page. */
                            if (page > 1) {
                                that.fetchPage(page - 1);
                            }
                        } else {
                            that.fetchPage(page);
                        }
                    });
                });
            },

            selectAll: function () {
                this.$el.find('[name="should-delete"]').prop('checked', true);
                this.ui.selectAllButton.hide();
                this.ui.unselectAllButton.show();
            },

            unselectAll: function () {
                this.$el.find('[name="should-delete"]').prop('checked', false);
                this.ui.unselectAllButton.hide();
                this.ui.selectAllButton.show();
            },

            shouldDeleteToggled: function () {
                var allSelected = true;
                var allUnselected = true;
                this.$el.find('[name="should-delete"]').each(function(index, checkbox) {
                    if (! checkbox.checked) {
                        allSelected = false;
                    } else {
                        allUnselected = false;
                    }
                });

                if (allSelected) {
                    this.ui.unselectAllButton.show();
                    this.ui.selectAllButton.hide();
                } else {
                    this.ui.selectAllButton.show();
                    this.ui.unselectAllButton.hide();
                }
            }

        });

    });

});