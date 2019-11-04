define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var ConfigurationStore = require("modules/common/controllers/configuration-store");
    var DropZone = require("dropZone");

    /** Template **/
    var Template = require("text!./dropzone.html");

    /** Define module **/
    App.module("LandingPage.Dropzone", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.View = Backbone.Marionette.BossView.extend({

            events: {
                "click #bulk-contribution": "onBulkContributionClick"
            },

            /** String literals **/
            DICTIONARY_DEFAULT_MESSAGE: "Drag and drop a file to get started",
            maxFilesReached: false,
            maxAmountOfFiles: 1,

            /**
             *  Returns a rendered template.
             *
             * @param serializedModel
             * @returns {Function}
             */
            template: function(serializedModel){
                return _.template(Template, serializedModel);
            },

            /**
             *  Proxy the Marionette view context to the template.
             *
             * @returns {{fileSizeLimit: (*|number), supportedFileExtensions: (*|Array|string)}}
             */
            templateHelpers: function() {
                var that = this;

                return {
                    fileSizeLimit: that.configStore.getMaxFileSize(),
                    /** Enable grammar support for the file extensions **/
                    supportedFileExtensions: that.configStore.getSupportedFileExtensions(true)
                };
            },

            /**
             *  On initialization, we'll setup a Configuration controller.
             */
            initialize: function() {
                this.configStore = new App.ConfigurationStore.Controller();
            },

            /**
             *  When the dom has been rendered
             */
            onRender: function() {
                this.__setupDropZone();
            },

            /**
             *  Setup the file upload area & its event handling
             *
             * @private
             */
            __setupDropZone: function() {
                var that = this;
                var $el = this.$el.find(".dropzone");

                DropZone.autoDiscover = false;
                var dropzone = new DropZone($el[0], {
                    url: App.apiEndpoint() + "/compare/initiate",
                    maxFiles: that.maxAmountOfFiles,
                    maxFilesize: that.configStore.getMaxFileSize(),
                    dictDefaultMessage: that.DICTIONARY_DEFAULT_MESSAGE,
                    previewsContainer: that.$el.find("#previewsContainer")[0],
                    clickable: that.$el.find(".dropzone-el .card")[0],
                    acceptedFiles: that.configStore.getSupportedFileExtensions(),

                    /**
                     *  On initialization, we're going to setup some event handling
                     */
                    init: function() {

                        /**
                         *  When the file starts uploading
                         */
                        this.on("sending", function(){
                            that.trigger("fileSending");
                        });

                        /**
                         *  When the file has successfully uploaded
                         */
                        this.on("success", function(file, response){
                            var responseObj = JSON.parse(response);
                            that.trigger("fileSent", responseObj.comparisonKey);
                        });

                        /**
                         * This prevents dropzone from killing any file uploads after a failure.
                         */
                        this.on("complete", function(file) {
                            this.removeAllFiles(true);
                        });

                        this.on("maxfilesexceeded", function(file) {
                            this.removeAllFiles();
                        });

                        /**
                         *  When the user adds a file (Before it starts uploading)
                         */
                        this.on("addedfile", function(file){
                            /**
                             *  If it exceeds the maximum file size, don't proceed.
                             */
                            if(file.size >= (that.configStore.getMaxFileSize() * 1e+6)) {
                                that.trigger("fileSizeExceeded");
                                this.removeFile(file);
                                return false;
                            }

                            /**
                             *  If we've exceeded the file limit, don't proceed.
                             */
                            if(that.maxFilesReached) {
                                that.trigger("maxFilesReached");
                                this.removeFile(file);
                                return false;
                            }

                        });

                        /**
                         * When the user drags something ontop of the dropzone, we check if the amount of items they
                         * hold is more than the amount of files allowed.
                         *
                         * If it is, we will preemptively determine that the max amount of files has been reached before
                         * any upload has commenced.
                         */
                        this.on("dragenter", function(e) {
                            that.maxFilesReached = (that.maxAmountOfFiles < e.dataTransfer.items.length);
                        });

                        /**
                         *  When the file encounters an error during upload (EG/ Internet connectivity lost)
                         */
                        this.on("error", function(file, response) {
                            /**
                             *  If it exceeded the maximum file size, show file size error first.
                             */
                            if(file.size >= (that.configStore.getMaxFileSize() * 1e+6)) {
                                that.trigger("fileSizeExceeded");
                                return false;
                            }

                            that.trigger("fileReturnedError");
                        });

                    }
                });

                /** Add the title to the Card (Below the icon) **/
                $el.find(".dz-message").text(that.DICTIONARY_DEFAULT_MESSAGE);

            },

            /**
             * When the user clicks the "Upload multiple files" link, we'll open the bulk contribution modal.
             *
             * @param e {Event} The click event
             */
            onBulkContributionClick: function(e) {
                e.preventDefault();
                e.currentTarget.blur();
                this.trigger("show:modal:bulkContribution");
            },

            openFileDialog: function () {
                this.$el.find('.dz-clickable').click();
            }

        });

    });

});