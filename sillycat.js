/* global $priv, HTMLDocument */
/*jshint esversion: 6 */
/**
 *
 * @author Daniel Jongeling
 * @version v2.0
 * @published 09-04-2018
 *
 *
 * Publishing notes:
 * Added option to add or alter attributes as a single value or as an object with multiple values
 *
 *
 *
 *
 *
 ***************PROJECT NOTES
 *
 *
 *implemented assets and methods
 *
 * private scope:
 *
 * @method databinder
 * @method binddata
 * @method eventbinds
 * @method eventdispatch
 * @method digest
 *
 * global scope:
 * @method router
 *
 *
 * Framework scope:
 * @method each
 * @method toString
 * @method css
 * @method html
 * @method closest
 * @method append
 * @method digest
 * @method router
 *
 *
 *
 */
/*******************************************************************************
 *
 * UNDER THE HOOD
 *
 * FRAMEWORK: The framework consists of controller, directives and services. These are
 * created when building the application. When the application is started, the javascript
 * is run an dthe controllers are created. After that the page is sacanned for controller
 * attributes config.prefix + "-controller". When one is found, the related controller is initiated
 * and the scope of teh controller is available.
 *
 *
 * BINDS: To speed up development, the framework offers data binding is multiple ways,
 * meaning that it also applies element value, image src attribute, link href attribute.
 *
 *
 * METHODS: Next to a structured MVC framework there are also methods available to
 * assist for a fast and flexible development of the application.
 *
 *
 * BINDING CURLY BRACES
 * The framework will actively search for text entries with the double curly braces
 * to replace these with a span tag and additional config.prefix + "-bind" attribute. This allows
 * for partial replacement of text.
 *
 *
 * FRAMEWORK METHODS:
 * @function digest(element, controller)
 * Digests the element and activates the controller to attach event listeners
 * and bindings
 *
 *
 * @function append(context, content)
 * Appends the content to the context element. Finds the parent controller and
 * digests the appended content to attach event and bindings
 *
 *******************************************************************************/
/**
 *
 * @param object
 *            window
 * @return {undefined}
 */
