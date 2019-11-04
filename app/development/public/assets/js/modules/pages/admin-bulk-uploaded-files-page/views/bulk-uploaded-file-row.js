"use strict";

define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");
    var Moment = require("moment");
    var BulkUploadedFilesModal = require("modules/modals/view-bulk-uploaded-files-modal/modal");
    var DenyUploadConfirmationModal = require("modules/modals/deny-upload-confirmation-modal/modal");

    var Template = require("text!./bulk-uploaded-file-row.html");

    /** Define module **/
    App.module("AdminBulkUploadedFiles", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.BulkUploadedFileRow = Backbone.Marionette.ItemView.extend({

            tagName: "tr",

            ui: {
                "approve": "[data-approve-btn]",
                "deny": "[data-deny-btn]",
                "error": ".error-text",
                "viewFiles": "[data-view-files-btn]"
            },

            events: {
                "click @ui.approve": "approveTimeSeries",
                "click @ui.deny": "denyTimeSeries",
                "click @ui.viewFiles": "viewFiles"
            },

            initialize: function () {
                this.modalChannel = Backbone.Radio.channel("modals");
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
                var that = this;
                return {
                    getFormattedUploadDate: function () {
                        return new Moment(that.model.get("uploadedAt")).format("DD/MM/YY");
                    }
                }
            },

            approveTimeSeries: function () {
                var that = this;
                var button = this.ui.approve;
                button.addClass("btn-loader");
                this.model.approve().always(function () {
                    button.removeClass("btn-loader");
                }).error(function (e) {
                    that.ui.error.html(JSON.parse(e.responseText).message).show().delay(2000).fadeOut();
                });
            },

            denyTimeSeries: function () {
                var that = this;
                var button = this.ui.deny;

                var confirmationModal = new App.Modals.DenyUploadConfirmation.Modal();

                App.showModal(confirmationModal);

                this.modalChannel.off('modalSuccess').once('modalSuccess', function (e) {
                    button.addClass("btn-loader");

                    that.model.deny({
                        reason: e.reason
                    }).always(function () {
                        button.removeClass("btn-loader");
                    }).error(function (e) {
                        that.ui.error.html(JSON.parse(e.responseText).message).show().delay(2000).fadeOut();
                    });
                });
            },

            viewFiles: function () {
                var modal = new App.Modals.ViewBulkUploadedFiles.Modal({
                    model: this.model
                });

                App.showModal(modal);
            }

        });

    });

});