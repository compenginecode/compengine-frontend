define(function(require){

  /** Global dependencies **/
  var App = require("app");
  var Backbone = require("backbone");
  var BossView = require("bossview");
  var Marionette = require("marionette");

  /** Template **/
  var Template = require("text!./index.html");

  /** Define module **/
  App.module("Common.Infographic", function(Module, Application, Backbone) {

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
          }

      });

  });

});