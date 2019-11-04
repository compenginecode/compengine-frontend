define(function (require) {

  /** Global dependencies **/
  var App = require("app");
  var Backbone = require("backbone");

  /** Local dependencies **/
  var SearchMeta = require("../models/search-meta");

  /** Module definition **/
  App.module("Common.Collections", function (Module, Application, Backbone) {

    /** Define route controller **/
    Module.DataTableCollection = Backbone.Collection.extend({

      defaultSortByField: null,

      defaultSortByDirection: 'ASC',

      initialize: function () {
        this.searchMeta = new App.Common.Models.SearchMeta({
          sortByField: this.defaultSortByField,
          sortByDirection: this.defaultSortByDirection
        });

        this._originalModels = this.models;

        this.on('reset', function () {
          this._originalModels = this.models;
        });

        if (this.remoteProcessing) {
          this.comparator = undefined;
        }
      },

      remoteProcessing: false,

      sortingMethods: {},

      searchFields: [],

      searchMethods: {},

      comparator: function (left, right) {
        if (! this.searchMeta.get('sortByField')) {
          return -1;
        }

        var sortingMethod = this.sortingMethods[this.searchMeta.get('sortByField')];

        if (! sortingMethod) {
          return -1;
        }

        return sortingMethod.call(this, left, right);
      },

      sortBy: function (field, direction) {
        direction = 'DESC' === direction ? 'DESC' : 'ASC';
        this.searchMeta.set('sortByField', field);
        this.searchMeta.set('sortByDirection', direction);
        this.searchMeta.set('page', 1);

        if (this.remoteProcessing) {
          return this.sortByRemote();
        }

        return this.sort();
      },

      sortByRemote: function () {
        var data = this.searchMeta.get('searchData');

        data = Object.assign({}, data, {
          page: this.searchMeta.get('page'),
          sortByField: this.searchMeta.get('sortByField'),
          sortByDirection: this.searchMeta.get('sortByDirection')
        });

        return this.fetch({ data: data });
      },

      sortByDesc: function (field) {
        return this.sortBy(field, 'DESC');
      },

      sortByToggle: function (nextField) {
        var currentField = this.searchMeta.get('sortByField');
        var currentDirection = this.searchMeta.get('sortByDirection');

        if (currentField === nextField && 'ASC' === currentDirection) {
          return this.sortByDesc(nextField);
        }

        return this.sortBy(nextField);
      },

      fetchPage: function (page) {
        this.searchMeta.set('page', page);

        var data = this.searchMeta.get('searchData');

        data = Object.assign({}, data, {
          page: this.searchMeta.get('page'),
          sortByField: this.searchMeta.get('sortByField'),
          sortByDirection: this.searchMeta.get('sortByDirection')
        });

        return this.fetch({ data: data });
      },

      search: function (needle) {
        var that = this;
        this.searchMeta.set('searchText', needle);
        this.models = this._originalModels.filter(function (model) {
          return that.searchFields.filter(function (field) {
            var searchMethod = that.searchMethods[field];
            if (searchMethod) {
              return searchMethod(model, needle);
            }

            var haystack = model.get(field);

            if (null === haystack) {
              return false;
            }

            return haystack.toLowerCase().indexOf(needle.toLowerCase()) > -1;
          }).length > 0;
        });
        this.sort();
      },

      searchCustomRemote: function (data) {
        this.searchMeta.set('searchText', '');
        this.searchMeta.set('searchData', data);
        this.searchMeta.set('page', 1);

        data = Object.assign({
          page: this.searchMeta.get('page'),
          sortByField: this.searchMeta.get('sortByField'),
          sortByDirection: this.searchMeta.get('sortByDirection')
        }, data);

        return this.fetch({ data: data });
      }

    });

  });

});
