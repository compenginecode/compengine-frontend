define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");

    /** Local dependencies **/
    var Category = require("./category");

    /** Module definition **/
    App.module("AdminCategoriesPage.Models", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.CategoryCollection = Backbone.Collection.extend({

            model: Module.Category,

            /**
             *  The URL for this resource.
             *
             * @var {string}
             */
            url: App.apiEndpoint() + "/admin/categories",

            initialize: function () {
                this.on("destroy denied", function (model) {
                    this.remove(model);
                });
            },

            // pagination: new Backbone.Model({total: 0, pageSize: 10, page: 1})

            // parse: function (response) {
            //     this.pagination.set({
            //         total: response.total,
            //         pageSize: response.pageSize,
            //         page: response.page
            //     });
            //     return response.items;
            // }

        });

    });

});
