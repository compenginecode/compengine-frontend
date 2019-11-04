define(function(require) {

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");
    var Radio = require("backbone.radio");

    /** HTML template **/
    var Template = require("text!./legend.html");
    var Category = require("./category/category");

    /** Define module **/
    App.module("VisualizePage.Sidebar.Legend", function (Module, Application, Backbone) {

        Module.View = Marionette.CompositeView.extend({

            childView: Module.Category.View,

            /**
             *  Returns a rendered template.
             *
             * @param serializedModel
             * @returns {Function}
             * @protected
             */
            template: function(serializedModel){
                return _.template(Template, serializedModel);
            },

            childViewOptions: function (){
                return {
                    collection: this.collection
                };
            },

            initialize: function(){
                this.collection = new Backbone.Collection();
                this.collection.comparator = function(element){
                    return -element.get("rank");
                };

                this.staticallyReorder();
            },

            staticallyReorder: function(){
                this.collection.sort();
                this.render();
            },

            removeDifference: function(categories){
                /** Must be synchronous! **/
                this.children.forEach(function(aChild){
                    if (-1 === categories.indexOf(aChild.model.get("name"))){
                        aChild.model.destroy();
                    }
                });
            },

            reRender: function(){
                this.collection.sort();
                this.collection.set(this.collection.models.slice(0, 11));
                var other = this.collection.findWhere({
                    name: "Other"
                });

                /** Set other as the last **/
                if(undefined !== other) {
                    other.set("rank", 0);
                }

                /** Re sort **/
                this.collection.sort();

                this.render();
            },

            updateCategory: function(categoryName, rank, hex){
                var model = this.collection.findWhere({
                    name: categoryName
                });

                /** If the category exists already **/
                if (model) {
                    model.set("rank", rank);
                    model.set("hex", hex);

                } else {

                    /** Otherwise create a new model in the category **/
                    this.collection.add({
                        name: categoryName,
                        rank: rank,
                        hex: hex
                    });
                }
            }

        });

    });

});
