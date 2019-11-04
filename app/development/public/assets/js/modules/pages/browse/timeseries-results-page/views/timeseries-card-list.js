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
    var TimeseriesCard = require("./timeseries-card");

    /** Define module **/
    App.module("Browse.TimeseriesResultsPage", function(Module, Application, Backbone) {

        Module.TimeseriesCardList = Backbone.Marionette.CollectionView.extend({

            childView: Module.TimeseriesCard

        });

    });

});