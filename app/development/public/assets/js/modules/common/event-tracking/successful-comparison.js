define(function(require){

  /** Global dependencies **/
  var App = require("app");
  var Backbone = require("backbone");
  var Marionette = require("marionette");
  var Event = require("modules/common/event-tracking/event");

  /** Module definition **/
  App.module("Common.EventTracking", function(Module, Application, Backbone){

      /** Define route controller **/
      Module.SuccessfulComparison = Module.Event.extend({

        defaults: {
          eventCategory: 'Comparison',
          eventAction: 'success',
          eventLabel: undefined,
          eventValue: undefined
        }

      });

  });

});
