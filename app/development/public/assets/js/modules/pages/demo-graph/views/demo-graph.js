/**
 *  Demo Graph Page
 *
 * @deprecated
 * @module pages/demo-graph-page
 * @memberof Pages
 * @see Pages
 */
define(function(require){

    /** Global dependencies **/
    var App = require("app");
    var Backbone = require("backbone");
    var BossView = require("bossview");
    var Marionette = require("marionette");

    /** Local dependencies **/
    var ConfigurationStore = require("modules/common/controllers/configuration-store");
    var Footer = require("modules/common/views/footer/footer");
    var Modals = require("modals");
    var Navigation = require("modules/common/views/navigation/navigation");
    var Typed = require("typed");
    var VisJS = require("vis");

    /** Template **/
    var Template = require("text!./demo-graph.html");

    /** Define module **/
    App.module("DemoGraph", function(Module, Application, Backbone) {

        /** Define module view **/
        Module.View = Backbone.Marionette.BossView.extend({

            /**
             * Subviews
             */
            subViews: {
                footer: App.Common.Footer.View,
                navigation: App.Common.Navigation.View
            },

            /**
             * Containers for the sub views
             */
            subViewContainers: {
                footer: "#footer-container",
                navigation: "#navigation-container"
            },

            /**
             * On initialization, we'll setup a Configuration controller.
             */
            initialize: function() {
                this.configStore = new App.ConfigurationStore.Controller();
            },

            /**
             * Returns a rendered template.
             *
             * @param serializedModel
             * @returns {Function}
             */
            template: function(serializedModel){
                return _.template(Template, serializedModel);
            },

            /**
             * When the DOM is ready. we're going to render the graph.
             */
            onRender: function() {
                this.__setupGraph();
            },

            /** Private Functions **/

            /**
             * Setup the Comparison Graph
             *
             * @private
             */
            __setupGraph: function() {

                var color = "#cccccc";
                var len;

                var nodes = [
                    {
                        id: 0,
                        group: 0,
                        parseColor: true,
                        color: {
                            border: "#ed4139",
                            background: "#f4f4f4",
                            highlight: {
                                border: "#ed4139",
                                background: "#f4f4f4"
                            }
                        },
                        title: "Demo Node 6",
                        label: "\uf1db",
                        font: {
                            color: "#ed4139"
                        }
                    },
                    {
                        id: 1,
                        group: 0,
                        parseColor: true,
                        color: {
                            border: "#ed4139",
                            background: "#f4f4f4",
                            highlight: {
                                border: "#ed4139",
                                background: "#f4f4f4"
                            }
                        },
                        title: "Demo Node 6",
                        label: "\uf111",
                        font: {
                            color: "#ed4139"
                        }
                    },
                    {
                        id: 2,
                        group: 0,
                        parseColor: true,
                        color: {
                            border: "#ed4139",
                            background: "#f4f4f4",
                            highlight: {
                                border: "#ed4139",
                                background: "#f4f4f4"
                            }
                        },
                        title: "Demo Node 6",
                        label: "\uf111",
                        font: {
                            color: "#ed4139"
                        }
                    },
                    {
                        id: 3,
                        group: 1,
                        parseColor: true,
                        color: {
                            border: "#fe7f00",
                            background: "#f4f4f4",
                            highlight: {
                                border: "#fe7f00",
                                background: "#f4f4f4"
                            }
                        },
                        title: "Demo Node 6",
                        label: "\uf111",
                        font: {
                            color: "#fe7f00"
                        }
                    },
                    {
                        id: 4,
                        group: 1,
                        parseColor: true,
                        color: {
                            border: "#fe7f00",
                            background: "#f4f4f4",
                            highlight: {
                                border: "#fe7f00",
                                background: "#f4f4f4"
                            }
                        },
                        title: "Demo Node 6",
                        label: "\uf1db",
                        font: {
                            color: "#fe7f00"
                        }
                    },
                    {
                        id: 5,
                        group: 1,
                        parseColor: true,
                        color: {
                            border: "#fe7f00",
                            background: "#f4f4f4",
                            highlight: {
                                border: "#fe7f00",
                                background: "#f4f4f4"
                            }
                        },
                        title: "Demo Node 6",
                        label: "\uf111",
                        font: {
                            color: "#fe7f00"
                        }
                    },
                    {
                        id: 6,
                        group: 2,
                        parseColor: true,
                        color: {
                            border: "#009fc6",
                            background: "#f4f4f4",
                            highlight: {
                                border: "#009fc6",
                                background: "#f4f4f4"
                            }
                        },
                        title: "Demo Node 6",
                        label: "\uf111",
                        font: {
                            color: "#009fc6"
                        }
                    },
                    {
                        id: 7,
                        group: 2,
                        parseColor: true,
                        color: {
                            border: "#009fc6",
                            background: "#f4f4f4",
                            highlight: {
                                border: "#009fc6",
                                background: "#f4f4f4"
                            }
                        },
                        title: "Demo Node 6",
                        label: "\uf1db",
                        font: {
                            color: "#009fc6"
                        }
                    },
                    {
                        id: 8,
                        group: 2,
                        parseColor: true,
                        color: {
                            border: "#009fc6",
                            background: "#f4f4f4",
                            highlight: {
                                border: "#009fc6",
                                background: "#f4f4f4"
                            }
                        },
                        title: "Demo Node 6",
                        label: "\uf111",
                        font: {
                            color: "#009fc6"
                        }
                    },
                    {
                        id: 9,
                        group: 3,
                        parseColor: true,
                        color: {
                            border: "#886cab",
                            background: "#f4f4f4",
                            highlight: {
                                border: "#bfb1d0",
                                background: "#bfb1d0"
                            },
                            hover: {
                                border: "#a793c0",
                                background: "#a793c0"
                            }
                        },
                        title: "Demo Node 6",
                        label: "\uf111",
                        font: {
                            color: "#886cab"
                        }
                    },
                    {
                        id: 10,
                        group: 3,
                        parseColor: true,
                        color: {
                            border: "#886cab",
                            background: "#f4f4f4",
                            highlight: {
                                border: "#bfb1d0",
                                background: "#bfb1d0"
                            },
                            hover: {
                                border: "#a793c0",
                                background: "#a793c0"
                            }
                        },
                        title: "Demo Node 6",
                        label: "\uf1db",
                        font: {
                            color: "#886cab"
                        }
                    },
                    {
                        id: 11,
                        group: 3,
                        parseColor: true,
                        color: {
                            border: "#886cab",
                            background: "#f4f4f4",
                            highlight: {
                                border: "#bfb1d0",
                                background: "#bfb1d0"
                            },
                            hover: {
                                border: "#a793c0",
                                background: "#a793c0"
                            }
                        },
                        title: "<div class='alert alert-info'>Hello</div>",
                        label: "\uf111",
                        font: {
                            color: "#886cab",
                            highlight: "#9685ab"
                        }
                    }
                ];
                var edges = [
                    {from: 1, to: 0},
                    {from: 2, to: 0},
                    {from: 4, to: 3},
                    {from: 5, to: 4},
                    {from: 4, to: 0},
                    {from: 7, to: 6},
                    {from: 8, to: 7},
                    {from: 7, to: 0},
                    {from: 10, to: 9},
                    {from: 11, to: 10},
                    {from: 10, to: 0}
                ];

                // create a network
                var container = this.$el.find("#data-visualization")[0];

                var data = {
                    nodes: nodes,
                    edges: edges
                };

                var options = {
                    nodes: {
                        size: 32,
                        font: {
                            size: 24,
                            align: "center",
                            face: "FontAwesome"
                        },
                        borderWidth: 2
                    },

                    edges: {
                        color: "#b0b0b0",
                        width: 2
                    },

                    interaction: {
                        hover: true
                    }
                };

                var network = new VisJS.Network(container, data, options);
            }

        });

    });

});