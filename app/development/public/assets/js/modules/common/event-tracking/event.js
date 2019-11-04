define(function(require){

  /** Global dependencies **/
  var App = require("app");
  var Backbone = require("backbone");
  var Marionette = require("marionette");

  /** Module definition **/
  App.module("Common.EventTracking", function(Module, Application, Backbone){

      /** Define route controller **/
      Module.Event = Backbone.Model.extend({

        defaults: {
          eventCategory: undefined,
          eventAction: undefined,
          eventLabel: undefined,
          eventValue: undefined
        },

        send: function () {
          gtag('event', this.get('eventAction'), {
            'event_category': this.get('eventCategory'),
            'event_label': this.get('eventLabel'),
            'value': this.get('eventValue'),
          });
        }

      });

  });

});
