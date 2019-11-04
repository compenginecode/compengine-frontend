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
    var Template = require("text!./searching-by.html");

    /** Define module **/
    App.module("Browse.TimeseriesResultsPage", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.SearchingBy = Backbone.Marionette.ItemView.extend({

            events: {
                'click [data-role="download-results"]': 'onDownloadAllResultsButtonClick'
            },

            onDownloadAllResultsButtonClick: function(){
                var format = this.$el.find('#export-type').val();
                this.trigger('download-all-results', format);
            },

            template: function(serializedModel){
                return _.template(Template, serializedModel);
            }

        });

    });

});