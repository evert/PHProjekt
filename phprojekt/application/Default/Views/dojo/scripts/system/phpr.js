/**
 * This software is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License version 3 as published by the Free Software Foundation
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * @category   PHProjekt
 * @package    Application
 * @subpackage Default
 * @copyright  Copyright (c) 2010 Mayflower GmbH (http://www.mayflower.de)
 * @license    LGPL v3 (See LICENSE file)
 * @link       http://www.phprojekt.com
 * @since      File available since Release 6.0
 * @version    Release: @package_version@
 * @author     Gustavo Solt <solt@mayflower.de>
 */

dojo.provide("phpr");

/* template deps */

dojo.require("dojo.hash");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.Textarea");
dojo.require("dijit.form.HorizontalRuleLabels");
dojo.require("dojox.widget.Toaster");

/* phpr deps */

dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.Button");
dojo.require("dojox.data.QueryReadStore");
dojo.require("dijit.form.DateTextBox");
dojo.require("dijit._Widget");
dojo.require("dijit.Dialog");
dojo.require("dijit.layout._LayoutWidget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.layout.ContentPane");
dojo.require("dojox.dtl.Inline");

// Global vars
var module           = null;
var webpath          = null;
var currentProjectId = null;
var rootProjectId    = null;
var userTags         = null;
var currentTags      = null;
var serverFeedback   = null;

phpr.initWidgets = function(el) {
    // This parses the given node and inits the widgets found in there.
    if (dojo.isString(el)) {
        el = dojo.byId(el);
    }
    dojo.parser.parse(el);
};

phpr.destroySubWidgets = function(el) {
    // Destroy all the old widgets, so dojo can init the new ones with the same IDs again.
    if (dijit.byId(el) && dijit.byId(el).destroyDescendants) { // dijit widget id?
        dijit.byId(el).destroyDescendants();
    } else if (dojo.byId(el)) { // dom node id?
        try {
            var widget = dijit.byNode(dojo.byId(el));
            if (widget && widget.destroyDescendants) {
                widget.destroyDescendants();
            } else
                throw new Error("");
        } catch (e) {
            dojo.forEach(dijit.findWidgets(dojo.byId(el)), function(w) {
                w.destroyRecursive();
            });
            dojo.byId(el).innerHTML = '';
        }
    }
};

phpr.destroyWidget = function(el) {
    // Destroy only one widgwt using the id
    if (dijit.byId(el)) {
        dijit.byId(el).destroyRecursive();
    }
};

phpr.fillTemplate = function(templateName, data) {
    // Summary:
    //  fills a template with the data
    // Description:
    //  The template is fetched from the templateCache and filled with the data.
    //  The resulting string is then returned
    data = data || {};
    var context = new dojox.dtl.Context(data);
    // Use the cached template
    var tplContent = __phpr_templateCache[templateName];
    var tpl        = new dojox.dtl.Template(tplContent);
    var content    = tpl.render(context);
    tpl = null;
    tplContent = null;
    context = null;
    return content;
}

phpr.send = function(/*Object*/paramsIn) {
    // Send the given content to the server using the Default values,
    // if you need something special dont use this function.
    //
    //  Example call:
    //      phpr.send({url:"/live-save/", content:{data:1}, chunkMap:{tags:"tagsEl"}, onSuccess:function() {...}});

    // onEnd: Is always called after the onSuccess and onError have finished.
    //     This might be used for resetting things that are common for both cases.

    phpr.loading.show();
    var params = {
        url:       "",
        content:   "",
        handleAs:  "json",
        onSuccess: null,
        onError:   null,
        onEnd:     null,
        sync:      false,
        chunkMap:  {}
    }
    if (dojo.isObject(paramsIn)) {
        dojo.mixin(params, paramsIn);
    }
    var _onError, _onSuccess = function() {};
    var _onEnd = params.onEnd || function() {};

    if (params.onError) {
        _onError = function(response, ioArgs) {
            params.onError(response, ioArgs);
            _onEnd();
        }
    } else {
        _onError = function(response, ioArgs) {
            phpr.handleError(params.url, 'php');
            _onEnd();
        }
    }

    _onSuccess = function(data, ioArgs) {
        try {
            // 500 is the error code for logut
            if (data.code && data.code == 500) {
                location = phpr.webpath + 'index.php/Login/logout';
                return;
            } else {
                if (params.onSuccess) {
                    params.onSuccess(data, ioArgs);
                } else {
                    new phpr.handleResponse('serverFeedback', data);
                }
                _onEnd();
                phpr.loading.hide();
            }
        } catch(e) {
            phpr.handleError(params.url, 'exception');
            return;
        }
    };

    // Add a token
    if (params.content) {
        dojo.mixin(params.content, {'csrfToken': phpr.csrfToken});
    } else {
        params.content = {'csrfToken': phpr.csrfToken};
    }

    dojo.xhrPost({
        url:      params.url,
        content:  params.content,
        handleAs: params.handleAs,
        sync:     params.sync,
        error:    _onError,
        load:     _onSuccess
    });
};

