/**
 *  Tags Controller Module
 *
 * @module modals/contribution-metadata-modal/controllers/tags-controller
 * @memberof Controllers
 * @see Controllers
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");

    /** Local dependencies **/
    var TagsController = require("modules/modals/contribution-metadata-modal/controllers/tags-controller");

    /**
     * Define module
     *
     * @constructor
     */
    App.module("BulkContributions.Controllers", function(Module) {

        /** Define module controller **/
        Module.TagsController = App.Modals.ContributionMetadata.Controllers.TagsController.extend({
            STR_NO_TAGS_ENTERED: "Please enter at least one tag",
            validate: function () {
                var $field = this.view.getTagsInputField();
                $field.siblings(".error-label-small").hide();

                if (0 === this.currentTags.length){
                    $field.siblings(".error-label-small").text(this.STR_NO_TAGS_ENTERED).show();

                    return false;
                }

                return true;
            },

            __addTag: function(name, suggested, id) {
                var $field = this.view.getTagsInputField();

                // dont add new tags, only allow suggested tags
                // if (!suggested) {
                //     $field.siblings(".error-label-small").text("Only existing tags are allowed").show();
                //     return;
                // }
                App.Modals.ContributionMetadata.Controllers.TagsController.prototype.__addTag.call(this, name, suggested, id);
                $field.siblings(".error-label-small").hide();
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
                this.name = name;

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
                                    result = [
                                        {
                                            name: request.term,
                                            found: false
                                        }
                                    ];

                                    response(result);
                                } else {
                                    result = [
                                        {
                                            name: request.term,
                                            found: false
                                        }
                                    ];

                                    var serverResults = $.map(data, function (item) {
                                        return {
                                            name: item.name,
                                            id: item.id,
                                            found: true
                                        };
                                    });

                                    var results = result.concat(serverResults);

                                    response(results);
                                }
                            },
                            error: function () {
                                result = [
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
                        that.trigger("autoSuggestValueClicked:" + name, {
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

                    $el = $("<a><li data-found='" + item.found + "'>" + _.escape(item.name) + "</li></a>");

                    ul.append($el);

                    return $el;
                };

            }

        });

    });

});