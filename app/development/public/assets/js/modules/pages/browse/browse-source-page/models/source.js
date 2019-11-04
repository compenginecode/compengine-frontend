define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");

    /** Local dependencies **/

    /** Module definition **/
    App.module("Browse.BrowseSourcePage.Models", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.Source = Backbone.Model.extend();

    });

});