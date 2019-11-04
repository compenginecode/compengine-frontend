define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");

    /** Module definition **/
    App.module("Controllers.CategoryController", function(Module, Application, Backbone){

        /** Define route controller **/
        Module.CategoryController = Marionette.Controller.extend({

            _categoryObject: {},

            coloredCategories: {},

            /**
             * Determine the colour that should be painted from what their position is.
             *
             * @param category {String} We'll lookup what their position is from their category.
             */
            getHexValueFromPosition: function(category) {
                if(!this._sortedCount) {
                    return;
                }

                var position = this._sortedCount.indexOf(category);

                /**
                 * Store a reference to the category for 2 reasons
                 *
                 * 1- We can't mess up the ordering this way.
                 * 2- Slight speed improvement.
                 */
                if(this.coloredCategories[category] !== undefined) {
                    return this.coloredCategories[category];
                }

                switch(position) {
                    case 0: {
                        this.coloredCategories[category] = "#ed4139";

                        return "#ed4139";
                    }

                    case 1: {
                        this.coloredCategories[category] = "#fe7f00";

                        return "#fe7f00";
                    }

                    case 2: {
                        this.coloredCategories[category]= "#009fc6";

                        return "#009fc6";
                    }

                    case 3: {
                        this.coloredCategories[category] = "#886cab";

                        return "#886cab";
                    }

                    case 4: {
                        this.coloredCategories[category] = "#73ab4a";


                        return "#73ab4a";
                    }

                    case 5: {
                        this.coloredCategories[category] = "#35ab9b";

                        return "#35ab9b";
                    }

                    case 6: {
                        this.coloredCategories[category] = "#a8ab03";

                        return "#a8ab03";
                    }

                    case 7: {
                        this.coloredCategories[category] = "#ab3675";

                        return "#ab3675";
                    }

                    case 8: {
                        this.coloredCategories[category] = "#26ab55";

                        return "#26ab55";
                    }

                    case 9: {
                        this.coloredCategories[category] ="#1d6bab";

                        return "#1d6bab";
                    }

                    default: {
                        this.coloredCategories[category] = "#a5a8a8";
                        return "#a5a8a8";
                    }

                }
            },

            /**
             * Clear the previous results.
             */
            clearPreviousResults: function() {
                for(var key in this.coloredCategories) {
                    delete this.coloredCategories[key];
                }

                if(undefined !== this._sortedCount && 0 !== this._sortedCount.length) {
                    this._sortedCount.length = 0;
                }

                for(var key in this._categoryObject) {
                    delete this._categoryObject[key];
                }
            },

            /**
             * Sorts the list
             */
            getSortedCount: function() {
                var that = this;
                this._sortedCount = Object.keys(this._categoryObject).sort(function(a,b){
                    return that._categoryObject[a] - that._categoryObject[b];
                });

                // Invert the array so #1 is first.
                this._sortedCount.reverse();
            },

            /**
             * Given an array, we calculate the amount for each category & then set an object locally.
             *
             * @param array
             */
            updateCategoryCount: function(array) {
                var that = this;

                /**
                 * Clean the object.
                 */
                if(undefined !== this._categoryObject) {
                    for(var key in this._categoryObject) {
                        delete that._categoryObject[key];
                    }
                    that._categoryObject = {};
                }

                array.forEach(function(aNode){
                    if (!that._categoryObject[aNode.category]){
                        that._categoryObject[aNode.category] = 0;
                    }

                    that._categoryObject[aNode.category]++;
                });

                this.getSortedCount();

                return this.getCategoryCount();

            },

            /**
             * Return a new object with contents of category object
             * (Ensuring we can't mutate the data outside of the updateCategoryCount function)
             *
             * @returns {Object}
             */
            getCategoryCount: function() {
                return Object.create(this._categoryObject);
            },

            getCategoryPosition: function(category) {
                var position = this._sortedCount.indexOf(category);

                return Math.min(position, 10);
            },

            getCategoryPositionSorted: function(category) {
                return this._sortedCount.reverse().indexOf(category);
            }

        });

    });

});
