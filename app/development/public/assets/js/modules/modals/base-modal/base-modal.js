/**
 *  Base Modal
 *
 *  The base modal that all modals inherit from.
 *
 * @module modals/base-modal
 * @memberof Modals
 * @see Modals
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");

    /** Modal dependencies **/
    var Modals = require("modals");

    /** Template **/
    var Template = require("text!./base-modal.html");

    /**
     * Define module
     *
     * @constructor
     */
    App.module("Modals.BaseModal", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.Modal = Backbone.Modal.extend({

            /**
             *  The modal view you're rendering
             *
             * @protected
             */
            bodyView: null,

            /**
             *  Cancel Element
             */
            cancelEl: ".bbm-button",

            /**
             *  Whether or not the modal should be able to close or not.
             *
             * @protected
             */
            closeState: false,

            events: {
                "click [data-dismiss='modal']": "onModalDismissClicked"
            },

            title: "Un-named modal",

            /**
             *  Returns a rendered template.
             *
             * @param serializedModel {Object} An object with data for the template to render
             * @returns {Function}
             */
            template: function(serializedModel){
                return _.template(Template, serializedModel);
            },

            /**
             *  When the dom has been rendered, we want to manipulate the DOM with some plugins.
             *
             * @private
             */
            onRender: function(){
                var that = this;
                var modalBody = this.$el.find(".modal-dialog");

                if (!this.bodyView || null === this.bodyView){
                    throw new Error("bodyView must be set on the base modal.");
                }

                var opts = {
                    modal: that
                };

                if (undefined !== that.options && undefined !== that.options.content) {
                    opts.content = that.options.content;
                }

                this.view = new this.bodyView(opts);

                this.$el.find("[data-modal-role='body-container']").html(this.view.render().$el);

                this.__setupModalRadioEvents();

                /** Setup Title **/
                this.$el.find("[modal-title]").text(this.title).attr("aria-label", this.title);

                if(undefined !== this.width) {
                    modalBody.css("width", this.width);
                    modalBody.css("max-width", this.width);
                }
            },

            /**
             *  Constructor.
             *
             * @param options
             */
            initialize: function(options){
                this.options = options;

                /**
                 * Set the title of the modal, otherwise set the title as un-named.
                 */
                if (undefined !== options && undefined !== options.title) {
                    this.title = options.title;
                }
            },

            /**
             *  Setup the event listeners for the modal radio channel
             *
             * @private
             */
            __setupModalRadioEvents: function() {
                var that = this;
                this.modalChannel = Backbone.Radio.channel("modals");

                /**
                 * Add response to modal's request.
                 */
                this.modalChannel.on("closeCurrentModal", function() {
                    var $el = that.modalChannel.request("elementClickedToCloseModal");

                    if($el.hasClass("close-modal") || $el.hasClass("close") || that.closeState) {
                        /**
                         *  Reply to the modal channel and let the modal registrar know that the modal can be closed.
                         *
                         * @event modals:closeCurrentModalReady
                         * @since 0.1.0
                         * @public
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
                        // that.modalChannel.trigger("closeCurrentModalReady", this);
                        that.triggerCancel();
                        that.modalChannel.trigger("modalClosed");
                    }
                });
            },

            triggerCancel: function(){
                Backbone.Modal.prototype.triggerCancel.call(this);
                this.trigger("modalClosed");
            },

            /**
             *
             * @param e {Event} The click event
             */
            onModalDismissClicked: function(e) {
                this.triggerCancel();
                this.modalChannel.trigger("modalClosed");
            }

        });

    });

});
