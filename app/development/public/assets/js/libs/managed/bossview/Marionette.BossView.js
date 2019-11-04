/**
 * https://github.com/justspamjustin/BossView
 * BossView v 0.1.3
 */

/**
 * Updated by CraigAtWork on 6/4/14.
 *
 * Convert the cool BossView functionality to a mixin so it can be combined into any class hierarchy.
 * Create a single file for AMD, CommonJS, browser include.
 *
 */

(function (factory) {

    // Set up BossView appropriately for the environment. Start with AMD.
    if (typeof define === 'function' && define.amd) {
      //console.log("loading BossViewMixin AMD");
      define(['underscore', 'backbone', 'marionette', 'exports'], factory);
    }

    // Next for Node.js or CommonJS.
    else if (typeof exports === 'object') {
      //console.log("loading BossViewMixin CommonJS");
      factory(require('underscore'), require('backbone'), require('marionette'), exports);
    }

    // Finally, as a browser global.
    else {
      //console.log("loading BossViewMixin browser global");
      factory(_, Backbone, Marionette, {});
    }

}(function (_, Backbone, Marionette) {


    /**
     * Package up the subview mixin functions into a javascript object that can be used to _.extend() another
     * object (i.e. mixin) or a class like the BossView class.
     *
     * @type {{_initialize: _initialize, getParentEl: getParentEl, _initializeSubViews: _initializeSubViews, _getInitializedSubView: _getInitializedSubView, _initializeRenderableSubView: _initializeRenderableSubView, _checkSubViewForRender: _checkSubViewForRender, _initializeChildViewEvents: _initializeChildViewEvents, _getSubViewEventCallbackFunction: _getSubViewEventCallbackFunction, _listenToEventOnAllSubViews: _listenToEventOnAllSubViews, _checkForSubViewEventCallback: _checkForSubViewEventCallback, _initializeSubViewEventBubbling: _initializeSubViewEventBubbling, _onParentRendered: _onParentRendered, _renderSubViews: _renderSubViews, _renderSubView: _renderSubView, _shouldRenderSubView: _shouldRenderSubView, _eachSubView: _eachSubView, _eachSubViewEvent: _eachSubViewEvent, _splitSubViewEventKey: _splitSubViewEventKey, _checkSubViewExistsForEvents: _checkSubViewExistsForEvents, _hasSubViewContainer: _hasSubViewContainer, _getSubViewContainer: _getSubViewContainer, _remove: _remove, _removeSubViews: _removeSubViews, _getSubViews: _getSubViews, _getOption: _getOption, _getSubViewRenderConditions: _getSubViewRenderConditions}}
     * @private
     */
    var _SubViewMixin = {

        _initialize: function() {
          this._initializeSubViews();
          this._initializeChildViewEvents();
          this._initializeSubViewEventBubbling();
          this.listenTo(this, 'render', this._onParentRendered);
        },

        getParentEl: function () {
          return this.$el;
        },

        _initializeSubViews: function () {
          this._eachSubView(_.bind(function (subViewName, subViewFunction) {
            var subView = this._getInitializedSubView(subViewFunction);
            this._checkSubViewForRender(subView, subViewName);
            this[subViewName] = subView;
          }, this));
        },

        _getInitializedSubView: function (subViewFunction) {
          var subView;
          var isRenderableView = _.isFunction(subViewFunction.prototype.render);
          if (isRenderableView) {
            subView = this._initializeRenderableSubView(subViewFunction);
          } else {
            subView = subViewFunction.call(this);
          }
          return subView;
        },

        _initializeRenderableSubView: function (subViewFunction) {
          return new subViewFunction({
            model: this.model,
            collection: this.collection
          });
        },

        _checkSubViewForRender: function (subView, subViewName) {
          if (_.isUndefined(subView) || !_.isFunction(subView.render)) {
            throw new Error('The subview named ' + subViewName + ' does not have a render function.');
          }
        },

        _initializeChildViewEvents: function () {
          this._eachSubViewEvent(_.bind(function (subView, subViewEventName, subViewEventCallback) {
            subViewEventCallback = this._getSubViewEventCallbackFunction(subViewEventCallback, subViewEventName);
            if (subView === '*') {
              this._listenToEventOnAllSubViews(subViewEventCallback, subViewEventName);
            } else {
              this.listenTo(subView, subViewEventName, subViewEventCallback);
            }
          }, this));
        },

        _getSubViewEventCallbackFunction: function (subViewEventCallback, subViewEventName) {
          if (_.isString(subViewEventCallback)) {
            this._checkForSubViewEventCallback(subViewEventCallback, subViewEventName);
            subViewEventCallback = this[subViewEventCallback];
          }
          return subViewEventCallback;
        },

        _listenToEventOnAllSubViews: function (subViewEventCallback, subViewEventName) {
          this._eachSubView(_.bind(function (subViewName) {
            var subViewInstance = this[subViewName];
            this.listenTo(subViewInstance, subViewEventName, subViewEventCallback);
          }, this));
        },

        _checkForSubViewEventCallback: function (subViewEventCallback, subViewEventName) {
          if (_.isUndefined(this[subViewEventCallback])) {
            throw new Error('This view has no function named ' + subViewEventCallback + ' to use as a callback for the event ' + subViewEventName);
          }
        },

        _initializeSubViewEventBubbling: function () {
          this._eachSubView(_.bind(function (subViewName) {
            var subView = this[subViewName];
            this.listenTo(subView, 'all', function () {
              this.trigger(subViewName + ':' + arguments[0], arguments[1]);
            });
          }, this));
        },

        _onParentRendered: function () {
          this.trigger('subviews:before:render');
          this._renderSubViews();
          this.trigger('subviews:after:render');
        },

        _renderSubViews: function () {
          var mainSubViewContainer = this._getOption('mainSubViewContainer');
          this._eachSubView(_.bind(function (subViewName) {
            var appendToEl = this.getParentEl();
            if (this._hasSubViewContainer(subViewName)) {
              appendToEl = this._getSubViewContainer(subViewName);
            } else if (mainSubViewContainer) {
              appendToEl = this.$(mainSubViewContainer);
            }
            this._renderSubView(subViewName, appendToEl);
          }, this));
        },

        _renderSubView: function (subViewName, appendToEl) {
          if (this._shouldRenderSubView(subViewName)) {
            this[subViewName].render().$el.appendTo(appendToEl);
            /**
             * We need to call delegateEvents here because when Marionette renders a template
             * it uses this.$el.html(templateHTML).  If this is the second render, then it will
             * remove each of the subViews from the DOM, thus also unbinding each of their DOM
             * events.  So this is necessary for any renders after the initial render.
             */
            this[subViewName].delegateEvents();
          }
        },

        _shouldRenderSubView: function (subViewName) {
          var renderConditionFunction = this._getSubViewRenderConditions()[subViewName];
          var hasRenderConditionFunction = _.isFunction(renderConditionFunction);
          return  hasRenderConditionFunction ? renderConditionFunction.call(this) : true;
        },

        _eachSubView: function (callback) {
          if (this._getSubViews()) {
            for (var subViewName in this._getSubViews()) {
              callback(subViewName, this._getSubViews()[subViewName]);
            }
          }
        },

        _eachSubViewEvent: function (callback) {
          var subViewEvents = this._getOption('subViewEvents');
          if (subViewEvents) {
            for (var subViewEventKey in subViewEvents) {
              var split = this._splitSubViewEventKey(subViewEventKey);
              this._checkSubViewExistsForEvents(split.subViewName);
              var subView = split.subViewName === '*' ? '*' : this[split.subViewName];
              callback(subView, split.subViewEventName, subViewEvents[subViewEventKey]);
            }
          }
        },

        _splitSubViewEventKey: function (subViewEventKey) {
          var subViewEventKeySplit = subViewEventKey.split(' ');
          return {
            subViewName: subViewEventKeySplit[0],
            subViewEventName: subViewEventKeySplit[1]
          }
        },

        _checkSubViewExistsForEvents: function (subViewName) {
          if (subViewName !== '*' && _.isUndefined(this[subViewName])) {
            throw new Error('Subview named ' + subViewName + ' is not defined in subViews.');
          }
        },

        _hasSubViewContainer: function (subViewName) {
          var subViewContainers = this._getOption('subViewContainers');
          return !_.isUndefined(subViewContainers) && !_.isUndefined(subViewContainers[subViewName]);
        },

        _getSubViewContainer: function (subViewName) {
          if (!this._hasSubViewContainer(subViewName)) {
            throw new Error('No subview container for subView: ' + subViewName);
          }
          return this.$(this._getOption('subViewContainers')[subViewName]);
        },

        _remove: function () {
          this._removeSubViews();
        },

        _removeSubViews: function () {
          this._eachSubView(_.bind(function (subViewName) {
            this[subViewName].remove();
          }, this));
        },

        _getSubViews: function () {
          var subViews = _.result(this, 'subViews');
          if (this.options.subViews) {
            subViews = _.result(this.options, 'subViews');
          }
          return subViews;
        },

        _getOption: function (optionName) {
          return this[optionName] || this.options[optionName];
        },

        _getSubViewRenderConditions: function () {
          return this._getOption('subViewRenderConditions') || {};
        }

    };

    /**
     * SubViewMixin
     *
     * SubView mixin based on BossView class from: http://justspamjustin.github.io/BossView/
     *
     * Must have the _SubViewMixin added into it as done below.
     *
     * Use Cocktail to mixin to whatever Marionette based class hierarchy you have.
     * Cocktail will preserve the calling sequences of method collisions (ex: initialize()).
     * Try it, you'll like it, if you do this kind of stuff.
     *
     *
     */
    var SubViewMixin = {
        /**
         * initialize()
         *
         * Perform the initialization for the subView functionality.
         *
         * Use Cocktail.js to mixin the SubViewMixin to your Marionette view class
         * hierarchy. Cocktail.js will preserve the calling sequence of functions
         * that exist in any number of the mixins and class. So, the initialize()
         * function here will get called, in addition to the Marionette view initialize()
         * function getting called. Cool stuff.
         *
         */
        initialize: function() {
          this._initialize();
        },

        remove: function () {
          this._remove();
        }

    };

    /**
     * Create by extension, a Cocktail usable mixin to support the subview functionality.
     *
     */
    _.extend(SubViewMixin, _SubViewMixin);

    /**
     * Attach the Cocktail usable mixin to the Backbone.Marionette namespace for
     * easy, Marionette like, usage.
     *
     * @type {{initialize: initialize, remove: remove}}
     */
    Backbone.Marionette.SubViewMixin = SubViewMixin;

    /**
     * Package up the BossView class with the mixin functionality.
     *
     */
    Backbone.Marionette.BossView = Backbone.Marionette.ItemView.extend({

      template: function () {
        return '';
      },

      constructor: function () {
        Backbone.Marionette.ItemView.prototype.constructor.apply(this, arguments);
        this._initialize();
      },

      remove: function () {
        Backbone.Marionette.ItemView.prototype.remove.apply(this, arguments);
        this._remove();
      }

    });

    _.extend(Backbone.Marionette.BossView.prototype, _SubViewMixin);

    // just return the namespace to access the objects since we have 2 objects.
    return Backbone.Marionette;

}));
