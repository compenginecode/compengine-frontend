/**
 *  Landing Page
 *
 * @module pages/landing-page
 * @memberof Pages
 * @see Pages
 */
define(function (require) {

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var BulkContributionModal = require("modules/modals/bulk-contribution-modal/modal");
    var MaxSampleSizeModal = require("modules/modals/max-sample-size-modal/modal");
    var ConfigurationStore = require("modules/common/controllers/configuration-store");
    var ContributionMetadataPrompt = require("modules/prompts/recontribute-metadata-prompt/prompt");
    var Dropzone = require("./dropzone/dropzone");
    var DropzoneErrorModal = require("modules/modals/dropzone-error-modal/modal");
    var Footer = require("modules/common/views/footer/footer");
    var LoaderCustomHTML = require("text!./loader.html");
    var LocalForage = require("localForage");
    var Modals = require("modals");
    var ModalHTML = require("text!./modal.html");
    var Navigation = require("modules/common/views/navigation/navigation");
    var Infographic = require("modules/common/views/infographic/index");
    var Typed = require("typed");

    var ComparisonController = require("../controllers/comparison-controller");
    var Template = require("text!./landing-page.html");

    /** Define module **/
    App.module("LandingPage", function (Module, Application, Backbone) {

        /** Define module view **/
        Module.View = Backbone.Marionette.BossView.extend({

            TWITTER_PREFILL_TEXT: "Check out CompEngine, a self-organizing database of time-series data @compTimeSeries",

            facebookEnabled: false,

            /**
             *  Subviews
             */
            subViews: {
                dropzone: Module.Dropzone.View,
                footer: App.Common.Footer.View,
                navigation: App.Common.Navigation.View,
                infographic: App.Common.Infographic.View
            },

            /**
             *  Containers for the sub views
             */
            subViewContainers: {
                dropzone: "#dropzone-container",
                footer: "#footer-container",
                navigation: "#navigation-container",
                infographic: "[data-region='infographic']"
            },

            /**
             *  Event listeners for the sub views
             */
            subViewEvents: {
                "dropzone fileSending": "__onDropZoneFileSending",
                "dropzone fileSent": "__onDropZoneFileSent",
                "dropzone fileSizeExceeded": "__onDropZoneFileSizeExceeded",
                "dropzone maxFilesReached": "__onDropZoneFileAmountExceeded",
                "dropzone fileReturnedError": "__onDropZoneFileReturnedError",
                "dropzone show:modal:bulkContribution": "onShowBulkContributionModal"
            },

            events: {
                "click [button-action='try-another']": "__onTryAnotherErrorButtonClick",
                "click [button-action='retry']": "__onRetryErrorButtonClick",
                "click #view-analysis": "__viewAnalysis",
                "click [data-role='open-file-dialog']": "onOpenFileDialog"
            },

            /**
             *  On initialization, we'll setup a Configuration controller & listen to the navigation radio channel.
             */
            initialize: function () {
                const that = this;
                var Facebook = require(["facebook"], function () {
                    that.facebookEnabled = true;
                    FB.init({
                        appId: GLOBALS.FB_APP_ID,
                        autoLogAppEvents: true,
                        status: true,
                        xfbml: true,
                        version: 'v2.9'
                    });
                    that.render();
                }, function (e) { });

                this.configStore = new App.ConfigurationStore.Controller();
                this.navigationChannel = Backbone.Radio.channel("navigation");
                this.globalChannel = Backbone.Radio.channel("global");
                this.modalChannel = Backbone.Radio.channel("modals");
                this.promptChannel = Backbone.Radio.channel("prompts");
            },

            /**
             *  When the DOM is ready, we're going to enable typed.js
             */
            onRender: function () {
                App.hidePageLoader();
                this.__setupTyped();
                this.__setupRadioListenerEvents();
                this.__checkIfReturningVisitor();
            },

            /**
             *  Returns a rendered template.
             *
             * @param serializedModel
             * @returns {Function}
             */
            template: function (serializedModel) {
                return _.template(Template, serializedModel);
            },

            templateHelpers: function () {
                var that = this;

                return {
                    twitterText: encodeURIComponent(that.TWITTER_PREFILL_TEXT),
                    facebookEnabled: that.facebookEnabled
                };
            },

            onDestroy: function () {
                this.promptChannel.unbind("contribute__hidden:click");
            },

            /**
             *  Called when the "upload another" button is clicked.
             *
             * @private
             */
            __onTryAnotherErrorButtonClick: function () {
                window.location.reload();
            },

            /**
             *  Called when the "try again" button is clicked.
             *
             * @private
             */
            __onRetryErrorButtonClick: function () {
                this.$el.find("#upload-occuring").show();
                this.$el.find("#upload-encountered-error").hide();
                this.__startComparison(this.lastComparisonKey);
            },

            /**
             *  Setup typed.js so the landing screen feels more interactive.
             *
             * @private
             */
            __setupTyped: function () {
                var that = this;
                var $el = this.$el.find("[typed]");
                $el.typed({
                    strings: that.configStore.getStatisticsMessages(),
                    typeSpeed: 0,
                    backDelay: 1750,
                    loop: true,
                    loopCount: false
                });
            },

            /**
             *  Setup a listener for the radio channels.
             *
             * @private
             */
            __setupRadioListenerEvents: function () {
                var that = this;
                /**
                 * When the navigation channel triggers "navigationTitleClicked", we want to change the default
                 * behaviour.
                 */
                this.navigationChannel.on("navigationTitleClicked", function (e) {
                    /** Prevent linking **/
                    e.preventDefault();

                    var location = window.location.hash;

                    /** Check URL Location **/
                    if (location === "" || location === "/#") {
                        /** Respond to navigation **/
                        that.navigationChannel.reply("navigationCanChangePage", false);

                        window.location.reload();
                    }
                });

                /**
                 *  Wait for the contributionMetaData prompt to propagate an event that verifies that
                 *  "Yes the user did in fact click that button!"
                 *
                 *  Once that is sent, we will open up the contribution metadata modal (not prompt)
                 */
                this.promptChannel.on("contribute__hidden:click", function () {
                    App.router.navigate("!visualize/", {
                        trigger: true
                    });
                });
            },

            /**
             * Checks if the visitor has a valid token
             *
             * @private
             */
            __checkIfReturningVisitor: function () {
                var that = this;

                LocalForage.getItem("visualize").then(function (value) {
                    var obj = value || { timeSet: 0 };
                    var userTime = new Date().getTime().toString();

                    if (that.checkSessionTimeout(obj.timeSet, userTime)) {
                        LocalForage.removeItem("visualize");
                        return;
                    }

                    /** If the value isn't empty, we have a key! **/
                    if (value !== null && value.key !== null && !that.checkSessionTimeout(value.timeSet, userTime)) {
                        that.__showRecontributeMetadataPrompt(value.key);
                    }
                });
            },

            /**
             *  Show the recontribute metadata prompt & setup an event listener to open up the modal when requested.
             *
             * @private
             */
            __showRecontributeMetadataPrompt: function (locallyStoredKey) {
                /**
                 *  Create new instance of ContributionMetadata prompt and then show it.
                 */
                var recontributeMetadataPrompt = new App.Prompts.RecontributeMetadata.Prompt();
                var that = this;

                /** Remove the saved data if the user does not wish to contribute their data **/
                var removeVisualizeItem = function () {
                    LocalForage.removeItem("visualize");
                };


                App.showModal(recontributeMetadataPrompt, null, "prompt", "fadeIn");

                /**
                 *  Tune into prompt radio
                 *  We will be propagating events through this.
                 */
                this.promptChannel = Backbone.Radio.channel("prompts");

                /**
                 *  Wait for the contributionMetaData prompt to propagate an event that verifies that
                 *  "Yes the user did in fact click that button!"
                 *
                 *  Once that is sent, we will open up the contribution metadata modal (not prompt)
                 */
                this.promptChannel.on("recontributeMetadata:getInvolvedButtonClicked", function () {
                    that.promptChannel.off("closeCurrentPrompt", removeVisualizeItem);
                    that.promptChannel.trigger("closeModal");
                    App.router.navigate("!visualize/", {
                        trigger: true
                    });
                });

                this.promptChannel.on("closeCurrentPrompt", removeVisualizeItem);

                this.globalChannel.on("app:pageChange", function () {
                    that.promptChannel.off("closeCurrentPrompt", removeVisualizeItem);
                });
            },

            /**
             * Close any prompts if there are any
             *
             * @private
             */
            __closePrompt: function () {
                if (this.promptChannel !== undefined) {
                    this.promptChannel.trigger("closeModal");
                }
            },

            /**
             *  Show the time series and fill in the tables with the data.
             *
             * @param timeSeriesArray
             * @private
             */
            __showTimeSeries: function (timeSeriesArray) {
                var $table = this.$el.find("#results>table");

                this.$el.find(".spinner").hide();
                timeSeriesArray.forEach(function (val, index) {
                    $table.append("<tr> <td>" + (1 + index) + "</td> <td>" + val + "</td> </tr>");
                });
                $table.fadeIn();
            },

            /**
             *  Shows an error message on the screen.
             *
             * @param message
             * @private
             */
            __showError: function (message) {
                this.$el.find("#upload-occuring").hide();

                var $errorSpace = this.$el.find("#upload-encountered-error");
                $errorSpace.find(".card-text").html(message);
                $errorSpace.fadeIn();
            },

            /**
             *  Starts off the comparison process with the given comparison key. The whole process starts
             *  and ends in this method.
             *
             * @param comparisonKey
             * @private
             */
            __startComparison: function (comparisonKey) {
                var that = this;
                var comparisonController = new Module.ComparisonController();

                comparisonController.on(comparisonController.EVENT_PROGRESS_CONVERSION_STARTED, function (conversionType) {
                    if ("audio" === conversionType && !that.dataArrived) {
                        that.__changeComparisonStatusText("Converting file to a time series. This might take a few moments.");
                    }
                });

                comparisonController.on(comparisonController.EVENT_PROGRESS_PRE_PROCESSING_STARTED, function () {
                    if (!that.dataArrived) {
                        that.__changeComparisonStatusText("Preprocessing time series");
                    }
                });

                comparisonController.on(comparisonController.EVENT_TIME_SERIES_DATA_ARRIVED, function (responseObj) {
                    if (responseObj.resultKey) {
                        that.dataArrived = true;

                        /**
                         * Set the key & timestamp, then we proceed to the visualize page.
                         */
                        LocalForage.setItem("visualize", {
                            key: responseObj.resultKey,
                            timeSet: new Date().getTime().toString()
                        }).then(function () {
                            // Kill it with fire
                            if (window.sessionStorage) {
                                window.sessionStorage.clear();
                            }

                            App.promptHiddenState = false;

                            $('#upload-occuring .spinner').hide();
                            $('#comparison-status-text').text('Finished uploading');
                            $('#view-analysis').prop('disabled', false);

                            // App.router.navigate("!visualize/", {
                            //     trigger: true
                            // });
                        });
                    }
                });

                /**
                 *  Called when the conversion process encounters an error. The errorObj object may contain
                 *  information about it, if the server was able to report useful advice back.
                 */
                comparisonController.on(comparisonController.EVENT_TIME_SERIES_ERROR, function (errorObj) {
                    /** We choose to rewrite the error messages to make them look a bit nicer. We do this by
                     *  defining a lookup between error classes from the server and front end messages. **/
                    var messageLookup = {
                        "EParseConversionError": "We couldn't detect a supported delimiter. " +
                            "Click <a href='#contribution-info'>here</a> to see a description of valid file formats.",
                        "EAudioConversionError": "We couldn't convert that audio file into a time series.  " +
                            "Please upload a valid MP3 or WAV file.",
                        "EEmptyTimeSeries": "It looks like the time series is empty or too small. Please try a different file."
                    };

                    if (errorObj && "ETruncationWarning" === errorObj.class) {
                        that.onShowMaxSampleSizeModal();

                        that.modalChannel.once("modalClosed", function () {
                            console.log('modal closed');
                            that.__returnToLanding();
                        });

                        that.modalChannel.once("modalSuccess", function () {
                            comparisonController.initiateComparison(comparisonKey, true);
                        });
                    } else {
                        if (errorObj && messageLookup[errorObj.class]) {
                            that.__showError(errorObj && messageLookup[errorObj.class]);
                        } else {
                            /** We aren't too sure what happened exactly, but let's fail gracefully anyway **/
                            that.__showError("Something went wrong, please try again.");
                        }
                    }

                });

                comparisonController.initiateComparison(comparisonKey);
            },

            __viewAnalysis: function () {
                App.router.navigate("!visualize/", {
                    trigger: true
                });
            },

            /**
             *  Changes the status text inside the loading window to that of statusText.
             *
             * @param statusText
             * @private
             */
            __changeComparisonStatusText: function (statusText) {
                this.$el.find("#comparison-status-text").text(statusText);
            },

            /**
             *  Called when the drop zone reports that the file has started being sent to the server.
             *
             * @private
             */
            __onDropZoneFileSending: function () {
                var $default = this.$el.find("#default");
                var $loader = this.$el.find("#loader");

                $default.hide();
                $loader.show().html(_.template(LoaderCustomHTML)({
                    timeSeriesCount: this.configStore.getTimeSeriesCount()
                }));

                this.__changeComparisonStatusText("Uploading file");
                this.__closePrompt();
            },

            /**
             * Return to the landing page screen.
             *
             * @private
             */
            __returnToLanding: function () {
                var $default = this.$el.find("#default");
                var $loader = this.$el.find("#loader");

                $default.show();
                $loader.hide().html("");
            },

            /**
             *  Called when the drop zone reports that the file was successfully sent
             *  to the server.
             *
             * @param comparisonKey
             * @private
             */
            __onDropZoneFileSent: function (comparisonKey) {
                this.lastComparisonKey = comparisonKey;
                this.__startComparison(comparisonKey);
            },

            /**
             *  When the file size is exceeded (reported by the dropzone sub-view), we want to show a modal
             *  notifying the user that the file exceeded the file size limit.
             *
             * @private
             */
            __onDropZoneFileSizeExceeded: function () {
                var that = this;
                var fileSizeExceededModal = new App.Modals.UploadErrorCommon.Modal({
                    title: "Oh no!",
                    content: "The file you tried to upload was too big! We cannot accept files over " +
                        that.configStore.getMaxFileSize() + "MB currently."
                });

                App.showModal(fileSizeExceededModal);
            },

            /**
             *  When the file amount is exceeded (reported by the dropzone sub-view), we want to show a modal
             *  notifying the user that they can't upload more than one file.
             *
             * @private
             */
            __onDropZoneFileAmountExceeded: function () {
                var fileAmountExceeded = new App.Modals.UploadErrorCommon.Modal({
                    title: "Oh no!",
                    content: "You can't upload more than one file at a time on this page."
                });

                App.showModal(fileAmountExceeded);
            },

            /**
             *  When the file upload returns an error (reported by the dropzone sub-view), we want to show a modal
             *  notifying the user that the file was unable to be uploaded.
             *
             * @private
             */
            __onDropZoneFileReturnedError: function () {
                var that = this;
                var fileReturnedError = new App.Modals.UploadErrorCommon.Modal({
                    title: "Oh no!",
                    content: "The file was unable to be uploaded. Make sure its a supported file and try again."
                });

                App.showModal(fileReturnedError);
                that.modalChannel.on("modalClosed", function () {
                    that.__returnToLanding();
                });
            },

            /**
             * Return true if the session has timed out.
             *
             * @param timestamp {Number} The number you want to start from (Timestamp)
             * @param currentTime {Number} The current time of the client.
             * @returns {boolean} True/False
             */
            checkSessionTimeout: function (timestamp, currentTime) {
                return (currentTime - this.configStore.getComparisonResultTimeout()) >= timestamp;
            },

            /**
             * Show the bulk contribution modal when we're asked to show it.
             */
            onShowBulkContributionModal: function () {
                var modal = new App.Modals.BulkContribution.Modal();

                App.showModal(modal);
            },

            onShowMaxSampleSizeModal: function () {
                var modal = new App.Modals.MaxSampleSize.Modal();

                App.showModal(modal);
            },

            onOpenFileDialog: function (e) {
                e.preventDefault();
                this.dropzone.openFileDialog();
            }

        });

    });

});
