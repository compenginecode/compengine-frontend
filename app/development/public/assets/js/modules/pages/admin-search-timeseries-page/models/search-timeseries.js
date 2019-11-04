define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");

    /** Local dependencies **/
    var IdentityAccessManager = require("modules/common/controllers/identity-access-management");

    /** Module definition **/
    App.module("AdminSearchTimeseriesPage.Models", function(Module, Application, Backbone){

        /** Define model **/
        Module.SearchTimeseries = Backbone.Model.extend({

            /**
             *  Returns the root URL for this resource.
             *
             * @returns {string}
             */
            urlRoot: function(){
                return App.apiEndpoint() + "/admin/time-series";
            },

            delete: function () {
                var that = this;
                var deferred = $.ajax(that.urlRoot() + "/" + this.get("id"), {
                    type: "DELETE",
                    beforeSend: function(request) {
                        if (App.IdentityAccessManagement.Controller.sessionExists()) {
                            var sessionKey = App.IdentityAccessManagement.Controller.sessionKey();
                            request.setRequestHeader("Authorization", "bearer " + sessionKey);
                        }
                    }
                });

                deferred.success(function () {
                    that.trigger("deleted", that);
                });

                return deferred;
            }

        });

    });

});