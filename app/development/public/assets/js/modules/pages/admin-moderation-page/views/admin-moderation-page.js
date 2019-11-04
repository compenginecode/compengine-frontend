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
    var SearchTimeseriesCollection = require("../models/moderation-collection");
    var SearchTimeseriesRow = require("./search-timeseries-row");
    var PaginationLinks = require("modules/common/views/pagination-links/pagination-links");
    var NoDataView = require("modules/common/views/no-data/no-data");
    var DeleteTimeSeriesConfirmationModal = require("modules/modals/delete-time-series-confirmation-modal/modal");
    var ResultsThead = require("./results-thead/index");

    var Template = require("text!./admin-moderation-page.html");

    /** Define module **/
    App.module("AdminModerationPage", function(Module, Application, Backbone) {

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
                table: "#search-timeseries-table",
                pagination: "#pagination-links",
                noData: "#no-data",
                resultsThead: "#search-timeseries-table thead"
            },

            /**
             *  Listen to the events propagated from the subviews
             */
            subViewEvents: {
                "navigation render": "onXNavigationRender",
                "pagination page": function (page) {
                    this.fetchPage(page);
                }
            },

            events: {
                'input @ui.searchBox': 'onClickSearch',
                'click [data-role=select-all]': 'onSelectAllButtonClick',
                'click [data-role=bulk-approve]': 'onBulkApprove',
                'click [data-role=bulk-reject]': 'onBulkReject',
                'change [type=checkbox]': 'onCheckboxTypeChange'
            },

            ui: {
                'searchBox': '#search-box'
            },

            onCheckboxTypeChange: function(){
                this.$el.find('[data-role=bulk-approve]').toggle(this.$el.find('[type=checkbox]:checked').length > 0);
                this.$el.find('[data-role=bulk-reject]').toggle(this.$el.find('[type=checkbox]:checked').length > 0);
            },

            onSelectAllButtonClick: function(ev){
                this.$el.find('[type=checkbox]').prop('checked', !this.$el.find('[type=checkbox]').is(':checked'));
                this.onCheckboxTypeChange();
            },

            onBulkApprove: function(){
                var that = this;
                var count = this.$el.find('[type=checkbox]:checked').length;
                var completed = 0;

                var onSuccess = function(){
                    completed++;
                    that.$el.find('[data-role=approval-counter]').text(completed + '/' + count + ' approved');
                    
                    if (completed >= count){
                        location.reload();
                    }
                }

                that.$el.find('[data-role=approval-counter]').show();
                this.$el.find('[type=checkbox]:checked').each(function(index, el){
                    var id = $(el).attr('data-id');
                    var model = that.collection.get(id);
                    var deferred = model.keep(false);

                    deferred.done(function(){
                        onSuccess();
                    })
                });
            },

            onBulkReject: function(){
                var that = this;
                var count = this.$el.find('[type=checkbox]:checked').length;
                var completed = 0;

                var onSuccess = function(){
                    completed++;
                    that.$el.find('[data-role=approval-counter]').text(completed + '/' + count + ' rejected');
                    
                    if (completed >= count){
                        location.reload();
                    }
                }

                that.$el.find('[data-role=approval-counter]').show();
                this.$el.find('[type=checkbox]:checked').each(function(index, el){
                    var id = $(el).attr('data-id');
                    var model = that.collection.get(id);
                    var deferred = model.remove('Bulk rejection was used to reject this time series.');

                    deferred.done(function(){
                        onSuccess();
                    })
                });
            },

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
                        message: 'There are no new time series to moderate.'
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
                this.navigation.setNavigationItemAsActive("admin-moderation");
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

            onClickSearch: function () {
                var searchText = this.ui.searchBox.val();
                this.collection.searchCustomRemote({ searchText: searchText });
                this.table.render();
            }

        });

    });

});