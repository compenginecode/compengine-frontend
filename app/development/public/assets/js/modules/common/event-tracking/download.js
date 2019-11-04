define(function(require){

  /** Global dependencies **/
  var App = require("app");
  var Backbone = require("backbone");
  var Marionette = require("marionette");
  var Event = require("modules/common/event-tracking/event");

  /** Module definition **/
  App.module("Common.EventTracking", function(Module, Application, Backbone){

      /** Define route controller **/
      Module.Download = Module.Event.extend({

        defaults: {
          eventCategory: 'Download',
          eventAction: 'download',
          eventLabel: undefined,
          eventValue: undefined
        }

      });

  });

});
