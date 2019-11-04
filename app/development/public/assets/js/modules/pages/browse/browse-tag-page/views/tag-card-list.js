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
    var TagCard = require("./tag-card");
    var MaxFontSize = 4;
    var MinFontSize = 1;

    /** Define module **/
    App.module("Browse.BrowseTagPage", function(Module, Application, Backbone) {

        Module.TagCardList = Backbone.Marionette.CollectionView.extend({

            tagName: "ul",

            childView: Module.TagCard,

            initialize: function (options) {
                Backbone.Marionette.CollectionView.prototype.initialize.call(this, options);

                this.collection.comparator = "name";
                this.collection.sort();

                this.minTagCount = _.min(this.collection.models, function (tag) { return tag.get("total"); }).get("total");
                this.maxTagCount = _.max(this.collection.models, function (tag) { return tag.get("total"); }).get("total");
            },

            childViewOptions: function(model) {
                return {
                    weightedFontSize: this.calculateWeightedFontSize(model.get("total"))
                }
            },

            calculateWeightedFontSize: function (tagCount) {
                if (tagCount > this.minTagCount) {
                    return ((MaxFontSize - 1) * (tagCount - this.minTagCount)) / (this.maxTagCount - this.minTagCount) + 1;
                }
                return 1;
            }

        });

    });

});