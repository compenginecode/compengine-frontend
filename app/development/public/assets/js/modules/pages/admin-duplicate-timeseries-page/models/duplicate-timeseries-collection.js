define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");

    /** Local dependencies **/
    var DuplicateTimeseries = require("./duplicate-timeseries");
    var DataTableCollection = require("modules/common/collections/data-table-collection");

    /** Module definition **/
    App.module("AdminDuplicateTimeseriesPage.Models", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.DuplicateTimeseriesCollection = App.Common.Collections.DataTableCollection.extend({

            model: Module.DuplicateTimeseries,

            /**
             *  The URL for this resource.
             *
             * @var {string}
             */
            url: App.apiEndpoint() + "/admin/time-series/duplicates",

            defaultSortByField: 'id',

            defaultSortByDirection: 'ASC',

            searchFields: ['name'],

            sortingMethods: {
                id: function (left, right) {
                    if (parseInt(left.get('id')) === parseInt(right.get('id'))) {
                        return 0;
                    }

                    if (this.searchMeta.get('sortByDirection') === 'ASC') {
                        return parseInt(left.get('id')) < parseInt(right.get('id')) ? -1 : 1;
                    }
                    return parseInt(left.get('id')) > parseInt(right.get('id')) ? -1 : 1;
                },
                name: function (left, right) {
                    if (left.get('name') === right.get('name')) {
                        return 0;
                    }

                    if (this.searchMeta.get('sortByDirection') === 'ASC') {
                        return left.get('name') < right.get('name') ? -1 : 1;
                    }
                    return left.get('name') > right.get('name') ? -1 : 1;
                },
                duplicateCount: function (left, right) {
                    if (parseInt(left.get('duplicates')) === parseInt(right.get('duplicates'))) {
                        return 0;
                    }

                    if (this.searchMeta.get('sortByDirection') === 'ASC') {
                        return parseInt(left.get('duplicates')) < parseInt(right.get('duplicates')) ? -1 : 1;
                    }
                    return parseInt(left.get('duplicates')) > parseInt(right.get('duplicates')) ? -1 : 1;
                }
            },

            initialize: function (options) {
                App.Common.Collections.DataTableCollection.prototype.initialize.call(this, options);
                this.on("duplicatesDeleted", function (model) {
                    this.remove(model);
                });
            },

            parse: function (response) {
                return response.duplicateTimeSeries;
            }

        });

    });

});
