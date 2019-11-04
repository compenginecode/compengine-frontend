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
    var Template = require("text!./source-card.html");

    /** Define module **/
    App.module("Browse.BrowseSourcePage", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.SourceCard = Backbone.Marionette.ItemView.extend({

            template: function(serializedModel){
                return _.template(Template, serializedModel);
            }

        });

    });

});