define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");

    /** Local dependencies **/
    var IdentityAccessManager = require("modules/common/controllers/identity-access-management");

    /** Module definition **/
    App.module("AdminBulkUploadedFiles.Models", function(Module, Application, Backbone){

        /** Define model **/
        Module.BulkUploadedFileBatch = Backbone.Model.extend({

            /**
             *  Returns the root URL for this resource.
             *
             * @returns {string}
             */
            urlRoot: function(){
                return App.apiEndpoint() + "/admin/time-series";
            },

            downloadUrl: function () {
                return this.urlRoot() + "/" + this.get("id") + "/download";
            },

            approve: function () {
                var that = this;
                var deferred = $.ajax(App.apiEndpoint() + "/admin/time-series/batches/" + this.get("id") + "/approve", {
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

            deny: function (data) {
                var that = this;
                var deferred = $.ajax(App.apiEndpoint() + "/admin/time-series/batches/" + this.get("id") + "/deny", {
                    type: "POST",
                    contentType: 'json',
                    data: JSON.stringify(data),
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