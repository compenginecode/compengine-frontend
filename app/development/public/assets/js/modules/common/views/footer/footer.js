define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var ConfigurationStore = require("modules/common/controllers/configuration-store");

    /** Template **/
    var Template = require("text!./footer.html");

    /** Define module **/
    App.module("Common.Footer", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.View = Backbone.Marionette.BossView.extend({

            /**
             * Returns a rendered template.
             *
             * @param serializedModel {Object} An object with data for the template to render
             * @returns {Function} Rendered template
             * @protected
             */
            template: function(serializedModel){
                return _.template(Template, serializedModel);
            },

            /**
             *  On initialization, we'll setup a Configuration controller.
             *
             * @protected
             */
            initialize: function() {
                this.configStore = new App.ConfigurationStore.Controller();
            },

            /**
             *  When the dom has been rendered
             *
             * @protected
             */
            onRender: function() {
                console.log("(version " + this.configStore.getAppVersion() + ")");
            }

        });

    });

});