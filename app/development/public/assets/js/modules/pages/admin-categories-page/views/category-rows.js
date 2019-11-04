/**
 *  Admin categories page
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
    var CategoryRow = require("./category-row");

    /** Define module **/
    App.module("AdminCategoriesPage", function(Module, Application, Backbone) {

        Module.CategoryRows = Backbone.Marionette.CollectionView.extend({

            tagName: "ol",

            childView: Module.CategoryRow

        });

    });

});