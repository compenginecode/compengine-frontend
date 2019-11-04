"use strict";

define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var Footer = require("modules/common/views/footer/footer");
    var KeypressValidation = require("modules/common/controllers/keypress-validation");
    var Navigation = require("modules/common/views/navigation/navigation");
    var TagCollection = require("../models/tag-collection");
    var TagRow = require("./tag-row");
    var PaginationLinks = require("modules/common/views/pagination-links/pagination-links");
    var Validation = require("modules/common/controllers/validation-controller");

    var Template = require("text!./admin-tags-page.html");
    var ResultsThead = require("./results-thead/index");

    /** Define module **/
    App.module("AdminTagsPage", function(Module, Application, Backbone) {

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
                table: "#tags-table",
                pagination: "#pagination-links",
                resultsThead: "#tags-table thead"
            },

            ui: {
                "addButton": "[data-add]",
                "nameInput": "[data-name-input]",
                "error": ".error-text",
                'searchBox': '#search-box'
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

            collectionEvents: {
                "destroy denied": "tagRemoved"
            },

            events: {
                "click @ui.addButton": "addTag",
                "submit #tag-form": "addTag",
                "keydown @ui.nameInput": "onNameInputKeyDown",
                'input @ui.searchBox': 'onClickSearch'
            },

            fetchPage: function (page) {
                return this.collection.fetchPage(page);
            },

            initialize: function (options) {
                Backbone.Marionette.BossView.prototype.initialize.call(this, options);
                var that = this;

                that.subViews.pagination = function () {
                    return new App.Common.PaginationLinks.View({urlBased: false, model: that.collection.searchMeta});
                };

                this.subViews.table = function () {
                    return new Backbone.Marionette.CollectionView({
                        tagName: "tbody",
                        childView: Module.TagRow,
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
                this.navigation.setNavigationItemAsActive("admin-tags");
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
                    searchText: this.collection.searchMeta.get('searchText')
                }
            },

            /**
             * When the DOM is finished painting, we will hide the loader.
             */
            onRender: function(){
                App.hidePageLoader();
            },

            tagRemoved: function () {
                var pageCount = Math.ceil(this.collection.searchMeta.get("total") / this.collection.searchMeta.get("pageSize"));
                var page = parseInt(this.collection.searchMeta.get("page"));
                /** if we are on the last page and now we've deleted everything on it, go to the previous page. */
                if (pageCount === page && this.collection.isEmpty()) {
                    /** if there is a previous page, fetch it. Otherwise we're on the front page so we don't need to change page. */
                    if (page > 1) {
                        this.fetchPage(page - 1);
                    }
                } else {
                    this.fetchPage(page);
                }
            },

            addTag: function (e) {
                e.preventDefault();
                var that = this;
                var valid = true;

                if (App.Validation.Controller.emptyString(this.ui.nameInput.val().trim())) {
                    that.ui.error.text("Name cannot be empty").show().delay(2000).fadeOut();
                    valid = false;
                }

                if (valid) {
                    that.ui.addButton.addClass("btn-loader");

                    /** new up new tag using tag name from input */
                    var newTag = new Module.Models.Tag({ name: this.ui.nameInput.val() });

                    /** save and update page based on success or error */
                    var deferred = newTag.save();

                    deferred.success(function () {
                        that.ui.nameInput.val("");
                        that.fetchPage(that.collection.searchMeta.get("page"));
                    });

                    deferred.error(function (e) {
                        var message = that.DEFAULT_ERROR_TEXT;

                        if (e.responseJSON && e.responseJSON.message) {
                            message = e.responseJSON.message;
                        }

                        that.ui.error.text(message).show().delay(2000).fadeOut();
                    });

                    deferred.always(function () {
                        that.ui.addButton.removeClass("btn-loader");
                    });
                }
            },

            /**
             * When the user presses a key inside the source name input, we'll check whether or not the key they pressed
             * is valid or not (Alphanumeric or one of the globally allowed keys)
             *
             * @param e {Event} The keypress event
             * @returns {boolean|void} True if it is a valid keypress, preventDefault() if not
             */
            onNameInputKeyDown: function(e) {
                App.KeypressValidation.Controller.keypressIsAlphaNumeric(e);
            },

            onClickSearch: function () {
                var searchText = this.ui.searchBox.val();
                this.collection.searchCustomRemote({ searchText: searchText });
                this.table.render();
            }

        });

    });

});