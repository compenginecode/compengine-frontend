/**
 *  Navigation
 *
 * @module common/navigation
 * @memberof Pages
 * @see Pages
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var Bootstrap = require("bootstrap");
    var Radio = require("backbone.radio");
    var IdentityAccessManager = require("modules/common/controllers/identity-access-management");

    /** Template **/
    var AdminNav = require("text!./admin-navigation.html");
    var Template = require("text!./navigation.html");

    /** Define module **/
    App.module("Common.Navigation", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.View = Backbone.Marionette.BossView.extend({

            /**
             *  DOM Events
             *
             * @protected
             */
            events: {
                "click [role='search-button']": "onSearchSubmitClick",
                "keypress .search-button": "onSearchSubmitKeypress",
                "blur .search-input": "onSearchInputBlur",
                "click #navigation-title": "onNavigationTitleClick",
                "click [data-role='logout']": "onLogoutClick"
            },

            /**
             * Returns a rendered template.
             *
             * @param serializedModel {Object} An object with data for the template to render
             * @returns {Function} Rendered template
             * @protected
             */
            template: function(serializedModel){
                return _.template(Template, serializedModel);
            },

            templateHelpers: function() {
                var that = this;

                return {
                    administrationNav: that.administrationNav()
                };
            },

            administrationNav: function() {
                var value = "";

                if (App.IdentityAccessManagement.Controller.sessionExists()) {
                    value = _.template(AdminNav)();
                }

                return value;
            },

            /**
             *  Setup the radio channel before anything has started to render.
             *
             * @protected
             */
            initialize: function() {
                this.globalChannel = Backbone.Radio.channel("global");
                this.navigationChannel = Backbone.Radio.channel("navigation");
            },

            setNavigationItemAsActive: function(navigationItem) {
                var $navItem = this.$el.find("#" + navigationItem);

                /**
                 * Guard
                 */
                if(0 >= $navItem.length) {
                    return "No navigation items found with the ID " + navigationItem;
                }

                /** Probably reset active states here **/
                $navItem.addClass("active");
            },

            /**
             * When the user clicks the search button, it will need to know the context of its siblings,
             * eg/ If the search is open it will submit the search.
             *
             * @param e {Event} The click event
             * @protected
             */
            onSearchSubmitClick: function(e) {
                if(this.searchHasFocus) {
                    var query = this.$el.find("form input").val().trim();
                    /** Submit **/
                    if (query !== "") {
                        Backbone.history.navigate("/!search/" + query, {
                            trigger: true,
                            replace: true
                        });
                    }
                    e.preventDefault();
                } else {
                    this.searchHasFocus = true;
                    this.__showSearch(e);
                }
            },

            /**
             * When the search input no longer has focus, we want to verify that the app has memory of it opening
             * and then we will change the state back to it being closed and close it!
             *
             * We need to keep the state in check at all steps of the process,
             * otherwise whats the point of state management!
             *
             * @param e {Event} The blur event
             * @protected
             */
            onSearchInputBlur: function(e) {
                if(this.searchHasFocus) {
                    this.searchHasFocus = false;
                    this.__closeSearch(e);
                }
            },

            /**
             * When the navigation title is clicked, we're going to send out an alert to any pages that might be
             * listening this will reduce the amount of logic in certain parts of the app.
             *
             * @param e {Event} The click event
             * @protected
             */
            onNavigationTitleClick: function(e) {
                window.location = "#";

                return;
                /**
                 * When the navigation title is clicked
                 *
                 * @event navigation:navigationTitleClicked
                 * @param e {Event} The click event
                 * @since 0.1.0
                 * @public
                 * @example
                 * var navigationChannel = Backbone.Radio.channel("navigation");
                 * var that = this;
                 * navigationChannel.on("navigationTitleClicked", function(e) {
                 *      e.preventDefault();
                 *
                 *      // Assume this refers to a view
                 *      that.render();
                 * });
                 */
                this.navigationChannel.trigger("navigationTitleClicked", e);

                /**
                 * Because a trigger won't tell us if any listeners have prevented the event, we will use
                 * a request/response system that will allow us to let the listeners call in and essentially
                 * allow us to have a much more versatile eventing system.
                 */
                var canChange = this.navigationChannel.request("navigationCanChangePage");

                /**
                 * If there was no response or a listener responded allowing navigation, we will navigate.
                 */
                if(undefined === canChange || true === canChange) {
                    App.router.navigate("/#!", {
                        trigger: true
                    });
                }

            },

            /**
             *  Opens the search bar
             *
             * @param e {Event} A click event that is passed through
             * @private
             */
            __showSearch: function(e) {
                e.preventDefault();
                var $search = this.$el.find("form[role='search']");
                this.$el.find("[role='links']").hide();

                /**
                 * Because the input is transparent, We'll set its opacity to 1 & then show it.
                 */
                $search.find("input[type='text'].search-input").css("opacity", "1").show();

                /** Animate its width **/
                $search.animate({
                    width: "330px"
                }, 350);

                /**
                 * We get offset by about 2px when the width is changed,
                 * so we'll adjust that during the 300ms animation
                 */
                $search.find("[role='search-button']").css("right", "2px");

                /** Give it focus **/
                $search.find("input[type='text'].search-input").focus();
            },

            /**
             *  Closes the search bar
             *
             * @private
             */
            __closeSearch: function() {
                var $search = this.$el.find("[role='search']");
                this.$el.find("[role='links']").show();

                /**
                 * Because we don't have anything in the style attribute before the search opens, We can just nuke it
                 * and it will return to default state!
                 */
                $search[0].removeAttribute("style");
                $search.find("input[type='text'].search-input")[0].removeAttribute("style");
                $search.find("[role='search-button']")[0].removeAttribute("style");

                /** Clear values **/
                $search.find("input[type='text'].search-input").val("");
            },

            /**
             *  For accessibility, we'll run the same function as click if they press space on the search icon.
             *
             * @param e {Event} Keypress event
             */
            onSearchSubmitKeypress: function(e) {
                console.log(e.keyCode);
                if (e.keyCode == 0 || e.keyCode == 32 || e.keyCode == 13) {
                    e.preventDefault();
                    this.onSearchSubmitClick(e);
                }
            },

            onLogoutClick: function() {
                App.IdentityAccessManagement.Controller.logout();
                this.render();
            }

        });

    });

});