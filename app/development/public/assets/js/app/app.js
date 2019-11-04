/**
 * The global App namespace
 *
 * @namespace App
 * @version 0.1.0
 * @since 0.1.0
 */
define(function(require){

    /** Global dependencies **/
    var Marionette = require("marionette");
    var Radio = require("backbone.radio");
    var Mixpanel = require("mixpanel");

    /**
     *  Create a marionette application and set a property on it called "settings" which stores system wide settings,
     *  to be used by the app components. In some sense, this is DI.
     *
     * @name App
     * @memberof App
     */
    var App = new Backbone.Marionette.Application();

    /**
     *  Version of the frontend
     *
     * @name App.frontEndVersion
     * @memberof App
     * @type {string}
     */
    App.frontEndVersion = "0.10.0";

    /**
     * Setup an eventing system using Backbone.Radio
     */
    var globalChannel = Backbone.Radio.channel("global");

    /**
     * We're listening to a global event to add a class to top level element.
     *
     * This needs to occur AFTER rendering has finished. Otherwise the class will be wiped.
     *
     * @public
     * @event app:addClass
     * @param name {String} The name of the class you want to add to the page.
     * @memberof App
     * @example
     * var globalChannel = Backbone.Radio.channel("global");
     *
     * globalChannel.trigger("app:addClass", "homepage");
     */
    globalChannel.on("app:addClass", function(name){
        /** Only add class if it exists. **/
        if(undefined !== name || "" !== name.trim())  {
            var $app = $(".app-region").children();

            /** Since this element never really has a class, We want to make sure it doesn't have one to start with. **/
            $app.removeClass();
            $app.addClass(name);
        }
    });

    /**
     * We're listening to a global event to add meta tags.
     *
     * @public
     * @event app:addMetaTags
     * @param tags {Object} Hash of social meta properties => value
     * @memberof App
     * @example
     * var globalChannel = Backbone.Radio.channel("global");
     *
     * globalChannel.trigger("app:addMetaTags", {"og:title": "foo"});
     */
    globalChannel.on("app:addMetaTags", function(tags){
        /** Only add class if it exists. **/
        if(undefined !== tags)  {
            $.each(tags, function (property, content) {
                var existingTag = $("[property='" + property + "']");
                if (existingTag.length) {
                    existingTag.attr("content", content);
                } else {
                    var newTag = $("<meta>").addClass("social-meta-tag").attr({property: property, content: content});
                    $("[name='fragment']").after(newTag);
                }
            });
        }
    });

    /**
     * Setup the Application layout view.
     *
     * @memberof App
     * @private
     */
    var AppView = Marionette.LayoutView.extend({

        /**
         * Prevent repainting every time an option is removed.
         *
         * @memberof App
         * @private
         */
        destroyImmediate: true,

        /**
         * Top level element for the entire app
         *
         * @memberof App
         * @private
         */
        el: ".app",

        /**
         * App regions
         *
         * @memberof App
         * @private
         */
        regions: {
            app: ".app-region",
            modals: ".modals"
        },

        /**
         * Returns a rendered template.
         *
         * @memberof App
         * @param serializedModel {Object} An object with data for the template to render
         * @returns {Function} Rendered template
         * @private
         */
        template: function(){
            return _.template("<section class='app-region'></section><section class='modals'></section>");
        }
    });

    /**
     * Render a Marionette.LayoutView & Provide global access to it.
     *
     * @name App.appWrap
     * @memberof App
     * @type {Marionette.LayoutView|Object}
     */
    App.appWrap = new AppView();
    App.appWrap.render();

    /**
     * When a view is cleared, we remove all the body handler events so we get no zombies.
     */
    App.appWrap.getRegion("app").on("empty", function(){
        /**
         * Propagate a pageChange event when the page is changing
         *
         * @public
         * @event app:pageChange
         * @memberof App
         * @example
         * var globalChannel = Backbone.Radio.channel("global");
         *
         * globalChannel.on("app:pageChange", function() {
         *      App.clearModals();
         * });
         */
        globalChannel.trigger("app:pageChange");
    });

    /**
     * Views themselves should not target body clicks. Apart from memory leaking, this breaks
     * the law of demeter and you end up with promiscuous classes.
     *
     * As such, we render a single "on body click" handler on the event aggregator of the app,
     * and other views can subscribe to this instead.
     */
    $("body").on("click", function(ev) {
        /**
         * Propagate an onBodyClick event when <body> gets a click event.
         *
         * @event app:onBodyClick
         * @public
         * @memberof App
        globalChannel.trigger("app:onBodyClick", ev);
         */
    });

    /**
     * Helper to provide the API Endpoint anywhere within the app.
     *
     * @name App.apiEndpoint
     * @memberof App
     * @type {Function}
     * @returns {string}
     */
    App.apiEndpoint = function(){
        return GLOBALS.APIEndpoint;
    };

    /**
     * Show page loader
     *
     * @name App.showPageLoader
     * @memberof App
     * @type {Function}
     */
    App.showPageLoader = function(){
        $(".app-loading").show();
    };

    /**
     * Hide the page loader
     *
     * @name App.hidePageLoader
     * @memberof App
     * @type {Function}
     */
    App.hidePageLoader = function(){
        return $(".app-loading").fadeOut();
    };

    /** Debugging **/
    App.DEBUG = GLOBALS.DEBUG || false;
    App.Version = "0.0.1";

    /**
     * To reduce the amount of times we need to require mixpanel's files, we'll add it into
     * app.
     *
     * @param eventName {String} The event name you're tracking
     * @param eventObj {Object} The object of params you want to send to mixpanel.
     */
    App.trackEvent = function(eventName, eventObj) {
        mixpanel.track(eventName, eventObj);
    };

    /**
     * Identfity a person/entity.
     *
     * @param id {String} The ID String.
     */
    App.identify = function(id) {
        mixpanel.identify(id);
    };

    /**
     * Profile a person via Mixpanel.
     *
     * @param object {Object} The identity object
     */
    App.profilePerson = function(object) {
        mixpanel.people.set(object);
    };

    /** And boom, away we go! **/
    return App;

});
