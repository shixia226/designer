describe('DOM库【dom】', function () {
    describe('浏览器特征判断', function () {
        it('EUI.isIe · EUI.ieVersion · EUI.isChrome · EUI.isFirefox', function () {
            expect(EUI.isIe).toBeFalsy();
            expect(EUI.ieVersion).toBe(Number.MAX_VALUE);
            expect(EUI.isChrome).toBeTruthy();
            expect(EUI.isFirefox).toBeFalsy();
        });
    });

    describe('方法：EUI.getWindow', function () {
        it('EUI.getWindow(node) · 根据元素返回window对象', function () {
            expect(EUI.getWindow(document.body)).toBe(window);
            expect(EUI.getWindow(document)).toBe(window);
            expect(EUI.getWindow(window)).toBe(window);
            expect(EUI.getWindow()).toBe(window);
        });
    });

    describe('方法：EUI.getDocument', function () {
        it('EUI.getDocument(node) · 根据元素返回document对象', function () {
            expect(EUI.getDocument(document.body)).toBe(document);
            expect(EUI.getDocument(document)).toBe(document);
            expect(EUI.getDocument(window)).toBe(document);
            expect(EUI.getDocument()).toBe(document);
        });
    });

    describe('方法：EUI.query', function () {
        beforeEach(function () {
            var elem = document.body.appendChild(document.createElement('div'));
            elem.id = 'my-panel';
            elem.innerHTML = '<div>' +
                '<span class="my-span">my-text：</span>' +
                '<input id="my-input" value="my-value">' +
                '<span class="my-container"><span>A</span><span class="my-span">B</span></span>' +
                '</div>';
        });
        afterEach(function () {
            var elem = EUI.query('#my-panel');
            elem.parentNode.removeChild(elem);
        });

        it('EUI.query("#id") · ID选择', function () {
            expect(EUI.query('#my-input').value).toBe('my-value');
        });
        it('EUI.query(".class") · CLASS选择', function () {
            expect(EUI.query('.my-span').length).toBe(2);
            expect(EUI.query('.my-container .my-span').innerHTML).toBe('B');
        });
        it('EUI.query("tag") · 标签选择', function () {
            expect(EUI.query('#my-panel span').length).toBe(4);
            expect(EUI.query('#my-panel span')[2].innerHTML).toBe('A');
        });
    });

    describe('方法：EUI.getBasePath', function () {
        it('EUI.getBasePath() · 获取当前页面相对路径', function () {
            expect(EUI.getBasePath()).toBe('');
        });
        it('EUI.getBasePath(path) · 获取指定路径相对路径', function () {
            expect(EUI.getBasePath('localhost:8026/page/demo/test')).toBe('../../');
            expect(EUI.getBasePath('localhost:8026/page/demo')).toBe('../');
            expect(EUI.getBasePath('localhost:8026/page/demo/')).toBe('../');
            expect(EUI.getBasePath('localhost:8026/page')).toBe('');
        });
    });

    describe('方法：EUI.getSearch()', function () {
        var url = 'localhost:8026?name=zhangsan&age=18&hobby=sing,dance';
        it('EUI.getSearch(name, url) · 获取地址栏里的指定查询参数', function () {
            expect(EUI.getSearch('name')).toBe('');
            expect(EUI.getSearch('name', url)).toBe('zhangsan');
            expect(EUI.getSearch('age', url)).toBe('18');
            expect(EUI.getSearch('hobby', url)).toBe('sing,dance');
        });

        it('EUI.getSearch() · 获取地址栏里的所有查询参数', function () {
            expect(EUI.getSearch(null, url)).toEqual({
                name: 'zhangsan',
                age: '18',
                hobby: 'sing,dance'
            });
        });
    });

    describe('方法：EUI.trigger', function () {
        var elem;
        beforeEach(function () {
            elem = document.body.appendChild(document.createElement('input'));
            elem.setAttribute("my-attr", 'my-value');
            elem.onclick = function () {
                this.setAttribute("my-attr", 'my-click-value');
            };
            elem.addEventListener('mousedown', function () {
                this.setAttribute("my-attr", 'my-mousedown-value');
            });
            elem.addEventListener('change', function () {
                this.setAttribute("my-attr", 'my-change-value');
            });
            elem.addEventListener('focus', function () {
                this.setAttribute("my-attr", 'my-focus-value');
            });
        });
        afterEach(function () {
            elem.parentNode.removeChild(elem);
        });
        it('EUI.trigger(node, type)', function () {
            expect(elem.getAttribute("my-attr")).toBe('my-value');
            EUI.trigger(elem, 'click');
            expect(elem.getAttribute("my-attr")).toBe('my-click-value');
            EUI.trigger(elem, 'mousedown');
            expect(elem.getAttribute("my-attr")).toBe('my-mousedown-value');
            EUI.trigger(elem, 'change');
            expect(elem.getAttribute("my-attr")).toBe('my-change-value');
            EUI.trigger(elem, 'focus');
            expect(elem.getAttribute("my-attr")).toBe('my-focus-value');
        });
    });

    describe('方法：EUI.encodeHtml', function () {
        it('EUI.encodeHtml(html) · 转码HTML字符串', function () {
            expect(EUI.encodeHtml('<span>A&B C"D\'E</span>')).toBe('&lt;span&gt;A&amp;B&nbsp;C&quot;D&#39;E&lt;/span&gt;');
        });
    });

    describe('方法：EUI.decodeHtml', function () {
        it('EUI.decodeHtml(html) · 反转码HTML字符串', function () {
            expect(EUI.decodeHtml('&lt;span&gt;A&amp;B&nbsp;C&quot;D&#39;E&lt;/span&gt;')).toBe('<span>A&B C"D\'E</span>');
        });
    });

    describe('方法：EUI.formatHtml', function () {
        it('EUI.formatHtml(html) · 格式化HTML字符串', function () {
            expect(EUI.formatHtml('<span>A&B C"D\'E</span>')).toBe('<span>A&amp;B C"D\'E</span>');
            expect(EUI.formatHtml('<span>ABC')).toBe('<span>ABC</span>');
            expect(EUI.formatHtml('<td>ABC')).toBe('<td>ABC</td>');
            expect(EUI.formatHtml('<option value="0">ABC')).toBe('<option value="0">ABC</option>');
        });
    });

    describe('方法：EUI.addClass', function () {
        var elem;
        beforeEach(function () {
            elem = document.body.appendChild(document.createElement('div'));
            elem.className = 'class1';
        });
        afterEach(function () {
            elem.parentNode.removeChild(elem);
        });
        it('EUI.addClass(node, className) · 添加className样式', function () {
            expect(elem.className).toBe('class1');
            EUI.addClass(elem, 'class2');
            expect(elem.className).toBe('class1 class2');
            EUI.addClass(elem, 'class3 class2 class3 class4');
            expect(elem.className).toBe('class1 class2 class3 class4');
            EUI.addClass(elem, ['class5', 'class4', 'class3 class4']);
            expect(elem.className).toBe('class1 class2 class3 class4');
        });
    });

    describe('方法：EUI.removeClass', function () {
        var elem;
        beforeEach(function () {
            elem = document.body.appendChild(document.createElement('div'));
            elem.className = 'class1 class2 class3 class4 class5';
        });
        afterEach(function () {
            elem.parentNode.removeChild(elem);
        });
        it('EUI.addClass(node, className) · 添加className样式', function () {
            expect(elem.className).toBe('class1 class2 class3 class4 class5');
            EUI.removeClass(elem, 'class2');
            expect(elem.className).toBe('class1 class3 class4 class5');
            EUI.removeClass(elem, 'class3 class2 class4');
            expect(elem.className).toBe('class1 class5');
            EUI.removeClass(elem, ['class3 class5', 'class1']);
            expect(elem.className).toBe('');
        });
    });

    describe('方法：EUI.toggleClass', function () {
        var elem;
        beforeEach(function () {
            elem = document.body.appendChild(document.createElement('div'));
            elem.className = 'class1 class2 class3 class4 class5';
        });
        afterEach(function () {
            elem.parentNode.removeChild(elem);
        });
        it('EUI.toggleClass(node, className) · 切换className样式', function () {
            expect(elem.className).toBe('class1 class2 class3 class4 class5');
            EUI.toggleClass(elem, 'class2');
            expect(elem.className).toBe('class1 class3 class4 class5');
            EUI.toggleClass(elem, 'class3 class2 class4');
            expect(elem.className).toBe('class1 class5 class2');
            EUI.toggleClass(elem, ['class3 class5', 'class1']);
            expect(elem.className).toBe('class2 class3');
        });
    });

    describe('方法：EUI.hasClass', function () {
        var elem;
        beforeEach(function () {
            elem = document.body.appendChild(document.createElement('div'));
            elem.className = 'class1 class2 class3 class4 class5';
        });
        afterEach(function () {
            elem.parentNode.removeChild(elem);
        });
        it('EUI.hasClass(node, className) · 判断是否具有className样式', function () {
            expect(elem.className).toBe('class1 class2 class3 class4 class5');
            expect(EUI.hasClass(elem, 'class2')).toBeTruthy();
            expect(EUI.hasClass(elem, 'class6')).toBeFalsy();
            expect(EUI.hasClass(elem, 'class3 class4')).toBeUndefined();
            expect(EUI.hasClass(elem, ['class3', 'class4'])).toBeUndefined();
            expect(EUI.hasClass(null, 'class3')).toBeUndefined();
            EUI.removeClass(elem, 'class1 class2 class3 class4 class5');
            expect(EUI.hasClass(elem, 'class6')).toBeFalsy();
        });
    });

    describe('方法：EUI.replaceClass', function () {
        var elem;
        beforeEach(function () {
            elem = document.body.appendChild(document.createElement('div'));
            elem.className = 'class1 class2 class3 class4 class5';
        });
        afterEach(function () {
            elem.parentNode.removeChild(elem);
        });
        it('EUI.replaceClass(node, newClassName, oldClassName) · 替换className样式', function () {
            expect(elem.className).toBe('class1 class2 class3 class4 class5');
            EUI.replaceClass(elem, '', 'class2');
            expect(elem.className).toBe('class1 class3 class4 class5');
            EUI.replaceClass(elem, 'class6', 'class2');
            expect(elem.className).toBe('class1 class3 class4 class5 class6');
            EUI.replaceClass(elem, 'class7', 'class1');
            expect(elem.className).toBe('class3 class4 class5 class6 class7');
            expect(EUI.replaceClass(elem, 'class1', 'class1')).toBeFalsy();
        });
    });

    describe('方法：EUI.css', function () {
        var elem;
        beforeEach(function () {
            elem = document.body.appendChild(document.createElement('div'));
            elem.style.cssText += ';height: 100%;';
        });
        afterEach(function () {
            elem.parentNode.removeChild(elem);
        });
        it('EUI.css(node, css) · 设置CSS样式', function () {
            expect(EUI.css(elem, 'width')).toBe(elem.offsetWidth + 'px');
            expect(EUI.css(elem, 'height')).toBe(elem.offsetHeight + 'px');
            expect(EUI.formatColor(EUI.css(elem, 'color'))).toBe('#000000');
            EUI.css(elem, '; width: 100px; color: red;');
            expect(EUI.css(elem, 'width')).toBe('100px');
            expect(EUI.css(elem, 'height')).toBe(elem.offsetHeight + 'px');
            expect(EUI.formatColor(EUI.css(elem, 'color'))).toBe('#FF0000');
            EUI.css(elem, {
                width: '200px',
                height: '300px',
                color: 'blue'
            });
            expect(EUI.css(elem, 'width')).toBe('200px');
            expect(EUI.css(elem, 'height')).toBe('300px');
            expect(EUI.formatColor(EUI.css(elem, 'color'))).toBe('#0000FF');
        });
    });

    describe('方法：EUI.addStylesheetRules', function () {
        var elem;
        beforeEach(function () {
            elem = document.body.appendChild(document.createElement('div'));
            elem.className = 'my-div';
        });
        afterEach(function () {
            elem.parentNode.removeChild(elem);
        });
        it('EUI.addStylesheetRules(rules) · 添加CSS样式规则', function () {
            expect(EUI.css(elem, 'width')).toBe(elem.offsetWidth + 'px');
            expect(EUI.css(elem, 'height')).toBe(elem.offsetHeight + 'px');
            expect(EUI.formatColor(EUI.css(elem, 'color'))).toBe('#000000');
            EUI.addStylesheetRules([
                ['.my-div', ['width', '200px'], ['height', '300px'], ['color', 'blue']]
            ]);
            expect(EUI.css(elem, 'width')).toBe('200px');
            expect(EUI.css(elem, 'height')).toBe('300px');
            expect(EUI.formatColor(EUI.css(elem, 'color'))).toBe('#0000FF');
            EUI.addStylesheetRules([
                ['.my-div', [
                    ['width', '300px'], ['height', '400px'], ['color', 'red']
                ]
                ]
            ]);
            expect(EUI.css(elem, 'width')).toBe('300px');
            expect(EUI.css(elem, 'height')).toBe('400px');
            expect(EUI.formatColor(EUI.css(elem, 'color'))).toBe('#FF0000');
        });
    });

    describe('方法：EUI.disableTextSelect', function () {
        var elem;
        beforeEach(function () {
            elem = document.body.appendChild(document.createElement('div'));
        });
        afterEach(function () {
            elem.parentNode.removeChild(elem);
        });
        it('EUI.disableTextSelect(node, disabled) · 禁止选中', function () {
            expect(EUI.css(elem, 'user-select')).toBe('text');
            EUI.disableTextSelect(elem);
            expect(EUI.css(elem, 'user-select')).toBe('none');
            EUI.disableTextSelect(elem, false);
            expect(elem.style.cssText).toBe('');
            expect(EUI.css(elem, 'user-select')).toBe('text');
        });
    });

    describe('方法：EUI.html', function () {
        var elem;
        beforeEach(function () {
            elem = document.body.appendChild(document.createElement('div'));
        });
        afterEach(function () {
            elem.parentNode.removeChild(elem);
        });
        it('EUI.html(node, html) · 设置/获取HTML内容', function () {
            expect(EUI.html(elem)).toBe('');
            EUI.html(elem, '<span>ABC');
            expect(EUI.html(elem)).toBe('<span>ABC</span>');
            EUI.html(elem, '<span>DEF', false);
            expect(EUI.html(elem)).toBe('<span>ABC</span><span>DEF</span>');
            EUI.html(elem, '<span>123');
            expect(EUI.html(elem)).toBe('<span>123</span>');
        });
    });

    describe('方法：EUI.text', function () {
        var elem;
        beforeEach(function () {
            elem = document.body.appendChild(document.createElement('div'));
        });
        afterEach(function () {
            elem.parentNode.removeChild(elem);
        });
        it('EUI.text(node, text) · 设置/获取TEXT内容', function () {
            expect(EUI.text(elem)).toBe('');
            EUI.text(elem, '<span>ABC');
            expect(elem.innerHTML).toBe('&lt;span&gt;ABC');
            expect(EUI.text(elem)).toBe('<span>ABC');
        });
    });

    describe('方法：EUI.isAncestor', function () {
        var elem;
        beforeEach(function () {
            elem = document.body.appendChild(document.createElement('div'));
        });
        afterEach(function () {
            elem.parentNode.removeChild(elem);
        });
        it('EUI.isAncestor(pnode, cnode) · 判断是否是祖先节点', function () {
            expect(EUI.isAncestor()).toBeFalsy();
            expect(EUI.isAncestor(elem)).toBeFalsy();
            expect(EUI.isAncestor(elem, elem)).toBeFalsy();
            expect(EUI.isAncestor(document.body, elem)).toBeTruthy();
            expect(EUI.isAncestor(elem, elem, true)).toBeTruthy();
        });
    });

    describe('方法：EUI.removeNode', function () {
        var elem;
        beforeEach(function () {
            elem = document.body.appendChild(document.createElement('div'));
            elem.innerHTML = '<span>A</span><span>B</span><span>C</span>';
        });
        afterEach(function () {
            elem.parentNode.removeChild(elem);
        });
        it('EUI.removeNode(elem) · 从文档流中移除指定节点', function () {
            expect(EUI.html(elem)).toBe('<span>A</span><span>B</span><span>C</span>');
            EUI.removeNode(elem.firstChild);
            expect(EUI.html(elem)).toBe('<span>B</span><span>C</span>');
        });
    });

    describe('方法：EUI.clearNode', function () {
        var elem;
        beforeEach(function () {
            elem = document.body.appendChild(document.createElement('div'));
            elem.innerHTML = '<span>A</span><span>B</span><span>C</span>';
        });
        afterEach(function () {
            elem.parentNode.removeChild(elem);
        });
        it('EUI.clearNode(elem) · 清除指定节点的所有下级节点', function () {
            expect(EUI.html(elem)).toBe('<span>A</span><span>B</span><span>C</span>');
            EUI.clearNode(elem);
            expect(EUI.html(elem)).toBe('');
        });
    });

    describe('方法：EUI.browseChild', function () {
        var elem;
        beforeEach(function () {
            elem = document.body.appendChild(document.createElement('div'));
            elem.innerHTML = '<span data-id="d-a">A</span><span data-id="d-b">B</span><span>C</span>';
        });
        afterEach(function () {
            elem.parentNode.removeChild(elem);
        });
        it('EUI.browseChild(elem, callback, rec) · 遍历下级节点执行回调', function () {
            expect(EUI.html(elem)).toBe('<span data-id="d-a">A</span><span data-id="d-b">B</span><span>C</span>');
            EUI.browseChild(elem, {
                handler: function (elem, prefix) {
                    var html = EUI.html(elem);
                    EUI.html(elem, '<span>' + prefix + '</span>' + html);
                    return html === 'B' ? false : null;
                },
                args: '$'
            });
            expect(EUI.html(elem)).toBe('<span data-id="d-a"><span>$</span>A</span><span data-id="d-b"><span>$</span>B</span><span>C</span>');
            EUI.browseChild(elem, function (elem) {
                EUI.html(elem, '-', false);
            }, true);
            expect(EUI.html(elem)).toBe('<span data-id="d-a"><span>$-</span>A-</span><span data-id="d-b"><span>$-</span>B-</span><span>C-</span>');
            expect(EUI.html(EUI.browseChild(elem, ['data-id', 'd-b']))).toBe('<span>$-</span>B-');
            EUI.browseChild(elem, function (elem) {
                EUI.clearNode(elem);
            });
            expect(EUI.html(elem)).toBe('<span data-id="d-a"></span><span data-id="d-b"></span><span></span>');
        });
    });

    describe('方法：EUI.browseParent', function () {
        var elem;
        beforeEach(function () {
            elem = document.body.appendChild(document.createElement('div'));
        });
        afterEach(function () {
            elem.parentNode.removeChild(elem);
        });
        it('EUI.browseParent(elem, callback) · 遍历上级节点执行回调', function () {
            expect(EUI.browseParent(elem, ['tagName', /^body$/i])).toBe(document.body);
            expect(EUI.browseParent(elem, function () {
            })).toBeUndefined();
            expect(EUI.browseParent(elem, function (elem) {
                return elem === document.body ? true : null;
            })).toBe(document.body);
        })
    });

    describe('方法：EUI.firstElement & EUI.lastElement & EUI.nextElement & EUI.prevElement', function () {
        var elem;
        beforeEach(function () {
            elem = document.body.appendChild(document.createElement('div'));
            elem.innerHTML = '123<span data-id="d-a">A</span>D<span data-id="d-b">B</span>E<span>C</span>456';
        });
        afterEach(function () {
            elem.parentNode.removeChild(elem);
        });
        it('EUI.firstElement(elem, callback) · 获取第一个子元素节点', function () {
            expect(EUI.html(EUI.firstElement(elem))).toBe('A');
            expect(EUI.firstElement(EUI.firstElement(elem))).toBeNull();
        });
        it('EUI.lastElement(elem, callback) · 获取最后一个子元素节点', function () {
            expect(EUI.html(EUI.lastElement(elem))).toBe('C');
            expect(EUI.lastElement(EUI.lastElement(elem))).toBeNull();
        });
        it('EUI.nextElement(elem, callback) · 获取下一个元素节点', function () {
            expect(EUI.html(EUI.nextElement(EUI.lastElement(elem)))).toBeFalsy();
            expect(EUI.html(EUI.nextElement(EUI.firstElement(elem)))).toBe('B');
        });
        it('EUI.prevElement(elem, callback) · 获取上一个元素节点', function () {
            expect(EUI.html(EUI.prevElement(EUI.lastElement(elem)))).toBe('B');
            expect(EUI.html(EUI.prevElement(EUI.firstElement(elem)))).toBeFalsy();
        });
    });

    describe('方法：EUI.borderSize & EUI.paddingSize', function () {
        var elem;
        beforeEach(function () {
            elem = document.body.appendChild(document.createElement('div'));
            elem.style.cssText = '; width: 200px; height: 200px; border-width: 1px 2px 4px 8px; border-style: solid; border-color: #CCC; padding: 10px 20px 40px 80px;';
        });
        afterEach(function () {
            elem.parentNode.removeChild(elem);
        });
        it('EUI.borderSize(node, dir) · 获取边框大小', function () {
            expect(EUI.borderSize(elem)).toBe(-1);
            expect(EUI.borderSize(elem, true)).toBe(5);
            expect(EUI.borderSize(elem, false)).toBe(10);
            expect(EUI.borderSize(elem, 'left')).toBe(8);
            expect(EUI.borderSize(elem, 'l')).toBe(8);
            expect(EUI.borderSize(elem, 3)).toBe(8);
            expect(EUI.borderSize(elem, 'right')).toBe(2);
            expect(EUI.borderSize(elem, 'r')).toBe(2);
            expect(EUI.borderSize(elem, 1)).toBe(2);
            expect(EUI.borderSize(elem, 'top')).toBe(1);
            expect(EUI.borderSize(elem, 't')).toBe(1);
            expect(EUI.borderSize(elem, 0)).toBe(1);
            expect(EUI.borderSize(elem, 'bottom')).toBe(4);
            expect(EUI.borderSize(elem, 'b')).toBe(4);
            expect(EUI.borderSize(elem, 2)).toBe(4);
        });
        it('EUI.paddingSize(node, dir) · 获取边框大小', function () {
            expect(EUI.paddingSize(elem)).toBe(-1);
            expect(EUI.paddingSize(elem, true)).toBe(50);
            expect(EUI.paddingSize(elem, false)).toBe(100);
            expect(EUI.paddingSize(elem, 'left')).toBe(80);
            expect(EUI.paddingSize(elem, 'l')).toBe(80);
            expect(EUI.paddingSize(elem, 3)).toBe(80);
            expect(EUI.paddingSize(elem, 'right')).toBe(20);
            expect(EUI.paddingSize(elem, 'r')).toBe(20);
            expect(EUI.paddingSize(elem, 1)).toBe(20);
            expect(EUI.paddingSize(elem, 'top')).toBe(10);
            expect(EUI.paddingSize(elem, 't')).toBe(10);
            expect(EUI.paddingSize(elem, 0)).toBe(10);
            expect(EUI.paddingSize(elem, 'bottom')).toBe(40);
            expect(EUI.paddingSize(elem, 'b')).toBe(40);
            expect(EUI.paddingSize(elem, 2)).toBe(40);
        });
    });

    describe('方法：EUI.viewCall', function () {
        var elem;
        beforeEach(function () {
            elem = document.body.appendChild(document.createElement('div'));
            elem.style.cssText += '; width: 300px; height: 300px; display: none;';
            elem.innerHTML = '<span data-id="my-span">ABC</span>';
        });
        afterEach(function () {
            elem.parentNode.removeChild(elem);
        });
        it('EUI.viewCall(node, callback) · 确保在文档流中可见后执行回调', function () {
            expect(EUI.query('[data-id=my-span]').offsetWidth).toBe(0);
            EUI.viewCall(EUI.query('[data-id=my-span]'), function () {
                expect(EUI.query('[data-id=my-span]').offsetWidth).not.toBe(0);
            });
            expect(EUI.query('[data-id=my-span]').offsetWidth).toBe(0);
        });
    });

    describe('方法：EUI.getRect', function () {
        var elem;
        beforeEach(function () {
            elem = document.body.appendChild(document.createElement('div'));
            elem.id = "my-div";
            elem.style.cssText += '; width: 300px; height: 360px; position: absolute; left: 200px; top: 260px;';
        });
        afterEach(function () {
            elem.parentNode.removeChild(elem);
        });
        it('EUI.getRect(node) · 获取元素位置', function () {
            var rect = EUI.getRect(EUI.query('#my-div'));
            expect(rect.left).toBe(200);
            expect(rect.top).toBe(260);
            expect(rect.right).toBe(500);
            expect(rect.bottom).toBe(620);
            expect(rect.width).toBe(300);
            expect(rect.height).toBe(360);
        });
    });

    describe('方法：EUI.outerWidth & EUI.outerHeight & EUI.innerWidth & EUI.innerHeight', function () {
        var elem;
        beforeEach(function () {
            elem = document.body.appendChild(document.createElement('div'));
            elem.style.cssText += '; box-sizing: border-box; width: 300px; height: 360px; margin: 10px; padding: 20px; border: 1px solid #CCC;';
        });
        afterEach(function () {
            elem.parentNode.removeChild(elem);
        });
        it('EUI.outerWidth(node) · 获取元素外宽度', function () {
            expect(EUI.outerWidth(elem)).toBe(300);
        });
        it('EUI.outerHeight(node) · 获取元素外高度', function () {
            expect(EUI.outerHeight(elem)).toBe(360);
        });
        it('EUI.innerWidth(node) · 获取元素内高度', function () {
            expect(EUI.innerWidth(elem)).toBe(258);
        });
        it('EUI.innerHeight(node) · 获取元素内高度', function () {
            expect(EUI.innerHeight(elem)).toBe(318);
        });
    });

    describe('方法：EUI.scrollWidth & EUI.scrollHeight & EUI.scrollSize', function () {
        var elem;
        beforeEach(function () {
            elem = document.body.appendChild(document.createElement('div'));
            elem.style.cssText += '; box-sizing: border-box; width: 300px; height: 360px; margin: 10px; padding: 20px; border: 1px solid #CCC;';
            elem.innerHTML = '<div data-id="inner" style="width: 1px; height: 1px"></div>';
        });
        afterEach(function () {
            elem.parentNode.removeChild(elem);
        });
        it('EUI.scrollWidth(node) · 获取内容宽度', function () {
            expect(EUI.scrollWidth(elem)).toBe(41);
            EUI.query('[data-id=inner]').style.width = '200px';
            expect(EUI.scrollWidth(elem)).toBe(240);
            EUI.query('[data-id=inner]').style.width = '400px';
            expect(EUI.scrollWidth(elem)).toBe(440);
        });
        it('EUI.scrollHeight(node) · 获取内容高度', function () {
            expect(EUI.scrollHeight(elem)).toBe(41);
            EUI.query('[data-id=inner]').style.height = '200px';
            expect(EUI.scrollHeight(elem)).toBe(240);
            EUI.query('[data-id=inner]').style.height = '400px';
            expect(EUI.scrollHeight(elem)).toBe(440);
        });
        it('EUI.scrollSize() · 获取滚动条宽度', function () {
            expect(EUI.scrollSize()).not.toBe(0);
            EUI.css(elem, 'overflow: auto');
            EUI.css(elem.firstChild, 'height: 1000px');
            expect(EUI.scrollSize() + elem.clientWidth + EUI.borderSize(elem, false)).toBe(elem.offsetWidth);
        });
    });

    describe('方法：EUI.getCaret & EUI.setCaret', function () {
        var inp;
        beforeEach(function () {
            inp = document.body.appendChild(document.createElement('input'));
            inp.value = 'ABCDEFG';
        });
        afterEach(function () {
            inp.parentNode.removeChild(inp);
        });
        it('EUI.getCaret(node) · 获取光标位置', function () {
            expect(EUI.getCaret()).toBe(-1);
            expect(EUI.getCaret(inp)).toEqual([7, 7]);
        });
        it('EUI.setCaret(node) · 设置光标位置', function () {
            expect(EUI.setCaret()).toBe(false);
            EUI.setCaret(inp);
            expect(EUI.getCaret(inp)).toEqual([7, 7]);
            EUI.setCaret(inp, 2);
            expect(EUI.getCaret(inp)).toEqual([2, 2]);
            EUI.setCaret(inp, 3, 5);
            expect(EUI.getCaret(inp)).toEqual([3, 5]);
            EUI.setCaret(inp);
            expect(EUI.getCaret(inp)).toEqual([3, 5]);
            expect(EUI.getCaret(inp, true)).toBe(3);
            expect(EUI.getCaret(inp, false)).toBe(5);
        });
    });

    describe('方法：EUI.formatColor', function () {
        it('EUI.formatColor(color) · 格式化颜色为16进制', function () {
            expect(EUI.formatColor('#ffeedd')).toBe('#FFEEDD');
            expect(EUI.formatColor('#ABC')).toBe('#AABBCC');
            expect(EUI.formatColor('red')).toBe('#FF0000');
            expect(EUI.formatColor('transparent')).toBe('transparent');
            expect(EUI.formatColor()).toBe('');
            expect(EUI.formatColor('rgb(255, 255)')).toBe('');
            expect(EUI.formatColor('rgb(255, 255, 0)')).toBe('#FFFF00');
            expect(EUI.formatColor(14544639)).toBe('#DDEEFF');
        });
    });

    describe('方法：EUI.toast', function () {
        beforeEach(function () {
            jasmine.clock().install();
        });

        afterEach(function () {
            jasmine.clock().uninstall();
        });
        it('EUI.toast(text, icon, delay) · 显示提示信息', function () {
            EUI.toast('Hi, this is EUI.', 'ui-hello', 0);
            expect(EUI.hasClass(EUI.query('.ui-toast'), 'ui-hidden')).toBeFalsy();
            jasmine.clock().tick(500);
            expect(EUI.hasClass(EUI.query('.ui-toast'), 'ui-hidden')).toBeTruthy();
        });
        it('EUI.toast(texts, icon, delay) · 显示提示信息', function () {
            // EUI.toast(['Loading.', 'Loading..', 'Loading...'], 'ui-load', 0);
            // expect(EUI.hasClass(EUI.query('.ui-toast'), 'ui-hidden')).toBeFalsy();
            // jasmine.clock().tick(500);
            // expect(EUI.hasClass(EUI.query('.ui-toast'), 'ui-hidden')).toBeFalsy();
        });
    });

    describe('方法：EUI.shadow', function () {
        afterEach(function () {
            EUI.removeNode(EUI.query('.shadow'));
        });
        it('EUI.shadow(visible) · 显示遮罩', function () {
            expect(EUI.query('.shadow')).toBeUndefined();
            expect(EUI.shadow(true)).toBe('');
            expect(EUI.query('.shadow')).not.toBeUndefined();
            expect(EUI.css(EUI.query('.shadow'), "left")).toBe('0px');
            EUI.shadow(false);
            expect(EUI.css(EUI.query('.shadow'), "left")).toBe('-99999px');
        });

        it('EUI.shadow(visible, id) · 显示指定遮罩', function () {
            expect(EUI.query('.shadow')).toBeUndefined();
            EUI.shadow(true, { id: 'myshadow.spec', css: '; background: rgba(255,0,0,0.5)' });
            expect(EUI.css(EUI.query('.shadow'), "background-color")).toBe('rgba(255, 0, 0, 0.5)');
            expect(EUI.shadow(true, 'myshadow')).toBe('myshadow');

            expect(EUI.query('.shadow').length).toBeUndefined();
            expect(EUI.css(EUI.query('.shadow'), "background-color")).toBe('rgba(0, 0, 0, 0)');
            EUI.shadow(false, "myshadow");
            expect(EUI.css(EUI.query('.shadow'), "left")).toBe('0px');
            expect(EUI.css(EUI.query('.shadow'), "background-color")).toBe('rgba(255, 0, 0, 0.5)');
            EUI.shadow(true, "myshadow");
            EUI.shadow(false, "myshadow", true);
            expect(EUI.css(EUI.query('.shadow'), "left")).toBe('-99999px');
        });
    });

    describe('方法：EUI.upZindex', function () {
        it('EUI.upZindex · 增大zindex样式值', function () {
            var elem = document.body.appendChild(document.createElement('div'));
            expect(EUI.upZindex(elem)).toBe(227);
            expect(EUI.upZindex(elem)).toBe(228);
            expect(EUI.upZindex(elem)).toBe(229);
        });
    });

    describe('方法：EUI.downZindex', function () {
        it('EUI.downZindex · 减小zindex样式值', function () {
            var elem = document.createElement('div');
            expect(EUI.upZindex(elem)).toBe(230);
            expect(EUI.upZindex(elem)).toBe(231);
            expect(EUI.upZindex(elem)).toBe(232);
            EUI.downZindex(230);
            EUI.downZindex(229);
            EUI.downZindex(228);
            expect(EUI.downZindex(elem)).toBe(232);
            expect(EUI.upZindex(elem = document.createElement('div'))).toBe(232);
            expect(EUI.downZindex(elem)).toBe(232);
            elem.style.zIndex = 231;
            expect(EUI.downZindex(elem)).toBe(231);
            elem.style.zIndex = 230;
            expect(EUI.upZindex(elem)).toBe(228);
        });
    })
});