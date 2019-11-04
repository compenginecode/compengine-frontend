define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");

    /** Local dependencies **/
    var IdentityAccessManager = require("modules/common/controllers/identity-access-management");

    /** Module definition **/
    App.module("AdminModerationPage.Models", function(Module, Application, Backbone){

        /** Define model **/
        Module.Timeseries = Backbone.Model.extend({

            /**
             *  Returns the root URL for this resource.
             *
             * @returns {string}
             */
            urlRoot: function(){
                return App.apiEndpoint() + "/admin/time-series";
            },

            remove: function (reason) {
                var that = this;
                var deferred = $.ajax(that.urlRoot() + "/" + this.get("id") + "/moderate", {
                    type: "POST",
                    contentType: "json",
                    data: JSON.stringify({
                        reason: reason,
                        action: "remove"
                    }),
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
            },

            keep: function (refresh) {
                var that = this;
                var deferred = $.ajax(that.urlRoot() + "/" + this.get("id") + "/moderate", {
                    type: "POST",
                    contentType: "json",
                    data: JSON.stringify({
                        action: "keep"
                    }),
                    beforeSend: function(request) {
                        if (App.IdentityAccessManagement.Controller.sessionExists()) {
                            var sessionKey = App.IdentityAccessManagement.Controller.sessionKey();
                            request.setRequestHeader("Authorization", "bearer " + sessionKey);
                        }
                    }
                });

                deferred.success(function () {
                    if (false !== refresh){
                        that.trigger("deleted", that);
                    }
                });

                return deferred;
            }

        });

    });

});