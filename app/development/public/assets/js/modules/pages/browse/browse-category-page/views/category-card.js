/**
 *  Browse Page
 *
 * @module pages/browse-page
 * @memberof Pages
 * @see Pages
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Local dependencies **/

    /** HTML template **/
    var Template = require("text!./category-card.html");

    /** Define module **/
    App.module("Browse.BrowseCategoryPage", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.CategoryCard = Backbone.Marionette.CompositeView.extend({

            template: function(serializedModel){
                return _.template(Template, serializedModel);
            },

            templateHelpers: function () {
                var that = this;
                return {
                    // slugChain: that.options.slugChain,
                    depth: that.options.depth
                }
            },

            childViewContainer: "section",

            childViewOptions: function () {
                var clone = _.clone(this.options);
                delete clone["model"];
                return clone;
            },

            initialize: function (options) {
                Backbone.Marionette.CompositeView.prototype.initialize.call(this, options);
                // var slug = this.model.get("slug");
                // this.options.slugChain = undefined === this.options.slugChain ? slug : this.options.slugChain + "/" + slug;
                this.options.depth = undefined === this.options.depth ? 0 : this.options.depth + 1;
                this.collection = this.model.get("children");
            }

        });

    });

});