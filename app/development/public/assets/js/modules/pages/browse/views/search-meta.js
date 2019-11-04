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
    var Template = require("text!./search-meta.html");

    /** Define module **/
    App.module("Browse", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.SearchMeta = Backbone.Marionette.ItemView.extend({

            template: function(serializedModel){
                return _.template(Template, serializedModel);
            }

        });

    });

});