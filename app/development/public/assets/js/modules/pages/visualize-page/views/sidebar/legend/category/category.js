define(function(require) {

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");
    var Radio = require("backbone.radio");

    /** HTML template **/
    var Template = require("text!./category.html");

    /** Define module **/
    App.module("VisualizePage.Sidebar.Legend.Category", function (Module, Application, Backbone) {

        Module.View = Marionette.BossView.extend({

            /**
             *  Returns a rendered template.
             *
             * @param serializedModel
             * @returns {Function}
             * @protected
             */
            template: function(serializedModel){
                return _.template(Template, serializedModel);
            },

            templateHelpers: function(){
                var that = this;
                return {
                    index: function(){
                        return that.collection.indexOf(that.model);
                    }
                };
            },

            initialize: function(options){
                this.parentCollection = options.collection;
            }

        });

    });

});