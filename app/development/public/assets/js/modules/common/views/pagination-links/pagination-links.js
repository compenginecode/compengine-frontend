/**
 *  Pagination Links Component
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
    var Template = require("text!./pagination-links.html");

    /** Define module **/
    App.module("Common.PaginationLinks", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.View = Backbone.Marionette.ItemView.extend({

            tagName: "span",

            ui: {
                nextButton: "[data-next-btn]",
                prevButton: "[data-prev-btn]",
                pageButton: "[data-page-btn]"
            },

            events: {
                "click @ui.nextButton": function (e) {
                    if (this.model.get("page") < this.pageCount()) {
                        this.trigger("page", parseInt(this.model.get("page")) + 1);
                    }
                    if (!this.urlBased) {
                        e.preventDefault();
                    }
                },
                "click @ui.prevButton": function (e) {
                    if (this.model.get("page") > 1) {
                        this.trigger("page", parseInt(this.model.get("page")) - 1);
                    }
                    if (!this.urlBased) {
                        e.preventDefault();
                    }
                },
                "click @ui.pageButton": function (e) {
                    var page = $(e.currentTarget).attr("data-page-btn");
                    if (page != this.model.get("page")) {
                        this.trigger("page", page);
                    }

                    if (!this.urlBased) {
                        e.preventDefault();
                    }
                }
            },

            modelEvents: {
                "change": "render"
            },

            initialize: function (options) {
                Backbone.Marionette.ItemView.prototype.initialize.call(this, options);

                if (undefined !== options.urlBased) {
                    this.urlBased = options.urlBased;
                }
            },

            urlBased: true, // url or model based

            templateHelpers: function () {
                var that = this;
                var urlComponents = window.location.hash.split("/").filter(Boolean);
                var currentPage = 1;
                if (this.urlBased) {
                    if (urlComponents[urlComponents.length - 1].match(/^\d+$/)) {
                        currentPage = urlComponents.pop();
                    }
                } else {
                    currentPage = this.model.get("page");
                }

                return {
                    baseUrl: urlComponents.join("/"),
                    currentPage: parseInt(currentPage),
                    nextPage: (this.pageCount == currentPage ? pageCount : parseInt(currentPage) + 1),
                    prevPage: (1 == currentPage ? 1 : parseInt(currentPage) - 1),
                    pageCount: Math.ceil(that.model.get("total") / that.model.get("pageSize"))
                }
            },

            template: function(serializedModel){
                return _.template(Template, serializedModel);
            },

            pageCount: function () {
                return Math.ceil(this.model.get("total") / this.model.get("pageSize"));
            }

        });

    });

});