phpr.handleResponse = function(resultArea, result) {
    phpr.loading.hide();
    var css = 'error';
    if (result.type == 'success') {
        css = 'success';
    } else if (result.type == 'warning') {
        css = 'warning';
    }
    var message= result.message
    if (!message) {
        return;
    }
    phpr.serverFeedback.addMessage({cssClass: css, output:message});
};

phpr.getCurrent = function(data, identifier, value) {
    var current = null;
    for (var i = 0; i < data.length; i++) {
        if (value == data[i][identifier]) {
            current = data[i];
            break;
        }
    }
    return current;
};


phpr.drawEmptyMessage = function(message) {
    // Summary:
    //    Center and make bold an error message
    // Description:
    //    Center and make bold an error message
    var output = '';
    output += '<div style="text-align: center; margin: 10px 10px 10px 10px; font-weight: bold;">';
    output += phpr.nls.get(message);
    output += '</div>';
    return output;
};

phpr.isValidInputKey = function(key) {
    // Summary:
    //    Return if a key is a valid input key
    // Description:
    //    Return if a key is a valid input key
    if ((key != dojo.keys.ENTER) &&
       (key != dojo.keys.NUMPAD_ENTER) &&
       (key != dojo.keys.TAB) &&
       (key != dojo.keys.CTRL) &&
       (key != dojo.keys.SHIFT) &&
       (key != dojo.keys.CLEAR) &&
       (key != dojo.keys.ALT) &&
       (key != dojo.keys.PAUSE) &&
       (key != dojo.keys.CAPS_LOCK) &&
       (key != dojo.keys.ESCAPE) &&
       (key != dojo.keys.SPACE) &&
       (key != dojo.keys.PAGE_UP) &&
       (key != dojo.keys.PAGE_DOWN) &&
       (key != dojo.keys.END) &&
       (key != dojo.keys.HOME) &&
       (key != dojo.keys.LEFT_ARROW) &&
       (key != dojo.keys.UP_ARROW) &&
       (key != dojo.keys.RIGHT_ARROW) &&
       (key != dojo.keys.DOWN_ARROW) &&
       (key != dojo.keys.INSERT) &&
       (key != dojo.keys.DELETE) &&
       (key != dojo.keys.HELP) &&
       (key != dojo.keys.LEFT_WINDOW) &&
       (key != dojo.keys.RIGHT_WINDOW) &&
       (key != dojo.keys.SELECT) &&
       (key != dojo.keys.NUMPAD_MULTIPLY) &&
       (key != dojo.keys.NUMPAD_PLUS) &&
       (key != dojo.keys.NUMPAD_DIVIDE) &&
       (key != dojo.keys.F1) &&
       (key != dojo.keys.F2) &&
       (key != dojo.keys.F3) &&
       (key != dojo.keys.F4) &&
       (key != dojo.keys.F5) &&
       (key != dojo.keys.F6) &&
       (key != dojo.keys.F7) &&
       (key != dojo.keys.F8) &&
       (key != dojo.keys.F9) &&
       (key != dojo.keys.F10) &&
       (key != dojo.keys.F11) &&
       (key != dojo.keys.F12) &&
       (key != dojo.keys.F13) &&
       (key != dojo.keys.F14) &&
       (key != dojo.keys.F15) &&
       (key != dojo.keys.NUM_LOCK) &&
       (key != dojo.keys.SCROLL_LOCK)) {
      return true;
    } else {
       return false;
    }
};

