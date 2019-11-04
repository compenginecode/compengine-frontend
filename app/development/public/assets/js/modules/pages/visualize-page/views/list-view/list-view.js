/**
 *  List View page
 *
 * @module modules/pages/visualize-page
 * @memberof Pages
 * @see Pages
 */
define(function(require) {

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var Marionette = require("marionette");
    var Radio = require("backbone.radio");

    /** Item view **/
    var NeighbourView = require("./neighbour-view/neighbour-view");

    /** HTML template **/
    var Template = require("text!./list-view.html");

    /** Define module **/
    App.module("VisualizePage.ListView", function (Module, Application, Backbone) {

        /** Define module view **/
        Module.View = Marionette.CompositeView.extend({

            className: "w-100",

            events: {
                "dblclick tr": "onTableRowDoubleClick",
                "keypress tr": "onTableRowKeypress",
                "click [data-page]": "onPaginationClick"
            },

            /**
             * Listen to model changes
             */
            modelEvents: {
                "change": "render"
            },

            childView: Module.NeighbourView,

            childViewContainer: "#neighbours",

            selectedElement: "",

            neighboursAmount: 20,

            /** Do not change **/
            neighboursPerPage: 20,

            maxPages: 6,

            currentlyShowing: 1,

            neighboursAmountChanged: false,

            neighboursToShow: {
                from: 0,
                to: 20
            },

            /**
             * When the page gets rendered, we want to make sure we can set the collection with the neighbours.
             */
            onRender: function() {
                var that = this;
                var neighbours = this.model.get("neighbours");
                var amountOfNeighours;

                if(undefined !== neighbours) {
                    amountOfNeighours = Math.min(neighbours.nodes.length, this.neighboursAmount)
                } else {
                    amountOfNeighours = this.neighboursAmount;
                }

                this.setupPagination(amountOfNeighours);
                this.determineToAndFrom();

                console.log(this.model.attributes);

                if (this.model.get('timeSeries')) {
                    var targetNodeView = new Module.NeighbourView({ model: new Backbone.Model({
                        id: this.model.get('id'),
                        name: this.model.get('name') ? this.model.get('name') : 'Recently Uploaded Time Series!',
                        fullDataPoints: this.model.get('timeSeries').raw,
                        category: this.model.get('category') ? this.model.get('category').name : 'Please contribute'
                    }) });
                    targetNodeView.render();
                    this.$el.find('#target-node').html();
                    this.$el.find('#target-node').append(targetNodeView.$el);
                }

                /**
                 * This will run after the server has returned data.
                 */
                if(undefined !== neighbours) {
                    var count = this.neighboursToShow.from || 0;

                    var max = Math.min(that.neighboursToShow.to, that.neighboursAmount);

                    this.collection.reset();

                    if(this.neighboursAmount >= 1) {
                        do {
                            this.collection.add(neighbours.nodes[count]);
                            count++;
                        } while (count < max);
                    }


                    /**
                     * A persistent state over each render.
                     */
                    if("" !== this.selectedElement.trim()) {
                        this.$el.find("#" + this.selectedElement).addClass("active");
                    }
                }
            },

            /**
             *  We have to declare the model & collection on initialize
             *
             * @param options {Object} Options that are passed from the parent
             */
            initialize: function(options) {
                var that = this;
                this.model = options.model;
                this.collection = new Backbone.Collection();
                this.categoryController = options.categoryController;

                /** Setup Collection **/
                this.collection.comparator = "similarityScore";

                Radio.channel("childView:neighbourView").on("childView:initialize", function(childView) {
                    that.onChildViewInitialize(childView);
                });
            },

            /**
             *  Returns a rendered template.
             *
             * @param serializedModel
             * @returns {Function}
             * @protected
             */
            template: function(serializedModel){
                return _.template(Template, serializedModel);
            },

            onChildViewInitialize: function(childView) {
                childView.setCategoryController(this.categoryController);
            },

            /**
             *  When the table row has been clicked, We'll add an active state to it so we can now select multiples.
             *
             * @param e {Event} The click event
             */
            onTableRowClick: function(e) {
                this._previouslySelected = this.selectedElement;

                if(this.selectedElement === e.currentTarget.id) {
                    delete this.selectedElement;
                } else {
                    this.selectedElement = e.currentTarget.id;
                }

                if(this._previouslySelected !== this.selectedElement) {
                    $("#" + this._previouslySelected).removeClass("active");
                }

                $(e.currentTarget).toggleClass("active");
            },

            /**
             *  For accessibility, we'll run the same function as click if they press space on one of the rows.
             *
             * @param e {Event} Keypress event
             */
            onTableRowKeypress: function(e) {
                if (e.keyCode == 0 || e.keyCode == 32 || e.keyCode == 13) {
                    e.preventDefault();
                    this.onTableRowClick(e);
                }
            },

            /**
             * Set the amount of neighbours we will show.
             *
             * @param amount {Number} The amount of neighbours
             */
            setNeighboursAmount: function(amount) {
                this.neighboursAmount = amount;
                this.neighboursAmountChanged = true;
                this.render();
            },

            /**
             * Setup pagination on each pass.
             *
             * @param amount {Number} The amount passed by the slider (0 - 100)
             */
            setupPagination: function(amount) {
                var pages = this.determineAmountOfPages(amount);
                var i = 0;
                var paginationContainer = this.$el.find("#pagination");

                paginationContainer.html("");


                if(pages === 1) {
                    this.currentlyShowing = 1;
                    return;
                }

                /** Add the previous page item **/
                paginationContainer.append("<li class='page-item'><a class='page-link' data-page='previous' href='#' aria-label='Previous'><span aria-hidden='true'>&laquo;</span><span class='sr-only'>Previous</span></a></li>")

                do {
                    var classList;
                    i++;

                    if(this.currentlyShowing === i) {
                        classList = "active";
                    } else {
                        classList = "";
                    }

                    paginationContainer.append("<li class='page-item " + classList + "'><a class='page-link' data-page='page-" + i + "' data-id='" + i + "' href='#'>" + i + "</a></li>");
                } while (i < pages);

                /** Add the next page item **/
                paginationContainer.append("<li class='page-item'><a class='page-link' data-page='next' href='#' aria-label='Next'><span aria-hidden='true'>&raquo;</span><span class='sr-only'>Next</span></a></li>");

                this.maxPages = pages;
            },

            /**
             * Determine the max amount of pages that we can get out of a given number.
             *
             * @param amount {Number} The amount of nodes / neighbours we have
             * @returns {number} The amount of pages.
             */
            determineAmountOfPages: function(amount) {
                return Math.ceil(Math.max(1, (amount / this.neighboursPerPage)));
            },

            /**
             * When the user clicks one of the pagination links, we'll determine what we need to do.
             *
             * @param e {Event} The click event.
             */
            onPaginationClick: function(e) {
                e.preventDefault();

                switch(e.currentTarget.getAttribute("data-page")) {

                    case "next": {
                        this.showNextPage(e);
                        break;
                    }
                    case "previous": {
                        this.showPreviousPage(e);
                        break;
                    }

                    default: {
                        this.showPage(e.currentTarget.getAttribute("data-id"));
                        return;
                    }

                }
            },

            /**
             * When the user clicks the next button in the pagination.
             *
             * @param e {Event} The click event.
             */
            showNextPage: function(e) {
                /** Increment the currently showing **/
                if(this.currentlyShowing === this.maxPages) {
                    return;
                }

                e.currentTarget.blur();

                this.currentlyShowing++;

                /** Re render the page **/
                this.render();
            },

            showPreviousPage: function(e) {
                var toShow = this.currentlyShowing - 1;
                /** Decrement the currently showing **/
                if(toShow === 0) {
                    return;
                }

                e.currentTarget.blur();

                this.currentlyShowing--;

                /** Re render the page **/
                this.render();
            },

            /**
             * Show a specific page.
             *
             * @param page {String} The page you're trying to show.
             */
            showPage: function(page) {
                var pageToShow;

                // in production, this should just put you on the last page possible.
                if(page > this.maxPages) {
                    pageToShow = this.maxPages;
                } else {
                    pageToShow = page;
                }

                this.currentlyShowing = parseInt(pageToShow);

                this.render();
            },

            /**
             * Determine the neighbours we should show
             */
            determineToAndFrom: function() {
                switch(this.currentlyShowing) {
                    case 1: {
                        this.neighboursToShow = {
                            from: 0,
                            to: 19
                        };

                        break;
                    }

                    case 2: {
                        this.neighboursToShow = {
                            from: 20,
                            to: 40
                        };

                        break;
                    }

                    case 3: {
                        this.neighboursToShow = {
                            from: 40,
                            to: 60
                        };

                        break;
                    }

                    case 4: {
                        this.neighboursToShow = {
                            from: 60,
                            to: 80
                        };

                        break;
                    }

                    case 5: {
                        this.neighboursToShow = {
                            from: 80,
                            to: 100
                        };

                        break;
                    }
                }
            },

            /**
             * When one of the rows get double clicked, we'll emit an event that notifies our parent to
             * change the active node.
             *
             * @param e {Event} The double click event
             */
            onTableRowDoubleClick: function(e) {
                e.stopPropagation();
                e.preventDefault();

                App.showPageLoader();

                $(window.document.body).css("overflow", "hidden");

                this.trigger("change:activeNode", e.currentTarget.getAttribute("id"), function() {
                    $(window.document.body)[0].removeAttribute("style");
                    App.hidePageLoader();
                });
            },

            /**
             * When the parent has new nodes, we'll update.
             *
             * @param model {Backbone.Model} Backbone model
             */
            updateListView: function(model) {
                this.model.set(model.toJSON());
            }

        });

    });

});
