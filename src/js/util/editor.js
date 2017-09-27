EUI.define('util.editor', function (UI) {
    'use strict';

    function Editor(elem) {
        elem.style.cssText += '; position: absolute; width: 0; height: 0; left: -99999px; top: -99999px; padding: 0 2px; border: 1px solid #CCC; background: #FFF;';
        this.elem = elem;
    }
    UI.extend(Editor.prototype, {
        value: function (value) {
            if (arguments.length === 0) {
                return this.elem.value;
            } else {
                this.elem.focus();
                this.elem.value = value;
            }
        },
        show: function (value, callback, rect) {
            var left = rect.left, top = rect.top;
            this.elem.style.cssText += '; left: ' + left + 'px; top: ' + top + 'px; width: ' + (rect.right - left) + 'px; height: ' + (rect.bottom - top) + 'px;';
            this.callback = callback;
            this.value(value);
        },
        hide: function () {
            this.elem.style.cssText += '; left: -99999px; top: -99999px;';
            UI.call(this.callback, this, this.value());
            this.callback = null;
        }
    });

    /**
     * 标记其配置对象
     *  key为编辑器类型
     *  value为编辑器配置对象：{
     *      oninit: Function(callback, elem, options, doc), //渲染对象的初始化，只会在值项初始化的时候调用一次，可以有返回值，该返回值会作为render和editor函数的最后一个参数
     *      validator: Function(value), //值的校验函数，返回正确的值
     *      render: Function(value, elem, obj), //设置值，更新值时优先触发的函数，该函数如果已经做了HTML渲染则需返回false，如果返回的是其他值则会作为editor函数的最后一个参数
     *      format: Function(value), //当render未配置或返回值不为false时触发该函数，该函数返回结果(未配置时取value)为最终的渲染HTML字符串
     *      editor: Function(value, callback, elem, obj) //点击值项进入编辑时触发的函数
     *  }
     */
    var g_editors = {
        input: {
            editor: function (value, callback, elem) {
                if (!this.editorObj) {
                    var doc = UI.getDocument(elem);
                    var inp = doc.body.appendChild(UI.call(this.oncreate, this, doc) || doc.createElement('input'));
                    this.editorObj = new Editor(inp);
                    UI.bind(inp, this.events, this.editorObj);
                    this.editorObj.onkeydown = this.onkeydown;
                }
                value = UI.value(UI.call(this.onedit, this, value), value);
                var rect = UI.call(this.onshow, this, value, elem) || UI.getRect(elem);
                this.editorObj.show(value, callback, rect);
                return this.editorObj;
            },
            events: {
                type: 'keydown',
                handler: function (evt) {
                    var editor = evt.data;
                    if (UI.call(editor.onkeydown, this, evt) !== false && evt.keyCode === UI.KEY_ENTER) {
                        editor.hide();
                    }
                }
            }
        },
        textarea: {
            editor: 'input',
            oncreate: function (doc) {
                var textarea = doc.createElement('textarea');
                textarea.style.cssText += '; resize: none;';
                return textarea;
            },
            onkeydown: function (evt) {
                if (evt.keyCode === UI.KEY_ENTER && !evt.shiftKey) {
                    evt.data.hide();
                }
                return false;
            },
            EXT_SIZE: 50,
            onshow: function (value, elem) {
                var prect = UI.getRect(UI.getDocument(elem).body),
                    rect = UI.getRect(elem),
                    rectTop = rect.top,
                    rectBottom = rect.bottom,
                    newbottom = rectBottom + this.EXT_SIZE;
                if (prect.bottom > newbottom) {
                    rectBottom = newbottom;
                } else {
                    rectTop = Math.max(0, rectTop - this.EXT_SIZE);
                }
                return {
                    left: rect.left,
                    top: rectTop,
                    right: rect.right,
                    bottom: rectBottom
                };
            }
        },
        select: {
            oninit: function (callback, elem, options) {
                var selection = options.options || [];
                var values = [], htmls = ['<select style="width:100%; height: 100%; border: none; padding: 0 3px">'];
                if (UI.isArray(selection)) {
                    var optionsName = options.optionsName || 'name', optionsValue = options.optionsValue || 'value';
                    for (var i = 0, len = selection.length; i < len; i++) {
                        var opt = selection[i], value = opt[optionsValue];
                        values.push(value);
                        htmls.push('<option value="', value, '">', opt[optionsName], '</option>');
                    }
                } else {
                    for (var name in selection) {
                        if (selection.hasOwnProperty(name)) {
                            values.push(name);
                            htmls.push('<option value="', name, '">', selection[name], '</option>');
                        }
                    }
                }
                htmls.push('</select>');
                elem.style.cssText += '; padding-left: 0; padding-right: 0';
                elem.innerHTML = htmls.join('');
                var select = elem.firstChild;
                UI.bind(select, 'change', { values: values, callback: callback }, this.onchange);
                return {
                    select: select,
                    values: values
                };
            },
            render: function (value, elem, obj) {
                obj.select.selectedIndex = UI.indexOf(obj.values, value);
                return false;
            },
            onchange: function (evt) {
                var data = evt.data, idx = this.selectedIndex;
                UI.call(data.callback, this, idx === -1 ? '' : data.values[idx]);
            }
        },
        radio: {
            oninit: function (callback, elem, options) {
                var selection = options.options || [];
                var values = [], htmls = [], radioName = UI.random('radio_');
                if (UI.isArray(selection)) {
                    var optionsName = options.optionsName || 'name', optionsValue = options.optionsValue || 'value';
                    for (var i = 0, len = selection.length; i < len; i++) {
                        var opt = selection[i], value = opt[optionsValue];
                        values.push(value);
                        htmls.push('<label style="margin- right: 8px; cursor: pointer; "><input type="radio" name="',
                            radioName, '" value="', value, '" style="margin: 0 3px; vertical - align: middle" />', opt[optionsName], '</label>');
                    }
                } else {
                    for (var name in options) {
                        if (options.hasOwnProperty(name)) {
                            values.push(name);
                            htmls.push('<label style="margin- right: 8px; cursor: pointer; "><input type="radio" name="',
                                radioName, '" value="', name, '" style="margin: 0 3px; vertical - align: middle" />', options[name], '</label>');
                        }
                    }
                }
                elem.innerHTML = htmls.join('');
                var radios = [], child = elem.firstChild;
                while (child) {
                    radios.push(child.firstChild);
                    child = child.nextSibling;
                }
                var obj = { radios: radios, values: values, callback: callback };
                UI.bind(elem, 'click', obj, this.onclick);
                return obj;
            },
            render: function (value, elem, obj) {
                var idx = UI.indexOf(obj.values, value), radios = obj.radios;
                if (idx === -1) {
                    for (var i = 0, len = radios.length; i < len; i++) {
                        radios[i].checked = false;
                    }
                } else {
                    radios[idx].checked = true;
                }
                return false;
            },
            onclick: function (evt) {
                var data = evt.data, radios = data.radios;
                for (var i = 0, len = radios.length; i < len; i++) {
                    if (radios[i].checked) {
                        UI.call(data.callback, this, data.values[i]);
                        break;
                    }
                }
            }
        },
        switch: {
            oninit: function (callback, elem) {
                elem.innerHTML = '<input type="checkbox" class="ui-switch" />';
                var radio = elem.firstChild;
                UI.bind(elem.firstChild, 'change', callback, this.onchange);
                return radio;
            },
            onchange: function (evt) {
                UI.call(evt.data, this, this.checked);
            },
            render: function (value, elem, radio) {
                radio.checked = value;
                return false;
            }
        },
        combo: {
            editor: 'input'
        },
        link: {
            editor: function (value, callback, elem, data, evt) {
                var editor = g_editors.input.editor.call(this, value, callback, data.elem);
                if (!evt || evt.target === data.btn) {
                    UI.call(data.onclick, this, editor, value);
                }
                return editor;
            },
            oninit: function (callback, elem, options) {
                elem.style.cssText += 'padding-left: 0; padding-right: 20px; position: relative;';
                elem.innerHTML = '<div style="width: 100%; height: 100%; padding: 0 3px; overflow: hidden; "></div><i class="ui-icon ' +
                    (options.icon || 'ui-icon-link') + '" style="position: absolute; right: 2px; top: 50%; margin-top: -8px;"></i>';
                return {
                    elem: elem,
                    text: elem.firstChild,
                    btn: elem.lastChild,
                    callback: callback,
                    onclick: options.onclick
                };
            },
            render: function (value, elem, data) {
                UI.html(data.text, value, true);
                return false;
            }
        },
        slider: {
            editor: 'input'
        },
        spinner: {
            editor: 'input'
        },
        color: {
            editor: 'input'
        },
        number: {
            editor: 'input',
            validator: function (value) {
                return value ? parseInt(value, 10) || '' : '';
            },
            onkeydown: function (evt) {
                var keyCode = evt.keyCode;
                if (!UI.isKeyControl(keyCode, evt.ctrlKey) && !UI.isKeyNumber(keyCode, evt.shiftKey)) {
                    evt.preventDefault();
                }
            }
        },
        size: {
            editor: 'input',
            reg: /^(?:\d+%)|(?:auto)$/,
            validator: function (value) {
                return '' === value || this.reg.test(value) ? value : (isNaN(value = parseInt(value, 10)) ? '' : (Math.max(value, 0) + 'px'));
            },
            onedit: function (value) {
                return '' === value || this.reg.test(value) ? value : parseInt(value, 10);
            },
            onkeydown: function (evt) {
                var keyCode = evt.keyCode;
                if (UI.isKeyControl(keyCode, evt.ctrlKey)) return;
                var value = this.value;
                if (UI.isKeyNumber(keyCode, evt.shiftKey)) {
                    if (value.indexOf('%') === -1 || UI.getCaret(this, true) < value.length) return;
                }
                if (evt.shiftKey && keyCode === UI.KEY_5) {
                    if (value.indexOf('%') === -1 && UI.getCaret(this, false) === value.length) return;
                }
                evt.preventDefault();
            }
        }
    };

    return {
        get: function _(type) {
            var obj = g_editors[type] || g_editors.input;
            if (UI.isString(type = obj.editor)) {
                delete obj.editor;
                UI.extend(true, false, obj, _(type));
            }
            return obj;
        },
        regist: function (type, editor) {
            g_editors[type] = editor;
        }
    };
});