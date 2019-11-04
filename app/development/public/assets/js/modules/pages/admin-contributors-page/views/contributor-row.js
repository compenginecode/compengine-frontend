"use strict";

define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");

    var Template = require("text!./contributor-row.html");

    /** Define module **/
    App.module("AdminContributorsPage", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.ContributorRow = Backbone.Marionette.ItemView.extend({

            DEFAULT_ERROR_TEXT: "Uh oh! That didn't work :(",

            tagName: "tr",

            ui: {
                "deleteButton": "[data-delete]",
                "error": ".error-text"
            },

            events: {
                "click @ui.deleteButton": "deleteContributor"
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

            deleteContributor: function () {
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
            }

        });

    });

});