dojo.declare("phpr.DataStore", null, {
    // Summary:
    //    Get and return data from the server
    // Description:
    //    The data is request to the server
    //    and then is cached for the future used.
    _internalCache: new Array(),

    _active: false,

    addStore:function(params) {
        // Summary:
        //    Set a new store for save the data
        // Description:
        //    Set a new store for save the data
        if (typeof this._internalCache[params.url] == 'undefined') {
            store = new phpr.ReadStore({url: params.url});
            this._internalCache[params.url] = {
                data:  new Array(),
                store: store
            };
        } else if (params.noCache) {
            store = new phpr.ReadStore({url: params.url});
            this._internalCache[params.url] = {
                data:  new Array(),
                store: store
            };
        }
    },

    requestData:function(params) {
        // Summary:
        //    Request the data
        // Description:
        //    If the data is not cached, request to the server.
        //    Then return to the processData function
        if (typeof params.processData == "undefined") {
            params.processData = null;
        }
        if (this._internalCache[params.url]['data'].length == 0) {
            phpr.loading.show();
            if (this._active == true) {
                setTimeout(dojo.hitch(this, "requestData", params), 500);
            } else {
                this._active = true;
                this._internalCache[params.url]['store'].fetch({
                    serverQuery: params.serverQuery || {},
                    onComplete:  dojo.hitch(this, "saveData", {
                        url:         params.url,
                        processData: params.processData
                    }),
                    onError: dojo.hitch(this, "errorHandler", {
                        url:         params.url,
                        processData: params.processData
                    })}
                );
            }
        } else if (params.processData) {
            params.processData.call();
        }
    },

    errorHandler:function(scope, error) {
        // Summary:
        //    Display a PHP or JS error
        // Description:
        //    If there is some data before the json
        //    the error is cached and showed
        //    Also is cached the JS error

        // Get the message error
        if ((error.number && (error.number & 0xFFFF == 1002 || error.number & 0xFFFF == 1006)) // IE
            || (error.name && error.name == "SyntaxError")) { // FF
            // PHP Error
            phpr.handleError(scope.url, 'php');
        } else {
            // Js error
            if (phpr.config.showInternalJsErrors) {
                var message = null;
                if (error.message) {
                    message = error.message;
                } else if (error.description) {
                    message = error.description;
                }
                phpr.handleError(scope.url, 'js', message);
            }
        }
    },

    saveData:function(params, data) {
        // Summary:
        //    Store the data in the cache
        // Description:
        //    Store the data in the cache
        //    Then return to the processData function
        this._active = false;
        this._internalCache[params.url]['data'] = data;
        phpr.loading.hide();
        if (params.processData) {
            params.processData.call();
        }
    },

    getData:function(params) {
        // Summary:
        //    Return the "data" tag from the server
        // Description:
        //    Return the "data" tag from the server
        return this.getStore(params).getValue(this._internalCache[params.url]['data'][0], "data") || Array();
    },

    getMetaData:function(params) {
        // Summary:
        //    Return the "metadata" tag from the server
        // Description:
        //    Return the "metadata" tag from the server
        return this.getStore(params).getValue(this._internalCache[params.url]['data'][1], "metadata") || Array();
    },

    deleteData:function(params) {
        // Summary:
        //    Delete the cache
        // Description:
        //    Delete the cache
        if (this._internalCache[params.url]) {
           this._internalCache[params.url]['data'] = new Array();
        }
    },

    deleteDataPartialString:function(params) {
        // Summary:
        //    Deletes the cache for the urls that start with the received string.
        for (url in this._internalCache) {
            var urlLeft = url.substring(0, params.url.length);
            if (urlLeft == params.url) {
                this._internalCache[url]['data'] = new Array();
            }
        }
    },

    getStore:function(params) {
        // Summary:
        //    Return the current data.store
        // Description:
        //    Return the current data.store
        return this._internalCache[params.url]['store'];
    },

    deleteAllCache:function() {
        // Summary:
        //    Delete all the cache
        // Description:
        //    Delete all the cache
        for (var i in this._internalCache) {
            // Special case for global modules since are not reloaded
            if (this._internalCache[i] && i != phpr.webpath + 'index.php/Core/module/jsonGetGlobalModules') {
                this._internalCache[i]['data'] = new Array();
            }
        }
    }
});

