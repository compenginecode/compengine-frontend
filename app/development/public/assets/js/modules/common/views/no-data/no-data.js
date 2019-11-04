"use strict";

define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");

    var Template = require("text!./no-data.html");

    /** Define module **/
    App.module("NoData", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.View = Backbone.Marionette.ItemView.extend({

            message: "There doesn't appear to be any data for this page.",

            /**
             *  Returns a rendered template.
             *
             * @param serializedModel
             * @returns {Function}
             */
            template: _.template(Template),

            templateHelpers: function () {
                return {
                    message: this.message
                }
            },

            initialize: function(options) {
                Backbone.Marionette.ItemView.prototype.initialize.call(this, options);

                if (options && options.message) {
                    this.message = options.message;
                }
            }

        });

    });

});