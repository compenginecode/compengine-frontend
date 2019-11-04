define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");

    /** Module definition **/
    App.module("AdminTagsPage.Models", function(Module, Application, Backbone){

        /** Define model **/
        Module.Tag = Backbone.Model.extend({

            /**
             *  Returns the root URL for this resource.
             *
             * @returns {string}
             */
            urlRoot: function() {
                return App.apiEndpoint() + "/admin/tags";
            },

            approve: function () {
                var that = this;
                var deferred = $.ajax(this.urlRoot() + "/" + this.get("id") + "/approve", {
                    type: "PUT",
                    beforeSend: function(request) {
                        if (App.IdentityAccessManagement.Controller.sessionExists()) {
                            var sessionKey = App.IdentityAccessManagement.Controller.sessionKey();
                            request.setRequestHeader("Authorization", "bearer " + sessionKey);
                        }
                    }
                });

                deferred.success(function () {
                    that.trigger("approved", that);
                });

                return deferred;
            },

            deny: function (options) {
                var that = this;
                var deferred = $.ajax(this.urlRoot() + "/" + this.get("id") + "/deny", {
                    type: "POST",
                    data: JSON.stringify({
                        replacementTagId: options.replacementId
                    }),
                    headers: {
                        "Content-Type": "application/json"
                    },
                    beforeSend: function(request) {
                        if (App.IdentityAccessManagement.Controller.sessionExists()) {
                            var sessionKey = App.IdentityAccessManagement.Controller.sessionKey();
                            request.setRequestHeader("Authorization", "bearer " + sessionKey);
                        }
                    }
                });

                deferred.success(function () {
                    that.trigger("denied", that);
                });

                return deferred;
            }

        });

    });

});