dojo.declare("phpr.ReadStore", dojox.data.QueryReadStore, {
    // Summary:
    //    Request to the server
    // Description:
    //    Request to the server and return an array with
    //    data and metadata values
    requestMethod:  "post",
    doClientPaging: false,

    _assertIsItem:function(item) {
    },

    _fetchItems:function(request, fetchHandler, errorHandler) {
        if (request.serverQuery) {
            request.serverQuery.csrfToken = phpr.csrfToken;
        } else if (request.query) {
            request.query.csrfToken = phpr.csrfToken;
        } else {
            request.serverQuery = {};
            request.serverQuery.csrfToken = phpr.csrfToken;
        }
        this.inherited(arguments);
    },

    _filterResponse:function(data) {
        var retData     = new Array();
        var retMetaData = new Array();

        if (!data) {
            phpr.handleError(this.url, 'exception');
        } else if (data.code && data.code == 500) {
            // 500 is the error code for logut
            location = phpr.webpath + 'index.php/Login/logout';
        } else if (data.type && data.type == "error") {
            phpr.handleError(this.url, 'error', data.message);
        } else {
            var customData = false;
            if (typeof data.data == 'undefined') {
                customData = true;
                data.data  = new Array();
            }

            if (true == customData && data.data.length == 0 && typeof data.metadata == 'undefined') {
                retData     = data;
            } else {
                retData     = data.data;
                retMetaData = data.metadata;
            }
        }

        var ret = {
            items: [
                {"data":     retData},
                {"metadata": retMetaData}
            ]
        }

        return ret;
    }
});

dojo.declare("phpr.DateTextBox", [dijit.form.DateTextBox], {
    _blankValue: '', // used by filter() when the textbox is blank

    parse:function(value, constraints) {
        // Summary:
        //    Parses as string as a Date, according to constraints
        // Date
        return this.dateLocaleModule.parse(value, constraints) || (this._isEmpty(value) ? '' : undefined);
    },

    serialize:function(d, options) {
        // Summary:
        //     This function overwrites the dijit.form.DateTextBox display
        // Description:
        //     Make sure that the date is not only displayed localized, but also
        //     the value which is returned is set to this date format
        return dojo.date.locale.format(d, {selector:'date', datePattern:'yyyy-MM-dd'}).toLowerCase();
    }
});

dojo.declare("phpr.ServerFeedback", [dijit._Widget], {
    // Summary:
    //     A class for displaying the ServerFeedback
    // Description:
    //     This class receives the Server Feedback and displays it to the User
    messages:[],
    displayedMessages:[],

    addMessage:function(message) {
        this.messages.push(message);
        this.displayMessage(message);
    },

    deleteLastMessage:function(message) {
        this.messages.pop();
    },

    displayMessage:function(message) {
        this.displayedMessages = [message];
        for (i in this.displayedMessages) {
            out = this.displayedMessages[i];
            dojo.publish("ServerFeedback", [{
                message: out.output,
                type:    out.cssClass
                }]
            );
        }
    }
});

dojo.declare("phpr.loading", null, {
    // Summary:
    //     Simple class for show or hide the loading icon
    // Description:
    //     Simple class for show or hide the loading icon
    hide:function() {
        if (dojo.byId('loadingIcon')) {
            dojo.byId('loadingIcon').style.display = 'none';
        }
    },

    show:function() {
        if (dojo.byId('loadingIcon')) {
            dojo.byId('loadingIcon').style.display = 'inline';
        }
    }
});

