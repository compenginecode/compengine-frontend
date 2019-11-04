"use strict";

define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");

    var Template = require("text!./category-row.html");
    var MetadataReplacementModal = require("modules/modals/metadata-replacement-modal/modal");
    var CategoryController = require("modules/modals/metadata-replacement-modal/controllers/category-controller");

    /** Define module **/
    App.module("AdminCategoriesPage", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.CategoryRow = Backbone.Marionette.CompositeView.extend({

            DEFAULT_ERROR_TEXT: "Uh oh! That didn't work :(",

            tagName: "li",

            className: "category-item",

            attributes: function () {
                return {
                    "data-id": this.model.get('id')
                }
            },

            ui: {
                "deleteButton": "[data-delete]",
                "editButton": "[data-edit]",
                "saveButton": "[data-save]",
                "cancelButton": "[data-cancel]",
                "error": ".error-text",
                "nameInput": "[data-name-input]",
                "approve": "[data-approve]",
                "deny": "[data-deny]"
            },

            events: {
                "click @ui.editButton": "editCategory",
                "click @ui.saveButton": "saveCategory",
                "click @ui.cancelButton": "cancelEditingCategory",
                "click @ui.deleteButton": "deleteCategory",
                "click @ui.approve": "approveCategory",
                "click @ui.deny": "denyCategory"
            },

            childViewContainer: "ol",

            childViewOptions: function () {
                var clone = _.clone(this.options);
                delete clone["model"];
                return clone;
            },

            initialize: function (options) {
                Backbone.Marionette.CompositeView.prototype.initialize.call(this, options);
                this.collection = this.model.get("children");
            },

            onRender: function () {
                this.$el.data('model', this.model);
            },

            onRenderCollection: function () {
                this.$el.children('ol').data('collection', this.collection);
            },

            modelEvents: {
                "approved": "render"
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
                    editing: this.editing
                }
            },

            editing: false,

            editCategory: function () {
                this.editing = true;
                this.render();
                this.ui.nameInput.select();
            },

            cancelEditingCategory: function () {
                this.editing = false;
                this.render();
            },

            saveCategory: function (e) {
                var that = this;
                this.editing = false;
                this.ui.saveButton.addClass("btn-loader");
                this.model.save("name", this.ui.nameInput.val()).success(function () {
                    that.render();
                }).error(function (e) {
                    that.model.set(that.model.previousAttributes());

                    if (e.responseJSON && e.responseJSON.message) {
                        that.ui.error.text(e.responseJSON.message);
                    } else {
                        that.ui.error.text(that.DEFAULT_ERROR_TEXT);
                    }

                    that.ui.saveButton.removeClass("btn-loader");
                });

                // stop parent category rows from handling the save event
                e.stopPropagation();
            },

            deleteCategory: function (e) {
                var that = this;
                this.ui.deleteButton.addClass("btn-loader");
                this.model.destroy({wait: true}).error(function (e) {
                    if (e.responseJSON && e.responseJSON.message) {
                        that.ui.error.text(e.responseJSON.message).show().delay(2000).fadeOut();
                    } else {
                        that.ui.error.text(that.DEFAULT_ERROR_TEXT).show().delay(2000).fadeOut();
                    }

                    that.ui.deleteButton.removeClass("btn-loader");
                });

                // stop parent category rows from handling the delete event
                e.stopPropagation();
            },

            approveCategory: function (e) {
                var that = this;
                var button = this.ui.approve;
                button.addClass("btn-loader");
                this.model.approve().always(function () {
                    button.removeClass("btn-loader");
                }).error(function (e) {
                    that.ui.error.html(JSON.parse(e.responseText).message).show().delay(2000).fadeOut();
                });

                // stop parent category rows from handling the save event
                e.stopPropagation();
            },

            denyCategory: function (e) {
                e.preventDefault();
                e.currentTarget.blur();
                var modal = new App.Modals.MetadataReplacement.Modal({ replacementRequired: true, model: this.model, replacementController: App.Modals.MetadataReplacement.Controllers.CategoryController });
                App.showModal(modal);

                // stop parent category rows from handling the save event
                e.stopPropagation();
            }

        });

    });

});