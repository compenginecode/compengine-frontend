/**
 *  Base Prompt
 *
 *  The base prompt that all prompts inherit from.
 *
 * @module prompts/base-prompt
 * @extends Modals
 * @memberof Prompts
 * @see Prompts
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");
    var Radio = require("backbone.radio");

    /** Modal dependencies **/
    var Modals = require("modals");

    /** Template **/
    var Template = require("text!./base-prompt.html");

    /**
     * Define module
     *
     * @constructor
     */
    App.module("Prompts.BasePrompt", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.Prompt = Backbone.Modal.extend({

            /**
             *  The prompt view you're rendering
             *
             * @protected
             */
            bodyView: null,

            /**
             *  Cancel Element
             */
            cancelEl: ".bbm-button",

            /**
             * To prevent it from trying to close a non-existent propmt,
             * we'll have a simple boolean value for if a prompt is present or not.
             */
            hasPromptOpen: false,

            /**
             * Disable enter/escape events that are inherited from Backbone.Modal
             *
             * @protected
             */
            keyControl: false,

            /**
             *  Whether or not the prompt should be able to close or not.
             *
             * @protected
             */
            closeState: false,

            /**
             * Determines whether we should show the prompt as a sidebar tab or as a proper prompt.
             *
             * @protected
             */
            hiddenState: false,

            events: {
                "click [data-dismiss='prompt']": "onPromptCloseClick",
                "click .contribute__hidden": "onContributeHiddenClick"
            },

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
                if (!this.bodyView || null === this.bodyView){
                    throw new Error("bodyView must be set on the base prompt.");
                }

                var that = this;
                this.hasPromptOpen = true;

                this.view = new this.bodyView();
                this.contentEl = this.$el.find(".prompt-content");
                this.$el.find("[data-prompt-role='body-container']").html(this.view.render().$el);

                this.promptChannel.on("promptRequestsHiddenState", function(text) {
                    that.setPromptHiddenState(that, text);
                });

                this.promptChannel.on("closeModal", function() {
                    if(that.hasPromptOpen) {
                        that.onPromptCloseClick();
                    }
                });

                if(App.promptHiddenState || window.sessionStorage.getItem("promptHiddenState")) {
                    App.promptHiddenText = App.promptHiddenText || "contribute";
                    this.promptHasHiddenState();
                }
            },

            /**
             * Set the prompt hidden state to true & then alter the DOM to reflect those changes.
             *
             * @param ctx {Marionette.View} The view context
             * @param text {String} The text to render.
             */
            setPromptHiddenState: function(ctx, text) {
                App.promptHiddenState = true;

                if(window.sessionStorage) {
                    window.sessionStorage.setItem("promptHiddenState", true);
                }

                App.promptHiddenText = text || "contribute";
                ctx.promptHasHiddenState();
            },

            /**
             * Alter the dom so the prompt is displayed with a hidden state.
             *
             * @param text {String} The text you wish to display inside the hidden state prompt.
             */
            promptHasHiddenState: function(text) {
                /** Allow anyone else to hook into the transition. **/
                this.trigger("promptTransitionToHiddenState");

                this.contentEl.addClass("contribute__hidden");

                this.contentEl.find(".prompt-body").html("<p>" + _.escape(App.promptHiddenText) + "</p>");
            },

            /**
             *  When the user dismisses the prompt, we want to tell the parent to clean up the dom.
             */
            onPromptCloseClick: function() {
                if(!this.hasPromptOpen) {
                    return false;
                }

                /**
                 *  When the modal registrar (or someone requesting to be presented) send out a request to close the
                 *  current prompt, we can prevent it if it requires user interaction before closing it.
                 *
                 * @public
                 * @event prompts:closeCurrentPrompt
                 * @memberof Prompts
                 * @example
                 * var promptChannel = Backbone.Radio.channel("prompts");
                 *
                 * promptChannel.on("closeCurrentPrompt", function() {
                 *      modalChannel.trigger("closeCurrentPromptReady");
                 * });
                 */
                this.promptChannel.trigger("closeCurrentPrompt");
                this.triggerCancel();
            },

            /**
             * Set the title on initialization
             */
            initialize: function(options) {
                this.options = options;
                this.promptChannel = Backbone.Radio.channel("prompts");
            },

            /**
             *  When the user clicks the "contribute" minimized prompt (Tab styled prompt)
             *
             * @param e {Event} The click event
             */
            onContributeHiddenClick: function(e) {
                this.promptChannel.trigger("contribute__hidden:click");
            }

        });

    });

});
