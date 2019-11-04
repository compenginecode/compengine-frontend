/**
 *  Browse Page
 *
 * @module pages/browse-page
 * @memberof Pages
 * @see Pages
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Local dependencies **/

    /** HTML template **/
    var Template = require("text!./tag-card.html");

    /** Define module **/
    App.module("Browse.BrowseTagPage", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.TagCard = Backbone.Marionette.ItemView.extend({

            tagName: "li",

            templateHelpers: function () {
                var that = this;
                return {
                    weightedFontSize: that.options.weightedFontSize
                }
            },

            template: function(serializedModel){
                return _.template(Template, serializedModel);
            }

        });

    });

});