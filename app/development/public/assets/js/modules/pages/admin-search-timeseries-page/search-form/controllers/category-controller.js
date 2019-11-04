/**
 *  Category Controller Module
 *
 * @module modals/contribution-metadata-modal/controllers/category-controller
 * @memberof Controllers
 * @see Controllers
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");

    /** Local dependencies **/
    var AbstractController = require("./abstract-controller");
    var jQueryUI = require("jquery-ui");
    var jQTree = require("jqTree");
    var PerfectScrollbar = require("perfectScrollbar");

    /**
     * Define module
     *
     * @constructor
     */
    App.module("AdminSearchTimeseriesPage.SearchForm.Controllers", function(Module, Application, Backbone) {

        /** Define module controller **/
        Module.CategoryController = Module.AbstractController.extend({

            /**
             *  Initialization
             *
             * @param view {ManagedView} A view object for accessing methods inside the parent.
             */
            initialize: function(view){
                this.view = view;
            },

            bindToView: function(){
                this.__setupjQueryTree();
                this.__setupPerfectScrollbar();
            },

            /**
             *  Validates category Returns true if it is, and false otherwise.
             *
             * @returns {boolean}
             * @private
             */
            __validateCategory: function(){
                var $field = this.view.getCategorySelectionElement();
                $field.siblings(".error-label-small").hide();

                return true;
            },

            /**
             *  Returns true if the DOM has valid user-entered data, and false
             *  otherwise. Also controls UI rendering of states.
             *
             * @returns {boolean}
             */
            validate: function(){
                var categoryChosenState = this.__validateCategory();

                return categoryChosenState;
            },

            /**
             *  Returns an object containing the values managed by this controller.
             *
             * @returns object
             */
            serialize: function(){
                var $field = this.view.getCategorySelectionElement();
                var selectedNode = $field.tree("getSelectedNode");

                var payload = {
                    category: selectedNode.id
                };

                return payload;
            },

            /**
             * Returns the selected node
             *
             * @returns {Object|boolean} Returns either the row data or false.
             * @private
             */
            __getSelectedjQTreeNode: function() {
                return this.$el.find("#category").tree("getSelectedNode");
            },

            /**
             *  Sets up the perfect scrollbar!
             *
             * @private
             */
            __setupPerfectScrollbar: function() {
                var $elem = this.view.getCategorySelectionElement();
                /**
                 * Setup perfect scrollbar
                 */
                $elem.perfectScrollbar();

                /**
                 * When the view propagates an event from the category tree, We want to tell perfect scrollbar to
                 * check if it should be visible.
                 *
                 * This could potentially cause bottlenecking in the future with massive amounts of closing/showing.
                 *
                 * @todo Revisit this once API is implemented & can return many hundreds of trees.
                 */
                this.on("category.tree.openClose", function() {
                    $elem.perfectScrollbar("update");
                });
            },

            /**
             *  Setup jQtree
             *
             * @private
             */
            __setupjQueryTree: function() {
                var that = this;
                var $elem = this.view.getCategorySelectionElement();
                var timeSeriesMetaDataCategoryURL = App.apiEndpoint() + "/timeseries/metadata/categories";

                $elem.tree({
                    dataUrl: timeSeriesMetaDataCategoryURL,
                    useContextMenu: !App.DEBUG
                });

                /**
                 * When jQtree propagates an event to use saying the tree has opened, We will send a open/close event
                 * to all our listeners inside of this view.
                 */
                $elem.bind("tree.open", function() {
                    that.trigger("category.tree.openClose");
                });

                /**
                 * When jQtree propagates an event to use saying the tree has closed, We will send a open/close event
                 * to all our listeners inside of this view.
                 */
                $elem.bind("tree.close", function() {
                    that.trigger("category.tree.openClose");
                });

                /**
                 * When jQtree propagates an event to use saying the tree has been double clicked,
                 * We will toggle the tree
                 */
                $elem.bind("tree.dblclick", function(e) {
                    var node = e.node;
                    $elem.tree("toggle", node);
                });
            }

        });

    });

});