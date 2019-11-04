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
    var CategoryCollection = require("../models/category-collection");
    var CategoryRow = require("./category-row");
    // var PaginationLinks = require("modules/common/views/pagination-links/pagination-links");
    var Validation = require("modules/common/controllers/validation-controller");
    var CategoryRows = require("./category-rows");
    var JqueryNestedSortable = require("jqueryNestedSortable");

    var Template = require("text!./admin-categories-page.html");

    /** Define module **/
    App.module("AdminCategoriesPage", function(Module, Application, Backbone) {

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
                table: "#categories-list",
                // pagination: "#pagination-links"
            },

            ui: {
                "addButton": "[data-add]",
                "nameInput": "[data-name-input]",
                "error": ".error-text"
            },

            /**
             *  Listen to the events propagated from the subviews
             */
            subViewEvents: {
                "navigation render": "onXNavigationRender",
                // "pagination page": function (page) {
                //     this.fetchPage(page);
                // }
                "table relocate": function () {
                    console.log("relocated...");
                }
            },

            // collectionEvents: {
            //     "destroy": "categoryRemoved"
            // },

            events: {
                "click @ui.addButton": "addCategory",
                "submit #category-form": "addCategory"
            },

            // fetchPage: function (page) {
            //     return this.collection.fetch({data: {page: page}});
            // },

            initialize: function (options) {
                Backbone.Marionette.BossView.prototype.initialize.call(this, options);
                var that = this;

                // that.subViews.pagination = function () {
                //     return new App.Common.PaginationLinks.View({urlBased: false, model: that.collection.pagination});
                // };

                // this.subViews.table = function () {
                //     return new Backbone.Marionette.CollectionView({
                //         tagName: "ol",
                //         className: "dd-list",
                //         childView: Module.CategoryRow,
                //         collection: that.collection
                //     });
                // };

                this.subViews.table = function () {
                    return new Module.CategoryRows({
                        collection: that.collection
                    });
                };
            },

            /**
             *  Set active state on navigation once it has rendered.
             */
            onXNavigationRender: function() {
                this.navigation.setNavigationItemAsActive("admin-categories");
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

            // templateHelpers: function () {
            //     var that = this;
            //     console.log(that.collection);
            //     return {
            //         categories: that.collection.models
            //     }
            // },

            /**
             * When the DOM is finished painting, we will hide the loader.
             */
            onRender: function(){
                App.hidePageLoader();
                // window.setTimeout(function() {
                //     $(".dd").nestable({
                //         itemClass: "category-item",
                //         handleClass: "category-item__content"
                //     });
                // }, 16);
                var that = this;

                window.setTimeout(function() {
                    // debugger;
                    $(that.subViewContainers.table).children('ol').nestedSortable({
                        handle: 'div',
                        items: 'li',
                        toleranceElement: '> div',
                        placeholder: "category-item placeholder",
                        forcePlaceholderSize: true,
                        appendTo: that.subViewContainers.table,
                        update: function(e, ui) {
                            var categoryRow = $(ui.item);
                            var category = categoryRow.data('model');
                            var parentCategoryRow = categoryRow.parent().parent('.category-item');
                            console.log(parentCategoryRow.length);
                            if (parentCategoryRow.length) {
                                var parentCategory = parentCategoryRow.data('model');
                                if (parentCategory.get('id') !== category.get('parentId')) {
                                    category.collection.remove(category);
                                    category.set('parentId', parentCategory.get('id'));
                                    parentCategory.get('children').add(category);
                                    category.save();
                                }
                            } else {
                                if (null !== category.get('parentId')) {
                                    category.collection.remove(category);
                                    category.set('parentId', null);
                                    that.collection.add(category);
                                    category.save();
                                }
                            }
                        }
                    });
                }, 16);
            },

            addCategory: function (e) {
                e.preventDefault();
                var that = this;
                var valid = true;

                if (App.Validation.Controller.emptyString(that.ui.nameInput.val().trim())) {
                    that.ui.error.text("Name cannot be empty").show().delay(2000).fadeOut();
                    valid = false;
                }

                if (valid) {
                    that.ui.addButton.addClass("btn-loader");

                    /** new up new category using category name from input */
                    var newCategory = new Module.Models.Category({
                        name: this.ui.nameInput.val(),
                        parentId: null
                    });

                    /** save and update page based on success or error */
                    var deferred = newCategory.save();

                    deferred.success(function () {
                        that.ui.nameInput.val("");
                        // that.fetchPage(that.collection.pagination.get("page"));
                        that.collection.add(newCategory, {at: 0});
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

            }

        });

    });

});