dojo.declare("phpr.translator", null, {
    // Summary:
    //     Translation class
    // Description:
    //     Collect all the translated strings into an array
    //     and return the request string translated.
    _strings: {},

    constructor:function(translatedStrings) {
       this._strings = translatedStrings;
    },

    get:function(string, module, useFallback) {
        var returnValue;
        var strings = this._strings;

        if (useFallback) {
            if (strings._fallback) {
                strings = strings._fallback;
            } else {
                // We got no fallback from the server. Just return the string.
                return string;
            }
        }

        // Special module
        if (module && strings[module] && strings[module][string]) {
            returnValue = strings[module][string];
        // Current module
        } else if (strings[phpr.module] && strings[phpr.module][string]) {
            returnValue = strings[phpr.module][string];
        // Core module
        } else if (strings['Core'] && strings['Core'][string]) {
            returnValue = strings['Core'][string];
        // Default module
        } else if (strings['Default'] && strings['Default'][string]) {
            returnValue = strings['Default'][string];
        } else {
            // Untranslated string
            if (!useFallback) {
                returnValue = this.get(string, module, true);
            } else {
                // We're already using the fallback. Just return the string now.
                returnValue = string;
            }
        }
        return returnValue;
    }

});

dojo.declare("phpr.Dialog", [dijit.Dialog], {
    // Summary:
    //     Provide a dialog with some changes
    // Description:
    //     Allow dialog into other dialog and fix the key input
    _onKey:function(/*Event*/ evt) {
    // Summary: handles the keyboard events for accessibility reasons
        if (evt.charOrCode) {
            var dk   = dojo.keys;
            var node = evt.target;
            if (evt.charOrCode === dk.TAB) {
                this._getFocusItems(this.domNode);
            }
            var singleFocusItem = (this._firstFocusItem == this._lastFocusItem);
            // see if we are shift-tabbing from first focusable item on dialog
            if (node == this._firstFocusItem && evt.shiftKey && evt.charOrCode === dk.TAB) {
                if (!singleFocusItem) {
                    dijit.focus(this._lastFocusItem); // send focus to last item in dialog
                }
                dojo.stopEvent(evt);
            } else if (node == this._lastFocusItem && evt.charOrCode === dk.TAB && !evt.shiftKey) {
                if (!singleFocusItem) {
                    dijit.focus(this._firstFocusItem); // send focus to first item in dialog
                }
                dojo.stopEvent(evt);
            } else {
                // see if the key is for the dialog
                while (node) {
                    if (node == this.domNode || node == this.domNode.parentNode) {
                        if (evt.charOrCode == dk.ESCAPE) {
                            this.onCancel();
                        } else {
                            return; // just let it go
                        }
                    }
                    node = node.parentNode;
                }
                // this key is for the disabled document window
                if (evt.charOrCode !== dk.TAB) {
                    // allow tabbing into the dialog for a11y
                    dojo.stopEvent(evt);
                // opera won't tab to a div
                } else if (!dojo.isOpera) {
                    try {
                        this._firstFocusItem.focus();
                    } catch(e) {
                        /*squelch*/
                    }
                }
            }
        }
    }
});

dojo.declare("phpr.InitialScreen", null, {
    // Summary:
    //     Manage the visibility of the page on init
    // Description:
    //     Manage the visibility of the page on init
    start:function() {
        dojo.style("completeContent", "opacity", 0);
    },

    end:function() {
        dojo.style("completeContent", "opacity", 1);
        dojo.style("initLoading", "display", "none");
    }
});

phpr.loadJsFile = function(fileName) {
    // Load a js and insert into the head
    var fileRef = document.createElement('script')
    fileRef.setAttribute("type" ,"text/javascript");
    fileRef.setAttribute("src", fileName);
    if (typeof fileRef != "undefined") {
        document.getElementsByTagName("head")[0].appendChild(fileRef)
    }
};

