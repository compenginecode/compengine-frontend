define(function (require) {

  /** Global dependencies **/
  var App = require("app");
  var Backbone = require("backbone");
  var Marionette = require("marionette");

  /** Module definition **/
  App.module("Controllers.CompatibilityChecker", function (Module, Application, Backbone) {

    /** Define route controller **/
    Module.Controller = Marionette.Object.extend({

      initialize: function () {
        var that = this;

        this.minScreenSizeDisclaimerShown = false;

        if (! this.isMinScreenSizeMet() || ! this.isSupportedBrowser()) {
          if (! this.isMinScreenSizeMet() && ! this.isSupportedBrowser()) {
            this.minScreenSizeDisclaimerShown = true;
            alert('CompEngine is designed to use on at least 1024px wide screen. Only Chrome and Firefox browsers are supported.');
          } else if (! this.isMinScreenSizeMet()) {
            this.minScreenSizeDisclaimerShown = true;
            alert('CompEngine is designed to use on at least 1024px wide screen.');
          } else {
            alert('Only Chrome and Firefox browsers are supported');
          }
        }

        $(window).on('resize', function () {
          if (! that.minScreenSizeDisclaimerShown && ! that.isMinScreenSizeMet()) {
            that.minScreenSizeDisclaimerShown = true;
            alert('CompEngine is designed to use on at least 1024px wide screen.');
          }
        });
      },

      isMinScreenSizeMet: function () {
        return $(window).width() >= 1024;
      },

      isSupportedBrowser: function () {
        return !! navigator.userAgent.toLowerCase().match(/(chrome|firefox)/);
      }

    });

  });

});
