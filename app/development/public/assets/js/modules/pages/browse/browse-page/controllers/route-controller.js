define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var LandingPageView = require("../views/browse-page");

    /** Module definition **/
    App.module("BrowsePage", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.RouteController = Backbone.Marionette.Controller.extend({

            /**
             * Setup routes for this module
             */
            appRoutes: {
                "!browse(/)": "browsePageRoute"
                // "!browse/category(/)(:category)(/)(:subCategory)": "browseCategoryRoute",
                // "!browse/tags(/)(:tag)": "browseTagsRoute"
            },

            /**
             * When the /demo route is hit, we want to show the correct view.
             */
            browsePageRoute: function(){
                App.appWrap.getRegion("app").show(new Module.View());
            },

            /**
             * When the user hits /category & /category/:category, we'll show the category view.
             *
             * @param category {String} The category (Optional, only sent when there is a category)
             * @param subCategory {String} The sub category (Optional, only sent when there is a category & sub category)
             */
            // browseCategoryRoute: function(category, subCategory) {
            //     var CategoryList = Backbone.Marionette.CollectionView.extend({
            //         childView: Module.CategoryCard
            //     });
            //
            //     var options = {
            //         view: "category"
            //     };
            //
            //     /** If we get the category passed, send it to the view **/
            //     if (undefined !== category && null !== category) {
            //         options.category = {
            //             name: category
            //         };
            //     } else {
            //         var categories = new Module.Models.CategoryCollection();
            //         categories.fetch();
            //         options.resultsList = new CategoryList({collection: categories});
            //     }
            //
            //     if (undefined !== category && null !== category && undefined !== subCategory && null !== subCategory) {
            //         options.category.subView = subCategory;
            //     }
            //
            //     App.appWrap.getRegion("app").show(new Module.View(options));
            // },

            /**
             * When the user hits /tag & /tag/:tag, we'll show the tag view.
             *
             * @param tag {String} The category (Optional, only sent when there is a tag)
             */
            // browseTagsRoute: function(tag) {
            //     var options = {
            //         view: "tag"
            //     };
            //
            //     /** If we get the tag passed, send it to the view **/
            //     if (undefined !== tag) {
            //         options.tag = tag;
            //     }
            //
            //     App.appWrap.getRegion("app").show(new Module.View(options));
            // }

        });

    });

});