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
 * @version 1.0
 * @module common/views/managed-view
 * @namespace ManagedView
 * @example
 * Module.View = App.Common.Views.ManagedView.View.extend({});
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var Radio = require("backbone.radio");
    var SocialView = require("modules/common/views/social-view/social-view");

    /** Define module **/
    App.module("Common.Views.ManagedView", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.View = App.Common.Views.SocialView.View.extend({

            /**
             *  Array of controller instances
             *
             * @memberof ManagedView
             * @protected
             */
            controllers: [],

            /**
             *  A monotonically increasing integer used for naming local methods,
             *  added at runtime. We do this so we don't get conflicting method names.
             *
             * @memberof ManagedView
             * @private
             */
            methodIndex: 0,

            /**
             *  Returns a method name used to scope functions declared at runtime
             *  as methods of this object.
             *
             * @returns {string} The method's new name.
             * @memberof ManagedView
             * @private
             */
            __getMethodName: function(){
                var name = "__inducedMethod" + this.methodIndex;
                this.methodIndex++;

                return name;
            },

            /**
             *  Registers a view controller with the view.
             *
             * @param controller {Marionette.Object} The controller you wish to register
             * @memberof ManagedView
             * @public
             */
            registerController: function(controller){
                this.controllers.push(controller);
            },

            /**
             *  Registers an event handler with a view. The callback is a function, not
             *  an alias of a function.
             *
             * @param eventQuery {String} The event query you want to bind to
             * @param callback {Function} The function you want to bind
             * @param context {Object} The context of the view you want are passing through
             * @throws {Error} If you leave out a context parameter, it will throw an error as it will break later on.
             * @memberof ManagedView
             * @public
             */
            registerEventHandler: function(eventQuery, callback, context){
                if(!context) {
                    throw "Oops, You need a context parameter to register your event handler";
                }

                this.events = this.events || {};

                var localMethodName = this.__getMethodName();

                /**
                 * Apply context to the callback
                 */
                this[localMethodName] = function(){
                    if ("function" === typeof callback) {
                        callback.apply(context, arguments);
                    }
                };

                this.events[eventQuery] = localMethodName;
                this.delegateEvents();
            },

            /**
             *  Called on render. We bind each of the controllers to the view.
             *
             * @memberof ManagedView
             * @private
             */
            onRender: function(){
                this.rebindControllers();

            },

            rebindControllers: function(){
                var that = this;
                that.controllers.forEach(function(aController){
                    aController.bindToView();
                });

                that.delegateEvents();
            },

            initialize: function(options){
                App.Common.Views.SocialView.View.prototype.initialize.call(this, options);

                this.modal = options.modal;
            }

        });

    });

});