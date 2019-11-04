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
    var Template = require("text!./search-again.html");

    /** Define module **/
    App.module("Browse.TimeseriesResultsPage", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.SearchAgain = Backbone.Marionette.ItemView.extend({

            template: function(serializedModel){
                return _.template(Template, serializedModel);
            },

            events: {
                'click [data-role="download-results"]': 'onDownloadAllResultsButtonClick'
            },

            onDownloadAllResultsButtonClick: function(){
                var format = this.$el.find('#export-type').val();
                this.trigger('download-all-results', format);
            },

            onRender: function () {
                this.$el.find("form").submit(function (e) {
                    if (query = $(this).find("input").val()) {
                        window.location = "/#!search/" + query;
                    }
                    e.preventDefault();
                });

            }

        });

    });

});
