define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");

    /** Local dependencies **/
    var Tag = require("./tag");
    var DataTableCollection = require("modules/common/collections/data-table-collection");

    /** Module definition **/
    App.module("AdminTagsPage.Models", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.TagCollection = App.Common.Collections.DataTableCollection.extend({

            model: Module.Tag,

            /**
             *  The URL for this resource.
             *
             * @var {string}
             */
            url: App.apiEndpoint() + "/admin/tags",

            defaultSortByField: 'name',

            defaultSortByDirection: 'ASC',

            remoteProcessing: true,

            initialize: function (options) {
                App.Common.Collections.DataTableCollection.prototype.initialize.call(this, options);
                this.on("destroy denied", function (model) {
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
            }

        });

    });

});
