(function (UI) {
    "use strict";

    var names_border = ['borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'],
        names_padding = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
        names_dir = ['top', 'right', 'bottom', 'left'],

        r_char_amp = /&/g,
        r_char_gt = />/g,
        r_char_lt = /</g,
        r_char_quot = /"/g,
        r_char_apos = /'/g,
        r_char_space = / /g,
        r_str_amp = /&amp;/g,
        r_str_gt = /&gt;/g,
        r_str_lt = /&lt;/g,
        r_str_quot = /&quot;/g,
        r_str_apos = /&#39;/g,
        r_str_space = /&nbsp;/g,
        r_tagName = /^<([\w:]+)/,
        r_multiDash = /[A-Z]/g,
        r_dashAlpha = /-([\da-z])/gi,

        r_number_whole = /^\d+$/,
        r_number = /\d+/g,
        r_colorchar = /[^#]/g,
        r_color6 = /^#(\d|[a-f]|[A-F]){6}$/,
        r_color3 = /^#(\d|[a-f]|[A-F]){3}$/,
        r_str_rgb = /rgb/,

        r_query = /([\*a-zA-Z1-6]*)?(\[(\w+)\s*(\^|\$|\*|\||~|!)?=?\s*([\w\u00C0-\uFFFF\s\-_\.]+)?\])?/,
        r_param = /[?&](\w+)=([^&]+)/g,

        wrapMap = {
            option: [1, '<select multiple="multiple">', '</select>'],
            legend: [1, '<fieldset>', '</fieldset>'],
            area: [1, '<map>', '</map>'],
            param: [1, '<object>', '</object>'],
            thead: [1, '<table>', '</table>'],
            tr: [2, '<table><tbody>', '</tbody></table>'],
            col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
            td: [3, '<table><tbody><tr>', '</tr></tbody></table>']
        };

    var temp_div = document.createElement('div');
    temp_div.style.cssText += '; position: absolute; left: -99999px; top: -99999px;';

    var elem4toast = null,

        indexof_dir = function (dir) {
            if (UI.isString(dir)) {
                dir = dir.toLowerCase();
                for (var i = 0, name = null, len = names_dir.length; i < len; i++) {
                    name = names_dir[i];
                    if (name === dir || name.charAt(0) === dir) return i;
                }
                return -1;
            } else {
                var idx = parseInt(dir);
                return isNaN(idx) || idx < 0 || idx > 3 ? -1 : idx;
            }
        },
        fcamelCase = function (all, letter) {
            return letter.toUpperCase();
        },
        getCurrentStyle = window.getComputedStyle ? function (node, stlname) {
            var stl = UI.getWindow(node).getComputedStyle(node, '');
            if (stl) {
                return stl.getPropertyValue(stlname.replace(r_multiDash, '-$&').toLowerCase());
            }
        } : function (node, stlname) {
            var stl = node.currentStyle;
            if (stl) return stl[stlname.replace(r_dashAlpha, fcamelCase)];
        },
        findByAttr = function (node, name, value) {
            var attr = node[name] || node.getAttribute(name);
            return attr && (!value || UI.isRegExp(value) ? value.test(attr) : value === attr) ? true : null;
        },
        getDocument = function (node) {
            return node ? (node.nodeType === 9 ? node : node.ownerDocument || node.document) : document;
        },
        encodeHtml = function (html) {
            return html.replace(r_char_amp, '&amp;').replace(r_char_space, '&nbsp;').replace(r_char_gt, '&gt;').replace(r_char_lt, '&lt;').replace(r_char_quot, '&quot;').replace(r_char_apos, '&#39;');
        },
        decodeHtml = function (html) {
            return html.replace(r_str_space, ' ').replace(r_str_gt, '>').replace(r_str_lt, '<').replace(r_str_quot, '"').replace(r_str_apos, "'").replace(r_str_amp, '&');
        },
        _formatHtml = function (seps, html) {
            var sep, osep1, osep2, dsep1, dsep2;
            if (seps.length > 1) {
                sep = seps.shift();
                osep1 = sep[0];
                dsep1 = sep[1];
                osep2 = sep[2];
                dsep2 = sep[3];
                var htmls = html.split(dsep2);
                for (var i = 0, len = htmls.length; i < len; i++) {
                    htmls[i] = _formatHtml(seps.concat(), htmls[i].replace(osep2, dsep2)).replace(osep1, dsep1);
                }
                return htmls.join(dsep2);
            }
            sep = seps[0];
            osep1 = sep[0];
            dsep1 = sep[1];
            osep2 = sep[2];
            dsep2 = sep[3];
            return html.replace(osep2, dsep2).replace(osep1, dsep1);
        },
        _formatHtml2Elem = function (html) {
            if (UI.isString(html)) {
                html = _formatHtml([[/</g, '&lt;', /&lt;/g, '<'], [/>/g, '&gt', /&gt;/g, '>'], [/ /g, '&nbsp;', /&nbsp;/g, ' '], [/&/g, '&amp;', /&amp;/g, '&']], html);
                var ctag = r_tagName.exec(html);
                if (ctag) {
                    var map = wrapMap[ctag[1]];
                    if (map) {
                        temp_div.innerHTML = map[1] + html + map[2];
                        var tmpcnode = temp_div, len = map[0];
                        while (len--) {
                            tmpcnode = tmpcnode.firstChild;
                        }
                        return tmpcnode;
                    }
                }
            } else {
                html = UI.isNumber(html) ? html + '' : '';
            }
            temp_div.innerHTML = html;
            return temp_div;
        },
        formatHtml = function (html) {
            return _formatHtml2Elem(html).innerHTML;
        };

    var g_list_shadows = [], g_idx_shadows = {}, BASE_ZINDEX = 226, g_zindex = BASE_ZINDEX, zindexMap = {}, historyZindex = {},
        _getShadow = function (id, doc, sure) {
            var idx = g_idx_shadows[id];
            if (isNaN(idx) && sure) {
                var elem = doc.body.appendChild(doc.createElement('div'));
                elem.className = 'shadow';
                idx = g_list_shadows.length;
                g_idx_shadows[id] = idx;
                g_list_shadows.push({
                    elem: elem,
                    id: id,
                    index: idx
                });
            }
            return g_list_shadows[idx];
        };

    wrapMap.optgroup = wrapMap.option;
    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.thead;
    wrapMap.th = wrapMap.td;
    /** 检查浏览器类型 */
    var userAgent = window.navigator.userAgent,
        isie = /MSIE/g.test(userAgent),
        ieVersion = Number.MAX_VALUE,
        isFirefox = /Firefox/g.test(userAgent),
        isChrome = /Chrome/g.test(userAgent);

    var _doRemoveNode, _doClearNode;
    if (isie) {
        ieVersion = isie && (function (doc) {
            var v = 3, div = doc.createElement('div'), all = div.getElementsByTagName('i');
            while (div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->', all[0]) {
            }
            return v > 4 ? v : Number.MAX_VALUE;
        })(document);

        _doRemoveNode = function (node) {
            if (node && node.tagName !== 'BODY') {
                var tmp = UI.getDocument(node).createElement('div');
                tmp.appendChild(node);
                tmp.innerHTML = '';
            }
        };
        _doClearNode = function (node) {
            if (!node) return;
            var tmp = getDocument(node).createElement('div');
            var cnode = node.firstChild, tmpnode = null;
            while (cnode) {
                cnode = (tmpnode = cnode).nextSibling;
                tmp.appendChild(tmpnode);
            }
            tmp.innerHTML = '';
        };
    } else {
        _doRemoveNode = function (node) {
            if (node && node.tagName !== 'BODY') {
                var pnode = node.parentNode;
                if (pnode) pnode.removeChild(node);
            }
        };
        _doClearNode = function (node) {
            if (!node) return;
            var cnode = node.firstChild, tmpnode = null;
            while (cnode) {
                cnode = (tmpnode = cnode).nextSibling;
                node.removeChild(tmpnode);
            }
        };
    }

    UI.extend(UI, {
        isIe: isie,
        ieVersion: ieVersion,
        isFirefox: isFirefox,
        isChrome: isChrome,
		/**
		 * 返回节点|文档所在的Window对象
		 * @param node
		 * @returns {*|Window}
		 */
        getWindow: function (node) {
            var wnd = null;
            if (node) {
                var doc = node.nodeType === 9 ? node : node.ownerDocument;
                if (doc) wnd = doc.defaultView || doc.parentWindow;
            }
            return wnd || window;
        },
		/**
		 * 返回节点所在的Document对象
		 * @param node
		 * @returns {*|HTMLDocument}
		 */
        getDocument: getDocument,
		/**
		 * 查询DOM
		 * @param search
		 * @param doc
		 * @returns {HTMLElement}
		 */
        query: function (search, doc) {
            if (!search) return;
            var node = doc || document,
                agent = search.match(r_query),
                tag = agent[1] || '*',
                attribute = agent[3],
                type = agent[4] + '=',
                value = agent[5],
                ieAttrFix = { "class": 'className', "for": 'htmlFor' },
                returnElements = [],
                //IE5.5不支持“*”
                elements,
                length;
            if ((!!node.querySelectorAll) && type != '!=') {
                elements = node.querySelectorAll(search);
                length = elements.length;
                for (var i = 0; i < length; i++) {
                    returnElements.push(elements[i]);
                }
                return arguments[2] === true || returnElements.length <= 1 ? returnElements[0] : returnElements;
            }
            elements = (tag === '*' && node.all) ? node.all : node.getElementsByTagName(tag);
            length = elements.length;
            if (isie)
                attribute = ieAttrFix[attribute] ? ieAttrFix[attribute] : attribute;
            while (--length >= 0) {
                var current = elements[length],
                    _value = isie ? current[attribute] : current.getAttribute(attribute);
                if (typeof _value === 'string' && _value.length > 0) {
                    if (!!value) {
                        var condition =
                            type === '=' ?//完全等于
                                _value === value :
                                type === '!=' ?//不等于
                                    _value != value :
                                    type === '*=' ?//包含
                                        _value.indexOf(value) >= 0 :
                                        type === '~=' ?//匹配当中的某个单词，如<span class='red bold'>警告</span>
                                            (' ' + _value + ' ').indexOf(value) >= 0 :
                                            type === '^=' ?//以XX开头
                                                _value.indexOf(value) === 0 :
                                                type === '$=' ?//以XX结尾
                                                    _value.slice(-value.length) === value :
                                                    type === '|=' ?//匹配属性值为XX或以XX-打头的元素
                                                        _value === value || _value.substring(0, value.length + 1) === value + '-' :
                                                        false;
                        if (condition) returnElements.push(current);
                    } else {
                        returnElements.push(current);
                    }
                }
            }
            return arguments[2] === true || returnElements.length <= 1 ? returnElements[0] : returnElements;
        },
        getBasePath: function (wnd) {
            var pathname = UI.isString(wnd) ? UI.endWith(wnd, '/', false) : (wnd && wnd.location ? wnd : window).location.pathname,
                idx = pathname.indexOf('/'), rel = [];
            while ((idx = pathname.indexOf('/', idx + 1)) !== -1) {
                rel.push('../');
            }
            return rel.join('');
        },
        getSearch: function (name, url) {
            url = url || window.location.href;
            r_param.lastIndex = 0;
            if (name && UI.isString(name)) {
                var param = new RegExp('[?&](?:' + name + ')=([^&]+)').exec(url);
                return param ? decodeURIComponent(param[1]) : '';
            } else {
                var params = {}, search = null;
                while (!!(search = r_param.exec(url))) {
                    params[search[1]] = decodeURIComponent(search[2]);
                }
                return params;
            }
        },
        formatSearch: function (param) {
            if (!param) return null;
            if (UI.isString(param)) return param;
            var rt = [];
            for (var i in param) {
                if (param.hasOwnProperty(i)) {
                    rt.push(i + '=' + encodeURIComponent(param[i]));
                }
            }
            return rt.join('&');
        },
		/**
		 * 执行节点鼠标事件 type可以传click,mousedown等
		 * @param node
		 * @param type
		 */
        trigger: function (node, type) {
            try {
                if (node[type]) {
                    node[type]();
                } else {
                    var doc = UI.getDocument(node), wnd = UI.getWindow(doc);
                    var evobj = doc.createEvent('MouseEvents');
                    evobj.initMouseEvent(type, true, true, wnd);
                    node.dispatchEvent(evobj);
                }
            } catch (e) {
                UI.error(e);
            }
        },
        encodeHtml: encodeHtml,
        decodeHtml: decodeHtml,
        formatHtml: formatHtml,
		/**
		 * 给指定节点添加样式名
		 * @param node 节点
		 * @param className 要添加的样式名，多个以' '分隔
		 */
        addClass: function (node, className) {
            if (!node || node.nodeType !== 1 || !className || !UI.isString(className)) return;
            var clsNames = node.className, i, len;
            if (UI.isString(className)) {
                if (!clsNames) {
                    node.className = className;
                } else if (className.indexOf(' ') === -1) {
                    if (UI.indexOf(clsNames.split(' '), className) !== -1) return;
                    node.className = clsNames + ' ' + className;
                } else {
                    var classNames = className.split(' ');
                    clsNames = clsNames.split(' ');
                    for (i = 0, len = classNames.length; i < len; i++) {
                        className = classNames[i];
                        if (className && clsNames.indexOf(className) === -1) clsNames.push(className);
                    }
                    node.className = clsNames.join(' ');
                }
            } else if (UI.isArray(className)) {
                for (i = 0, len = className.length; i < len; i++) {
                    UI.addClass(node, className[i]);
                }
            }
        },
		/**
		 * 给指定节点移除指定样式名，如果没有该样式名，直接忽略
		 * @param node 节点
		 * @param className 要移除的样式名，多个以' '分隔
		 */
        removeClass: function (node, className) {
            if (!node || node.nodeType !== 1 || !className) return false;
            var clsNames = node.className;
            if (!clsNames) return false;
            var i, len;
            if (UI.isString(className)) {
                clsNames = clsNames.split(' ');
                if (className.indexOf(' ') === -1) {
                    var index = UI.indexOf(clsNames, className);
                    if (index === -1) return false;
                    clsNames.splice(index, 1);
                } else {
                    var classNames = className.split(' ');
                    for (i = 0, len = classNames.length; i < len; i++) {
                        var idx = UI.indexOf(clsNames, classNames[i]);
                        if (idx !== -1) clsNames.splice(idx, 1);
                    }
                }
                node.className = clsNames.join(' ');
            } else if (UI.isArray(className)) {
                for (i = 0, len = className.length; i < len; i++) {
                    UI.removeClass(node, className[i]);
                }
            }
        },
		/**
		 * 给指定节点切换样式名，有指定的样式名则会删除该样式名，没有则会添加该样式名
		 * @param node 节点
		 * @param className 要切换的样式名，多个以' '分隔，如果分隔的样式名中有重复的，重复数为奇数则按一次处理，为偶数次则无任何效果
		 */
        toggleClass: function (node, className) {
            if (!node || node.nodeType !== 1 || !className) return false;
            if (UI.isString(className)) {
                var toggleClsNames = className.split(' '), classNames = (node.className || '').split(' '), idx = -1;
                for (var i = 0, len = toggleClsNames.length; i < len; i++) {
                    if (!(className = toggleClsNames[i])) continue;
                    if ((idx = UI.indexOf(classNames, className)) === -1) {
                        classNames.push(className);
                    } else {
                        classNames.splice(idx, 1);
                    }
                }
                node.className = classNames.join(' ');
            } else if (UI.isArray(className)) {
                UI.each(className, {
                    handler: UI.toggleClass,
                    params: { 0: node }
                });
            }
        },
		/**
		 * 判断指定节点是否有指定样式名
		 * @param node 节点
		 * @param className 样式名，不允许以' '分隔
		 * @returns {boolean}
		 */
        hasClass: function (node, className) {
            if (!node || node.nodeType !== 1 || !className) return;
            if (UI.isString(className) && className.indexOf(' ') === -1) {
                var clsNames = node.className;
                if (!clsNames) return false;
                return UI.indexOf(clsNames.split(' '), className) !== -1;
            }
        },
		/**
		 * 给指定节点替换样式名
		 * @param {Object} node
		 * @param {Object} newClassName 要新增的样式名，不支持空格分隔的多个
		 * @param {Object} oldClassName 要去掉的样式名，不支持空格分隔的多个
		 */
        replaceClass: function (node, newClassName, oldClassName) {
            if (!node || node.nodeType !== 1 || newClassName === oldClassName) return false;
            var classNames = (node.className || '').split(' ');
            if (oldClassName && UI.isString(oldClassName) && oldClassName.indexOf(' ') === -1) {
                var idx = UI.indexOf(classNames, oldClassName);
                if (idx !== -1) classNames.splice(idx, 1);
            }
            if (newClassName && UI.isString(newClassName) &&
                newClassName.indexOf(' ') === -1 &&
                UI.indexOf(classNames, newClassName) === -1) {
                classNames.push(newClassName);
            }
            node.className = classNames.join(' ');
        },
		/**
		 * 设置|获取节点样式
		 * @param node
		 * @param css
		 *  样式名: 返回样式值
		 *  样式字符串/JSON样式键值对: 设置样式值
		 */
        css: function (node, css) {
            if (!node || node.nodeType !== 1 || !css) return;
            if (UI.isString(css)) {
                if (css.indexOf(':') === -1) {
                    if (arguments[2] !== true) {//取样式
                        return getCurrentStyle(node, css);
                    } else {//添加className
                        UI.addClass(node, css);
                    }
                } else {
                    node.style.cssText += UI.startWith(UI.endWith(css.trim(), ';', true), ';', true);
                }
            } else if (UI.isObject(css)) {
                var csstext = [';'], clearcss = [], value = null;
                for (var _key in css) {
                    if (css.hasOwnProperty(_key)) {
                        if ((value = css[_key]) && UI.isString(value)) {
                            csstext.push(_key, ':', value, ';');
                        } else {
                            clearcss.push(_key);
                        }
                    }
                }
                var cssText = node.style.cssText;
                if (clearcss.length) cssText = cssText.replace(UI.parseReg(clearcss), '');
                node.style.cssText = cssText + csstext.join('');
            }
        },
        icon: function (node, icon, prop) {
            if (!node) return;
            if (arguments.length === 2) {
                if (UI.isString(icon)) {
                    if (icon.indexOf('.') === -1) {
                        UI.addClass(node, icon);
                    } else {
                        node.style.backgroundImage = 'url(' + icon + ')';
                    }
                }
            } else if (prop && prop.icon !== (icon = icon || false)) {
                var nameCls = arguments[3] || 'iconCls', nameUrl = arguments[4] || 'iconUrl';
                if (UI.isString(icon)) {
                    node.style.display = '';
                    var cls = prop[nameCls];
                    if (icon.indexOf('.') === -1) {
                        if (cls) {
                            if (cls === icon) return;
                        } else {
                            node.style.backgroundImage = '';
                            prop[nameUrl] = false;
                        }
                        UI.replaceClass(node, prop[nameCls] = icon, cls);
                    } else {
                        if (cls) {
                            UI.removeClass(node, cls);
                            prop[nameCls] = false;
                        } else {
                            if (prop[nameUrl] === icon) return;
                        }
                        node.style.backgroundImage = 'url(' + (prop[nameUrl] = icon) + ')';
                    }
                    prop.icon = icon;
                } else {
                    if (arguments[5] !== false) {
                        node.style.display = 'none';
                    } else {
                        if (prop[nameCls]) {
                            UI.removeClass(node, prop.icon);
                            prop[nameCls] = false;
                        } else if (prop[nameUrl]) {
                            node.style.backgroundImage = '';
                            prop[nameUrl] = false;
                        }
                    }
                    prop.icon = false;
                }
                return prop;
            }
        },
        title: function (elem, text, count) {
            if (!elem || !text) return;
            count = parseInt(count) || 0;
            if (count > 1 && text.length > count) {
                elem.title = text;
                text = text.substring(0, count - 1) + '...';
            } else {
                elem.removeAttribute('title');
            }
            UI.clearNode(elem);
            elem.appendChild(UI.getDocument(elem).createTextNode(text));
        },
		/**
		 * Add a stylesheet rule to the document (may be better practice, however,
		 * to dynamically change classes, so style information can be kept in
		 * genuine stylesheets (and avoid adding extra elements to the DOM))
		 * Note that an array is needed for declarations and rules since ECMAScript does
		 * not afford a predictable object iteration order and since CSS is
		 * order-dependent (i.e., it is cascading); those without need of
		 * cascading rules could build a more accessor-friendly object-based API.
		 * @param {Array} rules Accepts an array of JSON-encoded declarations
		 * @param doc Document
		 * @example
		 addStylesheetRules([
			['h2', // Also accepts a second argument as an array of arrays instead
				['color', 'red'],
				['background-color', 'green', true] // 'true' for !important rules
			],
			['.myClass',
				['background-color', 'yellow']
			]
		 ]);
		 */
        addStylesheetRules: function (rules, doc) {
            doc = doc || document;
            var styleEl = doc.getElementById('_rule_style_');

            if (!styleEl) {
                styleEl = doc.createElement('style');
                // Append style element to head
                doc.head.appendChild(styleEl);
                styleEl.id = '_rule_style_';
            }

            // Grab style sheet
            var styleSheet = styleEl.sheet;

            for (var i = 0, rl = rules.length; i < rl; i++) {
                var j = 1, rule = rules[i], selector = rule[0], propStr = '';
                // If the second argument of a rule is an array of arrays, correct our variables.
                if (Object.prototype.toString.call(rule[1][0]) === '[object Array]') {
                    rule = rule[1];
                    j = 0;
                }

                for (var pl = rule.length; j < pl; j++) {
                    var prop = rule[j];
                    propStr += prop[0] + ':' + prop[1] + (prop[2] ? ' !important' : '') + ';\n';
                }

                // Insert CSS Rule
                styleSheet.insertRule(selector + '{' + propStr + '}', styleSheet.cssRules.length);
            }
        },
		/**
		 * (取消)禁止选中文本
		 * @param node
		 * @param disabled
		 * @returns {boolean}
		 */
        disableTextSelect: function (node, disabled) {
            node = node || document.body;
            if ((node.getAttribute("unselectable") === 'on') === (disabled = (disabled !== false))) return false;
            if (disabled) {
                node.setAttribute("unselectable", 'on');
                node.style.cssText += '; -moz-user-select: -moz-none; -webkit-user-select: none; -ms-user-select: none; user-select: none;';
            } else {
                node.removeAttribute("unselectable");
                node.style.cssText = node.style.cssText.replace(/;? *(?:-[^-]+-)?user-select:[^;]+/g, '');
            }
        },
		/**
		 * 设置|获取节点里的html内容
		 * @param node
		 * @param html
		 * @returns {*}
		 */
        html: function (node, html) {
            if (!node || node.nodeType !== 1) return false;
            if (arguments.length === 1) {
                return node.innerHTML;
            }
            if (arguments[2] !== false) UI.clearNode(node);
            var elem = _formatHtml2Elem(html).firstChild, rtElem;
            while (elem) {
                elem = (rtElem = elem).nextSibling;
                node.appendChild(rtElem);
            }
        },
		/**
		 * 设置|获取节点里的文本内容
		 * @param node
		 * @param text
		 * @returns {string}
		 */
        text: function (node, text) {
            if (!node) return '';
            if (UI.isString(text)) {
                if (arguments[2] !== false) UI.clearNode(node);
                node.appendChild(UI.getDocument(node).createTextNode(text));
            } else {
                switch (node.nodeType) {
                    case 3:
                    case 4:
                    case 8:
                        return node.nodeValue;
                    case 1:
                    case 9:
                    case 11:
                        var textContent = node.textContent;
                        if (UI.isString(textContent)) return textContent;
                        var rt = [], cnode = node.firstChild;
                        while (cnode) {
                            rt.push(UI.text.call(this, cnode));
                        }
                        return rt.join('');
                }
            }
        },
		/**
		 * 判断节点是否是另一节点的祖先节点
		 * @param pnode
		 * @param cnode
		 * @param same 是否允许是相同节点
		 * @return Boolean
		 */
        isAncestor: document.body.contains ? function (pnode, cnode, same) {
            if (!pnode || !cnode) return false;
            return pnode.contains(cnode) && (same === true || pnode !== cnode);
        } : document.compareDocumentPosition ? function (pnode, cnode, same) {
            if (!pnode || !cnode) return false;
            var tag = pnode.compareDocumentPosition(cnode);
            return tag === 16 || (same === true && tag === 0);
        } : function (pnode, cnode, same) {
            if (!pnode || !cnode) return false;
            if (pnode === cnode) return !!same;
            do {
                cnode = cnode.parentNode;
                if (cnode === pnode) return true;
            } while (cnode);
            return false;
        },
		/**
		 * 删除节点
		 * @param node
		 */
        removeNode: function (node) {
            if (node && node.length) {
                for (var i = 0, len = node.length; i < len; i++) {
                    _doRemoveNode(node[i]);
                }
            } else {
                _doRemoveNode(node);
            }
        },
		/**
		 * 清除子节点
		 * @param node
		 */
        clearNode: function (node) {
            if (node && node.length) {
                for (var i = 0, len = node.length; i < len; i++) {
                    _doClearNode(node[i]);
                }
            } else {
                _doClearNode(node);
            }
        },
		/**
		 * 遍历子节点执行回调
		 * @param node
		 * @param callback 回调方法，也可以直接传属性名和属性值(支持正则)组成的数组，返回true则阻止后面的节点继续调用该方法
		 * @param rec 是否递归
		 * @return {Node} 返回符合终止条件的第一个节点
		 */
        browseChild: function (node, callback, rec) {
            if (!node) return;
            if (UI.isArray(callback)) {
                callback = {
                    handler: findByAttr,
                    args: callback
                };
            }
            node = node.firstChild;
            while (node) {
                var rt = UI.call(callback, null, node);
                if (rt === false) return false;
                if (rt === true) return node;
                if (rec) {
                    var cnode = UI.browseChild(node, callback, rec);
                    if (cnode || cnode === false) return cnode;
                }
                node = node.nextSibling;
            }
        },
		/**
		 * 查找符合条件的父节点，会从该节点本身开始查找
		 * @param node 节点
		 * @param callback 回调方法，也可以直接传属性名和属性值(支持正则)组成的数组，返回true则阻止后面的节点继续调用该方法
		 * @returns {Node} 返回第一个符合条件的节点
		 */
        browseParent: function (node, callback) {
            if (UI.isArray(callback)) {
                callback = {
                    handler: findByAttr,
                    args: callback
                };
            }
            while (node && node.nodeType === 1) {
                var rt = UI.call(callback, null, node);
                if (rt === false) break;
                if (rt === true) return node;
                node = node.parentNode;
            }
        },
        firstElement: function (node) {
            return UI.browseChild(node, ['nodeType', 1]) || null;
        },
        lastElement: function (node) {
            if (!node) return null;
            node = node.lastChild;
            return !node || node.nodeType === 1 ? node : UI.prevElement(node);
        },
        nextElement: function (node) {
            if (!node) return null;
            do {
                node = node.nextSibling;
            } while (node && node.nodeType !== 1);
            return node;
        },
        prevElement: function (node) {
            if (!node) return null;
            do {
                node = node.previousSibling;
            } while (node && node.nodeType !== 1);
            return node;
        },
		/**
		 * 获取节点边框大小
		 * @param node
		 * @param dir
		 *  true:返回纵向边框(上边框和下边框)大小加和
		 *  false:返回横向边框大小加和
		 *  0|'top'|'t',1|'right'|'r',2|'bottom'|'b',3|'left'|'l'分别返回上边框，右边框，下边框，左边框的大小
		 * @returns {*}
		 */
        borderSize: function (node, dir) {
            if (!node || node.nodeType !== 1) return -1;
            if (dir === true) {
                return (parseInt(getCurrentStyle(node, names_border[0])) || 0) + (parseInt(getCurrentStyle(node, names_border[2])) || 0);
            } else if (dir === false) {
                return (parseInt(getCurrentStyle(node, names_border[1])) || 0) + (parseInt(getCurrentStyle(node, names_border[3])) || 0);
            } else {
                var idx = indexof_dir(dir);
                return idx === -1 ? -1 : (parseInt(getCurrentStyle(node, names_border[idx])) || 0);
            }
        },
		/**
		 * 获取节点边距大小
		 * @param node
		 * @param dir
		 *  true:返回纵向边距(上边距和下边距)大小加和
		 *  false:返回横向边距大小加和
		 *  0|'top'|'t',1|'right'|'r',2|'bottom'|'b',3|'left'|'l'分别返回上边距，右边距，下边距，左边距的大小
		 * @returns {*}
		 */
        paddingSize: function (node, dir) {
            if (!node || node.nodeType !== 1) return -1;
            if (dir === true) {
                return (parseInt(getCurrentStyle(node, names_padding[0])) || 0) + (parseInt(getCurrentStyle(node, names_padding[2])) || 0);
            } else if (dir === false) {
                return (parseInt(getCurrentStyle(node, names_padding[1])) || 0) + (parseInt(getCurrentStyle(node, names_padding[3])) || 0);
            } else {
                var idx = indexof_dir(dir);
                return idx === -1 ? -1 : (parseInt(getCurrentStyle(node, names_padding[idx])) || 0);
            }
        },
        viewCall: function (node, callback) {
            if (!node || node.nodeType !== 1) return null;
            var displays = [], elems = [], elem = node;
            while (elem) {
                if (UI.css(elem, 'display') === 'none') {
                    displays.push(elem.style.display);
                    elems.push(elem);
                    elem.style.display = 'initial';
                }
                elem = elem.parentNode;
            }
            UI.call(callback, node);
            for (var i = 0, len = displays.length; i < len; i++) {
                elems[i].style.display = displays[i];
            }
        },
        getRect: ieVersion <= 8 ? function (node) {
            var rect = node.getBoundingClientRect(), left = rect.left, top = rect.top, right = rect.right, bottom = rect.bottom;
            return { left: left, top: top, right: right, bottom: bottom, width: right - left, height: bottom - top };
        } : function (node) {
            return node.getBoundingClientRect();
        },
        outerWidth: function (node) {
            return node ? node.offsetWidth : -1;
        },
        outerHeight: function (node) {
            return node ? node.offsetHeight : -1;
        },
        innerWidth: function (node) {
            return node ? node.clientWidth - UI.paddingSize(node, true) : -1;
        },
        innerHeight: function (node) {
            return node ? node.clientHeight - UI.paddingSize(node, false) : -1;
        },
        scrollWidth: function (node) {
            if (!node) return -1;
            var width = null, domstl = node.style,
                ostl = {
                    width: domstl.width,
                    overflowX: domstl.overflowX,
                    paddingLeft: domstl.paddingLeft,
                    paddingRight: domstl.paddingRight
                };
            UI.extend(domstl, {
                width: '0px',
                overflowX: 'auto',
                paddingLeft: '0px',
                paddingRight: '0px'
            });
            if (ieVersion <= 8) {
                var scrollLeft = node.scrollLeft, scrollTop = node.scrollTop;
                domstl.position = 'relative';
                node.scrollLeft = 0;// IE8中由于未知原因导致无法正确获取到scrollWidth
                width = node.scrollWidth;
                domstl.position = 'absolute';
                node.scrollLeft = scrollLeft;
                node.scrollTop = scrollTop;
            } else {
                width = node.scrollWidth;
            }
            UI.extend(domstl, ostl);
            return width + UI.paddingSize(node, false);
        },
        scrollHeight: function (node) {
            if (!node) return -1;
            var height = null, domstl = node.style, width = UI.outerWidth(node) - UI.paddingSize(false),
                ostl = {
                    width: domstl.width,
                    height: domstl.height,
                    overflowY: domstl.overflowY,
                    paddingTop: domstl.paddingTop,
                    paddingBottom: domstl.paddingBottom
                };
            var overflow = UI.css(node, 'overflowY');
            if (overflow !== 'scroll' && overflow !== 'auto') {
                width += UI.scrollSize();
            }
            UI.extend(domstl, {
                width: width + 'px',
                height: '0px',
                overflowY: 'scroll',
                paddingTop: '0px',
                paddingBottom: '0px'
            });
            if (ieVersion <= 8) {
                var scrollLeft = node.scrollLeft, scrollTop = node.scrollTop;
                domstl.position = 'relative';
                node.scrollLeft = 0;// IE8中由于未知原因导致无法正确获取到scrollHeight
                height = node.scrollHeight;
                domstl.position = 'absolute';
                node.scrollLeft = scrollLeft;
                node.scrollTop = scrollTop;
            } else {
                height = node.scrollHeight;
            }
            UI.extend(domstl, ostl);
            return height + UI.paddingSize(node, true);
        },
        scrollSize: function () {
            temp_div.style.cssText = 'position: absolute; left: -999px; top: -999px; width: 100px; height: 10px; overflow: auto';
            temp_div.innerHTML = '<div style="width: 1px; height: 30px"></div>';
            document.body.appendChild(temp_div);
            var size = temp_div.offsetWidth - temp_div.clientWidth;
            temp_div.parentNode.removeChild(temp_div);
            return size;
        },
        getCaret: function (inp, start) {
            if (!inp) return -1;
            if (isNaN(inp.selectionStart)) { // IE Support
                var srng = document.selection.createRange();
                if (inp.tagName.toLocaleLowerCase() === 'textarea') {
                    var rng = srng.duplicate();
                    rng.moveToElementText(inp);
                    var pos = -1;
                    while (rng.inRange(srng)) {
                        rng.moveStart('character');
                        pos++;
                    }
                    return start === true ? pos : start === false ? srng.text.replace(/\r\n/g, '\n').length + pos : [pos, srng.text.replace(/\r\n/g, '\n').length + pos];
                } else {
                    var len = srng.text.length;
                    srng.moveStart('character', -inp.value.length);
                    var count = srng.text.length;
                    return start === true ? count - len : start === false ? count : [count, count + len];
                }
            } else {
                return start === true ? inp.selectionStart : start === false ? inp.selectionEnd : [inp.selectionStart, inp.selectionEnd];
            }
        },
        setCaret: function (inp, start, end) {
            if (!inp || isNaN(start)) return false;
            start = start >>> 0;
            end = isNaN(end) ? start : Math.max(end >>> 0, start);
            if (inp.setSelectionRange) {
                inp.setSelectionRange(start, end);
            } else if (inp.createTextRange) { //IE Support
                var range = inp.createTextRange();
                range.collapse(true);
                range.moveStart('character', start);
                range.moveEnd('character', end - start - 1);
                range.select();
            }
            inp.focus();
        },
		/**
		 * 格式化颜色值
		 * @param color
		 * @param def 格式化的值为空时的取值
		 * @returns {*}
		 */
        formatColor: function _formatColor(color, def) {
            def = def || '';
            if (!color) return def;
            if ('transparent' === color) return color;
            color = color + '';
            if (r_color6.test(color)) {// #FFFFFF
                return color.toUpperCase();
            }
            if (r_color3.test(color)) {// #FFF
                return color.replace(r_colorchar, '$&$&').toUpperCase();
            }
            var rt = '#', v = null, i;
            if (r_str_rgb.test(color)) {// rgb(255, 255, 255)
                var rgb = color.match(r_number);
                if (rgb.length < 3) return def;
                for (i = 0; i < 3; i++) {
                    v = '0' + (parseInt(rgb[i], 10) & 255).toString(16);
                    rt += v.substr(v.length - 2);
                }
                return rt.toUpperCase();
            }
            if (r_number_whole.test(color)) {// 大整数颜色值
                color = parseInt(color, 10);
                for (i = 2; i >= 0; i--) {
                    v = '0' + (color >> (8 * i) & 255).toString(16);
                    rt += v.substr(v.length - 2);
                }
                return rt.toUpperCase();
            }
            // 字符串型颜色值，如：red,white等
            var pnode = document.body;
            pnode.appendChild(temp_div);
            temp_div.style.color = color;
            color = getCurrentStyle(temp_div, 'color');
            UI.removeNode(temp_div);
            return color ? _formatColor(color) : def;
        },
		/**
		 * 提示浮框
		 * @param text 提示内容，可以是字符串或返回字符串的函数对象，如果是数组，则会循环提示数组中的每一项，其他值时直接隐藏
		 * @param icon 'ui-success/ui-fail/ui-warn/ui-load'
		 * @param delay 延迟多久自动隐藏，-1时不自动隐藏（如果text为数组，该项为多久显示下一项）
		 * @param css 提示框的额外样式
		 */
        toast: function (text, icon, delay, css) {
            if (UI.isArray(text)) {
                UI.timeout({
                    handler: UI.toast,
                    args: [{
                        handler: UI.next,
                        context: UI,
                        args: { arr: text }
                    }, icon, -1, css],
                    delay: isNaN(delay) ? 500 : delay,
                    trigger: true,
                    once: false
                });
            } else if (UI.isString(text) || UI.isString(text = UI.call(text))) {
                if (!elem4toast) {
                    elem4toast = document.body.appendChild(document.createElement('div'));
                    elem4toast.className = 'ui-toast';
                    elem4toast.innerHTML = '<div class="ui-content"><i></i><span class="ui-text"></span></div>';
                }
                var content = elem4toast.firstChild;
                content.style.cssText = css || '';
                content.firstChild.className = icon ? 'ui-icon ' + UI.startWith(icon, 'ui-icon-', true) : 'ui-hidden';
                UI.html(content.lastChild, text, true);
                UI.removeClass(elem4toast, 'ui-hidden');
                if (delay !== -1) {
                    UI.timeout({
                        handler: UI.toast,
                        delay: delay,
                        context: UI
                    });
                }
            } else if (elem4toast) {
                UI.addClass(elem4toast, 'ui-hidden');
            }
        },
		/**
		 * 显示/隐藏底层遮罩，用于对话框后面的遮罩，或iframe下面的垫片
		 * @param visible Boolean 显示或隐藏
		 * @param options String/Object 遮罩标识，也可以配置额外相关的信息
		 * 	{
		 * 		id: String,
		 * 		css: String, className/cssText
		 * 		elem: 要垫片的目标元素
		 * 		hide: Boolean, 当visible为false时默认只是还原到该遮罩上一次的显示状态，如果hide为true则直接真正隐藏
		 * 	}
		 */
        shadow: function (visible, options) {
            options = options || {};
            var doc = options.doc || document,
                ids = ((options && !UI.isString(options) ? options.id : options) || '').split('.'),
                id = ids[0], suffix = ids[1] || '';
            var panel = _getShadow(id, doc, (visible = visible !== false)), elem, pelem;
            var zIndex = historyZindex[id], i = -1;
            if (zIndex && panel.visible) {
                for (i = zIndex.length - 1; i >= 0; i--) {
                    var zidx = zIndex[i];
                    if (zidx.suffix === suffix) {
                        UI.downZindex(zidx.zidx);
                        zIndex.splice(i, 1);
                        break;
                    }
                }
            }
            if (visible) {
                elem = panel.elem;
                panel.visible = true;
                elem.style.cssText = '';
                UI.css(elem, options.css, true);
                var shadowElem = options.elem, cssText;
                if (shadowElem && shadowElem.nodeType === 1) {
                    pelem = shadowElem.offsetParent;
                    var rect = UI.getRect(shadowElem), left = rect.left, top = rect.top;
                    if (pelem && pelem !== doc.body) {
                        pelem.appendChild(elem);
                        var prect = UI.getRect(pelem);
                        left = left - prect.left;
                        top = top - prect.top;
                    }
                    cssText += '; position: absolute; left: ' + left + 'px; top: ' + top + 'px; width: ' + rect.width + 'px; height: ' + rect.height + 'px;';
                } else {
                    cssText += '; position: fixed; left:0; top: 0; width: 100%; height: 100%;';
                }
                elem.style.cssText += cssText;
                (zIndex || (historyZindex[id] = [])).push({
                    zidx: UI.upZindex(elem),
                    pelem: pelem,
                    suffix: suffix,
                    css: options.css,
                    cssText: cssText
                });
                return id;
            } else if (panel && panel.visible) {
                elem = panel.elem;
                if (zIndex && zIndex.length) {
                    if (arguments[2] !== true && options.hide !== true) {
                        elem.style.cssText = '';
                        var hz = zIndex[zIndex.length - 1], npelem = hz.pelem || UI.getDocument(elem).body;
                        npelem.appendChild(elem);
                        UI.css(elem, hz.css, true);
                        elem.style.cssText += hz.cssText;
                        elem.style.zIndex = hz.zidx;
                        return;
                    }
                    for (i = zIndex.length - 1; i >= 0; i--) {
                        UI.downZindex(zIndex[i].zidx);
                    }
                    zIndex.length = 0;
                }
                panel.visible = false;
                elem.style.cssText += '; position: absolute; width: 0px; height: 0px; left: -99999px; top: -99999px;';
                pelem = UI.getDocument(elem).body;
                if (elem.parentNode !== pelem) {
                    pelem.appendChild(elem);
                }
            }
        },
        upZindex: function (elem) {
            if (elem && elem.nodeType === 1) {
                elem.style.zIndex = ++g_zindex;
                return g_zindex;
            }
        },
        downZindex: function (elem) {
            var idx = parseInt(elem && elem.nodeType === 1 ? elem.style.zIndex : elem, 10) || 0;
            if (idx === g_zindex) {
                while (zindexMap[--g_zindex]) {
                    delete zindexMap[g_zindex];
                }
            } else if (idx > BASE_ZINDEX) {
                zindexMap[idx] = true;
            }
            return idx;
        }
    });
})(EUI);