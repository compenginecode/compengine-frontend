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
    var CategoryCard = require("./category-card");

    /** Define module **/
    App.module("Browse.BrowseCategoryPage", function(Module, Application, Backbone) {

        Module.CategoryCardList = Backbone.Marionette.CollectionView.extend({

            childView: Module.CategoryCard

        });

    });

});