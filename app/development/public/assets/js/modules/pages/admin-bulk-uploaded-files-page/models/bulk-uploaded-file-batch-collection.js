define(function (require) {

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Moment = require("moment");

    /** Local dependencies **/
    var BulkUploadedFileBatch = require("./bulk-uploaded-file-batch");
    var DataTableCollection = require("modules/common/collections/data-table-collection");

    /** Module definition **/
    App.module("AdminBulkUploadedFiles.Models", function (Module, Application, Backbone) {

        /** Define route controller **/
        Module.BulkUploadedFileBatchCollection = App.Common.Collections.DataTableCollection.extend({

            model: Module.BulkUploadedFileBatch,

            /**
             *  The URL for this resource.
             *
             * @var {string}
             */
            url: App.apiEndpoint() + "/admin/time-series/batches",

            defaultSortByField: 'status',

            defaultSortByDirection: 'ASC',

            searchFields: ['uploadedAt', 'status', 'contributor', 'source', 'category', 'tags', 'sampling'],

            searchMethods: {
                uploadedAt: function (model, searchText) {
                    return new Moment(model.get("uploadedAt")).format("DD/MM/YY").indexOf(searchText) > -1;
                },
                tags: function (model, searchText) {
                    var haystack = model.get('tags');

                    if (null === haystack) {
                        return false;
                    }

                    return haystack.filter(function (tag) {
                        return tag.toLowerCase().indexOf(searchText.toLowerCase()) > -1;
                    }).length > 0;
                },
                sampling: function (model, searchText) {
                    var haystack = model.get('samplingRate') + ' ' + model.get('samplingUnit');

                    if (null === haystack) {
                        return false;
                    }

                    return haystack.toLowerCase().indexOf(searchText.toLowerCase()) > -1;
                }
            },

            sortingMethods: {
                uploadDate: function (left, right) {
                    var leftTimestamp = (new Date(left.get('uploadedAt'))).getTime();
                    var rightTimestamp = (new Date(right.get('uploadedAt'))).getTime();

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
                contributor: function (left, right) {
                    if (left.get('contributor') === right.get('contributor')) {
                        return 0;
                    }

                    if (this.searchMeta.get('sortByDirection') === 'ASC') {
                        return left.get('contributor') < right.get('contributor') ? -1 : 1;
                    }
                    return left.get('contributor') > right.get('contributor') ? -1 : 1;
                },
                source: function (left, right) {
                    if (left.get('source') === right.get('source')) {
                        return 0;
                    }

                    if (this.searchMeta.get('sortByDirection') === 'ASC') {
                        return left.get('source') < right.get('source') ? -1 : 1;
                    }
                    return left.get('source') > right.get('source') ? -1 : 1;
                },
                category: function (left, right) {
                    if (left.get('category') === right.get('category')) {
                        return 0;
                    }

                    if (this.searchMeta.get('sortByDirection') === 'ASC') {
                        return left.get('category') < right.get('category') ? -1 : 1;
                    }
                    return left.get('category') > right.get('category') ? -1 : 1;
                },
                sampling: function (left, right) {
                    var leftComparisonValue = left.get('samplingRate') + left.get('samplingUnit');
                    var rightComparisonValue = right.get('samplingRate') + right.get('samplingUnit');

                    if (leftComparisonValue === rightComparisonValue) {
                        return 0;
                    }

                    if (this.searchMeta.get('sortByDirection') === 'ASC') {
                        return leftComparisonValue < rightComparisonValue ? -1 : 1;
                    }
                    return leftComparisonValue > rightComparisonValue ? -1 : 1;
                },
                batchSize: function (left, right) {
                    var leftComparisonValue = left.get('files').length;
                    var rightComparisonValue = right.get('samplingRate').length;

                    if (leftComparisonValue === rightComparisonValue) {
                        return 0;
                    }

                    if (this.searchMeta.get('sortByDirection') === 'ASC') {
                        return leftComparisonValue < rightComparisonValue ? -1 : 1;
                    }
                    return leftComparisonValue > rightComparisonValue ? -1 : 1;
                }
            },

            initialize: function (options) {
                App.Common.Collections.DataTableCollection.prototype.initialize.call(this, options);
                this.on("approved denied", function (model) {
                    location.reload();
                });
            },

            parse: function (response) {
                var url = this.url;
                return response.bulkUploadedTimeSeries.map(function (bulkUploadRequest) {
                    return Object.assign({}, bulkUploadRequest, {
                        files: bulkUploadRequest.files.map(function (file) {
                            return Object.assign({}, file, {
                                downloadUrl: url + '/' + file.id + '/download'
                            });
                        })
                    });
                });
            }

        });

    });

});
