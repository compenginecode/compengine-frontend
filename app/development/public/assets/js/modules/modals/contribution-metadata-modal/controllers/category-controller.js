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
    App.module("Modals.ContributionMetadata.Controllers", function(Module, Application, Backbone) {

        /** Define module controller **/
        Module.CategoryController = Module.AbstractController.extend({

            /**
             *  The list of globally allowed edit keys (EG/ Backspace)
             *
             * @protected
             */
            allowedGlobalKeyCodes: {
                ArrowDown: true,
                ArrowUp: true,
                ArrowLeft: true,
                ArrowRight: true,
                Enter: true,
                Escape: true,
                Backspace: true,
                Home: true,
                End: true,
                Tab: true,
                Control: true,
                " ": true
            },

            /** String literals **/
            STR_NO_CATEGORY_SELECTED: "Please select a category",
            STR_NO_SUGGESTION_ENTERED: "Please enter a suggested name",

            /**
             *  This is set true/false depending on whether the "Suggest Category" input is visible or not.
             *
             * @private
             */
            usingSuggestedCategory: false,

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
                this.view.registerEventHandler("click #" + this.view.getCategorySuggestionElement().attr("id"),
                    this.__onSuggestCategoryClick, this);

                this.view.registerEventHandler("keydown #" + this.view.getCategorySuggestionInputField().attr("id"),
                    this.__onCategorySuggestionInputKeyDown, this);

                this.__limitCategorySuggestionInput();
            },

            /**
             *  Validates that a category is selected. Returns true if one is, and false otherwise.
             *
             * @returns {boolean}
             * @private
             */
            __validateCategoryIsSelected: function(){
                var $field = this.view.getCategorySelectionElement();
                var selectedNode = $field.tree("getSelectedNode");

                $field.siblings(".error-label-small").hide();

                if (false === selectedNode){
                    $field.siblings(".error-label-small").text(this.STR_NO_CATEGORY_SELECTED).show();

                    return false;
                }

                return true;
            },

            /**
             *  Validates if a category suggestion is present. Returns true if it is, and false otherwise.
             *
             * @returns {boolean}
             * @private
             */
            __validateSuggestionIsPresent: function(){
                var $field = this.view.getCategorySuggestionInputField();
                $field.siblings(".error-label-small").hide();

                if ("" === $field.val().trim()){
                    $field.siblings(".error-label-small").text(this.STR_NO_SUGGESTION_ENTERED).show();

                    return false;
                }

                return true;
            },

            /**
             *  Returns true if the DOM has valid user-entered data, and false
             *  otherwise. Also controls UI rendering of states.
             *
             * @returns {boolean}
             */
            validate: function(){
                var categoryChosenState = this.__validateCategoryIsSelected();

                /** We validate differently depending whether the user is choosing to use
                 *  an existing category, or suggest their own. **/
                if (this.usingSuggestedCategory){
                    /** The user must both choose a single category and enter a suggested name **/
                    var suggestedCategoryState = this.__validateSuggestionIsPresent();
                    return categoryChosenState && suggestedCategoryState;
                }else{
                    /** The user must choose just a single category **/
                    return categoryChosenState;
                }
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
                    categoryId: selectedNode.id
                };

                if (this.usingSuggestedCategory){
                    payload["suggestedCategoryName"] = this.view.getCategorySuggestionInputField().val().trim();
                }

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
            },

            /**
             *  When the user presses a key on the input, we want to determine if the key should be put
             *  into the input or not.
             *
             * @param e {Event} The keydown event.
             * @returns {boolean} Returns true/false depending on if the key was alphanumeric or an acceptable edit key.
             * @private
             */
            __onCategorySuggestionInputKeyDown: function(e){
                var keyCode = e.key;

                /**
                 * This will allow for backspaces, arrow keys etc.
                 */
                if(this.allowedGlobalKeyCodes[keyCode] !== undefined) {
                    return true;
                } else {
                    if(!this.__checkAlphaNumericValidity(keyCode)) {
                        e.preventDefault();
                    }
                }
            },

            /**
             * Limit what can be put into the category suggestion input
             *
             * @private
             */
            __limitCategorySuggestionInput: function() {
                this.view.__checkAlphaNumericValidity()
            },

            /**
             *  When the user clicks "Suggest Category", we will toggle an input field above the category element.
             *
             * @param e
             * @private
             */
            __onSuggestCategoryClick: function(e) {
                var $suggestText = this.view.$el.find("#suggest-category").find("small");
                var $toggle = this.view.$el.find("#suggest-category-toggle");

                $toggle.toggle();
                this.usingSuggestedCategory = $toggle.is(":visible");

                if(this.usingSuggestedCategory) {
                    $suggestText.text("Use Existing");
                } else {
                    $suggestText.text("Suggest Category");
                }
            },


            /**
             *  Given a string, It will check whether that string is an alphanumeric string or contains
             *  special characters.
             *
             * @param string {string} The string of the key that was pressed.
             * @returns {boolean} Will return true/false depending on if the input was a letter or number.
             * @private
             */
            __checkAlphaNumericValidity: function(string) {
                return /^[a-z0-9]+$/i.test(string);
            }

        });

    });

});