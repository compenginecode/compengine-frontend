/**
 *  This project makes extensive use of "modals", or transiently instantiated
 *  views related to a model. It also requires that the same type of modal can
 *  be instantiated many times at once, as well as the requirement of high reuse.
 *
 *  As such, modals cannot be directly implanted into the DOM by the designer. Instead
 *  they must be dynamically placed and handled, while still supporting model binding,
 *  cleanup of memory, etc.
 *
 * @type {*}
 * @version 1.0
 * @module common/views/managed-view
 * @namespace SocialView
 * @example
 * Module.View = App.Common.Views.SocialView.View.extend({});
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var Radio = require("backbone.radio");

    /** Define module **/
    App.module("Common.Views.SocialView", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.View = Backbone.Marionette.BossView.extend({

            initialize: function(options) {
                Backbone.Marionette.BossView.prototype.initialize.call(this, options);

                if (_.isFunction(this.socialTags)) {
                    this.socialTags = this.socialTags();
                }

                if (! _.isObject(this.socialTags)) {
                    this.socialTags = {};
                }

                if (undefined === this.socialTags["og:url"]) {
                    this.socialTags["og:url"] = GLOBALS.appUrl + "/" + window.location.hash;
                }

                Backbone.Radio.channel("global").trigger("app:addMetaTags", this.socialTags);
            }

        });

    });

});