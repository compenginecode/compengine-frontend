define(function (require) {

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");

    /** Local dependencies **/
    var BulkUploadRequest = require("./bulk-upload-request");
    var DataTableCollection = require("modules/common/collections/data-table-collection");

    /** Module definition **/
    App.module("Common.Models", function (Module, Application, Backbone) {

        /** Define route controller **/
        Module.BulkUploadRequestCollection = App.Common.Collections.DataTableCollection.extend({

            model: Module.BulkUploadRequest,

            defaultSortByField: 'status',

            sortingMethods: {
                requestDate: function (left, right) {
                    var leftTimestamp = (new Date(left.get('createdAt'))).getTime();
                    var rightTimestamp = (new Date(right.get('createdAt'))).getTime();

                    if (leftTimestamp === rightTimestamp) {
                        return 0;
                    }

                    if (this.searchMeta.get('sortByDirection') === 'ASC') {
                        return leftTimestamp < rightTimestamp ? -1 : 1;
                    }

                    return leftTimestamp > rightTimestamp ? -1 : 1;
                },
                status: function (left, right) {
                    var ordinals = 
                    {
                        pending: '1pending',
                        approved: '2approved',
                        rejected: '3rejected'
                    };

                    
                    if (left.get('status') === right.get('status')) {
                        return 0;
                    }

                    if (this.searchMeta.get('sortByDirection') === 'ASC') {
                        return ordinals[left.get('status')] < ordinals[right.get('status')] ? -1 : 1;
                    }
                    return ordinals[left.get('status')] > ordinals[right.get('status')] ? -1 : 1;
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
                    if (left.get('emailAddress') === right.get('emailAddress')) {
                        return 0;
                    }

                    if (this.searchMeta.get('sortByDirection') === 'ASC') {
                        return left.get('emailAddress') < right.get('emailAddress') ? -1 : 1;
                    }
                    return left.get('emailAddress') > right.get('emailAddress') ? -1 : 1;
                },
                organisation: function (left, right) {
                    if (left.get('organisation') === right.get('organisation')) {
                        return 0;
                    }

                    if (this.searchMeta.get('sortByDirection') === 'ASC') {
                        return left.get('organisation') < right.get('organisation') ? -1 : 1;
                    }
                    return left.get('organisation') > right.get('organisation') ? -1 : 1;
                }
            },

            searchMethods: {
                createdAt: function (model, needle) {
                    return model.get('createdAt').replace(/ \d\d:\d\d:\d\d/, '').split('-').reverse().join('/').indexOf(needle) > -1;
                }
            },

            searchFields: ['createdAt', 'status', 'name', 'emailAddress', 'organisation', 'description'],

            /**
             *  The URL for this resource.
             *
             * @var {string}
             */
            url: App.apiEndpoint() + "/admin/bulk-upload-requests",

            initialize: function (options) {
                App.Common.Collections.DataTableCollection.prototype.initialize.call(this, options);
                this.on("approved denied", function (model) {
                  location.reload();
                });
            },

            parse: function (response) {
                return response.newRequests;
            }

        });

    });

});
