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
    var SourceCard = require("./source-card");

    /** Define module **/
    App.module("Browse.BrowseSourcePage", function(Module, Application, Backbone) {

        Module.SourceCardList = Backbone.Marionette.CollectionView.extend({

            childView: Module.SourceCard

        });

    });

});