phpr.loadCssFile = function(fileName) {
    // Load a css and insert into the head
    var fileRef = document.createElement("link")
    fileRef.setAttribute("rel", "stylesheet");
    fileRef.setAttribute("type", "text/css");
    fileRef.setAttribute("href", fileName);
    if (typeof fileRef!="undefined") {
        document.getElementsByTagName("head")[0].appendChild(fileRef)
    }
};

phpr.handleError = function(url, type, message) {
    // Process and return an error message
    var response  = {};
    response.type = 'error';

    if (url) {
        response.message = url.replace(phpr.webpath, "") + ': ';
    } else {
        response.message = '';
    }

    switch (type) {
        case 'exception':
            response.message += phpr.nls.get('Internal exception') + '<br />';
            response.message += phpr.nls.get('Please contact the administrator and check the error logs');
            break;
        case 'php':
            response.message += phpr.nls.get('Invalid json format') + '<br />';
            response.message += phpr.nls.get('Please contact the administrator and check the error logs');
            break;
        case 'error':
            response.message += phpr.nls.get('User error') + '<br />';
            response.message += message;
            break;
        case 'js':
            response.message += phpr.nls.get('Internal javascript error') + '<br />';
            response.message += message;
            break;
        case 'silence':
            console.log(phpr.nls.get('Server unreachable! ') + message);
            return;
            break;
        default:
            response.message += phpr.nls.get('Unexpected error');
            break;
    }

    // Show support address?
    if (phpr.config.supportAddress != undefined && phpr.config.supportAddress != '') {
        response.message += '<br /> ' + phpr.nls.get('Support address:') + ' ' + phpr.config.supportAddress;
    }

    new phpr.handleResponse('serverFeedback', response);
};

dojo.declare("phpr.BreadCrumb", null, {
    // Summary:
    //     Manage the Breadcrumb
    // Description:
    //     Manage the Breadcrumb
    _module:       '',
    _projects:     new Array(),
    _item:         '',
    _lastModule:   null,
    _lastParent:   null,
    _separatorOne: ' / ',
    _separatorTwo: ' > ',

    setProjects:function(projects) {
        // Summary:
        //     Set the projects tree as one string
        // Description:
        //     Set the projects tree as one string
        this._projects = projects;
        this._module   = null;
        this._item     = null;
    },

    setModule:function() {
        // Summary:
        //     Set the module and sub-module
        // Description:
        //     Change the module and sub-module only if these change
        if (phpr.module != this._lastModule || phpr.parentmodule != this._lastParent || !this._module) {
            if (phpr.parentmodule && phpr.parentmodule != phpr.module) {
                this._module     = phpr.nls.get(phpr.parentmodule) + this._separatorOne + phpr.nls.get(phpr.module);
                this._lastParent = phpr.parentmodule;
            } else {
                this._module = phpr.nls.get(phpr.module);
            }
            this._item       = null;
            this._lastModule = phpr.module;
        }
    },

    setItem:function(item) {
        // Summary:
        //     Set the item value
        // Description:
        //     Display the item info (By default, the first field value)
        //     Show "New" if is a new item
        if (!item) {
            item = phpr.nls.get('New');
        }
        this._item = item;
    },

    draw:function() {
        // Summary:
        //     Draw the breadcrumb
        // Description:
        //     Show the breadcrumb in the title
        if (this._projects.length > 0) {
            var titleArray    = new Array();
            var projectsArray = new Array();
            for (var i in this._projects) {
                var link = '<a href="javascript: dojo.publish(\'' + phpr.module + '.changeProject\', ['
                    + this._projects[i].id + ']);">' + this._projects[i].name + '</a>';
                projectsArray.push(link);
                titleArray.push(this._projects[i].name);
            }
            var breadCrumb      = projectsArray.join(this._separatorTwo.toString()) + this._separatorOne + this._module;
            var breadCrumbTitle = titleArray.join(this._separatorTwo.toString()) + this._separatorOne + this._module;
        } else {
            var breadCrumb      = this._module;
            var breadCrumbTitle = this._module;
        }
        if (this._item) {
            breadCrumb      += this._separatorOne + this._item;
            breadCrumbTitle += this._separatorOne + this._item;
        }
        document.title                    = breadCrumbTitle;
        dojo.byId("breadCrumb").innerHTML = breadCrumb;
    }

});

