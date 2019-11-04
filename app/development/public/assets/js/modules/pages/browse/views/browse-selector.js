/**
 *  Browse Page
 *
 * @module pages/browse
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
    var Template = require("text!./browse-selector.html");

    /** Define module **/
    App.module("Browse", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.BrowseSelector = Backbone.Marionette.ItemView.extend({

            template: function(serializedModel){
                return _.template(Template, serializedModel);
            },

            onRender: function () {
                this.$el.find("select")
                    .val(this.options.page)
                    .change(function () {
                        window.location = "/#!browse/" + this.value;
                    });
            }

        });

    });

});