/**
 *  Truncation Modal
 *
 * @module modals/truncation-modal
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
    /** Modal dependencies **/
    var BaseModal = require("modules/modals/base-modal/base-modal");
    var ManagedView = require("modules/common/views/managed-view/managed-view");

    /** Template **/
    var Template = require("text!./modal.html");

    /** Define module **/
    App.module("Modals.Truncation", function(Module, Application, Backbone) {

        /**
         *  Module view, Inherits ManagedView
         *
         * @protected
         * @see ManagedView
         */
        Module.Body = App.Common.Views.ManagedView.View.extend({

            /**
             * Event bindings
             */
            events: {
                "click #acknowledge-truncation": "onTruncationAcknowledgement"
            },

            /**
             *  Returns a rendered template.
             *
             * @param serializedModel {Object} An object with data for the template to render
             * @returns {Function} Rendered template
             */
            template: function(serializedModel){
                return _.template(Template, serializedModel);
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

                this.modalChannel = Backbone.Radio.channel("modals");
            },

            /**
             * Close the modal
             *
             * @param event
             */
            onTruncationAcknowledgement: function(event) {
                this.modal.triggerCancel();
            }
        });

        Module.Modal = App.Modals.BaseModal.Modal.extend({

            /**
             *  The body view for the modal
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
                App.Modals.BaseModal.Modal.prototype.initialize.call(this, options);

                options = options || {};
            },

            triggerCancel: function(){
                Backbone.Modal.prototype.triggerCancel.call(this);
                App.decrementModalCount(1);
            }

        });

    });

});