phpr.inArray = function(needle, haystack) {
    // Summary:
    //    Checks whether the given needle is in the haystack 
    // Description:
    //    Checks whether the given needle is in the haystack

    // we need to check for this, because for some reason, the function is
    // called with undefined as haystack very often
    if(dojo.isArray(haystack) || "Object" == typeof haystack) {
        return dojo.indexOf(haystack, needle) != -1;
    }

    return false;
};

dojo.declare("phpr.FilteringSelect", dijit.form.FilteringSelect, {
    // Summary:
    //    Extend the dojo FilteringSelect for fix some bugs.
    // Description:
    //    The dojo select do not allow two or more labels with the same name,
    //    for select users that is a problem (users with the same name),
    //    See: http://trac.dojotoolkit.org/ticket/7279
    //    Also change the query options and highlight for work with trees in select.

    // Highlight any occurrence
    highlightMatch: "all",

    // `${0}*` means "starts with", `*${0}*` means "contains", `${0}` means "is"
    queryExpr: "*${0}*",

    // Internal var for fix the bug of items with the same display
    _lastSelectedId: null,

    _doSelect:function(/*Event*/ tgt) {
        // Summary:
        //    Overrides ComboBox._doSelect(), the method called when an item in the menu is selected.
        // Description:
        //    FilteringSelect overrides this to set both the visible and
        //    hidden value from the information stored in the menu.
        //    Also mark the last selected item.
        this._setValueFromItem(tgt.item, true);
        this._lastSelectedId = this.get('value');
    },

    _setDisplayedValueAttr:function(/*String*/ label, /*Boolean?*/ priorityChange) {
        // Summary:
        //    Overrides dijit.form.FilteringSelect._setDisplayedValueAttr().
        // Description:
        //    Change the query for search the id if an item is select,
        //    or by the name is not (normal case)

        // When this is called during initialization it'll ping the datastore
        // for reverse lookup, and when that completes (after an XHR request)
        // will call setValueAttr()... but that shouldn't trigger an onChange()
        // event, even when it happens after creation has finished
        if(!this._created){
            priorityChange = false;
        }

        if(this.store) {
            var query = dojo.clone(this.query); // #6196: populate query with user-specifics
            // Escape meta characters of dojo.data.util.filter.patternToRegExp().
            if (this._lastSelectedId != null) {
                this._lastQuery = query['value'] = this._lastSelectedId;
            } else {
                this._lastQuery = query[this.searchAttr] = label.replace(/([\\\*\?])/g, "\\$1");
            }
            this._lastSelectedId = null;

            // If the label is not valid, the callback will never set it,
            // so the last valid value will get the warning textbox set the
            // textbox value now so that the impending warning will make
            // sense to the user
            this.textbox.value = label;
            this._lastDisplayedValue = label;
            var _this = this;
            var fetch = {
                query:        query,
                queryOptions: {
                    ignoreCase: this.ignoreCase,
                    deep:       true
                },
                onComplete: function(result, dataObject) {
                    dojo.hitch(_this, "_callbackSetLabel")(result, dataObject, priorityChange);
                },
                onError: function(errText) {
                    dojo.hitch(_this, "_setValue")("", label, false);
                }
            };
            dojo.mixin(fetch, this.fetchProperties);
            this.store.fetch(fetch);
        }
    },

    doHighlight: function(/*String*/label, /*String*/find) {
        // Summary:
        //    Highlights the string entered by the user in the menu.
        //    Change the function for Highlights all the occurences

        // Add greedy when this.highlightMatch=="all"
        var modifiers = "i"+(this.highlightMatch=="all"?"g":"");
        var escapedLabel = this._escapeHtml(label);
        find = dojo.regexp.escapeString(find); // escape regexp special chars
        var ret = escapedLabel.replace(new RegExp("(^|\\s|\\w)("+ find +")", modifiers),
            '$1<span class="dijitComboBoxHighlightMatch">$2</span>');
        return ret; // Returns String, (almost) valid HTML (entities encoded)
    }
});

