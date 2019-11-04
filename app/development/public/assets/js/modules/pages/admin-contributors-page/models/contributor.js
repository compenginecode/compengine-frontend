define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");

    /** Module definition **/
    App.module("AdminContributorsPage.Models", function(Module, Application, Backbone){

        /** Define model **/
        Module.Contributor = Backbone.Model.extend({

            /**
             *  Returns the root URL for this resource.
             *
             * @returns {string}
             */
            urlRoot: function() {
                return App.apiEndpoint() + "/admin/contributors";
            }

        });

    });

});