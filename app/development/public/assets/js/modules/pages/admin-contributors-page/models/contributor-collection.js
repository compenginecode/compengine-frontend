define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");

    /** Local dependencies **/
    var Contributor = require("./contributor");
    var DataTableCollection = require("modules/common/collections/data-table-collection");

    /** Module definition **/
    App.module("AdminContributorsPage.Models", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.ContributorCollection = App.Common.Collections.DataTableCollection.extend({

            model: Module.Contributor,

            /**
             *  The URL for this resource.
             *
             * @var {string}
             */
            url: App.apiEndpoint() + "/admin/contributors",

            defaultSortByField: 'id',

            defaultSortByDirection: 'ASC',

            remoteProcessing: false,

            searchFields: ['name', 'email'],

            initialize: function (options) {
                App.Common.Collections.DataTableCollection.prototype.initialize.call(this, options);
                this.on("destroy", function (model) {
                    this.remove(model);
                });
            },

            parse: function (response) {
                return response.contributors;
            },

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
                email: function (left, right) {
                    if (left.get('email') === right.get('email')) {
                        return 0;
                    }

                    if (this.searchMeta.get('sortByDirection') === 'ASC') {
                        return left.get('email') < right.get('email') ? -1 : 1;
                    }
                    return left.get('email') > right.get('email') ? -1 : 1;
                }
            }

        });

    });

});
