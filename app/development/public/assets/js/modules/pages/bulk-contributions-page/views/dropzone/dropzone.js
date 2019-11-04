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
    App.module("BulkContributions.Dropzone", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.View = Backbone.Marionette.BossView.extend({

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
                    maxTotalBulkUploadSize: humanFileSize(that.configStore.getMaxTotalBulkUploadSize(), true),
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

            events: {
                "click #submit-files": function () {
                    this.dropzone.locked = true;
                    $(this.dropzone.element).find(".dropzone-el").slideUp();
                    $(this.dropzone.element).find("[data-dz-remove]").hide();
                    $("#submit-files").addClass("btn-loader").attr("disabled", true);
                    this.dropzone.processQueue();
                }
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
                this.dropzone = new DropZone($el[0], {
                    url: App.apiEndpoint() + "/bulk-upload-requests/upload",
                    maxFilesize: that.configStore.getMaxFileSize(),
                    dictDefaultMessage: that.DICTIONARY_DEFAULT_MESSAGE,
                    previewsContainer: that.$el.find("#previews")[0],
                    previewTemplate: that.$el.find("#sample-card").html(),
                    clickable: that.$el.find(".dropzone-el .card")[0],
                    acceptedFiles: that.configStore.getSupportedFileExtensions(),
                    autoProcessQueue: false,
                    parallelUploads: 1,

                    /**
                     *  On initialization, we're going to setup some event handling
                     */
                    init: function() {
                        /**
                         *  When the file starts uploading
                         */
                        this.on("sending", function(file, xhr, data){
                            data.append("approvalToken", that.model.get("approvalToken"));
                            data.append("exchangeToken", that.model.get("exchangeToken"));
                            that.trigger("fileSending");
                        });

                        /**
                         *  When the file has successfully uploaded
                         */
                        this.on("success", function(file, response){
                            var responseObj = JSON.parse(response);
                            that.trigger("fileSent", responseObj.timeSeriesId);
                        });

                        this.on("complete", function (file) {
                            /**
                             * keep processing the queue
                             * check for file.accepted, if its false it means this was an immediate js error
                             * and isn't us trying to auto process the queue.
                             */
                            if (file.accepted) {
                                this.processQueue();
                            }
                        });

                        /**
                         * This prevents dropzone from killing any file uploads after a failure.
                         */
                        this.on("queuecomplete", function(file) {
                            $("#submit-files").removeClass("btn-loader");
                            this.files.forEach(function (file) {
                                if (DropZone.SUCCESS === file.status) {
                                    that.dropzone.removeFile(file);
                                }
                            });

                            // All files have uploaded successfully
                            if (0 === this.files.length) {
                                $("#submit-files").hide();
                                $("#success-message").show().html("All files uploaded successfully!");
                            }
                            that.trigger("complete");
                        });

                        this.on("maxfilesexceeded", function(file) {
                            this.removeAllFiles();
                        });

                        /**
                         *  When the user adds a file (Before it starts uploading)
                         */
                        this.on("addedfile", function(file){
                            /**
                             * If the dropzone is locked for uploading
                             */
                            if (this.locked) {
                                this.removeFile(file);
                                return false;
                            }

                            /**
                             *  If it exceeds the maximum file size, don't proceed.
                             */
                            if(file.size >= (that.configStore.getMaxFileSize() * 1e+6)) {
                                that.trigger("fileSizeExceeded");
                                // this.removeFile(file);
                                return false;
                            }

                           //  debugger;

                            /**
                             *  If we've exceeded the file limit, don't proceed.
                             */
                            // if(that.maxFilesReached) {
                            //     that.trigger("maxFilesReached");
                            //     this.removeFile(file);
                            //     return false;
                            // }

                            $(file.previewElement).find("[data-dz-requeue]").on("click", function () {
                                that.dropzone.requeueFile(file);
                            });

                            var isTotalBulkUploadSizeOk = checkTotalBulkUploadSize.call(this);

                            /**
                             * Activate the upload button if there is no invalid files.
                             * Only if total bulk upload size is ok tho.
                             *
                             * We check that its 1 because the currently being added file is in the rejected files
                             * list til after this event finishes. Weird but essentially it means there are no rejected
                             * files.
                             */
                            if (1 === that.dropzone.getRejectedFiles().length && isTotalBulkUploadSizeOk) {
                                $("#submit-files").attr("disabled", false);
                            }
                        });

                        function checkTotalBulkUploadSize() {
                            var totalUploadSize = this.files.reduce(function (carry, file) {
                                return carry + file.size;
                            }, 0);

                            var maxBulkUploadSize = that.configStore.getMaxTotalBulkUploadSize();

                            var maxSurpassed = totalUploadSize > maxBulkUploadSize;

                            var helpText = $("#total-bulk-upload-size");

                            var message = "Total upload size: ";

                            if (maxSurpassed) {
                                message += humanFileSize(totalUploadSize - maxBulkUploadSize, true);
                                message += " over the " + humanFileSize(maxBulkUploadSize, true) + " limit";
                            } else {
                                message += humanFileSize(totalUploadSize, true);
                                message += " of the " + humanFileSize(maxBulkUploadSize, true) + " limit";
                            }

                            helpText.show().text(message).css({color: (maxSurpassed ? "red" : "black")});

                            if (0 === totalUploadSize) {
                                helpText.hide();
                            }

                            if (maxSurpassed) {
                                $("#submit-files").attr("disabled", true);
                                return false;
                            }

                            return true;
                        }

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
                        this.on("error", function(file, errorMessage, xhr) {
                            /**
                             * js pre processing error, add class to differentiate from api upload error
                             * disable upload button for now (dont allow uploads til this file is removed
                             */
                            if (undefined === xhr) {
                                $(file.previewElement).addClass("dz-pre-error");

                                $("#submit-files").attr("disabled", true);
                            }

                            /**
                             *  If it exceeded the maximum file size, show file size error first.
                             */
                            if(file.size >= (that.configStore.getMaxFileSize() * 1e+6)) {
                                that.trigger("fileSizeExceeded");
                                return false;
                            }

                            that.trigger("fileReturnedError");

                            try {
                                var message = JSON.parse(errorMessage).message;
                                $(file.previewElement).find("[data-dz-errormessage]").text(message);
                            } catch (e) {
                                // do nothing if error message is not json
                            }

                            if ("Server responded with 0 code." === errorMessage) {
                                $(file.previewElement).find("[data-dz-errormessage]").text("Upload timed out. Timeseries may be invalid.");
                            }
                        });

                        this.on("removedfile", function (file) {
                            var isTotalBulkUploadSizeOk = checkTotalBulkUploadSize.call(this);
                            if (0 === this.getQueuedFiles().length || this.getRejectedFiles().length > 0) {
                                $("#submit-files").attr("disabled", true);
                            } else if (isTotalBulkUploadSizeOk) {
                                $("#submit-files").attr("disabled", false);
                            }
                        });

                        this.requeueFile = function (file) {
                            $(file.previewElement).removeClass("dz-error dz-complete dz-processing");
                            $(file.previewElement).find("[data-dz-uploadprogress]").width(0);
                            $(file.previewElement).find("[data-dz-errormessage]").html(null);
                            $(file.previewElement).find("[data-dz-remove]").show();
                            file.status = DropZone.QUEUED;
                            file.upload.progress = 0;
                            file.upload.bytesSent = 0;

                            /**
                             * Reactivate link to upload files
                             */
                            $("#submit-files").attr("disabled", false);
                        }

                    },
                });

                /** Add the title to the Card (Below the icon) **/
                $el.find(".dz-message").text(that.DICTIONARY_DEFAULT_MESSAGE);

            }

        });

        function humanFileSize(bytes, si) {
            var thresh = si ? 1000 : 1024;
            if(Math.abs(bytes) < thresh) {
                return bytes + ' B';
            }
            var units = si
                ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
                : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
            var u = -1;
            do {
                bytes /= thresh;
                ++u;
            } while(Math.abs(bytes) >= thresh && u < units.length - 1);
            return bytes.toFixed(1)+' '+units[u];
        }

    });

});