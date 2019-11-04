"use strict";

define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var KeypressValidation = require("modules/common/controllers/keypress-validation");

    var Template = require("text!./tag-row.html");
    var MetadataReplacementModal = require("modules/modals/metadata-replacement-modal/modal");
    var TagsController = require("modules/modals/metadata-replacement-modal/controllers/tags-controller");

    /** Define module **/
    App.module("AdminTagsPage", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.TagRow = Backbone.Marionette.ItemView.extend({

            DEFAULT_ERROR_TEXT: "Uh oh! That didn't work :(",

            tagName: "tr",

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
                "click @ui.editButton": "editTag",
                "click @ui.saveButton": "saveTag",
                "click @ui.cancelButton": "cancelEditingTag",
                "click @ui.deleteButton": "deleteTag",
                "keydown @ui.nameInput": "onNameInputKeyDown",
                "click @ui.approve": "approveTag",
                "click @ui.deny": "denyTag"
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

            editTag: function () {
                this.editing = true;
                this.render();
                this.ui.nameInput.select();
            },

            cancelEditingTag: function () {
                this.editing = false;
                this.render();
            },

            saveTag: function () {
                var that = this;
                this.editing = false;
                this.ui.saveButton.addClass("btn-loader");
                this.preSaveModelAttributes = _.clone(this.model.attributes);
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
            },

            deleteTag: function () {
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

            approveTag: function () {
                var that = this;
                var button = this.ui.approve;
                button.addClass("btn-loader");
                this.model.approve().always(function () {
                    button.removeClass("btn-loader");
                    that.model.set('approvalStatus', 'approved');
                    that.render();
                }).error(function (e) {
                    that.ui.error.html(JSON.parse(e.responseText).message).show().delay(2000).fadeOut();
                });
            },

            denyTag: function (e) {
                e.preventDefault();
                e.currentTarget.blur();
                var modal = new App.Modals.MetadataReplacement.Modal({ replacementRequired: false, model: this.model, replacementController: App.Modals.MetadataReplacement.Controllers.TagsController });
                App.showModal(modal);
            }

        });

    });

});