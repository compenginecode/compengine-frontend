/**
 *  This project makes extensive use of "modals", or transiently instantiated
 *  views related to a model. It also requires that the same type of modal can
 *  be instantiated many times at once, as well as the requirement of high reuse.
 *
 *  As such, modals cannot be directly implanted into the DOM by the designer. Instead
 *  they must be dynamically placed and handled, while still supporting model binding,
 *  cleanup of memory, etc.
 *
 * @type {*}
 * @version 1.1
 * @module modal-registration
 * @namespace Modals
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");
    var Radio = require("backbone.radio");

    /**
     * Denotes the maximum number of modals allowable at once
     *
     * @memberOf Modals
     * @type {number}
     * @protected
     */
    var MODAL_LIMIT = 3;

    /**
     * Current count of the number of visible modals
     *
     * @memberOf Modals
     * @type {number}
     * @protected
     */
    var modalCount = 0;

    /**
     *  This variable acts as a singleton instance counter, and is used to
     *  seed valid, non-conflicting IDs for each modal.
     *
     * @memberOf Modals
     * @type {number}
     * @protected
     */
    var increment = 0;

    /**
     * Tune into the global radio
     */
    var globalChannel = Backbone.Radio.channel("global");

    /**
     *  Tune into modal radio
     *  We will be propagating events through this.
     */
    var modalChannel = Backbone.Radio.channel("modals");

    /**
     *  Tune into prompt radio
     *  We will be propagating events through this.
     */
    var promptChannel = Backbone.Radio.channel("prompts");

    /**
     *  We use a Marionette LayoutView, where we dynamically add new regions
     *  for each view. We do this so we can show multiple modals at the same time
     *  (due to the multiple regions!)
     *
     * @memberOf Modals
     * @private
     * @type {Marionette.LayoutView|Object}
     * @since 0.1.0
     */
    var AppLayoutView = Backbone.Marionette.LayoutView.extend({
        template: "<div><br></div>",

        regions: {},

        /**
         *  Appends a new view to the modal container. newView should be a
         *  new instance of a Backbone.Modal modal.
         *
         * @param newView {Backbone.Modal} A Backbone Modal View
         * @memberOf Modals
         * @since 0.1.0
         * @protected
         */
        appendView: function (newView){
            increment++;
            this.$el.append('<div id="view' + increment + '" >') ;
            this.regionManager.addRegion("view" + increment , "#view" + increment);
            this["view" + increment].show(newView);

            /** Add event listeners **/
            this.addBSEventListeners("#view" + increment);
        },

        /**
         *  Adds Bootstrap event listeners
         *
         *  Once they're triggered, we will propagate them out via a one to many eventing system.
         *
         * @see https://v4-alpha.getbootstrap.com/components/modal/#events
         * @param view {String} The jQuery Selector for the element (EG- .element or #element)
         * @memberOf Modals
         * @since 1.1
         * @protected
         */
        addBSEventListeners: function(view) {
            var $el = this.$el.find(view);

            /**
             *  Once the modal is shown and the CSS animations are done,
             *  We trigger a "modalShown" event on the modal channel.
             */
            $el.on("shown.bs.modal", function(e) {
                modalChannel.trigger("modalShown", e);
            });

            /**
             *  Once the modal is hidden and the CSS animations are done,
             *  We trigger a "modalHidden" event on the modal channel.
             */
            $el.on("hidden.bs.modal", function(e) {
                modalChannel.trigger("modalHidden", e);
            });

            /**
             *  Once the modal is loaded (Doesn't wait for CSS Animations!),
             *  We trigger a "modalLoaded" event on the modal channel.
             */
            $el.on("loaded.bs.modal", function(e) {
                modalChannel.trigger("modalLoaded", e);
            });

        },

        /**
         *  Remove a specific modal or the last modal to be opened.
         *
         * @memberOf Modals
         * @param modalNumber
         * @since 0.1.0
         * @protected
         */
        removeView: function(number) {
            var num = increment + 0;

            this.$el.find("#view" + num).remove();
            this.regionManager.removeRegion("view" + num , "#view" + num);

            /** Decrement **/
            increment--;
            modalCount--;
        },

        decrementView: function(viewNum) {
            this.regionManager.removeRegion("view" + viewNum , "#view" + viewNum);

            var elems = this.$el.find("[id^=view]");
            var regionManager = this.regionManager;

            $.each(elems, function(index, element) {
                var increment = element.getAttribute("id").split("view")[1];

                if(parseInt(increment) === parseInt(viewNum)) {
                    $(element).remove();
                    return;
                }

                element.setAttribute("id", "view" + (parseInt(increment) - 1));
                regionManager._regions["view" + (parseInt(increment) - 1)] = regionManager._regions["view" + parseInt(increment)];
                delete regionManager._regions["view" + parseInt(increment)];
            });
        }

    });

    /** Place layout view into the DOM **/
    var layoutView = new AppLayoutView();
    App.appWrap.modals.show(layoutView);

    /**
     *  Clears all modals presently visible in the app.
     *
     * @memberOf Modals
     * @since 0.1.0
     * @public
     */
    App.clearModals = function(){
        App.appWrap.getRegion("modals").reset();
        var layoutView = new AppLayoutView();
        App.appWrap.getRegion("modals").show(layoutView);

        /** Reset **/
        modalCount = 0;
        increment = 0;
    };

    /**
     *  Close a given modal or the last open modal.
     *
     * @memberOf Modals
     * @since 0.1.0
     * @public
     */
    App.closeModal = function(modal) {
        App.appWrap.getRegion("modals").currentView.removeView(modal);
    };

    /**
     *  Shows the given modal, and let's the app take care of how. We don't want leaky abstraction.
     *
     * @param newView {Backbone.Modal} The modal view you want to render
     * @param closedCallback {Function} Callback function that will fire once the modal has closed.
     * @param type {String} The type (Modal or prompt)
     * @param showMethod {String} The way you wish to show the Modal or Prompt
     * @param showOptions {Object} The options parameter for the show method.
     * @throws {Error} Modal depth reached
     * @memberOf Modals
     * @since 0.1.0
     * @public
     * @example
     * var newModal = new App.Modals.NewModal.View();
     * App.showModal(newModal);
     */
    App.showModal = function(newView, closedCallback, type, showMethod, showOptions){

        /**
         * These are the original default values, we can override them for prompts or any future additions to the modal
         * family.
         */
        type = type || "modal";
        showMethod = showMethod || "show";
        showOptions = showOptions || null;

        newView.on("modalClosed", function(){
            App.closeModal();
        });

        modalChannel.on("modalCompletedSuccess", function(response){
            modalChannel.off("modalCompletedSuccess");

            if (closedCallback) {
                closedCallback(response);
            }
        });

        /**
         * If the modalCount is less than the global depth restriction then we proceed to show it.
         * Additionally, if the modal requests to bypass the depth restriction, we also proceed.
         */
        if (modalCount < MODAL_LIMIT || (true === newView.bypassDepthRestrictions)) {
            /** Get the current view in the modals region **/
            var currentView = App.appWrap.getRegion("modals").currentView;

            /** Show the new view **/
            currentView.appendView(newView);

            /** Show the modal (no idea why you need to call .show() but you do) **/
            currentView.$el.find("." + type)[showMethod](showOptions);

            /** Increment **/
            modalCount++;
        } else {
            throw new Error("Modal depth reached.");
        }
    };

    /**
     * Gets the number of current modals
     *
     * @returns {number} The current amount of modals rendered
     * @memberOf Modals
     * @since 0.1.0
     * @public
     */
    App.getCurrentModalCount = function(){
        return modalCount;
    };

    /**
     * Decrement the modal count
     * @method decrementModalCount
     * @return {Boolean} Returns true
     */
    App.decrementModalCount = function(count) {
        modalCount--;
        increment--;

        App.appWrap.getRegion("modals").currentView.decrementView(count);

        return true;
    };

    /**
     * Gets the maximum number of modals supported
     *
     * @returns {number} The maximum amount of modals that can be rendered
     * @memberOf Modals
     * @since 0.1.0
     * @public
     */
    App.getMaxModalDepth = function(){
        return MODAL_LIMIT;
    };

    /**
     *  Clear all the modals when the "back" button is induced.
     *
     * @since 0.1.0
     */
    globalChannel.on("app:pageChange", function() {
        App.clearModals();
    });

    /**
     *  When the app propagates a click event on the body, we want to listen to that so we can close the modal if
     *  they click outside of the modal.
     *
     * @since 0.1.0
     */
    globalChannel.on("app:onBodyClick", function(ev) {
        /**
         * Check if the element clicked is one of the modal's elements for closing the modal.
         */
        if(
            $(ev.target).attr("data-role") === "modal" ||
            $(ev.target).hasClass("modal-backdrop") ||
            $(ev.target).attr("data-dismiss") === "modal" ||
            $(ev.target).parent().attr("data-dismiss") === "modal" ||
            $(ev.target).hasClass("close")
        ) {

            /**
             * Notify all listeners which element was clicked to close the modal
             *
             * @public
             * @event modals:elementClickedToCloseModal
             * @param event {jQuery} A jQuery element of which element was clicked to close the modal.
             * @memberof Modals
             * @example
             * var modalChannel = Backbone.Radio.channel("modals");
             * modalChannel.on("elementClickedToCloseModal", function($element) {
             *     $element.text("hello world");
             * });
             */
            modalChannel.reply("elementClickedToCloseModal", $(ev.target));

            /**
             * Request to close the modal (We shouldn't force close it)
             *
             * @public
             * @event modals:closeCurrentModal
             * @memberof Modals
             * @example
             * var modalChannel = Backbone.Radio.channel("modals");
             * var closeState = true;
             *
             * modalChannel.on("closeCurrentModal", function() {
             *      var $el = modalChannel.request("elementClickedToCloseModal");
             *
             *      if($el.hasClass("close-modal") || closeState) {
             *          modalChannel.trigger("closeCurrentModalReady");
             *      }
             * });
             */
            modalChannel.trigger("closeCurrentModal");
        }
    });

});
