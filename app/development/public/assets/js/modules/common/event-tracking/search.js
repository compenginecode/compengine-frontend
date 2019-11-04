define(function(require){

  /** Global dependencies **/
  var App = require("app");
  var Backbone = require("backbone");
  var Marionette = require("marionette");
  var Event = require("modules/common/event-tracking/event");

  /** Module definition **/
  App.module("Common.EventTracking", function(Module, Application, Backbone){

      /** Define route controller **/
      Module.Search = Module.Event.extend({

        defaults: {
          eventCategory: 'Search',
          eventAction: 'search',
          eventLabel: undefined,
          eventValue: undefined
        }

      });

  });

});
