(function (UI) {
    'use strict';

    ///### 创建XMLHttpRequest对象
    var createXHR = UI.isUndefined(window.XMLHttpRequest) ? function () {
        try {
            return new window.ActiveXObject('Microsoft.XMLHTTP');
        } catch (e) {
        }
    } : function () {
        return new XMLHttpRequest();
    };

    ///### 返回请求值，xml/json/string
    function _response(xhr, options) {
        if (options.xml) {
            var xml = xhr.responseXML;
            return xml || UI.parseXml(xhr.responseText);
        }
        var text = xhr.responseText;
        return options.json ? UI.parseJson(text) : text;
    }

    ///### 通过定时器查询请求结果
    function _timeout_ajax_(xhr, onsuccess, onerror, options) {
        if (xhr.readyState === 4) {
            UI.call(onsuccess, null, _response(xhr, options));
            return false;
        } else if (--options.timeout === 0) {
            UI.call(onerror, null, UI.i18n('core.ajax.timeout', '请求【{0}】网络超时', options.url));
            return false;
        }
    }

    ///### 绑定script节点加载完成回调函数
    var _bind_file_onload_ = null, _file_onload_check = null;
    if (document.addEventListener) {
        _file_onload_check = function (evt) {
            if (evt.type === 'load') {
                UI.call(evt.data);
            }
        };
        _bind_file_onload_ = function (file, callback) {
            UI.bind(file, 'load', callback, _file_onload_check, true);
        };
    } else {
        _file_onload_check = function (evt) {
            var readyState = this.readyState;
            if (readyState === 'loaded' || readyState === 'complete') {
                UI.unbind(this, 'readystatechange');
                UI.call(evt.data);
            }
        };
        _bind_file_onload_ = function (file, callback) {
            UI.bind(file, 'readystatechange', callback, _file_onload_check);
        };
    }

    /**
     * AJAX请求数据
     * @param options
     *  {
     *    url: 请求地址
     *    method: 请求方式，缺省'GET'
     *    async: 是否异步请求，如果不指定，则根据onsuccess决定是否异步请求，有onsuccess则异步，否则同步
     *    params: 额外参数，JSON或字符串
     *    mimeType: 请求类型
     *    timeout: 检查次数. 如对于比较耗时的请求，可能默认的请求次数不够，需要增大检查次数
     *    onsuccess: 请求成功回调函数
     *    onerror: 请求失败回调函数
     *    context: 请求回调函数的执行上下文
     *    args: 请求回调的第二个参数开始的参数
     *  }
     * @returns {*}
     */
    function ajax(options) {
        if (!options) return;
        var url = options.url;
        if (!url) return;
        var xhr = createXHR(), onsuccess = options.onsuccess, async = options.async;
        if (async !== true && async !== false) async = !!onsuccess;
        var method = (options.method || '').toUpperCase(), param = UI.formatSearch(options.params);
        if (method !== 'POST') {
            method = 'GET';
            if (param) {
                url = url + (url.indexOf('?') === -1 ? '?' : '&') + param;
                param = null;
            }
        }
        xhr.open(method, url, async);
        var mimeType = options.mimeType;
        if (mimeType) xhr.mimeType = mimeType;
        xhr.setRequestHeader('X_REQUESTED_WITH', 'XMLHttpRequest');
        xhr.send(param);
        if (!!onsuccess) {
            if (async) {
                UI.timeout({
                    handler: _timeout_ajax_,
                    args: [xhr, onsuccess, options.onerror, options],
                    once: false
                });
            } else {
                UI.call(onsuccess, _response(xhr, options));
            }
        } else if (!async) {
            return _response(xhr, options);
        }
    }

    UI.extend(UI, {
        ajax: ajax,
        get: function (url, params, onsuccess, onerror) {
            return ajax({
                method: 'GET',
                url: url,
                params: params,
                onsuccess: onsuccess,
                onerror: onerror
            });
        },
        post: function (url, params, onsuccess, onerror) {
            return ajax({
                method: 'POST',
                url: url,
                params: params,
                onsuccess: onsuccess,
                onerror: onerror
            });
        },
        script: function (url, onload, charset, wnd) {
            wnd = wnd || window;
            var doc = wnd.document, _script = doc.createElement('script');
            _script.type = 'text/javascript';
            if (charset) _script.charset = charset;
            if (UI.endWith(url, '.js')) {
                _script.src = url;
                _bind_file_onload_(_script, onload);
                doc.body.appendChild(_script);
            } else {
                _script.text = url;
                doc.body.appendChild(_script);
                UI.call(onload);
            }
        },
        style: function (url, onload, wnd) {
            wnd = wnd || window;
            var doc = wnd.document;
            if (UI.endWith(url, '.css')) {
                var _style = doc.createElement('link');
                _style.rel = 'stylesheet';
                _style.type = 'text/css';
                _style.href = url;
                _bind_file_onload_(_style, onload);
                (doc.getElementsByTagName('head')[0] || doc.body).appendChild(_style);
            } else {
                if (UI.isIe) {
                    wnd.style = url;
                    doc.createStyleSheet("javascript:style");
                    delete wnd.style;
                } else {
                    var style = doc.createElement('style');
                    style.type = 'text/css';
                    style.innerHTML = url;
                    (doc.getElementsByTagName('head')[0] || doc.body).appendChild(style);
                }
                UI.call(onload);
            }
        },
        form: function (url, fields, options) {
            options = options || {};
            var doc = options.doc || document;
            var method = (options.method || '').toUpperCase() !== 'GET' ? 'POST' : 'GET';
            if (options.iframe === false) {
                var elemForm = doc.body.appendChild(doc.createElement('form')), elems = {};
                elemForm.style.cssText += '; position: absolute; left: -99px; top: -99px; width: 1px; height: 1px;';
                elemForm.setAttribute('action', url);
                elemForm.setAttribute('method', method);
                elemForm.setAttribute('target', options.target || '_blank');

                if (fields) {
                    for (var i = 0, len = fields.length; i < len; i++) {
                        var inp = doc.createElement('input'), field = fields[i];
                        inp.setAttribute('name', field);
                        elems[field] = elemForm.appendChild(inp);
                    }
                }

                return {
                    submit: function () {
                        elemForm.submit();
                    },
                    reset: function () {
                        elemForm.reset();
                    },
                    setValue: function (name, value) {
                        var inp = elems[name];
                        if (inp) inp.value = value;
                    }
                };
            } else {
                var htmls = ['<iframe name="_form_ajax_"></iframe><form target="_form_ajax_" method="', method, '" action="', url, '">'];
                if (fields) {
                    for (var name in fields) {
                        if (fields.hasOwnProperty(name)) {
                            htmls.push('<input name="', name, '" value="', fields[name], '"/>');
                        }
                    }
                }
                htmls.push('</form>');
                var div = document.getElementById('_form_ajax_div_id_');
                if (!div) {
                    div = document.createElement('div');
                    div.style.cssText += '; position: absolute; left: -999px; top: -999px; width: 1px; height: 1px;';
                    div.id = '_form_ajax_div_id_';
                    document.body.appendChild(div);
                }
                div.innerHTML = htmls.join('');
                div.lastChild.submit();
            }
        }
    });
})(EUI);