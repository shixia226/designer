EUI.defineCmp('tree', 'bar', function (Bar, UI) {
	'use strict';

	var CLS_EXPAND = 'ui-icon-plus',
		CLS_COLLAPSE = 'ui-icon-minus';

	function getItem(tree, elem) {
		var items = tree._property.items;
		for (var i = 0, len = items.length; i < len; i++) {
			var item = items[i];
			if (item.itemDom === elem) return item;
		}
	}
	function getTreeTarget(evt, pelem, filter) {
		var elem = evt.target, elems = [], tree = evt.data;
		while (elem !== pelem) {
			var tagName = elem.tagName.toLowerCase();
			if (UI.call(filter, pelem, tagName, elem) === false) return;
			if (tagName === 'li') {
				elems.unshift(elem);
			}
			elem = elem.parentNode;
		}
		elem = elems.pop();
		if (!elem) return;
		for (var i = 0, len = elems.length; i < len; i++) {
			tree = getItem(tree, elems[i]).tree;
		}
		return { tree: tree, item: getItem(tree, elem) };
	}
	function _filter_label(tagName, elem) {
		return (tagName !== 'input' && UI.hasClass(elem.parentNode, 'ui-tree-node')) ? false : undefined;
	}

	var initItemTree = null, g_config = {
		events: {
			contextmenu: function (evt) {
				var target = getTreeTarget(evt, this);
				if (!target) return;
				var tree = target.tree, item = target.item;
				tree.emit(tree.EVT_ON_CONTEXT, item.name, item.itemDom, evt);
				evt.preventDefault();
			},
			click: function (evt) {
				var target = getTreeTarget(evt, this, _filter_label);
				if (!target) return;
				var tree = target.tree, item = target.item;
				if (evt.target === item.expandDom) {
					tree.expand(!item.expand, item.name);
				} else {
					tree.select(item.checkDom.checked, item.name);
				}
				tree.emit(tree.EVT_ON_CLICK, item.name, item.itemDom, evt);
			}
		},
		handlers: {
			'EVT_ON_EXPAND.system': function (expand, index) {
				var item = this._property.items[this.index(index)], tree = item.tree;
				if (tree) {
					tree.elem().style.display = expand ? '' : 'none';
				} else if (expand) {
					initItemTree(this, item);
				}
			}
		},
		props: { $select_single: true },

		initClone: function (doc) {
			var item4clone = doc.createElement('li');
			item4clone.className = 'ui-tree-item';
			item4clone.innerHTML = '<i class="ui-icon ' + CLS_COLLAPSE + '"></i><label class="ui-tree-node"><input type="checkbox" name="' +
				this._property.cmpid + '" /><i class="ui-icon"></i><span class="ui-tree-text"></span></label>';
			return item4clone;
		},

		initItem: function (elem, index, item, options) {
			var name = options.name || UI.random(),
				expandDom = elem.firstChild,
				checkDom = expandDom.nextSibling.firstChild,
				iconDom = checkDom.nextSibling,
				textDom = iconDom.nextSibling,
				text = options.text || UI.i18n('cmp.tree.item.text', '节点'),
				select = options.select === true,
				expand = options.expand === true,
				items = options.items;
			checkDom.setAttribute('value', name);
			if (options.visible === false) {
				item.visible = false;
				elem.style.display = 'none';
			}
			if (select) {
				checkDom.checked = true;
			}
			if (!items && UI.isArray(items)) {
				items = false;
				expandDom.style.display = 'none';
			}
			UI.html(textDom, text);
			UI.icon(iconDom, options.icon, UI.extend(item, {
				name: name,
				hint: elem.title = options.hint || '',
				text: text,
				iconDom: iconDom,
				textDom: textDom,
				checkDom: checkDom,
				expandDom: expandDom,
				items: items,
				select: select,
				expand: expand,
				onclick: options.onclick
			}));
			if (expand) {
				UI.replaceClass(expandDom, CLS_EXPAND, CLS_COLLAPSE);
				initItemTree(this, item);
			}
		},

		onComponentInit: function (pelem, doc) {
			var container = pelem.appendChild(doc.createElement('ul'));
			container.className = 'ui-tree';
			return { container: container, items: [], checkable: true };
		}
	};

	function Tree(options) {
		Tree.Super.call(this, UI.extend(true, false, options, g_config));
	}

	initItemTree = function (tree, item) {
		var items = item.items;
		if (items) {
			item.items = false;
			item.tree = new Tree({
				pelem: item.itemDom,
				items: items,
				checkable: tree.checkable(),
				events: false,
				handlers: false,
				props: { '$owner': tree }
			});
			if (!item.expand) item.tree.elem().style.display = 'none';
		}
	};
	var _get_select_item = function (name, item, names) {
		if (item.select) {
			names.push(name);
		}
	};
	var _set_select_item = function (name, item, select) {
		var checkDom = item.checkDom;
		if (item.select !== select) {
			item.select = checkDom.checked = select;
			this.emit(this.EVT_ON_SELECT, name, select);
		}
	};
	var _find_items_tree = function (name, item, names, handler) {
		if (name === names[0]) {
			names.shift();
			if (names.length === 0) {
				UI.call(handler, this, item);
				return false;
			}
			return true;
		}
	};
	var _find_item_tree = function (name, item, pname, handler) {
		if (name === pname) {
			UI.call(handler, this, item);
			return false;
		}
	};
	var _push_tree_item = function (item, trees) {
		trees.push({ tree: this, item: item });
	};
	var _get_tree_item = function (name) {
		if (!name) return;
		var filter;
		if (UI.isArray(name) || (UI.isString(name) && name.indexOf('.') !== -1 && (name = name.split('.')))) {
			filter = _find_items_tree;
		} else {
			filter = _find_item_tree;
		}
		var trees = [];
		this.browse({ handler: filter, args: [name, { handler: _push_tree_item, args: [trees] }] });
		return trees[0];
	};
	function browseItems(handler, tree, trees) {
		var items = tree._property.items;
		for (var i = 0, len = items.length; i < len; i++) {
			var item = items[i], rt = UI.call(handler, tree, item.name, item);
			initItemTree(tree, item);
			if (UI.isBoolean(rt)) {
				trees.length = 0;
				if (rt && item.tree) trees.push(item.tree);
				break;
			}
			if (item.tree) trees.push(item.tree);
		}
		return trees;
	}
	function getRoot(tree) {
		var owner = tree.property('$owner');
		while (owner) {
			owner = (tree = owner).property('$owner');
		}
		return tree;
	}

	UI.inherit(Tree, Bar, {
		EVT_ON_SELECT: 'EVT_ON_SELECT',
		EVT_ON_EXPAND: 'EVT_ON_EXPAND',
		EVT_ON_CLICK: 'EVT_ON_CLICK',
		EVT_ON_CONTEXT: 'EVT_ON_CONTEXT',

		get: function (name) {
			var item = _get_tree_item.call(this, name);
			if (item) {
				if (!(item = item.item).tree) {
					if (!item.items) item.items = [];
					initItemTree(this, item);
				}
				return item.tree;
			}
		},
		browse: function (handler, rec) {
			if (!handler) return;
			var trees = browseItems(handler, this, []);
			if (rec !== false) {
				var tree;
				while ((tree = trees.shift())) {
					browseItems(handler, tree, trees);
				}
			}
		},
		/**
		 * 针对正确的Tree对象执行回调
		 * 因为界面展现的一个Tree其实是多级的Tree对象构成，所以实际操作item的时候必须是该Item所属的正确的Item.
		 * 比如：tree.expand(true, 'item1') 实际上是只会在跟级Tree对象上找'item1'的节点进行设置展开，如果没有找到则直接忽略
		 * 而如果执行: tree.command('item1', 'expand', true) 则会遍历深层Tree直到找到item1所属Tree再执行expand方法
		 * 
		 * @name itemName
		 * @callback 回调函数，可以是Tree的方法字符串，也可以是其它自定义函数或Handler对象，上下文为该Item所属的Tree
		 */
		command: function (name, callback) {
			if (!name || !callback) return;
			var item = _get_tree_item.call(this, name);
			if (item) {
				var args = [].slice.call(arguments, 2);
				args.push(item.item.name);
				return UI.call(true, callback, item.tree, args);
			}
		},
		append: function (item) {
			var idx = this.index.apply(this, [].slice.call(arguments, 1));
			if (idx === -1) return;
			var pitem = this._property.items[idx], tree = pitem.tree;
			if (tree) {
				tree.add(item);
			} else {
				pitem.items = (pitem.items || []).concat(item);
				initItemTree(this, pitem);
			}
		},
		expand: function (expand) {
			var idx = -1;
			if (UI.isBoolean(expand)) {//Set
				if ((idx = this.index.apply(this, [].slice.call(arguments, 1))) === -1) return;
				var item = this._property.items[idx];
				if (item.expand === expand) return;
				if ((item.expand = expand)) {
					UI.replaceClass(item.expandDom, CLS_EXPAND, CLS_COLLAPSE);
				} else {
					UI.replaceClass(item.expandDom, CLS_COLLAPSE, CLS_EXPAND);
				}
				this.emit(this.EVT_ON_EXPAND, expand, item.name);
			} else {//Get
				if ((idx = this.index.apply(this, arguments)) === -1) return;
				return this._property.items[idx].expand;
			}
		},
		select: function (select) {
			var idx = -1;
			if (UI.isBoolean(select)) {//Set
				var owner = getRoot(this), single = owner.property('$select_single');
				if (arguments.length === 1) {
					if (!single || !select) {
						this.browse({ handler: _set_select_item, args: select });
					}
				}
				if ((idx = this.index.apply(this, [].slice.call(arguments, 1))) === -1) return;
				if (single && select) owner.select(false);
				var item = this._property.items[idx];
				_set_select_item.call(this, item.name, item, select);
			} else {//Get
				if (arguments.length === 0) {
					var names = [];
					this.browse({ handler: _get_select_item, args: [names] });
					return names;
				}
				if ((idx = this.index.apply(this, arguments)) === -1) return;
				return this._property.items[idx].select;
			}
		},
		checkable: function (checkable) {
			var property = this._property;
			if (arguments.length === 0) {
				return property.checkable;
			}
			if (property.checkable === (checkable = checkable !== false)) return;
			var items = property.items, disp = (property.checkable = checkable) ? '' : 'none';
			for (var i = 0, len = items.length; i < len; i++) {
				var item = items[i];
				item.checkDom.style.display = disp;
				if (item.tree) item.tree.checkable(checkable);
			}
			property.item4clone.lastChild.firstChild.style.display = disp;
		},
		emit: function (type) {
			var emit = Tree.Super.prototype.emit;
			emit.apply(this, arguments);
			var owner = this.property('$owner'), args = [].slice.call(arguments, 0);
			while (owner) {
				args[0] = { type: type, property: owner._property };
				emit.apply(this, args);
				owner = owner.property('$owner');
			}
		}
	});

	return Tree;
});