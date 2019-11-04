"use strict";

define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var Template = require("text!./index.html");

    /** Define module **/
    App.module("AdminSourcesPage", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.ResultsThead = Backbone.Marionette.BossView.extend({

            tagName: 'tr',

            events: {
                'click [data-sort]': 'onClickSort',
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
                    sortingBy: this.collection.searchMeta.get('sortByField'),
                    sortDirection: this.collection.searchMeta.get('sortByDirection')
                }
            },

            onClickSort: function (e) {
                var that = this;
                var sortByField = $(e.target).data('sort');
                $(e.target).addClass("fetching");
                var deferred = this.collection.sortByToggle(sortByField);
                deferred.always(function () {
                    that.render();
                });
            }

        });

    });

});