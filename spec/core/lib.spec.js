describe('核心库【lib】', function () {

    describe('方法：EUI.extend', function () {
        var target = null, dest = null;

        beforeEach(function () {
            target = {
                str: 'ABC',
                arr: [1, 2, { name: 'ZS' }]
            };
            dest = { str: 'CDE' };
        });

        it('EUI.extend(dest, target) · 对象浅拷贝', function () {
            expect(EUI.extend(target)).toEqual({
                str: 'ABC',
                arr: [1, 2, { name: 'ZS' }]
            });
            expect(EUI.extend(123, target)).toEqual({
                str: 'ABC',
                arr: [1, 2, { name: 'ZS' }]
            });
            expect(EUI.extend(123, target)).not.toBe(target);
            EUI.extend(dest, target);

            expect(dest).toEqual({
                str: 'ABC',
                arr: [1, 2, { name: 'ZS' }]
            });
            expect(dest.str).toBe(target.str);
            expect(dest.arr).toBe(target.arr);
        });

        it('EUI.extend(true, dest, target) · 对象深拷贝', function () {
            EUI.extend(true, dest, target);

            expect(dest).toEqual({
                str: 'ABC',
                arr: [1, 2, { name: 'ZS' }]
            });
            expect(dest.str).toBe(target.str);
            expect(dest.arr).not.toBe(target.arr);
        });

        it('EUI.extend(false, false, dest, target) · 对象增量浅拷贝', function () {
            EUI.extend(false, false, dest, target);

            expect(dest).toEqual({
                str: 'CDE',
                arr: [1, 2, { name: 'ZS' }]
            });
            expect(dest.str).not.toBe(target.str);
            expect(dest.arr).toBe(target.arr);
        });

        it('EUI.extend(true, false, dest, target) · 对象增量深拷贝', function () {
            EUI.extend(true, false, dest, target);

            expect(dest).toEqual({
                str: 'CDE',
                arr: [1, 2, { name: 'ZS' }]
            });
            expect(dest.str).not.toBe(target.str);
            expect(dest.arr).not.toBe(target.arr);
        });

        it('EUI.extend(dest, target1, target2...) · 多对象浅拷贝', function () {
            var obj = EUI.extend({}, { name: 'Empty' }, dest, target);

            expect(obj).toEqual({
                name: 'Empty',
                str: 'ABC',
                arr: [1, 2, { name: 'ZS' }]
            });
            expect(dest).toEqual({
                str: 'CDE'
            });
            expect(obj.str).toBe(target.str);
            expect(obj.arr).toBe(target.arr);
        });

        it('EUI.extend(false, true, dest, target1, target2...) · 多对象增量浅拷贝', function () {
            var obj = EUI.extend(false, false, {}, dest, target);

            expect(obj).toEqual({
                str: 'CDE',
                arr: [1, 2, { name: 'ZS' }]
            });
            expect(dest).toEqual({
                str: 'CDE'
            });
            expect(obj.str).toBe(dest.str);
            expect(obj.arr).toBe(target.arr);
        });
    });

    describe('方法：EUI.inherit', function () {
		/*
		 var sproto = sub.prototype;
		 var subp = sub.prototype = new f();
		 for(var name in sproto) {
		 if (sproto.hasOwnProperty(name)) {
		 subp[name] = sproto[name];
		 }
		 }
		 */

        var Super = null;

        beforeEach(function () {
            Super = function () {
            };
            Super.prototype.methodA = function () {
                return 'A';
            };
        });

        it('EUI.inherit(null, Super, {}) · 从无到有', function () {

            var Sub = EUI.inherit(null, Super, {
                methodB: function () {
                    return 'B';
                }
            });

            var bean = new Sub();

            expect(bean.methodA()).toBe('A');
            expect(bean.methodB()).toBe('B');

            expect(EUI.inherit(null, null, {
                methodB: function () {
                }
            })).toBeUndefined();
        });

        it('EUI.inherit(Sub, Super, {}) · 扩展继承', function () {
            function Sub() {
            }

            Sub.prototype.methodB = function () {
                return 'B';
            };

            expect(EUI.inherit(Sub, Super, {
                methodC: function () {
                    return 'C';
                }
            })).toBe(Sub);

            var bean = new Sub();

            expect(bean.methodA()).toBe('A');
            expect(bean.methodB()).toBe('B');
            expect(bean.methodC()).toBe('C');
        });

        it('EUI.inherit(null, Super, {}, {}...) · 多方法体继承', function () {

            var Sub = EUI.inherit(null, Super, {
                methodB: function () {
                    return 'B';
                }
            }, {
                    methodC: function () {
                        return 'C';
                    }
                });

            var bean = new Sub();

            expect(bean.methodA()).toBe('A');
            expect(bean.methodB()).toBe('B');
            expect(bean.methodC()).toBe('C');
        });
    });

    describe('方法：EUI.namespace', function () {
        afterEach(function () {
            delete window.AA;
        });

        it('EUI.namespace("..") · 空字符串处理', function () {
            var obj = {};
            EUI.namespace("", obj);
            expect(obj).toEqual({
                "": {}
            });
            EUI.namespace('..', obj);
            expect(obj).toEqual({
                "": {
                    "": {
                        "": {}
                    }
                }
            });
        });

        it('EUI.namespace("AA.BB.CC") · 全局对象创建', function () {
            expect(window.AA).toBeUndefined();
            EUI.namespace();
            expect(window.AA).toBeUndefined();
            EUI.namespace('AA.BB.CC');
            expect(window.AA).toEqual({
                BB: {
                    CC: {}
                }
            });

            expect(window.AA.BB.CC.DD).toBeUndefined();
            EUI.namespace('AA.BB.CC.DD');
            expect(window.AA).toEqual({
                BB: {
                    CC: {
                        DD: {}
                    }
                }
            });
            window.AA.BB.EE = true;
            expect(window.AA).toEqual({
                BB: {
                    CC: {
                        DD: {}
                    },
                    EE: true
                }
            });
            EUI.namespace('AA.BB.EE');
            expect(window.AA).toEqual({
                BB: {
                    CC: {
                        DD: {}
                    },
                    EE: {}
                }
            });
        });

        it('EUI.namespace("BB.CC", AA) · 现有对象创建', function () {
            var AA = {
                BB: {
                    CC: {}
                }
            };
            expect(AA.BB.CC.DD).toBeUndefined();
            EUI.namespace('BB.CC.DD', AA);
            expect(AA).toEqual({
                BB: {
                    CC: {
                        DD: {}
                    }
                }
            });

            expect(AA.BB.BB).toBeUndefined();
            EUI.namespace('BB.CC.DD', AA.BB);
            expect(AA).toEqual({
                BB: {
                    CC: {
                        DD: {}
                    },
                    BB: {
                        CC: {
                            DD: {}
                        }
                    }
                }
            });
        });

        it('EUI.namespace(true, "BB.CC", AA) · 显示 - 对象扩展', function () {
            window.AA = {
                BB: {
                    CC: {
                        DD: {}
                    }
                }
            };
            EUI.namespace(true, 'AA.BB.CC');
            expect(window.AA).toEqual({
                BB: {
                    CC: [{
                        DD: {}
                    }]
                }
            });

            EUI.namespace(true, 'BB', window.AA);
            expect(window.AA).toEqual({
                BB: [{
                    CC: [{
                        DD: {}
                    }]
                }]
            });
        });

        it('EUI.namespace("BB.CC", AA, {}, {}...) · 隐式 - 对象扩展', function () {
            expect(window.AA).toBeUndefined();
            EUI.namespace('AA.BB.CC', window, { DD: {} }, { EE: {} });
            expect(window.AA).toEqual({
                BB: {
                    CC: [{
                        DD: {}
                    }, {
                        EE: {}
                    }]
                }
            });
        });
    });

    describe('方法：EUI.random', function () {
        it('EUI.random() · 不带参数随机字符串', function () {
            expect(EUI.random()).toMatch(/^\d+$/);
            expect(EUI.random()).not.toEqual(EUI.random());
        });

        it('EUI.random(prefix) · 带前缀随机字符串', function () {
            expect(EUI.random('ABC_')).toMatch(/^ABC_\d+$/);
        });

        it('EUI.random(null, suffix) · 带后缀随机字符串', function () {
            expect(EUI.random(null, 'ABC_')).toMatch(/^\d+ABC_$/);
        });

        it('EUI.random(prefix, suffix) · 带前后缀随机字符串', function () {
            expect(EUI.random('ABC_', 'EFG_')).toMatch(/^ABC_\d+EFG_$/);
        });
    });

    describe('方法：EUI.isPlainObject', function () {
        it('EUI.isPlainObject(obj) · 判断原始类型对象', function () {
            expect(EUI.isPlainObject(undefined)).toBeFalsy();
            expect(EUI.isPlainObject(null)).toBeFalsy();
            expect(EUI.isPlainObject('ABC')).toBeFalsy();
            expect(EUI.isPlainObject('')).toBeFalsy();
            expect(EUI.isPlainObject(true)).toBeFalsy();
            expect(EUI.isPlainObject(false)).toBeFalsy();
            expect(EUI.isPlainObject(0)).toBeFalsy();
            expect(EUI.isPlainObject(1)).toBeFalsy();
        });

        it('EUI.isPlainObject(obj) · 判断对象', function () {
            expect(EUI.isPlainObject({})).toBeTruthy();
            expect(EUI.isPlainObject({ a: 'a', b: true, c: 3, d: { dd: /\d/ }, e: [1, 2] })).toBeTruthy();
            expect(EUI.isPlainObject([])).toBeFalsy();
            expect(EUI.isPlainObject(new Date())).toBeFalsy();
            expect(EUI.isPlainObject(/\d+/)).toBeFalsy();
            expect(EUI.isPlainObject(window)).toBeFalsy();
            expect(EUI.isPlainObject(document)).toBeFalsy();
            expect(EUI.isPlainObject(document.createElement('body'))).toBeFalsy();
            expect(EUI.isPlainObject(function () {
            })).toBeFalsy();
            expect(EUI.isPlainObject(new function () {
            })).toBeFalsy();
        });
    });

    describe('方法：EUI.isEmptyObject', function () {

        it('EUI.isEmptyObject(obj) · 判断原始类型对象', function () {
            expect(EUI.isEmptyObject(undefined)).toBeFalsy();
            expect(EUI.isEmptyObject(null)).toBeFalsy();
            expect(EUI.isEmptyObject('ABC')).toBeFalsy();
            expect(EUI.isEmptyObject('')).toBeFalsy();
            expect(EUI.isEmptyObject(true)).toBeFalsy();
            expect(EUI.isEmptyObject(false)).toBeFalsy();
            expect(EUI.isEmptyObject(0)).toBeFalsy();
            expect(EUI.isEmptyObject(1)).toBeFalsy();
        });

        it('EUI.isEmptyObject(obj) · 判断对象', function () {
            expect(EUI.isEmptyObject({})).toBeTruthy();
            expect(EUI.isEmptyObject({ a: 'a' })).toBeFalsy();
            expect(EUI.isEmptyObject([])).toBeFalsy();
            expect(EUI.isEmptyObject(new Date())).toBeFalsy();
            expect(EUI.isEmptyObject(/\d+/)).toBeFalsy();
            expect(EUI.isEmptyObject(window)).toBeFalsy();
            expect(EUI.isEmptyObject(document)).toBeFalsy();
            expect(EUI.isEmptyObject(document.createElement('body'))).toBeFalsy();
            expect(EUI.isEmptyObject(function () {
            })).toBeFalsy();
            expect(EUI.isPlainObject(new function () {
            })).toBeFalsy();
        });
    });

    describe('方法：EUI.empty', function () {
        var student = null;
        beforeEach(function () {
            student = { name: 'lili', age: 18, scores: [98, 82, 92] };
        });

        it('EUI.empty(obj) · 清空所有', function () {
            EUI.empty(student);
            expect(student).toEqual({});
        });

        it('EUI.empty(obj, names) · 清空指定属性(数组)', function () {
            EUI.empty(student, ['scores', 'age']);
            expect(student).toEqual({ name: 'lili' });
        });

        it('EUI.empty(obj, name) · 清空指定属性', function () {
            EUI.empty(student, 'scores');
            EUI.empty(student, 10);
            expect(student).toEqual({ name: 'lili', age: 18 });
        });

        it('EUI.empty(obj, names) · 容错性', function () {
            expect(EUI.empty()).toBeUndefined();
            EUI.empty(student, 10);
            expect(student).toEqual({ name: 'lili', age: 18, scores: [98, 82, 92] });
        });
    });

    describe('方法：EUI.execScript', function () {
        it('EUI.execScript("var a=true;") · 全局变量初始化', function () {
            expect(window.a).toBeUndefined();
            EUI.execScript('var a = { ok: true }');
            expect(window.a).toEqual({ ok: true });
        });

        it('EUI.execScript("callback();") · 全局方法调用', function () {
            expect(window.myVar).toBeUndefined();
            EUI.execScript('EUI.extend(window, { myVar : { ok: true} })');
            expect(window.myVar).toEqual({ ok: true });
        })
    });

    describe('方法: EUI.startWith', function () {
        it('EUI.startWidth(str, prefix) · 判断指定字符串开头', function () {
            expect(EUI.startWith('ABC', 'AB')).toBeTruthy();
            expect(EUI.startWith('ABC', 'AC')).toBeFalsy();
        });

        it('EUI.startWidth(str, prefix, true) · 确保指定字符串开头', function () {
            expect(EUI.startWith('ABC', 'AB', true)).toBe('ABC');
            expect(EUI.startWith('ABC', 'AC', true)).toBe('ACABC');
            expect(EUI.startWith(123, 'AC', true)).toBe('AC123');
        });

        it('EUI.startWidth(str, prefix, false) · 确保非指定字符串开头', function () {
            expect(EUI.startWith('ABABC', 'AB', false)).toBe('C');
            expect(EUI.startWith('ABC', 'AC', false)).toBe('ABC');
        });

        it('EUI.startWith() · 容错性', function () {
            expect(EUI.startWith('ABCBC')).toBeUndefined();
            expect(EUI.startWith(true, 'AC', true)).toBeUndefined();
        });
    });

    describe('方法: EUI.endWith', function () {
        it('EUI.endWith(str, prefix) · 判断指定字符串结尾', function () {
            expect(EUI.endWith('ABC', 'BC')).toBeTruthy();
            expect(EUI.endWith('ABC', 'AC')).toBeFalsy();
        });

        it('EUI.endWith(str, prefix, true) · 确保指定字符串结尾', function () {
            expect(EUI.endWith('ABC', 'BC', true)).toBe('ABC');
            expect(EUI.endWith('ABC', 'AC', true)).toBe('ABCAC');
            expect(EUI.endWith(123, 'AC', true)).toBe('123AC');
        });

        it('EUI.endWith(str, prefix, false) · 确保非指定字符串结尾', function () {
            expect(EUI.endWith('ABCBC', 'BC', false)).toBe('A');
            expect(EUI.endWith('ABC', 'AC', false)).toBe('ABC');
        });

        it('EUI.endWith() · 容错性', function () {
            expect(EUI.endWith('ABCBC')).toBeUndefined();
            expect(EUI.endWith(true, 'AC', true)).toBeUndefined();
        });
    });

    describe('方法：EUI.round', function () {
        it('EUI.round(num, unit) · 保留小数点后几位', function () {
            expect(EUI.round(12.3456, 2)).toBe(12.35);
            expect(EUI.round(12.3446, 2)).toBe(12.34);
            expect(EUI.round(12.3, 2)).toBe(12.3);
            expect(EUI.round(12.3456)).toBe(12);
            expect(EUI.round(12.56)).toBe(13);
        });
        it('EUI.round() · 参数非法', function () {
            expect(EUI.round('', 2)).toBe(0);
            expect(EUI.round('ABC', 2)).toBe(0);
        });
    });

    describe('方法：EUI.asString', function () {
        it('EUI.asString(str) · 转换成字符串', function () {
            expect(EUI.asString('ABC')).toBe('ABC');
            expect(EUI.asString(null)).toBe('');
            expect(EUI.asString(undefined)).toBe('');
            expect(EUI.asString(0)).toBe('0');
            expect(EUI.asString(123)).toBe('123');
            expect(EUI.asString(true)).toBe('true');
            expect(EUI.asString(false)).toBe('false');
            expect(EUI.asString({ ok: true })).toBe('{"ok":true}');
            expect(EUI.asString(new function () {
            }())).toBe('[object Object]');
        });
    });

    describe('方法：EUI.parseFunc', function () {
        it('EUI.parseFunc(funcName) · 从全局对象中获取方法', function () {
            expect(EUI.parseFunc('EUI.parseFunc')).toBe(EUI.parseFunc);
        });

        it('EUI.parseFunc(funcName, obj) · 从指定对象中获取方法', function () {
            var obj = {
                method: function () {
                    return 'LEVEL1';
                },
                level1: {
                    method: function () {
                        return 'LEVEL2'
                    },
                    level2: {
                        method: function () {
                            return 'LEVEL3'
                        }
                    }
                }
            };

            expect(EUI.parseFunc('method', obj)()).toBe('LEVEL1');
            expect(EUI.parseFunc('level1.method', obj)()).toBe('LEVEL2');
            expect(EUI.parseFunc('level1.level2.method', [window, obj])()).toBe('LEVEL3');
        });

        it('EUI.parseFunc(function) · 转换函数字符串', function () {
            expect(EUI.parseFunc('function(a, b) { return a + b; }')(10, 1)).toBe(11);
        });

        it('EUI.parseFunc(body) · 转换函数内容', function () {
            expect(EUI.parseFunc('return Math.abs(a);', 'a')(-10)).toBe(10);
            expect(EUI.parseFunc('return a+b;', ['a', 'b'])(10, 1)).toBe(11);
            expect(EUI.parseFunc('return a+b;', ['a', 4, 'b'])(10, 1)).toBe(11);
        });

        it('EUI.parseFunc(function) · 容错性', function () {
            expect(EUI.parseFunc(EUI.returnfalse)).toBe(EUI.returnfalse);
            expect(EUI.parseFunc(EUI.returnfalse())).toBeNull();
            expect(EUI.parseFunc('obj1.obj2')).toBeNull();
            expect(EUI.parseFunc('obj1.obj2', [window, null, {}])).toBeNull();
        });
    });

    describe('方法：EUI.parseReg', function () {
        it('EUI.parseReg(str) · 简单正则', function () {
            expect(EUI.parseReg('\\d+')).toEqual(/\d+/);
            expect(EUI.parseReg('[a-zA-Z]+')).toEqual(/[a-zA-Z]+/);
        });

        it('EUI.parseReg(str, pattern) · 带模式正则', function () {
            expect(EUI.parseReg('\\d+', 'g')).toEqual(/\d+/g);
            expect(EUI.parseReg('[a-zA-Z]+', 'igm')).toEqual(/[a-zA-Z]+/img);
        });

        it('EUI.parseReg(str, pattern, true) · 完全匹配正则', function () {
            expect(EUI.parseReg('\\d+', null, true)).toEqual(/^\d+$/);
            expect(EUI.parseReg('[a-zA-Z]+', 'igm', true)).toEqual(/^[a-zA-Z]+$/img);
        });

        it('EUI.parseReg(arr, pattern, true) · 多分枝正则', function () {
            expect(EUI.parseReg('\\d+|[a-z]+')).toEqual(/\d+|[a-z]+/);
            expect(EUI.parseReg(['\\d+', '[a-z]+'], 'ig', true)).toEqual(/^(?:(?:\d+)|(?:[a-z]+))$/ig);
        });
    });

    describe('方法：EUI.parseXml', function () {
        it('EUI.parseXml(str) · 正常解析', function () {
            expect(EUI.parseXml('<div attr="This is attribute value"></div>').firstChild.getAttribute('attr')).toBe('This is attribute value');
        });

        it('EUI.parseXml() · 非法解析', function () {
            expect(EUI.parseXml(null)).toBeNull();
            expect(EUI.parseXml()).toBeNull();
            expect(EUI.parseXml('')).toBeNull();
            expect(EUI.parseXml('<dss>')).toBeNull();
        });
    });

    describe('方法：EUI.parseJson', function () {
        it('EUI.parseJson(str) · 标准JSON格式字符串', function () {
            var json = { AA: { BB: { CC: true } } };
            expect(EUI.parseJson(JSON.stringify(json))).toEqual(json);
            var str = '{"yes":"YES", "no":"NO"}';
            expect(EUI.parseJson(str)).toEqual(JSON.parse(str));
        });

        it('EUI.parseJson(str) · 非标准JSON格式字符串', function () {
            var str = '{yes:"YES", no: "NO"}';
            expect(function () {
                JSON.parse(str);
            }).toThrow();
            expect(EUI.parseJson(str)).toEqual({ yes: 'YES', no: 'NO' });

            expect(EUI.parseJson('{msg:"Hello.", callback: function(){ return this.msg }}').callback()).toBe('Hello.');

            expect(EUI.parseJson('EUI')).toBe(EUI);
            expect(EUI.parseJson('EUI.parseJson')).toBeUndefined();
        });
    });

    describe('方法：EUI.parseData', function () {
        it('EUI.parseData(str) · 字符串转对象', function () {
            expect(EUI.parseData('{msg:"Hello.", callback: function(){ return this.msg }}').callback()).toBe('Hello.');
        });

        it('EUI.parseData(namespace) · 获取全局对象', function () {
            expect(EUI.parseData('window.EUI')).toBe(EUI);
        });

        it('EUI.parseData(body) · 脚本语句结果', function () {
            expect(EUI.parseData('10 * 100')).toBe(1000);
            expect(EUI.parseData('EUI.parseData("10 * 100")')).toBe(1000);
            expect(EUI.parseData('(function(a, b){ return a * b; })(10, 100)')).toBe(1000);
        });
    });

    describe('方法：EUI.call', function () {
        it('EUI.call(func, context, args...) · 调用方法', function () {
            expect(EUI.call(EUI.startWith, null, 'ABC', 'CD', true)).toBe('CDABC');
            expect(EUI.call(EUI.startWith, null, 'ABC', 'CD')).toBe(false);
        });

        it('EUI.call(str, context, args...) · 调用方法', function () {
            expect(EUI.call('startWith', EUI, 'ABC', 'CD', true)).toBe('CDABC');
            expect(EUI.call('startWith', EUI, 'ABC', 'CD')).toBe(false);
        });

        it('EUI.call(obj) · 调用对象内方法', function () {
            expect(EUI.call({ handler: EUI.startWith, args: ['ABC', 'CD', true] })).toBe('CDABC');
            expect(EUI.call({ handler: EUI.startWith, args: ['ABC', 'CD'] })).toBe(false);
        });

        it('EUI.call(obj, context, args...) · 调用对象内方法', function () {
            expect(EUI.call({ handler: EUI.startWith, args: ['ABC', 'CD', true] }, null, '123', '45', true)).toBe('45123');
            expect(EUI.call({ handler: EUI.startWith, args: ['ABC', 'CD'] }, null, 'ABC', 'AB')).toBe(true);
            expect(EUI.call({ handler: EUI.startWith, args: ['AB'] }, null, 'ABC')).toBe(true);
            expect(EUI.call({ handler: 'startWith', args: ['AB'] }, EUI, 'ABC')).toBe(true);
        });

        it('EUI.call(true, func, context, args..., params) · 排列参数的调用', function () {
            var param = { name: 'EUI', attr: 'ABC' };
            expect(EUI.call(true, function (attr) {
                return attr;
            }, null, param)).toBe('ABC');
            expect(EUI.call(true, function (name) {
                return name;
            }, null, param)).toBe('EUI');
        });
    });

    describe('方法：EUI.timeout', function () {
        beforeEach(function () {
            jasmine.clock().install();
        });

        afterEach(function () {
            jasmine.clock().uninstall();
        });

        it('EUI.timeout(func) · 创建单步定时器', function () {
            var value = 0;
            expect(value).toEqual(0);
            EUI.timeout(function () {
                value++;
            });
            jasmine.clock().tick(1000);
            expect(value).toEqual(1);
        });

        it('EUI.timeout(func, opt) · 创建多步定时器', function () {
            var obj = {
                handler: function (param) {
                    expect(param).toBe(20);
                    if (this.num === 3) {
                        return false;
                    } else if (this.num > 3) {
                        fail('这里不会调用.');
                    } else {
                        this.num++;
                    }
                },
                context: { count: 100, num: 0 },
                args: 20,
                delay: 0,
                once: false
            };
            EUI.timeout(obj);
            jasmine.clock().tick(1000);
            expect(obj.context.num).toEqual(3);
        });

        it('EUI.timeout(func, opt) · 创建多个定时器', function () {
            var num = 2;
            EUI.timeout();
            var add = {
                handler: function () {
                    num += 3;
                    EUI.timeout(ignore, true);
                },
                single: true
            };
            EUI.timeout(add);
            EUI.timeout(add);
            var ignore = EUI.timeout(function () {
                num *= 0;
            });
            var muti = {
                handler: function muti() {
                    num *= 4;
                },
                unique: true
            }
            EUI.timeout(muti);
            EUI.timeout(muti);
            expect(num).toBe(2);
            jasmine.clock().tick(226);
            expect(num).toBe(5);
            jasmine.clock().tick(226);
            expect(num).toBe(8);
            jasmine.clock().tick(226);
            expect(num).toBe(32);
        });

        it('EUI.timeout(func, true) · 移除定时器', function () {
            var callback = function () {
                console.info('EUI.timeout(func, true) · 移除定时器');
                fail('该方法不应该被执行.');
            };

            EUI.timeout(callback, true);
            EUI.timeout(callback);
            EUI.timeout(callback, true);
            jasmine.clock().tick(500);
        });
    });

    describe('方法：EUI.indexOf', function () {
        it('EUI.indexOf(array, value, name) · 从起始位置查找', function () {
            expect(EUI.indexOf(['A', 'B', 'C', 'B'], 'B')).toBe(1);
            expect(EUI.indexOf(['A', 'B', 'C', 'B'], 'D')).toBe(-1);
        });

        it('EUI.indexOf(array, value, name) · 根据指定属性及值从起始位置查找', function () {
            expect(EUI.indexOf([{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'B' }], 'B', 'name')).toBe(1);
        });

        it('EUI.indexOf(array, value, name) · 根据指定条件从起始位置查找', function () {
            expect(EUI.indexOf([{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'B' }], {
                handler: function (item, idx, name, value) {
                    return item[name] === value;
                },
                args: ['name', 'B']
            })).toBe(1);
        });

        it('EUI.indexOf(array, value, name, index) · 从指定位置查找', function () {
            expect(EUI.indexOf(['A', 'B', 'C', 'B'], 'B', 2)).toBe(3);
            expect(EUI.indexOf(['A', 'B', 'C', 'B'], 'B', 4)).toBe(-1);
            expect(EUI.indexOf([{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'B' }], 'B', 'name', 2)).toBe(3);
            expect(EUI.indexOf([{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'B' }], {
                handler: function (item, idx, name, value) {
                    return item[name] === value;
                },
                args: ['name', 'B']
            }, 2)).toBe(3);
        });
    });

    describe('方法：EUI.each', function () {
        it('EUI.each(array, callback) · 遍历数组元素', function () {
            var obj1 = {};
            EUI.each(['A', 'B', 'C'], function (item, index) {
                obj1[item] = index;
            });
            expect(obj1).toEqual({ 'A': 0, 'B': 1, 'C': 2 });
            var obj2 = {};
            EUI.each(['A', 'B', 'C'], function (item, index) {
                obj2[item] = index;
                return index < 1;
            });
            expect(obj2).toEqual({ 'A': 0, 'B': 1 });
        });
    });

    describe('方法：EUI.warn', function () {
        it('EUI.warn() · 控制台输出警告', function () {
            console.warn = jasmine.createSpy("warn");
            EUI.warn("ABC");
            expect(console.warn).toHaveBeenCalledWith("ABC");
        });
    });

    describe('方法：EUI.error', function () {
        it('EUI.error() · 控制台输出警告', function () {
            console.error = jasmine.createSpy("error");
            EUI.error("ABC");
            expect(console.error).toHaveBeenCalledWith("ABC");
        });
    });

    describe('方法：EUI.returntrue', function () {
        it('EUI.returnfalse() · 返回true的函数', function () {
            expect(EUI.returntrue()).toBeTruthy();
        });
    });

    describe('方法：EUI.returnfalse', function () {
        it('EUI.returnfalse() · 返回false的函数', function () {
            expect(EUI.returnfalse()).toBeFalsy();
        });
    });

    describe('方法：EUI.noop', function () {
        it('EUI.noop() · 返回undefined的函数', function () {
            expect(EUI.noop()).toBeUndefined();
        });
    });

    describe('方法：EUI.isBoolean', function () {
        it('EUI.isBoolean(var) · 判断是否Boolean类型', function () {
            expect(EUI.isBoolean(true)).toBeTruthy();
            expect(EUI.isBoolean(false)).toBeTruthy();

            expect(EUI.isObject(null)).toBeFalsy();
            expect(EUI.isObject(undefined)).toBeFalsy();
            expect(EUI.isBoolean(123)).toBeFalsy();
            expect(EUI.isBoolean(0)).toBeFalsy();
            expect(EUI.isBoolean('')).toBeFalsy();
            expect(EUI.isBoolean('ABC')).toBeFalsy();
            expect(EUI.isBoolean([])).toBeFalsy();
            expect(EUI.isBoolean(new Date())).toBeFalsy();
            expect(EUI.isBoolean(/\d+/)).toBeFalsy();
            expect(EUI.isBoolean({})).toBeFalsy();
            expect(EUI.isBoolean(function () {
            })).toBeFalsy();
        });
    });

    describe('方法：EUI.isNumber', function () {
        it('EUI.isNumber(var) · 判断是否Number类型', function () {
            expect(EUI.isNumber(123)).toBeTruthy();
            expect(EUI.isNumber(0)).toBeTruthy();

            expect(EUI.isObject(null)).toBeFalsy();
            expect(EUI.isObject(undefined)).toBeFalsy();
            expect(EUI.isNumber(true)).toBeFalsy();
            expect(EUI.isNumber(false)).toBeFalsy();
            expect(EUI.isNumber('')).toBeFalsy();
            expect(EUI.isNumber('123')).toBeFalsy();
            expect(EUI.isNumber([])).toBeFalsy();
            expect(EUI.isNumber(new Date())).toBeFalsy();
            expect(EUI.isNumber(/\d+/)).toBeFalsy();
            expect(EUI.isNumber({})).toBeFalsy();
            expect(EUI.isNumber(function () {
            })).toBeFalsy();
        });
    });

    describe('方法：EUI.isString', function () {
        it('EUI.isString(var) · 判断是否String类型', function () {
            expect(EUI.isString('')).toBeTruthy();
            expect(EUI.isString('ABC')).toBeTruthy();

            expect(EUI.isObject(null)).toBeFalsy();
            expect(EUI.isObject(undefined)).toBeFalsy();
            expect(EUI.isString(true)).toBeFalsy();
            expect(EUI.isString(false)).toBeFalsy();
            expect(EUI.isString(123)).toBeFalsy();
            expect(EUI.isString(0)).toBeFalsy();
            expect(EUI.isString([])).toBeFalsy();
            expect(EUI.isString(new Date())).toBeFalsy();
            expect(EUI.isString(/\d+/)).toBeFalsy();
            expect(EUI.isString({})).toBeFalsy();
            expect(EUI.isString(function () {
            })).toBeFalsy();
        });
    });

    describe('方法：EUI.isFunction', function () {
        it('EUI.isFunction(var) · 判断是否Function类型', function () {
            expect(EUI.isFunction(function () {
            })).toBeTruthy();

            expect(EUI.isObject(null)).toBeFalsy();
            expect(EUI.isObject(undefined)).toBeFalsy();
            expect(EUI.isFunction(true)).toBeFalsy();
            expect(EUI.isFunction(false)).toBeFalsy();
            expect(EUI.isFunction(123)).toBeFalsy();
            expect(EUI.isFunction(0)).toBeFalsy();
            expect(EUI.isFunction('')).toBeFalsy();
            expect(EUI.isFunction('ABC')).toBeFalsy();
            expect(EUI.isFunction([])).toBeFalsy();
            expect(EUI.isFunction(new Date())).toBeFalsy();
            expect(EUI.isFunction(/\d+/)).toBeFalsy();
            expect(EUI.isFunction({})).toBeFalsy();
        });
    });

    describe('方法：EUI.isArray', function () {
        it('EUI.isArray(var) · 判断是否Array类型', function () {
            expect(EUI.isArray([])).toBeTruthy();

            expect(EUI.isObject(null)).toBeFalsy();
            expect(EUI.isObject(undefined)).toBeFalsy();
            expect(EUI.isArray(true)).toBeFalsy();
            expect(EUI.isArray(false)).toBeFalsy();
            expect(EUI.isArray(123)).toBeFalsy();
            expect(EUI.isArray(0)).toBeFalsy();
            expect(EUI.isArray('')).toBeFalsy();
            expect(EUI.isArray('ABC')).toBeFalsy();
            expect(EUI.isArray(new Date())).toBeFalsy();
            expect(EUI.isArray(/\d+/)).toBeFalsy();
            expect(EUI.isArray({})).toBeFalsy();
            expect(EUI.isArray(function () {
            })).toBeFalsy();
        });
    });

    describe('方法：EUI.isDate', function () {
        it('EUI.isDate(var) · 判断是否Date类型', function () {
            expect(EUI.isDate(new Date())).toBeTruthy();

            expect(EUI.isDate(true)).toBeFalsy();
            expect(EUI.isDate(false)).toBeFalsy();
            expect(EUI.isDate(123)).toBeFalsy();
            expect(EUI.isDate(0)).toBeFalsy();
            expect(EUI.isDate('')).toBeFalsy();
            expect(EUI.isDate('ABC')).toBeFalsy();
            expect(EUI.isDate([])).toBeFalsy();
            expect(EUI.isDate(/\d+/)).toBeFalsy();
            expect(EUI.isDate({})).toBeFalsy();
            expect(EUI.isDate(function () {
            })).toBeFalsy();
        });
    });

    describe('方法：EUI.isRegExp', function () {
        it('EUI.isRegExp(var) · 判断是否RegExp类型', function () {
            expect(EUI.isRegExp(/\d+/)).toBeTruthy();

            expect(EUI.isObject(null)).toBeFalsy();
            expect(EUI.isObject(undefined)).toBeFalsy();
            expect(EUI.isRegExp(true)).toBeFalsy();
            expect(EUI.isRegExp(false)).toBeFalsy();
            expect(EUI.isRegExp(123)).toBeFalsy();
            expect(EUI.isRegExp(0)).toBeFalsy();
            expect(EUI.isRegExp('')).toBeFalsy();
            expect(EUI.isRegExp('ABC')).toBeFalsy();
            expect(EUI.isRegExp([])).toBeFalsy();
            expect(EUI.isRegExp(new Date())).toBeFalsy();
            expect(EUI.isRegExp({})).toBeFalsy();
            expect(EUI.isRegExp(function () {
            })).toBeFalsy();
        });
    });

    describe('方法：EUI.isObject', function () {
        it('EUI.isObject(var) · 判断是否Object类型', function () {
            expect(EUI.isObject({})).toBeTruthy();

            expect(EUI.isObject(null)).toBeFalsy();
            expect(EUI.isObject(undefined)).toBeFalsy();
            expect(EUI.isObject(true)).toBeFalsy();
            expect(EUI.isObject(false)).toBeFalsy();
            expect(EUI.isObject(123)).toBeFalsy();
            expect(EUI.isObject(0)).toBeFalsy();
            expect(EUI.isObject('')).toBeFalsy();
            expect(EUI.isObject('ABC')).toBeFalsy();
            expect(EUI.isObject([])).toBeFalsy();
            expect(EUI.isObject(new Date())).toBeFalsy();
            expect(EUI.isObject(/\d+/)).toBeFalsy();
            expect(EUI.isObject(function () {
            })).toBeFalsy();
        });
    });

    describe('方法：EUI.isNull', function () {
        it('EUI.isNull(var) · 判断是否Null', function () {
            expect(EUI.isNull(null)).toBeTruthy();

            expect(EUI.isNull({})).toBeFalsy();
            expect(EUI.isNull(undefined)).toBeFalsy();
            expect(EUI.isNull(true)).toBeFalsy();
            expect(EUI.isNull(false)).toBeFalsy();
            expect(EUI.isNull(123)).toBeFalsy();
            expect(EUI.isNull(0)).toBeFalsy();
            expect(EUI.isNull('')).toBeFalsy();
            expect(EUI.isNull('ABC')).toBeFalsy();
            expect(EUI.isNull([])).toBeFalsy();
            expect(EUI.isNull(new Date())).toBeFalsy();
            expect(EUI.isNull(/\d+/)).toBeFalsy();
            expect(EUI.isNull(function () {
            })).toBeFalsy();
        });
    });
    describe('方法：EUI.isUndefined', function () {
        it('EUI.isUndefined(var) · 判断是否Undefined', function () {
            expect(EUI.isUndefined(undefined)).toBeTruthy();

            expect(EUI.isUndefined({})).toBeFalsy();
            expect(EUI.isUndefined(null)).toBeFalsy();
            expect(EUI.isUndefined(true)).toBeFalsy();
            expect(EUI.isUndefined(false)).toBeFalsy();
            expect(EUI.isUndefined(123)).toBeFalsy();
            expect(EUI.isUndefined(0)).toBeFalsy();
            expect(EUI.isUndefined('')).toBeFalsy();
            expect(EUI.isUndefined('ABC')).toBeFalsy();
            expect(EUI.isUndefined([])).toBeFalsy();
            expect(EUI.isUndefined(new Date())).toBeFalsy();
            expect(EUI.isUndefined(/\d+/)).toBeFalsy();
            expect(EUI.isUndefined(function () {
            })).toBeFalsy();
        });
    });
});