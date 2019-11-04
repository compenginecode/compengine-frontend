/**
 *  Tags Controller Module
 *
 * @module modules/pages/results-page/controllers/tags-controller
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
    App.module("VisualizePage.Controllers", function(Module, Application, Backbone) {

        /** Define module controller **/
        Module.TagsController = Module.AbstractController.extend({

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
                Control: true
            },

            /**
             * Move minimum length to root, Easier to maintain!
             */
            minLength: 1,

            /**
             *  Array or current tags
             *
             * @private
             */
            currentTags: [],

            /**
             *  Initialization
             *
             * @param view {ManagedView} A view object for accessing methods inside the parent.
             */
            initialize: function(view){
                this.view = view;

                this.__bindLocalEventListeners();
                this.listenTo(this.view, "set:tags", this.setTags.bind(this));
            },

            bindToView: function(){
                var that = this;

                this.__setupGenericAutocomplete("tags");

                /** These are not firing??? **/
                this.view.registerEventHandler("keydown #" + that.view.getTagsInputField().attr("id"),
                    that.__onAutosuggestInputKeyDown, that);

                this.view.registerEventHandler("click [data-close]", that.__onTagDataCloseClick, that);
            },

            /**
             *  Returns the user-entered values managed by this controller in a
             *  object.
             *
             * @returns {{tags: Array}}
             */
            serialize: function(){
                var tagNames = [];
                for(var key in this.currentTags){
                    tagNames.push(this.currentTags[key]);
                }

                return {
                    tags: tagNames
                };
            },

            /**
             *  Renders a selected tag to the modal.
             *
             * @param name {String} Tag name / value
             * @param suggested {boolean} Whether it was user generated or server generated.
             * @param id {number} Server ID or Random ID.
             * @protected
             */
            __addTag: function(name, suggested, id) {
                var $tagContainer = this.view.getTagContainer();
                var classList;
                var uid;

                classList = "tag tag-block tag-primary";
                uid = id;

                /**
                 *  Create a tag element, add classes & text to it, then append it to the tag container.
                 *
                 * @type {Element}
                 */
                var $tagElement = $("<span>", {"class": classList, "aria-label": _.escape(name) });
                var text = _.escape(name) + "<i class='fa fa-times' data-close aria-hidden='true'></i>";
                $tagElement.html(text);

                $tagElement.hide();
                $tagContainer.append($tagElement);
                $tagElement.fadeIn();

                return $tagElement;
            },

            /**
             *  Removes a given tag & notifies all listeners which tag was removed.
             *
             * @param $tag {jQuery} The jQuery element of the tag you want to remove.
             * @private
             */
            __removeTag: function($tag) {
                /** Get the text out of the childNodes object **/
                var stringToRemove = $tag[0].childNodes[0].wholeText;

                /** Locate where the string is in the array and delete it. **/
                this.__locateStringInArrayAndDestroy(this.currentTags, stringToRemove);

                /** Notify the modal that the tag has been removed **/
                this.trigger("tagRemoved", $tag.attr("id"));

                /** Fade the element out then remove it from the DOM Tree **/
                $tag.fadeOut(function(){
                    $tag.remove();
                });
            },

            /**
             *  Find out where a string is inside of an array and then remove it
             *
             * @param array
             * @param string
             * @private
             */
            __locateStringInArrayAndDestroy: function(array, string) {
                var that = this;

                for (var i=array.length-1; i>=0; i--) {
                    if (array[i] === string) {
                        /**
                         *  Delete the tag and then exit the for loop.
                         *
                         * @type {Array.<*>}
                         */
                        that.currentTags.splice(i, 1);
                        break;
                    }
                }
            },

            /**
             *  Bind event listeners for .trigger events
             *
             * @private
             */
            __bindLocalEventListeners: function() {
                this.on("autoSuggestValueClicked:tags", function(value) {
                    if(this.currentTags.includes(value.name)) {
                        value.elem.val("");
                        return false;
                    }

                    this.currentTags.push(value.name);
                    this.__addTag(value.name, value.suggested, value.id);
                    value.elem.val("");
                });
            },

            /**
             *  When the user presses a key on the autosuggest input, we want to determine if the key should be put
             *  into the input or not.
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
                    return true;
                } else {
                    if(!this.__checkAlphnumericValidity(keyCode)) {
                        e.preventDefault();
                    }
                }
            },

            /**
             *  When the user clicks the X on a tag, lets remove it.
             *
             * @param e
             * @private
             */
            __onTagDataCloseClick: function(e) {
                var $el = $(e.target).parent();
                this.__removeTag($el);
            },

            /**
             *  Setup a generic auto-complete for a given field.
             *
             * @param name {String} Name of the Autocomplete you wish to setup.
             * @private
             */
            __setupGenericAutocomplete: function(name) {
                var timeSeriesMetaDataSourceUrl = App.apiEndpoint() + "/timeseries/metadata/" + name;
                var $autoSuggest = this.view.getTagsInputField();
                var that = this;

                $autoSuggest.autocomplete({
                    /**
                     *  Get the autocomplete results from a remote source.
                     *
                     * @param request {Object} What we're sending to the server.
                     * @param response {Function} What we're giving back to the jQuery UI instance.
                     * @returns {boolean}
                     */
                    source: function (request, response) {
                        var result;
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
                                if (!data.length) {
                                    result = [{
                                        name: "No matching tags",
                                        id: 0,
                                        found: false
                                    }];

                                    response(result);
                                } else {
                                    response($.map(data, function (item) {
                                        return {
                                            name: item.name,
                                            id: item.id,
                                            found: true
                                        };
                                    }));
                                }
                            },
                            error: function () {
                                result = [];

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

                        if(clicked.item.found) {
                            $autoSuggest.val(clicked.item.name);

                            that.trigger("autoSuggestValueClicked:" + name, {
                                name: clicked.item.name,
                                suggested: clicked.item.found,
                                elem: $autoSuggest
                            });
                        }
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
                        if(ui.item.found) {
                            $autoSuggest.val(ui.item.name);
                        }
                        /** Return false so it doesn't write over our value we just set! **/
                        return false;
                    },
                    appendTo: "#tags-container"
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

                    if(item.found){
                        $el = $("<a class='text-xs-center'><li class='padding-10' data-found='" + item.found + "'>" + _.escape(item.name) + "</li></a>");
                    } else {
                        $el = $("<a class='text-xs-center'><li class='padding-10' data-found='" + item.found + "'>" + _.escape(item.name) + "</li></a>");
                    }

                    ul.append($el);

                    return $el;
                };

            },

            /**
             *  Given a string, It will check whether that string is an alphanumerical string or contains
             *  special characters.
             *
             * @param string {string} The string of the key that was pressed.
             * @returns {boolean} Will return true/false depending on if the input was a letter or number.
             * @private
             */
            __checkAlphnumericValidity: function(string) {
                return /^[a-z0-9]+$/i.test(string);
            },

            setTags: function(tags) {
                if (null == tags) {
                    return false;
                }

                var that = this;
                tags.forEach(function(tag) {
                    if (that.currentTags.indexOf(tag) === -1) {
                        that.currentTags.push(that);
                    }
                    var el = that.__addTag(tag, false, _.uniqueId('tag_'));

                    el[0].style = "display: inline-block";
                });
            }

        });

    });

});