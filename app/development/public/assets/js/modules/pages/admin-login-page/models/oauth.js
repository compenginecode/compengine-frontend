define(function(require){

    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    App.module("AdminLoginPage", function(Module, Application, Backbone){

        Module.Model = Backbone.Model.extend({

            url: App.apiEndpoint() + "/login"

        });

    });

});