phpr.isGlobalModule = function(module) {
    // Summary:
    //    Return if the module is global or per project
    // Description:
    //    Return if the module is global or per project
    var globalModules = phpr.DataStore.getData({url: phpr.globalModuleUrl});

    // System Global Modules
    if (module == 'Administration' || module == 'Setting') {
        return true;
    } else if (phpr.parentmodule == 'Administration' || phpr.parentmodule == 'Setting') {
        return true;
    } else {
        for (index in globalModules) {
            if (globalModules[index]['name'] == module) {
                return true;
            }
        }
    }
    return false;
};

dojo.declare("phpr.regExpForFilter", null, {
    // Summary:
    //    Return the regular expresion used for parse filter values
    // Description:
    //    Reject all the characters except letters, numbers, dash, underscore and colon
    getExp:function() {
        return '[^\\x21\\x22\\x23\\x24\\x25\\x26\\x27\\x28\\x29\\x2A\\x2B\\x2C\\x2E\\x2F\\x3B'
            + '\\x3C\\x3D\\x3E\\x3F\\x5B\\x5C\\x5D\\x5E\\x60\\x7B\\x7C\\x7D\\x7E\\x82\\x83\\x84\\x85'
            + '\\x86\\x87\\x88\\x89\\x8B\\x91\\x92\\x93\\x94\\x95\\x98\\x99\\x9B\\xA1\\xA6\\xAC\\xAE'
            + '\\xAF\xA8\\xB0\\xB1\\xB2\\xB3\\xB4\\xB6\\xB7\\xB8\\xB9\\xBA\\xBB\\xBC\\xBD\\xBE\\xBF]*';
    },

    // Summary:
    //    Return the message used for invalid values
    getMsg:function() {
        return '<b>' + phpr.nls.get('Invalid string') + '</b><br />'
            + phpr.nls.get('Allowed values are: Letters, numbers, space, dash, underscore and colon');
    }
});

phpr.confirmDialog = function(callbackOk, message) {
    // Summary:
    //    Open a dialog for confirm the delete action
    // Description:
    //    Open a dialog and call the callback function on "OK" clicked
    var callback = function(confirm) {
        confirmDialog.hide();
        confirmDialog.destroyRecursive();
        if (confirm) {
            callbackOk.call();
        }
    }

    var content = new dijit.layout.ContentPane({
        region: 'center',
        style:  'text-align: center;'
    }, document.createElement('div'));
    var question = new dijit.layout.ContentPane({
        region:  'center',
        content: '<p>' + message + '</p>'
    }, document.createElement('div'));
    var buttonContent = new dijit.layout.ContentPane({
        region: 'bottom',
        gutter: 'yes'
    }, document.createElement('div'));
    var buttonOK = new dijit.form.Button({
        baseClass: 'negative',
        iconClass: 'tick',
        style:     'float: left;',
        label:     phpr.nls.get('OK'),
        onClick:   dojo.hitch(this, function() {
            callback(true);
        })
    });
    var buttonCancel = new dijit.form.Button({
        baseClass: 'positive',
        iconClass: 'cross',
        style:     'float: right;',
        label:     phpr.nls.get('Cancel'),
        onClick:   dojo.hitch(this, function() {
            callback(false);
        })
    });
    var confirmDialog = new phpr.Dialog({
        title:     phpr.nls.get('Confirmation'),
        draggable: false,
        style:     "width: 300px;"
    });

    buttonContent.domNode.appendChild(buttonOK.domNode);
    buttonContent.domNode.appendChild(buttonCancel.domNode);

    content.domNode.appendChild(question.domNode);
    content.domNode.appendChild(dojo.create('br'));
    content.domNode.appendChild(buttonContent.domNode);

    confirmDialog.containerNode.appendChild(content.domNode);
    confirmDialog.show();
    // avoid cyclic refs
    content = null;
    question = null;
    buttonContent = null;
    buttonOK = null;
    buttonCancel = null;
    return confirmDialog;
};
