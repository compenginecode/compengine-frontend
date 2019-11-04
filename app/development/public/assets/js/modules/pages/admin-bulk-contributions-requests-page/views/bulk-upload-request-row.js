"use strict";

define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");
    var Moment = require("moment");
    var Radio = require("backbone.radio");

    var Template = require("text!./bulk-upload-request-row.html");

    /** Define module **/
    App.module("AdminBulkContributionRequests", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.BulkUploadRequestRow = Marionette.ItemView.extend({

            tagName: "tr",

            ui: {
               "approve": "[data-approve-btn]",
               "deny": "[data-deny-btn]",
                "error": ".error-text"
            },

            events: {
                "click @ui.approve": "approveRequest",
                "click @ui.deny": "denyRequest"
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
                    getFormattedRequestDate: function () {
                        return new Moment(that.model.get("createdAt")).format("DD/MM/YY");
                    }
                }
            },

            initialize: function(options) {
                Marionette.ItemView.prototype.initialize.call(this, options);

                this.radio = Backbone.Radio.channel("bulkUploadRequest:childView");
            },

            approveRequest: function () {
                var that = this;
                var button = this.ui.approve;
                button.addClass("btn-loader");
                var deferred = this.model.approve();

                deferred.success(function() {
                    that.radio.trigger("checkState", true);
                });

                deferred.always(function () {
                    button.removeClass("btn-loader");
                });

                deferred.error(function (e) {
                    that.ui.error.html(JSON.parse(e.responseText).message).show().delay(2000).fadeOut();
                });
            },

            denyRequest: function () {
                var that = this;
                var button = this.ui.deny;
                button.addClass("btn-loader");
                var deferred = this.model.deny();

                deferred.success(function() {
                    that.radio.trigger("checkState", true);
                });

                deferred.always(function () {
                    button.removeClass("btn-loader");
                });

                deferred.error(function (e) {
                    that.ui.error.html(JSON.parse(e.responseText).message).show().delay(2000).fadeOut();
                });
            }

        });

    });

});