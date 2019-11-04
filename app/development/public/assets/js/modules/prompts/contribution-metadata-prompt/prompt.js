/**
 *  Contribution Metadata Modal
 *
 * @module modals/contribution-metadata-modal
 * @memberof Modals
 * @see Modals
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");
    var Radio = require("backbone.radio");

    /** Modal dependencies **/
    var BaseModal = require("modules/prompts/base-prompt/base-prompt");
    var ManagedView = require("modules/common/views/managed-view/managed-view");

    /** Local dependencies **/
    var Bootstrap = require("bootstrap");

    /** Template **/
    var Template = require("text!./prompt.html");

    /**
     * Define module
     *
     * @constructor
     * @protected
     */
    App.module("Prompts.ContributionMetadata", function(Module, Application, Backbone) {

        /**
         *  Module view, Inherits ManagedView
         *
         * @protected
         * @see ManagedView
         */
        Module.Body = App.Common.Views.ManagedView.View.extend({

            events: {
                "click [data-id='get-involved']": "onGetInvolvedButtonClick",
                "click [data-id='do-not-contribute']": "onDoNotContributeClick"
            },

            /**
             * Set the title on initialization
             */
            initialize: function(options) {
                App.Common.Views.ManagedView.View.prototype.initialize.call(this, options);
                this.options = options;
            },

            /**
             *  When the dom has been rendered, we want to manipulate the DOM with some plugins.
             *
             * @private
             */
            onRender: function() {
                App.Common.Views.ManagedView.View.prototype.onRender.call(this);

                /**
                 *  Tune into prompt radio
                 *  We will be propagating events through this.
                 */
                this.promptChannel = Backbone.Radio.channel("prompts");
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
             *  When the user clicks "Get involved" we want to show the modal!
             *
             * @param e
             */
            onGetInvolvedButtonClick: function(e) {
                e.preventDefault();
                /**
                 *  When the contribution metadata prompt recognizes that the get involved button has been clicked,
                 *  it will propagate the event out to listeners of the promptChannel.
                 *
                 * @public
                 * @event prompts:contributionMetadata:getInvolvedButtonClicked
                 * @memberof Prompts
                 * @example
                 * var promptChannel = Backbone.Radio.channel("prompts");
                 * var that = this;
                 *
                 * promptChannel.on("contributionMetadata:getInvolvedButtonClicked", function() {
                 *      modalChannel.trigger("closeCurrentPromptReady");
                 *      that.__showContributionMetadataModal();
                 * });
                 */
                this.promptChannel.trigger("contributionMetadata:getInvolvedButtonClicked");
            },

            onDoNotContributeClick: function(e) {
                e.preventDefault();
                /**
                 *  When the contribution metadata prompt recognizes that the get involved button has been clicked,
                 *  it will propagate the event out to listeners of the promptChannel.
                 *
                 * @public
                 * @event prompts:contributionMetadata:getInvolvedButtonClicked
                 * @memberof Prompts
                 * @example
                 * var promptChannel = Backbone.Radio.channel("prompts");
                 * var that = this;
                 *
                 * promptChannel.on("contributionMetadata:getInvolvedButtonClicked", function() {
                 *      modalChannel.trigger("closeCurrentPromptReady");
                 *      that.__showContributionMetadataModal();
                 * });
                 */
                this.promptChannel.trigger("promptRequestsHiddenState", "contribute");
            }
        });

        Module.Prompt = App.Prompts.BasePrompt.Prompt.extend({

            /**
             *  The body view for the prompt
             *
             * @protected
             */
            bodyView: Module.Body,

            /**
             *  Constructor. We override the default constructor and add code to help
             *  handle the specific parameters passed.
             *
             * @param options {Object} Paramaters to pass to the modal
             */
            initialize: function(options){
                App.Prompts.BasePrompt.Prompt.prototype.initialize.call(this, options);

                options = options || {};
            }

        });

    });

});