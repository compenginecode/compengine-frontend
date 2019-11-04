define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");

    /** Module definition **/
    App.module("VisualizePage.Models", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.ComparisonResult = Backbone.Model.extend({

            /**
             *  Returns the root URL for this resource.
             *
             * @returns {string}
             */
            url: function(){
                if ("temporary" === this.get("mode")){
                    var base = App.apiEndpoint() + "/compare/results/" + this.get("id");
                }else{
                    var base = App.apiEndpoint() + "/timeseries/" + this.get("id");
                }
                var url = base + "?topLevelCategory=" + this.filterCondition.topLevelCategory;

                if ("" !== this.filterCondition.source.trim()){
                    url += "&source=" + this.filterCondition.source.trim();
                }

                var tags = this.filterCondition.tags.join(";");
                if (tags.length > 0) {
                    url += "&tags=" + this.filterCondition.tags.join(";");
                }

                return url;
            },

            fetchComparisonResults: function(filterCondition){
                this.filterCondition = filterCondition;
                return this.fetch();
            },

            parse: function (data) {
                var that = this;
                data.neighbours.nodes = _.filter(data.neighbours.nodes, function (node) {
                    return that.get('id') !== node.id;
                });
                return data;
            }

        });

    });

});