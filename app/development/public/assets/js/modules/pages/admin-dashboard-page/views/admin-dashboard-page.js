"use strict";

define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var Footer = require("modules/common/views/footer/footer");
    var Navigation = require("modules/common/views/navigation/navigation");

    var Template = require("text!./admin-contributors-page.html");

    /** Define module **/
    App.module("AdminDashboardPageModule", function(Module, Application, Backbone) {

        var DashboardRoute = Backbone.Model.extend({
            urlRoot: function(){
                return App.apiEndpoint() + "/admin/dashboard";
            },
        });

        /** Define module view **/
        Module.View = Backbone.Marionette.BossView.extend({

            DEFAULT_ERROR_TEXT: "Uh oh! That didn't work :(",

            /**
             *  Subviews
             */
            subViews: {
                footer: App.Common.Footer.View,
                navigation: App.Common.Navigation.View
            },

            /**
             *  Containers for the sub views
             */
            subViewContainers: {
                footer: "#footer-container",
                navigation: "#navigation-container"
            },

            /**
             *  Listen to the events propagated from the subviews
             */
            subViewEvents: {
                "navigation render": "onXNavigationRender"
            },

            initialize: function (options) {
                Backbone.Marionette.BossView.prototype.initialize.call(this, options);
            },

            /**
             *  Set active state on navigation once it has rendered.
             */
            onXNavigationRender: function() {
                this.navigation.setNavigationItemAsActive("admin-contributors");
            },

            /**
             *  Returns a rendered template.
             *
             * @param serializedModel
             * @returns {Function}
             */
            template: function(serializedModel){
                return _.template(Template, serializedModel);
            },

            /**
             * When the DOM is finished painting, we will hide the loader.
             */
            onRender: function(){
                var that = this;
                var model = new DashboardRoute();
                var deferred = model.fetch();

                deferred.done(function(result){
                    that.$el.find('[data-role=total-time-series]').text(result.totalTimeSeries);
                    that.$el.find('[data-role=total-individually-uploaded-time-series]').text(result.totalIndividuallyUploadedTimeSeries);
                    that.$el.find('[data-role=total-bulk-uploaded-time-series]').text(result.totalBulkUploadedTimeSeries);
                    App.hidePageLoader();
                });
            }

        });

    });

});
