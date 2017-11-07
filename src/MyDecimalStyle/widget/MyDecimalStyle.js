define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",
    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",

 "dojo/text!MyDecimalStyle/widget/template/MyDecimalStyle.html"
], function (declare,  _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent, widgetTemplate) {
    "use strict";

    return declare("MyDecimalStyle.widget.MyDecimalStyle", [ _WidgetBase, _TemplatedMixin ], {
        templateString: widgetTemplate,
        //Moderler variables
        field: null,
        beforeClassname: null,
        afterClassname: null,

        //tenplate attach points

        beforeNode: null,
        afterNode: null,
        decimalNode: null,

        // Internal variables.
        _handles: null,
        _contextObj: null,

        onClickMicroflow:null,

        constructor: function () {
            this._handles = [];
        },

        postCreate: function () {
            logger.debug(this.id + ".postCreate");
            dojoClass.add(this.beforeNode, this.beforeClassname);
            dojoClass.add(this.afterNode, this.afterClassname);
        },

        update: function (obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;
            this._resetSubscriptions();
            this._seetupEvents();
            this._updateRendering(callback);
        },

        _seetupEvents: function(){
            this.connect(this.domNode, "onclick", lang.hitch(this, function(){
                this._runMicroflow(this.onClickMicroflow)
            }))
        },

        _runMicroflow: function(mfName){
            mx.data.action({ 
                params: {
                    applyto: "selection",
                    actionname: mfName,
                    guids: [this._contextObj.getGuid()]
                },
                origin:this.mxform,
                callback: lang.hitch(this, function(obj){
                    var newDecimal = obj[0].get(this.field);
                    this._contextObj.set(this.field, newDecimal);
                }),
                error: function(error){
                    console.log(error.message)
                }
            });
        },
        _updateRendering: function(callback){
            //1. get the value of the context object
            var decimalValue = this._contextObj.get(this.field);

            //2. split that value into left and right parts
            var parts = ('' + decimalValue).split('.');

            //3. add to left and right parts
            this.beforeNode.innerHTML = parts[0];
            this.afterNode.innerHTML = parts[1] || "0";
            this._executeCallback(callback);
        },

        _resetSubscriptions: function(){
            this.unsubscribeAll();
            var _attHandle = this.subscribe({
                guid: this._contextObj.getGuid(),
                attr: this.field,
                callback: lang.hitch(this, function(){
                        this._updateRendering();
                })
            });

            this.subscribe({
                guid:this._contextObj.getGuid(),
                callback: lang.hitch(this, function(){
                        this._updateRendering();
                })

            })
        },

        resize: function (box) {
            logger.debug(this.id + ".resize");   
        },

        uninitialize: function () {
            logger.debug(this.id + ".uninitialize");
        },

        // Shorthand for running a microflow
        _execMf: function (mf, guid, cb) {
            logger.debug(this.id + "._execMf");
            if (mf && guid) {
                mx.ui.action(mf, {
                    params: {
                        applyto: "selection",
                        guids: [guid]
                    },
                    callback: lang.hitch(this, function (objs) {
                        if (cb && typeof cb === "function") {
                            cb(objs);
                        }
                    }),
                    error: function (error) {
                        console.debug(error.description);
                    }
                }, this);
            }
        },

        // Shorthand for executing a callback, adds logging to your inspector
        _executeCallback: function (cb, from) {
            logger.debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["MyDecimalStyle/widget/MyDecimalStyle"]);
