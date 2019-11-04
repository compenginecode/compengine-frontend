define(function (require) {

  /** Global dependencies **/
  var App = require("app");
  var Backbone = require("backbone");

  /** Module definition **/
  App.module("Common.Models", function (Module, Application, Backbone) {

    /** Define model **/
    Module.SearchMeta = Backbone.Model.extend({

      defaults: {
        total: 0,
        pageSize: 10,
        page: 1,
        sortByField: null,
        sortByDirection: 'ASC',
        searchText: '',
        searchData: {}
      }

    });

  });

});
