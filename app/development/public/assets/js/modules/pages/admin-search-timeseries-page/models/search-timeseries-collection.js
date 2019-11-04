define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");

    /** Local dependencies **/
    var SearchTimeseries = require("./search-timeseries");
    var DataTableCollection = require("modules/common/collections/data-table-collection");

    /** Module definition **/
    App.module("AdminSearchTimeseriesPage.Models", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.SearchTimeseriesCollection = App.Common.Collections.DataTableCollection.extend({

            model: Module.SearchTimeseries,

            /**
             *  The URL for this resource.
             *
             * @var {string}
             */
            url: App.apiEndpoint() + "/admin/time-series/search",

            defaultSortByField: 'name',

            defaultSortByDirection: 'ASC',

            searchFields: ['name'],

            remoteProcessing: true,

            searchMethods: {
                
            },

            initialize: function (options) {
                App.Common.Collections.DataTableCollection.prototype.initialize.call(this, options);
                this.on("deleted", function (model) {
                    this.remove(model);
                });
            },

            parse: function (response) {
                this.searchMeta.set({
                    total: response.total,
                    pageSize: response.pageSize,
                    page: response.page
                });
                return response.items;
            },

            delete: function (filters) {
                var that = this;
                var deferred = $.ajax(that.url + '/delete', {
                    type: "POST",
                    contentType: 'json',
                    data: JSON.stringify(filters),
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
