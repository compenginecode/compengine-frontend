"use strict";

define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");
    var Moment = require("moment");

    var Template = require("text!./duplicate-timeseries-row.html");

    /** Define module **/
    App.module("AdminDuplicateTimeseriesPage", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.DuplicateTimeseriesRow = Backbone.Marionette.ItemView.extend({

            tagName: "tr",

            ui: {
                "deleteDuplicates": "[data-delete-duplicates-btn]",
                "error": ".error-text"
            },

            events: {
                "click @ui.deleteDuplicates": "deleteDuplicates",
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
                    getDownloadLink: function () {
                        return that.model.downloadUrl();
                    }
                }
            },

            deleteDuplicates: function () {
                var that = this;
                var button = this.ui.deleteDuplicates;
                button.addClass("btn-loader");
                this.model.deleteDuplicates().always(function () {
                    button.removeClass("btn-loader");
                }).error(function (e) {
                    that.ui.error.html(JSON.parse(e.responseText).message).show().delay(2000).fadeOut();
                });
            },

        });

    });

});