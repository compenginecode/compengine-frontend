/**
 *  Source Controller Module
 *
 * @module modals/contribution-metadata-modal/controllers/source-controller
 * @memberof Controllers
 * @see Controllers
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");

    /** Local dependencies **/
    var AbstractController = require("./abstract-controller");
    var jQueryUI = require("jquery-ui");

    /**
     * Define module
     *
     * @constructor
     */
    App.module("Modals.MetadataReplacement.Controllers", function(Module, Application, Backbone) {

        /** Define module controller **/
        Module.SourceController = Module.AbstractController.extend({

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
            STR_FIELD_ONLY_SPACES: "Please enter a valid source",

            SOURCE_MUST_EXIST: "Source must be an existing one from the dropdown",

            /**
             * Move minimum length to root, Easier to maintain!
             */
            minLength: 1,

            /**
             *  Initialization
             *
             * @param view {ManagedView} A view object for accessing methods inside the parent.
             */
            initialize: function(view){
                this.view = view;
            },

            bindToView: function(){
                this.__setupGenericAutocomplete("sources");

                this.view.registerEventHandler("keydown #" + this.view.getSourcesInputField().attr("id"), this.__onAutosuggestInputKeyDown, this);
            },

            /**
             *  Returns the user-entered values managed by this controller in a
             *  object.
             *
             * @returns {{tags: Array}}
             */
            serialize: function(){
                return {
                    replacementId: this.view.getSourcesInputField().data('id')
                };
            },

            /**
             *  Returns true if the DOM has valid user-entered data, and false
             *  otherwise. Also controls UI rendering of states.
             *
             * @returns {boolean}
             */
            validate: function(){
                var $field = this.view.getSourcesInputField();
                $field.siblings(".error-label-small").hide();

                if ($field.val().length > 0 && "" === $field.val().trim()){
                    $field.siblings(".error-label-small").text(this.STR_FIELD_ONLY_SPACES).show();

                    return false;
                } else if (!$field.data('id')) {
                    $field.siblings(".error-label-small").text(this.SOURCE_MUST_EXIST).show();

                    return false;
                }

                return true;
            },

            /**
             *  When the user presses a key on the autosuggest input, we want to determine if the key should be put into
             *  the input or not.
             *
             * @param e {Event} The keydown event.
             * @returns {boolean} Returns true/false depending on if the key was alphanumeric or an acceptable edit key.
             * @private
             */
            __onAutosuggestInputKeyDown: function(e){
                var keyCode = e.key;

                /**
                 * This will allow for backspaces, arrow keys etc.
                 */
                if(this.allowedGlobalKeyCodes[keyCode] !== undefined) {
                    $(this).data("id", null);
                    return true;
                } else {
                    if(!this.__checkAlphaNumericValidity(keyCode)) {
                        e.preventDefault();
                    }
                }
            },

            /**
             *  Setup a generic auto-complete for a given field.
             *
             * @param name {String} Name of the Autocomplete you wish to setup.
             * @private
             */
            __setupGenericAutocomplete: function(name) {
                var timeSeriesMetaDataSourceUrl = App.apiEndpoint() + "/timeseries/metadata/" + name;
                var $autoSuggest = this.view.getSourcesInputField();
                var that = this;

                // clear input on backspace
                $autoSuggest.on("keyup", function(e) {
                    if (e.keyCode == 8 && $autoSuggest.data("id")) {
                        $autoSuggest.val("");
                        $autoSuggest.data("id", null);
                    }
                });

                $autoSuggest.autocomplete({
                    /**
                     *  Get the autocomplete results from a remote source.
                     *
                     * @param request {Object} What we're sending to the server.
                     * @param response {Function} What we're giving back to the jQuery UI instance.
                     * @returns {boolean}
                     */
                    source: function (request, response) {

                        /**
                         * Guard condition
                         */
                        if (0 === request.term.trim().length) {
                            return false;
                        }

                        $.ajax({
                            url: timeSeriesMetaDataSourceUrl,
                            dataType: "json",
                            data: {
                                keyword: request.term.trim()
                            },
                            success: function (data) {
                                var serverResults = $.map(data, function (item) {
                                    return {
                                        name: item.name,
                                        id: item.id,
                                        found: true
                                    };
                                });

                                response(serverResults);
                            },
                            error: function () {
                                var result = [
                                    {
                                        name: request.term,
                                        found: false
                                    }
                                ];

                                response(result);
                            }
                        });
                    },

                    minLength: that.minLength,

                    /**
                     *  When the user selects one of the options from the autocomplete dropdown
                     *
                     * @param e {Event} The select event
                     * @param clicked {Object} The selected item, contains all its saved data.
                     * @returns {Event} Triggers an event with the required information
                     */
                    select: function (e, clicked) {
                        e.preventDefault();
                        $autoSuggest.val(clicked.item.name);
                        $autoSuggest.data('id', clicked.item.id);
                        that.trigger("autoSuggestValueClicked:" + name, {
                            id: clicked.item.id,
                            name: clicked.item.name,
                            suggested: clicked.item.found,
                            elem: $autoSuggest
                        });
                    },

                    /**
                     *  When the user focuses/Hovers one of the items,
                     *  We temporarily set the value of the input to what they're hovering!
                     *
                     * @param event {Event} The focus event
                     * @param ui {Object} The focused item
                     * @returns {boolean}
                     */
                    focus: function (event, ui) {
                        $autoSuggest.val(ui.item.name);
                        /** Return false so it doesn't write over our value we just set! **/
                        return false;
                    },

                    appendTo: "#source-container"
                });

                /**
                 *  Custom rendering for the autocomplete results
                 *
                 * @param ul {HTMLElement} The jQuery HTML Object for the unordered list to be rendered.
                 * @param item {Object} The data to be rendered
                 * @returns {HTMLElement} The customised list.
                 * @private
                 */
                $autoSuggest.autocomplete("instance")._renderItem = function(ul, item){
                    var $el;
                    ul.addClass("top-nav-search");

                    if(item.found){
                        $el = $("<a><li data-found='" + item.found + "'>" + _.escape(item.name) + "</li></a>");
                    } else {
                        $el = $("<a><li data-found='" + item.found + "'>" + _.escape(item.name) + "</li></a>");
                    }

                    ul.append($el);

                    return $el;
                };

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