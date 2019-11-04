define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");

    /** Local dependencies **/
    var Timeseries = require("./timeseries");
    var DataTableCollection = require("modules/common/collections/data-table-collection");

    /** Module definition **/
    App.module("AdminModerationPage.Models", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.ModerationCollection = App.Common.Collections.DataTableCollection.extend({

            model: Module.Timeseries,

            /**
             *  The URL for this resource.
             *
             * @var {string}
             */
            url: App.apiEndpoint() + "/admin/time-series/moderation",

            defaultSortByField: 'status',

            defaultSortByDirection: 'ASC',

            searchFields: [],

            remoteProcessing: true,

            initialize: function (options) {
                App.Common.Collections.DataTableCollection.prototype.initialize.call(this, options);
                this.on("deleted", function (model) {
                    location.reload();
                });
            },

            parse: function (response) {
                this.searchMeta.set({
                    total: response.total,
                    pageSize: response.pageSize,
                    page: response.page
                });
                return response.items;
            }

        });

    });

});
