define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");

    /** Local dependencies **/
    var IdentityAccessManager = require("modules/common/controllers/identity-access-management");

    /** Module definition **/
    App.module("Common.Models", function(Module, Application, Backbone){

        /** Define model **/
        Module.BulkUploadRequest = Backbone.Model.extend({

            /**
             *  Returns the root URL for this resource.
             *
             * @returns {string}
             */
            urlRoot: function(){
                return App.apiEndpoint() + "/bulk-upload-requests";
            },

            approve: function () {
                var that = this;
                var deferred = $.ajax(App.apiEndpoint() + "/admin/bulk-upload-requests/" + this.get("id") + "/approve", {
                    type: "POST",
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

            deny: function () {
                var that = this;
                var deferred = $.ajax(App.apiEndpoint() + "/admin/bulk-upload-requests/" + this.get("id") + "/deny", {
                    type: "POST",
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