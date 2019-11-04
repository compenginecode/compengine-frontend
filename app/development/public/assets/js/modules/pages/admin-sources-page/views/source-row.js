"use strict";

define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");

    var Template = require("text!./source-row.html");
    var MetadataReplacementModal = require("modules/modals/metadata-replacement-modal/modal");
    var SourceController = require("modules/modals/metadata-replacement-modal/controllers/source-controller");

    /** Define module **/
    App.module("AdminSourcesPage", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.SourceRow = Backbone.Marionette.ItemView.extend({

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
                "click @ui.editButton": "editSource",
                "click @ui.saveButton": "saveSource",
                "click @ui.cancelButton": "cancelEditingSource",
                "click @ui.deleteButton": "deleteSource",
                "keydown @ui.nameInput": "onNameInputKeyDown",
                "click @ui.approve": "approveSource",
                "click @ui.deny": "denySource"
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

            editSource: function () {
                this.editing = true;
                this.render();
                this.ui.nameInput.select();
            },

            cancelEditingSource: function () {
                this.editing = false;
                this.render();
            },

            saveSource: function () {
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
            },

            deleteSource: function () {
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

            approveSource: function () {
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

            denySource: function (e) {
                e.preventDefault();
                e.currentTarget.blur();
                var modal = new App.Modals.MetadataReplacement.Modal({ replacementRequired: true, model: this.model, replacementController: App.Modals.MetadataReplacement.Controllers.SourceController });
                App.showModal(modal);
            }

        });

    });

});