(function (window) {
    'use strict';
    // prefix for html5 attributes (default data)
    let config = {
        prefix: 'data'
    };
    // variable declaration
    let _controller = {},
            _directive = {},
            _services = {},
            _formdata = {},
            _private = {},
            _global = {},
            _bind = {},
            _model = {},
            _view = {},
            $;
    // Major Browser Test
    let isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    _global.isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
    _private = {
        oDatabind: [
            config.prefix + '-bind',
            config.prefix + '-image'
        ],
        oModelbind: [
            config.prefix + '-model'
        ],
        oViewbind: [
            config.prefix + '-view'
        ],
        oCssbind: [
            config.prefix + '-css',
            config.prefix + '-style'
        ],
        oHrefbind: [
            config.prefix + '-href'
        ],
        mouseActions: [
            config.prefix + '-click',
            config.prefix + '-dblclick',
            config.prefix + '-mouseover',
            config.prefix + '-mouseout',
            config.prefix + '-mouseenter',
            config.prefix + '-mouseleave',
            config.prefix + '-keypress',
            config.prefix + '-keydown',
            config.prefix + '-keyup',
            config.prefix + '-submit',
            config.prefix + '-change',
            config.prefix + '-mousemove',
            config.prefix + '-hover'
        ],
        styleControl: ['display'],
        /**
         *
         * @param {HTML object} scope
         * @returns {undefined}
         *
         * Scans the page/scope for controllers. It will ignite/execute the
         * controllers found.
         *
         */
        activate_controllers: (scope) => {
            let controllers = scope.querySelectorAll('[' + config.prefix + '-controller]');
            [].forEach.call(controllers, crtlelem => {
                let attrs = crtlelem.getAttribute(config.prefix + '-controller')
                        .split(',');
                [].forEach.call(attrs, item => {
                    let attr = item.trim();
                    if (!_controller[attr]) {
                        alert('Controller ' + attr + ' not found!');
                    } else {
                        _private.bindset(crtlelem, attr);
                        _controller[attr].ignite(_controller[attr], crtlelem, $);
                    }
                });
            });
        },
        /**
         *
         * @param {HTML object} elem
         * @returns {String}
         *
         * Determines the HTML property to apply for binding
         *
         */
        element_node: (elem) => {
            let form_elem, bool_elem, img_elem, nodename, nohtml, type;
            form_elem = ['input', 'textarea', 'select'];
            bool_elem = ['checkbox', 'radio'];
            nohtml = ['span'];
            img_elem = ['img'];
            nodename = elem.nodeName.toLowerCase();
            type = elem.type;
            if (form_elem.includes(nodename)) {
                return 'value';
            }
            if (nohtml.includes(nodename)) {
                return 'innerText';
            }
            if (bool_elem.includes(type)) {
                return 'checked';
            }
            if (img_elem.includes(nodename)) {
                return 'src';
            }
            return 'innerHTML';
        },
        /*-------------------------------------------------------------------------------------
         
         PROPERTY BINDING
         
         Configure the binder objects and get and set property methods
         
         -------------------------------------------------------------------------------------*/
        /**
         *
         * @param {object} obj
         * @param {HTMLObject} elem
         * @param {string} prop
         * @returns {undefined}
         *
         * Simple binding, but for large complex HTML content.
         * Performs automatic digest for sactivation of controller and process
         * new found data and event binds.
         */
        viewbinder: (obj, elem, prop) => {
            // set to automatically digest when set
            Object.defineProperty(obj, prop, {
                set: function (val) {
                    elem.innerHTML = val;
                    _private.digest(elem);
                },
                configurable: true
            });
        },
        /**
         *
         * @param {type} obj
         * @param {type} elem
         * @param {type} prop
         * @returns {undefined}
         *
         * Binding for simple content.
         */
        databinder: function (obj, elem, prop) {
            Object.defineProperty(obj, prop, {
                set: (val) => {
                    if (typeof val === 'function') {
                        alert('it is a function');
                    }
                    elem[this.element_node(elem)] = val;
                },
                get: () => {
                    return elem[this.element_node(elem)];
                },
                configurable: true
            });
        },
        /**
         *
         * @param {type} obj
         * @param {type} elem
         * @param {type} prop
         * @returns {undefined}
         *
         * Binds the model property to the bind propert for instant two-way binding
         */
        modelbinder: function (obj, elem, prop) {
            // find binding element
            let bounded;
            bounded = document.querySelector('[' + config.prefix + '-bind="' + prop + '"]');
            bounded.addEventListener('change', (event) => {
                _model[prop] = _bind[prop];
            });
            Object.defineProperty(obj, prop, {
                set: (val) => {
                    elem[this.element_node(elem)] = val;
                    _private.digest(elem);
                },
                configurable: true
            });
            _model[prop] = _bind[prop];
        },
        /**
         *
         * @param {object} obj
         * @param {object} elem
         * @param {string} prop
         * @returns {undefined}
         *
         * Binds the href attribute for dynamic links
         */
        hrefbinder: function (obj, elem, prop) {
            Object.defineProperty(obj, prop, {
                set: (val) => {
                    elem.href = val;
                },
                get: () => {
                    return elem.href;
                },
                configurable: true
            });
        },
        /**
         *
         * @param {type} obj
         * @param {type} elem
         * @param {type} prop
         * @returns {undefined}
         *
         * Binds the CSS style of the elment for easy styling
         */
        cssbinder: function (obj, elem, prop) {
            Object.defineProperty(obj, prop, {
                set: (obj) => {
                    Object.keys(obj)
                            .forEach((property) => {
                                elem.style[property] = obj[property];
                            });
                },
                get: () => {
                    return elem.style;
                },
                configurable: true
            });
        },
        /*-------------------------------------------------------------------------------------
         
         SCAN BIND ATTRIBUTES
         
         Scans page within the scope of the controllers
         and directives for binding attributes
         
         -------------------------------------------------------------------------------------*/
        /**
         *
         * @param {HTML object} scope
         * @param {object} obj
         * @returns {undefined}
         *
         * Scans the page for attributes that are predefined in the oDatabind object
         * property in the _private object.
         */
        databinds: function (scope, obj) {
            obj.forEach(databind => {
                let prop, i, length, binders;
                binders = scope.querySelectorAll('[' + databind + ']');
                length = binders.length;
                for (i = 0; i < length; i += 1) {
                    prop = binders[i].getAttribute(databind);
                    _private.databinder(_bind, binders[i], prop);
                }
            });
        },
        /**
         *
         * @param {HTML object} scope
         * @returns {undefined}
         *
         * Scans the page that are defined with the use of the double curly brace
         *
         */
        curlybinds: function (scope) {
            var matches = scope.innerHTML.match(/\{{.*?\}}/g);
            if (matches) {
                matches.forEach(item => {
                    let str, param, newstr;
                    str = item.replace(/[{}]/g, '');
                    param = str.split(':');
                    newstr = '';
                    if (param.length === 1) {
                        param.unshift('span');
                    }
                    if (param.length === 2) {
                        newstr = scope.innerHTML.replace(item, '<' + param[0] + ' ' + config.prefix + '-bind=' + param[1] + '></' + param[0] + '>');
                    }
                    if (param.length === 3) {
                        param[1] = param[1].replace(/\[|\]/g, '');
                        let attr = param[1].split(',');
                        let attrstring = attr.join(' ');
                        newstr = scope.innerHTML.replace(item, '<' + param[0] + ' ' + config.prefix + '-bind=' + param[2] + ' ' + attrstring + '></' + param[2] + '>');
                    }
                    scope.innerHTML = newstr;
                });
            }
        },
        /**
         *
         * @param {HTML object} scope
         * @param {object} obj
         * @returns {undefined}
         *
         * Scans the page for attributes that are predefined in the oModelbind object
         * property in the _private object.
         */
        modelbinds: function (scope, obj) {
            obj.forEach(modelbind => {
                let prop, i, models, length;
                models = scope.querySelectorAll('[' + modelbind + ']');
                length = models.length;
                for (i = 0; i < length; i += 1) {
                    prop = models[i].getAttribute(modelbind);
                    _private.modelbinder(_model, models[i], prop);
                }
            });
        },
        /**
         *
         * @param {HTML object} scope
         * @param {object} obj
         * @returns {undefined}
         *
         * Scans the page for attributes that are predefined in the oViewbind object
         * property in the _private object.
         */
        viewbinds: function (scope, obj) {

            obj.forEach(dataview => {
                let prop, i, viewbinds, length;
                viewbinds = scope.querySelectorAll('[' + dataview + ']');
                length = viewbinds.length;
                for (i = 0; i < length; i += 1) {
                    prop = viewbinds[i].getAttribute(dataview);
                    _private.viewbinder(_view, viewbinds[i], prop);
                }
            });
        },
        /**
         *
         * @param {HTML object} scope
         * @param {object} obj
         * @returns {undefined}
         *
         * Scans the page for attributes that are predefined in the oCssbind object
         * property in the _private object.
         */
        cssbinds: function (scope, obj) {
            obj.forEach(datacss => {
                let prop, i, cssbinds, length;
                cssbinds = scope.querySelectorAll('[' + datacss + ']');
                length = cssbinds.length;
                for (i = 0; i < length; i += 1) {
                    prop = cssbinds[i].getAttribute(datacss);
                    _private.cssbinder(_bind, cssbinds[i], prop);
                }
            });
        },
        /**
         *
         * @param {HTML object} scope
         * @param {object} obj
         * @returns {undefined}
         *
         * Scans the page for attributes that are predefined in the oHrefbind object
         * property in the _private object.
         */
        hrefbinds: function (scope, obj) {
            obj.forEach(datahref => {
                let prop, i, hrefbinds, length;
                hrefbinds = scope.querySelectorAll('[' + datahref + ']');
                length = hrefbinds.length;
                for (i = 0; i < length; i += 1) {
                    prop = hrefbinds[i].getAttribute(datahref);
                    _private.hrefbinder(_bind, hrefbinds[i], prop);
                }
            });
        },
        /*-------------------------------------------------------------------------------------
         
         MOUSE ACTIONS AND DISPATCH
         
         Scans page within the scope of the controllers
         and directives for mouse bindings and dispatches
         to the assigned methods.
         
         -------------------------------------------------------------------------------------*/
        /**
         *
         * @param {HTML object} scope
         * @param {string} controller
         * @returns {undefined}
         *
         * Scans the page for mouse binds that are predefined in the mouseActions object
         * property in the _private object.
         * Add event listeners to the element.
         *
         * Makesa passing for every controller
         */
        eventbinds: function (scope, controller) {
            //            console.log(scope);

            _private.mouseActions.forEach(datamouse => {

                let evtype, i, mousebinds, length;
                mousebinds = scope.querySelectorAll('[' + datamouse + ']');
                length = mousebinds.length;

                if (length > 0) {
                    evtype = datamouse.split('-').pop();

                    for (i = 0; i < length; i += 1) {
                        let methods = {};
                        let elem = mousebinds[i];
                        let method = elem.dataset[evtype];
                        methods[evtype] = method;
                        elem.methods = elem.methods || {};
                        elem.methods[evtype] = method;
                        elem.addEventListener(evtype, _private.eventdispatch, false);
                        elem.controller = controller;
                    }
                }
            });
        },
        /**
         *
         * @param {type} event
         * @returns {undefined}
         *
         * Dispatcher for mouse events. Executes the function object that is
         * attached to the assigned property
         */
        eventdispatch: function (event) {
            let obj = event.currentTarget;
            let method = obj.methods[event.type];
            try {
                if (typeof _controller[obj.controller][method.trim()] === 'function') {
                    _controller[obj.controller][method.trim()](event);
                } else {
                    let crtlname = obj.closest('[' + config.prefix + '-controller]')
                            .getAttribute(config.prefix + '-controller');
                    throw new Error('call to unknow method "' + method.trim() + '" in "' + crtlname + '" controller"');
                }
            } catch (e) {
                console.log('error: thrown in eventdispatch\n' + 'message: ' + e.message + '\n' + 'line number: ' + e.lineNumber + '\n' + 'caller: ' + method);
                alert('An fatal error has occured. Unable to continue!');
            }
        },
        /**
         *
         * @param {HTMLobject} scope
         * @param {string} controller
         * @returns {undefined}
         *
         * Sub function. Walks the binder functions to activate the HTML content
         * within the scope.
         *
         */
        bindset: function (scope, controller) {
//            console.log(controller);
            _private.databinds(scope, _private.oDatabind);
            _private.viewbinds(scope, _private.oViewbind);
            _private.hrefbinds(scope, _private.oHrefbind);
            _private.cssbinds(scope, _private.oCssbind);
            _private.modelbinds(scope, _private.oModelbind);
            _private.eventbinds(scope, controller);
        },
        /*-------------------------------------------------------------------------------------
         
         DIGEST NEW CONTENT
         
         Scan newly injected content for new controller and directives
         to intialize them
         
         -------------------------------------------------------------------------------------*/
        stringToHtmlObject: function (htmlstring) {
            let string = $(htmlstring)
                    .firstElement;
            return string;
        },
        append: function (elem, contentstring) {
            let scope, contrelem, template;
            scope = null;
            contrelem = null;
            template = document.createElement('template');
            template.innerHTML = contentstring;
            if (typeof elem === 'string') {
                scope = _private.stringToHtmlObject(elem);
            }
            if (typeof elem === 'object') {
                scope = elem.selector;
            }
            scope.appendChild(template.content);
            contrelem = scope.closest('[' + config.prefix + '-controller]');
            _private.digest(scope, contrelem.dataset.controller);
        },
        prepend: function (elem, contentstring) {
            let scope, contrelem, template;
            scope = null;
            contrelem = null;
            template = document.createElement('template');
            template.innerHTML = contentstring;
            if (typeof elem === 'string') {
                scope = _private.stringToHtmlObject(elem);
            }
            if (typeof elem === 'object') {
                scope = elem.selector;
            }
            scope.prepend(template.content);
            contrelem = scope.closest('[' + config.prefix + '-controller]');
            _private.digest(scope, contrelem.dataset.controller);
        },
        digest: function (scope, ctrl) {

            // submitting bind elements ( can only be single 'first' elements)
            if (typeof scope === 'string') {
                scope = _private.stringToHtmlObject(scope);
            }
            if (scope.tagName) {
                _private.curlybinds(scope);
            }

            // In case a controller is unknown, the closest in the tree will be assigned
            if (ctrl === undefined && !(scope instanceof HTMLDocument)) {
                let contrelem = scope.closest('[' + config.prefix + '-controller]');
                ctrl = contrelem.dataset.controller;
            }

            let elems, length, i;
            Object.keys(_directive)
                    .forEach(directive => {
                        elems = scope.querySelectorAll('[' + directive + '] ,[' + config.prefix + '-directive=' + directive + ']');
                        length = elems.length;
                        for (i = 0; i < length; i += 1) {
                            if (elems[i]) {
                                _directive[directive](_directive[directive], elems[i], $);
                            }
                        }
                    });

            if (ctrl !== undefined) {
                _private.bindset(scope, ctrl);
            } else {
                _private.activate_controllers(scope);
            }
        },

        /*-------------------------------------------------------------------------------------
         
         AJAX COMMUNICATION LOGIC
         
         Perform the xmlHttpRequest to the back-end
         
         
         -------------------------------------------------------------------------------------*/
        xhrcall: function (xhr) {
            var promise = new Promise(function (resolve, reject) {
                var request = new XMLHttpRequest();
                request.onload = function () {
                    if (request.status === 200) {
                        if (request.responseType === 'json') {
                            resolve(request.response);
                            return;
                        }
                        if (xhr.dataType === 'json' && !request.responseType) {
                            resolve(JSON.parse(request.responseText));
                            return;
                        } else {
                            resolve(request.responseText);
                            return;
                        }
                    } else {
                        throw request.statusText;
//                        reject(new Error(request.statusText));
                    }
                };
                request.open(xhr.method, xhr.url, true);
                request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                request.responseType = xhr.dataType;
                if (xhr.beforesend && typeof xhr.beforesend === 'function') {
                    xhr.beforesend(request);
                }
                request.send(xhr.data);
            });
            return promise;
        },
        /*-------------------------------------------------------------------------------------
         
         EXTENDING THE FRAMEWORK
         
         The framework can be extended with services/plugins that
         may be developed for multiple use.
         
         
         -------------------------------------------------------------------------------------*/
        extend: function () {
            this[arguments[0]] = arguments[1];
        },
        /*-------------------------------------------------------------------------------------
         
         CSS ANIMATION HELPER
         
         Animations through CSS becomes a problem when the target property
         values are unknow. The CSS animation helper calculates the target
         values by quicly changing the state of the element anf back. Returning
         the calculated values.
         
         
         -------------------------------------------------------------------------------------*/
        getCssProperties: function (elem, props, callback, args) {
            var result, name, old = {};
            // store original styles in old
            for (name in props) {
                old[name] = elem.style[name];
                elem.style[name] = props[name];
            }
            result = callback.apply(elem, args || []);
            // Revert to old
            for (name in props) {
                elem.style[name] = old[name];
            }
            return result;
        }
    };
    /*-------------------------------------------------------------------------------------
     
     GLOBAL ROUTER / INITIALIZER
     
     After the page is loaded, it needs to be scanned for attributes and
     controller to initialize. The router will be initialized on the
     document scope and can be reused to intialize on element scope
     to activate injected content.
     
     NOTE:
     
     For initializing local content within the scope of a controller, the
     digest can be used. When larger content is exchanged, teh router must
     be used to also reinitialize the page.
     
     -------------------------------------------------------------------------------------*/
    /***********************************************************************************************************************************************************
     * ...................... SILLYCAT LOGIC / ENGINE AND METHODS ........................
     *
     * The $ function is injected into the controller and directives as the third parameter. The $ has no reference to jQuery !!!!
     *
     *
     **********************************************************************************************************************************************************/
    $ = (function () {
        function doCSS(prop, val) {
            if (typeof (prop) === 'string') {
                this.each(function (node) {
                    node.style[prop] = val;
                });
            }
            if (typeof (prop) === 'object') {
                this.each(function (node) {
                    Object.keys(prop)
                            .forEach(function (property) {
                                node.style[property] = prop[property];
                            });
                });
            }
            return this;
        }
        //
        function doAttr(prop, val) {
            if (typeof (prop) === 'string') {
                this.each(function (node) {
                    node[prop] = val;
                });
            }

            if (typeof (prop) === 'object') {
                this.each(function (node) {
                    Object.keys(prop)
                            .forEach(function (property) {
                                node[property] = prop[property];
                            });
                });
            }
            return this;
        }
        //
        function findClosestParent(val) {
            var isSet = Boolean(val);
            if (isSet) {
                var replace = [];
                this.each(function (node) {
                    function find_matching(element) {
                        if (element.matches(val)) {
                            replace.push(element);
                        } else {
                            find_matching(element.parentElement);
                        }
                    }
                    find_matching(node);
                });
                this.nodeList = replace;
                this.selector = replace[0];
                return this;
            } else {
                return this;
            }
        }

        function findNearestChild(val) {
            var isSet = Boolean(val);
            if (isSet) {
                var replace = [];
                this.each(function (node) {
                    function find_matching(element) {
                        if (element === null) {
                            return undefined;
                        }
                        if (element.matches(val)) {
                            replace.push(element);
                        } else {
                            find_matching(element.firstElementChild);
                        }
                    }
                    find_matching(node);
                });
                this.nodeList = replace;
                this.selector = replace[0];
                setNativeCss(this.selector);
                return this;
            } else {
                return this;
            }
        }
        //
        function doHTML(val) {
            var isSet = Boolean(val);
            if (isSet) {
                this.each(function (item) {
                    item.innerHTML = val;
                });
                return this;
            } else {
                return this.nodes[0].innerHTML;
            }
        }
        //
        function doVal(val) {
            var isSet = Boolean(val);
            if (isSet) {
                this.each(function (item) {
                    item.value = val;
                });
                return this;
            } else {
                return this.nodes[0].innerHTML;
            }
        }
        //
        function actionClick(val) {

            this.each(function (item) {
                item.click();
            });
            return this;
        }
        //
        function toggleClass(val) {
            this.each(function (item) {
                item.classList.toggle(val);
            });
            return this;
        }

        function removeClass(val) {
            this.each(function (item) {
                item.classList.remove(val);
            });
            return this;
        }

        function addClass(val) {
            this.each(function (item) {
                item.classList.add(val);
            });
            return this;
        }

        function getShapeProperties() {
            var boundRect = this.nodeList[0].getBoundingClientRect();
            boundRect.x = boundRect.x ? boundRect.x : boundRect.left;
            boundRect.y = boundRect.y ? boundRect.y : boundRect.top;
            return boundRect;
        }

        function removeNode() {
            var elem = this.selector;
            return elem.parentNode.removeChild(elem);
        }
        /**
         *
         * @param {String} selector
         * @param {type} ctx
         * @returns {object}
         *
         * Storing of specific CSS properties for animation purpose.
         *
         */
        function setNativeCss(selector, ctx) {
            let styles;
            var elements = getNodeList(selector, ctx);
            [].forEach.call(elements, function (node) {
                let orgStyles = window.getComputedStyle(node, null);
                styles = {};
                _private.styleControl.forEach(function (item) {
                    styles[item] = orgStyles[item];
                });
                node.storedStyles = styles;
            });
            return styles;
        }

        function hideElement(val) {
            this.each(function (node) {
                if (node.storedStyles.display === 'none') {
                    node.style.display = node.storedStyles.display;
                } else {
                    node.style.display = 'none';
                }
            });
            return this;
        }

        function showElement(val) {
            this.each(function (node) {
                if (node.storedStyles.display === 'none') {
                    node.style.display = 'block';
                } else {
                    node.style.display = node.storedStyles.display;
                }
            });
        }

        function getNodeList(selector, ctx) {
            var context = ctx || document;
            var pattern = new RegExp(/^(#?[\w-]+|\.[\w-.]+)$/);
            var nodelist;
            if (typeof selector === 'object') {
                return [selector];
            }
            if (typeof selector === 'string') {
                if (pattern.test(selector)) {
                    switch (selector.charAt(0)) {
                        case '#':
                        {
                            nodelist = [document.getElementById(selector.substr(1))];
                            break;
                        }
                        case '.':
                        {
                            nodelist = context.getElementsByClassName(selector.substr(1));
                            break;
                        }
                        default:
                            nodelist = context.getElementsByTagName(selector);
                    }
                }
                return [].slice.call(nodelist);
            }
        }

        function getFirstElement(selector, ctx) {
            if (selector) {
                var elements = getNodeList(selector, ctx);
                return elements[0];
            }
        }

        function getLastElement(selector, ctx) {
            if (selector) {
                var elements = getNodeList(selector, ctx);
                return elements[elements.length - 1];
            }
        }

        function nodeIndex(val) {
            return this.nodeList[val];
        }

        function getController(selector, ctx) {
            var elements = getNodeList(selector, ctx);
            var contr = elements[0].closest('[' + config.prefix + '-controller]');
            if (contr && contr.dataset) {
                return contr.dataset.controller;
            } else {
                return null;
            }
        }
        //
        // chaining of methods
        return function (selector, context) {
            let ctx = context || window.document;
            return {
                selector: selector,
                nodeList: getNodeList(selector, ctx),
                firstElement: getFirstElement(selector, ctx),
                element: getFirstElement(selector, ctx),
                lastElement: getLastElement(selector, ctx),
                controller: getController(selector, ctx),
                nativeCSS: setNativeCss(selector, ctx),
                each: function (action) {
                    [].forEach.call(this.nodeList, function (item, i) {
                        action(item, i);
                    });
                    return this;
                },
                length: function (val) {
                    return this.nodeList.length;
                },
                toString: function () {
                    return selector;
                },
                getCSSProperties: function (prop, val) {
                    return getCSSProperties.call(this, prop, val);
                },
                css: function (prop, val) {
                    return doCSS.call(this, prop, val);
                },

                attr: function (prop, val) {
                    return doAttr.call(this, prop, val);
                },
                html: function (val) {
                    return doHTML.call(this, val);
                },
                hide: function (val) {
                    return hideElement.call(this, val);
                },
                show: function (val) {
                    return showElement.call(this, val);
                },
                val: function (val) {
                    return doVal.call(this, val);
                },
                closest: function (val) {
                    return findClosestParent.call(this, val);
                },
                find: function (val) {
                    return findNearestChild.call(this, val);
                },
                toggleClass: function (val) {
                    return toggleClass.call(this, val);
                },
                addClass: function (val) {
                    return addClass.call(this, val);
                },
                removeClass: function (val) {
                    return removeClass.call(this, val);
                },
                item: function (val) {
                    return nodeIndex.call(this, val);
                },
                removeNode: function () {
                    return removeNode.call(this);
                },
                rect: function () {
                    return getShapeProperties.call(this);
                },
                click: function () {
                    return actionClick.call(this);
                },

                // Router is taking care of initializing the element that is in
                // scope
                router: function (element) { // controller router
                    var scope = element || window.document;
                    _private.router(scope);
                }
            };
        };
    }());
    /***********************************************************************************************************************************************************
     * .............................. SILLYCAT METHODS ...................................
     *
     * The $ function is extended with methods that have no reference to html element
     *
     *
     **********************************************************************************************************************************************************/
    /**
     *
     * @param {string} browser
     * @returns {Boolean}
     */
    $.browser = function (browser) {
        var isbrowser = new RegExp(browser);
        if (isbrowser.test(navigator.userAgent)) {
            return true;
        }
    };
    /**
     *
     * @param {object}  dest
     * @param {object} source
     * @return {object}
     */
    $.extend = function (dest, source) {
        Object.keys(source)
                .forEach(property => {
                    if (source[property] && source[property].constructor && source[property].constructor.name === 'Object') {
                        dest[property] = dest[property] || {};
                        $.extend(dest[property], source[property]);
                    } else {
                        dest[property] = source[property];
                    }
                });
        return dest;
    };
    // AJAX XHR FUNCTIONALITY
    $.get = function (obj) {
        let xhr = {
            method: 'get',
            dataType: 'text'
        };
        if (typeof obj === 'object') {
            $.extend(xhr, obj);
        }
        if (typeof obj === 'string') {
            $.extend(xhr, {
                url: obj
            });
        }

        var promise = _private.xhrcall(xhr);
        promise.catch(function (error) {
            console.log(error);
        });
        return promise;

//        var promise = new Promise(function (resolve, reject) {
//            resolve(_private.xhrcall(xhr));
//            reject(new Error('fail'))
//                    .then(function (error) {
//                        console.log(error);
//                    });
//        });
//        return promise;
    };
    $.post = function (obj, data) {

        let xhr = {
            method: 'post',
            dataType: 'text'
        };
        if (typeof obj === 'object') {
            $.extend(xhr, obj);
        }
        if (typeof obj === 'string') {
            $.extend(xhr, {
                url: obj,
                data: data
            });
        }

        var promise = _private.xhrcall(xhr);
        promise.catch(function (error) {
            console.log(error);
        });
        return promise;
    };
    // PUSHSTATE BROWSER HISTORY
    $.pushState = function (_popstate, path) {
        var i;
        path = path || window.location.pathname;
        if (_popstate.view === undefined) {
            _popstate.view = {};
            _private.oViewbind.forEach(function (view) {
                var current = document.querySelectorAll('[' + view + ']');
                var attr, length = current.length;
                for (i = 0; i < length; i += 1) {
                    attr = current[i].getAttribute(view);
                    _popstate.view[attr] = current[i].innerHTML;
                }
            });
        }
        _private.oPrivate.reset();
        history.pushState(_popstate, null, path);
    };
    // Data object for communication with back-end
    $.getFormData = function (form) {
        var formData = new FormData(form);
        Object.keys(_formdata)
                .forEach(function (property) {
                    formData.append(property, JSON.stringify(_formdata[property])
                            .replace(/"/g, ''));
                });
        return formData;
    };
    $.resetFormData = function () {
        for (var name in _formdata) {
            delete _formdata[name];
        }
    };
    // Feed an element to the cat. Activate a specific controller
    $.digest = function (elem, ctrl) {
        _private.digest(elem, ctrl);
    };
    $.append = function (elem, ctrl) {
        _private.append(elem, ctrl);
    };
    $.prepend = function (elem, ctrl) {
        _private.prepend(elem, ctrl);
    };
    $.getAutoDimensions = function (elem, options) {
        var options = {
            width: 'auto',
            height: 'auto'
        };
        var callback = function () {
            return this.offsetHeight;
        };
        return _private.getCssProperties(elem, options, callback);
        // });
    };
    $.delay = function (time, fn) {
        new Promise(function (resolve) {
            setTimeout(function () {
                if (typeof fn === 'function') {
                    fn();
                }
                resolve(true);
            }, time);
        });
    };


    // format date with "mm-dd-yyy" or other chronological combinations
    $.dateformat = function ($elem, str) {
        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
            'Thursday', 'Friday', 'Saturday'];
        var months = ['January', 'February', 'March', 'April', 'May',
            'June', 'July', 'August', 'September', 'October',
            'November', 'December'];

        var subset = str.split(/[^A-Za-z]/), datestring = $elem.value, date = new Date(
                datestring), day, month, year, dayname, monthname;

        subset.map(function (arg) {
            if (arg.indexOf("y") !== -1) {
                if (arg.length < 4) {
                    year = date.getFullYear().toString().substring(2);
                } else {
                    year = date.getFullYear();
                }
            }
            if (arg.indexOf("m") !== -1) {
                month = date.getMonth() + 1;
            }
            if (arg.indexOf("M") !== -1) {
                monthname = months[date.getMonth()];
            }
            if (arg.indexOf("D") !== -1) {
                dayname = days[date.getDay()];
            }
            if (arg.indexOf("d") !== -1) {
                day = date.getDate();
            }
        });

        $elem.value = str.replace(/(m+)/, month).replace(/(d+)/, day)
                .replace(/(y+)/, year).replace(/(D+)/, dayname).replace(
                /(M+)/, monthname);
        // @formatter:on
    };

    /****************************************************************************
     * ................................ DEFINE SILLYCAT ........................
     *
     * The SillyCat farame work is first initialized with assigning all the
     * controllers, directives and services. After pageload the controller,
     * dircetives and  services are initialized. If a controller is found
     * within the page it is initialized, the rest is dorment.
     *
     *
     ***************************************************************************/
    function define_SillyCat() {
        var SillyCat = function () {
            // extend the sillycat object with services
            this.service = function (service, fn) {
                _private.extend.apply($, [service, fn]);
                return;
            };
            // public method controller
            this.controller = function (cntrl_name, fn) {
                // ........... START FINDING CONTROLLERS IN THE DOCUMENT
                if (typeof fn === 'function') {
                    _controller[cntrl_name] = Object.create(_bind);
                    _controller[cntrl_name].ignite = fn;
                }
                // add services to the scope of this controller
                if (typeof fn === 'object') {
                    var func = fn.pop();
                    _controller[cntrl_name] = Object.create(_bind);
                    fn.map(function (service) {
                        _controller[cntrl_name][service] = _services[service];
                    });
                    _controller[cntrl_name].ignite = func;
                }
            };
            // register directives
            this.directive = function (directive, fn) {
                if (typeof fn === 'function') {
                    _directive[directive] = fn;
                }
            };
            return this;
        };
        return SillyCat;
    }
    // ***
    if (typeof (SillyCat) === 'undefined') {
        window.SillyCat = define_SillyCat();
        window.$formdata = _formdata;
        window.$global = _global;
        window.$controller = _controller;
        window.$directive = _directive;
        window.$service = _services;
        window.$view = _view;
        window.Silly = new SillyCat();
        window.addEventListener('load', function (event) {
            $.digest(window.document);
        });
    } else {
        console.log('SillyCat already defined.');
    }
})(window);