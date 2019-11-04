define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Module definition **/
    App.module("LandingPage", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.ComparisonController = Backbone.Marionette.Object.extend({

            /**
             *  Lookup of status constants to remote status codes.
             */
            STATUS_CODES: {
                "IDLE": "0x000",
                "CONVERSION_STARTED": "0x003",
                "PRE_PROCESSING_STARTED": "0x005",
                "FINISHED": "0x002"
            },

            /**
             *  Events triggered by this controller.
             */
            EVENT_PROGRESS_CONVERSION_STARTED: "conversion:started",
            EVENT_PROGRESS_PRE_PROCESSING_STARTED: "preprocessing:started",
            EVENT_PROGRESS_FINISHED: "process:finished",
            EVENT_PROGRESS_OTHER: "process:other",
            EVENT_TIME_SERIES_DATA_ARRIVED: "timeseries:arrived",
            EVENT_TIME_SERIES_ERROR: "timeseries:error",

            /**
             *  We need to "boot" the comparison process to start. We have a comparison key for this
             *  which we sent to the server. We will immediately start getting messages collected
             *  in the event source.
             *
             * @param comparisonKey
             * @private
             */
            __startConversionProcess: function(comparisonKey, shouldIgnoreTruncationWarning){
                var that = this;
                shouldIgnoreTruncationWarning = shouldIgnoreTruncationWarning || false;
                var url = App.apiEndpoint() + "/compare/" + comparisonKey + "/convert";
                $.ajax({
                    type: "POST",
                    url: url,
                    data: JSON.stringify({
                        shouldIgnoreTruncationWarning: shouldIgnoreTruncationWarning
                    }),
                    contentType: "application/json",

                    /**
                     *  Called on success.
                     *
                     * @param response
                     */
                    success: function(response){
                        var responseObj = JSON.parse(response);
                        that.trigger(that.EVENT_TIME_SERIES_DATA_ARRIVED, responseObj);
                    },

                    /**
                     *  Called on error.
                     *
                     * @param error
                     */
                    error: function(error){
                        if (422 == error.status && error.responseText){
                            that.trigger(that.EVENT_TIME_SERIES_ERROR, JSON.parse(error.responseText));
                        }else{
                            that.trigger(that.EVENT_TIME_SERIES_ERROR);
                        }
                    }
                });
            },

            /**
             *  In order to receive updates from the server, we use Server Side Events (SSE).
             *  We setup a local EventStore instance and use our comparison key to define
             *  the specific URL we listen on.
             *
             * @param comparisonKey
             * @private
             */
            __setupEventStore: function(comparisonKey){
                var that = this;

                var eventSource = new EventSource(App.apiEndpoint() + "/compare/" + comparisonKey + "/status");
                eventSource.addEventListener("message", function(messageEvent) {
                    var rawMessage = JSON.parse(messageEvent.data);
                    var statusCode = rawMessage.code;

                    /** We will bubble up the events for external handling **/
                    switch(statusCode){
                        case that.STATUS_CODES.CONVERSION_STARTED:
                            that.trigger(that.EVENT_PROGRESS_CONVERSION_STARTED, rawMessage.conversionType);
                            break;
                        case that.STATUS_CODES.PRE_PROCESSING_STARTED:
                            that.trigger(that.EVENT_PROGRESS_PRE_PROCESSING_STARTED);
                            break;
                        case that.STATUS_CODES.FINISHED:
                            that.trigger(that.EVENT_PROGRESS_FINISHED);
                            break;
                        default:
                            that.trigger(that.EVENT_PROGRESS_OTHER, rawMessage);
                    }

                    /** If the process finishes, close the SSE connection **/
                    if (statusCode === that.STATUS_CODES.FINISHED){
                        eventSource.close();
                    }

                }, false);
            },

            /**
             *  Starts the comparison process. The comparison key must be passed in.
             *  Make sure to bind to the event handler on this object to respond
             *  to status updates from the server.
             *
             * @param comparisonKey
             */
            initiateComparison: function(comparisonKey, shouldIgnoreTruncationWarning){
                this.__startConversionProcess(comparisonKey, shouldIgnoreTruncationWarning);
                this.__setupEventStore(comparisonKey);
            }

        });

    });

});