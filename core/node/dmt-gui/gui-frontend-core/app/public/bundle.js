var app = (function () {
	'use strict';

	function noop() {}

	function assign(tar, src) {
		for (var k in src) tar[k] = src[k];
		return tar;
	}

	function assignTrue(tar, src) {
		for (var k in src) tar[k] = 1;
		return tar;
	}

	function callAfter(fn, i) {
		if (i === 0) fn();
		return () => {
			if (!--i) fn();
		};
	}

	function addLoc(element, file, line, column, char) {
		element.__svelte_meta = {
			loc: { file, line, column, char }
		};
	}

	function run(fn) {
		fn();
	}

	function append(target, node) {
		target.appendChild(node);
	}

	function insert(target, node, anchor) {
		target.insertBefore(node, anchor);
	}

	function detachNode(node) {
		node.parentNode.removeChild(node);
	}

	function detachBetween(before, after) {
		while (before.nextSibling && before.nextSibling !== after) {
			before.parentNode.removeChild(before.nextSibling);
		}
	}

	function reinsertBetween(before, after, target) {
		while (before.nextSibling && before.nextSibling !== after) {
			target.appendChild(before.parentNode.removeChild(before.nextSibling));
		}
	}

	function reinsertChildren(parent, target) {
		while (parent.firstChild) target.appendChild(parent.firstChild);
	}

	function reinsertAfter(before, target) {
		while (before.nextSibling) target.appendChild(before.nextSibling);
	}

	function destroyEach(iterations, detach) {
		for (var i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detach);
		}
	}

	function createFragment() {
		return document.createDocumentFragment();
	}

	function createElement(name) {
		return document.createElement(name);
	}

	function createSvgElement(name) {
		return document.createElementNS('http://www.w3.org/2000/svg', name);
	}

	function createText(data) {
		return document.createTextNode(data);
	}

	function createComment() {
		return document.createComment('');
	}

	function addListener(node, event, handler, options) {
		node.addEventListener(event, handler, options);
	}

	function removeListener(node, event, handler, options) {
		node.removeEventListener(event, handler, options);
	}

	function setAttribute(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else node.setAttribute(attribute, value);
	}

	function setData(text, data) {
		text.data = '' + data;
	}

	function setStyle(node, key, value) {
		node.style.setProperty(key, value);
	}

	function toggleClass(element, name, toggle) {
		element.classList[toggle ? 'add' : 'remove'](name);
	}

	function blankObject() {
		return Object.create(null);
	}

	function destroy(detach) {
		this.destroy = noop;
		this.fire('destroy');
		this.set = noop;

		this._fragment.d(detach !== false);
		this._fragment = null;
		this._state = {};
	}

	function destroyDev(detach) {
		destroy.call(this, detach);
		this.destroy = function() {
			console.warn('Component was already destroyed');
		};
	}

	function _differs(a, b) {
		return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
	}

	function _differsImmutable(a, b) {
		return a != a ? b == b : a !== b;
	}

	function fire(eventName, data) {
		var handlers =
			eventName in this._handlers && this._handlers[eventName].slice();
		if (!handlers) return;

		for (var i = 0; i < handlers.length; i += 1) {
			var handler = handlers[i];

			if (!handler.__calling) {
				try {
					handler.__calling = true;
					handler.call(this, data);
				} finally {
					handler.__calling = false;
				}
			}
		}
	}

	function flush(component) {
		component._lock = true;
		callAll(component._beforecreate);
		callAll(component._oncreate);
		callAll(component._aftercreate);
		component._lock = false;
	}

	function get() {
		return this._state;
	}

	function init(component, options) {
		component._handlers = blankObject();
		component._slots = blankObject();
		component._bind = options._bind;
		component._staged = {};

		component.options = options;
		component.root = options.root || component;
		component.store = options.store || component.root.store;

		if (!options.root) {
			component._beforecreate = [];
			component._oncreate = [];
			component._aftercreate = [];
		}
	}

	function on(eventName, handler) {
		var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
		handlers.push(handler);

		return {
			cancel: function() {
				var index = handlers.indexOf(handler);
				if (~index) handlers.splice(index, 1);
			}
		};
	}

	function set(newState) {
		this._set(assign({}, newState));
		if (this.root._lock) return;
		flush(this.root);
	}

	function _set(newState) {
		var oldState = this._state,
			changed = {},
			dirty = false;

		newState = assign(this._staged, newState);
		this._staged = {};

		for (var key in newState) {
			if (this._differs(newState[key], oldState[key])) changed[key] = dirty = true;
		}
		if (!dirty) return;

		this._state = assign(assign({}, oldState), newState);
		this._recompute(changed, this._state);
		if (this._bind) this._bind(changed, this._state);

		if (this._fragment) {
			this.fire("state", { changed: changed, current: this._state, previous: oldState });
			this._fragment.p(changed, this._state);
			this.fire("update", { changed: changed, current: this._state, previous: oldState });
		}
	}

	function _stage(newState) {
		assign(this._staged, newState);
	}

	function setDev(newState) {
		if (typeof newState !== 'object') {
			throw new Error(
				this._debugName + '.set was called without an object of data key-values to update.'
			);
		}

		this._checkReadOnly(newState);
		set.call(this, newState);
	}

	function callAll(fns) {
		while (fns && fns.length) fns.shift()();
	}

	function _mount(target, anchor) {
		this._fragment[this._fragment.i ? 'i' : 'm'](target, anchor || null);
	}

	function removeFromStore() {
		this.store._remove(this);
	}

	var protoDev = {
		destroy: destroyDev,
		get,
		fire,
		on,
		set: setDev,
		_recompute: noop,
		_set,
		_stage,
		_mount,
		_differs
	};

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/navigation/src/ConnectionIndicator.html generated by Svelte v2.16.1 */

	function oncreate() {
	  // added later because we get "loaded" local property
	  // this was not ok ......
	  // we still sometimes see a quick flash of RED x ... but this is probably not solveable...
	  // not a big issue... gui gets produced before store can get connected sometimes... this is probably normal
	  //this.store.entangle(this);
	}
	const file = "Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/navigation/src/ConnectionIndicator.html";

	function create_main_fragment(component, ctx) {
		var if_block_anchor, current;

		var if_block = (!ctx.$connected) && create_if_block(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (!ctx.$connected) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (1:0) {#if !$connected}
	function create_if_block(component, ctx) {
		var div0, span, text1, text2, div2, div1;

		var if_block = (ctx.$controller) && create_if_block_1(component, ctx);

		return {
			c: function create() {
				div0 = createElement("div");
				span = createElement("span");
				span.textContent = "✖";
				text1 = createText("\n    ");
				if (if_block) if_block.c();
				text2 = createText("\n\n  ");
				div2 = createElement("div");
				div1 = createElement("div");
				div1.textContent = "✖";
				span.className = "error svelte-1nkzlso";
				addLoc(span, file, 2, 4, 42);
				div0.id = "device";
				div0.className = "svelte-1nkzlso";
				addLoc(div0, file, 1, 2, 20);
				div1.id = "broken_connection";
				div1.className = "svelte-1nkzlso";
				addLoc(div1, file, 9, 4, 199);
				div2.id = "top_icons";
				addLoc(div2, file, 8, 2, 174);
			},

			m: function mount(target, anchor) {
				insert(target, div0, anchor);
				append(div0, span);
				append(div0, text1);
				if (if_block) if_block.m(div0, null);
				insert(target, text2, anchor);
				insert(target, div2, anchor);
				append(div2, div1);
			},

			p: function update(changed, ctx) {
				if (ctx.$controller) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_1(component, ctx);
						if_block.c();
						if_block.m(div0, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div0);
				}

				if (if_block) if_block.d();
				if (detach) {
					detachNode(text2);
					detachNode(div2);
				}
			}
		};
	}

	// (4:4) {#if $controller}
	function create_if_block_1(component, ctx) {
		var h3, text_value = (ctx.$controller.deviceName) || '', text;

		return {
			c: function create() {
				h3 = createElement("h3");
				text = createText(text_value);
				h3.id = "title";
				h3.className = "svelte-1nkzlso";
				addLoc(h3, file, 4, 6, 99);
			},

			m: function mount(target, anchor) {
				insert(target, h3, anchor);
				append(h3, text);
			},

			p: function update(changed, ctx) {
				if ((changed.$controller) && text_value !== (text_value = (ctx.$controller.deviceName) || '')) {
					setData(text, text_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(h3);
				}
			}
		};
	}

	function ConnectionIndicator(options) {
		this._debugName = '<ConnectionIndicator>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<ConnectionIndicator> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["connected","controller"]), options.data);
		this.store._add(this, ["connected","controller"]);
		if (!('$connected' in this._state)) console.warn("<ConnectionIndicator> was created without expected data property '$connected'");
		if (!('$controller' in this._state)) console.warn("<ConnectionIndicator> was created without expected data property '$controller'");
		this._intro = !!options.intro;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment(this, this._state);

		this.root._oncreate.push(() => {
			oncreate.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(ConnectionIndicator.prototype, protoDev);

	ConnectionIndicator.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/navigation/src/TileBar.html generated by Svelte v2.16.1 */

	var methods = {
	  select(view) {
	    if(this.get().atRPi) {
	      // visual notification (especially important on touch) that command was given
	      this.set({ touchPressed: view });
	      setTimeout(() => this.fire('select', { view }), 0); // so that thread has actual time to show the effect
	    } else {
	      this.fire('select', { view });
	    }
	  },
	  switchToThisDevice() {
	    this.store.switch();
	  }
	};

	function oncreate$1() {
	  // keep a few dmt-related variables (timeDate, Weather, thisDeviceId, selectedDeviceId, homebase) synced with the backend of THIS device
	  // other more fluid variables will be available in global store! for example $player .... always connected to either local device player
	  // or remote device player backend
	  this.store.entangle(this);
	}
	const file$1 = "Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/navigation/src/TileBar.html";

	function create_main_fragment$1(component, ctx) {
		var if_block_anchor, current;

		var if_block = (ctx.loaded) && create_if_block$1(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.loaded) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$1(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (1:0) {#if loaded}
	function create_if_block$1(component, ctx) {
		var if_block_anchor;

		function select_block_type(ctx) {
			if (ctx.$connected) return create_if_block_1$1;
			return create_else_block_1;
		}

		var current_block_type = select_block_type(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},

			d: function destroy(detach) {
				if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (55:2) {:else}
	function create_else_block_1(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.textContent = "✖";
				div.id = "broken_connection";
				div.className = "svelte-t2pdc3";
				addLoc(div, file$1, 55, 4, 2065);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (3:2) {#if $connected}
	function create_if_block_1$1(component, ctx) {
		var div7, div2, div0, text1, div1, text3, text4, div5, div3, text6, div4, text8, div6, text9, slot_content_default = component._slotted.default, slot_content_default_before;

		function click_handler(event) {
			component.select('player');
		}

		function click_handler_1(event) {
			component.select('clock');
		}

		var if_block0 = (ctx.isDevCluster) && create_if_block_6(component, ctx);

		function click_handler_2(event) {
			component.select('help');
		}

		function click_handler_3(event) {
			component.select('device');
		}

		var if_block1 = (ctx.selectedDeviceId) && create_if_block_2(component, ctx);

		return {
			c: function create() {
				div7 = createElement("div");
				div2 = createElement("div");
				div0 = createElement("div");
				div0.textContent = "Player";
				text1 = createText("\n        ");
				div1 = createElement("div");
				div1.textContent = "Clock";
				text3 = createText("\n\n      ");
				if (if_block0) if_block0.c();
				text4 = createText("\n\n      \n\n      ");
				div5 = createElement("div");
				div3 = createElement("div");
				div3.textContent = "Help";
				text6 = createText("\n        ");
				div4 = createElement("div");
				div4.textContent = "Device";
				text8 = createText("\n\n      ");
				div6 = createElement("div");
				if (if_block1) if_block1.c();
				text9 = createText("\n\n      ");
				addListener(div0, "click", click_handler);
				div0.className = "player svelte-t2pdc3";
				toggleClass(div0, "touch_pressed", ctx.touchPressed == 'player');
				addLoc(div0, file$1, 6, 8, 119);
				addListener(div1, "click", click_handler_1);
				div1.className = "clock svelte-t2pdc3";
				toggleClass(div1, "touch_pressed", ctx.touchPressed == 'clock');
				addLoc(div1, file$1, 7, 8, 235);
				div2.className = "options svelte-t2pdc3";
				addLoc(div2, file$1, 5, 6, 89);
				addListener(div3, "click", click_handler_2);
				div3.className = "help svelte-t2pdc3";
				toggleClass(div3, "touch_pressed", ctx.touchPressed == 'help');
				addLoc(div3, file$1, 28, 8, 951);
				addListener(div4, "click", click_handler_3);
				div4.className = "device svelte-t2pdc3";
				toggleClass(div4, "touch_pressed", ctx.touchPressed == 'device');
				addLoc(div4, file$1, 29, 8, 1059);
				div5.className = "options svelte-t2pdc3";
				addLoc(div5, file$1, 27, 6, 921);
				div6.className = "deviceInfo svelte-t2pdc3";
				addLoc(div6, file$1, 32, 6, 1187);
				div7.className = "selector svelte-t2pdc3";
				toggleClass(div7, "nonRPi", !ctx.atRPi);
				addLoc(div7, file$1, 3, 4, 37);
			},

			m: function mount(target, anchor) {
				insert(target, div7, anchor);
				append(div7, div2);
				append(div2, div0);
				append(div2, text1);
				append(div2, div1);
				append(div7, text3);
				if (if_block0) if_block0.m(div7, null);
				append(div7, text4);
				append(div7, div5);
				append(div5, div3);
				append(div5, text6);
				append(div5, div4);
				append(div7, text8);
				append(div7, div6);
				if (if_block1) if_block1.m(div6, null);
				append(div7, text9);

				if (slot_content_default) {
					append(div7, slot_content_default_before || (slot_content_default_before = createComment()));
					append(div7, slot_content_default);
				}
			},

			p: function update(changed, ctx) {
				if (changed.touchPressed) {
					toggleClass(div0, "touch_pressed", ctx.touchPressed == 'player');
					toggleClass(div1, "touch_pressed", ctx.touchPressed == 'clock');
				}

				if (ctx.isDevCluster) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_6(component, ctx);
						if_block0.c();
						if_block0.m(div7, text4);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (changed.touchPressed) {
					toggleClass(div3, "touch_pressed", ctx.touchPressed == 'help');
					toggleClass(div4, "touch_pressed", ctx.touchPressed == 'device');
				}

				if (ctx.selectedDeviceId) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_2(component, ctx);
						if_block1.c();
						if_block1.m(div6, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (changed.atRPi) {
					toggleClass(div7, "nonRPi", !ctx.atRPi);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div7);
				}

				removeListener(div0, "click", click_handler);
				removeListener(div1, "click", click_handler_1);
				if (if_block0) if_block0.d();
				removeListener(div3, "click", click_handler_2);
				removeListener(div4, "click", click_handler_3);
				if (if_block1) if_block1.d();

				if (slot_content_default) {
					reinsertAfter(slot_content_default_before, slot_content_default);
				}
			}
		};
	}

	// (11:6) {#if isDevCluster}
	function create_if_block_6(component, ctx) {
		var div2, div0, text_1, div1;

		function click_handler(event) {
			component.select('calendar');
		}

		function click_handler_1(event) {
			component.select('ambience');
		}

		return {
			c: function create() {
				div2 = createElement("div");
				div0 = createElement("div");
				div0.textContent = "Calendar";
				text_1 = createText("\n          ");
				div1 = createElement("div");
				div1.textContent = "Ambience";
				addListener(div0, "click", click_handler);
				div0.className = "calendar svelte-t2pdc3";
				toggleClass(div0, "touch_pressed", ctx.touchPressed == 'calendar');
				addLoc(div0, file$1, 12, 10, 418);
				addListener(div1, "click", click_handler_1);
				div1.className = "ambience svelte-t2pdc3";
				toggleClass(div1, "touch_pressed", ctx.touchPressed == 'ambience');
				addLoc(div1, file$1, 13, 10, 544);
				div2.className = "options svelte-t2pdc3";
				addLoc(div2, file$1, 11, 8, 386);
			},

			m: function mount(target, anchor) {
				insert(target, div2, anchor);
				append(div2, div0);
				append(div2, text_1);
				append(div2, div1);
			},

			p: function update(changed, ctx) {
				if (changed.touchPressed) {
					toggleClass(div0, "touch_pressed", ctx.touchPressed == 'calendar');
					toggleClass(div1, "touch_pressed", ctx.touchPressed == 'ambience');
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div2);
				}

				removeListener(div0, "click", click_handler);
				removeListener(div1, "click", click_handler_1);
			}
		};
	}

	// (34:8) {#if selectedDeviceId}
	function create_if_block_2(component, ctx) {
		var if_block_anchor;

		function select_block_type_1(ctx) {
			if (ctx.$controller && ctx.$controller.demoDevice) return create_if_block_3;
			return create_else_block;
		}

		var current_block_type = select_block_type_1(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},

			d: function destroy(detach) {
				if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (38:10) {:else}
	function create_else_block(component, ctx) {
		var div0, text0, text1, span, text2_value = ctx.$controller.apMode ? '(AP)' : '', text2, text3, div1;

		var if_block = (ctx.$controller && ctx.$controller.ip) && create_if_block_4(component, ctx);

		return {
			c: function create() {
				div0 = createElement("div");
				text0 = createText(ctx.selectedDeviceId);
				text1 = createText(" ");
				span = createElement("span");
				text2 = createText(text2_value);
				text3 = createText("\n            ");
				div1 = createElement("div");
				if (if_block) if_block.c();
				span.className = "ap svelte-t2pdc3";
				addLoc(span, file$1, 38, 53, 1509);
				div0.className = "deviceId svelte-t2pdc3";
				addLoc(div0, file$1, 38, 12, 1468);
				div1.className = "ip svelte-t2pdc3";
				addLoc(div1, file$1, 39, 12, 1586);
			},

			m: function mount(target, anchor) {
				insert(target, div0, anchor);
				append(div0, text0);
				append(div0, text1);
				append(div0, span);
				append(span, text2);
				insert(target, text3, anchor);
				insert(target, div1, anchor);
				if (if_block) if_block.m(div1, null);
			},

			p: function update(changed, ctx) {
				if (changed.selectedDeviceId) {
					setData(text0, ctx.selectedDeviceId);
				}

				if ((changed.$controller) && text2_value !== (text2_value = ctx.$controller.apMode ? '(AP)' : '')) {
					setData(text2, text2_value);
				}

				if (ctx.$controller && ctx.$controller.ip) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_4(component, ctx);
						if_block.c();
						if_block.m(div1, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div0);
					detachNode(text3);
					detachNode(div1);
				}

				if (if_block) if_block.d();
			}
		};
	}

	// (35:10) {#if $controller && $controller.demoDevice}
	function create_if_block_3(component, ctx) {
		var div0, text0_value = ctx.$controller.demoDevice.deviceId, text0, text1, div1, text2_value = ctx.$controller.demoDevice.tagline, text2;

		return {
			c: function create() {
				div0 = createElement("div");
				text0 = createText(text0_value);
				text1 = createText("\n            ");
				div1 = createElement("div");
				text2 = createText(text2_value);
				div0.className = "deviceId svelte-t2pdc3";
				addLoc(div0, file$1, 35, 12, 1309);
				div1.className = "ip svelte-t2pdc3";
				addLoc(div1, file$1, 36, 12, 1383);
			},

			m: function mount(target, anchor) {
				insert(target, div0, anchor);
				append(div0, text0);
				insert(target, text1, anchor);
				insert(target, div1, anchor);
				append(div1, text2);
			},

			p: function update(changed, ctx) {
				if ((changed.$controller) && text0_value !== (text0_value = ctx.$controller.demoDevice.deviceId)) {
					setData(text0, text0_value);
				}

				if ((changed.$controller) && text2_value !== (text2_value = ctx.$controller.demoDevice.tagline)) {
					setData(text2, text2_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div0);
					detachNode(text1);
					detachNode(div1);
				}
			}
		};
	}

	// (41:14) {#if $controller && $controller.ip}
	function create_if_block_4(component, ctx) {
		var text0_value = ctx.$controller.ip, text0, text1, if_block_anchor;

		var if_block = (ctx.thisDeviceId != ctx.selectedDeviceId) && create_if_block_5(component);

		return {
			c: function create() {
				text0 = createText(text0_value);
				text1 = createText("\n                ");
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				insert(target, text0, anchor);
				insert(target, text1, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.$controller) && text0_value !== (text0_value = ctx.$controller.ip)) {
					setData(text0, text0_value);
				}

				if (ctx.thisDeviceId != ctx.selectedDeviceId) {
					if (!if_block) {
						if_block = create_if_block_5(component);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(text0);
					detachNode(text1);
				}

				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (43:16) {#if thisDeviceId != selectedDeviceId}
	function create_if_block_5(component, ctx) {
		var a;

		function click_handler(event) {
			component.switchToThisDevice();
		}

		return {
			c: function create() {
				a = createElement("a");
				a.textContent = "[home]";
				addListener(a, "click", click_handler);
				a.href = "#";
				a.className = "svelte-t2pdc3";
				addLoc(a, file$1, 43, 18, 1759);
			},

			m: function mount(target, anchor) {
				insert(target, a, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(a);
				}

				removeListener(a, "click", click_handler);
			}
		};
	}

	function TileBar(options) {
		this._debugName = '<TileBar>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<TileBar> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["connected","controller"]), options.data);
		this.store._add(this, ["connected","controller"]);
		if (!('loaded' in this._state)) console.warn("<TileBar> was created without expected data property 'loaded'");
		if (!('$connected' in this._state)) console.warn("<TileBar> was created without expected data property '$connected'");
		if (!('atRPi' in this._state)) console.warn("<TileBar> was created without expected data property 'atRPi'");
		if (!('touchPressed' in this._state)) console.warn("<TileBar> was created without expected data property 'touchPressed'");
		if (!('isDevCluster' in this._state)) console.warn("<TileBar> was created without expected data property 'isDevCluster'");
		if (!('selectedDeviceId' in this._state)) console.warn("<TileBar> was created without expected data property 'selectedDeviceId'");
		if (!('$controller' in this._state)) console.warn("<TileBar> was created without expected data property '$controller'");
		if (!('thisDeviceId' in this._state)) console.warn("<TileBar> was created without expected data property 'thisDeviceId'");
		this._intro = !!options.intro;

		this._handlers.destroy = [removeFromStore];

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$1(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$1.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(TileBar.prototype, protoDev);
	assign(TileBar.prototype, methods);

	TileBar.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/player/src/VolumeWidget.html generated by Svelte v2.16.1 */

	var methods$1 = {
	  action(action) {
	    this.store.action({ action, storeName: 'player' });
	  },
	  pause() {
	    this.action('pause');
	  },
	  volumeUp() {
	    this.action('volume_up');
	  },
	  volumeDown() {
	    this.action('volume_down');
	  }
	};

	function oncreate$2() {}
	const file$2 = "Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/player/src/VolumeWidget.html";

	function create_main_fragment$2(component, ctx) {
		var if_block_anchor, current;

		var if_block = (ctx.$player && ctx.$player.paused == false && ctx.$player.currentMedia && ctx.$player.currentMedia.song) && create_if_block$2(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.$player && ctx.$player.paused == false && ctx.$player.currentMedia && ctx.$player.currentMedia.song) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$2(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (1:0) {#if $player && $player.paused == false && $player.currentMedia && $player.currentMedia.song}
	function create_if_block$2(component, ctx) {
		var div2, div0, a0, text1, div1, a1, text3, text4_value = ctx.$player.volume, text4, text5, a2;

		function click_handler(event) {
			event.preventDefault();
			event.stopPropagation();
			component.pause();
		}

		function click_handler_1(event) {
			event.preventDefault();
			event.stopPropagation();
			component.volumeDown();
		}

		function click_handler_2(event) {
			event.preventDefault();
			event.stopPropagation();
			component.volumeUp();
		}

		return {
			c: function create() {
				div2 = createElement("div");
				div0 = createElement("div");
				a0 = createElement("a");
				a0.textContent = "✖";
				text1 = createText("\n    ");
				div1 = createElement("div");
				a1 = createElement("a");
				a1.textContent = "▼";
				text3 = createText("\n      ");
				text4 = createText(text4_value);
				text5 = createText("\n      ");
				a2 = createElement("a");
				a2.textContent = "▲";
				addListener(a0, "click", click_handler);
				a0.href = "#";
				a0.className = "svelte-g6kxch";
				addLoc(a0, file$2, 3, 6, 151);
				div0.className = "pause svelte-g6kxch";
				addLoc(div0, file$2, 2, 4, 125);
				addListener(a1, "click", click_handler_1);
				a1.href = "#";
				a1.className = "volume_down svelte-g6kxch";
				addLoc(a1, file$2, 6, 6, 261);
				addListener(a2, "click", click_handler_2);
				a2.href = "#";
				a2.className = "volume_up svelte-g6kxch";
				addLoc(a2, file$2, 8, 6, 383);
				div1.className = "volume svelte-g6kxch";
				addLoc(div1, file$2, 5, 4, 234);
				div2.id = "play_controls";
				div2.className = "svelte-g6kxch";
				addLoc(div2, file$2, 1, 2, 96);
			},

			m: function mount(target, anchor) {
				insert(target, div2, anchor);
				append(div2, div0);
				append(div0, a0);
				append(div2, text1);
				append(div2, div1);
				append(div1, a1);
				append(div1, text3);
				append(div1, text4);
				append(div1, text5);
				append(div1, a2);
			},

			p: function update(changed, ctx) {
				if ((changed.$player) && text4_value !== (text4_value = ctx.$player.volume)) {
					setData(text4, text4_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div2);
				}

				removeListener(a0, "click", click_handler);
				removeListener(a1, "click", click_handler_1);
				removeListener(a2, "click", click_handler_2);
			}
		};
	}

	function VolumeWidget(options) {
		this._debugName = '<VolumeWidget>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<VolumeWidget> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["player"]), options.data);
		this.store._add(this, ["player"]);
		if (!('$player' in this._state)) console.warn("<VolumeWidget> was created without expected data property '$player'");
		this._intro = !!options.intro;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$2(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$2.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(VolumeWidget.prototype, protoDev);
	assign(VolumeWidget.prototype, methods$1);

	VolumeWidget.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	const img = 'data:image/png;base64,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';

	// --- DMT DEF DUPLICATED --- start

	function constructTryer(obj) {
	  return accessor => {
	    let current = obj;

	    for (const nextKey of accessor.split('.')) {
	      // support square barcket syntax for matching by id inside lists, like:
	      // dmt.userDefaults().try('service["search"].clientResultsPerPage')
	      const re = new RegExp(/(\S*)\[['"]?(\S*?)['"]?\]/);
	      const matches = nextKey.match(re);
	      if (matches) {
	        const nextDict = matches[1];
	        const _nextKey = matches[2];
	        current = listify(current[nextDict]).find(el => id(el) == _nextKey);
	      } else {
	        current = current[nextKey];
	      }

	      if (typeof current == 'undefined') {
	        return undefined;
	      }
	    }

	    return current;
	  };
	}

	function tryOnTheFly(obj, accessor) {
	  return constructTryer(obj)(accessor);
	}

	function makeTryable(obj) {
	  if (!obj) {
	    obj = {};
	  }

	  obj.try = constructTryer(obj);

	  return obj;
	}

	function id(obj) {
	  return values(obj)[0];
	}

	function values(obj) {
	  return listify(obj).map(el => el.id);
	}

	function listify(obj) {
	  if (typeof obj == 'undefined' || obj == null) {
	    return [];
	  }
	  if (Array.isArray(obj)) {
	    return obj;
	  }
	  if (typeof obj == 'string') {
	    return [{ id: obj }];
	  }
	  return [obj];
	}

	// --- DMT DEF DUPLICATED --- end

	var def = { makeTryable, tryOnTheFly, id, values, listify };

	class CssBridge {
	  // cities/Monaco1.jpg
	  setWallpaper(wallpaperSubPath) {
	    if (!wallpaperSubPath) {
	      document.body.style.backgroundImage = '';
	    } else if (wallpaperSubPath.startsWith('/')) {
	      document.body.style.backgroundImage = `url('${wallpaperSubPath}')`;
	    }
	  }

	  setBodyClass(className) {
	    const body = document.getElementsByTagName('body')[0];
	    body.className = className;
	  }
	}

	var css = new CssBridge();

	function log(msg) {
	  console.log(`${new Date().toLocaleString()} → ${msg}`);
	}

	function isInputElementActive() {
	  const { activeElement } = document;
	  const inputs = ['input', 'select', 'textarea']; //'button'

	  if (activeElement && inputs.indexOf(activeElement.tagName.toLowerCase()) !== -1) {
	    return true;
	  }
	}

	log.write = log; // nodejs compatibility in connect.js

	function dir(msg) {
	  console.log(`${new Date().toLocaleString()} → ${JSON.stringify(msg, null, 2)}`);
	}

	function pad(number, digits = 2) {
	  return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
	}

	function getDisplayTime(date) {
	  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
	}

	function unique(items) {
	  return [...new Set(items)];
	}

	function setWallpaper(wallpaper) {
	  if (wallpaper) {
	    css.setWallpaper(wallpaper);
	  } else {
	    css.setWallpaper('');
	  }
	}

	function mapTempToHUE(temp) {
	  const percent = 50 - temp;
	  //console.log(Math.round((360 * percent) / 100.0)); // original formula, too simple, adjusted is much better (nicer colors for each temperature)
	  return Math.round((270 * percent) / 100.0 + (temp < -10 ? 65 : temp > 20 ? 35 : 60)); // 100 + X is a rotation of the wheel, we could do it 50 fixed for example but it was determined to be even better if this varies for certain temperature ranges...
	}

	function accessProperty(obj, acc) {
	  return def.tryOnTheFly(obj, acc);
	}

	function msIntoTimeSpan(timeInMs, index = 0, result = {}) {
	  const times = ['day', 'h', 'min', 's'];
	  const arr = [24, 60, 60, 1000];

	  if (index == times.length) {
	    result['ms'] = timeInMs;
	    return result;
	  }

	  if (index == 0) {
	    result.totalSeconds = timeInMs / 1000.0;
	  }

	  const n = arr.slice(index).reduce((total, num) => total * num, 1);
	  result[times[index]] = Math.floor(timeInMs / n);

	  return msIntoTimeSpan(timeInMs % n, index + 1, result);
	}

	function humanTime(ts) {
	  const times = ['day', 'h', 'min', 's'];
	  let str = '';

	  for (const t of times) {
	    if (ts[t] > 0) {
	      if (t != 's' || (t == 's' && ts.totalSeconds < 60)) {
	        // show seconds only if time is under a minute
	        str = `${str} ${ts[t]} ${t}`;
	      }
	    }
	  }

	  return str.trim();
	}

	function songTime(s) {
	  s = Math.round(s);
	  const hours = Math.floor(s / 3600);
	  const rem = s % 3600;
	  const min = Math.floor(rem / 60);
	  s = rem % 60;

	  return hours ? `${hours}h ${pad(min)}min ${pad(s)}s` : `${min}:${pad(s)}`;
	}

	function colorJson(json) {
	  if (typeof json != 'string') {
	    json = JSON.stringify(json, undefined, 2);
	  }
	  json = json
	    .replace(/&/g, '&amp;')
	    .replace(/</g, '&lt;')
	    .replace(/>/g, '&gt;');
	  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
	    var cls = 'number';
	    var color = 'yellow';
	    if (/^"/.test(match)) {
	      if (/:$/.test(match)) {
	        cls = 'key';
	        color = 'cyan';
	      } else {
	        cls = 'string';
	        color = '#66F62A';
	      }
	    } else if (/true|false/.test(match)) {
	      cls = 'boolean';
	      color = 'orange';
	    } else if (/null/.test(match)) {
	      cls = 'null';
	      color = 'red';
	    }
	    //return {cls, text: match};
	    return `<span style="color: ${color}" class="${cls}">${match}</span>`;
	  });
	}

	// Uint8Array to string in Javascript
	// https://stackoverflow.com/a/22373197
	function Utf8ArrayToStr(array) {
	  let out;
	  let i;
	  let c;
	  let char2;
	  let char3;

	  out = '';

	  const len = array.length;

	  i = 0;

	  while (i < len) {
	    c = array[i++];

	    switch (c >> 4) {
	      case 0:
	      case 1:
	      case 2:
	      case 3:
	      case 4:
	      case 5:
	      case 6:
	      case 7:
	        // 0xxxxxxx
	        out += String.fromCharCode(c);
	        break;
	      case 12:
	      case 13:
	        // 110x xxxx   10xx xxxx
	        char2 = array[i++];
	        out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
	        break;
	      case 14:
	        // 1110 xxxx  10xx xxxx  10xx xxxx
	        char2 = array[i++];
	        char3 = array[i++];
	        out += String.fromCharCode(((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0));
	        break;
	    }
	  }

	  return out;
	}

	var util = {
	  log,
	  dir,
	  pad,
	  getDisplayTime,
	  unique,
	  setWallpaper,
	  accessProperty,
	  mapTempToHUE,
	  msIntoTimeSpan,
	  humanTime,
	  songTime,
	  colorJson,
	  Utf8ArrayToStr,
	  isInputElementActive
	};

	function wrap(text, color) {
	  return `<span style="color: ${color};">${text}</span>`;
	}

	function red(text) {
	  return wrap(text, '#E34042');
	}

	function green(text) {
	  return wrap(text, '#5FE02A');
	}

	function gray(text) {
	  return wrap(text, 'gray');
	}

	function yellow(text) {
	  return wrap(text, '#E5AE34');
	}

	function cyan(text) {
	  return wrap(text, '#29B3BF');
	}

	function magenta(text) {
	  return wrap(text, '#A144E9');
	}

	var colorsDmt = { red, green, gray, yellow, cyan, magenta };

	function Store(state, options) {
		this._handlers = {};
		this._dependents = [];

		this._computed = blankObject();
		this._sortedComputedProperties = [];

		this._state = assign({}, state);
		this._differs = options && options.immutable ? _differsImmutable : _differs;
	}

	assign(Store.prototype, {
		_add(component, props) {
			this._dependents.push({
				component: component,
				props: props
			});
		},

		_init(props) {
			const state = {};
			for (let i = 0; i < props.length; i += 1) {
				const prop = props[i];
				state['$' + prop] = this._state[prop];
			}
			return state;
		},

		_remove(component) {
			let i = this._dependents.length;
			while (i--) {
				if (this._dependents[i].component === component) {
					this._dependents.splice(i, 1);
					return;
				}
			}
		},

		_set(newState, changed) {
			const previous = this._state;
			this._state = assign(assign({}, previous), newState);

			for (let i = 0; i < this._sortedComputedProperties.length; i += 1) {
				this._sortedComputedProperties[i].update(this._state, changed);
			}

			this.fire('state', {
				changed,
				previous,
				current: this._state
			});

			this._dependents
				.filter(dependent => {
					const componentState = {};
					let dirty = false;

					for (let j = 0; j < dependent.props.length; j += 1) {
						const prop = dependent.props[j];
						if (prop in changed) {
							componentState['$' + prop] = this._state[prop];
							dirty = true;
						}
					}

					if (dirty) {
						dependent.component._stage(componentState);
						return true;
					}
				})
				.forEach(dependent => {
					dependent.component.set({});
				});

			this.fire('update', {
				changed,
				previous,
				current: this._state
			});
		},

		_sortComputedProperties() {
			const computed = this._computed;
			const sorted = this._sortedComputedProperties = [];
			const visited = blankObject();
			let currentKey;

			function visit(key) {
				const c = computed[key];

				if (c) {
					c.deps.forEach(dep => {
						if (dep === currentKey) {
							throw new Error(`Cyclical dependency detected between ${dep} <-> ${key}`);
						}

						visit(dep);
					});

					if (!visited[key]) {
						visited[key] = true;
						sorted.push(c);
					}
				}
			}

			for (const key in this._computed) {
				visit(currentKey = key);
			}
		},

		compute(key, deps, fn) {
			let value;

			const c = {
				deps,
				update: (state, changed, dirty) => {
					const values = deps.map(dep => {
						if (dep in changed) dirty = true;
						return state[dep];
					});

					if (dirty) {
						const newValue = fn.apply(null, values);
						if (this._differs(newValue, value)) {
							value = newValue;
							changed[key] = true;
							state[key] = value;
						}
					}
				}
			};

			this._computed[key] = c;
			this._sortComputedProperties();

			const state = assign({}, this._state);
			const changed = {};
			c.update(state, changed, true);
			this._set(state, changed);
		},

		fire,

		get,

		on,

		set(newState) {
			const oldState = this._state;
			const changed = this._changed = {};
			let dirty = false;

			for (const key in newState) {
				if (this._computed[key]) throw new Error(`'${key}' is a read-only computed property`);
				if (this._differs(newState[key], oldState[key])) changed[key] = dirty = true;
			}
			if (!dirty) return;

			this._set(newState, changed);
		}
	});

	/*!
	 * https://github.com/Starcounter-Jack/JSON-Patch
	 * (c) 2017 Joachim Wester
	 * MIT license
	 */
	var __extends = (undefined && undefined.__extends) || (function () {
	    var extendStatics = function (d, b) {
	        extendStatics = Object.setPrototypeOf ||
	            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
	        return extendStatics(d, b);
	    };
	    return function (d, b) {
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	var _hasOwnProperty = Object.prototype.hasOwnProperty;
	function hasOwnProperty(obj, key) {
	    return _hasOwnProperty.call(obj, key);
	}
	function _objectKeys(obj) {
	    if (Array.isArray(obj)) {
	        var keys = new Array(obj.length);
	        for (var k = 0; k < keys.length; k++) {
	            keys[k] = "" + k;
	        }
	        return keys;
	    }
	    if (Object.keys) {
	        return Object.keys(obj);
	    }
	    var keys = [];
	    for (var i in obj) {
	        if (hasOwnProperty(obj, i)) {
	            keys.push(i);
	        }
	    }
	    return keys;
	}
	/**
	* Deeply clone the object.
	* https://jsperf.com/deep-copy-vs-json-stringify-json-parse/25 (recursiveDeepCopy)
	* @param  {any} obj value to clone
	* @return {any} cloned obj
	*/
	function _deepClone(obj) {
	    switch (typeof obj) {
	        case "object":
	            return JSON.parse(JSON.stringify(obj)); //Faster than ES5 clone - http://jsperf.com/deep-cloning-of-objects/5
	        case "undefined":
	            return null; //this is how JSON.stringify behaves for array items
	        default:
	            return obj; //no need to clone primitives
	    }
	}
	//3x faster than cached /^\d+$/.test(str)
	function isInteger(str) {
	    var i = 0;
	    var len = str.length;
	    var charCode;
	    while (i < len) {
	        charCode = str.charCodeAt(i);
	        if (charCode >= 48 && charCode <= 57) {
	            i++;
	            continue;
	        }
	        return false;
	    }
	    return true;
	}
	/**
	* Escapes a json pointer path
	* @param path The raw pointer
	* @return the Escaped path
	*/
	function escapePathComponent(path) {
	    if (path.indexOf('/') === -1 && path.indexOf('~') === -1)
	        return path;
	    return path.replace(/~/g, '~0').replace(/\//g, '~1');
	}
	/**
	 * Unescapes a json pointer path
	 * @param path The escaped pointer
	 * @return The unescaped path
	 */
	function unescapePathComponent(path) {
	    return path.replace(/~1/g, '/').replace(/~0/g, '~');
	}
	/**
	* Recursively checks whether an object has any undefined values inside.
	*/
	function hasUndefined(obj) {
	    if (obj === undefined) {
	        return true;
	    }
	    if (obj) {
	        if (Array.isArray(obj)) {
	            for (var i = 0, len = obj.length; i < len; i++) {
	                if (hasUndefined(obj[i])) {
	                    return true;
	                }
	            }
	        }
	        else if (typeof obj === "object") {
	            var objKeys = _objectKeys(obj);
	            var objKeysLength = objKeys.length;
	            for (var i = 0; i < objKeysLength; i++) {
	                if (hasUndefined(obj[objKeys[i]])) {
	                    return true;
	                }
	            }
	        }
	    }
	    return false;
	}
	function patchErrorMessageFormatter(message, args) {
	    var messageParts = [message];
	    for (var key in args) {
	        var value = typeof args[key] === 'object' ? JSON.stringify(args[key], null, 2) : args[key]; // pretty print
	        if (typeof value !== 'undefined') {
	            messageParts.push(key + ": " + value);
	        }
	    }
	    return messageParts.join('\n');
	}
	var PatchError = /** @class */ (function (_super) {
	    __extends(PatchError, _super);
	    function PatchError(message, name, index, operation, tree) {
	        var _newTarget = this.constructor;
	        var _this = _super.call(this, patchErrorMessageFormatter(message, { name: name, index: index, operation: operation, tree: tree })) || this;
	        _this.name = name;
	        _this.index = index;
	        _this.operation = operation;
	        _this.tree = tree;
	        Object.setPrototypeOf(_this, _newTarget.prototype); // restore prototype chain, see https://stackoverflow.com/a/48342359
	        _this.message = patchErrorMessageFormatter(message, { name: name, index: index, operation: operation, tree: tree });
	        return _this;
	    }
	    return PatchError;
	}(Error));

	var JsonPatchError = PatchError;
	var deepClone = _deepClone;
	/* We use a Javascript hash to store each
	 function. Each hash entry (property) uses
	 the operation identifiers specified in rfc6902.
	 In this way, we can map each patch operation
	 to its dedicated function in efficient way.
	 */
	/* The operations applicable to an object */
	var objOps = {
	    add: function (obj, key, document) {
	        obj[key] = this.value;
	        return { newDocument: document };
	    },
	    remove: function (obj, key, document) {
	        var removed = obj[key];
	        delete obj[key];
	        return { newDocument: document, removed: removed };
	    },
	    replace: function (obj, key, document) {
	        var removed = obj[key];
	        obj[key] = this.value;
	        return { newDocument: document, removed: removed };
	    },
	    move: function (obj, key, document) {
	        /* in case move target overwrites an existing value,
	        return the removed value, this can be taxing performance-wise,
	        and is potentially unneeded */
	        var removed = getValueByPointer(document, this.path);
	        if (removed) {
	            removed = _deepClone(removed);
	        }
	        var originalValue = applyOperation(document, { op: "remove", path: this.from }).removed;
	        applyOperation(document, { op: "add", path: this.path, value: originalValue });
	        return { newDocument: document, removed: removed };
	    },
	    copy: function (obj, key, document) {
	        var valueToCopy = getValueByPointer(document, this.from);
	        // enforce copy by value so further operations don't affect source (see issue #177)
	        applyOperation(document, { op: "add", path: this.path, value: _deepClone(valueToCopy) });
	        return { newDocument: document };
	    },
	    test: function (obj, key, document) {
	        return { newDocument: document, test: _areEquals(obj[key], this.value) };
	    },
	    _get: function (obj, key, document) {
	        this.value = obj[key];
	        return { newDocument: document };
	    }
	};
	/* The operations applicable to an array. Many are the same as for the object */
	var arrOps = {
	    add: function (arr, i, document) {
	        if (isInteger(i)) {
	            arr.splice(i, 0, this.value);
	        }
	        else { // array props
	            arr[i] = this.value;
	        }
	        // this may be needed when using '-' in an array
	        return { newDocument: document, index: i };
	    },
	    remove: function (arr, i, document) {
	        var removedList = arr.splice(i, 1);
	        return { newDocument: document, removed: removedList[0] };
	    },
	    replace: function (arr, i, document) {
	        var removed = arr[i];
	        arr[i] = this.value;
	        return { newDocument: document, removed: removed };
	    },
	    move: objOps.move,
	    copy: objOps.copy,
	    test: objOps.test,
	    _get: objOps._get
	};
	/**
	 * Retrieves a value from a JSON document by a JSON pointer.
	 * Returns the value.
	 *
	 * @param document The document to get the value from
	 * @param pointer an escaped JSON pointer
	 * @return The retrieved value
	 */
	function getValueByPointer(document, pointer) {
	    if (pointer == '') {
	        return document;
	    }
	    var getOriginalDestination = { op: "_get", path: pointer };
	    applyOperation(document, getOriginalDestination);
	    return getOriginalDestination.value;
	}
	/**
	 * Apply a single JSON Patch Operation on a JSON document.
	 * Returns the {newDocument, result} of the operation.
	 * It modifies the `document` and `operation` objects - it gets the values by reference.
	 * If you would like to avoid touching your values, clone them:
	 * `jsonpatch.applyOperation(document, jsonpatch._deepClone(operation))`.
	 *
	 * @param document The document to patch
	 * @param operation The operation to apply
	 * @param validateOperation `false` is without validation, `true` to use default jsonpatch's validation, or you can pass a `validateOperation` callback to be used for validation.
	 * @param mutateDocument Whether to mutate the original document or clone it before applying
	 * @param banPrototypeModifications Whether to ban modifications to `__proto__`, defaults to `true`.
	 * @return `{newDocument, result}` after the operation
	 */
	function applyOperation(document, operation, validateOperation, mutateDocument, banPrototypeModifications, index) {
	    if (validateOperation === void 0) { validateOperation = false; }
	    if (mutateDocument === void 0) { mutateDocument = true; }
	    if (banPrototypeModifications === void 0) { banPrototypeModifications = true; }
	    if (index === void 0) { index = 0; }
	    if (validateOperation) {
	        if (typeof validateOperation == 'function') {
	            validateOperation(operation, 0, document, operation.path);
	        }
	        else {
	            validator(operation, 0);
	        }
	    }
	    /* ROOT OPERATIONS */
	    if (operation.path === "") {
	        var returnValue = { newDocument: document };
	        if (operation.op === 'add') {
	            returnValue.newDocument = operation.value;
	            return returnValue;
	        }
	        else if (operation.op === 'replace') {
	            returnValue.newDocument = operation.value;
	            returnValue.removed = document; //document we removed
	            return returnValue;
	        }
	        else if (operation.op === 'move' || operation.op === 'copy') { // it's a move or copy to root
	            returnValue.newDocument = getValueByPointer(document, operation.from); // get the value by json-pointer in `from` field
	            if (operation.op === 'move') { // report removed item
	                returnValue.removed = document;
	            }
	            return returnValue;
	        }
	        else if (operation.op === 'test') {
	            returnValue.test = _areEquals(document, operation.value);
	            if (returnValue.test === false) {
	                throw new JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', index, operation, document);
	            }
	            returnValue.newDocument = document;
	            return returnValue;
	        }
	        else if (operation.op === 'remove') { // a remove on root
	            returnValue.removed = document;
	            returnValue.newDocument = null;
	            return returnValue;
	        }
	        else if (operation.op === '_get') {
	            operation.value = document;
	            return returnValue;
	        }
	        else { /* bad operation */
	            if (validateOperation) {
	                throw new JsonPatchError('Operation `op` property is not one of operations defined in RFC-6902', 'OPERATION_OP_INVALID', index, operation, document);
	            }
	            else {
	                return returnValue;
	            }
	        }
	    } /* END ROOT OPERATIONS */
	    else {
	        if (!mutateDocument) {
	            document = _deepClone(document);
	        }
	        var path = operation.path || "";
	        var keys = path.split('/');
	        var obj = document;
	        var t = 1; //skip empty element - http://jsperf.com/to-shift-or-not-to-shift
	        var len = keys.length;
	        var existingPathFragment = undefined;
	        var key = void 0;
	        var validateFunction = void 0;
	        if (typeof validateOperation == 'function') {
	            validateFunction = validateOperation;
	        }
	        else {
	            validateFunction = validator;
	        }
	        while (true) {
	            key = keys[t];
	            if (banPrototypeModifications && key == '__proto__') {
	                throw new TypeError('JSON-Patch: modifying `__proto__` prop is banned for security reasons, if this was on purpose, please set `banPrototypeModifications` flag false and pass it to this function. More info in fast-json-patch README');
	            }
	            if (validateOperation) {
	                if (existingPathFragment === undefined) {
	                    if (obj[key] === undefined) {
	                        existingPathFragment = keys.slice(0, t).join('/');
	                    }
	                    else if (t == len - 1) {
	                        existingPathFragment = operation.path;
	                    }
	                    if (existingPathFragment !== undefined) {
	                        validateFunction(operation, 0, document, existingPathFragment);
	                    }
	                }
	            }
	            t++;
	            if (Array.isArray(obj)) {
	                if (key === '-') {
	                    key = obj.length;
	                }
	                else {
	                    if (validateOperation && !isInteger(key)) {
	                        throw new JsonPatchError("Expected an unsigned base-10 integer value, making the new referenced value the array element with the zero-based index", "OPERATION_PATH_ILLEGAL_ARRAY_INDEX", index, operation, document);
	                    } // only parse key when it's an integer for `arr.prop` to work
	                    else if (isInteger(key)) {
	                        key = ~~key;
	                    }
	                }
	                if (t >= len) {
	                    if (validateOperation && operation.op === "add" && key > obj.length) {
	                        throw new JsonPatchError("The specified index MUST NOT be greater than the number of elements in the array", "OPERATION_VALUE_OUT_OF_BOUNDS", index, operation, document);
	                    }
	                    var returnValue = arrOps[operation.op].call(operation, obj, key, document); // Apply patch
	                    if (returnValue.test === false) {
	                        throw new JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', index, operation, document);
	                    }
	                    return returnValue;
	                }
	            }
	            else {
	                if (key && key.indexOf('~') != -1) {
	                    key = unescapePathComponent(key);
	                }
	                if (t >= len) {
	                    var returnValue = objOps[operation.op].call(operation, obj, key, document); // Apply patch
	                    if (returnValue.test === false) {
	                        throw new JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', index, operation, document);
	                    }
	                    return returnValue;
	                }
	            }
	            obj = obj[key];
	        }
	    }
	}
	/**
	 * Apply a full JSON Patch array on a JSON document.
	 * Returns the {newDocument, result} of the patch.
	 * It modifies the `document` object and `patch` - it gets the values by reference.
	 * If you would like to avoid touching your values, clone them:
	 * `jsonpatch.applyPatch(document, jsonpatch._deepClone(patch))`.
	 *
	 * @param document The document to patch
	 * @param patch The patch to apply
	 * @param validateOperation `false` is without validation, `true` to use default jsonpatch's validation, or you can pass a `validateOperation` callback to be used for validation.
	 * @param mutateDocument Whether to mutate the original document or clone it before applying
	 * @param banPrototypeModifications Whether to ban modifications to `__proto__`, defaults to `true`.
	 * @return An array of `{newDocument, result}` after the patch
	 */
	function applyPatch(document, patch, validateOperation, mutateDocument, banPrototypeModifications) {
	    if (mutateDocument === void 0) { mutateDocument = true; }
	    if (banPrototypeModifications === void 0) { banPrototypeModifications = true; }
	    if (validateOperation) {
	        if (!Array.isArray(patch)) {
	            throw new JsonPatchError('Patch sequence must be an array', 'SEQUENCE_NOT_AN_ARRAY');
	        }
	    }
	    if (!mutateDocument) {
	        document = _deepClone(document);
	    }
	    var results = new Array(patch.length);
	    for (var i = 0, length_1 = patch.length; i < length_1; i++) {
	        // we don't need to pass mutateDocument argument because if it was true, we already deep cloned the object, we'll just pass `true`
	        results[i] = applyOperation(document, patch[i], validateOperation, true, banPrototypeModifications, i);
	        document = results[i].newDocument; // in case root was replaced
	    }
	    results.newDocument = document;
	    return results;
	}
	/**
	 * Apply a single JSON Patch Operation on a JSON document.
	 * Returns the updated document.
	 * Suitable as a reducer.
	 *
	 * @param document The document to patch
	 * @param operation The operation to apply
	 * @return The updated document
	 */
	function applyReducer(document, operation, index) {
	    var operationResult = applyOperation(document, operation);
	    if (operationResult.test === false) { // failed test
	        throw new JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', index, operation, document);
	    }
	    return operationResult.newDocument;
	}
	/**
	 * Validates a single operation. Called from `jsonpatch.validate`. Throws `JsonPatchError` in case of an error.
	 * @param {object} operation - operation object (patch)
	 * @param {number} index - index of operation in the sequence
	 * @param {object} [document] - object where the operation is supposed to be applied
	 * @param {string} [existingPathFragment] - comes along with `document`
	 */
	function validator(operation, index, document, existingPathFragment) {
	    if (typeof operation !== 'object' || operation === null || Array.isArray(operation)) {
	        throw new JsonPatchError('Operation is not an object', 'OPERATION_NOT_AN_OBJECT', index, operation, document);
	    }
	    else if (!objOps[operation.op]) {
	        throw new JsonPatchError('Operation `op` property is not one of operations defined in RFC-6902', 'OPERATION_OP_INVALID', index, operation, document);
	    }
	    else if (typeof operation.path !== 'string') {
	        throw new JsonPatchError('Operation `path` property is not a string', 'OPERATION_PATH_INVALID', index, operation, document);
	    }
	    else if (operation.path.indexOf('/') !== 0 && operation.path.length > 0) {
	        // paths that aren't empty string should start with "/"
	        throw new JsonPatchError('Operation `path` property must start with "/"', 'OPERATION_PATH_INVALID', index, operation, document);
	    }
	    else if ((operation.op === 'move' || operation.op === 'copy') && typeof operation.from !== 'string') {
	        throw new JsonPatchError('Operation `from` property is not present (applicable in `move` and `copy` operations)', 'OPERATION_FROM_REQUIRED', index, operation, document);
	    }
	    else if ((operation.op === 'add' || operation.op === 'replace' || operation.op === 'test') && operation.value === undefined) {
	        throw new JsonPatchError('Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)', 'OPERATION_VALUE_REQUIRED', index, operation, document);
	    }
	    else if ((operation.op === 'add' || operation.op === 'replace' || operation.op === 'test') && hasUndefined(operation.value)) {
	        throw new JsonPatchError('Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)', 'OPERATION_VALUE_CANNOT_CONTAIN_UNDEFINED', index, operation, document);
	    }
	    else if (document) {
	        if (operation.op == "add") {
	            var pathLen = operation.path.split("/").length;
	            var existingPathLen = existingPathFragment.split("/").length;
	            if (pathLen !== existingPathLen + 1 && pathLen !== existingPathLen) {
	                throw new JsonPatchError('Cannot perform an `add` operation at the desired path', 'OPERATION_PATH_CANNOT_ADD', index, operation, document);
	            }
	        }
	        else if (operation.op === 'replace' || operation.op === 'remove' || operation.op === '_get') {
	            if (operation.path !== existingPathFragment) {
	                throw new JsonPatchError('Cannot perform the operation at a path that does not exist', 'OPERATION_PATH_UNRESOLVABLE', index, operation, document);
	            }
	        }
	        else if (operation.op === 'move' || operation.op === 'copy') {
	            var existingValue = { op: "_get", path: operation.from, value: undefined };
	            var error = validate([existingValue], document);
	            if (error && error.name === 'OPERATION_PATH_UNRESOLVABLE') {
	                throw new JsonPatchError('Cannot perform the operation from a path that does not exist', 'OPERATION_FROM_UNRESOLVABLE', index, operation, document);
	            }
	        }
	    }
	}
	/**
	 * Validates a sequence of operations. If `document` parameter is provided, the sequence is additionally validated against the object document.
	 * If error is encountered, returns a JsonPatchError object
	 * @param sequence
	 * @param document
	 * @returns {JsonPatchError|undefined}
	 */
	function validate(sequence, document, externalValidator) {
	    try {
	        if (!Array.isArray(sequence)) {
	            throw new JsonPatchError('Patch sequence must be an array', 'SEQUENCE_NOT_AN_ARRAY');
	        }
	        if (document) {
	            //clone document and sequence so that we can safely try applying operations
	            applyPatch(_deepClone(document), _deepClone(sequence), externalValidator || true);
	        }
	        else {
	            externalValidator = externalValidator || validator;
	            for (var i = 0; i < sequence.length; i++) {
	                externalValidator(sequence[i], i, document, undefined);
	            }
	        }
	    }
	    catch (e) {
	        if (e instanceof JsonPatchError) {
	            return e;
	        }
	        else {
	            throw e;
	        }
	    }
	}
	// based on https://github.com/epoberezkin/fast-deep-equal
	// MIT License
	// Copyright (c) 2017 Evgeny Poberezkin
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the "Software"), to deal
	// in the Software without restriction, including without limitation the rights
	// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	// copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	// The above copyright notice and this permission notice shall be included in all
	// copies or substantial portions of the Software.
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	// SOFTWARE.
	function _areEquals(a, b) {
	    if (a === b)
	        return true;
	    if (a && b && typeof a == 'object' && typeof b == 'object') {
	        var arrA = Array.isArray(a), arrB = Array.isArray(b), i, length, key;
	        if (arrA && arrB) {
	            length = a.length;
	            if (length != b.length)
	                return false;
	            for (i = length; i-- !== 0;)
	                if (!_areEquals(a[i], b[i]))
	                    return false;
	            return true;
	        }
	        if (arrA != arrB)
	            return false;
	        var keys = Object.keys(a);
	        length = keys.length;
	        if (length !== Object.keys(b).length)
	            return false;
	        for (i = length; i-- !== 0;)
	            if (!b.hasOwnProperty(keys[i]))
	                return false;
	        for (i = length; i-- !== 0;) {
	            key = keys[i];
	            if (!_areEquals(a[key], b[key]))
	                return false;
	        }
	        return true;
	    }
	    return a !== a && b !== b;
	}

	var core = /*#__PURE__*/Object.freeze({
		__proto__: null,
		JsonPatchError: JsonPatchError,
		deepClone: deepClone,
		getValueByPointer: getValueByPointer,
		applyOperation: applyOperation,
		applyPatch: applyPatch,
		applyReducer: applyReducer,
		validator: validator,
		validate: validate,
		_areEquals: _areEquals
	});

	/*!
	 * https://github.com/Starcounter-Jack/JSON-Patch
	 * (c) 2017 Joachim Wester
	 * MIT license
	 */
	var beforeDict = new WeakMap();
	var Mirror = /** @class */ (function () {
	    function Mirror(obj) {
	        this.observers = new Map();
	        this.obj = obj;
	    }
	    return Mirror;
	}());
	var ObserverInfo = /** @class */ (function () {
	    function ObserverInfo(callback, observer) {
	        this.callback = callback;
	        this.observer = observer;
	    }
	    return ObserverInfo;
	}());
	function getMirror(obj) {
	    return beforeDict.get(obj);
	}
	function getObserverFromMirror(mirror, callback) {
	    return mirror.observers.get(callback);
	}
	function removeObserverFromMirror(mirror, observer) {
	    mirror.observers.delete(observer.callback);
	}
	/**
	 * Detach an observer from an object
	 */
	function unobserve(root, observer) {
	    observer.unobserve();
	}
	/**
	 * Observes changes made to an object, which can then be retrieved using generate
	 */
	function observe(obj, callback) {
	    var patches = [];
	    var observer;
	    var mirror = getMirror(obj);
	    if (!mirror) {
	        mirror = new Mirror(obj);
	        beforeDict.set(obj, mirror);
	    }
	    else {
	        var observerInfo = getObserverFromMirror(mirror, callback);
	        observer = observerInfo && observerInfo.observer;
	    }
	    if (observer) {
	        return observer;
	    }
	    observer = {};
	    mirror.value = _deepClone(obj);
	    if (callback) {
	        observer.callback = callback;
	        observer.next = null;
	        var dirtyCheck = function () {
	            generate(observer);
	        };
	        var fastCheck = function () {
	            clearTimeout(observer.next);
	            observer.next = setTimeout(dirtyCheck);
	        };
	        if (typeof window !== 'undefined') { //not Node
	            window.addEventListener('mouseup', fastCheck);
	            window.addEventListener('keyup', fastCheck);
	            window.addEventListener('mousedown', fastCheck);
	            window.addEventListener('keydown', fastCheck);
	            window.addEventListener('change', fastCheck);
	        }
	    }
	    observer.patches = patches;
	    observer.object = obj;
	    observer.unobserve = function () {
	        generate(observer);
	        clearTimeout(observer.next);
	        removeObserverFromMirror(mirror, observer);
	        if (typeof window !== 'undefined') {
	            window.removeEventListener('mouseup', fastCheck);
	            window.removeEventListener('keyup', fastCheck);
	            window.removeEventListener('mousedown', fastCheck);
	            window.removeEventListener('keydown', fastCheck);
	            window.removeEventListener('change', fastCheck);
	        }
	    };
	    mirror.observers.set(callback, new ObserverInfo(callback, observer));
	    return observer;
	}
	/**
	 * Generate an array of patches from an observer
	 */
	function generate(observer, invertible) {
	    if (invertible === void 0) { invertible = false; }
	    var mirror = beforeDict.get(observer.object);
	    _generate(mirror.value, observer.object, observer.patches, "", invertible);
	    if (observer.patches.length) {
	        applyPatch(mirror.value, observer.patches);
	    }
	    var temp = observer.patches;
	    if (temp.length > 0) {
	        observer.patches = [];
	        if (observer.callback) {
	            observer.callback(temp);
	        }
	    }
	    return temp;
	}
	// Dirty check if obj is different from mirror, generate patches and update mirror
	function _generate(mirror, obj, patches, path, invertible) {
	    if (obj === mirror) {
	        return;
	    }
	    if (typeof obj.toJSON === "function") {
	        obj = obj.toJSON();
	    }
	    var newKeys = _objectKeys(obj);
	    var oldKeys = _objectKeys(mirror);
	    var deleted = false;
	    //if ever "move" operation is implemented here, make sure this test runs OK: "should not generate the same patch twice (move)"
	    for (var t = oldKeys.length - 1; t >= 0; t--) {
	        var key = oldKeys[t];
	        var oldVal = mirror[key];
	        if (hasOwnProperty(obj, key) && !(obj[key] === undefined && oldVal !== undefined && Array.isArray(obj) === false)) {
	            var newVal = obj[key];
	            if (typeof oldVal == "object" && oldVal != null && typeof newVal == "object" && newVal != null) {
	                _generate(oldVal, newVal, patches, path + "/" + escapePathComponent(key), invertible);
	            }
	            else {
	                if (oldVal !== newVal) {
	                    if (invertible) {
	                        patches.push({ op: "test", path: path + "/" + escapePathComponent(key), value: _deepClone(oldVal) });
	                    }
	                    patches.push({ op: "replace", path: path + "/" + escapePathComponent(key), value: _deepClone(newVal) });
	                }
	            }
	        }
	        else if (Array.isArray(mirror) === Array.isArray(obj)) {
	            if (invertible) {
	                patches.push({ op: "test", path: path + "/" + escapePathComponent(key), value: _deepClone(oldVal) });
	            }
	            patches.push({ op: "remove", path: path + "/" + escapePathComponent(key) });
	            deleted = true; // property has been deleted
	        }
	        else {
	            if (invertible) {
	                patches.push({ op: "test", path: path, value: mirror });
	            }
	            patches.push({ op: "replace", path: path, value: obj });
	        }
	    }
	    if (!deleted && newKeys.length == oldKeys.length) {
	        return;
	    }
	    for (var t = 0; t < newKeys.length; t++) {
	        var key = newKeys[t];
	        if (!hasOwnProperty(mirror, key) && obj[key] !== undefined) {
	            patches.push({ op: "add", path: path + "/" + escapePathComponent(key), value: _deepClone(obj[key]) });
	        }
	    }
	}
	/**
	 * Create an array of patches from the differences in two objects
	 */
	function compare(tree1, tree2, invertible) {
	    if (invertible === void 0) { invertible = false; }
	    var patches = [];
	    _generate(tree1, tree2, patches, '', invertible);
	    return patches;
	}

	var duplex = /*#__PURE__*/Object.freeze({
		__proto__: null,
		unobserve: unobserve,
		observe: observe,
		generate: generate,
		compare: compare
	});

	Object.assign({}, core, duplex, {
	    JsonPatchError: PatchError,
	    deepClone: _deepClone,
	    escapePathComponent,
	    unescapePathComponent
	});

	// DMT.JS
	// CONNECTION "PLUMBING"

	// THIS IS USED IN TWO SEPARATE CASES - always on the client side (a):
	// Connection always from a to b

	// DMT-GUI
	// (1a) - client is a browser WebSocket and it connects to:    (browser == true)  <--- FLAG, look in this file's code
	// (1b) - ws gui state endpoint (inside node.js dmt-process)

	// DMT-FIBER:
	// (2a) - client is a fiber client (inside node.js dmt-process) and connects to:       (browser == false)
	// (2b) - fiber ws server (inside node.js dmt-process)

	const browser = typeof window !== 'undefined';

	function establishAndMaintainConnection({ obj, endpoint, resumeNow }, { WebSocket, log }) {
	  if (resumeNow) {
	    // we could do without this and just wait for the next 1s check interval but this is faster and resumes connection immediately
	    checkConnection({ obj, endpoint }, { WebSocket, log, resumeNow });
	    return;
	  }

	  if (obj.connection) {
	    return;
	  }

	  const conn = {
	    send(data) {
	      if (obj.isConnected()) {
	        this.websocket.send(data);
	      } else {
	        //console.log.write(`Warning action "${action}" for store "${storeName}" was not sent because the store is not yet connected to the backend`);
	        log.write(`Warning: "${data}" was not sent because the store is not yet connected to the backend`);
	      }
	    },

	    close() {
	      this.closedManually = true;
	      this.websocket.onclose = () => {}; // disable onclose handler first

	      // the reason is to avoid this issue:
	      //// there could be problems here -- ?
	      // 1. we close the connection by calling connection.close on the connection store
	      // 2. we create a new connection which sets connected=true on our store
	      // 3. after that the previous connection actually closes and sets connected=false on our store (next line!)
	      // todo: solve if proven problematic... maybe it won't cause trouble because closeCallback will trigger immediatelly

	      obj.connectStatus(false);
	      this.websocket.close();
	    }
	  };

	  obj.connection = conn;
	  obj.connection.endpoint = endpoint; // only for logging purposes, not needed for functionality

	  tryReconnect({ obj, endpoint }, { WebSocket, log });

	  conn.checkTicker = 0; // gets reset to zero everytime anything comes out of the socket

	  // we check once per second, if process on the other side closed connection, we will detect this within one second
	  // if network went down, we will need maximum 10-12s to determine the other side is now disconnected
	  //
	  // Technical explanation:
	  //
	  // Sometimes the link between the server and the client can be interrupted in a way that keeps both the server and
	  // the client unaware of the broken state of the connection (e.g. when pulling the cord).
	  // In these cases ping messages can be used as a means to verify that the remote endpoint is still responsive.
	  //
	  const connectionCheckInterval = 1000;
	  const callback = () => {
	    if (!obj.connection.closedManually) {
	      checkConnection({ obj, endpoint }, { WebSocket, log });
	      setTimeout(callback, connectionCheckInterval);
	    }
	  };

	  setTimeout(callback, connectionCheckInterval); // we already tried to connect in the first call in this function, we continue after the set interval
	}

	// HELPER METHODS:

	// reconnectPaused =>
	// we still send pings, observe connected state and do everything,
	// the only thing we don't do is that we don't try to reconnect (create new WebSocket -> because this is resource intensive and it shows in browser log in red in console)
	function checkConnection({ obj, endpoint }, { WebSocket, log, resumeNow }) {
	  const conn = obj.connection;

	  const connected = socketConnected(conn);

	  if (connected) {
	    conn.websocket.send('ping');
	  } else if (!obj.reconnectPaused && (resumeNow || conn.checkTicker <= 30 || conn.checkTicker % 3 == 0)) {
	    // first 30s we try to reconnect every second, after that every 3s
	    tryReconnect({ obj, endpoint }, { WebSocket, log });
	  }

	  obj.connectStatus(connected);

	  conn.checkTicker += 1;
	}

	function tryReconnect({ obj, endpoint }, { WebSocket, log }) {
	  if (obj.connection.closedManually) {
	    return;
	  }

	  const conn = obj.connection;

	  //if (conn.websocket) {
	  // get rid of possible previous websocket hanging around and executing opencallback
	  //conn.websocket.close(); // we don't strictky need this because of double check in openCallback but it's nice to do so we don't get brief temporary connections on server (just to confuse us) ... previous ws can linger around and open:

	  // ACTUALLY IT DOESN'T HELP !!! WE STILL GET LINGERING CONNECTIONS (AT MOST ONE ACCORDING TO TESTS) --> THAT'S WHY WE MAKE SURE

	  //conn.websocket.terminate(); // NOT OK!!! we have to actually use .close() !!

	  // testground pid 26235 7/24/2019, 9:42:54 PM 6311ms (+25ms) ∞ OPEN CALLBACK !!!!!!!!! 1
	  // testground pid 26235 7/24/2019, 9:42:54 PM 6313ms (+02ms) ∞ websocket conn to ws://192.168.0.10:8888 open
	  // testground pid 26235 7/24/2019, 9:42:54 PM 6315ms (+02ms) ∞ FiberConnection received state: {
	  //   "connected": true
	  // }
	  // testground pid 26235 7/24/2019, 9:42:54 PM 6317ms (+02ms) ∞ ✓✓✓✓✓✓ CONNECTED
	  // testground pid 26235 7/24/2019, 9:42:54 PM 6542ms (+33ms) ∞ OPEN CALLBACK !!!!!!!!! 0  <---- previous lingering connection!!
	  //}

	  // we supposedly don't have to do anything with previous instance of WebSocket after repeatd reconnect retries
	  // it will get garbage collected (but it seems to slow everything down once we're past 100 unsuccessfull reconnects in a row)

	  // this line causes slowness after we keep disconnected on localhost and frontent keeps retrying
	  // after reconnect, connecting to nearby devices will be slow for some time
	  // we partially solved this by delaying retries longer (3s instead of 1s after first 30s of not being able to connect)
	  //
	  // when we are retrying connections to non-local endpoints, we pause retries after device drops from nearbyDevices list (implemented in multiConnectedStore::pauseActiveStoreIfDeviceNotNearby)
	  // for non-local endpoints on devices that we are connected to but not in foreground (selected device), we pause reconnects alltogether (multiConnectedStore::pauseDisconnectedStores)
	  const ws = new WebSocket(endpoint);

	  if (browser) {
	    ws.binaryType = 'arraybuffer';
	  }

	  if (!browser) {
	    // nodejs
	    ws.on('error', error => {
	      // do nothing, but we still need to catch this to not throw global exception (in nodejs)
	    });
	  }

	  const openCallback = m => {
	    //log.cyan(`OPEN CALLBACK !!!!!!!!! ${conn.checkTicker}`);

	    if (!obj.isConnected()) {
	      // double-checking... ws connection retries could apparently come back and later open MANY connections when backend is accessible
	      // this was a bug with 50-200 sudden connections after backend was offline for some little time.. this happened more on rpi than on laptop but it still happened
	      // check in: https://tools.ietf.org/html/rfc6455
	      log.write(`websocket conn to ${endpoint} open`);
	      //log.write('new websocket conn open');

	      conn.checkTicker = 0; // ADDED HERE LATER --- usually we don't need this in frontend because we keep sending state! but we better do the same there as well !! TODO±!!!!!

	      //log.write(`✓✓✓✓✓✓ CONNECTED`);

	      addSocketListeners({ ws, obj, openCallback }, { log });

	      conn.websocket = ws;

	      obj.connectStatus(true);

	      // if (obj.onFreshConnection) {
	      //   obj.onFreshConnection(); // fresh connection
	      // }
	    } else {
	      //log.write('new connection not needed');
	      ws.close();
	    }
	  };

	  if (browser) {
	    ws.addEventListener('open', openCallback);
	  } else {
	    ws.on('open', openCallback);
	  }
	}

	// ***************** PLUMBING *****************

	function addSocketListeners({ ws, obj, openCallback }, { log }) {
	  const conn = obj.connection;

	  const errorCallback = m => {
	    log.write(`websocket conn ${obj.connection.endpoint} error`);
	    log.write(m);
	  };

	  const closeCallback = m => {
	    obj.connectStatus(false); // detect broken connection in ui faster (next check is on checkConnection interval)
	    log.write(`websocket conn ${obj.connection.endpoint} closed`);
	  };

	  const messageCallback = _msg => {
	    conn.checkTicker = 0;

	    const msg = browser ? _msg.data : _msg;

	    // only instance of data that is not either binary or json  (it is simply a string)
	    if (msg == 'pong') {
	      // we don't do anything here, it was enough that we have set the checkTicker to zero
	      return;
	    }

	    let jsonData;

	    try {
	      jsonData = JSON.parse(msg);
	    } catch (e) {}

	    if (jsonData) {
	      obj.wireReceive({ jsonData });
	    } else {
	      obj.wireReceive({ binaryData: msg });
	    }
	  };

	  if (browser) {
	    ws.addEventListener('error', errorCallback);
	    ws.addEventListener('close', closeCallback);
	    ws.addEventListener('message', messageCallback);
	  } else {
	    ws.on('error', errorCallback);
	    ws.on('close', closeCallback);
	    ws.on('message', messageCallback);
	  }

	  // separate interval handler to purge stale sockets, because we couldn't detach the handlers from checkConnection function....
	  // only here because we set them here ....
	  const staleSocketCheckInterval = 1 * 1000;
	  const purgeSocketIfStale = () => {
	    if (!socketConnected(conn)) {
	      //log.write(`socket not connected anymore ticker: ${conn.checkTicker}, socket state: ${conn.websocket.readyState}`);
	      // removing these listeners is probably not needed -- test later
	      // ws.removeEventListener('open', openCallback);
	      // ws.removeEventListener('error', errorCallback);
	      // ws.removeEventListener('close', closeCallback);
	      // ws.removeEventListener('message', messageCallback);
	      ws.close(); // added later - test
	    } else {
	      setTimeout(purgeSocketIfStale, staleSocketCheckInterval);
	    }
	  };
	  setTimeout(purgeSocketIfStale, staleSocketCheckInterval);
	}

	function socketConnected(conn) {
	  const STATE_OPEN = 1;

	  // we allow 12 seconds without message receive from the server side until we determine connection is broken
	  // this double negation is needed because otherwise (in node but not in browse!)
	  // we get "undefined" returned in case there is no conn.websocket object yet
	  // we actually need false so that set({connected}) actually works! if undefined this doesn't set any key.. bla bla bla, unimportant trickery
	  return !!(conn.websocket && conn.checkTicker <= 12 && conn.websocket.readyState == STATE_OPEN);
	}

	// DMT.JS

	const { log: log$1 } = util;

	function establishAndMaintainConnection$1({ obj, endpoint, resumeNow }) {
	  establishAndMaintainConnection({ obj, endpoint, resumeNow }, { WebSocket, log: log$1 }); // WebSocket comes from browser context
	}

	// DMT.JS
	// PERIODIC INTERVAL ON FRONTEND

	function interval({ store, endpoint }) {
	  if (store.dmtInterval) {
	    return;
	  }

	  store.dmtInterval = 500;

	  //console.log('SETTING UP A INTERVAL');

	  //store.compute('guiNotifications', ['notifications', 'frontTicker'], (notifications, frontTicker) => computeGuiNotifications(notifications));

	  const callback = () => {
	    intervalHandler(store);
	    setTimeout(callback, store.dmtInterval);
	  };
	  //setTimeout(callback, store.dmtInterval);
	  callback(); // CHANGED RECENTLY SO THAT localBrowserTime is present immediately! -- useful for serverMode... investigate if ticker causes some other issues because it starts immediately?
	}

	// HELPER METHODS:

	let frontTicker = 0;

	function intervalHandler(store) {
	  const d = new Date();
	  const time = `${d.getHours()}:${('0' + d.getMinutes()).slice(-2)}`;

	  store.tick({ frontTicker, localBrowserTime: time });

	  frontTicker += 1;
	}

	//import { diffApply, jsonPatchPathConverter } from '../../jsonDiffApplyTweaked';

	function constructAction({ action, storeName, payload }) {
	  const data = {
	    action,
	    storeName,
	    payload
	  };

	  return JSON.stringify(data);
	}

	// intermmediate class to hold the underlying connection state and to illustrate nicely how store connections work

	class StoreConnection {
	  constructor(componentStore, { ip } = {}) {
	    const endpoint = `ws://${ip || window.location.hostname}:7780`; // cool port!
	    this.endpoint = endpoint;

	    this.store = componentStore;
	    establishAndMaintainConnection$1({ obj: this, endpoint }); // will create this.connection =
	    // {
	    //   websocket :: WS,
	    //   checkTicker :: int,
	    //   send(data) :: function
	    // }

	    // periodic handler on frontend - every 0.5s
	    if (!ip) {
	      interval({ store: this.store });
	    }
	  }

	  // called from component store

	  send({ action, storeName, payload }) {
	    const data = constructAction({ action, storeName, payload });
	    this.connection.send(data);
	  }

	  pauseReconnect() {
	    const alreadyPaused = this.reconnectPaused;
	    this.reconnectPaused = true; // connection will notice and destroy itself

	    return !alreadyPaused;
	  }

	  resumeReconnect() {
	    this.reconnectPaused = false; // connection will notice and destroy itself
	    establishAndMaintainConnection$1({ obj: this, endpoint: this.endpoint, resumeNow: true }); // this is just to trigger reconnect immeditely instead of waiting for next 1s interval which would notice reconnectPaused=false on this object
	  }

	  // ----------------------------------------------------
	  // these are only called from connect functions (could also be implemented with events)
	  //

	  // connection status (used to show big red X for example)

	  justReconnected() {
	    //console.log('JUST RECONNECTED');
	    // we're connected locally to our own device (we're not "roaming")
	    if (!this.store.ip) {
	      this.send({ action: 'local_ws', storeName: 'connection' });
	    }
	  }

	  connectStatus(connected) {
	    const justReconnected = connected && !this.isConnected();

	    this.store.set({ connected });

	    if (justReconnected) {
	      this.justReconnected();
	    }
	  }

	  isConnected() {
	    return this.store.get().connected;
	  }

	  // when something is received over our (websocket) connection
	  wireReceive({ jsonData }) {
	    // have to check because wireReceive can also be called with { binaryData } !
	    if (!jsonData) {
	      return;
	    }

	    // TODO:
	    // we could trim playlist or any other such data and keep only the part that is needed to show on the GUI
	    // this would then finally solve all the slowness with long playlists ...
	    // no we already avoid this but still on every show or store switch the entire playlist has to be iterated and put into gui elements
	    // DO ONLY THE VISIBLE PART OF THE PLAYLIST !!!

	    if (jsonData.state) {
	      // when full new state comes over the wire
	      this.dmtProgramState = jsonData.state;
	      this.store.set(this.dmtProgramState); // set state on the component this connection is part of
	    } else if (jsonData.diff) {
	      //console.log(jsonData.diff);
	      //const start = Date.now();
	      applyPatch(this.dmtProgramState, jsonData.diff);
	      //diffApply(this.dmtProgramState, jsonData.diff, jsonPatchPathConverter);
	      // const duration = Date.now() - start;
	      // console.log(`Diff apply time: ${duration}`);

	      //console.log(jsonData.diff);

	      this.store.set(this.dmtProgramState);
	    } else if (jsonData.integrations) {
	      // will always be our store for this device! because this will come as a response to the action "local_ws::connection" we send inside justReconnected() see above
	      this.store.set({ integrations: jsonData.integrations });
	    } else if (jsonData.type == 'search_results') {
	      this.store.multiConnectedStoreRef.currentStore().set({ searchResults: jsonData.aggregateResults });
	      //this.store.set({ searchResults: jsonData.aggregateResults });
	    } else if (jsonData.storeName) {
	      this.reverseAction(jsonData); // gui::reload etc...
	    } else {
	      console.log(`Unknown wire message format: ${JSON.stringify(jsonData, null, 2)}`);
	    }
	  }

	  // when we receive action from backend to frontend
	  reverseAction(data) {
	    // ConnectedStore without ip is our local devices store
	    if (data.storeName == 'gui' && !this.store.ip) {
	      // we only process actions from local backend (= "this device") although by design we also receive all the others since we're connected to other devices' gui ws endpoint as "one of the GUIs"

	      // action request from backend! for example: { store: frontend, action: reload }
	      if (data.action) {
	        this.store.multiConnectedStoreRef.fire('gui_action', { action: data.action, payload: data.payload });
	        //obj.fireMulti('gui_action', { action: data.action, payload: data.payload });
	      }
	    }
	  }
	}

	function computeGuiNotifications(notifications) {
	  const now = Date.now();
	  return notifications
	    ? notifications
	        .filter(n => now < n.expireAt)
	        .map(n => {
	          return Object.assign(n, { relativeTimeAdded: util.humanTime(util.msIntoTimeSpan(now - n.addedAt)) });
	        })
	    : notifications;
	}

	class ConnectedStore extends Store {
	  constructor(data = {}, { ip = null, multiConnectedStoreRef = null } = {}) {
	    super(data);
	    //this.loading = true;
	    this.ip = ip;
	    this.multiConnectedStoreRef = multiConnectedStoreRef;

	    // store connection does two things:
	    // 1. automatically populates the component state as it is sent over the wire (will call this.set(...) on this instance on each data receive)
	    // 2. sends actions down the wire (this.storeConnection.send(...))
	    this.storeConnection = new StoreConnection(this, { ip });

	    if (multiConnectedStoreRef) {
	      // svelteGlobal store is set on Store0 (local store) when using MultiConnectedStore composed of ConnectedStores
	      multiConnectedStoreRef.compute('guiNotifications', ['notifications', 'frontTicker'], (notifications, frontTicker) =>
	        computeGuiNotifications(notifications)
	      );
	    } else if (!ip) {
	      // this will be true if we use ConnectedStore directly ! (before Multi-connected stores were implemented)
	      this.compute('guiNotifications', ['notifications', 'frontTicker'], (notifications, frontTicker) => computeGuiNotifications(notifications));
	    }
	  }

	  action({ action, storeName, payload }) {
	    this.storeConnection.send({ action, storeName, payload });
	  }

	  entangle(component) {
	    // do nothing, we only implement this in MultiConnectedStore
	  }

	  pauseReconnect() {
	    return this.storeConnection.pauseReconnect();
	  }

	  resumeReconnect() {
	    this.storeConnection.resumeReconnect();
	  }

	  tick({ frontTicker, localBrowserTime }) {
	    if (!this.multiConnectedStoreRef) {
	      this.set({ frontTicker, localBrowserTime });
	    } else {
	      this.multiConnectedStoreRef.set({ frontTicker, localBrowserTime });
	    }
	  }
	}

	function transferComponentState({ component, deviceState, globalStore, nearbyDevices, changed }) {
	  // TODO::: optimize and consider "changed" information

	  // const componentState = {};

	  // if (deviceState.controller) {
	  //   componentState.timeDate = deviceState.controller;
	  //   componentState.weather = deviceState.controller.weather;
	  // }

	  // component.set(componentState);

	  if (deviceState.meta && deviceState.meta.thisDeviceId) {
	    const { thisDeviceId, selectedDeviceId } = deviceState.meta;

	    const componentState = {};

	    if (!component.get().thisDeviceId) {
	      componentState.thisDeviceId = thisDeviceId;
	    }

	    componentState.selectedDeviceId = selectedDeviceId;

	    componentState.homebase = selectedDeviceId == thisDeviceId;

	    componentState.nearbyDevices = nearbyDevices;

	    // *****

	    //this.transferComponentState(component); // maybe not optimal to do on each state change!

	    componentState.wallpapers = [];

	    let viewDef = {};

	    if (deviceState.gui && deviceState.gui.views) {
	      const { views } = deviceState.gui;
	      viewDef = views[globalStore.get().view] || {};

	      // prepare wallpaper array (used only for prefetching all the wallpapers as soon as possible)

	      const wallpapers = [];

	      for (const [viewName, view] of Object.entries(views)) {
	        if (view.wallpaper) {
	          wallpapers.push(view.wallpaper);
	        }
	      }

	      componentState.wallpapers = wallpapers;
	    }

	    if (viewDef) {
	      // we do it through global store that saves previous value of wallpaper and calls util.setWallpaper only if new value is different
	      // this is just in case browser would not be able to optimize constant setting of the same wallpaper in css
	      globalStore.setWallpaper(viewDef.wallpaper);
	      //util.setWallpaper(viewDef.wallpaper);
	    }

	    componentState.viewDef = viewDef;

	    if (deviceState.controller) {
	      componentState.timeDate = deviceState.controller;
	      componentState.weather = deviceState.controller.weather;
	      componentState.isDevMachine = deviceState.controller.devMachine;
	      componentState.isDevCluster = deviceState.controller.devCluster;

	      componentState.getParams = globalStore.get().getParams; // also listed in interComponent....

	      // if we're actually on the touch screen on Raspberry Pi
	      componentState.atRPi = deviceState.controller.isRPi && window.location.hostname == 'localhost';
	      componentState.isRPi = deviceState.controller.isRPi;

	      if (deviceState.controller.demoDevice && deviceState.controller.demoDevice.date) {
	        const demoDate = new Date(deviceState.controller.demoDevice.date);
	        componentState._demoTime = util.getDisplayTime(demoDate);
	      }

	      componentState.loaded = true;
	      //console.log('done loading');
	    }

	    // *****

	    if (!component.defRead) {
	      // cached information, we save it on the component in question so that requested device definitions are read only once per component lifecycle and then just compared on each state change
	      //const defRef = 'service[gui].nearby';
	      const defRef = 'service[gui]';
	      const deviceDef = deviceState.deviceDefinition;

	      if (deviceDef) {
	        component.defFragments = __getDefinition({ defRef, deviceState });
	        component.defRead = true; // we cannot just check whether component.defFragments is true because it can also be empty
	      }
	    }

	    if (component.defFragments) {
	      const defGui = component.defFragments;

	      if (defGui.idleView) {
	        globalStore.set({ idleView: defGui.idleView });
	      }

	      const defGuiNearby = defGui.nearby || {};

	      if (defGuiNearby.homebase) {
	        const homebaseName = defGuiNearby.homebase.slice(1); // # remove @ symbol
	        componentState.homebaseName = homebaseName;
	        componentState.homebase = (defGuiNearby.homebase && selectedDeviceId == homebaseName) || (!defGuiNearby.homebase && selectedDeviceId == thisDeviceId);
	      }

	      if (defGuiNearby.disableDeviceSelector == 'true') {
	        componentState.disableDeviceSelector = true;
	      }
	    }

	    component.set(componentState);
	  }
	}

	// read deviceDef which is a part of the device state and access the property requested by defRef (simple .def accessor syntax similar to xpath)
	function __getDefinition({ defRef, deviceState }) {
	  const definition = util.accessProperty(deviceState.deviceDefinition, defRef);

	  if (definition) {
	    const obj = {};
	    for (const key of Object.keys(definition)) {
	      if (definition[key] && definition[key] != 'false') {
	        obj[key] = definition[key];
	      }
	    }

	    return obj;
	  }
	}

	var componentBridge = { transferComponentState };

	const { log: log$2, dir: dir$1 } = util;

	// HELPER METHODS:

	function reloadView(view, ip, deviceId) {
	  log$2('RECEIVED GUI RELOAD REQUEST. HANG TIGHT. BE RIGHT BACK.');
	  if (view) {
	    let ipStr = '';
	    if (ip) {
	      ipStr = `?ip=${ip}`;
	      if (deviceId) {
	        ipStr += `&deviceId=${deviceId}`;
	      }
	    }
	    window.location.href = `http://${window.location.hostname}:${window.location.port}/${view}${ipStr}`;
	  } else {
	    location.reload(true); // browser object -- location.reload(forceGet)
	  }
	}

	class MultiConnectedStore extends Store {
	  constructor(data = {}) {
	    super(); // our Base store will hold reflected data of all encapsulated stores

	    // additional information describing the currently loaded state inside this::Store (svelte, dmt)
	    // gets copied into super.set({meta:...}) inside stateChangedHandler
	    this.meta = {
	      activeStoreId: 0,
	      thisDeviceId: null,
	      defaultStoreData: data
	    };

	    this.debug = {};

	    // -----IDLE-------
	    this.guiIdleSeconds = 0;

	    // revert to home screen after 60-90s of inactivity (undeterministic, depending of exact timer situation in each case)
	    const guiIdleBump = () => {
	      const { idleView } = this.get();
	      // idleView: undefined | "home" | "gallery" etc.

	      if (idleView) {
	        this.guiIdleSeconds += 30; //

	        if (this.guiIdleSeconds > 60) {
	          if (window.location.pathname.replace(/\//g, '') != idleView) {
	            // GUI WAS IDLE FOR 60s AT THIS POINT:
	            this.switchView(idleView);
	          }
	        }

	        setTimeout(guiIdleBump, 30000);
	      }
	    };

	    setTimeout(guiIdleBump, 1000); // delay, so that idleView has time to be set up (view componentBridge)

	    // ------------

	    this.thisDeviceState = {};
	    this.nearbyDevices = {};

	    this.on('gui_action', ({ action, payload }) => this.processActionOriginatingFromBackendOnThisDevice({ action, payload }));

	    // this is an object property but will be copied to store data in changeHandler
	    // we have two such properties: activeStoreId and thisDeviceId
	    this.stores = [new ConnectedStore(data, { multiConnectedStoreRef: this })];
	    // new stores are added in append-only fashion each time we first connect to some device gui endpoint
	    // if store doesn't have an ip, it's the localhost store

	    this.pauseDisconnectedStores();

	    // setup this devicestore
	    this.stores.forEach((store, index) => {
	      store.on('state', ({ current, changed, previous }) => {
	        // console.log(previous);
	        // console.log('------');
	        // console.log(current);
	        // console.log('');
	        // console.log('>>>>>>>>>>');

	        // THIS DEVICE STORE --- a bit special
	        if (index == 0) {
	          this.thisDeviceState = current; // no need to clone the state here because svelte already does the right thing... might not be the case with other frameworks ? If something doesn't work, make sure to clone the state here

	          const state = { thisDeviceState: this.thisDeviceState };

	          if (changed.nearbyDevices) {
	            this.nearbyDevices = JSON.parse(JSON.stringify(this.filterNearbyDevices(current.nearbyDevices)));
	            state.nearbyDevices = this.nearbyDevices;
	          }

	          delete this.thisDeviceState.nearbyDevices;

	          //this.filterNearbyDevices(this.thisDeviceState.nearbyDevices);

	          // if current store (which is not our default local store (not on index=0))
	          // is currently disconnected, it won't ever execute stateChangeHandler
	          // and it thus won't set the new thisDeviceState (which most importantly incldes nearbyDevices)
	          // so we set this separately here
	          // if (this.meta.activeStoreId != 0) {
	          //   console.log('SET');
	          super.set(state);
	          //}

	          //this.thisDeviceState.thisDeviceState = null; //prevent cyclic referenes from previous pointer to thisDeviceState

	          // we cache and save deviceId returned from locally connected backend store with id (==index) equal to 0
	          // (this store is same as all the other stores except that it is connected to localhost:7780 via ws as oppoised to:
	          // some_lan_ip:7780)
	          if (current.controller) {
	            const deviceId = current.controller.deviceName;
	            if (deviceId) {
	              // this is an object property (like activeStoreId) but will be copied to store data in changeHandler
	              this.meta.thisDeviceId = deviceId;
	            }
	          }
	        }

	        this.stateChangeHandler({ state: current, storeId: index, stateDiff: changed });
	      });
	    });
	  }

	  switchView(view) {
	    this.set({ view });
	    history.pushState({ view }, view, `/${view}`);
	    // if (ip) {
	    //   history.pushState({ view }, view, `/${view}?ip=${ip}`);
	    // } else {
	    //   history.pushState({ view }, view, `/${view}`);
	    // }
	  }

	  pauseDisconnectedStores() {
	    // next step: pause background stores after some idle time (not active for 10m ?)
	    // maybe this improvement is enough already but test!

	    this.stores.forEach((store, storeId) => {
	      const { connected } = store.get();

	      if (store.ip && !connected) {
	        // store.ip ==> local store doesn't have ip
	        // pause background connection retries
	        if (this.meta.activeStoreId != storeId) {
	          if (store.pauseReconnect()) {
	            console.log(`Paused store ${storeId} reconnection because it was in background and disconnected, ip: ${store.ip}`);
	          }
	        } else {
	          // active (= foreground, current) store but NOT localhost
	          // we pause reconnect if we notice that the device is not in nearbyDevices list
	          this.pauseActiveStoreIfDeviceNotNearby(store);
	        } // else ... for reconnects to localhost in foreground we cannot do anything except increase reconnect delay after 30s (from 1s to 3s, see comments in connect.js)
	      }
	    });

	    setTimeout(() => {
	      this.pauseDisconnectedStores();
	    }, 3000);
	  }

	  filterNearbyDevices(nearbyDevices) {
	    if (nearbyDevices) {
	      const filteredNearbyDevices = {};

	      // filter out devices without gui
	      for (const deviceName of Object.keys(nearbyDevices)) {
	        if (nearbyDevices[deviceName].hasGui) {
	          filteredNearbyDevices[deviceName] = nearbyDevices[deviceName];
	        }
	      }

	      return filteredNearbyDevices;
	    }
	    //this.nearbyDevices = {};
	  }

	  // if active store (excluding localhost!) is disconnected, we keep retrying until device is in the nearbyDevices list.
	  // when it disappears we pause retrying until it reappears
	  //
	  // this is unsolveable in this way for LOCALHOST (this device) store connection
	  // all we can do here is to retry slowly after some time (implemented in connect.js):
	  // after 30s of not connecting, we increase the delay between retries from 1s to 3s
	  //
	  //
	  pauseActiveStoreIfDeviceNotNearby(store) {
	    for (const deviceId of Object.keys(this.nearbyDevices)) {
	      const device = this.nearbyDevices[deviceId];
	      if (device.ip == store.ip) {
	        //console.log(`Resumed store ${storeId} reconnection (ip ${store.ip})`);
	        // this will go back and forth, it will immediately resume after pausing while the device
	        // still hangs around in nearbyDevices list ... which accidentally serves our purpose ... we want a couple
	        // of hard retries (faster reconnects) in case the process is just quickly restarting on the device

	        // otherwise if device is dropped from nearby devices, it will take longer to detect it's back
	        // it has to appear in our nearbyDevices list and then this handler has to run (every 3s)
	        store.resumeReconnect();
	      } else {
	        store.pauseReconnect();
	        // if () {
	        //   console.log(`Paused store ${storeId} reconnection because ip ${store.ip} has not been seen in nearbyDevices`);
	        // }
	      }
	    }
	  }

	  // this is one of the most important methods on the store
	  // it is responsible for reflecting the state of each connected store into our "imitation store"
	  stateChangeHandler({ state, storeId, stateDiff }) {
	    if (this.meta.activeStoreId == storeId) {
	      state.stateChangeCounter = state.stateChangeCounter || 0;
	      state.stateChangeCounter += 1;
	      state.stateChangeCounter %= 1000;

	      const completeState = Object.assign(state, { meta: this.meta });
	      //const completeState = Object.assign(state, { meta: this.meta, thisDeviceState: this.thisDeviceState });

	      // further research: understand how we get state, obviously it's possible to get partial state here...
	      // probably has to do with notifications... in any case for our purposes we detect the full state by
	      // presence of "controller" key...

	      if (state.controller && state.controller.deviceName) {
	        completeState.meta.selectedDeviceId = state.controller.deviceName;
	      }

	      super.set(completeState); // state enhanced with meta info

	      // UGLY and also probably not all that is needed, we want to somehow
	      // delete all properties from the previous state (this.get())
	      // that are not also in new state ... this was happening when switching from tv to "testground" for example
	      // (which doesn't have player or playlist in state
	      // not sure how to do this better (eg. remove all)

	      // also remembered something, todo: if player is inside state and we disable it in .def then restart the process
	      // should get removed from state!
	      //
	      //  ---------->>>>>>>>>>>> HACK

	      if (state.player == null) {
	        super.set({ player: null });
	      }
	      if (state.playlist == null) {
	        super.set({ playlist: null });
	      }
	      if (state.playlistMetadata == null) {
	        super.set({ playlistMetadata: null });
	      }
	      if (state.sysinfo == null) {
	        super.set({ sysinfo: null });
	      }
	      if (state.searchResults == null) {
	        super.set({ searchResults: null });
	      }
	    } else if (storeId == 0 && stateDiff.notifications) {
	      super.set({ notifications: state.notifications });
	    }
	  }

	  currentStore() {
	    return this.stores[this.meta.activeStoreId];
	  }

	  // we already have this as selectedDeviceId via entangle()
	  // currentStoreId() {
	  //   return this.meta.activeStoreId;
	  // }

	  switch({ ip = null, deviceId = null } = {}) {
	    this.lastDeviceIp = this.currentStore().ip;

	    // deviceId is only for "minor" use case: pre-fill device name in case we cannot connect (at all - we have never received state with controller.deviceName from this device)
	    if (ip) {
	      //console.log(`Requested change to the store with IP=${ip}`);

	      let matchingStoreId;

	      this.stores.forEach((store, index) => {
	        if (store.ip == ip) {
	          matchingStoreId = index;
	        }
	      });

	      if (matchingStoreId) {
	        this.meta.activeStoreId = matchingStoreId;

	        this.stores[matchingStoreId].resumeReconnect();
	      } else {
	        const newStoreId = this.stores.length;

	        const newStore = new ConnectedStore(this.meta.defaultStoreData, { multiConnectedStoreRef: this, ip });

	        newStore.on('state', ({ current, changed, previous }) => {
	          delete current.notifications; // not interested in remote notifications -- we don't show or use them
	          // we make sure that in our Svelte Global Store (and thus GUI) there are only this device notifications...
	          delete current.nearbyDevices; // also not interested in other devices "nearbyDevices list"

	          this.stateChangeHandler({ state: current, storeId: newStoreId, stateDiff: changed });
	        });

	        this.stores.push(newStore);
	        this.meta.activeStoreId = newStoreId;

	        //const nearbyDevices = this.nearbyDevices();

	        // for (const deviceId of Object.keys(nearbyDevices)) {
	        //   const device = nearbyDevices[deviceId];
	        //   if (device.ip == ip) {
	        //   }
	        // }
	      }

	      // pre-fill device name in case we cannot connect to device at all
	      // PROBABLY BUGGY / NOT RELIABLE, noticed two issues since this code was in production:
	      // UPDATE2: something else was the reason for this failure I think...
	      // we test this function again, because of updates which reconnect to the other store immediately
	      // after swithcing to new device "disconnected X" briefly flashed - a sign of some issue with connections
	      // the next day the broken X *didn't appear* when the process was disconnected on device
	      if (deviceId) {
	        this.meta.selectedDeviceId = deviceId;
	        super.set({ controller: { deviceName: deviceId }, meta: { selectedDeviceId: deviceId } });
	      }
	    } else {
	      //console.log('Requested change back to default localhost store');
	      this.meta.activeStoreId = 0;
	    }

	    setTimeout(() => {
	      const current = this.currentStore().get();

	      // not full state is yet here on freshly added store!
	      // solution and requirement: the same method will be called upon full state (and each state change) as seen a few lines
	      // above where this.stateChangeHandler is also called inside a handled state change on the new store
	      this.stateChangeHandler({ state: current, storeId: this.meta.activeStoreId });

	      this.fire('update'); // Svelte likes this
	    }, 10); // TODO: experiment with this value.... 10 milliseconds! 0 also seems to work ;) but there needs to be a separate event callback using setTimeout
	    // not sure if state will still be missing initially over slower links? But even if there is, there is always a frontendTicker event twice per second on every gui ... not sure STILL if this propagates over to other devices? NEED TO MAKE A EVENTFLOW framework ASAP
	    // MAYBE TRY WITH: setImmediate or nextTick (https://stackoverflow.com/a/44275063)
	    // https://flaviocopes.com/node-setimmediate/

	    console.log(`Underlying connected store switched to storeId = ${this.meta.activeStoreId}`);

	    // great that this works! usually we would have to reflect the initial state of the newly added store into our Fake Store manually
	    // we'd need an event from the new store that the first push of state happened, then we'd just use super.set() to set the passed-in-state
	  }

	  switchToggle() {
	    //const currentIp = this.currentStore().ip;

	    //if (this.lastDeviceIp) {
	    // deviceId we're not passing alongside might cause cosmetic issues on GUI when connection is lost (deviceId missing)... could be fixed (todo)
	    this.switch({ ip: this.lastDeviceIp });

	    // } else {

	    // }
	  }

	  // we only overload setter, getter we leave as it is!
	  set(...args) {
	    //console.log('STORE SETTER CALLED');
	    super.set(...args);

	    const state = args[0];

	    if (this.meta.storeId > 0) {
	      // BLINKFIX ! :) Infinite cycle of setting and reacting to state... this was a "weird" and hard bug
	      this.currentStore().set(...args);
	    }
	  }

	  // we don't need this! only for logging purposes
	  // get(...args) {
	  //   //console.log('STORE GETTER CALLED');
	  //   return super.get(...args);
	  // }

	  processActionOriginatingFromBackendOnThisDevice({ action, payload }) {
	    // action request from backend! for example: { store: frontend, action: reload }
	    if (action.startsWith('reload')) {
	      const view = payload; //action.split(':')[1];

	      if (view) {
	        const { gui } = this.thisDeviceState;
	        if (!gui || !gui.views || !Object.keys(gui.views).find(v => v == view)) {
	          console.log(`unknown view: ${view}, cannot show/reload it!`);
	          return;
	        }
	      }

	      const currentStore = this.currentStore();

	      let deviceName;
	      const { controller } = currentStore.get();
	      if (controller) {
	        // not sure when this happens... but it was a notice once on TV (cannot read property deviceName of undefined)
	        // so we check if controller was present in currentStore....
	        deviceName = controller.deviceName;
	      }

	      reloadView(view || this.get().view, currentStore.ip, deviceName); // if view is null (we only passed on "reload", then it will reload home)
	      // we cannot do that here!! :: has to be actual reload!! not sure how to switch back to correct store!! maybe save info!!
	      //this.set({ view }); // keeps current store ... reloadView resets everyting and connects to localhost!
	    }

	    if (action.startsWith('switch')) {
	      const ip = payload; // action.split(':')[1];
	      this.switch({ ip }); // if ip is null (we only passed on "reload", then it will switch to this device)
	    }
	  }

	  // called on every click anywhere in the app (set up in App.html -> document on:click)
	  guiEngaged() {
	    this.guiIdleSeconds = 0;
	  }

	  setWallpaper(wallpaper) {
	    if (this.get().currentWallpaper != wallpaper) {
	      this.set({ currentWallpaper: wallpaper });
	      util.setWallpaper(wallpaper);
	    }
	  }

	  // send user actions from frontend (clicks, options etc...) to the appropriate backend (on local or currently tunneled device) via websocket
	  action({ action, storeName, payload }) {
	    this.currentStore().action({ action, storeName, payload });
	  }

	  // Reflect part of device state into frontent component state (like a Svelte component)
	  // all a component needs to do is this (example for Svelte):

	  // oncreate() {
	  //   // adds thisDeviceId and selectedDeviceId to the component store
	  //   this.store.entangle(this);
	  // },

	  // Also reflect part of the definition as defined by definition selector (reference -- similar to xpath):

	  // oncreate() {
	  //   // adds thisDeviceId and selectedDeviceId to the component store
	  //   // also adds specific fields from device definition --- (.def property access similar to xpath)
	  //   this.store.entangle(this, { def: 'service[gui].nearby' });
	  // }
	  entangle(component) {
	    //component.set({ def: {} }); // INIT !! so templates can always safely use def.anything !

	    const state = () => {
	      return { component, deviceState: this.thisDeviceState, nearbyDevices: this.nearbyDevices, globalStore: this };
	    };

	    componentBridge.transferComponentState(state());

	    const listener = this.on('state', ({ current, changed, previous }) => componentBridge.transferComponentState(Object.assign(state(), { changed })));

	    component.on('destroy', listener.cancel);
	  }
	}

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/navigation/src/ActionBar.html generated by Svelte v2.16.1 */



	var methods$2 = {
	  handleKeypress(event) {
	    if(util.isInputElementActive()) {
	      return
	    }

	    if(event.key && !event.altKey && !event.metaKey && !event.shiftKey) {
	      if(event.key == 'Escape' || event.key == 'h') {
	        this.select('home');
	      }
	      if(event.keyCode == 9) {
	        event.preventDefault();
	        this.store.switchToggle();
	      }
	      if(event.key == 't') {
	        this.store.switch();
	      }
	      if(event.key == 'f') {
	        console.log("implement device filter / find (in nearby list or just in the middle of screen)!!");
	      }
	      if(event.key == 'p') {
	        this.select('player');
	      }
	      if(event.key == 'o') {
	        this.select('clock');
	      }
	      if(event.key == 'c') {
	        this.select('calendar');
	      }
	      if(event.key == 'd') {
	        this.select('device');
	      }
	    }
	  },
	  select(view) {
	    this.fire('select', { view });
	  },
	  escape() {
	    if(this.get().atRPi) {
	      // visual notification (especially important on touch) that command was given
	      this.set({ touchPressed: 'escape' });
	      setTimeout(() => { this.select('home'); this.set({ touchPressed: undefined }); }, 0); // so that thread has actual time to show the effect
	    } else {
	      this.select('home');
	    }
	  }
	};

	function oncreate$3() {
	  this.set({ homeButtonImgInline: img });

	  // adds thisDeviceId and selectedDeviceId to the component store
	  this.store.entangle(this);

	  this.store.set({ nearbyDevicesMenuVisible: true });
	}
	const file$3 = "Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/navigation/src/ActionBar.html";

	function create_main_fragment$3(component, ctx) {
		var if_block_anchor, current;

		function onwindowkeydown(event) {
			component.handleKeypress(event);	}
		window.addEventListener("keydown", onwindowkeydown);

		var if_block = (ctx.loaded) && create_if_block$3(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.loaded) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$3(component, ctx);
						if (if_block) if_block.c();
					}

					if_block.i(if_block_anchor.parentNode, if_block_anchor);
				} else if (if_block) {
					if_block.o(function() {
						if_block.d(1);
						if_block = null;
					});
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (if_block) if_block.o(outrocallback);
				else outrocallback();

				current = false;
			},

			d: function destroy(detach) {
				window.removeEventListener("keydown", onwindowkeydown);

				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (3:0) {#if loaded}
	function create_if_block$3(component, ctx) {
		var text, if_block_anchor, current;

		var connectionindicator = new ConnectionIndicator({
			root: component.root,
			store: component.store
		});

		var if_block = (ctx.$connected) && create_if_block_1$2(component, ctx);

		return {
			c: function create() {
				connectionindicator._fragment.c();
				text = createText("\n\n  ");
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				connectionindicator._mount(target, anchor);
				insert(target, text, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.$connected) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_1$2(component, ctx);
						if (if_block) if_block.c();
					}

					if_block.i(if_block_anchor.parentNode, if_block_anchor);
				} else if (if_block) {
					if_block.o(function() {
						if_block.d(1);
						if_block = null;
					});
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				outrocallback = callAfter(outrocallback, 2);

				if (connectionindicator) connectionindicator._fragment.o(outrocallback);

				if (if_block) if_block.o(outrocallback);
				else outrocallback();

				current = false;
			},

			d: function destroy(detach) {
				connectionindicator.destroy(detach);
				if (detach) {
					detachNode(text);
				}

				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (7:2) {#if $connected}
	function create_if_block_1$2(component, ctx) {
		var current_block_type_index, if_block, if_block_anchor, current;

		var if_block_creators = [
			create_if_block_2$1,
			create_else_block$1
		];

		var if_blocks = [];

		function select_block_type(ctx) {
			if (ctx.$view == 'home') return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);

		return {
			c: function create() {
				if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if_blocks[current_block_type_index].m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				var previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);
				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(changed, ctx);
				} else {
					if_block.o(function() {
						if_blocks[previous_block_index].d(1);
						if_blocks[previous_block_index] = null;
					});

					if_block = if_blocks[current_block_type_index];
					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);
						if_block.c();
					}
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (if_block) if_block.o(outrocallback);
				else outrocallback();

				current = false;
			},

			d: function destroy(detach) {
				if_blocks[current_block_type_index].d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (15:4) {:else}
	function create_else_block$1(component, ctx) {
		var div, text, if_block1_anchor, current;

		var if_block0 = (ctx.homeButtonImgInline) && create_if_block_4$1(component, ctx);

		var if_block1 = (ctx.isDevCluster) && create_if_block_3$1(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				if (if_block0) if_block0.c();
				text = createText("\n\n      ");
				if (if_block1) if_block1.c();
				if_block1_anchor = createComment();
				div.id = "top_icons";
				div.className = "svelte-7r85fq";
				addLoc(div, file$3, 15, 6, 293);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				if (if_block0) if_block0.m(div, null);
				insert(target, text, anchor);
				if (if_block1) if_block1.m(target, anchor);
				insert(target, if_block1_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.homeButtonImgInline) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_4$1(component, ctx);
						if_block0.c();
						if_block0.m(div, null);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.isDevCluster) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_3$1(component, ctx);
						if_block1.c();
						if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (if_block0) if_block0.d();
				if (detach) {
					detachNode(text);
				}

				if (if_block1) if_block1.d(detach);
				if (detach) {
					detachNode(if_block1_anchor);
				}
			}
		};
	}

	// (9:4) {#if $view == 'home'}
	function create_if_block_2$1(component, ctx) {
		var div, current;

		var volumewidget = new VolumeWidget({
			root: component.root,
			store: component.store
		});

		var tilebar = new TileBar({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() }
		});

		tilebar.on("select", function(event) {
			component.select(event.view);
		});

		return {
			c: function create() {
				div = createElement("div");
				volumewidget._fragment.c();
				tilebar._fragment.c();
				div.className = "selector svelte-7r85fq";
				addLoc(div, file$3, 9, 6, 145);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				volumewidget._mount(tilebar._slotted.default, null);
				tilebar._mount(div, null);
				current = true;
			},

			p: noop,

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				outrocallback = callAfter(outrocallback, 2);

				if (volumewidget) volumewidget._fragment.o(outrocallback);
				if (tilebar) tilebar._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				volumewidget.destroy();
				tilebar.destroy();
			}
		};
	}

	// (17:8) {#if homeButtonImgInline}
	function create_if_block_4$1(component, ctx) {
		var div, img;

		function click_handler(event) {
			component.escape();
		}

		return {
			c: function create() {
				div = createElement("div");
				img = createElement("img");
				addListener(img, "click", click_handler);
				img.src = ctx.homeButtonImgInline;
				img.alt = "home";
				img.className = "svelte-7r85fq";
				addLoc(img, file$3, 18, 12, 460);
				div.className = "escape svelte-7r85fq";
				toggleClass(div, "touch_pressed", ctx.touchPressed == 'escape');
				toggleClass(div, "nonRPi", !ctx.atRPi);
				addLoc(div, file$3, 17, 10, 358);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, img);
			},

			p: function update(changed, ctx) {
				if (changed.homeButtonImgInline) {
					img.src = ctx.homeButtonImgInline;
				}

				if (changed.touchPressed) {
					toggleClass(div, "touch_pressed", ctx.touchPressed == 'escape');
				}

				if (changed.atRPi) {
					toggleClass(div, "nonRPi", !ctx.atRPi);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				removeListener(img, "click", click_handler);
			}
		};
	}

	// (25:6) {#if isDevCluster}
	function create_if_block_3$1(component, ctx) {
		var div, text;

		return {
			c: function create() {
				div = createElement("div");
				text = createText(ctx.$stateChangeCounter);
				div.id = "state_received_indicator";
				div.className = "svelte-7r85fq";
				addLoc(div, file$3, 25, 8, 687);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text);
			},

			p: function update(changed, ctx) {
				if (changed.$stateChangeCounter) {
					setData(text, ctx.$stateChangeCounter);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	function ActionBar(options) {
		this._debugName = '<ActionBar>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<ActionBar> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["connected","view","stateChangeCounter"]), options.data);
		this.store._add(this, ["connected","view","stateChangeCounter"]);
		if (!('loaded' in this._state)) console.warn("<ActionBar> was created without expected data property 'loaded'");
		if (!('$connected' in this._state)) console.warn("<ActionBar> was created without expected data property '$connected'");
		if (!('$view' in this._state)) console.warn("<ActionBar> was created without expected data property '$view'");
		if (!('homeButtonImgInline' in this._state)) console.warn("<ActionBar> was created without expected data property 'homeButtonImgInline'");
		if (!('touchPressed' in this._state)) console.warn("<ActionBar> was created without expected data property 'touchPressed'");
		if (!('atRPi' in this._state)) console.warn("<ActionBar> was created without expected data property 'atRPi'");
		if (!('isDevCluster' in this._state)) console.warn("<ActionBar> was created without expected data property 'isDevCluster'");
		if (!('$stateChangeCounter' in this._state)) console.warn("<ActionBar> was created without expected data property '$stateChangeCounter'");
		this._intro = !!options.intro;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$3(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$3.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(ActionBar.prototype, protoDev);
	assign(ActionBar.prototype, methods$2);

	ActionBar.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/widgets/src/Time.html generated by Svelte v2.16.1 */

	const file$4 = "Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/widgets/src/Time.html";

	function create_main_fragment$4(component, ctx) {
		var div, text_value = ctx.time || '', text, current;

		return {
			c: function create() {
				div = createElement("div");
				text = createText(text_value);
				div.id = "time";
				addLoc(div, file$4, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text);
				current = true;
			},

			p: function update(changed, ctx) {
				if ((changed.time) && text_value !== (text_value = ctx.time || '')) {
					setData(text, text_value);
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	function Time(options) {
		this._debugName = '<Time>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign({}, options.data);
		if (!('time' in this._state)) console.warn("<Time> was created without expected data property 'time'");
		this._intro = !!options.intro;

		this._fragment = create_main_fragment$4(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}

		this._intro = true;
	}

	assign(Time.prototype, protoDev);

	Time.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/widgets/src/TimeAndDate.html generated by Svelte v2.16.1 */

	function oncreate$4() {
	  this.store.entangle(this);

	  // doing this in oncreate -- we have to be careful
	  // elements that we're manipulating have to be permanent... we cannot remove and re-add them based on some criteria (for example $connected)
	  const el = document.getElementById("clock");
	  if(el && el.offsetWidth <= 300) {
	    document.getElementById("time").style.fontSize = "4.5em";
	    document.getElementById("date").style.fontSize = "2.5em";
	    document.getElementById("date").style.marginTop = "5px";
	  }
	}
	const file$5 = "Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/widgets/src/TimeAndDate.html";

	function create_main_fragment$5(component, ctx) {
		var if_block_anchor, current;

		var if_block = (ctx.loaded) && create_if_block$4(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.loaded) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$4(component, ctx);
						if (if_block) if_block.c();
					}

					if_block.i(if_block_anchor.parentNode, if_block_anchor);
				} else if (if_block) {
					if_block.o(function() {
						if_block.d(1);
						if_block = null;
					});
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (if_block) if_block.o(outrocallback);
				else outrocallback();

				current = false;
			},

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (1:0) {#if loaded}
	function create_if_block$4(component, ctx) {
		var div2, div0, current_block_type_index, if_block0, text, div1, current;

		var if_block_creators = [
			create_if_block_2$2,
			create_if_block_3$2,
			create_else_block$2
		];

		var if_blocks = [];

		function select_block_type(ctx) {
			if (ctx.$connected && !ctx.$controller.serverMode) return 0;
			if (ctx._demoTime) return 1;
			return 2;
		}

		current_block_type_index = select_block_type(ctx);
		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);

		var if_block1 = (ctx.$connected && !ctx.$controller.serverMode) && create_if_block_1$3(component, ctx);

		return {
			c: function create() {
				div2 = createElement("div");
				div0 = createElement("div");
				if_block0.c();
				text = createText("\n  ");
				div1 = createElement("div");
				if (if_block1) if_block1.c();
				div0.id = "time";
				div0.className = "svelte-1eoywfx";
				addLoc(div0, file$5, 3, 2, 33);
				div1.id = "date";
				div1.className = "svelte-1eoywfx";
				addLoc(div1, file$5, 14, 2, 326);
				div2.id = "clock";
				div2.className = "svelte-1eoywfx";
				addLoc(div2, file$5, 2, 0, 14);
			},

			m: function mount(target, anchor) {
				insert(target, div2, anchor);
				append(div2, div0);
				if_blocks[current_block_type_index].m(div0, null);
				append(div2, text);
				append(div2, div1);
				if (if_block1) if_block1.m(div1, null);
				current = true;
			},

			p: function update(changed, ctx) {
				var previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);
				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(changed, ctx);
				} else {
					if_block0.o(function() {
						if_blocks[previous_block_index].d(1);
						if_blocks[previous_block_index] = null;
					});

					if_block0 = if_blocks[current_block_type_index];
					if (!if_block0) {
						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);
						if_block0.c();
					}
					if_block0.m(div0, null);
				}

				if (ctx.$connected && !ctx.$controller.serverMode) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_1$3(component, ctx);
						if_block1.c();
						if_block1.m(div1, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (if_block0) if_block0.o(outrocallback);
				else outrocallback();

				current = false;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div2);
				}

				if_blocks[current_block_type_index].d();
				if (if_block1) if_block1.d();
			}
		};
	}

	// (10:6) {:else}
	function create_else_block$2(component, ctx) {
		var current;

		var time_initial_data = { time: ctx.$localBrowserTime };
		var time = new Time({
			root: component.root,
			store: component.store,
			data: time_initial_data
		});

		return {
			c: function create() {
				time._fragment.c();
			},

			m: function mount(target, anchor) {
				time._mount(target, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				var time_changes = {};
				if (changed.$localBrowserTime) time_changes.time = ctx.$localBrowserTime;
				time._set(time_changes);
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (time) time._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy(detach) {
				time.destroy(detach);
			}
		};
	}

	// (8:6) {#if _demoTime}
	function create_if_block_3$2(component, ctx) {
		var text, current;

		return {
			c: function create() {
				text = createText(ctx._demoTime);
			},

			m: function mount(target, anchor) {
				insert(target, text, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (changed._demoTime) {
					setData(text, ctx._demoTime);
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (detach) {
					detachNode(text);
				}
			}
		};
	}

	// (5:4) {#if $connected && !$controller.serverMode}
	function create_if_block_2$2(component, ctx) {
		var current;

		var time_initial_data = { time: ctx.timeDate.time };
		var time = new Time({
			root: component.root,
			store: component.store,
			data: time_initial_data
		});

		return {
			c: function create() {
				time._fragment.c();
			},

			m: function mount(target, anchor) {
				time._mount(target, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				var time_changes = {};
				if (changed.timeDate) time_changes.time = ctx.timeDate.time;
				time._set(time_changes);
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (time) time._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy(detach) {
				time.destroy(detach);
			}
		};
	}

	// (16:4) {#if $connected && !$controller.serverMode}
	function create_if_block_1$3(component, ctx) {
		var span, text0_value = (ctx.timeDate.dow) || '', text0, text1, text2_value = (ctx.timeDate.date) || '', text2;

		return {
			c: function create() {
				span = createElement("span");
				text0 = createText(text0_value);
				text1 = createText(" ");
				text2 = createText(text2_value);
				span.className = "svelte-1eoywfx";
				addLoc(span, file$5, 16, 6, 448);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
				append(span, text0);
				insert(target, text1, anchor);
				insert(target, text2, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.timeDate) && text0_value !== (text0_value = (ctx.timeDate.dow) || '')) {
					setData(text0, text0_value);
				}

				if ((changed.timeDate) && text2_value !== (text2_value = (ctx.timeDate.date) || '')) {
					setData(text2, text2_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(span);
					detachNode(text1);
					detachNode(text2);
				}
			}
		};
	}

	function TimeAndDate(options) {
		this._debugName = '<TimeAndDate>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<TimeAndDate> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["connected","controller","localBrowserTime"]), options.data);
		this.store._add(this, ["connected","controller","localBrowserTime"]);
		if (!('loaded' in this._state)) console.warn("<TimeAndDate> was created without expected data property 'loaded'");
		if (!('$connected' in this._state)) console.warn("<TimeAndDate> was created without expected data property '$connected'");
		if (!('$controller' in this._state)) console.warn("<TimeAndDate> was created without expected data property '$controller'");
		if (!('timeDate' in this._state)) console.warn("<TimeAndDate> was created without expected data property 'timeDate'");
		if (!('_demoTime' in this._state)) console.warn("<TimeAndDate> was created without expected data property '_demoTime'");
		if (!('$localBrowserTime' in this._state)) console.warn("<TimeAndDate> was created without expected data property '$localBrowserTime'");
		this._intro = !!options.intro;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$5(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$4.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(TimeAndDate.prototype, protoDev);

	TimeAndDate.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/dynamics/src/Notifications.html generated by Svelte v2.16.1 */

	// disabled transitions for now because they were causing a big issue for some reason (mixup of 'views' -- home component rendered on top of player and others... ')
	// import { fade, fly } from 'svelte-transitions';

	function styles(el) {
		return getStyles(el);
	}

	function listify$1(el) {
		return def.listify(el);
	}

	const getStyles = ({ color = 'black', bgColor = 'white' }) => (
`
  color: ${color};
  background-color: ${bgColor};
`
	);

	const file$6 = "Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/dynamics/src/Notifications.html";

	function get_each_context_1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.notification = list[i];
		return child_ctx;
	}

	function get_each_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.notification = list[i];
		return child_ctx;
	}

	function create_main_fragment$6(component, ctx) {
		var if_block_anchor, current;

		var if_block = (ctx.$guiNotifications) && create_if_block$5(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.$guiNotifications) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$5(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (1:0) {#if $guiNotifications}
	function create_if_block$5(component, ctx) {
		var div;

		var if_block = (ctx.$controller) && create_if_block_1$4(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				if (if_block) if_block.c();
				div.id = "notifications";
				div.className = "svelte-101hohc";
				addLoc(div, file$6, 6, 4, 107);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				if (if_block) if_block.m(div, null);
			},

			p: function update(changed, ctx) {
				if (ctx.$controller) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_1$4(component, ctx);
						if_block.c();
						if_block.m(div, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (if_block) if_block.d();
			}
		};
	}

	// (8:6) {#if $controller}
	function create_if_block_1$4(component, ctx) {
		var if_block_anchor;

		function select_block_type(ctx) {
			if (ctx.$controller.demoDevice && ctx.$controller.demoDevice.notification) return create_if_block_2$3;
			if (!ctx.$controller.demoDevice) return create_if_block_4$2;
		}

		var current_block_type = select_block_type(ctx);
		var if_block = current_block_type && current_block_type(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if (if_block) if_block.d(1);
					if_block = current_block_type && current_block_type(component, ctx);
					if (if_block) if_block.c();
					if (if_block) if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (24:41) 
	function create_if_block_4$2(component, ctx) {
		var each_anchor;

		var each_value_1 = ctx.$guiNotifications.reverse();

		var each_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block_1(component, get_each_context_1(ctx, each_value_1, i));
		}

		return {
			c: function create() {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_anchor = createComment();
			},

			m: function mount(target, anchor) {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(target, anchor);
				}

				insert(target, each_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.$guiNotifications) {
					each_value_1 = ctx.$guiNotifications.reverse();

					for (var i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1(ctx, each_value_1, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_1(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(each_anchor.parentNode, each_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value_1.length;
				}
			},

			d: function destroy(detach) {
				destroyEach(each_blocks, detach);

				if (detach) {
					detachNode(each_anchor);
				}
			}
		};
	}

	// (10:8) {#if $controller.demoDevice && $controller.demoDevice.notification}
	function create_if_block_2$3(component, ctx) {
		var each_anchor;

		var each_value = listify$1(ctx.$controller.demoDevice.notification);

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(component, get_each_context(ctx, each_value, i));
		}

		return {
			c: function create() {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_anchor = createComment();
			},

			m: function mount(target, anchor) {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(target, anchor);
				}

				insert(target, each_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.$controller) {
					each_value = listify$1(ctx.$controller.demoDevice.notification);

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(each_anchor.parentNode, each_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}
			},

			d: function destroy(detach) {
				destroyEach(each_blocks, detach);

				if (detach) {
					detachNode(each_anchor);
				}
			}
		};
	}

	// (32:14) {:else}
	function create_else_block_1$1(component, ctx) {
		var span;

		return {
			c: function create() {
				span = createElement("span");
				span.textContent = "now";
				span.className = "svelte-101hohc";
				addLoc(span, file$6, 32, 16, 1149);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(span);
				}
			}
		};
	}

	// (30:14) {#if notification.relativeTimeAdded && !notification.dontDisplaySinceTimer}
	function create_if_block_5$1(component, ctx) {
		var span, text0_value = ctx.notification.relativeTimeAdded, text0, text1;

		return {
			c: function create() {
				span = createElement("span");
				text0 = createText(text0_value);
				text1 = createText(" ago");
				span.className = "svelte-101hohc";
				addLoc(span, file$6, 30, 16, 1061);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
				append(span, text0);
				append(span, text1);
			},

			p: function update(changed, ctx) {
				if ((changed.$guiNotifications) && text0_value !== (text0_value = ctx.notification.relativeTimeAdded)) {
					setData(text0, text0_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(span);
				}
			}
		};
	}

	// (26:10) {#each $guiNotifications.reverse() as notification}
	function create_each_block_1(component, ctx) {
		var div, text0_value = ctx.notification.msg, text0, text1, text2, div_style_value;

		function select_block_type_2(ctx) {
			if (ctx.notification.relativeTimeAdded && !ctx.notification.dontDisplaySinceTimer) return create_if_block_5$1;
			return create_else_block_1$1;
		}

		var current_block_type = select_block_type_2(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				text0 = createText(text0_value);
				text1 = createText("\n              ");
				if_block.c();
				text2 = createText("\n            ");
				div.className = "notification svelte-101hohc";
				div.style.cssText = div_style_value = styles(ctx.notification);
				addLoc(div, file$6, 27, 12, 866);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text0);
				append(div, text1);
				if_block.m(div, null);
				append(div, text2);
			},

			p: function update(changed, ctx) {
				if ((changed.$guiNotifications) && text0_value !== (text0_value = ctx.notification.msg)) {
					setData(text0, text0_value);
				}

				if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(div, text2);
				}

				if ((changed.$guiNotifications) && div_style_value !== (div_style_value = styles(ctx.notification))) {
					div.style.cssText = div_style_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if_block.d();
			}
		};
	}

	// (18:14) {:else}
	function create_else_block$3(component, ctx) {
		var span;

		return {
			c: function create() {
				span = createElement("span");
				span.textContent = "now";
				span.className = "svelte-101hohc";
				addLoc(span, file$6, 18, 16, 641);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(span);
				}
			}
		};
	}

	// (16:14) {#if notification.relativeTimeAdded && !notification.dontDisplaySinceTimer}
	function create_if_block_3$3(component, ctx) {
		var span, text0_value = ctx.notification.relativeTimeAdded, text0, text1;

		return {
			c: function create() {
				span = createElement("span");
				text0 = createText(text0_value);
				text1 = createText(" ago");
				span.className = "svelte-101hohc";
				addLoc(span, file$6, 16, 16, 553);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
				append(span, text0);
				append(span, text1);
			},

			p: function update(changed, ctx) {
				if ((changed.$controller) && text0_value !== (text0_value = ctx.notification.relativeTimeAdded)) {
					setData(text0, text0_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(span);
				}
			}
		};
	}

	// (12:10) {#each listify($controller.demoDevice.notification) as notification}
	function create_each_block(component, ctx) {
		var div, text0_value = ctx.notification.msg, text0, text1, text2, div_style_value;

		function select_block_type_1(ctx) {
			if (ctx.notification.relativeTimeAdded && !ctx.notification.dontDisplaySinceTimer) return create_if_block_3$3;
			return create_else_block$3;
		}

		var current_block_type = select_block_type_1(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				text0 = createText(text0_value);
				text1 = createText("\n              ");
				if_block.c();
				text2 = createText("\n            ");
				div.className = "notification svelte-101hohc";
				div.style.cssText = div_style_value = styles(ctx.notification);
				addLoc(div, file$6, 13, 12, 358);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text0);
				append(div, text1);
				if_block.m(div, null);
				append(div, text2);
			},

			p: function update(changed, ctx) {
				if ((changed.$controller) && text0_value !== (text0_value = ctx.notification.msg)) {
					setData(text0, text0_value);
				}

				if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(div, text2);
				}

				if ((changed.$controller) && div_style_value !== (div_style_value = styles(ctx.notification))) {
					div.style.cssText = div_style_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if_block.d();
			}
		};
	}

	function Notifications(options) {
		this._debugName = '<Notifications>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<Notifications> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["guiNotifications","controller"]), options.data);
		this.store._add(this, ["guiNotifications","controller"]);
		if (!('$guiNotifications' in this._state)) console.warn("<Notifications> was created without expected data property '$guiNotifications'");
		if (!('$controller' in this._state)) console.warn("<Notifications> was created without expected data property '$controller'");
		this._intro = !!options.intro;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$6(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}

		this._intro = true;
	}

	assign(Notifications.prototype, protoDev);

	Notifications.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/navigation/src/Sidebar.html generated by Svelte v2.16.1 */



	function oncreate$5() {
	  this.store.entangle(this);
	}
	const file$7 = "Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/navigation/src/Sidebar.html";

	function create_main_fragment$7(component, ctx) {
		var text0, div1, text1, slot_content_sidebar_menu = component._slotted.sidebar_menu, slot_content_sidebar_menu_before, slot_content_sidebar_menu_after, text2, div0, current;

		var if_block0 = (ctx.$controller && ctx.viewDef && ctx.viewDef.sidebar) && create_if_block_1$5(component, ctx);

		var if_block1 = (ctx.$controller && ctx.viewDef && ctx.viewDef.sidebar) && create_if_block$6(component, ctx);

		var notifications = new Notifications({
			root: component.root,
			store: component.store
		});

		return {
			c: function create() {
				if (if_block0) if_block0.c();
				text0 = createText("\n\n");
				div1 = createElement("div");
				if (if_block1) if_block1.c();
				text1 = createText("\n\n  ");
				text2 = createText("\n\n  ");
				div0 = createElement("div");
				notifications._fragment.c();
				div0.className = "notifications svelte-mg4mbz";
				addLoc(div0, file$7, 23, 2, 1267);
				div1.className = "sidebar svelte-mg4mbz";
				addLoc(div1, file$7, 11, 0, 329);
			},

			m: function mount(target, anchor) {
				if (if_block0) if_block0.m(target, anchor);
				insert(target, text0, anchor);
				insert(target, div1, anchor);
				if (if_block1) if_block1.m(div1, null);
				append(div1, text1);

				if (slot_content_sidebar_menu) {
					append(div1, slot_content_sidebar_menu_before || (slot_content_sidebar_menu_before = createComment()));
					append(div1, slot_content_sidebar_menu);
					append(div1, slot_content_sidebar_menu_after || (slot_content_sidebar_menu_after = createComment()));
				}

				append(div1, text2);
				append(div1, div0);
				notifications._mount(div0, null);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.$controller && ctx.viewDef && ctx.viewDef.sidebar) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_1$5(component, ctx);
						if_block0.c();
						if_block0.m(text0.parentNode, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.$controller && ctx.viewDef && ctx.viewDef.sidebar) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block$6(component, ctx);
						if (if_block1) if_block1.c();
					}

					if_block1.i(div1, text1);
				} else if (if_block1) {
					if_block1.o(function() {
						if_block1.d(1);
						if_block1 = null;
					});
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				outrocallback = callAfter(outrocallback, 2);

				if (if_block1) if_block1.o(outrocallback);
				else outrocallback();

				if (notifications) notifications._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy(detach) {
				if (if_block0) if_block0.d(detach);
				if (detach) {
					detachNode(text0);
					detachNode(div1);
				}

				if (if_block1) if_block1.d();

				if (slot_content_sidebar_menu) {
					reinsertBetween(slot_content_sidebar_menu_before, slot_content_sidebar_menu_after, slot_content_sidebar_menu);
					detachNode(slot_content_sidebar_menu_before);
					detachNode(slot_content_sidebar_menu_after);
				}

				notifications.destroy();
			}
		};
	}

	// (1:0) {#if $controller && viewDef && viewDef.sidebar}
	function create_if_block_1$5(component, ctx) {
		var text, div, slot_content_sidebar_bottom = component._slotted.sidebar_bottom;

		var if_block = (ctx.viewDef.sidebar != 'top-only' && ctx.viewDef.sidebar != 'top-only-transparent') && create_if_block_2$4();

		return {
			c: function create() {
				if (if_block) if_block.c();
				text = createText("\n\n  ");
				div = createElement("div");
				div.className = "sidebar_bottom svelte-mg4mbz";
				addLoc(div, file$7, 6, 2, 185);
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, text, anchor);
				insert(target, div, anchor);

				if (slot_content_sidebar_bottom) {
					append(div, slot_content_sidebar_bottom);
				}
			},

			p: function update(changed, ctx) {
				if (ctx.viewDef.sidebar != 'top-only' && ctx.viewDef.sidebar != 'top-only-transparent') {
					if (!if_block) {
						if_block = create_if_block_2$4();
						if_block.c();
						if_block.m(text.parentNode, text);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(text);
					detachNode(div);
				}

				if (slot_content_sidebar_bottom) {
					reinsertChildren(div, slot_content_sidebar_bottom);
				}
			}
		};
	}

	// (3:2) {#if viewDef.sidebar != 'top-only' && viewDef.sidebar != 'top-only-transparent'}
	function create_if_block_2$4(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "sidebar_vertical_space svelte-mg4mbz";
				addLoc(div, file$7, 3, 4, 136);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (13:2) {#if $controller && viewDef && viewDef.sidebar}
	function create_if_block$6(component, ctx) {
		var div1, div0, text0_value = ctx.$controller.deviceName || '', text0, text1, current;

		var timeanddate_initial_data = { timeDate: ctx.timeDate };
		var timeanddate = new TimeAndDate({
			root: component.root,
			store: component.store,
			data: timeanddate_initial_data
		});

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				text0 = createText(text0_value);
				text1 = createText("\n      ");
				timeanddate._fragment.c();
				div0.className = "device_title svelte-mg4mbz";
				toggleClass(div0, "foreign", !ctx.homebase);
				addLoc(div0, file$7, 15, 6, 1040);
				div1.className = "sidebar_top_info svelte-mg4mbz";
				toggleClass(div1, "top_only_with_background", (ctx.viewDef.sidebar == 'top-only' || ctx.viewDef.protectVisibility) && ctx.$connected);
				addLoc(div1, file$7, 14, 4, 895);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				append(div0, text0);
				append(div1, text1);
				timeanddate._mount(div1, null);
				current = true;
			},

			p: function update(changed, ctx) {
				if ((!current || changed.$controller) && text0_value !== (text0_value = ctx.$controller.deviceName || '')) {
					setData(text0, text0_value);
				}

				if (changed.homebase) {
					toggleClass(div0, "foreign", !ctx.homebase);
				}

				var timeanddate_changes = {};
				if (changed.timeDate) timeanddate_changes.timeDate = ctx.timeDate;
				timeanddate._set(timeanddate_changes);

				if ((changed.viewDef || changed.$connected)) {
					toggleClass(div1, "top_only_with_background", (ctx.viewDef.sidebar == 'top-only' || ctx.viewDef.protectVisibility) && ctx.$connected);
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (timeanddate) timeanddate._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				timeanddate.destroy();
			}
		};
	}

	function Sidebar(options) {
		this._debugName = '<Sidebar>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<Sidebar> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["controller","connected"]), options.data);
		this.store._add(this, ["controller","connected"]);
		if (!('$controller' in this._state)) console.warn("<Sidebar> was created without expected data property '$controller'");
		if (!('viewDef' in this._state)) console.warn("<Sidebar> was created without expected data property 'viewDef'");
		if (!('$connected' in this._state)) console.warn("<Sidebar> was created without expected data property '$connected'");
		if (!('homebase' in this._state)) console.warn("<Sidebar> was created without expected data property 'homebase'");
		if (!('timeDate' in this._state)) console.warn("<Sidebar> was created without expected data property 'timeDate'");
		this._intro = !!options.intro;

		this._handlers.destroy = [removeFromStore];

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$7(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$5.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(Sidebar.prototype, protoDev);

	Sidebar.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/widgets/src/IotActions.html generated by Svelte v2.16.1 */

	var methods$3 = {
	  action(action) {
	    this.store.action({ action, storeName: 'iot' });
	  }
	};

	function oncreate$6() {
	  this.store.entangle(this);
	}
	const file$8 = "Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/widgets/src/IotActions.html";

	function create_main_fragment$8(component, ctx) {
		var if_block_anchor, current;

		var if_block = (ctx.isDevCluster) && create_if_block$7(component);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.isDevCluster) {
					if (!if_block) {
						if_block = create_if_block$7(component);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (1:0) {#if isDevCluster}
	function create_if_block$7(component, ctx) {
		var div2, div0, text_1, div1;

		function click_handler(event) {
			component.action('lab-on');
		}

		function click_handler_1(event) {
			component.action('lab-off');
		}

		return {
			c: function create() {
				div2 = createElement("div");
				div0 = createElement("div");
				div0.textContent = "ON";
				text_1 = createText("\n    ");
				div1 = createElement("div");
				div1.textContent = "OFF";
				addListener(div0, "click", click_handler);
				div0.className = "action svelte-782owb";
				addLoc(div0, file$8, 2, 4, 56);
				addListener(div1, "click", click_handler_1);
				div1.className = "action svelte-782owb";
				addLoc(div1, file$8, 3, 4, 117);
				div2.id = "iot_actions_wrapper";
				div2.className = "svelte-782owb";
				addLoc(div2, file$8, 1, 2, 21);
			},

			m: function mount(target, anchor) {
				insert(target, div2, anchor);
				append(div2, div0);
				append(div2, text_1);
				append(div2, div1);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div2);
				}

				removeListener(div0, "click", click_handler);
				removeListener(div1, "click", click_handler_1);
			}
		};
	}

	function IotActions(options) {
		this._debugName = '<IotActions>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign({}, options.data);
		if (!('isDevCluster' in this._state)) console.warn("<IotActions> was created without expected data property 'isDevCluster'");
		this._intro = !!options.intro;

		this._fragment = create_main_fragment$8(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$6.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(IotActions.prototype, protoDev);
	assign(IotActions.prototype, methods$3);

	IotActions.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/home/src/SidebarMenu.html generated by Svelte v2.16.1 */

	function oncreate$7() {

	}
	function create_main_fragment$9(component, ctx) {

		return {
			c: noop,

			m: noop,

			p: noop,

			i: noop,

			o: run,

			d: noop
		};
	}

	function SidebarMenu(options) {
		this._debugName = '<SidebarMenu>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign({}, options.data);
		this._intro = !!options.intro;

		this._fragment = create_main_fragment$9(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$7.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(SidebarMenu.prototype, protoDev);

	SidebarMenu.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/device/src/SidebarMenu.html generated by Svelte v2.16.1 */

	var methods$4 = {
	  select(view) {
	    this.set({ deviceView: view, touchInfo: view });
	    setTimeout(() => this.set({ touchInfo: undefined }), 50);

	    setTimeout(() => this.store.fire('select_device_view', { view }), 0);
	    //this.store.fire('select_device_view', { view });
	  },
	  action(action) {
	    this.set({ touchInfo: action });
	    setTimeout(() => this.set({ touchInfo: undefined }), 50);

	    // local view actions
	    if(action == 'show_danger_zone') {
	      this.set({ dangerZoneButtonVisible: false });
	      setTimeout(() => {
	        this.set({ dangerZoneVisible: true });
	        setTimeout(() => this.set({ dangerZoneVisible: false, dangerZoneButtonVisible: true }), 10000);
	      }, 500);

	      return
	    }

	    // otherwise forward to the view store
	    this.store.action({ action, storeName: 'controller' });
	  }
	};

	function oncreate$8() {
	  this.set({ deviceView: 'controller', dangerZoneVisible: false, dangerZoneButtonVisible: true }); // default, duplicate in Debug.html

	  this.store.entangle(this);
	}
	const file$9 = "Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/device/src/SidebarMenu.html";

	function create_main_fragment$a(component, ctx) {
		var div, h30, text1, button0, text3, button1, text5, h31, text7, button2, text9, button3, text11, button4, text13, h32, text15, button5, text17, button6, text19, current;

		function click_handler(event) {
			component.select('device_log');
		}

		function click_handler_1(event) {
			component.select('network_log');
		}

		function click_handler_2(event) {
			component.select('controller_state');
		}

		function click_handler_3(event) {
			component.select('player_state');
		}

		function click_handler_4(event) {
			component.select('nearby_sensors_state');
		}

		function click_handler_5(event) {
			component.select('system_info');
		}

		function click_handler_6(event) {
			component.select('process_info');
		}

		var if_block = (ctx.$connected && ctx.loaded) && create_if_block$8(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				h30 = createElement("h3");
				h30.textContent = "Logs";
				text1 = createText("\n\n  ");
				button0 = createElement("button");
				button0.textContent = "Device log";
				text3 = createText("\n\n  ");
				button1 = createElement("button");
				button1.textContent = "Network log";
				text5 = createText("\n\n  ");
				h31 = createElement("h3");
				h31.textContent = "Device state";
				text7 = createText("\n\n  ");
				button2 = createElement("button");
				button2.textContent = "Controller";
				text9 = createText("\n  ");
				button3 = createElement("button");
				button3.textContent = "Player";
				text11 = createText("\n  ");
				button4 = createElement("button");
				button4.textContent = "Nearby sensors";
				text13 = createText("\n\n  ");
				h32 = createElement("h3");
				h32.textContent = "System information";
				text15 = createText("\n\n  ");
				button5 = createElement("button");
				button5.textContent = "System info";
				text17 = createText("\n  ");
				button6 = createElement("button");
				button6.textContent = "Process info";
				text19 = createText("\n\n  ");
				if (if_block) if_block.c();
				addLoc(h30, file$9, 2, 2, 41);
				addListener(button0, "click", click_handler);
				button0.className = "svelte-pmk42w";
				toggleClass(button0, "active", ctx.deviceView == 'device_log');
				toggleClass(button0, "touch_pressed", ctx.touchInfo == 'device_log');
				addLoc(button0, file$9, 4, 2, 58);
				addListener(button1, "click", click_handler_1);
				button1.className = "svelte-pmk42w";
				toggleClass(button1, "active", ctx.deviceView == 'network_log');
				toggleClass(button1, "touch_pressed", ctx.touchInfo == 'network_log');
				addLoc(button1, file$9, 6, 2, 211);
				addLoc(h31, file$9, 8, 2, 368);
				addListener(button2, "click", click_handler_2);
				button2.className = "svelte-pmk42w";
				toggleClass(button2, "active", ctx.deviceView == 'controller_state');
				toggleClass(button2, "touch_pressed", ctx.touchInfo == 'controller_state');
				addLoc(button2, file$9, 10, 2, 393);
				addListener(button3, "click", click_handler_3);
				button3.className = "svelte-pmk42w";
				toggleClass(button3, "active", ctx.deviceView == 'player_state');
				toggleClass(button3, "touch_pressed", ctx.touchInfo == 'player_state');
				addLoc(button3, file$9, 11, 2, 563);
				addListener(button4, "click", click_handler_4);
				button4.className = "svelte-pmk42w";
				toggleClass(button4, "active", ctx.deviceView == 'nearby_sensors_state');
				toggleClass(button4, "touch_pressed", ctx.touchInfo == 'nearby_sensors_state');
				addLoc(button4, file$9, 12, 2, 717);
				addLoc(h32, file$9, 14, 2, 904);
				addListener(button5, "click", click_handler_5);
				button5.className = "svelte-pmk42w";
				toggleClass(button5, "active", ctx.deviceView == 'system_info');
				toggleClass(button5, "touch_pressed", ctx.touchInfo == 'system_info');
				addLoc(button5, file$9, 16, 2, 935);
				addListener(button6, "click", click_handler_6);
				button6.className = "svelte-pmk42w";
				toggleClass(button6, "active", ctx.deviceView == 'process_info');
				toggleClass(button6, "touch_pressed", ctx.touchInfo == 'process_info');
				addLoc(button6, file$9, 17, 2, 1091);
				div.id = "menu";
				div.className = "svelte-pmk42w";
				toggleClass(div, "nonRPi", !ctx.atRPi);
				addLoc(div, file$9, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, h30);
				append(div, text1);
				append(div, button0);
				append(div, text3);
				append(div, button1);
				append(div, text5);
				append(div, h31);
				append(div, text7);
				append(div, button2);
				append(div, text9);
				append(div, button3);
				append(div, text11);
				append(div, button4);
				append(div, text13);
				append(div, h32);
				append(div, text15);
				append(div, button5);
				append(div, text17);
				append(div, button6);
				append(div, text19);
				if (if_block) if_block.m(div, null);
				current = true;
			},

			p: function update(changed, ctx) {
				if (changed.deviceView) {
					toggleClass(button0, "active", ctx.deviceView == 'device_log');
				}

				if (changed.touchInfo) {
					toggleClass(button0, "touch_pressed", ctx.touchInfo == 'device_log');
				}

				if (changed.deviceView) {
					toggleClass(button1, "active", ctx.deviceView == 'network_log');
				}

				if (changed.touchInfo) {
					toggleClass(button1, "touch_pressed", ctx.touchInfo == 'network_log');
				}

				if (changed.deviceView) {
					toggleClass(button2, "active", ctx.deviceView == 'controller_state');
				}

				if (changed.touchInfo) {
					toggleClass(button2, "touch_pressed", ctx.touchInfo == 'controller_state');
				}

				if (changed.deviceView) {
					toggleClass(button3, "active", ctx.deviceView == 'player_state');
				}

				if (changed.touchInfo) {
					toggleClass(button3, "touch_pressed", ctx.touchInfo == 'player_state');
				}

				if (changed.deviceView) {
					toggleClass(button4, "active", ctx.deviceView == 'nearby_sensors_state');
				}

				if (changed.touchInfo) {
					toggleClass(button4, "touch_pressed", ctx.touchInfo == 'nearby_sensors_state');
				}

				if (changed.deviceView) {
					toggleClass(button5, "active", ctx.deviceView == 'system_info');
				}

				if (changed.touchInfo) {
					toggleClass(button5, "touch_pressed", ctx.touchInfo == 'system_info');
				}

				if (changed.deviceView) {
					toggleClass(button6, "active", ctx.deviceView == 'process_info');
				}

				if (changed.touchInfo) {
					toggleClass(button6, "touch_pressed", ctx.touchInfo == 'process_info');
				}

				if (ctx.$connected && ctx.loaded) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$8(component, ctx);
						if_block.c();
						if_block.m(div, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (changed.atRPi) {
					toggleClass(div, "nonRPi", !ctx.atRPi);
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				removeListener(button0, "click", click_handler);
				removeListener(button1, "click", click_handler_1);
				removeListener(button2, "click", click_handler_2);
				removeListener(button3, "click", click_handler_3);
				removeListener(button4, "click", click_handler_4);
				removeListener(button5, "click", click_handler_5);
				removeListener(button6, "click", click_handler_6);
				if (if_block) if_block.d();
			}
		};
	}

	// (20:2) {#if $connected && loaded}
	function create_if_block$8(component, ctx) {
		var if_block_anchor;

		var if_block = (ctx.isRPi) && create_if_block_1$6(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.isRPi) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_1$6(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (22:4) {#if isRPi}
	function create_if_block_1$6(component, ctx) {
		var if_block_anchor;

		function select_block_type(ctx) {
			if (ctx.dangerZoneVisible) return create_if_block_2$5;
			if (ctx.dangerZoneButtonVisible) return create_if_block_5$2;
			return create_else_block_1$2;
		}

		var current_block_type = select_block_type(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},

			d: function destroy(detach) {
				if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (41:8) {:else}
	function create_else_block_1$2(component, ctx) {
		var h3;

		return {
			c: function create() {
				h3 = createElement("h3");
				h3.textContent = "Have you tried ...";
				addLoc(h3, file$9, 41, 10, 2144);
			},

			m: function mount(target, anchor) {
				insert(target, h3, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(h3);
				}
			}
		};
	}

	// (38:8) {#if dangerZoneButtonVisible}
	function create_if_block_5$2(component, ctx) {
		var h3, text_1, button;

		function click_handler(event) {
			component.action('show_danger_zone');
		}

		return {
			c: function create() {
				h3 = createElement("h3");
				h3.textContent = "Have you tried";
				text_1 = createText("\n          ");
				button = createElement("button");
				button.textContent = "Turning it off and on again?";
				addLoc(h3, file$9, 38, 10, 1930);
				addListener(button, "click", click_handler);
				button.className = "warning svelte-pmk42w";
				toggleClass(button, "touch_pressed", ctx.touchInfo == 'show_danger_zone');
				addLoc(button, file$9, 39, 10, 1964);
			},

			m: function mount(target, anchor) {
				insert(target, h3, anchor);
				insert(target, text_1, anchor);
				insert(target, button, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.touchInfo) {
					toggleClass(button, "touch_pressed", ctx.touchInfo == 'show_danger_zone');
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(h3);
					detachNode(text_1);
					detachNode(button);
				}

				removeListener(button, "click", click_handler);
			}
		};
	}

	// (24:6) {#if dangerZoneVisible}
	function create_if_block_2$5(component, ctx) {
		var h3, text1, button, text3, if_block_anchor;

		function click_handler(event) {
			component.action('reboot');
		}

		var if_block = (ctx.$controller) && create_if_block_3$4(component, ctx);

		return {
			c: function create() {
				h3 = createElement("h3");
				h3.textContent = "Select an option →";
				text1 = createText("\n\n        ");
				button = createElement("button");
				button.textContent = "Reboot";
				text3 = createText("\n        ");
				if (if_block) if_block.c();
				if_block_anchor = createComment();
				addLoc(h3, file$9, 25, 8, 1336);
				addListener(button, "click", click_handler);
				button.className = "warning svelte-pmk42w";
				addLoc(button, file$9, 27, 8, 1373);
			},

			m: function mount(target, anchor) {
				insert(target, h3, anchor);
				insert(target, text1, anchor);
				insert(target, button, anchor);
				insert(target, text3, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.$controller) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_3$4(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(h3);
					detachNode(text1);
					detachNode(button);
				}

				removeListener(button, "click", click_handler);
				if (detach) {
					detachNode(text3);
				}

				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (29:8) {#if $controller}
	function create_if_block_3$4(component, ctx) {
		var if_block_anchor;

		function select_block_type_1(ctx) {
			if (ctx.$controller.apMode) return create_if_block_4$3;
			return create_else_block$4;
		}

		var current_block_type = select_block_type_1(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},

			d: function destroy(detach) {
				if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (32:10) {:else}
	function create_else_block$4(component, ctx) {
		var button;

		function click_handler(event) {
			component.action('ap_mode_enable');
		}

		return {
			c: function create() {
				button = createElement("button");
				button.textContent = "Set AP Mode & Reboot";
				addListener(button, "click", click_handler);
				button.className = "more_warning svelte-pmk42w";
				toggleClass(button, "touch_pressed", ctx.touchInfo == 'ap_mode_enable');
				addLoc(button, file$9, 32, 12, 1690);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.touchInfo) {
					toggleClass(button, "touch_pressed", ctx.touchInfo == 'ap_mode_enable');
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler);
			}
		};
	}

	// (30:10) {#if $controller.apMode}
	function create_if_block_4$3(component, ctx) {
		var button;

		function click_handler(event) {
			component.action('ap_mode_disable');
		}

		return {
			c: function create() {
				button = createElement("button");
				button.textContent = "Set Wifi Mode & Reboot";
				addListener(button, "click", click_handler);
				button.className = "warning svelte-pmk42w";
				toggleClass(button, "touch_pressed", ctx.touchInfo == 'ap_mode_disable');
				addLoc(button, file$9, 30, 12, 1514);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.touchInfo) {
					toggleClass(button, "touch_pressed", ctx.touchInfo == 'ap_mode_disable');
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler);
			}
		};
	}

	function SidebarMenu$1(options) {
		this._debugName = '<SidebarMenu>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<SidebarMenu> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["connected","controller"]), options.data);
		this.store._add(this, ["connected","controller"]);
		if (!('atRPi' in this._state)) console.warn("<SidebarMenu> was created without expected data property 'atRPi'");
		if (!('deviceView' in this._state)) console.warn("<SidebarMenu> was created without expected data property 'deviceView'");
		if (!('touchInfo' in this._state)) console.warn("<SidebarMenu> was created without expected data property 'touchInfo'");
		if (!('$connected' in this._state)) console.warn("<SidebarMenu> was created without expected data property '$connected'");
		if (!('loaded' in this._state)) console.warn("<SidebarMenu> was created without expected data property 'loaded'");
		if (!('isRPi' in this._state)) console.warn("<SidebarMenu> was created without expected data property 'isRPi'");
		if (!('dangerZoneVisible' in this._state)) console.warn("<SidebarMenu> was created without expected data property 'dangerZoneVisible'");
		if (!('$controller' in this._state)) console.warn("<SidebarMenu> was created without expected data property '$controller'");
		if (!('dangerZoneButtonVisible' in this._state)) console.warn("<SidebarMenu> was created without expected data property 'dangerZoneButtonVisible'");
		this._intro = !!options.intro;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$a(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$8.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(SidebarMenu$1.prototype, protoDev);
	assign(SidebarMenu$1.prototype, methods$4);

	SidebarMenu$1.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/navigation/src/SidebarMenus.html generated by Svelte v2.16.1 */

	function create_main_fragment$b(component, ctx) {
		var current_block_type_index, if_block, if_block_anchor, current;

		var if_block_creators = [
			create_if_block$9,
			create_if_block_1$7
		];

		var if_blocks = [];

		function select_block_type(ctx) {
			if (ctx.$view == 'home') return 0;
			if (ctx.$view == 'device') return 1;
			return -1;
		}

		if (~(current_block_type_index = select_block_type(ctx))) {
			if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);
		}

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (~current_block_type_index) if_blocks[current_block_type_index].m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				var previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);
				if (current_block_type_index !== previous_block_index) {
					if (if_block) {
						if_block.o(function() {
							if_blocks[previous_block_index].d(1);
							if_blocks[previous_block_index] = null;
						});
					}

					if (~current_block_type_index) {
						if_block = if_blocks[current_block_type_index];
						if (!if_block) {
							if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);
							if_block.c();
						}
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					} else {
						if_block = null;
					}
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (if_block) if_block.o(outrocallback);
				else outrocallback();

				current = false;
			},

			d: function destroy(detach) {
				if (~current_block_type_index) if_blocks[current_block_type_index].d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (6:27) 
	function create_if_block_1$7(component, ctx) {
		var current;

		var devicesidebarmenu = new SidebarMenu$1({
			root: component.root,
			store: component.store
		});

		return {
			c: function create() {
				devicesidebarmenu._fragment.c();
			},

			m: function mount(target, anchor) {
				devicesidebarmenu._mount(target, anchor);
				current = true;
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (devicesidebarmenu) devicesidebarmenu._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy(detach) {
				devicesidebarmenu.destroy(detach);
			}
		};
	}

	// (2:0) {#if $view == 'home'}
	function create_if_block$9(component, ctx) {
		var current;

		var homesidebarmenu = new SidebarMenu({
			root: component.root,
			store: component.store
		});

		return {
			c: function create() {
				homesidebarmenu._fragment.c();
			},

			m: function mount(target, anchor) {
				homesidebarmenu._mount(target, anchor);
				current = true;
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (homesidebarmenu) homesidebarmenu._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy(detach) {
				homesidebarmenu.destroy(detach);
			}
		};
	}

	function SidebarMenus(options) {
		this._debugName = '<SidebarMenus>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<SidebarMenus> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["view"]), options.data);
		this.store._add(this, ["view"]);
		if (!('$view' in this._state)) console.warn("<SidebarMenus> was created without expected data property '$view'");
		this._intro = !!options.intro;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$b(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(SidebarMenus.prototype, protoDev);

	SidebarMenus.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	const img$1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAArwAAAJSCAYAAAAh9BaxAAAEvWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS41LjAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyIKICAgIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIKICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgdGlmZjpJbWFnZUxlbmd0aD0iNTk0IgogICB0aWZmOkltYWdlV2lkdGg9IjcwMCIKICAgdGlmZjpSZXNvbHV0aW9uVW5pdD0iMiIKICAgdGlmZjpYUmVzb2x1dGlvbj0iMzAwLjAiCiAgIHRpZmY6WVJlc29sdXRpb249IjMwMC4wIgogICBleGlmOlBpeGVsWERpbWVuc2lvbj0iNzAwIgogICBleGlmOlBpeGVsWURpbWVuc2lvbj0iNTk0IgogICBleGlmOkNvbG9yU3BhY2U9IjEiCiAgIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiCiAgIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIKICAgeG1wOk1vZGlmeURhdGU9IjIw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';

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/player/src/SidebarBottom.html generated by Svelte v2.16.1 */

	function oncreate$9() {
	  this.set({ alienImgInline: img$1 });

	  this.store.entangle(this);
	}
	const file$a = "Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/player/src/SidebarBottom.html";

	function create_main_fragment$c(component, ctx) {
		var text, if_block1_anchor, current;

		var if_block0 = ((ctx.$view == 'player' && ctx.$player && ctx.$player.currentMedia)) && create_if_block_1$8(component, ctx);

		var if_block1 = (ctx.alienImgInline) && create_if_block$a(component, ctx);

		return {
			c: function create() {
				if (if_block0) if_block0.c();
				text = createText("\n\n\n\n");
				if (if_block1) if_block1.c();
				if_block1_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block0) if_block0.m(target, anchor);
				insert(target, text, anchor);
				if (if_block1) if_block1.m(target, anchor);
				insert(target, if_block1_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if ((ctx.$view == 'player' && ctx.$player && ctx.$player.currentMedia)) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_1$8(component, ctx);
						if_block0.c();
						if_block0.m(text.parentNode, text);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.alienImgInline) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block$a(component, ctx);
						if_block1.c();
						if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (if_block0) if_block0.d(detach);
				if (detach) {
					detachNode(text);
				}

				if (if_block1) if_block1.d(detach);
				if (detach) {
					detachNode(if_block1_anchor);
				}
			}
		};
	}

	// (1:0) {#if ($view == 'player' && $player && $player.currentMedia)}
	function create_if_block_1$8(component, ctx) {
		var if_block_anchor;

		function select_block_type(ctx) {
			if (ctx.$player.isStream) return create_if_block_2$6;
			if (ctx.$player.currentMedia.artist) return create_if_block_5$3;
			if (ctx.$playlist) return create_if_block_9;
		}

		var current_block_type = select_block_type(ctx);
		var if_block = current_block_type && current_block_type(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if (if_block) if_block.d(1);
					if_block = current_block_type && current_block_type(component, ctx);
					if (if_block) if_block.c();
					if (if_block) if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (44:21) 
	function create_if_block_9(component, ctx) {
		var div2, div1, text0, div0, text1_value = ctx.$playlistMetadata.playlistLength, text1, text2;

		return {
			c: function create() {
				div2 = createElement("div");
				div1 = createElement("div");
				text0 = createText("Playlist length ");
				div0 = createElement("div");
				text1 = createText(text1_value);
				text2 = createText(" items");
				div0.className = "property svelte-1x310ql";
				toggleClass(div0, "warning", ctx.$playlistMetadata.playlistLength >= 5000);
				addLoc(div0, file$a, 47, 24, 1732);
				div1.className = "media_info svelte-1x310ql";
				addLoc(div1, file$a, 45, 6, 1654);
				div2.className = "speech-bubble svelte-1x310ql";
				addLoc(div2, file$a, 44, 4, 1620);
			},

			m: function mount(target, anchor) {
				insert(target, div2, anchor);
				append(div2, div1);
				append(div1, text0);
				append(div1, div0);
				append(div0, text1);
				append(div0, text2);
			},

			p: function update(changed, ctx) {
				if ((changed.$playlistMetadata) && text1_value !== (text1_value = ctx.$playlistMetadata.playlistLength)) {
					setData(text1, text1_value);
				}

				if (changed.$playlistMetadata) {
					toggleClass(div0, "warning", ctx.$playlistMetadata.playlistLength >= 5000);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div2);
				}
			}
		};
	}

	// (23:39) 
	function create_if_block_5$3(component, ctx) {
		var div4, div3, div0, text0_value = ctx.$player.currentMedia.song, text0, text1, div1, text2_value = ctx.$player.currentMedia.artist, text2, text3, div2, text4_value = ctx.$player.currentMedia.album, text4, text5, text6, text7;

		var if_block0 = (ctx.$player.currentMedia.year) && create_if_block_8(component, ctx);

		var if_block1 = (ctx.$player.bitrate) && create_if_block_7(component, ctx);

		var if_block2 = (ctx.$playlist) && create_if_block_6$1(component, ctx);

		return {
			c: function create() {
				div4 = createElement("div");
				div3 = createElement("div");
				div0 = createElement("div");
				text0 = createText(text0_value);
				text1 = createText(" is a song by\n        ");
				div1 = createElement("div");
				text2 = createText(text2_value);
				text3 = createText("\n        from album ");
				div2 = createElement("div");
				text4 = createText(text4_value);
				text5 = createText("\n        ");
				if (if_block0) if_block0.c();
				text6 = createText("\n        ");
				if (if_block1) if_block1.c();
				text7 = createText("\n        ");
				if (if_block2) if_block2.c();
				div0.className = "property song svelte-1x310ql";
				addLoc(div0, file$a, 26, 8, 754);
				div1.className = "property artist svelte-1x310ql";
				addLoc(div1, file$a, 27, 8, 836);
				div2.className = "property svelte-1x310ql";
				addLoc(div2, file$a, 28, 19, 920);
				div3.className = "media_info svelte-1x310ql";
				addLoc(div3, file$a, 25, 6, 721);
				div4.className = "speech-bubble svelte-1x310ql";
				addLoc(div4, file$a, 23, 4, 686);
			},

			m: function mount(target, anchor) {
				insert(target, div4, anchor);
				append(div4, div3);
				append(div3, div0);
				append(div0, text0);
				append(div3, text1);
				append(div3, div1);
				append(div1, text2);
				append(div3, text3);
				append(div3, div2);
				append(div2, text4);
				append(div3, text5);
				if (if_block0) if_block0.m(div3, null);
				append(div3, text6);
				if (if_block1) if_block1.m(div3, null);
				append(div3, text7);
				if (if_block2) if_block2.m(div3, null);
			},

			p: function update(changed, ctx) {
				if ((changed.$player) && text0_value !== (text0_value = ctx.$player.currentMedia.song)) {
					setData(text0, text0_value);
				}

				if ((changed.$player) && text2_value !== (text2_value = ctx.$player.currentMedia.artist)) {
					setData(text2, text2_value);
				}

				if ((changed.$player) && text4_value !== (text4_value = ctx.$player.currentMedia.album)) {
					setData(text4, text4_value);
				}

				if (ctx.$player.currentMedia.year) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_8(component, ctx);
						if_block0.c();
						if_block0.m(div3, text6);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.$player.bitrate) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_7(component, ctx);
						if_block1.c();
						if_block1.m(div3, text7);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (ctx.$playlist) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block_6$1(component, ctx);
						if_block2.c();
						if_block2.m(div3, null);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div4);
				}

				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
				if (if_block2) if_block2.d();
			}
		};
	}

	// (3:2) {#if $player.isStream}
	function create_if_block_2$6(component, ctx) {
		var div2, div1, text0, div0, text1_value = ctx.$player.currentMedia.song, text1, text2, text3;

		var if_block0 = (ctx.$player.bitrate) && create_if_block_4$4(component, ctx);

		var if_block1 = (ctx.$playlist) && create_if_block_3$5(component, ctx);

		return {
			c: function create() {
				div2 = createElement("div");
				div1 = createElement("div");
				text0 = createText("Internet radio stream ");
				div0 = createElement("div");
				text1 = createText(text1_value);
				text2 = createText("\n\n        ");
				if (if_block0) if_block0.c();
				text3 = createText("\n\n        ");
				if (if_block1) if_block1.c();
				div0.className = "property svelte-1x310ql";
				addLoc(div0, file$a, 6, 30, 181);
				div1.className = "media_info svelte-1x310ql";
				addLoc(div1, file$a, 5, 6, 126);
				div2.className = "speech-bubble svelte-1x310ql";
				addLoc(div2, file$a, 3, 4, 91);
			},

			m: function mount(target, anchor) {
				insert(target, div2, anchor);
				append(div2, div1);
				append(div1, text0);
				append(div1, div0);
				append(div0, text1);
				append(div1, text2);
				if (if_block0) if_block0.m(div1, null);
				append(div1, text3);
				if (if_block1) if_block1.m(div1, null);
			},

			p: function update(changed, ctx) {
				if ((changed.$player) && text1_value !== (text1_value = ctx.$player.currentMedia.song)) {
					setData(text1, text1_value);
				}

				if (ctx.$player.bitrate) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_4$4(component, ctx);
						if_block0.c();
						if_block0.m(div1, text3);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.$playlist) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_3$5(component, ctx);
						if_block1.c();
						if_block1.m(div1, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div2);
				}

				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
			}
		};
	}

	// (30:8) {#if $player.currentMedia.year}
	function create_if_block_8(component, ctx) {
		var text0, div, text1_value = ctx.$player.currentMedia.year, text1;

		return {
			c: function create() {
				text0 = createText("released in ");
				div = createElement("div");
				text1 = createText(text1_value);
				div.className = "property svelte-1x310ql";
				addLoc(div, file$a, 30, 22, 1039);
			},

			m: function mount(target, anchor) {
				insert(target, text0, anchor);
				insert(target, div, anchor);
				append(div, text1);
			},

			p: function update(changed, ctx) {
				if ((changed.$player) && text1_value !== (text1_value = ctx.$player.currentMedia.year)) {
					setData(text1, text1_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(text0);
					detachNode(div);
				}
			}
		};
	}

	// (33:8) {#if $player.bitrate}
	function create_if_block_7(component, ctx) {
		var text0, div, text1_value = ctx.$player.bitrate, text1;

		return {
			c: function create() {
				text0 = createText("bitrate ");
				div = createElement("div");
				text1 = createText(text1_value);
				div.className = "property svelte-1x310ql";
				addLoc(div, file$a, 33, 18, 1157);
			},

			m: function mount(target, anchor) {
				insert(target, text0, anchor);
				insert(target, div, anchor);
				append(div, text1);
			},

			p: function update(changed, ctx) {
				if ((changed.$player) && text1_value !== (text1_value = ctx.$player.bitrate)) {
					setData(text1, text1_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(text0);
					detachNode(div);
				}
			}
		};
	}

	// (36:8) {#if $playlist}
	function create_if_block_6$1(component, ctx) {
		var br, text0, div, text1_value = ctx.$playlistMetadata.playlistLength, text1, text2;

		return {
			c: function create() {
				br = createElement("br");
				text0 = createText("\n          \n          Playlist length ");
				div = createElement("div");
				text1 = createText(text1_value);
				text2 = createText(" items");
				addLoc(br, file$a, 36, 10, 1251);
				div.className = "property svelte-1x310ql";
				toggleClass(div, "warning", ctx.$playlistMetadata.playlistLength >= 5000);
				addLoc(div, file$a, 38, 26, 1313);
			},

			m: function mount(target, anchor) {
				insert(target, br, anchor);
				insert(target, text0, anchor);
				insert(target, div, anchor);
				append(div, text1);
				append(div, text2);
			},

			p: function update(changed, ctx) {
				if ((changed.$playlistMetadata) && text1_value !== (text1_value = ctx.$playlistMetadata.playlistLength)) {
					setData(text1, text1_value);
				}

				if (changed.$playlistMetadata) {
					toggleClass(div, "warning", ctx.$playlistMetadata.playlistLength >= 5000);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(br);
					detachNode(text0);
					detachNode(div);
				}
			}
		};
	}

	// (9:8) {#if $player.bitrate}
	function create_if_block_4$4(component, ctx) {
		var br, text0, div, text1_value = ctx.$player.bitrate, text1;

		return {
			c: function create() {
				br = createElement("br");
				text0 = createText("\n          bitrate ");
				div = createElement("div");
				text1 = createText(text1_value);
				addLoc(br, file$a, 9, 10, 278);
				div.className = "property svelte-1x310ql";
				addLoc(div, file$a, 10, 18, 301);
			},

			m: function mount(target, anchor) {
				insert(target, br, anchor);
				insert(target, text0, anchor);
				insert(target, div, anchor);
				append(div, text1);
			},

			p: function update(changed, ctx) {
				if ((changed.$player) && text1_value !== (text1_value = ctx.$player.bitrate)) {
					setData(text1, text1_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(br);
					detachNode(text0);
					detachNode(div);
				}
			}
		};
	}

	// (14:8) {#if $playlist}
	function create_if_block_3$5(component, ctx) {
		var br, text0, div, text1, text2_value = ctx.$playlistMetadata.playlistLength, text2, text3;

		return {
			c: function create() {
				br = createElement("br");
				text0 = createText("\n          \n            Non-streaming playlist length ");
				div = createElement("div");
				text1 = createText("(");
				text2 = createText(text2_value);
				text3 = createText(" items)");
				addLoc(br, file$a, 14, 10, 396);
				div.className = "property svelte-1x310ql";
				toggleClass(div, "warning", ctx.$playlistMetadata.playlistLength >= 5000);
				addLoc(div, file$a, 16, 42, 474);
			},

			m: function mount(target, anchor) {
				insert(target, br, anchor);
				insert(target, text0, anchor);
				insert(target, div, anchor);
				append(div, text1);
				append(div, text2);
				append(div, text3);
			},

			p: function update(changed, ctx) {
				if ((changed.$playlistMetadata) && text2_value !== (text2_value = ctx.$playlistMetadata.playlistLength)) {
					setData(text2, text2_value);
				}

				if (changed.$playlistMetadata) {
					toggleClass(div, "warning", ctx.$playlistMetadata.playlistLength >= 5000);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(br);
					detachNode(text0);
					detachNode(div);
				}
			}
		};
	}

	// (57:0) {#if alienImgInline}
	function create_if_block$a(component, ctx) {
		var img;

		return {
			c: function create() {
				img = createElement("img");
				img.src = ctx.alienImgInline;
				img.className = "alien svelte-1x310ql";
				addLoc(img, file$a, 57, 2, 1972);
			},

			m: function mount(target, anchor) {
				insert(target, img, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.alienImgInline) {
					img.src = ctx.alienImgInline;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(img);
				}
			}
		};
	}

	function SidebarBottom(options) {
		this._debugName = '<SidebarBottom>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<SidebarBottom> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["view","player","playlist","playlistMetadata"]), options.data);
		this.store._add(this, ["view","player","playlist","playlistMetadata"]);
		if (!('$view' in this._state)) console.warn("<SidebarBottom> was created without expected data property '$view'");
		if (!('$player' in this._state)) console.warn("<SidebarBottom> was created without expected data property '$player'");
		if (!('$playlist' in this._state)) console.warn("<SidebarBottom> was created without expected data property '$playlist'");
		if (!('$playlistMetadata' in this._state)) console.warn("<SidebarBottom> was created without expected data property '$playlistMetadata'");
		if (!('alienImgInline' in this._state)) console.warn("<SidebarBottom> was created without expected data property 'alienImgInline'");
		this._intro = !!options.intro;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$c(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$9.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(SidebarBottom.prototype, protoDev);

	SidebarBottom.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/navigation/src/SidebarBottoms.html generated by Svelte v2.16.1 */

	function create_main_fragment$d(component, ctx) {
		var if_block_anchor, current;

		var if_block = (ctx.$view == 'player') && create_if_block$b(component);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.$view == 'player') {
					if (!if_block) {
						if_block = create_if_block$b(component);
						if_block.c();
					}
					if_block.i(if_block_anchor.parentNode, if_block_anchor);
				} else if (if_block) {
					if_block.o(function() {
						if_block.d(1);
						if_block = null;
					});
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (if_block) if_block.o(outrocallback);
				else outrocallback();

				current = false;
			},

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (1:0) {#if $view == 'player'}
	function create_if_block$b(component, ctx) {
		var current;

		var playersidebarbottom = new SidebarBottom({
			root: component.root,
			store: component.store
		});

		return {
			c: function create() {
				playersidebarbottom._fragment.c();
			},

			m: function mount(target, anchor) {
				playersidebarbottom._mount(target, anchor);
				current = true;
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (playersidebarbottom) playersidebarbottom._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy(detach) {
				playersidebarbottom.destroy(detach);
			}
		};
	}

	function SidebarBottoms(options) {
		this._debugName = '<SidebarBottoms>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<SidebarBottoms> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["view"]), options.data);
		this.store._add(this, ["view"]);
		if (!('$view' in this._state)) console.warn("<SidebarBottoms> was created without expected data property '$view'");
		this._intro = !!options.intro;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$d(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(SidebarBottoms.prototype, protoDev);

	SidebarBottoms.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	const img$2 = 'data:image/png;base64,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';

	const img$3 = 'data:image/png;base64,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';

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/dynamics/src/NearbyDevices.html generated by Svelte v2.16.1 */



	function identifyThisDevice({ thisDeviceId, selectedDeviceId, homebase, homebaseName }) { // hardcore computed property which returns a function which receives further dependent data to calculate the result... this this computed property has some local component store properties and a template object as inputs (template expressions can be used in helpers OR computed properties)

	  return (device) => {
	    const addedProps = {
	      thisDevice: thisDeviceId == device.deviceId,
	      selectedDevice: selectedDeviceId == device.deviceId,
	      homebase: homebaseName ? device.deviceId == homebaseName : device.deviceId == thisDeviceId,
	      homebaseName
	    };

	    return Object.assign(device, addedProps);
	  }
	}

	function homebaseSymbolVisible({ thisDeviceId, selectedDeviceId, homebase, disableDeviceSelector, viewDef }) {
	  return (view) => {

	    if(disableDeviceSelector || !viewDef || viewDef.deviceSelector == 'false' || !homebase) {
	      return false;
	    }

	    return true;
	  }
	}

	function tunnelingSymbolVisible({ homebase, disableDeviceSelector, viewDef }) {
	  return (view) => {

	    if(disableDeviceSelector || !viewDef || viewDef.deviceSelector == 'false' || homebase) {
	      return false;
	    }

	    return true;
	  }
	}

	function homebaseEscapeSymbolVisible({ thisDeviceId, selectedDeviceId }) {
	  return (connected, view) => {
	    if(view == 'home' && thisDeviceId != selectedDeviceId && !connected) {
	      return true;
	    }
	  }
	}

	function nearbyDeviceStyles(el) {
		return getNearbyDeviceStyles(el);
	}

	var methods$5 = {
	  toggleNearbyDevices() { // duplication from ActionBar.html just to handle the 'd' keypress shortcut !!
	    const isVisible = this.store.get().nearbyDevicesMenuVisible;
	    this.store.set({ nearbyDevicesMenuVisible: !isVisible });
	  },
	  morphIntoNearbyDevice({ deviceId, ip }) {
	    if(deviceId == this.store.get().meta.thisDeviceId) {
	      console.log(`Morphing back into /this/ device`);
	      this.store.switch();
	    } else {
	      console.log(`Morphing into ${deviceId}:${ip}`);
	      this.store.switch({ ip, deviceId }); // we pass deviceId in case we cannot actually connect to device -> se still fill the state with correct name
	    }
	  },
	  switchToThisDevice() {
	    this.store.switch();
	  },
	  dumpInfo() {
	    console.log(this.get());
	  }
	};

	function oncreate$a() {
	  this.set({ homebaseImgInline: img$2, tunnelingImgInline: img$3 });

	  // adds thisDeviceId, selectedDeviceId, and optionally any part of definition (from this device.def)
	  this.store.entangle(this);

	  this.set({ lineHeight: '1.2' });

	  this.listener = this.store.on('state', ({ current, changed, previous }) => {
	    if(current.thisDeviceState) { // todo: think if we really need to observe all state changes... AND if we get all differences inside thisDeviceState when we observe multiconnected store "state" event
	      const nearbyDevices = current.nearbyDevices;

	      if(nearbyDevices)  {

	        // count visible devices (property hiddenInGui : false)... a bit convoluted but it's simple
	        const count = Object.keys(nearbyDevices).map(deviceId => !nearbyDevices[deviceId].hiddenInGui).filter(visible => visible).length;

	        this.set({ nearbyDevicesCount: count });

	        if(count < 7) {
	          this.set({ lineHeight: '3.2' });
	        } else if(count < 10) {
	          this.set({ lineHeight: '2.4' });
	        } else if(count <= 15) {
	          this.set({ lineHeight: '1.2' });
	        } else {
	          this.set({ lineHeight: '1.0' });
	        }
	      }
	    }
	  });

	}
	function ondestroy() {
	  this.listener.cancel();
	}
	const getNearbyDeviceStyles = ({ stale, hiddenInGui, thisDevice, selectedDevice, homebase, homebaseName, homebaseIsDefined }) => (
	  `
    color: ${stale || (selectedDevice && !homebase) ? 'white' : 'black'};
    font-weight: ${homebase ? 'bold' : 'normal'};
    font-style: ${homebaseName && thisDevice ? 'italic' : 'normal'};
    background-color: ${stale ? 'black' : (selectedDevice ? (homebase ? '#26A9B7' : '#873BBF') : '')};
    display: ${hiddenInGui ? 'none' : 'block'};
  `
	);
	//opacity: ${selectedDevice ? '0.5' : '1.0'};

	const file$b = "Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/dynamics/src/NearbyDevices.html";

	function click_handler(event) {
		const { component, ctx } = this._svelte;

		component.morphIntoNearbyDevice(ctx.$nearbyDevices[ctx.deviceId]);
	}

	function get_each_context$1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.deviceId = list[i];
		return child_ctx;
	}

	function create_main_fragment$e(component, ctx) {
		var text0, div1, div0, text1, text2, current;

		var if_block0 = (ctx.loaded && ctx.$nearbyDevicesMenuVisible && ctx.viewDef && ctx.viewDef.deviceSelector != 'false') && create_if_block_3$6(component, ctx);

		var if_block1 = (ctx.homebaseImgInline) && create_if_block_2$7(component, ctx);

		var if_block2 = (ctx.tunnelingImgInline) && create_if_block_1$9(component, ctx);

		var if_block3 = (ctx.homebaseImgInline) && create_if_block$c(component, ctx);

		return {
			c: function create() {
				if (if_block0) if_block0.c();
				text0 = createText("\n\n");
				div1 = createElement("div");
				div0 = createElement("div");
				if (if_block1) if_block1.c();
				text1 = createText("\n\n    ");
				if (if_block2) if_block2.c();
				text2 = createText("\n\n    ");
				if (if_block3) if_block3.c();
				div0.id = "deviceSelector";
				div0.className = "svelte-1yxvmgz";
				addLoc(div0, file$b, 36, 2, 1740);
				div1.id = "bottom_icons";
				div1.className = "svelte-1yxvmgz";
				addLoc(div1, file$b, 34, 0, 1713);
			},

			m: function mount(target, anchor) {
				if (if_block0) if_block0.m(target, anchor);
				insert(target, text0, anchor);
				insert(target, div1, anchor);
				append(div1, div0);
				if (if_block1) if_block1.m(div0, null);
				append(div0, text1);
				if (if_block2) if_block2.m(div0, null);
				append(div0, text2);
				if (if_block3) if_block3.m(div0, null);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.loaded && ctx.$nearbyDevicesMenuVisible && ctx.viewDef && ctx.viewDef.deviceSelector != 'false') {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_3$6(component, ctx);
						if_block0.c();
						if_block0.m(text0.parentNode, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.homebaseImgInline) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_2$7(component, ctx);
						if_block1.c();
						if_block1.m(div0, text1);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (ctx.tunnelingImgInline) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block_1$9(component, ctx);
						if_block2.c();
						if_block2.m(div0, text2);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}

				if (ctx.homebaseImgInline) {
					if (if_block3) {
						if_block3.p(changed, ctx);
					} else {
						if_block3 = create_if_block$c(component, ctx);
						if_block3.c();
						if_block3.m(div0, null);
					}
				} else if (if_block3) {
					if_block3.d(1);
					if_block3 = null;
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (if_block0) if_block0.d(detach);
				if (detach) {
					detachNode(text0);
					detachNode(div1);
				}

				if (if_block1) if_block1.d();
				if (if_block2) if_block2.d();
				if (if_block3) if_block3.d();
			}
		};
	}

	// (3:0) {#if loaded && $nearbyDevicesMenuVisible && viewDef && viewDef.deviceSelector != 'false'}
	function create_if_block_3$6(component, ctx) {
		var if_block_anchor;

		var if_block = (!ctx.disableDeviceSelector) && create_if_block_4$5(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (!ctx.disableDeviceSelector) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_4$5(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (9:2) {#if !disableDeviceSelector}
	function create_if_block_4$5(component, ctx) {
		var if_block_anchor;

		var if_block = (ctx.$nearbyDevices && ctx.Object.keys(ctx.$nearbyDevices).length > 0) && create_if_block_5$4(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.$nearbyDevices && ctx.Object.keys(ctx.$nearbyDevices).length > 0) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_5$4(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (11:4) {#if $nearbyDevices && Object.keys($nearbyDevices).length > 0}
	function create_if_block_5$4(component, ctx) {
		var div1, text0, div0, text1, text2;

		var each_value = ctx.Object.keys(ctx.$nearbyDevices).sort();

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$1(component, get_each_context$1(ctx, each_value, i));
		}

		return {
			c: function create() {
				div1 = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				text0 = createText("\n        ");
				div0 = createElement("div");
				text1 = createText(ctx.nearbyDevicesCount);
				text2 = createText(" devices");
				div0.className = "devices_total svelte-1yxvmgz";
				addLoc(div0, file$b, 24, 8, 1591);
				setStyle(div1, "line-height", "" + ctx.lineHeight + "em");
				div1.id = "nearby_devices";
				div1.className = "svelte-1yxvmgz";
				toggleClass(div1, "nonRPi", !ctx.atRPi);
				addLoc(div1, file$b, 11, 6, 863);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div1, null);
				}

				append(div1, text0);
				append(div1, div0);
				append(div0, text1);
				append(div0, text2);
			},

			p: function update(changed, ctx) {
				if (changed.identifyThisDevice || changed.$nearbyDevices || changed.Object || changed.isDevCluster) {
					each_value = ctx.Object.keys(ctx.$nearbyDevices).sort();

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$1(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$1(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div1, text0);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}

				if (changed.nearbyDevicesCount) {
					setData(text1, ctx.nearbyDevicesCount);
				}

				if (changed.lineHeight) {
					setStyle(div1, "line-height", "" + ctx.lineHeight + "em");
				}

				if (changed.atRPi) {
					toggleClass(div1, "nonRPi", !ctx.atRPi);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (15:12) {#if $nearbyDevices[deviceId].hasErrors}
	function create_if_block_7$1(component, ctx) {
		var span;

		return {
			c: function create() {
				span = createElement("span");
				span.textContent = "!";
				span.className = "error svelte-1yxvmgz";
				addLoc(span, file$b, 14, 52, 1226);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(span);
				}
			}
		};
	}

	// (18:14) {#if isDevCluster}
	function create_if_block_6$2(component, ctx) {
		var span, text_value = ctx.$nearbyDevices[ctx.deviceId].ip, text;

		return {
			c: function create() {
				span = createElement("span");
				text = createText(text_value);
				span.className = "ip svelte-1yxvmgz";
				addLoc(span, file$b, 18, 16, 1440);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
				append(span, text);
			},

			p: function update(changed, ctx) {
				if ((changed.$nearbyDevices || changed.Object) && text_value !== (text_value = ctx.$nearbyDevices[ctx.deviceId].ip)) {
					setData(text, text_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(span);
				}
			}
		};
	}

	// (13:8) {#each Object.keys($nearbyDevices).sort() as deviceId}
	function create_each_block$1(component, ctx) {
		var div, text0_value = ctx.deviceId, text0, text1, text2_value = ctx.$nearbyDevices[ctx.deviceId].playing ? (ctx.$nearbyDevices[ctx.deviceId].mediaType == 'video' ? ' ▶' : ' ♫' ) : '', text2, text3, div_style_value;

		var if_block0 = (ctx.$nearbyDevices[ctx.deviceId].hasErrors) && create_if_block_7$1();

		var if_block1 = (ctx.isDevCluster) && create_if_block_6$2(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				if (if_block0) if_block0.c();
				text0 = createText(text0_value);
				text1 = createText("\n              ");
				text2 = createText(text2_value);
				text3 = createText("\n\n              ");
				if (if_block1) if_block1.c();
				div._svelte = { component, ctx };

				addListener(div, "click", click_handler);
				div.className = "device svelte-1yxvmgz";
				div.style.cssText = div_style_value = nearbyDeviceStyles(ctx.identifyThisDevice(ctx.$nearbyDevices[ctx.deviceId]));
				addLoc(div, file$b, 13, 10, 1021);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				if (if_block0) if_block0.m(div, null);
				append(div, text0);
				append(div, text1);
				append(div, text2);
				append(div, text3);
				if (if_block1) if_block1.m(div, null);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (ctx.$nearbyDevices[ctx.deviceId].hasErrors) {
					if (!if_block0) {
						if_block0 = create_if_block_7$1();
						if_block0.c();
						if_block0.m(div, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if ((changed.Object || changed.$nearbyDevices) && text0_value !== (text0_value = ctx.deviceId)) {
					setData(text0, text0_value);
				}

				if ((changed.$nearbyDevices || changed.Object) && text2_value !== (text2_value = ctx.$nearbyDevices[ctx.deviceId].playing ? (ctx.$nearbyDevices[ctx.deviceId].mediaType == 'video' ? ' ▶' : ' ♫' ) : '')) {
					setData(text2, text2_value);
				}

				if (ctx.isDevCluster) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_6$2(component, ctx);
						if_block1.c();
						if_block1.m(div, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				div._svelte.ctx = ctx;
				if ((changed.identifyThisDevice || changed.$nearbyDevices || changed.Object) && div_style_value !== (div_style_value = nearbyDeviceStyles(ctx.identifyThisDevice(ctx.$nearbyDevices[ctx.deviceId])))) {
					div.style.cssText = div_style_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
				removeListener(div, "click", click_handler);
			}
		};
	}

	// (39:4) {#if homebaseImgInline}
	function create_if_block_2$7(component, ctx) {
		var img;

		function click_handler_1(event) {
			component.toggleNearbyDevices();
		}

		return {
			c: function create() {
				img = createElement("img");
				addListener(img, "click", click_handler_1);
				img.src = ctx.homebaseImgInline;
				img.alt = "deviceSelector";
				img.className = "svelte-1yxvmgz";
				toggleClass(img, "hidden", !ctx.homebaseSymbolVisible(ctx.$view));
				addLoc(img, file$b, 39, 6, 1801);
			},

			m: function mount(target, anchor) {
				insert(target, img, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.homebaseImgInline) {
					img.src = ctx.homebaseImgInline;
				}

				if ((changed.homebaseSymbolVisible || changed.$view)) {
					toggleClass(img, "hidden", !ctx.homebaseSymbolVisible(ctx.$view));
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(img);
				}

				removeListener(img, "click", click_handler_1);
			}
		};
	}

	// (43:4) {#if tunnelingImgInline}
	function create_if_block_1$9(component, ctx) {
		var img;

		function click_handler_1(event) {
			component.toggleNearbyDevices();
		}

		return {
			c: function create() {
				img = createElement("img");
				addListener(img, "click", click_handler_1);
				img.src = ctx.tunnelingImgInline;
				img.alt = "deviceSelector";
				img.className = "svelte-1yxvmgz";
				toggleClass(img, "hidden", !ctx.tunnelingSymbolVisible(ctx.$view));
				addLoc(img, file$b, 43, 6, 1978);
			},

			m: function mount(target, anchor) {
				insert(target, img, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.tunnelingImgInline) {
					img.src = ctx.tunnelingImgInline;
				}

				if ((changed.tunnelingSymbolVisible || changed.$view)) {
					toggleClass(img, "hidden", !ctx.tunnelingSymbolVisible(ctx.$view));
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(img);
				}

				removeListener(img, "click", click_handler_1);
			}
		};
	}

	// (47:4) {#if homebaseImgInline}
	function create_if_block$c(component, ctx) {
		var img;

		function click_handler_1(event) {
			component.switchToThisDevice();
		}

		return {
			c: function create() {
				img = createElement("img");
				addListener(img, "click", click_handler_1);
				img.src = ctx.homebaseImgInline;
				img.alt = "switchToThisDevice";
				img.className = "svelte-1yxvmgz";
				toggleClass(img, "hidden", !ctx.homebaseEscapeSymbolVisible(ctx.$connected, ctx.$view));
				addLoc(img, file$b, 47, 6, 2156);
			},

			m: function mount(target, anchor) {
				insert(target, img, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.homebaseImgInline) {
					img.src = ctx.homebaseImgInline;
				}

				if ((changed.homebaseEscapeSymbolVisible || changed.$connected || changed.$view)) {
					toggleClass(img, "hidden", !ctx.homebaseEscapeSymbolVisible(ctx.$connected, ctx.$view));
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(img);
				}

				removeListener(img, "click", click_handler_1);
			}
		};
	}

	function NearbyDevices(options) {
		this._debugName = '<NearbyDevices>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<NearbyDevices> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(assign({ Object : Object }, this.store._init(["nearbyDevicesMenuVisible","nearbyDevices","view","connected"])), options.data);
		this.store._add(this, ["nearbyDevicesMenuVisible","nearbyDevices","view","connected"]);

		this._recompute({ thisDeviceId: 1, selectedDeviceId: 1, homebase: 1, homebaseName: 1, disableDeviceSelector: 1, viewDef: 1 }, this._state);
		if (!('thisDeviceId' in this._state)) console.warn("<NearbyDevices> was created without expected data property 'thisDeviceId'");
		if (!('selectedDeviceId' in this._state)) console.warn("<NearbyDevices> was created without expected data property 'selectedDeviceId'");
		if (!('homebase' in this._state)) console.warn("<NearbyDevices> was created without expected data property 'homebase'");
		if (!('homebaseName' in this._state)) console.warn("<NearbyDevices> was created without expected data property 'homebaseName'");
		if (!('disableDeviceSelector' in this._state)) console.warn("<NearbyDevices> was created without expected data property 'disableDeviceSelector'");
		if (!('viewDef' in this._state)) console.warn("<NearbyDevices> was created without expected data property 'viewDef'");
		if (!('loaded' in this._state)) console.warn("<NearbyDevices> was created without expected data property 'loaded'");
		if (!('$nearbyDevicesMenuVisible' in this._state)) console.warn("<NearbyDevices> was created without expected data property '$nearbyDevicesMenuVisible'");
		if (!('$nearbyDevices' in this._state)) console.warn("<NearbyDevices> was created without expected data property '$nearbyDevices'");

		if (!('lineHeight' in this._state)) console.warn("<NearbyDevices> was created without expected data property 'lineHeight'");
		if (!('atRPi' in this._state)) console.warn("<NearbyDevices> was created without expected data property 'atRPi'");

		if (!('isDevCluster' in this._state)) console.warn("<NearbyDevices> was created without expected data property 'isDevCluster'");
		if (!('nearbyDevicesCount' in this._state)) console.warn("<NearbyDevices> was created without expected data property 'nearbyDevicesCount'");
		if (!('homebaseImgInline' in this._state)) console.warn("<NearbyDevices> was created without expected data property 'homebaseImgInline'");

		if (!('$view' in this._state)) console.warn("<NearbyDevices> was created without expected data property '$view'");
		if (!('tunnelingImgInline' in this._state)) console.warn("<NearbyDevices> was created without expected data property 'tunnelingImgInline'");


		if (!('$connected' in this._state)) console.warn("<NearbyDevices> was created without expected data property '$connected'");
		this._intro = !!options.intro;

		this._handlers.destroy = [ondestroy, removeFromStore];

		this._fragment = create_main_fragment$e(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$a.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(NearbyDevices.prototype, protoDev);
	assign(NearbyDevices.prototype, methods$5);

	NearbyDevices.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('identifyThisDevice' in newState && !this._updatingReadonlyProperty) throw new Error("<NearbyDevices>: Cannot set read-only property 'identifyThisDevice'");
		if ('homebaseSymbolVisible' in newState && !this._updatingReadonlyProperty) throw new Error("<NearbyDevices>: Cannot set read-only property 'homebaseSymbolVisible'");
		if ('tunnelingSymbolVisible' in newState && !this._updatingReadonlyProperty) throw new Error("<NearbyDevices>: Cannot set read-only property 'tunnelingSymbolVisible'");
		if ('homebaseEscapeSymbolVisible' in newState && !this._updatingReadonlyProperty) throw new Error("<NearbyDevices>: Cannot set read-only property 'homebaseEscapeSymbolVisible'");
	};

	NearbyDevices.prototype._recompute = function _recompute(changed, state) {
		if (changed.thisDeviceId || changed.selectedDeviceId || changed.homebase || changed.homebaseName) {
			if (this._differs(state.identifyThisDevice, (state.identifyThisDevice = identifyThisDevice(state)))) changed.identifyThisDevice = true;
		}

		if (changed.thisDeviceId || changed.selectedDeviceId || changed.homebase || changed.disableDeviceSelector || changed.viewDef) {
			if (this._differs(state.homebaseSymbolVisible, (state.homebaseSymbolVisible = homebaseSymbolVisible(state)))) changed.homebaseSymbolVisible = true;
		}

		if (changed.homebase || changed.disableDeviceSelector || changed.viewDef) {
			if (this._differs(state.tunnelingSymbolVisible, (state.tunnelingSymbolVisible = tunnelingSymbolVisible(state)))) changed.tunnelingSymbolVisible = true;
		}

		if (changed.thisDeviceId || changed.selectedDeviceId) {
			if (this._differs(state.homebaseEscapeSymbolVisible, (state.homebaseEscapeSymbolVisible = homebaseEscapeSymbolVisible(state)))) changed.homebaseEscapeSymbolVisible = true;
		}
	};

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/widgets/src/Calendar.html generated by Svelte v2.16.1 */

	const file$c = "Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/widgets/src/Calendar.html";

	function create_main_fragment$f(component, ctx) {
		var div1, div0, current;

		var if_block = (ctx.$connected) && create_if_block$d();

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				if (if_block) if_block.c();
				div0.id = "calendar";
				div0.className = "svelte-11xycy";
				addLoc(div0, file$c, 1, 2, 30);
				div1.id = "calendar_wrapper";
				div1.className = "svelte-11xycy";
				addLoc(div1, file$c, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				if (if_block) if_block.m(div0, null);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.$connected) {
					if (!if_block) {
						if_block = create_if_block$d();
						if_block.c();
						if_block.m(div0, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				if (if_block) if_block.d();
			}
		};
	}

	// (3:4) {#if $connected}
	function create_if_block$d(component, ctx) {
		var div, span;

		return {
			c: function create() {
				div = createElement("div");
				span = createElement("span");
				span.className = "svelte-11xycy";
				addLoc(span, file$c, 3, 22, 93);
				div.id = "today";
				div.className = "svelte-11xycy";
				addLoc(div, file$c, 3, 6, 77);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, span);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	function Calendar(options) {
		this._debugName = '<Calendar>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<Calendar> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["connected"]), options.data);
		this.store._add(this, ["connected"]);
		if (!('$connected' in this._state)) console.warn("<Calendar> was created without expected data property '$connected'");
		this._intro = !!options.intro;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$f(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}

		this._intro = true;
	}

	assign(Calendar.prototype, protoDev);

	Calendar.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/widgets/src/WeatherWidget.html generated by Svelte v2.16.1 */



	const file$d = "Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/widgets/src/WeatherWidget.html";

	function create_main_fragment$g(component, ctx) {
		var if_block_anchor, current;

		var if_block = (ctx.weather) && create_if_block$e(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.weather) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$e(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (1:0) {#if weather}
	function create_if_block$e(component, ctx) {
		var div3, div2, div0, span, text0_value = ctx.weather.tempDirection && ctx.weather.tempDirection.symbol ? ctx.weather.tempDirection.symbol : '', text0, text1_value = ctx.weather.temperature, text1, text2, text3_value = ctx.weather.tempUnit, text3, text4, div1, text5_value = ctx.weather.humidity, text5, text6;

		return {
			c: function create() {
				div3 = createElement("div");
				div2 = createElement("div");
				div0 = createElement("div");
				span = createElement("span");
				text0 = createText(text0_value);
				text1 = createText(text1_value);
				text2 = createText("°");
				text3 = createText(text3_value);
				text4 = createText("\n      ");
				div1 = createElement("div");
				text5 = createText(text5_value);
				text6 = createText("%");
				span.className = "direction svelte-b51ej";
				addLoc(span, file$d, 4, 8, 177);
				div0.id = "temp";
				setStyle(div0, "background-color", "hsl(" + util.mapTempToHUE(ctx.weather.temperature) + ",100%,50%)");
				div0.className = "svelte-b51ej";
				addLoc(div0, file$d, 3, 6, 72);
				div1.id = "humidity";
				div1.className = "svelte-b51ej";
				addLoc(div1, file$d, 6, 6, 359);
				div2.id = "weather";
				div2.className = "svelte-b51ej";
				addLoc(div2, file$d, 2, 4, 47);
				div3.id = "weather_wrapper";
				div3.className = "svelte-b51ej";
				addLoc(div3, file$d, 1, 2, 16);
			},

			m: function mount(target, anchor) {
				insert(target, div3, anchor);
				append(div3, div2);
				append(div2, div0);
				append(div0, span);
				append(span, text0);
				append(div0, text1);
				append(div0, text2);
				append(div0, text3);
				append(div2, text4);
				append(div2, div1);
				append(div1, text5);
				append(div1, text6);
			},

			p: function update(changed, ctx) {
				if ((changed.weather) && text0_value !== (text0_value = ctx.weather.tempDirection && ctx.weather.tempDirection.symbol ? ctx.weather.tempDirection.symbol : '')) {
					setData(text0, text0_value);
				}

				if ((changed.weather) && text1_value !== (text1_value = ctx.weather.temperature)) {
					setData(text1, text1_value);
				}

				if ((changed.weather) && text3_value !== (text3_value = ctx.weather.tempUnit)) {
					setData(text3, text3_value);
				}

				if (changed.weather) {
					setStyle(div0, "background-color", "hsl(" + util.mapTempToHUE(ctx.weather.temperature) + ",100%,50%)");
				}

				if ((changed.weather) && text5_value !== (text5_value = ctx.weather.humidity)) {
					setData(text5, text5_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div3);
				}
			}
		};
	}

	function WeatherWidget(options) {
		this._debugName = '<WeatherWidget>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign({}, options.data);
		if (!('weather' in this._state)) console.warn("<WeatherWidget> was created without expected data property 'weather'");
		this._intro = !!options.intro;

		this._fragment = create_main_fragment$g(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}

		this._intro = true;
	}

	assign(WeatherWidget.prototype, protoDev);

	WeatherWidget.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	const img$4 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgEAAAG2CAYAAADmwVUxAAAEvWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS41LjAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyIKICAgIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIKICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgdGlmZjpJbWFnZUxlbmd0aD0iNDM4IgogICB0aWZmOkltYWdlV2lkdGg9IjUxMyIKICAgdGlmZjpSZXNvbHV0aW9uVW5pdD0iMiIKICAgdGlmZjpYUmVzb2x1dGlvbj0iMzAwLjAiCiAgIHRpZmY6WVJlc29sdXRpb249IjMwMC4wIgogICBleGlmOlBpeGVsWERpbWVuc2lvbj0iNTEzIgogICBleGlmOlBpeGVsWURpbWVuc2lvbj0iNDM4IgogICBleGlmOkNvbG9yU3BhY2U9IjEiCiAgIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiCiAgIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIKICAgeG1wOk1vZGlmeURhdGU9IjIw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';

	const img$5 = 'data:image/png;base64,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';

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/widgets/src/Suntime.html generated by Svelte v2.16.1 */



	function oncreate$b() {
	  this.set({ sunriseImgInline: img$4, sunsetImgInline: img$5 });

	  this.store.entangle(this);
	}
	const file$e = "Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/widgets/src/Suntime.html";

	function create_main_fragment$h(component, ctx) {
		var div, text, current;

		var if_block0 = (ctx.sunrise) && create_if_block_2$8(component, ctx);

		var if_block1 = (ctx.sunset) && create_if_block$f(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				if (if_block0) if_block0.c();
				text = createText("\n\n  ");
				if (if_block1) if_block1.c();
				div.id = "suntime";
				addLoc(div, file$e, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				if (if_block0) if_block0.m(div, null);
				append(div, text);
				if (if_block1) if_block1.m(div, null);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.sunrise) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_2$8(component, ctx);
						if_block0.c();
						if_block0.m(div, text);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.sunset) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block$f(component, ctx);
						if_block1.c();
						if_block1.m(div, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
			}
		};
	}

	// (2:2) {#if sunrise}
	function create_if_block_2$8(component, ctx) {
		var div1, div0, text0, span, text1;

		var if_block = (ctx.sunriseImgInline) && create_if_block_3$7(component, ctx);

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				if (if_block) if_block.c();
				text0 = createText("\n        ");
				span = createElement("span");
				text1 = createText(ctx.sunrise);
				span.className = "svelte-1gwsqnl";
				addLoc(span, file$e, 7, 8, 288);
				div0.className = "inner svelte-1gwsqnl";
				addLoc(div0, file$e, 3, 6, 160);
				div1.id = "sunrise";
				div1.className = "svelte-1gwsqnl";
				toggleClass(div1, "protect_visibility", ctx.viewDef && ctx.viewDef.protectVisibility && (!ctx.$player || ctx.$player.paused));
				addLoc(div1, file$e, 2, 4, 39);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				if (if_block) if_block.m(div0, null);
				append(div0, text0);
				append(div0, span);
				append(span, text1);
			},

			p: function update(changed, ctx) {
				if (ctx.sunriseImgInline) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_3$7(component, ctx);
						if_block.c();
						if_block.m(div0, text0);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (changed.sunrise) {
					setData(text1, ctx.sunrise);
				}

				if ((changed.viewDef || changed.$player)) {
					toggleClass(div1, "protect_visibility", ctx.viewDef && ctx.viewDef.protectVisibility && (!ctx.$player || ctx.$player.paused));
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				if (if_block) if_block.d();
			}
		};
	}

	// (5:8) {#if sunriseImgInline}
	function create_if_block_3$7(component, ctx) {
		var img;

		return {
			c: function create() {
				img = createElement("img");
				img.src = ctx.sunriseImgInline;
				img.alt = "sunrise";
				img.className = "svelte-1gwsqnl";
				addLoc(img, file$e, 5, 10, 221);
			},

			m: function mount(target, anchor) {
				insert(target, img, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.sunriseImgInline) {
					img.src = ctx.sunriseImgInline;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(img);
				}
			}
		};
	}

	// (13:2) {#if sunset}
	function create_if_block$f(component, ctx) {
		var div1, div0, text0, span, text1;

		var if_block = (ctx.sunsetImgInline) && create_if_block_1$a(component, ctx);

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				if (if_block) if_block.c();
				text0 = createText("\n        ");
				span = createElement("span");
				text1 = createText(ctx.sunset);
				span.className = "svelte-1gwsqnl";
				addLoc(span, file$e, 18, 8, 608);
				div0.className = "inner svelte-1gwsqnl";
				addLoc(div0, file$e, 14, 6, 483);
				div1.id = "sunset";
				div1.className = "svelte-1gwsqnl";
				toggleClass(div1, "protect_visibility", ctx.viewDef && ctx.viewDef.protectVisibility && (!ctx.$player || ctx.$player.paused));
				addLoc(div1, file$e, 13, 4, 363);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				if (if_block) if_block.m(div0, null);
				append(div0, text0);
				append(div0, span);
				append(span, text1);
			},

			p: function update(changed, ctx) {
				if (ctx.sunsetImgInline) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_1$a(component, ctx);
						if_block.c();
						if_block.m(div0, text0);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (changed.sunset) {
					setData(text1, ctx.sunset);
				}

				if ((changed.viewDef || changed.$player)) {
					toggleClass(div1, "protect_visibility", ctx.viewDef && ctx.viewDef.protectVisibility && (!ctx.$player || ctx.$player.paused));
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				if (if_block) if_block.d();
			}
		};
	}

	// (16:8) {#if sunsetImgInline}
	function create_if_block_1$a(component, ctx) {
		var img;

		return {
			c: function create() {
				img = createElement("img");
				img.src = ctx.sunsetImgInline;
				img.alt = "sunset";
				img.className = "svelte-1gwsqnl";
				addLoc(img, file$e, 16, 10, 543);
			},

			m: function mount(target, anchor) {
				insert(target, img, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.sunsetImgInline) {
					img.src = ctx.sunsetImgInline;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(img);
				}
			}
		};
	}

	function Suntime(options) {
		this._debugName = '<Suntime>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<Suntime> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["player"]), options.data);
		this.store._add(this, ["player"]);
		if (!('sunrise' in this._state)) console.warn("<Suntime> was created without expected data property 'sunrise'");
		if (!('viewDef' in this._state)) console.warn("<Suntime> was created without expected data property 'viewDef'");
		if (!('$player' in this._state)) console.warn("<Suntime> was created without expected data property '$player'");
		if (!('sunriseImgInline' in this._state)) console.warn("<Suntime> was created without expected data property 'sunriseImgInline'");
		if (!('sunset' in this._state)) console.warn("<Suntime> was created without expected data property 'sunset'");
		if (!('sunsetImgInline' in this._state)) console.warn("<Suntime> was created without expected data property 'sunsetImgInline'");
		this._intro = !!options.intro;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$h(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$b.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(Suntime.prototype, protoDev);

	Suntime.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/player/src/MediaTimePosition.html generated by Svelte v2.16.1 */

	var methods$6 = {
	  seek(e) {
	    if(!this.get().isStream) {
	      const timeposition = this.refs.timeposition;
	      const percentPos = e.offsetX / timeposition.offsetWidth;
	      this.fire('seek', { percentPos });
	    }
	  }
	};

	function oncreate$c() {
	  this.listener = this.store.on('state', ({ current, changed, previous }) => {
	    const { player } = current;

	    if(!player) {
	      return;
	    }

	    this.set({ isStream: player.isStream });

	    const progress = this.refs.progress;
	    const timeposition = this.refs.timeposition;

	    if(progress) {
	      if(changed.frontTicker)  {
	        // WHEN PLAYING

	        if(player && player.percentposition != null && !player.isStream) {
	          const percentage = player.percentposition;//100 * player.timeposition / player.currentMedia.duration;
	          progress.style.width = `${percentage}%`;
	        } else {
	          progress.style.width = "0%";
	        }

	        if(!player.paused && player.currentMedia && player.currentMedia.songPath) {
	          //todo: when in bottom_wide mode perhaps use #444 (and correct opacity from 0.2 to 0.5 on .progress)
	          //progress.style.background = "#aaa";
	          progress.style.background = "#45FFB9";
	        } else {
	          progress.style.background = "#444";
	        }

	        if(player.currentMedia && player.currentMedia.songPath && !player.paused && !player.isStream) {
	          timeposition.style.cursor = 'pointer';
	        } else {
	          timeposition.style.cursor = 'default';
	        }
	      }
	    }
	  });
	}
	function ondestroy$1() {
	  this.listener.cancel();
	}
	const file$f = "Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/player/src/MediaTimePosition.html";

	function create_main_fragment$i(component, ctx) {
		var if_block_anchor, current;

		var if_block = (ctx.$player && ctx.$player.currentMedia) && create_if_block$g(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.$player && ctx.$player.currentMedia) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$g(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (1:0) {#if $player && $player.currentMedia}
	function create_if_block$g(component, ctx) {
		var div1, div0, text0, text1;

		function select_block_type(ctx) {
			if (ctx.$player.timeposition && (ctx.$player.currentMedia.duration || ctx.$player.isStream)) return create_if_block_2$9;
			if (ctx.$player.spaced && ctx.$player.spacedTimeRemaining) return create_if_block_5$5;
		}

		var current_block_type = select_block_type(ctx);
		var if_block0 = current_block_type && current_block_type(component, ctx);

		var if_block1 = (ctx.$player.currentMedia.duration && !ctx.$player.isStream) && create_if_block_1$b(component, ctx);

		function click_handler(event) {
			component.seek(event);
		}

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				text0 = createText("\n\n    \n    ");
				if (if_block0) if_block0.c();
				text1 = createText("\n\n    ");
				if (if_block1) if_block1.c();
				div0.className = "progress svelte-1q2oufy";
				addLoc(div0, file$f, 4, 4, 204);
				addListener(div1, "click", click_handler);
				div1.id = "timeposition";
				div1.className = "svelte-1q2oufy";
				toggleClass(div1, "bottom_slim_wide", ctx.$view != 'player');
				toggleClass(div1, "bottom_slim_times_visible", ctx.$view == 'clock');
				addLoc(div1, file$f, 2, 2, 41);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				component.refs.progress = div0;
				append(div1, text0);
				if (if_block0) if_block0.m(div1, null);
				append(div1, text1);
				if (if_block1) if_block1.m(div1, null);
				component.refs.timeposition = div1;
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if (if_block0) if_block0.d(1);
					if_block0 = current_block_type && current_block_type(component, ctx);
					if (if_block0) if_block0.c();
					if (if_block0) if_block0.m(div1, text1);
				}

				if (ctx.$player.currentMedia.duration && !ctx.$player.isStream) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_1$b(component, ctx);
						if_block1.c();
						if_block1.m(div1, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (changed.$view) {
					toggleClass(div1, "bottom_slim_wide", ctx.$view != 'player');
					toggleClass(div1, "bottom_slim_times_visible", ctx.$view == 'clock');
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				if (component.refs.progress === div0) component.refs.progress = null;
				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
				removeListener(div1, "click", click_handler);
				if (component.refs.timeposition === div1) component.refs.timeposition = null;
			}
		};
	}

	// (22:6) {#if $player.spaced && $player.spacedTimeRemaining}
	function create_if_block_5$5(component, ctx) {
		var div, text0, span, text1_value = ctx.$player.spacedTimeRemaining, text1, text2, text3;

		return {
			c: function create() {
				div = createElement("div");
				text0 = createText("Waiting ");
				span = createElement("span");
				text1 = createText(text1_value);
				text2 = createText("s");
				text3 = createText(" before continuing ...");
				span.className = "svelte-1q2oufy";
				addLoc(span, file$f, 23, 18, 1108);
				div.className = "spaced_time_remaining svelte-1q2oufy";
				addLoc(div, file$f, 22, 8, 1054);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text0);
				append(div, span);
				append(span, text1);
				append(span, text2);
				append(div, text3);
			},

			p: function update(changed, ctx) {
				if ((changed.$player) && text1_value !== (text1_value = ctx.$player.spacedTimeRemaining)) {
					setData(text1, text1_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (8:4) {#if $player.timeposition && ($player.currentMedia.duration || $player.isStream)}
	function create_if_block_2$9(component, ctx) {
		var if_block_anchor;

		function select_block_type_1(ctx) {
			if (ctx.$player.isStream) return create_if_block_3$8;
			return create_else_block_1$3;
		}

		var current_block_type = select_block_type_1(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},

			d: function destroy(detach) {
				if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (18:6) {:else}
	function create_else_block_1$3(component, ctx) {
		var div, text_value = util.songTime(ctx.Math.floor(ctx.$player.timeposition)), text;

		return {
			c: function create() {
				div = createElement("div");
				text = createText(text_value);
				div.className = "time_current svelte-1q2oufy";
				addLoc(div, file$f, 18, 8, 682);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text);
			},

			p: function update(changed, ctx) {
				if ((changed.Math || changed.$player) && text_value !== (text_value = util.songTime(ctx.Math.floor(ctx.$player.timeposition)))) {
					setData(text, text_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (9:6) {#if $player.isStream}
	function create_if_block_3$8(component, ctx) {
		var div, text;

		function select_block_type_2(ctx) {
			if (ctx.$player.paused) return create_if_block_4$6;
			return create_else_block$5;
		}

		var current_block_type = select_block_type_2(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				text = createText("STREAMING\n          ");
				if_block.c();
				div.className = "streaming_notice svelte-1q2oufy";
				addLoc(div, file$f, 9, 8, 414);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text);
				if_block.m(div, null);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(div, null);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if_block.d();
			}
		};
	}

	// (14:10) {:else}
	function create_else_block$5(component, ctx) {
		var span, text_value = util.songTime(ctx.Math.floor(ctx.$player.timeposition)), text;

		return {
			c: function create() {
				span = createElement("span");
				text = createText(text_value);
				span.className = "time_current svelte-1q2oufy";
				addLoc(span, file$f, 14, 12, 545);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
				append(span, text);
			},

			p: function update(changed, ctx) {
				if ((changed.Math || changed.$player) && text_value !== (text_value = util.songTime(ctx.Math.floor(ctx.$player.timeposition)))) {
					setData(text, text_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(span);
				}
			}
		};
	}

	// (12:10) {#if $player.paused}
	function create_if_block_4$6(component, ctx) {
		var text;

		return {
			c: function create() {
				text = createText("PAUSED");
			},

			m: function mount(target, anchor) {
				insert(target, text, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(text);
				}
			}
		};
	}

	// (29:4) {#if $player.currentMedia.duration && !$player.isStream}
	function create_if_block_1$b(component, ctx) {
		var div, text_value = util.songTime(ctx.$player.currentMedia.duration), text;

		return {
			c: function create() {
				div = createElement("div");
				text = createText(text_value);
				div.className = "time_total svelte-1q2oufy";
				addLoc(div, file$f, 29, 6, 1279);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text);
			},

			p: function update(changed, ctx) {
				if ((changed.$player) && text_value !== (text_value = util.songTime(ctx.$player.currentMedia.duration))) {
					setData(text, text_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	function MediaTimePosition(options) {
		this._debugName = '<MediaTimePosition>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<MediaTimePosition> references store properties, but no store was provided");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(assign({ Math : Math }, this.store._init(["player","view"])), options.data);
		this.store._add(this, ["player","view"]);
		if (!('$player' in this._state)) console.warn("<MediaTimePosition> was created without expected data property '$player'");
		if (!('$view' in this._state)) console.warn("<MediaTimePosition> was created without expected data property '$view'");
		this._intro = !!options.intro;

		this._handlers.destroy = [ondestroy$1, removeFromStore];

		this._fragment = create_main_fragment$i(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$c.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(MediaTimePosition.prototype, protoDev);
	assign(MediaTimePosition.prototype, methods$6);

	MediaTimePosition.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/player/src/PlayInfo.html generated by Svelte v2.16.1 */



	var methods$7 = {
	  select(view) {
	    this.fire('select', { view });
	  },
	  handleKeypress(event) {
	    if(util.isInputElementActive()) {
	      return
	    }

	    // SOME DUPLICATION!! in PLAYER
	    if(event.key && !event.altKey && !event.metaKey && !event.shiftKey) {
	      const $player = this.store.get().player; // somehow $player not accessible from here, but in oncreate() it was...
	      if(event.key == ' ') {
	        event.preventDefault();
	        if($player.paused) {
	          this.play();
	        } else {
	          this.pause();
	        }
	      }

	      if(event.key == 'n') {
	        this.next();
	      }

	      if(event.keyCode == 38 || event.key == '+' || event.key == '=') {
	        this.volumeUp();
	      }

	      if(event.keyCode == 40 || event.key == '-') {
	        this.volumeDown();
	      }
	    }
	  },
	  play() {
	    this.action('play');
	  },
	  next() {
	    this.action('play_next');
	  },
	  shuffle() {
	    this.action('shuffle_playlist');
	  },
	  pause() {
	    this.action('pause');
	  },
	  volumeUp() {
	    this.action('volume_up');
	  },
	  volumeDown() {
	    this.action('volume_down');
	  },
	  action(action, payload, storeName = 'player') {
	    this.store.action({ action, storeName, payload });
	  }
	};

	function oncreate$d() {
	  this.store.entangle(this);
	}
	const file$g = "Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/player/src/PlayInfo.html";

	function create_main_fragment$j(component, ctx) {
		var if_block_anchor, current;

		function onwindowkeydown(event) {
			component.handleKeypress(event);	}
		window.addEventListener("keydown", onwindowkeydown);

		var if_block = (ctx.$player && !ctx.$player.paused) && create_if_block$h(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.$player && !ctx.$player.paused) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$h(component, ctx);
						if (if_block) if_block.c();
					}

					if_block.i(if_block_anchor.parentNode, if_block_anchor);
				} else if (if_block) {
					if_block.o(function() {
						if_block.d(1);
						if_block = null;
					});
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (if_block) if_block.o(outrocallback);
				else outrocallback();

				current = false;
			},

			d: function destroy(detach) {
				window.removeEventListener("keydown", onwindowkeydown);

				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (3:0) {#if $player && !$player.paused}
	function create_if_block$h(component, ctx) {
		var div2, div1, div0, text, current;

		function select_block_type(ctx) {
			if (ctx.$player && !ctx.$player.paused && ctx.$player.currentMedia && ctx.$player.currentMedia.song) return create_if_block_2$a;
			if (ctx.$player && ctx.$player.spaced && ctx.$player.spacedTimeRemaining && !ctx.$player.timeposition) return create_if_block_3$9;
		}

		var current_block_type = select_block_type(ctx);
		var if_block0 = current_block_type && current_block_type(component, ctx);

		function click_handler(event) {
			component.select('player');
		}

		var if_block1 = (!ctx.$player.isStream) && create_if_block_1$c(component);

		return {
			c: function create() {
				div2 = createElement("div");
				div1 = createElement("div");
				div0 = createElement("div");
				if (if_block0) if_block0.c();
				text = createText("\n\n      ");
				if (if_block1) if_block1.c();
				addListener(div0, "click", click_handler);
				div0.id = "current_song";
				div0.className = "svelte-u2ttvk";
				addLoc(div0, file$g, 7, 6, 225);
				div1.className = "wrap svelte-u2ttvk";
				addLoc(div1, file$g, 6, 4, 200);
				div2.id = "playinfo";
				div2.className = "svelte-u2ttvk";
				toggleClass(div2, "protect_visibility", ctx.viewDef && ctx.viewDef.protectVisibility);
				toggleClass(div2, "nonRPi", !ctx.atRPi);
				addLoc(div2, file$g, 4, 2, 89);
			},

			m: function mount(target, anchor) {
				insert(target, div2, anchor);
				append(div2, div1);
				append(div1, div0);
				if (if_block0) if_block0.m(div0, null);
				append(div1, text);
				if (if_block1) if_block1.m(div1, null);
				current = true;
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if (if_block0) if_block0.d(1);
					if_block0 = current_block_type && current_block_type(component, ctx);
					if (if_block0) if_block0.c();
					if (if_block0) if_block0.m(div0, null);
				}

				if (!ctx.$player.isStream) {
					if (!if_block1) {
						if_block1 = create_if_block_1$c(component);
						if_block1.c();
					}
					if_block1.i(div1, null);
				} else if (if_block1) {
					if_block1.o(function() {
						if_block1.d(1);
						if_block1 = null;
					});
				}

				if (changed.viewDef) {
					toggleClass(div2, "protect_visibility", ctx.viewDef && ctx.viewDef.protectVisibility);
				}

				if (changed.atRPi) {
					toggleClass(div2, "nonRPi", !ctx.atRPi);
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (if_block1) if_block1.o(outrocallback);
				else outrocallback();

				current = false;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div2);
				}

				if (if_block0) if_block0.d();
				removeListener(div0, "click", click_handler);
				if (if_block1) if_block1.d();
			}
		};
	}

	// (12:100) 
	function create_if_block_3$9(component, ctx) {
		var div, text0, span, text1_value = ctx.$player.spacedTimeRemaining, text1, text2, text3;

		return {
			c: function create() {
				div = createElement("div");
				text0 = createText("Waiting ");
				span = createElement("span");
				text1 = createText(text1_value);
				text2 = createText("s");
				text3 = createText(" before continuing ...");
				span.className = "svelte-u2ttvk";
				addLoc(span, file$g, 13, 20, 827);
				div.className = "spaced_time_remaining svelte-u2ttvk";
				addLoc(div, file$g, 12, 10, 771);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text0);
				append(div, span);
				append(span, text1);
				append(span, text2);
				append(div, text3);
			},

			p: function update(changed, ctx) {
				if ((changed.$player) && text1_value !== (text1_value = ctx.$player.spacedTimeRemaining)) {
					setData(text1, text1_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (9:8) {#if $player && !$player.paused && $player.currentMedia && $player.currentMedia.song}
	function create_if_block_2$a(component, ctx) {
		var span, text0_value = ctx.$player.isStream ? 'STREAM' : '♪♫♬', text0, text1, text2_value = ctx.$player.currentMedia.artist ? `${ctx.$player.currentMedia.artist} - ${ctx.$player.currentMedia.song}`.substring(0,50) : ctx.$player.currentMedia.song.substring(0,50), text2;

		return {
			c: function create() {
				span = createElement("span");
				text0 = createText(text0_value);
				text1 = createText(" ");
				text2 = createText(text2_value);
				span.className = "notes svelte-u2ttvk";
				addLoc(span, file$g, 9, 10, 381);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
				append(span, text0);
				insert(target, text1, anchor);
				insert(target, text2, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.$player) && text0_value !== (text0_value = ctx.$player.isStream ? 'STREAM' : '♪♫♬')) {
					setData(text0, text0_value);
				}

				if ((changed.$player) && text2_value !== (text2_value = ctx.$player.currentMedia.artist ? `${ctx.$player.currentMedia.artist} - ${ctx.$player.currentMedia.song}`.substring(0,50) : ctx.$player.currentMedia.song.substring(0,50))) {
					setData(text2, text2_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(span);
					detachNode(text1);
					detachNode(text2);
				}
			}
		};
	}

	// (19:6) {#if !$player.isStream}
	function create_if_block_1$c(component, ctx) {
		var div, current;

		var mediatimeposition = new MediaTimePosition({
			root: component.root,
			store: component.store
		});

		return {
			c: function create() {
				div = createElement("div");
				mediatimeposition._fragment.c();
				div.className = "time_position";
				addLoc(div, file$g, 19, 8, 976);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				mediatimeposition._mount(div, null);
				current = true;
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (mediatimeposition) mediatimeposition._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				mediatimeposition.destroy();
			}
		};
	}

	function PlayInfo(options) {
		this._debugName = '<PlayInfo>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<PlayInfo> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["player"]), options.data);
		this.store._add(this, ["player"]);
		if (!('$player' in this._state)) console.warn("<PlayInfo> was created without expected data property '$player'");
		if (!('viewDef' in this._state)) console.warn("<PlayInfo> was created without expected data property 'viewDef'");
		if (!('atRPi' in this._state)) console.warn("<PlayInfo> was created without expected data property 'atRPi'");
		this._intro = !!options.intro;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$j(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$d.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(PlayInfo.prototype, protoDev);
	assign(PlayInfo.prototype, methods$7);

	PlayInfo.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/home/src/Home.html generated by Svelte v2.16.1 */



	var methods$8 = {
	  go(handle) {
	    window.location.href = `http://${window.location.hostname}:${window.location.port}/${handle}`;
	  },
	  select(view) {
	    this.fire('select', { view });
	  },
	};

	function oncreate$e() {
	  this.store.entangle(this);
	}
	const file$h = "Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/home/src/Home.html";

	function create_main_fragment$k(component, ctx) {
		var if_block_anchor, current;

		var if_block = (ctx.loaded) && create_if_block$i(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.loaded) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$i(component, ctx);
						if (if_block) if_block.c();
					}

					if_block.i(if_block_anchor.parentNode, if_block_anchor);
				} else if (if_block) {
					if_block.o(function() {
						if_block.d(1);
						if_block = null;
					});
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (if_block) if_block.o(outrocallback);
				else outrocallback();

				current = false;
			},

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (1:0) {#if loaded}
	function create_if_block$i(component, ctx) {
		var div, text0, text1, if_block_anchor, current;

		var timeanddate_initial_data = { timeDate: ctx.timeDate };
		var timeanddate = new TimeAndDate({
			root: component.root,
			store: component.store,
			data: timeanddate_initial_data
		});

		var calendar = new Calendar({
			root: component.root,
			store: component.store
		});

		var if_block = (ctx.$connected && ctx.$controller) && create_if_block_1$d(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				timeanddate._fragment.c();
				text0 = createText("\n    ");
				calendar._fragment.c();
				text1 = createText("\n\n  ");
				if (if_block) if_block.c();
				if_block_anchor = createComment();
				div.id = "time";
				div.className = "svelte-mp2l89";
				toggleClass(div, "protect_visibility", ctx.viewDef && ctx.viewDef.protectVisibility);
				addLoc(div, file$h, 2, 2, 16);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				timeanddate._mount(div, null);
				append(div, text0);
				calendar._mount(div, null);
				insert(target, text1, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				var timeanddate_changes = {};
				if (changed.timeDate) timeanddate_changes.timeDate = ctx.timeDate;
				timeanddate._set(timeanddate_changes);

				if (changed.viewDef) {
					toggleClass(div, "protect_visibility", ctx.viewDef && ctx.viewDef.protectVisibility);
				}

				if (ctx.$connected && ctx.$controller) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_1$d(component, ctx);
						if (if_block) if_block.c();
					}

					if_block.i(if_block_anchor.parentNode, if_block_anchor);
				} else if (if_block) {
					if_block.o(function() {
						if_block.d(1);
						if_block = null;
					});
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				outrocallback = callAfter(outrocallback, 3);

				if (timeanddate) timeanddate._fragment.o(outrocallback);
				if (calendar) calendar._fragment.o(outrocallback);

				if (if_block) if_block.o(outrocallback);
				else outrocallback();

				current = false;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				timeanddate.destroy();
				calendar.destroy();
				if (detach) {
					detachNode(text1);
				}

				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (8:2) {#if $connected && $controller}
	function create_if_block_1$d(component, ctx) {
		var current_block_type_index, if_block0, text0, text1, current;

		var if_block_creators = [
			create_if_block_3$a,
			create_if_block_4$7
		];

		var if_blocks = [];

		function select_block_type(ctx) {
			if (ctx.$controller.serverMode) return 0;
			if (ctx.weather) return 1;
			return -1;
		}

		if (~(current_block_type_index = select_block_type(ctx))) {
			if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);
		}

		var if_block1 = (ctx.$player) && create_if_block_2$b(component);

		var suntime_initial_data = {
		 	sunrise: ctx.timeDate.sunrise,
		 	sunset: ctx.timeDate.sunset
		 };
		var suntime = new Suntime({
			root: component.root,
			store: component.store,
			data: suntime_initial_data
		});

		return {
			c: function create() {
				if (if_block0) if_block0.c();
				text0 = createText("\n\n    ");
				if (if_block1) if_block1.c();
				text1 = createText("\n\n    ");
				suntime._fragment.c();
			},

			m: function mount(target, anchor) {
				if (~current_block_type_index) if_blocks[current_block_type_index].m(target, anchor);
				insert(target, text0, anchor);
				if (if_block1) if_block1.m(target, anchor);
				insert(target, text1, anchor);
				suntime._mount(target, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				var previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);
				if (current_block_type_index === previous_block_index) {
					if (~current_block_type_index) if_blocks[current_block_type_index].p(changed, ctx);
				} else {
					if (if_block0) {
						if_block0.o(function() {
							if_blocks[previous_block_index].d(1);
							if_blocks[previous_block_index] = null;
						});
					}

					if (~current_block_type_index) {
						if_block0 = if_blocks[current_block_type_index];
						if (!if_block0) {
							if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);
							if_block0.c();
						}
						if_block0.m(text0.parentNode, text0);
					} else {
						if_block0 = null;
					}
				}

				if (ctx.$player) {
					if (!if_block1) {
						if_block1 = create_if_block_2$b(component);
						if_block1.c();
					}
					if_block1.i(text1.parentNode, text1);
				} else if (if_block1) {
					if_block1.o(function() {
						if_block1.d(1);
						if_block1 = null;
					});
				}

				var suntime_changes = {};
				if (changed.timeDate) suntime_changes.sunrise = ctx.timeDate.sunrise;
				if (changed.timeDate) suntime_changes.sunset = ctx.timeDate.sunset;
				suntime._set(suntime_changes);
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				outrocallback = callAfter(outrocallback, 3);

				if (if_block0) if_block0.o(outrocallback);
				else outrocallback();

				if (if_block1) if_block1.o(outrocallback);
				else outrocallback();

				if (suntime) suntime._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy(detach) {
				if (~current_block_type_index) if_blocks[current_block_type_index].d(detach);
				if (detach) {
					detachNode(text0);
				}

				if (if_block1) if_block1.d(detach);
				if (detach) {
					detachNode(text1);
				}

				suntime.destroy(detach);
			}
		};
	}

	// (22:21) 
	function create_if_block_4$7(component, ctx) {
		var current_block_type_index, if_block, if_block_anchor, current;

		var if_block_creators = [
			create_if_block_5$6,
			create_else_block$6
		];

		var if_blocks = [];

		function select_block_type_1(ctx) {
			if (ctx.isDevCluster) return 0;
			return 1;
		}

		current_block_type_index = select_block_type_1(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);

		return {
			c: function create() {
				if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if_blocks[current_block_type_index].m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				var previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type_1(ctx);
				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(changed, ctx);
				} else {
					if_block.o(function() {
						if_blocks[previous_block_index].d(1);
						if_blocks[previous_block_index] = null;
					});

					if_block = if_blocks[current_block_type_index];
					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);
						if_block.c();
					}
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (if_block) if_block.o(outrocallback);
				else outrocallback();

				current = false;
			},

			d: function destroy(detach) {
				if_blocks[current_block_type_index].d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (10:4) {#if $controller.serverMode}
	function create_if_block_3$a(component, ctx) {
		var div0, img0, text, div1, img1, current;

		return {
			c: function create() {
				div0 = createElement("div");
				img0 = createElement("img");
				text = createText("\n\n      ");
				div1 = createElement("div");
				img1 = createElement("img");
				img0.src = "/img/yellow_submarine.png";
				img0.className = "svelte-mp2l89";
				addLoc(img0, file$h, 15, 8, 460);
				div0.className = "submarine svelte-mp2l89";
				addLoc(div0, file$h, 13, 6, 380);
				img1.src = "/img/hot-air-balloon.png";
				img1.className = "svelte-mp2l89";
				addLoc(img1, file$h, 19, 8, 569);
				div1.className = "baloon svelte-mp2l89";
				toggleClass(div1, "nonRPi", !ctx.atRPi);
				addLoc(div1, file$h, 18, 6, 518);
			},

			m: function mount(target, anchor) {
				insert(target, div0, anchor);
				append(div0, img0);
				insert(target, text, anchor);
				insert(target, div1, anchor);
				append(div1, img1);
				current = true;
			},

			p: function update(changed, ctx) {
				if (changed.atRPi) {
					toggleClass(div1, "nonRPi", !ctx.atRPi);
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (detach) {
					detachNode(div0);
					detachNode(text);
					detachNode(div1);
				}
			}
		};
	}

	// (25:6) {:else}
	function create_else_block$6(component, ctx) {
		var div, current;

		var weatherwidget_initial_data = { weather: ctx.weather };
		var weatherwidget = new WeatherWidget({
			root: component.root,
			store: component.store,
			data: weatherwidget_initial_data
		});

		return {
			c: function create() {
				div = createElement("div");
				weatherwidget._fragment.c();
				div.id = "weather_widget";
				div.className = "no_click svelte-mp2l89";
				addLoc(div, file$h, 25, 8, 784);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				weatherwidget._mount(div, null);
				current = true;
			},

			p: function update(changed, ctx) {
				var weatherwidget_changes = {};
				if (changed.weather) weatherwidget_changes.weather = ctx.weather;
				weatherwidget._set(weatherwidget_changes);
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (weatherwidget) weatherwidget._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				weatherwidget.destroy();
			}
		};
	}

	// (23:6) {#if isDevCluster}
	function create_if_block_5$6(component, ctx) {
		var div, current;

		var weatherwidget_initial_data = { weather: ctx.weather };
		var weatherwidget = new WeatherWidget({
			root: component.root,
			store: component.store,
			data: weatherwidget_initial_data
		});

		function click_handler(event) {
			component.select('ambience');
		}

		return {
			c: function create() {
				div = createElement("div");
				weatherwidget._fragment.c();
				addListener(div, "click", click_handler);
				div.id = "weather_widget";
				div.className = "svelte-mp2l89";
				addLoc(div, file$h, 23, 8, 674);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				weatherwidget._mount(div, null);
				current = true;
			},

			p: function update(changed, ctx) {
				var weatherwidget_changes = {};
				if (changed.weather) weatherwidget_changes.weather = ctx.weather;
				weatherwidget._set(weatherwidget_changes);
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (weatherwidget) weatherwidget._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				weatherwidget.destroy();
				removeListener(div, "click", click_handler);
			}
		};
	}

	// (30:4) {#if $player}
	function create_if_block_2$b(component, ctx) {
		var current;

		var playinfo = new PlayInfo({
			root: component.root,
			store: component.store
		});

		playinfo.on("select", function(event) {
			component.select(event.view);
		});

		return {
			c: function create() {
				playinfo._fragment.c();
			},

			m: function mount(target, anchor) {
				playinfo._mount(target, anchor);
				current = true;
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (playinfo) playinfo._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy(detach) {
				playinfo.destroy(detach);
			}
		};
	}

	function Home(options) {
		this._debugName = '<Home>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<Home> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["connected","controller","player"]), options.data);
		this.store._add(this, ["connected","controller","player"]);
		if (!('loaded' in this._state)) console.warn("<Home> was created without expected data property 'loaded'");
		if (!('viewDef' in this._state)) console.warn("<Home> was created without expected data property 'viewDef'");
		if (!('timeDate' in this._state)) console.warn("<Home> was created without expected data property 'timeDate'");
		if (!('$connected' in this._state)) console.warn("<Home> was created without expected data property '$connected'");
		if (!('$controller' in this._state)) console.warn("<Home> was created without expected data property '$controller'");
		if (!('atRPi' in this._state)) console.warn("<Home> was created without expected data property 'atRPi'");
		if (!('weather' in this._state)) console.warn("<Home> was created without expected data property 'weather'");
		if (!('isDevCluster' in this._state)) console.warn("<Home> was created without expected data property 'isDevCluster'");
		if (!('$player' in this._state)) console.warn("<Home> was created without expected data property '$player'");
		this._intro = !!options.intro;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$k(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$e.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(Home.prototype, protoDev);
	assign(Home.prototype, methods$8);

	Home.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/player/src/Ribbon.html generated by Svelte v2.16.1 */

	var methods$9 = {
	  selectMedia(mediaSourceOption) {
	    this.set({ selectMedia: mediaSourceOption });

	    if(mediaSourceOption == 'browse' || mediaSourceOption == 'search') {
	      this.defaultRibbonState();
	      this.fire('mediaSourceOption', { mediaSourceOption });
	    }
	  },
	  close() {
	    this.defaultRibbonState();
	  },
	  defaultRibbonState() {
	    this.set({ selectMedia: undefined });
	  },
	  action(action, payload) {
	    //this.set({ touchAction: action })
	    //setTimeout(() => this.set({ touchAction: undefined }), 50); // give it some (exact) time to be visible! it's too short otherwise (even if we put it after the action trigger (because this is very fast))
	    this.store.action({ action, storeName: this.storeName, payload });
	    this.defaultRibbonState();
	  },
	  playRadio(radioId) {
	    this.action('play_radio', { radioId });
	    //this.defaultRibbonState();
	  }
	};

	function oncreate$f() {
	  //this.store.entangle(this);
	  this.storeName = 'player';
	}
	const file$i = "Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/player/src/Ribbon.html";

	function create_main_fragment$l(component, ctx) {
		var if_block_anchor, current;

		var if_block = (ctx.$player) && create_if_block$j(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.$player) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$j(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (1:0) {#if $player}
	function create_if_block$j(component, ctx) {
		var div;

		function select_block_type(ctx) {
			if (ctx.$player.stuckOnMissingMedia) return create_if_block_1$e;
			return create_else_block$7;
		}

		var current_block_type = select_block_type(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				if_block.c();
				div.id = "ribbon";
				div.className = "svelte-1tk35i9";
				addLoc(div, file$i, 2, 2, 17);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				if_block.m(div, null);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(div, null);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if_block.d();
			}
		};
	}

	// (16:4) {:else}
	function create_else_block$7(component, ctx) {
		var text, if_block1_anchor;

		var if_block0 = (!ctx.selectMedia) && create_if_block_3$b(component);

		var if_block1 = (ctx.selectMedia == 'radio') && create_if_block_2$c(component);

		return {
			c: function create() {
				if (if_block0) if_block0.c();
				text = createText("\n\n      ");
				if (if_block1) if_block1.c();
				if_block1_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block0) if_block0.m(target, anchor);
				insert(target, text, anchor);
				if (if_block1) if_block1.m(target, anchor);
				insert(target, if_block1_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (!ctx.selectMedia) {
					if (!if_block0) {
						if_block0 = create_if_block_3$b(component);
						if_block0.c();
						if_block0.m(text.parentNode, text);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.selectMedia == 'radio') {
					if (!if_block1) {
						if_block1 = create_if_block_2$c(component);
						if_block1.c();
						if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}
			},

			d: function destroy(detach) {
				if (if_block0) if_block0.d(detach);
				if (detach) {
					detachNode(text);
				}

				if (if_block1) if_block1.d(detach);
				if (detach) {
					detachNode(if_block1_anchor);
				}
			}
		};
	}

	// (5:4) {#if $player.stuckOnMissingMedia}
	function create_if_block_1$e(component, ctx) {
		var div3, div0, text_1, div2, div1;

		function click_handler(event) {
			component.action('remove_missing_media');
		}

		return {
			c: function create() {
				div3 = createElement("div");
				div0 = createElement("div");
				div0.textContent = "Media is missing";
				text_1 = createText("\n        ");
				div2 = createElement("div");
				div1 = createElement("div");
				div1.textContent = "Cleanup playlist";
				div0.className = "title svelte-1tk35i9";
				addLoc(div0, file$i, 7, 8, 125);
				addListener(div1, "click", click_handler);
				div1.className = "option svelte-1tk35i9";
				addLoc(div1, file$i, 9, 10, 207);
				div2.className = "options svelte-1tk35i9";
				addLoc(div2, file$i, 8, 8, 175);
				div3.className = "section missing_media svelte-1tk35i9";
				addLoc(div3, file$i, 6, 6, 81);
			},

			m: function mount(target, anchor) {
				insert(target, div3, anchor);
				append(div3, div0);
				append(div3, text_1);
				append(div3, div2);
				append(div2, div1);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(div3);
				}

				removeListener(div1, "click", click_handler);
			}
		};
	}

	// (18:6) {#if !selectMedia}
	function create_if_block_3$b(component, ctx) {
		var div3, div0, text_1, div2, div1;

		function click_handler(event) {
			component.selectMedia('radio');
		}

		return {
			c: function create() {
				div3 = createElement("div");
				div0 = createElement("div");
				div0.textContent = "Media select";
				text_1 = createText("\n          ");
				div2 = createElement("div");
				div1 = createElement("div");
				div1.textContent = "Net Radio";
				div0.className = "title media_select svelte-1tk35i9";
				addLoc(div0, file$i, 19, 10, 573);
				addListener(div1, "click", click_handler);
				div1.className = "option svelte-1tk35i9";
				addLoc(div1, file$i, 23, 12, 833);
				div2.className = "options svelte-1tk35i9";
				addLoc(div2, file$i, 20, 10, 634);
				div3.className = "section svelte-1tk35i9";
				addLoc(div3, file$i, 18, 8, 541);
			},

			m: function mount(target, anchor) {
				insert(target, div3, anchor);
				append(div3, div0);
				append(div3, text_1);
				append(div3, div2);
				append(div2, div1);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div3);
				}

				removeListener(div1, "click", click_handler);
			}
		};
	}

	// (33:6) {#if selectMedia == 'radio'}
	function create_if_block_2$c(component, ctx) {
		var div10, div0, text1, div9, div1, text3, div2, text5, div3, text7, div4, text9, div5, text11, div6, text13, div7, text15, div8;

		function click_handler(event) {
			component.playRadio('jazz');
		}

		function click_handler_1(event) {
			component.playRadio('rock');
		}

		function click_handler_2(event) {
			component.playRadio('christmas');
		}

		function click_handler_3(event) {
			component.playRadio('classical');
		}

		function click_handler_4(event) {
			component.playRadio('ambient');
		}

		function click_handler_5(event) {
			component.playRadio('progressive-trance');
		}

		function click_handler_6(event) {
			component.playRadio('goa-trance');
		}

		function click_handler_7(event) {
			component.close();
		}

		return {
			c: function create() {
				div10 = createElement("div");
				div0 = createElement("div");
				div0.textContent = "Internet radio station:";
				text1 = createText("\n          ");
				div9 = createElement("div");
				div1 = createElement("div");
				div1.textContent = "Jazz";
				text3 = createText("\n            ");
				div2 = createElement("div");
				div2.textContent = "Rock";
				text5 = createText("\n            ");
				div3 = createElement("div");
				div3.textContent = "Christmas";
				text7 = createText("\n            ");
				div4 = createElement("div");
				div4.textContent = "Classical";
				text9 = createText("\n            ");
				div5 = createElement("div");
				div5.textContent = "Ambient";
				text11 = createText("\n            ");
				div6 = createElement("div");
				div6.textContent = "Psytrance";
				text13 = createText("\n            ");
				div7 = createElement("div");
				div7.textContent = "Goa trance";
				text15 = createText("\n            ");
				div8 = createElement("div");
				div8.textContent = "Close";
				div0.className = "title svelte-1tk35i9";
				addLoc(div0, file$i, 34, 10, 1196);
				addListener(div1, "click", click_handler);
				div1.className = "option svelte-1tk35i9";
				addLoc(div1, file$i, 36, 12, 1289);
				addListener(div2, "click", click_handler_1);
				div2.className = "option svelte-1tk35i9";
				addLoc(div2, file$i, 37, 12, 1361);
				addListener(div3, "click", click_handler_2);
				div3.className = "option svelte-1tk35i9";
				addLoc(div3, file$i, 38, 12, 1433);
				addListener(div4, "click", click_handler_3);
				div4.className = "option svelte-1tk35i9";
				addLoc(div4, file$i, 39, 12, 1515);
				addListener(div5, "click", click_handler_4);
				div5.className = "option svelte-1tk35i9";
				addLoc(div5, file$i, 40, 12, 1597);
				addListener(div6, "click", click_handler_5);
				div6.className = "option svelte-1tk35i9";
				addLoc(div6, file$i, 41, 12, 1675);
				addListener(div7, "click", click_handler_6);
				div7.className = "option svelte-1tk35i9";
				addLoc(div7, file$i, 42, 12, 1766);
				addListener(div8, "click", click_handler_7);
				div8.className = "option close svelte-1tk35i9";
				addLoc(div8, file$i, 43, 12, 1850);
				div9.className = "options svelte-1tk35i9";
				addLoc(div9, file$i, 35, 10, 1255);
				div10.className = "section svelte-1tk35i9";
				addLoc(div10, file$i, 33, 8, 1164);
			},

			m: function mount(target, anchor) {
				insert(target, div10, anchor);
				append(div10, div0);
				append(div10, text1);
				append(div10, div9);
				append(div9, div1);
				append(div9, text3);
				append(div9, div2);
				append(div9, text5);
				append(div9, div3);
				append(div9, text7);
				append(div9, div4);
				append(div9, text9);
				append(div9, div5);
				append(div9, text11);
				append(div9, div6);
				append(div9, text13);
				append(div9, div7);
				append(div9, text15);
				append(div9, div8);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div10);
				}

				removeListener(div1, "click", click_handler);
				removeListener(div2, "click", click_handler_1);
				removeListener(div3, "click", click_handler_2);
				removeListener(div4, "click", click_handler_3);
				removeListener(div5, "click", click_handler_4);
				removeListener(div6, "click", click_handler_5);
				removeListener(div7, "click", click_handler_6);
				removeListener(div8, "click", click_handler_7);
			}
		};
	}

	function Ribbon(options) {
		this._debugName = '<Ribbon>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<Ribbon> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["player"]), options.data);
		this.store._add(this, ["player"]);
		if (!('$player' in this._state)) console.warn("<Ribbon> was created without expected data property '$player'");
		if (!('selectMedia' in this._state)) console.warn("<Ribbon> was created without expected data property 'selectMedia'");
		this._intro = !!options.intro;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$l(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$f.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(Ribbon.prototype, protoDev);
	assign(Ribbon.prototype, methods$9);

	Ribbon.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/*  ------------------------------------------------------------------------ */

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

	const O = Object;

	/*  See https://misc.flogisoft.com/bash/tip_colors_and_formatting
	    ------------------------------------------------------------------------ */

	const colorCodes = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'lightGray', '', 'default'],
	      colorCodesLight = ['darkGray', 'lightRed', 'lightGreen', 'lightYellow', 'lightBlue', 'lightMagenta', 'lightCyan', 'white', ''],
	      styleCodes = ['', 'bright', 'dim', 'italic', 'underline', '', '', 'inverse'],
	      asBright = { 'red': 'lightRed',
	    'green': 'lightGreen',
	    'yellow': 'lightYellow',
	    'blue': 'lightBlue',
	    'magenta': 'lightMagenta',
	    'cyan': 'lightCyan',
	    'black': 'darkGray',
	    'lightGray': 'white' },
	      types = { 0: 'style',
	    2: 'unstyle',
	    3: 'color',
	    9: 'colorLight',
	    4: 'bgColor',
	    10: 'bgColorLight' },
	      subtypes = { color: colorCodes,
	    colorLight: colorCodesLight,
	    bgColor: colorCodes,
	    bgColorLight: colorCodesLight,
	    style: styleCodes,
	    unstyle: styleCodes

	    /*  ------------------------------------------------------------------------ */

	};const clean = obj => {
	    for (const k in obj) {
	        if (!obj[k]) {
	            delete obj[k];
	        }
	    }
	    return O.keys(obj).length === 0 ? undefined : obj;
	};

	/*  ------------------------------------------------------------------------ */

	class Color {

	    constructor(background, name, brightness) {

	        this.background = background;
	        this.name = name;
	        this.brightness = brightness;
	    }

	    get inverse() {
	        return new Color(!this.background, this.name || (this.background ? 'black' : 'white'), this.brightness);
	    }

	    get clean() {
	        return clean({ name: this.name === 'default' ? '' : this.name,
	            bright: this.brightness === Code.bright,
	            dim: this.brightness === Code.dim });
	    }

	    defaultBrightness(value) {

	        return new Color(this.background, this.name, this.brightness || value);
	    }

	    css(inverted) {

	        const color = inverted ? this.inverse : this;

	        const rgbName = color.brightness === Code.bright && asBright[color.name] || color.name;

	        const prop = color.background ? 'background:' : 'color:',
	              rgb = Colors.rgb[rgbName],
	              alpha = this.brightness === Code.dim ? 0.5 : 1;

	        return rgb ? prop + 'rgba(' + [].concat(_toConsumableArray(rgb), [alpha]).join(',') + ');' : !color.background && alpha < 1 ? 'color:rgba(0,0,0,0.5);' : ''; // Chrome does not support 'opacity' property...
	    }
	}

	/*  ------------------------------------------------------------------------ */

	class Code {

	    constructor(n) {
	        if (n !== undefined) {
	            this.value = Number(n);
	        }
	    }

	    get type() {
	        return types[Math.floor(this.value / 10)];
	    }

	    get subtype() {
	        return subtypes[this.type][this.value % 10];
	    }

	    get str() {
	        return this.value ? '\u001b\[' + this.value + 'm' : '';
	    }

	    static str(x) {
	        return new Code(x).str;
	    }

	    get isBrightness() {
	        return this.value === Code.noBrightness || this.value === Code.bright || this.value === Code.dim;
	    }
	}

	/*  ------------------------------------------------------------------------ */

	O.assign(Code, {

	    reset: 0,
	    bright: 1,
	    dim: 2,
	    inverse: 7,
	    noBrightness: 22,
	    noItalic: 23,
	    noUnderline: 24,
	    noInverse: 27,
	    noColor: 39,
	    noBgColor: 49
	});

	/*  ------------------------------------------------------------------------ */

	const replaceAll = (str, a, b) => str.split(a).join(b);

	/*  ANSI brightness codes do not overlap, e.g. "{bright}{dim}foo" will be rendered bright (not dim).
	    So we fix it by adding brightness canceling before each brightness code, so the former example gets
	    converted to "{noBrightness}{bright}{noBrightness}{dim}foo" – this way it gets rendered as expected.
	 */

	const denormalizeBrightness = s => s.replace(/(\u001b\[(1|2)m)/g, '\u001b[22m$1');
	const normalizeBrightness = s => s.replace(/\u001b\[22m(\u001b\[(1|2)m)/g, '$1');

	const wrap$1 = (x, openCode, closeCode) => {

	    const open = Code.str(openCode),
	          close = Code.str(closeCode);

	    return String(x).split('\n').map(line => denormalizeBrightness(open + replaceAll(normalizeBrightness(line), close, open) + close)).join('\n');
	};

	/*  ------------------------------------------------------------------------ */

	const camel = (a, b) => a + b.charAt(0).toUpperCase() + b.slice(1);

	const stringWrappingMethods = (() => [].concat(_toConsumableArray(colorCodes.map((k, i) => !k ? [] : [// color methods

	[k, 30 + i, Code.noColor], [camel('bg', k), 40 + i, Code.noBgColor]])), _toConsumableArray(colorCodesLight.map((k, i) => !k ? [] : [// light color methods

	[k, 90 + i, Code.noColor], [camel('bg', k), 100 + i, Code.noBgColor]])), _toConsumableArray(['', 'BrightRed', 'BrightGreen', 'BrightYellow', 'BrightBlue', 'BrightMagenta', 'BrightCyan'].map((k, i) => !k ? [] : [['bg' + k, 100 + i, Code.noBgColor]])), _toConsumableArray(styleCodes.map((k, i) => !k ? [] : [// style methods

	[k, i, k === 'bright' || k === 'dim' ? Code.noBrightness : 20 + i]]))).reduce((a, b) => a.concat(b)))();

	/*  ------------------------------------------------------------------------ */

	const assignStringWrappingAPI = function (target) {
	    let wrapBefore = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : target;
	    return stringWrappingMethods.reduce((memo, _ref) => {
	        var _ref2 = _slicedToArray(_ref, 3);

	        let k = _ref2[0],
	            open = _ref2[1],
	            close = _ref2[2];
	        return O.defineProperty(memo, k, {
	            get: () => assignStringWrappingAPI(str => wrapBefore(wrap$1(str, open, close)))
	        });
	    }, target);
	};

	/*  ------------------------------------------------------------------------ */

	const TEXT = 0,
	      BRACKET = 1,
	      CODE = 2;

	function rawParse(s) {

	    let state = TEXT,
	        buffer = '',
	        text = '',
	        code = '',
	        codes = [];
	    let spans = [];

	    for (let i = 0, n = s.length; i < n; i++) {

	        const c = s[i];

	        buffer += c;

	        switch (state) {

	            case TEXT:
	                if (c === '\u001b') {
	                    state = BRACKET;buffer = c;
	                } else {
	                    text += c;
	                }
	                break;

	            case BRACKET:
	                if (c === '[') {
	                    state = CODE;code = '';codes = [];
	                } else {
	                    state = TEXT;text += buffer;
	                }
	                break;

	            case CODE:

	                if (c >= '0' && c <= '9') {
	                    code += c;
	                } else if (c === ';') {
	                    codes.push(new Code(code));code = '';
	                } else if (c === 'm' && code.length) {
	                    codes.push(new Code(code));
	                    for (const code of codes) {
	                        spans.push({ text, code });text = '';
	                    }
	                    state = TEXT;
	                } else {
	                    state = TEXT;text += buffer;
	                }
	        }
	    }

	    if (state !== TEXT) text += buffer;

	    if (text) spans.push({ text, code: new Code() });

	    return spans;
	}

	/*  ------------------------------------------------------------------------ */

	/**
	 * Represents an ANSI-escaped string.
	 */
	class Colors {

	    /**
	     * @param {string} s a string containing ANSI escape codes.
	     */
	    constructor(s) {

	        this.spans = s ? rawParse(s) : [];
	    }

	    get str() {
	        return this.spans.reduce((str, p) => str + p.text + p.code.str, '');
	    }

	    get parsed() {

	        let color, bgColor, brightness, styles;

	        function reset() {

	            color = new Color(), bgColor = new Color(true /* background */), brightness = undefined, styles = new Set();
	        }

	        reset();

	        return O.assign(new Colors(), {

	            spans: this.spans.map(span => {

	                const c = span.code;

	                const inverted = styles.has('inverse'),
	                      underline = styles.has('underline') ? 'text-decoration: underline;' : '',
	                      italic = styles.has('italic') ? 'font-style: italic;' : '',
	                      bold = brightness === Code.bright ? 'font-weight: bold;' : '';

	                const foreColor = color.defaultBrightness(brightness);

	                const styledSpan = O.assign({ css: bold + italic + underline + foreColor.css(inverted) + bgColor.css(inverted) }, clean({ bold: !!bold, color: foreColor.clean, bgColor: bgColor.clean }), span);

	                for (const k of styles) {
	                    styledSpan[k] = true;
	                }

	                if (c.isBrightness) {

	                    brightness = c.value;
	                } else if (span.code.value !== undefined) {

	                    if (span.code.value === Code.reset) {
	                        reset();
	                    } else {

	                        switch (span.code.type) {

	                            case 'color':
	                            case 'colorLight':
	                                color = new Color(false, c.subtype);break;

	                            case 'bgColor':
	                            case 'bgColorLight':
	                                bgColor = new Color(true, c.subtype);break;

	                            case 'style':
	                                styles.add(c.subtype);break;
	                            case 'unstyle':
	                                styles.delete(c.subtype);break;
	                        }
	                    }
	                }

	                return styledSpan;
	            }).filter(s => s.text.length > 0)
	        });
	    }

	    /*  Outputs with Chrome DevTools-compatible format     */

	    get asChromeConsoleLogArguments() {

	        const spans = this.parsed.spans;

	        return [spans.map(s => '%c' + s.text).join('')].concat(_toConsumableArray(spans.map(s => s.css)));
	    }

	    get browserConsoleArguments() /* LEGACY, DEPRECATED */{
	        return this.asChromeConsoleLogArguments;
	    }

	    /**
	     * @desc installs String prototype extensions
	     * @example
	     * require ('ansicolor').nice
	     * console.log ('foo'.bright.red)
	     */
	    static get nice() {

	        Colors.names.forEach(k => {
	            if (!(k in String.prototype)) {
	                O.defineProperty(String.prototype, k, { get: function () {
	                        return Colors[k](this);
	                    } });
	            }
	        });

	        return Colors;
	    }

	    /**
	     * @desc parses a string containing ANSI escape codes
	     * @return {Colors} parsed representation.
	     */
	    static parse(s) {
	        return new Colors(s).parsed;
	    }

	    /**
	     * @desc strips ANSI codes from a string
	     * @param {string} s a string containing ANSI escape codes.
	     * @return {string} clean string.
	     */
	    static strip(s) {
	        return s.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-PRZcf-nqry=><]/g, ''); // hope V8 caches the regexp
	    }

	    /**
	     * @example
	     * const spans = [...ansi.parse ('\u001b[7m\u001b[7mfoo\u001b[7mbar\u001b[27m')]
	     */
	    [Symbol.iterator]() {
	        return this.spans[Symbol.iterator]();
	    }
	}

	/*  ------------------------------------------------------------------------ */

	assignStringWrappingAPI(Colors, str => str);

	/*  ------------------------------------------------------------------------ */

	Colors.names = stringWrappingMethods.map((_ref3) => {
	    var _ref4 = _slicedToArray(_ref3, 1);

	    let k = _ref4[0];
	    return k;
	});

	/*  ------------------------------------------------------------------------ */

	Colors.rgb = {

	    black: [0, 0, 0],
	    darkGray: [100, 100, 100],
	    lightGray: [200, 200, 200],
	    white: [255, 255, 255],

	    red: [204, 0, 0],
	    lightRed: [255, 51, 0],

	    green: [0, 204, 0],
	    lightGreen: [51, 204, 51],

	    yellow: [204, 102, 0],
	    lightYellow: [255, 153, 51],

	    blue: [0, 0, 255],
	    lightBlue: [26, 140, 255],

	    magenta: [204, 0, 204],
	    lightMagenta: [255, 0, 255],

	    cyan: [0, 153, 255],
	    lightCyan: [0, 204, 255]

	    /*  ------------------------------------------------------------------------ */

	};var ansicolor = Colors;

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/player/src/Player.html generated by Svelte v2.16.1 */



	const colors = colorsDmt;

	function hasSearchResults(searchResults) {
	  if(searchResults) {
	    for(const providerResults of searchResults) {
	      if(providerResults.results && providerResults.results.length > 0) {
	        return true
	      }
	    }
	  }
	  return false;
	}
	function parseAnsi(text) {
	  return ansicolor.parse(text);
	}
	function formatProviderMeta(providerResponse) {
	  const { meta } = providerResponse;
	  const cnt = meta.contentId ? `${colors.gray('/')}${colors.cyan(meta.contentId)}` : '';
	  const provider = `${colors.green('Provider')}: ${colors.magenta(`@${meta.providerHost}`)}${cnt} ${
    providerResponse.providerAddress ? colors.gray(`(${meta.providerAddress})`) : ''
  }`;
	  return provider;
	}
	function formatProviderMetaBottom(providerResponse) {
	  const { meta } = providerResponse;
	  const { totalCount, searchTime } = meta;

	  let time = '';
	  if (searchTime) {
	    time = colors.gray(` · ${colors.green(searchTime)}`);
	  }

	  if (totalCount > 0) {
	    let explain = '';
	    if (totalCount == meta.maxResults) {
	      explain = ' or more';
	    }
	    return colors.gray(`All results → ${colors.yellow(`${totalCount}${explain}`)}${time}`);
	  } else {
	    return colors.gray(`No results${time}`);
	  }
	}
	var methods$a = {
	  selectedDeviceChanged(deviceId) {
	    const { queries } = this.get();
	    if(queries[deviceId]) {
	      const { searchQuery, mediaType } = queries[deviceId];
	      this.set({ searchQuery, mediaType });
	    } else {
	      this.set({ searchQuery: '', mediaType: null });
	    }
	  },
	  searchInputChanged() {
	    const { searchQuery, selectedDeviceId, queries, mediaType, prevMediaType } = this.get();

	    if(searchQuery == '') {
	      this.clearResults(); // check!! do we have to do the rest??
	    }

	    queries[selectedDeviceId] = queries[selectedDeviceId] || {};
	    queries[selectedDeviceId].searchQuery = searchQuery;
	    queries[selectedDeviceId].mediaType = mediaType;
	    this.set({ queries });

	    clearTimeout(this.executeQueryTimeout);

	    this.executeQueryTimeout = setTimeout(() => {
	      const { queries, selectedDeviceId, searchQuery, mediaType } = this.get();
	      const { prevQuery, prevMediaType } = queries[selectedDeviceId];

	      if(searchQuery.trim()) {
	        if(this.queryDifferentEnough({ searchQuery, prevQuery, mediaType, prevMediaType })) {
	          const payload = { method: 'search', args: this.getSearchQuery(), requestId: Math.random() };
	          this.store.action({ action: 'player', storeName: 'rpc', payload });
	          console.log(`Sent ${searchQuery} with mediaType=${mediaType} to rpc/player/search`);
	        }

	        queries[selectedDeviceId].prevQuery = searchQuery;
	        queries[selectedDeviceId].prevMediaType = mediaType;
	        this.set({ queries });
	      }
	    }, 200); // 200 !!!
	  },
	  queryDifferentEnough({ searchQuery, prevQuery, mediaType, prevMediaType }) {
	    return this.normalizeQuery(searchQuery) != this.normalizeQuery(prevQuery) || mediaType != prevMediaType;
	  },
	  normalizeQuery(query) {
	    return query ? query.trim().replace(/\s+/g, '') : query;
	  },
	  addResults() {
	    const query = this.getSearchQuery();
	    if(query) {
	      const payload = { method: 'add', args: query, requestId: Math.random() };
	      this.store.action({ action: 'player', storeName: 'rpc', payload });
	    }
	    this.clearResults();
	  },
	  insertResults() {
	    const query = this.getSearchQuery();
	    if(query) {
	      const payload = { method: 'insert', args: query, requestId: Math.random() };
	      this.store.action({ action: 'player', storeName: 'rpc', payload });
	    }
	    this.clearResults();
	  },
	  playResults() {
	    const query = this.getSearchQuery();
	    if(query) {
	      const payload = { method: 'play', args: query, requestId: Math.random() };
	      this.store.action({ action: 'player', storeName: 'rpc', payload });
	    }
	    this.clearResults();
	  },
	  clearResults() {
	    //console.log("CLEARING RESULTS");
	    const { queries, selectedDeviceId } = this.get();
	    queries[selectedDeviceId] = { searchQuery: '', prevQuery: '' };
	    this.set({ queries, searchQuery: '' });
	    this.store.currentStore().set({ searchResults: null });
	  },
	  getSearchQuery() {
	    let { searchQuery, mediaType } = this.get();
	    searchQuery = searchQuery.trim();
	    if(mediaType == 'video') {
	      searchQuery = `${searchQuery} @media=video`;
	    }
	    return searchQuery;
	  },
	  chooseMediaType(mediaType) {
	    this.set({ mediaType });
	    const { queries, selectedDeviceId } = this.get();
	    queries[selectedDeviceId] = { mediaType };
	    this.set({ queries });
	    this.searchInputChanged();
	  },
	  handleKeypress(event) {
	    if(util.isInputElementActive()) {
	      return
	    }

	    // DUPLICATE!! --> some events from here are also handled in PlayInfo (which is not included in Player though, only in home and Clock for now )...
	    if(event.key && !event.altKey && !event.metaKey && !event.shiftKey) {
	      const $player = this.store.get().player; // somehow $player not accessible from here, but in oncreate() it was...
	      if(event.key == ' ') {
	        event.preventDefault();
	        if($player.paused) {
	          this.play();
	        } else {
	          this.pause();
	        }
	      }

	      if(event.key == 'n') {
	        this.next();
	      }

	      if(event.key == 's') {
	        this.shuffle();
	      }

	      if(event.key == 'l') {
	        this.limitIncrease();
	      }

	      if(event.key == 'm') {
	        this.timeLimitIncrease();
	      }

	      if(event.key == 'r') {
	        this.limitReset();
	      }

	      if(event.keyCode == 38 || event.key == '+' || event.key == '=') {
	        this.volumeUp();
	      }

	      if(event.keyCode == 40 || event.key == '-') {
	        this.volumeDown();
	      }
	    }
	  },
	  action(action, payload) {
	    this.set({ touchAction: action });
	    setTimeout(() => this.set({ touchAction: undefined }), 50); // give it some (exact) time to be visible! it's too short otherwise (even if we put it after the action trigger (because this is very fast))

	    this.store.action({ action, storeName: this.storeName, payload });
	  },
	  selectMedia(mediaSourceOption) {
	    // todo: handle "browser" and "search"
	    // delegate to proper subcomponent!
	    console.log(`Selecting media via: ${mediaSourceOption}. todo: browse and search`);

	    alert('Interface for this is coming by v1.0.1 ... use "dmt next" to update the system then or use commandline for now - command "m"');
	    //this.set({ selectMedia: media })
	    //this.fire('selectMedia', { media })
	  },
	  play() {
	    this.action('play');
	  },
	  next() {
	    this.action('play_next');
	  },
	  shuffle() {
	    this.action('shuffle_playlist');
	  },
	  pause() {
	    this.action('pause');
	  },
	  volumeUp() {
	    this.action('volume_up');
	  },
	  volumeDown() {
	    this.action('volume_down');
	  },
	  stop() {
	    this.action('stop');
	  },
	  limitIncrease() { // used shen LIMIT button is clicked or "l" key pressed
	    if(this.get().isStream || this.get().timeLimit) {
	      this.action('time_limit_increase');
	    } else {
	      this.action('limit_increase');
	    }
	  },
	  timeLimitIncrease() { // used with "ADD MORE TIME" or "SET TIME LIMIT"
	    this.action('time_limit_increase');
	  },
	  limitReset() {
	    this.action('limit_reset');
	  },
	  timeLimitReset() {
	    this.action('time_limit_reset');
	  },
	  selectSong(songId) {
	    this.action('select', { songId });
	  },
	  deselectAll() {
	    this.action('deselect_all');
	  },
	  seek(percentPos) {
	    this.action('goto', { percentPos });
	  },
	  cut() {
	    this.action('cut_selected');
	  },
	  paste() {
	    this.action('paste');
	  },
	  cut_and_paste() {
	    this.action('cut_selected');
	    this.action('paste');
	    //Missing: underlines
	    // todo: only allow bump if something is selected (except current song!)
	  },
	  spaced() {
	    this.action('toggle_spaced');
	  },
	  calculateTimeLimit(player) {
	    return player.timeLimit > 2 ? `${Math.round(player.timeLimit)} min` : `${Math.round(player.timeLimit*60)} s`;
	  }
	};

	function oncreate$g() {
	  this.storeName = 'player'; // namespace for sending actions from frontend GUI to backend
	  // adds thisDeviceId and selectedDeviceId to the component store
	  this.store.entangle(this);

	  this.set({ queries: {} });
	  this.set({ searchQuery: '' });

	  this.listener = this.store.on('state', ({ current, changed, previous }) => {
	    const { prevDeviceId, selectedDeviceId } = this.get();
	    if(prevDeviceId != selectedDeviceId) {
	      this.selectedDeviceChanged(selectedDeviceId);
	    }
	    this.set({ prevDeviceId: selectedDeviceId });

	    if(current.thisDeviceState) { // todo: think if we really need to observe all state changes... AND if we get all differences inside thisDeviceState when we observe multiconnected store "state" event
	      const { player } = current;

	      if(player)  {
	        if(player.timeLimit) {
	          this.set({ timeLimit: this.calculateTimeLimit(player) });
	        } else {
	          this.set({ timeLimit: undefined });
	        }

	        this.set({ isStream: player.isStream });
	      }
	    }
	  });
	}
	function ondestroy$2() {
	  this.listener.cancel();
	}
	const file$j = "Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/player/src/Player.html";

	function click_handler$1(event) {
		const { component, ctx } = this._svelte;

		component.selectSong(ctx.song.id);
	}

	function get_each_context_3(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.song = list[i];
		return child_ctx;
	}

	function get_each_context_2(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.span = list[i];
		return child_ctx;
	}

	function get_each_context_1$1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.line = list[i];
		return child_ctx;
	}

	function get_each_context$2(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.providerResponse = list[i];
		return child_ctx;
	}

	function create_main_fragment$m(component, ctx) {
		var if_block_anchor, current;

		function onwindowkeydown(event) {
			component.handleKeypress(event);	}
		window.addEventListener("keydown", onwindowkeydown);

		var if_block = (ctx.loaded && ctx.$connected && ctx.$controller) && create_if_block$k(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.loaded && ctx.$connected && ctx.$controller) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$k(component, ctx);
						if (if_block) if_block.c();
					}

					if_block.i(if_block_anchor.parentNode, if_block_anchor);
				} else if (if_block) {
					if_block.o(function() {
						if_block.d(1);
						if_block = null;
					});
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (if_block) if_block.o(outrocallback);
				else outrocallback();

				current = false;
			},

			d: function destroy(detach) {
				window.removeEventListener("keydown", onwindowkeydown);

				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (3:0) {#if loaded && $connected && $controller}
	function create_if_block$k(component, ctx) {
		var text, current_block_type_index, if_block1, if_block1_anchor, current;

		var if_block0 = (!ctx.atRPi) && create_if_block_23(component, ctx);

		var if_block_creators = [
			create_if_block_1$f,
			create_if_block_2$d,
			create_else_block_6
		];

		var if_blocks = [];

		function select_block_type_1(ctx) {
			if (ctx.$controller.serverMode) return 0;
			if (ctx.$player) return 1;
			return 2;
		}

		current_block_type_index = select_block_type_1(ctx);
		if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);

		return {
			c: function create() {
				if (if_block0) if_block0.c();
				text = createText("\n\n  ");
				if_block1.c();
				if_block1_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block0) if_block0.m(target, anchor);
				insert(target, text, anchor);
				if_blocks[current_block_type_index].m(target, anchor);
				insert(target, if_block1_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (!ctx.atRPi) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_23(component, ctx);
						if_block0.c();
						if_block0.m(text.parentNode, text);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				var previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type_1(ctx);
				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(changed, ctx);
				} else {
					if_block1.o(function() {
						if_blocks[previous_block_index].d(1);
						if_blocks[previous_block_index] = null;
					});

					if_block1 = if_blocks[current_block_type_index];
					if (!if_block1) {
						if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);
						if_block1.c();
					}
					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (if_block1) if_block1.o(outrocallback);
				else outrocallback();

				current = false;
			},

			d: function destroy(detach) {
				if (if_block0) if_block0.d(detach);
				if (detach) {
					detachNode(text);
				}

				if_blocks[current_block_type_index].d(detach);
				if (detach) {
					detachNode(if_block1_anchor);
				}
			}
		};
	}

	// (5:2) {#if !atRPi}
	function create_if_block_23(component, ctx) {
		var div, input, input_updating = false, text0, button0, text2, button1, text4, button2, text6, button3, text8, button4, text10, text11;

		function input_input_handler() {
			input_updating = true;
			component.set({ searchQuery: input.value });
			input_updating = false;
		}

		function keyup_handler(event) {
			component.searchInputChanged();
		}

		function paste_handler(event) {
			component.searchInputChanged();
		}

		function click_handler(event) {
			component.chooseMediaType('music');
		}

		function click_handler_1(event) {
			component.chooseMediaType('video');
		}

		function click_handler_2(event) {
			component.addResults();
		}

		function click_handler_3(event) {
			component.insertResults();
		}

		function click_handler_4(event) {
			component.playResults();
		}

		var if_block0 = (ctx.searchQuery && ctx.searchQuery.trim()) && create_if_block_26(component);

		var if_block1 = (ctx.$searchResults && ctx.searchQuery && ctx.searchQuery.trim()) && create_if_block_24(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				input = createElement("input");
				text0 = createText("\n\n      ");
				button0 = createElement("button");
				button0.textContent = "Music";
				text2 = createText("\n      ");
				button1 = createElement("button");
				button1.textContent = "Video";
				text4 = createText("\n\n      ");
				button2 = createElement("button");
				button2.textContent = "Add";
				text6 = createText("\n      ");
				button3 = createElement("button");
				button3.textContent = "Insert";
				text8 = createText("\n      ");
				button4 = createElement("button");
				button4.textContent = "▶ Play";
				text10 = createText("\n\n      ");
				if (if_block0) if_block0.c();
				text11 = createText("\n\n      ");
				if (if_block1) if_block1.c();
				addListener(input, "input", input_input_handler);
				addListener(input, "keyup", keyup_handler);
				addListener(input, "paste", paste_handler);
				input.className = "search_input svelte-yshvux";
				input.placeholder = "Search media";
				addLoc(input, file$j, 6, 6, 142);
				addListener(button0, "click", click_handler);
				button0.className = "media_type svelte-yshvux";
				toggleClass(button0, "selected", ctx.mediaType != 'video');
				addLoc(button0, file$j, 8, 6, 292);
				addListener(button1, "click", click_handler_1);
				button1.className = "media_type svelte-yshvux";
				toggleClass(button1, "selected", ctx.mediaType == 'video');
				addLoc(button1, file$j, 9, 6, 414);
				addListener(button2, "click", click_handler_2);
				button2.className = "action svelte-yshvux";
				toggleClass(button2, "hidden", !hasSearchResults(ctx.$searchResults));
				addLoc(button2, file$j, 11, 6, 537);
				addListener(button3, "click", click_handler_3);
				button3.className = "action svelte-yshvux";
				toggleClass(button3, "hidden", !hasSearchResults(ctx.$searchResults));
				addLoc(button3, file$j, 12, 6, 652);
				addListener(button4, "click", click_handler_4);
				button4.className = "action svelte-yshvux";
				toggleClass(button4, "hidden", !hasSearchResults(ctx.$searchResults));
				addLoc(button4, file$j, 13, 6, 773);
				div.className = "search svelte-yshvux";
				addLoc(div, file$j, 5, 4, 115);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, input);

				input.value = ctx.searchQuery;

				append(div, text0);
				append(div, button0);
				append(div, text2);
				append(div, button1);
				append(div, text4);
				append(div, button2);
				append(div, text6);
				append(div, button3);
				append(div, text8);
				append(div, button4);
				append(div, text10);
				if (if_block0) if_block0.m(div, null);
				append(div, text11);
				if (if_block1) if_block1.m(div, null);
			},

			p: function update(changed, ctx) {
				if (!input_updating && changed.searchQuery) input.value = ctx.searchQuery;
				if (changed.mediaType) {
					toggleClass(button0, "selected", ctx.mediaType != 'video');
					toggleClass(button1, "selected", ctx.mediaType == 'video');
				}

				if (changed.$searchResults) {
					toggleClass(button2, "hidden", !hasSearchResults(ctx.$searchResults));
					toggleClass(button3, "hidden", !hasSearchResults(ctx.$searchResults));
					toggleClass(button4, "hidden", !hasSearchResults(ctx.$searchResults));
				}

				if (ctx.searchQuery && ctx.searchQuery.trim()) {
					if (!if_block0) {
						if_block0 = create_if_block_26(component);
						if_block0.c();
						if_block0.m(div, text11);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.$searchResults && ctx.searchQuery && ctx.searchQuery.trim()) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_24(component, ctx);
						if_block1.c();
						if_block1.m(div, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				removeListener(input, "input", input_input_handler);
				removeListener(input, "keyup", keyup_handler);
				removeListener(input, "paste", paste_handler);
				removeListener(button0, "click", click_handler);
				removeListener(button1, "click", click_handler_1);
				removeListener(button2, "click", click_handler_2);
				removeListener(button3, "click", click_handler_3);
				removeListener(button4, "click", click_handler_4);
				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
			}
		};
	}

	// (16:6) {#if searchQuery && searchQuery.trim()}
	function create_if_block_26(component, ctx) {
		var button;

		function click_handler(event) {
			component.clearResults();
		}

		return {
			c: function create() {
				button = createElement("button");
				button.textContent = "Clear";
				addListener(button, "click", click_handler);
				button.className = "clear svelte-yshvux";
				addLoc(button, file$j, 16, 8, 941);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler);
			}
		};
	}

	// (20:6) {#if $searchResults && searchQuery && searchQuery.trim()}
	function create_if_block_24(component, ctx) {
		var div;

		var each_value = ctx.$searchResults;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block_1$1(component, get_each_context$2(ctx, each_value, i));
		}

		return {
			c: function create() {
				div = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				div.className = "search_results svelte-yshvux";
				addLoc(div, file$j, 20, 8, 1089);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.$searchResults) {
					each_value = ctx.$searchResults;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$2(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_1$1(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (30:12) {:else}
	function create_else_block_7(component, ctx) {
		var each_anchor;

		var each_value_1 = ctx.providerResponse.results;

		var each_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block_2(component, get_each_context_1$1(ctx, each_value_1, i));
		}

		return {
			c: function create() {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_anchor = createComment();
			},

			m: function mount(target, anchor) {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(target, anchor);
				}

				insert(target, each_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.$searchResults) {
					each_value_1 = ctx.providerResponse.results;

					for (var i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_2(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(each_anchor.parentNode, each_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value_1.length;
				}
			},

			d: function destroy(detach) {
				destroyEach(each_blocks, detach);

				if (detach) {
					detachNode(each_anchor);
				}
			}
		};
	}

	// (26:12) {#if providerResponse.error}
	function create_if_block_25(component, ctx) {
		var div, text0, text1_value = ctx.providerResponse.error, text1;

		return {
			c: function create() {
				div = createElement("div");
				text0 = createText("Error: ");
				text1 = createText(text1_value);
				div.className = "provider_error svelte-yshvux";
				addLoc(div, file$j, 26, 14, 1354);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text0);
				append(div, text1);
			},

			p: function update(changed, ctx) {
				if ((changed.$searchResults) && text1_value !== (text1_value = ctx.providerResponse.error)) {
					setData(text1, text1_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (33:36) {#each parseAnsi(line).spans as span}
	function create_each_block_3(component, ctx) {
		var span, text_value = ctx.span.text, text, span_style_value;

		return {
			c: function create() {
				span = createElement("span");
				text = createText(text_value);
				span.style.cssText = span_style_value = ctx.span.css;
				span.className = "svelte-yshvux";
				addLoc(span, file$j, 32, 73, 1662);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
				append(span, text);
			},

			p: function update(changed, ctx) {
				if ((changed.$searchResults) && text_value !== (text_value = ctx.span.text)) {
					setData(text, text_value);
				}

				if ((changed.$searchResults) && span_style_value !== (span_style_value = ctx.span.css)) {
					span.style.cssText = span_style_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(span);
				}
			}
		};
	}

	// (31:14) {#each providerResponse.results as line}
	function create_each_block_2(component, ctx) {
		var div;

		var each_value_2 = parseAnsi(ctx.line).spans;

		var each_blocks = [];

		for (var i = 0; i < each_value_2.length; i += 1) {
			each_blocks[i] = create_each_block_3(component, get_each_context_2(ctx, each_value_2, i));
		}

		return {
			c: function create() {
				div = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				div.className = "result svelte-yshvux";
				addLoc(div, file$j, 32, 16, 1605);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.$searchResults) {
					each_value_2 = parseAnsi(ctx.line).spans;

					for (var i = 0; i < each_value_2.length; i += 1) {
						const child_ctx = get_each_context_2(ctx, each_value_2, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_3(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value_2.length;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (22:10) {#each $searchResults as providerResponse}
	function create_each_block_1$1(component, ctx) {
		var raw0_value = formatProviderMeta(ctx.providerResponse), raw0_before, raw0_after, text0, text1, div, raw1_value = formatProviderMetaBottom(ctx.providerResponse);

		function select_block_type(ctx) {
			if (ctx.providerResponse.error) return create_if_block_25;
			return create_else_block_7;
		}

		var current_block_type = select_block_type(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				raw0_before = createElement('noscript');
				raw0_after = createElement('noscript');
				text0 = createText("\n\n            ");
				if_block.c();
				text1 = createText("\n\n            ");
				div = createElement("div");
				div.className = "results_info_bottom svelte-yshvux";
				addLoc(div, file$j, 38, 12, 1860);
			},

			m: function mount(target, anchor) {
				insert(target, raw0_before, anchor);
				raw0_before.insertAdjacentHTML("afterend", raw0_value);
				insert(target, raw0_after, anchor);
				insert(target, text0, anchor);
				if_block.m(target, anchor);
				insert(target, text1, anchor);
				insert(target, div, anchor);
				div.innerHTML = raw1_value;
			},

			p: function update(changed, ctx) {
				if ((changed.$searchResults) && raw0_value !== (raw0_value = formatProviderMeta(ctx.providerResponse))) {
					detachBetween(raw0_before, raw0_after);
					raw0_before.insertAdjacentHTML("afterend", raw0_value);
				}

				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(text1.parentNode, text1);
				}

				if ((changed.$searchResults) && raw1_value !== (raw1_value = formatProviderMetaBottom(ctx.providerResponse))) {
					div.innerHTML = raw1_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachBetween(raw0_before, raw0_after);
					detachNode(raw0_before);
					detachNode(raw0_after);
					detachNode(text0);
				}

				if_block.d(detach);
				if (detach) {
					detachNode(text1);
					detachNode(div);
				}
			}
		};
	}

	// (206:2) {:else}
	function create_else_block_6(component, ctx) {
		var div, h1, current;

		return {
			c: function create() {
				div = createElement("div");
				h1 = createElement("h1");
				h1.textContent = "Player is currently not configured";
				h1.className = "svelte-yshvux";
				addLoc(h1, file$j, 207, 6, 10434);
				div.className = "player svelte-yshvux";
				addLoc(div, file$j, 206, 4, 10407);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, h1);
				current = true;
			},

			p: noop,

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (52:19) 
	function create_if_block_2$d(component, ctx) {
		var current_block_type_index, if_block, if_block_anchor, current;

		var if_block_creators = [
			create_if_block_3$c,
			create_else_block_4
		];

		var if_blocks = [];

		function select_block_type_2(ctx) {
			if (!ctx.$player.error) return 0;
			return 1;
		}

		current_block_type_index = select_block_type_2(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);

		return {
			c: function create() {
				if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if_blocks[current_block_type_index].m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				var previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type_2(ctx);
				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(changed, ctx);
				} else {
					if_block.o(function() {
						if_blocks[previous_block_index].d(1);
						if_blocks[previous_block_index] = null;
					});

					if_block = if_blocks[current_block_type_index];
					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);
						if_block.c();
					}
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (if_block) if_block.o(outrocallback);
				else outrocallback();

				current = false;
			},

			d: function destroy(detach) {
				if_blocks[current_block_type_index].d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (48:2) {#if $controller.serverMode}
	function create_if_block_1$f(component, ctx) {
		var div, h1, current;

		return {
			c: function create() {
				div = createElement("div");
				h1 = createElement("h1");
				h1.textContent = "There is no player available in serverMode";
				h1.className = "svelte-yshvux";
				addLoc(h1, file$j, 49, 6, 2105);
				div.className = "player svelte-yshvux";
				addLoc(div, file$j, 48, 4, 2078);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, h1);
				current = true;
			},

			p: noop,

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (194:4) {:else}
	function create_else_block_4(component, ctx) {
		var div, h1, text0_value = ctx.$player.error.msg, text0, text1, current;

		var if_block = (ctx.$player.error.type == 'mpv_binary_missing') && create_if_block_21(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				h1 = createElement("h1");
				text0 = createText(text0_value);
				text1 = createText("\n        ");
				if (if_block) if_block.c();
				h1.className = "error svelte-yshvux";
				addLoc(h1, file$j, 195, 8, 10043);
				div.className = "player svelte-yshvux";
				addLoc(div, file$j, 194, 6, 10014);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, h1);
				append(h1, text0);
				append(div, text1);
				if (if_block) if_block.m(div, null);
				current = true;
			},

			p: function update(changed, ctx) {
				if ((changed.$player) && text0_value !== (text0_value = ctx.$player.error.msg)) {
					setData(text0, text0_value);
				}

				if (ctx.$player.error.type == 'mpv_binary_missing') {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_21(component, ctx);
						if_block.c();
						if_block.m(div, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (if_block) if_block.d();
			}
		};
	}

	// (54:4) {#if !$player.error}
	function create_if_block_3$c(component, ctx) {
		var div2, div0, text0, text1, text2, button0, text3, button0_disabled_value, text4, button1, text5, button1_disabled_value, text6, text7, text8, div1, text9, text10, text11, text12, div3, current;

		var if_block0 = (ctx.$player.isStream || (ctx.$playlist && ctx.$playlist.length > 0)) && create_if_block_18(component, ctx);

		var if_block1 = (!ctx.$player.isStream && ctx.$playlist && ctx.$playlist.length > 0) && create_if_block_17(component, ctx);

		var if_block2 = (ctx.$player.isStream) && create_if_block_16(component, ctx);

		function click_handler(event) {
			component.volumeDown();
		}

		function click_handler_1(event) {
			component.volumeUp();
		}

		function select_block_type_5(ctx) {
			if (ctx.homebase) return create_if_block_15;
			return create_else_block_1$4;
		}

		var current_block_type = select_block_type_5(ctx);
		var if_block3 = current_block_type(component, ctx);

		function select_block_type_6(ctx) {
			if (!ctx.$player.isStream && ctx.$player.limit) return create_if_block_13;
			if (ctx.$player.timeLimit) return create_if_block_14;
		}

		var current_block_type_1 = select_block_type_6(ctx);
		var if_block4 = current_block_type_1 && current_block_type_1(component, ctx);

		var mediatimeposition = new MediaTimePosition({
			root: component.root,
			store: component.store
		});

		mediatimeposition.on("seek", function(event) {
			component.seek(event.percentPos);
		});

		var if_block5 = (!ctx.$player.isStream) && create_if_block_7$2(component, ctx);

		var if_block6 = (!ctx.$player.isStream && ctx.$playlist) && create_if_block_6$3(component, ctx);

		var if_block7 = (ctx.$player.isStream && ctx.$player.currentMedia && ctx.$player.currentMedia.song) && create_if_block_4$8(component, ctx);

		var ribbon = new Ribbon({
			root: component.root,
			store: component.store
		});

		ribbon.on("mediaSourceOption", function(event) {
			component.selectMedia(event.mediaSourceOption);
		});

		return {
			c: function create() {
				div2 = createElement("div");
				div0 = createElement("div");
				if (if_block0) if_block0.c();
				text0 = createText("\n\n          ");
				if (if_block1) if_block1.c();
				text1 = createText("\n\n          ");
				if (if_block2) if_block2.c();
				text2 = createText("\n\n          ");
				button0 = createElement("button");
				text3 = createText("Vol ⬇");
				text4 = createText("\n          ");
				button1 = createElement("button");
				text5 = createText("Vol ⬆");
				text6 = createText("\n          \n          ");
				if_block3.c();
				text7 = createText("\n\n        \n          ");
				if (if_block4) if_block4.c();
				text8 = createText("\n        \n\n        ");
				div1 = createElement("div");
				mediatimeposition._fragment.c();
				text9 = createText("\n\n        ");
				if (if_block5) if_block5.c();
				text10 = createText("\n\n        ");
				if (if_block6) if_block6.c();
				text11 = createText("\n\n        ");
				if (if_block7) if_block7.c();
				text12 = createText("\n\n      ");
				div3 = createElement("div");
				ribbon._fragment.c();
				addListener(button0, "click", click_handler);
				button0.className = "volume svelte-yshvux";
				button0.disabled = button0_disabled_value = !ctx.$connected || ctx.$player.volume == 0;
				toggleClass(button0, "touch_pressed", ctx.touchAction == 'volume_down');
				addLoc(button0, file$j, 88, 10, 4529);
				addListener(button1, "click", click_handler_1);
				button1.className = "volume svelte-yshvux";
				button1.disabled = button1_disabled_value = !ctx.$connected || ctx.$player.volume == 100;
				toggleClass(button1, "touch_pressed", ctx.touchAction == 'volume_up');
				addLoc(button1, file$j, 89, 10, 4700);
				div0.className = "control svelte-yshvux";
				addLoc(div0, file$j, 56, 8, 2272);
				div1.className = "time_position svelte-yshvux";
				addLoc(div1, file$j, 113, 8, 6479);
				div2.className = "player svelte-yshvux";
				toggleClass(div2, "nonRPi", !ctx.atRPi);
				addLoc(div2, file$j, 55, 6, 2221);
				div3.id = "player_ribbon";
				div3.className = "svelte-yshvux";
				addLoc(div3, file$j, 190, 6, 9880);
			},

			m: function mount(target, anchor) {
				insert(target, div2, anchor);
				append(div2, div0);
				if (if_block0) if_block0.m(div0, null);
				append(div0, text0);
				if (if_block1) if_block1.m(div0, null);
				append(div0, text1);
				if (if_block2) if_block2.m(div0, null);
				append(div0, text2);
				append(div0, button0);
				append(button0, text3);
				append(div0, text4);
				append(div0, button1);
				append(button1, text5);
				append(div0, text6);
				if_block3.m(div0, null);
				append(div2, text7);
				if (if_block4) if_block4.m(div2, null);
				append(div2, text8);
				append(div2, div1);
				mediatimeposition._mount(div1, null);
				append(div2, text9);
				if (if_block5) if_block5.m(div2, null);
				append(div2, text10);
				if (if_block6) if_block6.m(div2, null);
				append(div2, text11);
				if (if_block7) if_block7.m(div2, null);
				insert(target, text12, anchor);
				insert(target, div3, anchor);
				ribbon._mount(div3, null);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.$player.isStream || (ctx.$playlist && ctx.$playlist.length > 0)) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_18(component, ctx);
						if_block0.c();
						if_block0.m(div0, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (!ctx.$player.isStream && ctx.$playlist && ctx.$playlist.length > 0) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_17(component, ctx);
						if_block1.c();
						if_block1.m(div0, text1);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (ctx.$player.isStream) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block_16(component, ctx);
						if_block2.c();
						if_block2.m(div0, text2);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}

				if ((!current || changed.$connected || changed.$player) && button0_disabled_value !== (button0_disabled_value = !ctx.$connected || ctx.$player.volume == 0)) {
					button0.disabled = button0_disabled_value;
				}

				if (changed.touchAction) {
					toggleClass(button0, "touch_pressed", ctx.touchAction == 'volume_down');
				}

				if ((!current || changed.$connected || changed.$player) && button1_disabled_value !== (button1_disabled_value = !ctx.$connected || ctx.$player.volume == 100)) {
					button1.disabled = button1_disabled_value;
				}

				if (changed.touchAction) {
					toggleClass(button1, "touch_pressed", ctx.touchAction == 'volume_up');
				}

				if (current_block_type === (current_block_type = select_block_type_5(ctx)) && if_block3) {
					if_block3.p(changed, ctx);
				} else {
					if_block3.d(1);
					if_block3 = current_block_type(component, ctx);
					if_block3.c();
					if_block3.m(div0, null);
				}

				if (current_block_type_1 === (current_block_type_1 = select_block_type_6(ctx)) && if_block4) {
					if_block4.p(changed, ctx);
				} else {
					if (if_block4) if_block4.d(1);
					if_block4 = current_block_type_1 && current_block_type_1(component, ctx);
					if (if_block4) if_block4.c();
					if (if_block4) if_block4.m(div2, text8);
				}

				if (!ctx.$player.isStream) {
					if (if_block5) {
						if_block5.p(changed, ctx);
					} else {
						if_block5 = create_if_block_7$2(component, ctx);
						if_block5.c();
						if_block5.m(div2, text10);
					}
				} else if (if_block5) {
					if_block5.d(1);
					if_block5 = null;
				}

				if (!ctx.$player.isStream && ctx.$playlist) {
					if (if_block6) {
						if_block6.p(changed, ctx);
					} else {
						if_block6 = create_if_block_6$3(component, ctx);
						if_block6.c();
						if_block6.m(div2, text11);
					}
				} else if (if_block6) {
					if_block6.d(1);
					if_block6 = null;
				}

				if (ctx.$player.isStream && ctx.$player.currentMedia && ctx.$player.currentMedia.song) {
					if (if_block7) {
						if_block7.p(changed, ctx);
					} else {
						if_block7 = create_if_block_4$8(component, ctx);
						if_block7.c();
						if_block7.m(div2, null);
					}
				} else if (if_block7) {
					if_block7.d(1);
					if_block7 = null;
				}

				if (changed.atRPi) {
					toggleClass(div2, "nonRPi", !ctx.atRPi);
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				outrocallback = callAfter(outrocallback, 2);

				if (mediatimeposition) mediatimeposition._fragment.o(outrocallback);
				if (ribbon) ribbon._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div2);
				}

				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
				if (if_block2) if_block2.d();
				removeListener(button0, "click", click_handler);
				removeListener(button1, "click", click_handler_1);
				if_block3.d();
				if (if_block4) if_block4.d();
				mediatimeposition.destroy();
				if (if_block5) if_block5.d();
				if (if_block6) if_block6.d();
				if (if_block7) if_block7.d();
				if (detach) {
					detachNode(text12);
					detachNode(div3);
				}

				ribbon.destroy();
			}
		};
	}

	// (197:8) {#if $player.error.type == 'mpv_binary_missing'}
	function create_if_block_21(component, ctx) {
		var if_block_anchor;

		function select_block_type_9(ctx) {
			if (ctx.atRPi) return create_if_block_22;
			return create_else_block_5;
		}

		var current_block_type = select_block_type_9(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (current_block_type !== (current_block_type = select_block_type_9(ctx))) {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},

			d: function destroy(detach) {
				if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (200:10) {:else}
	function create_else_block_5(component, ctx) {
		var a;

		return {
			c: function create() {
				a = createElement("a");
				a.textContent = "Please install from here";
				a.href = "https://mpv.io/installation/";
				a.className = "svelte-yshvux";
				addLoc(a, file$j, 200, 12, 10272);
			},

			m: function mount(target, anchor) {
				insert(target, a, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(a);
				}
			}
		};
	}

	// (198:10) {#if atRPi}
	function create_if_block_22(component, ctx) {
		var text;

		return {
			c: function create() {
				text = createText("Please use the DMT RaspberryPi guide to compile the mpv project.");
			},

			m: function mount(target, anchor) {
				insert(target, text, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(text);
				}
			}
		};
	}

	// (59:10) {#if $player.isStream || ($playlist && $playlist.length > 0)}
	function create_if_block_18(component, ctx) {
		var if_block_anchor;

		function select_block_type_3(ctx) {
			if (ctx.$player.paused) return create_if_block_19;
			return create_else_block_3;
		}

		var current_block_type = select_block_type_3(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type_3(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},

			d: function destroy(detach) {
				if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (68:12) {:else}
	function create_else_block_3(component, ctx) {
		var button, text, button_disabled_value;

		function click_handler(event) {
			component.pause();
		}

		return {
			c: function create() {
				button = createElement("button");
				text = createText("● Pause");
				addListener(button, "click", click_handler);
				button.className = "pause svelte-yshvux";
				button.disabled = button_disabled_value = !ctx.$connected;
				toggleClass(button, "touch_pressed", ctx.touchAction == 'pause');
				addLoc(button, file$j, 68, 14, 2931);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
				append(button, text);
			},

			p: function update(changed, ctx) {
				if ((changed.$connected) && button_disabled_value !== (button_disabled_value = !ctx.$connected)) {
					button.disabled = button_disabled_value;
				}

				if (changed.touchAction) {
					toggleClass(button, "touch_pressed", ctx.touchAction == 'pause');
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler);
			}
		};
	}

	// (60:12) {#if $player.paused}
	function create_if_block_19(component, ctx) {
		var if_block_anchor;

		function select_block_type_4(ctx) {
			if (ctx.homebase) return create_if_block_20;
			return create_else_block_2;
		}

		var current_block_type = select_block_type_4(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type_4(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},

			d: function destroy(detach) {
				if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (64:14) {:else}
	function create_else_block_2(component, ctx) {
		var button, text, button_disabled_value;

		function click_handler(event) {
			component.play();
		}

		return {
			c: function create() {
				button = createElement("button");
				text = createText("▶ Play");
				addListener(button, "click", click_handler);
				button.className = "play foreign svelte-yshvux";
				button.disabled = button_disabled_value = !ctx.$connected;
				toggleClass(button, "touch_pressed", ctx.touchAction == 'play');
				addLoc(button, file$j, 65, 16, 2744);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
				append(button, text);
			},

			p: function update(changed, ctx) {
				if ((changed.$connected) && button_disabled_value !== (button_disabled_value = !ctx.$connected)) {
					button.disabled = button_disabled_value;
				}

				if (changed.touchAction) {
					toggleClass(button, "touch_pressed", ctx.touchAction == 'play');
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler);
			}
		};
	}

	// (62:14) {#if homebase}
	function create_if_block_20(component, ctx) {
		var button, text, button_disabled_value;

		function click_handler(event) {
			component.play();
		}

		return {
			c: function create() {
				button = createElement("button");
				text = createText("▶ Play");
				addListener(button, "click", click_handler);
				button.className = "play svelte-yshvux";
				button.disabled = button_disabled_value = !ctx.$connected;
				toggleClass(button, "touch_pressed", ctx.touchAction == 'play');
				addLoc(button, file$j, 62, 16, 2507);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
				append(button, text);
			},

			p: function update(changed, ctx) {
				if ((changed.$connected) && button_disabled_value !== (button_disabled_value = !ctx.$connected)) {
					button.disabled = button_disabled_value;
				}

				if (changed.touchAction) {
					toggleClass(button, "touch_pressed", ctx.touchAction == 'play');
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler);
			}
		};
	}

	// (73:10) {#if !$player.isStream && $playlist && $playlist.length > 0}
	function create_if_block_17(component, ctx) {
		var button0, text0, text1_value = ctx.$player.limit || '', text1, button0_disabled_value, text2, button1, text3, button1_disabled_value, text4, button2, text5, button2_disabled_value;

		function click_handler(event) {
			component.limitIncrease();
		}

		function click_handler_1(event) {
			component.next();
		}

		function click_handler_2(event) {
			component.shuffle();
		}

		return {
			c: function create() {
				button0 = createElement("button");
				text0 = createText("Limit ");
				text1 = createText(text1_value);
				text2 = createText("\n            ");
				button1 = createElement("button");
				text3 = createText("➬ Next");
				text4 = createText("\n            ");
				button2 = createElement("button");
				text5 = createText("Shuffle");
				addListener(button0, "click", click_handler);
				button0.disabled = button0_disabled_value = !ctx.$connected;
				button0.className = "svelte-yshvux";
				toggleClass(button0, "limit_active", ctx.$player.limit > 0);
				toggleClass(button0, "time_limit_active", ctx.$player.timeLimit > 0);
				toggleClass(button0, "touch_pressed", ctx.touchAction == 'limit_increase' || ctx.touchAction == 'time_limit_increase');
				addLoc(button0, file$j, 73, 12, 3177);
				addListener(button1, "click", click_handler_1);
				button1.disabled = button1_disabled_value = !ctx.$connected;
				button1.className = "svelte-yshvux";
				toggleClass(button1, "touch_pressed", ctx.touchAction == 'play_next');
				addLoc(button1, file$j, 74, 12, 3467);
				addListener(button2, "click", click_handler_2);
				button2.disabled = button2_disabled_value = !ctx.$connected;
				button2.className = "svelte-yshvux";
				toggleClass(button2, "touch_pressed", ctx.touchAction == 'shuffle_playlist');
				addLoc(button2, file$j, 75, 12, 3595);
			},

			m: function mount(target, anchor) {
				insert(target, button0, anchor);
				append(button0, text0);
				append(button0, text1);
				insert(target, text2, anchor);
				insert(target, button1, anchor);
				append(button1, text3);
				insert(target, text4, anchor);
				insert(target, button2, anchor);
				append(button2, text5);
			},

			p: function update(changed, ctx) {
				if ((changed.$player) && text1_value !== (text1_value = ctx.$player.limit || '')) {
					setData(text1, text1_value);
				}

				if ((changed.$connected) && button0_disabled_value !== (button0_disabled_value = !ctx.$connected)) {
					button0.disabled = button0_disabled_value;
				}

				if (changed.$player) {
					toggleClass(button0, "limit_active", ctx.$player.limit > 0);
					toggleClass(button0, "time_limit_active", ctx.$player.timeLimit > 0);
				}

				if (changed.touchAction) {
					toggleClass(button0, "touch_pressed", ctx.touchAction == 'limit_increase' || ctx.touchAction == 'time_limit_increase');
				}

				if ((changed.$connected) && button1_disabled_value !== (button1_disabled_value = !ctx.$connected)) {
					button1.disabled = button1_disabled_value;
				}

				if (changed.touchAction) {
					toggleClass(button1, "touch_pressed", ctx.touchAction == 'play_next');
				}

				if ((changed.$connected) && button2_disabled_value !== (button2_disabled_value = !ctx.$connected)) {
					button2.disabled = button2_disabled_value;
				}

				if (changed.touchAction) {
					toggleClass(button2, "touch_pressed", ctx.touchAction == 'shuffle_playlist');
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button0);
				}

				removeListener(button0, "click", click_handler);
				if (detach) {
					detachNode(text2);
					detachNode(button1);
				}

				removeListener(button1, "click", click_handler_1);
				if (detach) {
					detachNode(text4);
					detachNode(button2);
				}

				removeListener(button2, "click", click_handler_2);
			}
		};
	}

	// (84:10) {#if $player.isStream}
	function create_if_block_16(component, ctx) {
		var button0, text0, button0_disabled_value, text1, button1, text2, button1_disabled_value;

		function click_handler(event) {
			component.limitIncrease();
		}

		function click_handler_1(event) {
			component.stop();
		}

		return {
			c: function create() {
				button0 = createElement("button");
				text0 = createText("Limit");
				text1 = createText("\n            ");
				button1 = createElement("button");
				text2 = createText("Stop");
				addListener(button0, "click", click_handler);
				button0.disabled = button0_disabled_value = !ctx.$connected;
				button0.className = "svelte-yshvux";
				toggleClass(button0, "time_limit_active", ctx.$player.timeLimit > 0);
				toggleClass(button0, "touch_pressed", ctx.touchAction == 'limit_increase' || ctx.touchAction == 'time_limit_increase');
				addLoc(button0, file$j, 84, 12, 4164);
				addListener(button1, "click", click_handler_1);
				button1.disabled = button1_disabled_value = !ctx.$connected;
				button1.className = "svelte-yshvux";
				toggleClass(button1, "touch_pressed", ctx.touchAction == 'stop');
				addLoc(button1, file$j, 85, 12, 4393);
			},

			m: function mount(target, anchor) {
				insert(target, button0, anchor);
				append(button0, text0);
				insert(target, text1, anchor);
				insert(target, button1, anchor);
				append(button1, text2);
			},

			p: function update(changed, ctx) {
				if ((changed.$connected) && button0_disabled_value !== (button0_disabled_value = !ctx.$connected)) {
					button0.disabled = button0_disabled_value;
				}

				if (changed.$player) {
					toggleClass(button0, "time_limit_active", ctx.$player.timeLimit > 0);
				}

				if (changed.touchAction) {
					toggleClass(button0, "touch_pressed", ctx.touchAction == 'limit_increase' || ctx.touchAction == 'time_limit_increase');
				}

				if ((changed.$connected) && button1_disabled_value !== (button1_disabled_value = !ctx.$connected)) {
					button1.disabled = button1_disabled_value;
				}

				if (changed.touchAction) {
					toggleClass(button1, "touch_pressed", ctx.touchAction == 'stop');
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button0);
				}

				removeListener(button0, "click", click_handler);
				if (detach) {
					detachNode(text1);
					detachNode(button1);
				}

				removeListener(button1, "click", click_handler_1);
			}
		};
	}

	// (94:10) {:else}
	function create_else_block_1$4(component, ctx) {
		var span, text_value = ctx.$player.volume, text;

		return {
			c: function create() {
				span = createElement("span");
				text = createText(text_value);
				span.className = "volume foreign svelte-yshvux";
				addLoc(span, file$j, 95, 12, 5099);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
				append(span, text);
			},

			p: function update(changed, ctx) {
				if ((changed.$player) && text_value !== (text_value = ctx.$player.volume)) {
					setData(text, text_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(span);
				}
			}
		};
	}

	// (92:10) {#if homebase}
	function create_if_block_15(component, ctx) {
		var span, text_value = ctx.$player.volume, text;

		return {
			c: function create() {
				span = createElement("span");
				text = createText(text_value);
				span.className = "volume svelte-yshvux";
				addLoc(span, file$j, 92, 12, 4954);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
				append(span, text);
			},

			p: function update(changed, ctx) {
				if ((changed.$player) && text_value !== (text_value = ctx.$player.volume)) {
					setData(text, text_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(span);
				}
			}
		};
	}

	// (105:37) 
	function create_if_block_14(component, ctx) {
		var div, span1, text0, span0, text1, text2, a0, text4, a1;

		function click_handler(event) {
			event.preventDefault();
			event.stopPropagation();
			component.timeLimitReset();
		}

		function click_handler_1(event) {
			event.preventDefault();
			event.stopPropagation();
			component.timeLimitIncrease();
		}

		return {
			c: function create() {
				div = createElement("div");
				span1 = createElement("span");
				text0 = createText("Stopping in ");
				span0 = createElement("span");
				text1 = createText(ctx.timeLimit);
				text2 = createText("\n              ■ ");
				a0 = createElement("a");
				a0.textContent = "REMOVE LIMIT";
				text4 = createText("\n              ■ ");
				a1 = createElement("a");
				a1.textContent = "ADD MORE TIME";
				span0.className = "limit_num svelte-yshvux";
				addLoc(span0, file$j, 106, 85, 6019);
				addListener(a0, "click", click_handler);
				a0.href = "#";
				a0.className = "svelte-yshvux";
				toggleClass(a0, "touch_pressed", ctx.touchAction == 'time_limit_reset');
				addLoc(a0, file$j, 107, 16, 6078);
				addListener(a1, "click", click_handler_1);
				a1.href = "#";
				a1.className = "set_time_limit svelte-yshvux";
				toggleClass(a1, "touch_pressed", ctx.touchAction == 'time_limit_increase');
				addLoc(a1, file$j, 108, 16, 6238);
				span1.className = "time_limit svelte-yshvux";
				toggleClass(span1, "grayed_out", ctx.$player.paused);
				addLoc(span1, file$j, 106, 14, 5948);
				div.className = "limit_info svelte-yshvux";
				addLoc(div, file$j, 105, 12, 5909);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, span1);
				append(span1, text0);
				append(span1, span0);
				append(span0, text1);
				append(span1, text2);
				append(span1, a0);
				append(span1, text4);
				append(span1, a1);
			},

			p: function update(changed, ctx) {
				if (changed.timeLimit) {
					setData(text1, ctx.timeLimit);
				}

				if (changed.touchAction) {
					toggleClass(a0, "touch_pressed", ctx.touchAction == 'time_limit_reset');
					toggleClass(a1, "touch_pressed", ctx.touchAction == 'time_limit_increase');
				}

				if (changed.$player) {
					toggleClass(span1, "grayed_out", ctx.$player.paused);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				removeListener(a0, "click", click_handler);
				removeListener(a1, "click", click_handler_1);
			}
		};
	}

	// (101:10) {#if !$player.isStream && $player.limit}
	function create_if_block_13(component, ctx) {
		var div, span1, text0, span0, text1_value = ctx.$player.limit == 1 ? 'current' : ctx.$player.limit, text1, text2, text3_value = ctx.$player.limit == 1 ? 'track' : 'tracks', text3, text4, a0, text6, a1;

		function click_handler(event) {
			event.preventDefault();
			event.stopPropagation();
			component.limitReset();
		}

		function click_handler_1(event) {
			event.preventDefault();
			event.stopPropagation();
			component.timeLimitIncrease();
		}

		return {
			c: function create() {
				div = createElement("div");
				span1 = createElement("span");
				text0 = createText("Stop after ");
				span0 = createElement("span");
				text1 = createText(text1_value);
				text2 = createText(" ");
				text3 = createText(text3_value);
				text4 = createText(" ■ ");
				a0 = createElement("a");
				a0.textContent = "REMOVE LIMIT";
				text6 = createText(" ■ ");
				a1 = createElement("a");
				a1.textContent = "SET TIME LIMIT";
				span0.className = "limit_num svelte-yshvux";
				addLoc(span0, file$j, 102, 51, 5397);
				addListener(a0, "click", click_handler);
				a0.href = "#";
				a0.className = "svelte-yshvux";
				toggleClass(a0, "touch_pressed", ctx.touchAction == 'limit_reset');
				addLoc(a0, file$j, 102, 175, 5521);
				addListener(a1, "click", click_handler_1);
				a1.href = "#";
				a1.className = "set_time_limit svelte-yshvux";
				toggleClass(a1, "touch_pressed", ctx.touchAction == 'time_limit_increase');
				addLoc(a1, file$j, 102, 312, 5658);
				span1.className = "track_limit svelte-yshvux";
				addLoc(span1, file$j, 102, 14, 5360);
				div.className = "limit_info svelte-yshvux";
				addLoc(div, file$j, 101, 12, 5321);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, span1);
				append(span1, text0);
				append(span1, span0);
				append(span0, text1);
				append(span1, text2);
				append(span1, text3);
				append(span1, text4);
				append(span1, a0);
				append(span1, text6);
				append(span1, a1);
			},

			p: function update(changed, ctx) {
				if ((changed.$player) && text1_value !== (text1_value = ctx.$player.limit == 1 ? 'current' : ctx.$player.limit)) {
					setData(text1, text1_value);
				}

				if ((changed.$player) && text3_value !== (text3_value = ctx.$player.limit == 1 ? 'track' : 'tracks')) {
					setData(text3, text3_value);
				}

				if (changed.touchAction) {
					toggleClass(a0, "touch_pressed", ctx.touchAction == 'limit_reset');
					toggleClass(a1, "touch_pressed", ctx.touchAction == 'time_limit_increase');
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				removeListener(a0, "click", click_handler);
				removeListener(a1, "click", click_handler_1);
			}
		};
	}

	// (123:8) {#if !$player.isStream}
	function create_if_block_7$2(component, ctx) {
		var if_block_anchor;

		function select_block_type_7(ctx) {
			if (!ctx.$playlist || ctx.$playlist.length == 0) return create_if_block_8$1;
			return create_else_block$8;
		}

		var current_block_type = select_block_type_7(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type_7(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},

			d: function destroy(detach) {
				if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (133:10) {:else}
	function create_else_block$8(component, ctx) {
		var div, text;

		var if_block0 = (ctx.$playlistMetadata.currentSongIsSelected && ctx.$player.currentMedia && ctx.$player.currentMedia.songPath) && create_if_block_12(component, ctx);

		function select_block_type_8(ctx) {
			if (ctx.$playlistMetadata.playlistHasSelectedEntries) return create_if_block_9$1;
			if (ctx.$playlistMetadata.playlistClipboard) return create_if_block_11;
		}

		var current_block_type = select_block_type_8(ctx);
		var if_block1 = current_block_type && current_block_type(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				if (if_block0) if_block0.c();
				text = createText("\n              ");
				if (if_block1) if_block1.c();
				div.className = "extra_option svelte-yshvux";
				addLoc(div, file$j, 134, 12, 7179);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				if (if_block0) if_block0.m(div, null);
				append(div, text);
				if (if_block1) if_block1.m(div, null);
			},

			p: function update(changed, ctx) {
				if (ctx.$playlistMetadata.currentSongIsSelected && ctx.$player.currentMedia && ctx.$player.currentMedia.songPath) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_12(component, ctx);
						if_block0.c();
						if_block0.m(div, text);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (current_block_type === (current_block_type = select_block_type_8(ctx)) && if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if (if_block1) if_block1.d(1);
					if_block1 = current_block_type && current_block_type(component, ctx);
					if (if_block1) if_block1.c();
					if (if_block1) if_block1.m(div, null);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
			}
		};
	}

	// (125:10) {#if !$playlist || $playlist.length == 0}
	function create_if_block_8$1(component, ctx) {
		var div, h1;

		return {
			c: function create() {
				div = createElement("div");
				h1 = createElement("h1");
				h1.textContent = "Playlist is empty";
				h1.className = "svelte-yshvux";
				addLoc(h1, file$j, 126, 14, 6901);
				div.className = "player_notice svelte-yshvux";
				addLoc(div, file$j, 125, 12, 6859);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, h1);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (136:14) {#if $playlistMetadata.currentSongIsSelected && $player.currentMedia && $player.currentMedia.songPath}
	function create_if_block_12(component, ctx) {
		var button;

		function click_handler(event) {
			component.stop();
		}

		return {
			c: function create() {
				button = createElement("button");
				button.textContent = "■ Stop";
				addListener(button, "click", click_handler);
				button.className = "svelte-yshvux";
				toggleClass(button, "touch_pressed", ctx.touchAction == 'stop');
				addLoc(button, file$j, 136, 16, 7339);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.touchAction) {
					toggleClass(button, "touch_pressed", ctx.touchAction == 'stop');
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler);
			}
		};
	}

	// (145:60) 
	function create_if_block_11(component, ctx) {
		var button;

		function click_handler(event) {
			component.paste();
		}

		return {
			c: function create() {
				button = createElement("button");
				button.textContent = "Put back";
				addListener(button, "click", click_handler);
				button.className = "svelte-yshvux";
				toggleClass(button, "touch_pressed", ctx.touchAction == 'paste');
				addLoc(button, file$j, 145, 16, 7962);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.touchAction) {
					toggleClass(button, "touch_pressed", ctx.touchAction == 'paste');
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler);
			}
		};
	}

	// (139:14) {#if $playlistMetadata.playlistHasSelectedEntries}
	function create_if_block_9$1(component, ctx) {
		var button, text_1, if_block_anchor;

		function click_handler(event) {
			component.cut();
		}

		var if_block = (!(ctx.$playlistMetadata.currentSongIsSelected && ctx.$player.currentMedia && ctx.$player.currentMedia.songPath)) && create_if_block_10(component, ctx);

		return {
			c: function create() {
				button = createElement("button");
				button.textContent = "Remove";
				text_1 = createText("\n\n                ");
				if (if_block) if_block.c();
				if_block_anchor = createComment();
				addListener(button, "click", click_handler);
				button.className = "svelte-yshvux";
				toggleClass(button, "touch_pressed", ctx.touchAction == 'cut_selected');
				addLoc(button, file$j, 139, 16, 7526);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
				insert(target, text_1, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.touchAction) {
					toggleClass(button, "touch_pressed", ctx.touchAction == 'cut_selected');
				}

				if (!(ctx.$playlistMetadata.currentSongIsSelected && ctx.$player.currentMedia && ctx.$player.currentMedia.songPath)) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_10(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler);
				if (detach) {
					detachNode(text_1);
				}

				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (142:16) {#if !($playlistMetadata.currentSongIsSelected && $player.currentMedia && $player.currentMedia.songPath)}
	function create_if_block_10(component, ctx) {
		var button;

		function click_handler(event) {
			component.deselectAll();
		}

		return {
			c: function create() {
				button = createElement("button");
				button.textContent = "Deselect";
				addListener(button, "click", click_handler);
				button.className = "svelte-yshvux";
				toggleClass(button, "touch_pressed", ctx.touchAction == 'deselect_all');
				addLoc(button, file$j, 142, 18, 7760);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.touchAction) {
					toggleClass(button, "touch_pressed", ctx.touchAction == 'deselect_all');
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler);
			}
		};
	}

	// (158:8) {#if !$player.isStream && $playlist}
	function create_if_block_6$3(component, ctx) {
		var div, ul;

		var each_value_3 = ctx.$playlist;

		var each_blocks = [];

		for (var i = 0; i < each_value_3.length; i += 1) {
			each_blocks[i] = create_each_block$2(component, get_each_context_3(ctx, each_value_3, i));
		}

		return {
			c: function create() {
				div = createElement("div");
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				ul.className = "svelte-yshvux";
				addLoc(ul, file$j, 159, 12, 8348);
				div.id = "playlist";
				div.className = "svelte-yshvux";
				addLoc(div, file$j, 158, 10, 8316);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, ul);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.$playlist || changed.$player) {
					each_value_3 = ctx.$playlist;

					for (var i = 0; i < each_value_3.length; i += 1) {
						const child_ctx = get_each_context_3(ctx, each_value_3, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$2(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(ul, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value_3.length;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (161:14) {#each $playlist as song}
	function create_each_block$2(component, ctx) {
		var li, span0, text0_value = ctx.song.current ? (ctx.$player.paused ? '→' : (!ctx.$player.currentMedia || !ctx.$player.currentMedia.mediaType || ctx.$player.currentMedia.mediaType == 'music' ? '♫' : '▶')) : '', text0, text1, span1, text2_value = util.pad(ctx.song.id), text2, text3, span2, text4_value = ctx.song.title, text4;

		return {
			c: function create() {
				li = createElement("li");
				span0 = createElement("span");
				text0 = createText(text0_value);
				text1 = createText("\n                  ");
				span1 = createElement("span");
				text2 = createText(text2_value);
				text3 = createText("\n                  ");
				span2 = createElement("span");
				text4 = createText(text4_value);
				span0.className = "marker svelte-yshvux";
				toggleClass(span0, "spaced", ctx.$player.spaced && ctx.$player.paused && (!ctx.$player.currentMedia || (ctx.$player.currentMedia && !ctx.$player.currentMedia.songPath)));
				addLoc(span0, file$j, 162, 18, 8727);
				span1.className = "id svelte-yshvux";
				toggleClass(span1, "darker", ctx.song.directoryTogetherness);
				addLoc(span1, file$j, 163, 18, 9071);
				span2.className = "song svelte-yshvux";
				addLoc(span2, file$j, 164, 18, 9175);

				li._svelte = { component, ctx };

				addListener(li, "click", click_handler$1);
				li.className = "svelte-yshvux";
				toggleClass(li, "playing", ctx.song.current && !ctx.$player.paused && !ctx.$player.isStream);
				toggleClass(li, "past", ctx.song.past);
				toggleClass(li, "within_limit", ctx.song.withinLimit);
				toggleClass(li, "about_to_be_cut", ctx.song.aboutToBeCut);
				toggleClass(li, "selected", ctx.song.selected);
				toggleClass(li, "just_pasted", ctx.song.justPasted);
				toggleClass(li, "error", ctx.song.error);
				addLoc(li, file$j, 161, 16, 8409);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				append(li, span0);
				append(span0, text0);
				append(li, text1);
				append(li, span1);
				append(span1, text2);
				append(li, text3);
				append(li, span2);
				append(span2, text4);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if ((changed.$playlist || changed.$player) && text0_value !== (text0_value = ctx.song.current ? (ctx.$player.paused ? '→' : (!ctx.$player.currentMedia || !ctx.$player.currentMedia.mediaType || ctx.$player.currentMedia.mediaType == 'music' ? '♫' : '▶')) : '')) {
					setData(text0, text0_value);
				}

				if (changed.$player) {
					toggleClass(span0, "spaced", ctx.$player.spaced && ctx.$player.paused && (!ctx.$player.currentMedia || (ctx.$player.currentMedia && !ctx.$player.currentMedia.songPath)));
				}

				if ((changed.$playlist) && text2_value !== (text2_value = util.pad(ctx.song.id))) {
					setData(text2, text2_value);
				}

				if (changed.$playlist) {
					toggleClass(span1, "darker", ctx.song.directoryTogetherness);
				}

				if ((changed.$playlist) && text4_value !== (text4_value = ctx.song.title)) {
					setData(text4, text4_value);
				}

				li._svelte.ctx = ctx;
				if ((changed.$playlist || changed.$player)) {
					toggleClass(li, "playing", ctx.song.current && !ctx.$player.paused && !ctx.$player.isStream);
				}

				if (changed.$playlist) {
					toggleClass(li, "past", ctx.song.past);
					toggleClass(li, "within_limit", ctx.song.withinLimit);
					toggleClass(li, "about_to_be_cut", ctx.song.aboutToBeCut);
					toggleClass(li, "selected", ctx.song.selected);
					toggleClass(li, "just_pasted", ctx.song.justPasted);
					toggleClass(li, "error", ctx.song.error);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}

				removeListener(li, "click", click_handler$1);
			}
		};
	}

	// (174:8) {#if $player.isStream && $player.currentMedia && $player.currentMedia.song}
	function create_if_block_4$8(component, ctx) {
		var div2, div0, text1, div1, text2, text3_value = ctx.$player.currentMedia.song, text3;

		var if_block = (!ctx.$player.paused) && create_if_block_5$7();

		return {
			c: function create() {
				div2 = createElement("div");
				div0 = createElement("div");
				div0.textContent = "— Internet radio stream —";
				text1 = createText("\n\n            ");
				div1 = createElement("div");
				if (if_block) if_block.c();
				text2 = createText("\n\n            ");
				text3 = createText(text3_value);
				div0.className = "notice svelte-yshvux";
				addLoc(div0, file$j, 176, 12, 9554);
				div1.className = "song svelte-yshvux";
				toggleClass(div1, "bigger", ctx.$player.currentMedia.song.length < 35);
				addLoc(div1, file$j, 178, 12, 9619);
				div2.className = "streaming_media_info svelte-yshvux";
				toggleClass(div2, "faded", ctx.$player.paused);
				addLoc(div2, file$j, 174, 10, 9477);
			},

			m: function mount(target, anchor) {
				insert(target, div2, anchor);
				append(div2, div0);
				append(div2, text1);
				append(div2, div1);
				if (if_block) if_block.m(div1, null);
				append(div1, text2);
				append(div1, text3);
			},

			p: function update(changed, ctx) {
				if (!ctx.$player.paused) {
					if (!if_block) {
						if_block = create_if_block_5$7();
						if_block.c();
						if_block.m(div1, text2);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if ((changed.$player) && text3_value !== (text3_value = ctx.$player.currentMedia.song)) {
					setData(text3, text3_value);
				}

				if (changed.$player) {
					toggleClass(div1, "bigger", ctx.$player.currentMedia.song.length < 35);
					toggleClass(div2, "faded", ctx.$player.paused);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div2);
				}

				if (if_block) if_block.d();
			}
		};
	}

	// (181:14) {#if !$player.paused}
	function create_if_block_5$7(component, ctx) {
		var span;

		return {
			c: function create() {
				span = createElement("span");
				span.textContent = "♪♫♬";
				span.className = "svelte-yshvux";
				addLoc(span, file$j, 181, 16, 9744);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(span);
				}
			}
		};
	}

	function Player(options) {
		this._debugName = '<Player>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<Player> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["connected","controller","searchResults","player","playlist","playlistMetadata"]), options.data);
		this.store._add(this, ["connected","controller","searchResults","player","playlist","playlistMetadata"]);
		if (!('loaded' in this._state)) console.warn("<Player> was created without expected data property 'loaded'");
		if (!('$connected' in this._state)) console.warn("<Player> was created without expected data property '$connected'");
		if (!('$controller' in this._state)) console.warn("<Player> was created without expected data property '$controller'");
		if (!('atRPi' in this._state)) console.warn("<Player> was created without expected data property 'atRPi'");
		if (!('searchQuery' in this._state)) console.warn("<Player> was created without expected data property 'searchQuery'");
		if (!('mediaType' in this._state)) console.warn("<Player> was created without expected data property 'mediaType'");
		if (!('$searchResults' in this._state)) console.warn("<Player> was created without expected data property '$searchResults'");
		if (!('$player' in this._state)) console.warn("<Player> was created without expected data property '$player'");
		if (!('$playlist' in this._state)) console.warn("<Player> was created without expected data property '$playlist'");
		if (!('homebase' in this._state)) console.warn("<Player> was created without expected data property 'homebase'");
		if (!('touchAction' in this._state)) console.warn("<Player> was created without expected data property 'touchAction'");
		if (!('timeLimit' in this._state)) console.warn("<Player> was created without expected data property 'timeLimit'");
		if (!('$playlistMetadata' in this._state)) console.warn("<Player> was created without expected data property '$playlistMetadata'");
		this._intro = !!options.intro;

		this._handlers.destroy = [ondestroy$2, removeFromStore];

		this._fragment = create_main_fragment$m(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$g.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(Player.prototype, protoDev);
	assign(Player.prototype, methods$a);

	Player.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/widgets/src/AnalogClock.html generated by Svelte v2.16.1 */

	function getTime() {
	  const time = new Date();

	  return {
	    hours: time.getHours(),
	    minutes: time.getMinutes(),
	    seconds: time.getSeconds()
	  }
	}

	// original: https://github.com/sveltejs/v2.svelte.dev/blob/master/content/examples/svg-clock/App.html
	// had to rework state a bit because for some reason it didn't work ok in production (Rotate(NaN) error)
	// when using computed() properties
	function data() {
	  return getTime();
	}
	function oncreate$h() {
	  const update = () => {
	    this.set(getTime());
	    this.timer = setTimeout(update, 1000);
	  };

	  update();
	}
	function ondestroy$3() {
	  clearTimeout(this.timer);
	}
	const file$k = "Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/widgets/src/AnalogClock.html";

	function get_each_context_1$2(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.offset = list[i];
		return child_ctx;
	}

	function get_each_context$3(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.minute = list[i];
		return child_ctx;
	}

	function create_main_fragment$n(component, ctx) {
		var svg, circle, line0, line0_transform_value, line1, line1_transform_value, g, line2, line3, g_transform_value, current;

		var each_value = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$3(component, get_each_context$3(ctx, each_value, i));
		}

		return {
			c: function create() {
				svg = createSvgElement("svg");
				circle = createSvgElement("circle");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				line0 = createSvgElement("line");
				line1 = createSvgElement("line");
				g = createSvgElement("g");
				line2 = createSvgElement("line");
				line3 = createSvgElement("line");
				setAttribute(circle, "class", "clock-face svelte-1qpx3nh");
				setAttribute(circle, "r", "48");
				addLoc(circle, file$k, 1, 2, 34);
				setAttribute(line0, "class", "hour svelte-1qpx3nh");
				setAttribute(line0, "y1", "2");
				setAttribute(line0, "y2", "-20");
				setAttribute(line0, "transform", line0_transform_value = "rotate(" + (30 * ctx.hours + ctx.minutes / 2) + ")");
				addLoc(line0, file$k, 23, 2, 471);
				setAttribute(line1, "class", "minute svelte-1qpx3nh");
				setAttribute(line1, "y1", "4");
				setAttribute(line1, "y2", "-30");
				setAttribute(line1, "transform", line1_transform_value = "rotate(" + (6 * ctx.minutes + ctx.seconds / 10) + ")");
				addLoc(line1, file$k, 31, 2, 600);
				setAttribute(line2, "class", "second svelte-1qpx3nh");
				setAttribute(line2, "y1", "10");
				setAttribute(line2, "y2", "-38");
				addLoc(line2, file$k, 40, 4, 775);
				setAttribute(line3, "class", "second-counterweight svelte-1qpx3nh");
				setAttribute(line3, "y1", "10");
				setAttribute(line3, "y2", "2");
				addLoc(line3, file$k, 41, 4, 819);
				setAttribute(g, "transform", g_transform_value = "rotate(" + 6 * ctx.seconds + ")");
				addLoc(g, file$k, 39, 2, 733);
				setAttribute(svg, "viewBox", "-50 -50 100 100");
				setAttribute(svg, "class", "svelte-1qpx3nh");
				addLoc(svg, file$k, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, svg, anchor);
				append(svg, circle);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(svg, null);
				}

				append(svg, line0);
				append(svg, line1);
				append(svg, g);
				append(g, line2);
				append(g, line3);
				current = true;
			},

			p: function update(changed, ctx) {
				if ((changed.hours || changed.minutes) && line0_transform_value !== (line0_transform_value = "rotate(" + (30 * ctx.hours + ctx.minutes / 2) + ")")) {
					setAttribute(line0, "transform", line0_transform_value);
				}

				if ((changed.minutes || changed.seconds) && line1_transform_value !== (line1_transform_value = "rotate(" + (6 * ctx.minutes + ctx.seconds / 10) + ")")) {
					setAttribute(line1, "transform", line1_transform_value);
				}

				if ((changed.seconds) && g_transform_value !== (g_transform_value = "rotate(" + 6 * ctx.seconds + ")")) {
					setAttribute(g, "transform", g_transform_value);
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (detach) {
					detachNode(svg);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (13:4) {#each [1, 2, 3, 4] as offset}
	function create_each_block_1$2(component, ctx) {
		var line;

		return {
			c: function create() {
				line = createSvgElement("line");
				setAttribute(line, "class", "minor svelte-1qpx3nh");
				setAttribute(line, "y1", "42");
				setAttribute(line, "y2", "45");
				setAttribute(line, "transform", "rotate(" + 6 * (ctx.minute + ctx.offset) + ")");
				addLoc(line, file$k, 13, 6, 304);
			},

			m: function mount(target, anchor) {
				insert(target, line, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(line);
				}
			}
		};
	}

	// (5:2) {#each [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as minute}
	function create_each_block$3(component, ctx) {
		var line, each_anchor;

		var each_value_1 = [1, 2, 3, 4];

		var each_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block_1$2(component, get_each_context_1$2(ctx, each_value_1, i));
		}

		return {
			c: function create() {
				line = createSvgElement("line");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_anchor = createComment();
				setAttribute(line, "class", "major svelte-1qpx3nh");
				setAttribute(line, "y1", "40");
				setAttribute(line, "y2", "45");
				setAttribute(line, "transform", "rotate(" + 30 * ctx.minute + ")");
				addLoc(line, file$k, 5, 4, 161);
			},

			m: function mount(target, anchor) {
				insert(target, line, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(target, anchor);
				}

				insert(target, each_anchor, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(line);
				}

				destroyEach(each_blocks, detach);

				if (detach) {
					detachNode(each_anchor);
				}
			}
		};
	}

	function AnalogClock(options) {
		this._debugName = '<AnalogClock>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data(), options.data);
		if (!('hours' in this._state)) console.warn("<AnalogClock> was created without expected data property 'hours'");
		if (!('minutes' in this._state)) console.warn("<AnalogClock> was created without expected data property 'minutes'");
		if (!('seconds' in this._state)) console.warn("<AnalogClock> was created without expected data property 'seconds'");
		this._intro = !!options.intro;

		this._handlers.destroy = [ondestroy$3];

		this._fragment = create_main_fragment$n(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$h.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(AnalogClock.prototype, protoDev);

	AnalogClock.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/clock/src/FavoriteTweets.html generated by Svelte v2.16.1 */

	var methods$b = {
	  visitTweet(tweet) {
	    console.log(tweet.url);
	    if(tweet.url) {
	      window.location = tweet.url;
	    }
	  }
	};

	function oncreate$i() {

	}
	const file$l = "Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/clock/src/FavoriteTweets.html";

	function click_handler$2(event) {
		const { component, ctx } = this._svelte;

		component.visitTweet(ctx.tweet);
	}

	function get_each_context$4(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.tweet = list[i];
		return child_ctx;
	}

	function create_main_fragment$o(component, ctx) {
		var if_block_anchor, current;

		var if_block = (ctx.$connected) && create_if_block$l(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.$connected) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$l(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (1:0) {#if $connected}
	function create_if_block$l(component, ctx) {
		var each_anchor;

		var each_value = ctx.tweets;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$4(component, get_each_context$4(ctx, each_value, i));
		}

		return {
			c: function create() {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_anchor = createComment();
			},

			m: function mount(target, anchor) {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(target, anchor);
				}

				insert(target, each_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.tweets) {
					each_value = ctx.tweets;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$4(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$4(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(each_anchor.parentNode, each_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}
			},

			d: function destroy(detach) {
				destroyEach(each_blocks, detach);

				if (detach) {
					detachNode(each_anchor);
				}
			}
		};
	}

	// (3:2) {#each tweets as tweet}
	function create_each_block$4(component, ctx) {
		var div5, div0, text1, div1, img, img_src_value, text2, div4, div2, span0, text3_value = ctx.tweet.userName, text3, text4, span1, text5_value = ctx.tweet.userHandle, text5, text6, div3, text7_value = ctx.tweet.text, text7, text8;

		return {
			c: function create() {
				div5 = createElement("div");
				div0 = createElement("div");
				div0.textContent = "❤️";
				text1 = createText("\n      ");
				div1 = createElement("div");
				img = createElement("img");
				text2 = createText("\n      ");
				div4 = createElement("div");
				div2 = createElement("div");
				span0 = createElement("span");
				text3 = createText(text3_value);
				text4 = createText("\n          ");
				span1 = createElement("span");
				text5 = createText(text5_value);
				text6 = createText("\n        ");
				div3 = createElement("div");
				text7 = createText(text7_value);
				text8 = createText("\n    ");
				div0.className = "symbol svelte-r9o5y7";
				addLoc(div0, file$l, 4, 6, 103);
				img.src = img_src_value = ctx.tweet.photoUrl;
				img.className = "svelte-r9o5y7";
				addLoc(img, file$l, 5, 25, 157);
				div1.className = "photo svelte-r9o5y7";
				addLoc(div1, file$l, 5, 6, 138);
				span0.className = "name svelte-r9o5y7";
				addLoc(span0, file$l, 8, 10, 254);
				span1.className = "handle";
				addLoc(span1, file$l, 9, 10, 307);
				div2.className = "user svelte-r9o5y7";
				addLoc(div2, file$l, 7, 8, 225);
				div3.className = "text svelte-r9o5y7";
				addLoc(div3, file$l, 11, 8, 377);
				div4.className = "info svelte-r9o5y7";
				addLoc(div4, file$l, 6, 6, 198);

				div5._svelte = { component, ctx };

				addListener(div5, "click", click_handler$2);
				div5.className = "tweet svelte-r9o5y7";
				addLoc(div5, file$l, 3, 4, 48);
			},

			m: function mount(target, anchor) {
				insert(target, div5, anchor);
				append(div5, div0);
				append(div5, text1);
				append(div5, div1);
				append(div1, img);
				append(div5, text2);
				append(div5, div4);
				append(div4, div2);
				append(div2, span0);
				append(span0, text3);
				append(div2, text4);
				append(div2, span1);
				append(span1, text5);
				append(div4, text6);
				append(div4, div3);
				append(div3, text7);
				append(div5, text8);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if ((changed.tweets) && img_src_value !== (img_src_value = ctx.tweet.photoUrl)) {
					img.src = img_src_value;
				}

				if ((changed.tweets) && text3_value !== (text3_value = ctx.tweet.userName)) {
					setData(text3, text3_value);
				}

				if ((changed.tweets) && text5_value !== (text5_value = ctx.tweet.userHandle)) {
					setData(text5, text5_value);
				}

				if ((changed.tweets) && text7_value !== (text7_value = ctx.tweet.text)) {
					setData(text7, text7_value);
				}

				div5._svelte.ctx = ctx;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div5);
				}

				removeListener(div5, "click", click_handler$2);
			}
		};
	}

	function FavoriteTweets(options) {
		this._debugName = '<FavoriteTweets>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<FavoriteTweets> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["connected"]), options.data);
		this.store._add(this, ["connected"]);
		if (!('$connected' in this._state)) console.warn("<FavoriteTweets> was created without expected data property '$connected'");
		if (!('tweets' in this._state)) console.warn("<FavoriteTweets> was created without expected data property 'tweets'");
		this._intro = !!options.intro;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$o(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$i.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(FavoriteTweets.prototype, protoDev);
	assign(FavoriteTweets.prototype, methods$b);

	FavoriteTweets.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/clock/src/Clock.html generated by Svelte v2.16.1 */



	var methods$c = {
	  go(handle) {
	    window.location.href = `http://${window.location.hostname}:${window.location.port}/${handle}`;
	  },
	  select(view) {
	    this.fire('select', { view });
	  },
	  toggleClock() {
	    this.set({ clockHidden: !this.get().clockHidden });

	    const visibility = this.get().clockHidden ? 'hidden' : 'visible';

	    document.getElementById('clock_inner').style.visibility = visibility;
	  }
	};

	function oncreate$j() {
	  this.store.entangle(this);

	  this.listener = this.store.on('state', ({ current, changed, previous }) => {
	    //const photoPath = def.makeTryable(current).try('controller.gallery.photoPath');

	    // if(photoPath) {
	    //   css.setWallpaper(photoPath)
	    // }
	  });

	  //css.setWallpaper('cities/Monaco1.jpg');
	}
	function ondestroy$4() {
	  this.listener.cancel();
	}
	const file$m = "Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/clock/src/Clock.html";

	function create_main_fragment$p(component, ctx) {
		var if_block_anchor, current;

		var if_block = (ctx.loaded) && create_if_block$m(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.loaded) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$m(component, ctx);
						if (if_block) if_block.c();
					}

					if_block.i(if_block_anchor.parentNode, if_block_anchor);
				} else if (if_block) {
					if_block.o(function() {
						if_block.d(1);
						if_block = null;
					});
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (if_block) if_block.o(outrocallback);
				else outrocallback();

				current = false;
			},

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (1:0) {#if loaded}
	function create_if_block$m(component, ctx) {
		var if_block_anchor, current;

		var if_block = (ctx.$connected) && create_if_block_1$g(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.$connected) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_1$g(component, ctx);
						if (if_block) if_block.c();
					}

					if_block.i(if_block_anchor.parentNode, if_block_anchor);
				} else if (if_block) {
					if_block.o(function() {
						if_block.d(1);
						if_block = null;
					});
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (if_block) if_block.o(outrocallback);
				else outrocallback();

				current = false;
			},

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (5:2) {#if $connected}
	function create_if_block_1$g(component, ctx) {
		var current_block_type_index, if_block, text, current;

		var if_block_creators = [
			create_if_block_2$e,
			create_else_block$9
		];

		var if_blocks = [];

		function select_block_type(ctx) {
			if (ctx.viewDef && ctx.viewDef.show == 'tweets' && ctx.$integrations && ctx.$integrations.twitter && ctx.$integrations.twitter.favoriteTweets) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);

		var playinfo = new PlayInfo({
			root: component.root,
			store: component.store
		});

		playinfo.on("select", function(event) {
			component.select(event.view);
		});

		return {
			c: function create() {
				if_block.c();
				text = createText("\n\n    ");
				playinfo._fragment.c();
			},

			m: function mount(target, anchor) {
				if_blocks[current_block_type_index].m(target, anchor);
				insert(target, text, anchor);
				playinfo._mount(target, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				var previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);
				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(changed, ctx);
				} else {
					if_block.o(function() {
						if_blocks[previous_block_index].d(1);
						if_blocks[previous_block_index] = null;
					});

					if_block = if_blocks[current_block_type_index];
					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);
						if_block.c();
					}
					if_block.m(text.parentNode, text);
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				outrocallback = callAfter(outrocallback, 2);

				if (if_block) if_block.o(outrocallback);
				else outrocallback();

				if (playinfo) playinfo._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy(detach) {
				if_blocks[current_block_type_index].d(detach);
				if (detach) {
					detachNode(text);
				}

				playinfo.destroy(detach);
			}
		};
	}

	// (13:4) {:else}
	function create_else_block$9(component, ctx) {
		var div1, div0, current;

		var clock = new AnalogClock({
			root: component.root,
			store: component.store
		});

		function click_handler(event) {
			component.toggleClock();
		}

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				clock._fragment.c();
				div0.id = "clock_inner";
				addLoc(div0, file$m, 15, 8, 473);
				addListener(div1, "click", click_handler);
				div1.id = "analog_clock";
				div1.className = "svelte-klta3a";
				toggleClass(div1, "hidden", ctx.viewDef && ctx.viewDef.show == 'none');
				addLoc(div1, file$m, 14, 6, 367);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				clock._mount(div0, null);
				current = true;
			},

			p: function update(changed, ctx) {
				if (changed.viewDef) {
					toggleClass(div1, "hidden", ctx.viewDef && ctx.viewDef.show == 'none');
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (clock) clock._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				clock.destroy();
				removeListener(div1, "click", click_handler);
			}
		};
	}

	// (7:4) {#if viewDef && viewDef.show == 'tweets' && $integrations && $integrations.twitter && $integrations.twitter.favoriteTweets}
	function create_if_block_2$e(component, ctx) {
		var div, current;

		var favoritetweets_initial_data = { tweets: ctx.$integrations.twitter.favoriteTweets.data };
		var favoritetweets = new FavoriteTweets({
			root: component.root,
			store: component.store,
			data: favoritetweets_initial_data
		});

		return {
			c: function create() {
				div = createElement("div");
				favoritetweets._fragment.c();
				div.id = "favorite_tweets";
				div.className = "svelte-klta3a";
				addLoc(div, file$m, 8, 6, 228);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				favoritetweets._mount(div, null);
				current = true;
			},

			p: function update(changed, ctx) {
				var favoritetweets_changes = {};
				if (changed.$integrations) favoritetweets_changes.tweets = ctx.$integrations.twitter.favoriteTweets.data;
				favoritetweets._set(favoritetweets_changes);
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (favoritetweets) favoritetweets._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				favoritetweets.destroy();
			}
		};
	}

	function Clock_1(options) {
		this._debugName = '<Clock_1>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<Clock_1> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["connected","integrations"]), options.data);
		this.store._add(this, ["connected","integrations"]);
		if (!('loaded' in this._state)) console.warn("<Clock_1> was created without expected data property 'loaded'");
		if (!('$connected' in this._state)) console.warn("<Clock_1> was created without expected data property '$connected'");
		if (!('viewDef' in this._state)) console.warn("<Clock_1> was created without expected data property 'viewDef'");
		if (!('$integrations' in this._state)) console.warn("<Clock_1> was created without expected data property '$integrations'");
		this._intro = !!options.intro;

		this._handlers.destroy = [ondestroy$4, removeFromStore];

		this._fragment = create_main_fragment$p(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$j.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(Clock_1.prototype, protoDev);
	assign(Clock_1.prototype, methods$c);

	Clock_1.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/ambience/src/Ambience.html generated by Svelte v2.16.1 */



	function oncreate$k() {
	  this.store.entangle(this);
	}
	const file$n = "Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/ambience/src/Ambience.html";

	function create_main_fragment$q(component, ctx) {
		var if_block_anchor, current;

		var if_block = (ctx.$connected) && create_if_block$n(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.$connected) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$n(component, ctx);
						if (if_block) if_block.c();
					}

					if_block.i(if_block_anchor.parentNode, if_block_anchor);
				} else if (if_block) {
					if_block.o(function() {
						if_block.d(1);
						if_block = null;
					});
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (if_block) if_block.o(outrocallback);
				else outrocallback();

				current = false;
			},

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (1:0) {#if $connected}
	function create_if_block$n(component, ctx) {
		var div1, text, div0, current;

		var iotactions = new IotActions({
			root: component.root,
			store: component.store
		});

		var weatherwidget_initial_data = { weather: ctx.weather };
		var weatherwidget = new WeatherWidget({
			root: component.root,
			store: component.store,
			data: weatherwidget_initial_data
		});

		return {
			c: function create() {
				div1 = createElement("div");
				iotactions._fragment.c();
				text = createText("\n\n    ");
				div0 = createElement("div");
				weatherwidget._fragment.c();
				div0.id = "weather_widget";
				div0.className = "svelte-n9atzi";
				addLoc(div0, file$n, 6, 4, 67);
				div1.id = "iot_actions";
				div1.className = "svelte-n9atzi";
				addLoc(div1, file$n, 2, 2, 20);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				iotactions._mount(div1, null);
				append(div1, text);
				append(div1, div0);
				weatherwidget._mount(div0, null);
				current = true;
			},

			p: function update(changed, ctx) {
				var weatherwidget_changes = {};
				if (changed.weather) weatherwidget_changes.weather = ctx.weather;
				weatherwidget._set(weatherwidget_changes);
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				outrocallback = callAfter(outrocallback, 2);

				if (iotactions) iotactions._fragment.o(outrocallback);
				if (weatherwidget) weatherwidget._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				iotactions.destroy();
				weatherwidget.destroy();
			}
		};
	}

	function Ambience(options) {
		this._debugName = '<Ambience>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<Ambience> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["connected"]), options.data);
		this.store._add(this, ["connected"]);
		if (!('$connected' in this._state)) console.warn("<Ambience> was created without expected data property '$connected'");
		if (!('weather' in this._state)) console.warn("<Ambience> was created without expected data property 'weather'");
		this._intro = !!options.intro;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$q(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$k.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(Ambience.prototype, protoDev);

	Ambience.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/help/src/Help.html generated by Svelte v2.16.1 */

	var methods$d = {
	  doc(doc) {
	    this.set({ doc });
	  }
	};

	function oncreate$l() {
	  this.store.entangle(this);

	  this.set({ doc: 'a' });
	}
	const file$o = "Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/help/src/Help.html";

	function create_main_fragment$r(component, ctx) {
		var div, h1, text1, button0, text3, button1, text5, button2, text7, text8, p, current;

		function click_handler(event) {
			component.doc('a');
		}

		function click_handler_1(event) {
			component.doc('b');
		}

		function click_handler_2(event) {
			component.doc('c');
		}

		var if_block = (ctx.doc == 'a') && create_if_block$o();

		return {
			c: function create() {
				div = createElement("div");
				h1 = createElement("h1");
				h1.textContent = "Help me with →";
				text1 = createText("\n\n  ");
				button0 = createElement("button");
				button0.textContent = "Basic understanding of the system";
				text3 = createText("\n  ");
				button1 = createElement("button");
				button1.textContent = "Using the media player";
				text5 = createText("\n  ");
				button2 = createElement("button");
				button2.textContent = "IoT functionality";
				text7 = createText("\n\n  ");
				if (if_block) if_block.c();
				text8 = createText("\n\n  ");
				p = createElement("p");
				p.textContent = "More information coming soon!";
				addLoc(h1, file$o, 5, 2, 195);
				addListener(button0, "click", click_handler);
				button0.className = "svelte-vezei2";
				toggleClass(button0, "selected", ctx.doc == 'a');
				addLoc(button0, file$o, 7, 2, 222);
				addListener(button1, "click", click_handler_1);
				button1.className = "svelte-vezei2";
				toggleClass(button1, "selected", ctx.doc == 'b');
				addLoc(button1, file$o, 8, 2, 323);
				addListener(button2, "click", click_handler_2);
				button2.className = "svelte-vezei2";
				toggleClass(button2, "selected", ctx.doc == 'c');
				addLoc(button2, file$o, 9, 2, 413);
				p.className = "violet svelte-vezei2";
				addLoc(p, file$o, 30, 2, 1418);
				div.id = "help";
				div.className = "svelte-vezei2";
				addLoc(div, file$o, 3, 0, 176);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, h1);
				append(div, text1);
				append(div, button0);
				append(div, text3);
				append(div, button1);
				append(div, text5);
				append(div, button2);
				append(div, text7);
				if (if_block) if_block.m(div, null);
				append(div, text8);
				append(div, p);
				current = true;
			},

			p: function update(changed, ctx) {
				if (changed.doc) {
					toggleClass(button0, "selected", ctx.doc == 'a');
					toggleClass(button1, "selected", ctx.doc == 'b');
					toggleClass(button2, "selected", ctx.doc == 'c');
				}

				if (ctx.doc == 'a') {
					if (!if_block) {
						if_block = create_if_block$o();
						if_block.c();
						if_block.m(div, text8);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				removeListener(button0, "click", click_handler);
				removeListener(button1, "click", click_handler_1);
				removeListener(button2, "click", click_handler_2);
				if (if_block) if_block.d();
			}
		};
	}

	// (12:2) {#if doc == 'a'}
	function create_if_block$o(component, ctx) {
		var p0, b, text1, p1, text3, p2, text5, p3;

		return {
			c: function create() {
				p0 = createElement("p");
				b = createElement("b");
				b.textContent = "Context";
				text1 = createText("\n\n    ");
				p1 = createElement("p");
				p1.textContent = "Miniature, cheap and powerful general purpose computers for home use only exist for a couple of years.\n    They are not yet widely used and there are a few reasons for this, one of them is lack of really great software built from scratch for the new paradigm.";
				text3 = createText("\n\n    ");
				p2 = createElement("p");
				p2.textContent = "RaspberryPi computer was introduced as a cheap but good enough alternative to the standard PC to be used in education. This is not the greatest strength / purpose of \"Single Board Computers\" though.";
				text5 = createText("\n\n    ");
				p3 = createElement("p");
				p3.textContent = "We should look at small and reliable SBCs as devices we can put in many different appliances: from touch screen home controllers to smart speakers and more. The real magic happens when these devices start to interact with each other — for example: one SBC is behind a touch screen that controls multiple speakers in our home.";
				addLoc(b, file$o, 13, 6, 530);
				p0.className = "svelte-vezei2";
				addLoc(p0, file$o, 12, 4, 520);
				p1.className = "svelte-vezei2";
				addLoc(p1, file$o, 16, 4, 559);
				p2.className = "svelte-vezei2";
				addLoc(p2, file$o, 21, 4, 841);
				p3.className = "svelte-vezei2";
				addLoc(p3, file$o, 25, 4, 1062);
			},

			m: function mount(target, anchor) {
				insert(target, p0, anchor);
				append(p0, b);
				insert(target, text1, anchor);
				insert(target, p1, anchor);
				insert(target, text3, anchor);
				insert(target, p2, anchor);
				insert(target, text5, anchor);
				insert(target, p3, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p0);
					detachNode(text1);
					detachNode(p1);
					detachNode(text3);
					detachNode(p2);
					detachNode(text5);
					detachNode(p3);
				}
			}
		};
	}

	function Help(options) {
		this._debugName = '<Help>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign({}, options.data);
		if (!('doc' in this._state)) console.warn("<Help> was created without expected data property 'doc'");
		this._intro = !!options.intro;

		this._fragment = create_main_fragment$r(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$l.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(Help.prototype, protoDev);
	assign(Help.prototype, methods$d);

	Help.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/calendar/src/Calendar.html generated by Svelte v2.16.1 */

	function oncreate$m() {

	}
	function create_main_fragment$s(component, ctx) {
		var if_block_anchor, current;

		var if_block = (ctx.$connected) && create_if_block$p();

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.$connected) {
					if (!if_block) {
						if_block = create_if_block$p();
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (1:0) {#if $connected}
	function create_if_block$p(component, ctx) {

		return {
			c: noop,

			m: noop,

			d: noop
		};
	}

	function Calendar$1(options) {
		this._debugName = '<Calendar>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<Calendar> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["connected"]), options.data);
		this.store._add(this, ["connected"]);
		if (!('$connected' in this._state)) console.warn("<Calendar> was created without expected data property '$connected'");
		this._intro = !!options.intro;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$s(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$m.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(Calendar$1.prototype, protoDev);

	Calendar$1.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/device/src/NearbySensors.html generated by Svelte v2.16.1 */

	function sensorIds({ sensors }) {
	  return Object.keys(sensors).sort()
	  // console.log(sensors);
	  // // if(deviceState) {
	  //   return Object.keys(deviceState.nearbySensors).length
	  // }
	}

	function computedSensorsByType({ sensors, now }) {

	  const types = util.unique(Object.values(sensors).map(sensorInfo => sensorInfo.type)).sort();

	  const computedSensors = {};

	  for(const type of types) {
	    computedSensors[type] = [];
	  }

	  for(const sensorId of Object.keys(sensors).sort()) {

	    const sensorInfo = sensors[sensorId];

	    const relTime = util.humanTime(util.msIntoTimeSpan(now - sensorInfo.lastUpdateAt));

	    const computedInfo = {
	      id: sensorId,
	      error: sensorInfo.error,
	      updateRelativeTime: relTime
	    };

	    computedSensors[sensorInfo.type].push(computedInfo);
	  }

	  return computedSensors;
	  // console.log(sensors);
	  // // if(deviceState) {
	  //   return Object.keys(deviceState.nearbySensors).length
	  // }
	}

	function colorJson$1(text) {
	  return util.colorJson(text)
	}
	function oncreate$n() {
	  //this.store.entangle(this);

	  const tick = () => {
	    const now = Date.now();
	    this.set({ now });
	    this.timeout = setTimeout(tick, 1000);
	  };

	  tick();
	}
	function ondestroy$5() {
	  clearTimeout(this.timeout);
	}
	const file$p = "Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/device/src/NearbySensors.html";

	function get_each_context_1$3(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.sensor = list[i];
		return child_ctx;
	}

	function get_each_context$5(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.sensorType = list[i];
		return child_ctx;
	}

	function create_main_fragment$t(component, ctx) {
		var div0, pre, raw_value = colorJson$1(ctx.sensors), text0, div1, p, text1, text2_value = ctx.Object.keys(ctx.sensors).length, text2, text3, current;

		var each_value = ctx.Object.keys(ctx.computedSensorsByType);

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$5(component, get_each_context$5(ctx, each_value, i));
		}

		return {
			c: function create() {
				div0 = createElement("div");
				pre = createElement("pre");
				text0 = createText("\n\n");
				div1 = createElement("div");
				p = createElement("p");
				text1 = createText("Sensors on local network: ");
				text2 = createText(text2_value);
				text3 = createText("\n\n  ");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				pre.className = "svelte-73m1e0";
				addLoc(pre, file$p, 1, 2, 31);
				div0.id = "sensors_json_view";
				div0.className = "svelte-73m1e0";
				addLoc(div0, file$p, 0, 0, 0);
				addLoc(p, file$p, 5, 2, 98);
				div1.id = "sensors";
				div1.className = "svelte-73m1e0";
				addLoc(div1, file$p, 4, 0, 77);
			},

			m: function mount(target, anchor) {
				insert(target, div0, anchor);
				append(div0, pre);
				pre.innerHTML = raw_value;
				insert(target, text0, anchor);
				insert(target, div1, anchor);
				append(div1, p);
				append(p, text1);
				append(p, text2);
				append(div1, text3);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div1, null);
				}

				current = true;
			},

			p: function update(changed, ctx) {
				if ((changed.sensors) && raw_value !== (raw_value = colorJson$1(ctx.sensors))) {
					pre.innerHTML = raw_value;
				}

				if ((changed.Object || changed.sensors) && text2_value !== (text2_value = ctx.Object.keys(ctx.sensors).length)) {
					setData(text2, text2_value);
				}

				if (changed.computedSensorsByType || changed.Object) {
					each_value = ctx.Object.keys(ctx.computedSensorsByType);

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$5(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$5(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div1, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (detach) {
					detachNode(div0);
					detachNode(text0);
					detachNode(div1);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (17:8) {#if sensor.error}
	function create_if_block_1$h(component, ctx) {
		var span;

		return {
			c: function create() {
				span = createElement("span");
				span.textContent = "Sensor reading error...";
				span.className = "error svelte-73m1e0";
				addLoc(span, file$p, 17, 10, 411);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(span);
				}
			}
		};
	}

	// (26:10) {:else}
	function create_else_block$a(component, ctx) {
		var span;

		return {
			c: function create() {
				span = createElement("span");
				span.textContent = "now";
				span.className = "svelte-73m1e0";
				addLoc(span, file$p, 26, 12, 629);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(span);
				}
			}
		};
	}

	// (24:10) {#if sensor.updateRelativeTime}
	function create_if_block$q(component, ctx) {
		var text0_value = ctx.sensor.updateRelativeTime, text0, text1;

		return {
			c: function create() {
				text0 = createText(text0_value);
				text1 = createText(" ago");
			},

			m: function mount(target, anchor) {
				insert(target, text0, anchor);
				insert(target, text1, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.computedSensorsByType || changed.Object) && text0_value !== (text0_value = ctx.sensor.updateRelativeTime)) {
					setData(text0, text0_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(text0);
					detachNode(text1);
				}
			}
		};
	}

	// (13:4) {#each computedSensorsByType[sensorType] as sensor}
	function create_each_block_1$3(component, ctx) {
		var div, h3, text0_value = ctx.sensor.id, text0, text1, text2, p, text3, text4;

		var if_block0 = (ctx.sensor.error) && create_if_block_1$h();

		function select_block_type(ctx) {
			if (ctx.sensor.updateRelativeTime) return create_if_block$q;
			return create_else_block$a;
		}

		var current_block_type = select_block_type(ctx);
		var if_block1 = current_block_type(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				h3 = createElement("h3");
				text0 = createText(text0_value);
				text1 = createText("\n\n        ");
				if (if_block0) if_block0.c();
				text2 = createText("\n\n        ");
				p = createElement("p");
				text3 = createText("LAST UPDATE:\n\n          ");
				if_block1.c();
				text4 = createText("\n      ");
				h3.className = "svelte-73m1e0";
				addLoc(h3, file$p, 14, 8, 352);
				addLoc(p, file$p, 20, 8, 485);
				div.className = "sensor_info svelte-73m1e0";
				addLoc(div, file$p, 13, 6, 318);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, h3);
				append(h3, text0);
				append(div, text1);
				if (if_block0) if_block0.m(div, null);
				append(div, text2);
				append(div, p);
				append(p, text3);
				if_block1.m(p, null);
				append(div, text4);
			},

			p: function update(changed, ctx) {
				if ((changed.computedSensorsByType || changed.Object) && text0_value !== (text0_value = ctx.sensor.id)) {
					setData(text0, text0_value);
				}

				if (ctx.sensor.error) {
					if (!if_block0) {
						if_block0 = create_if_block_1$h();
						if_block0.c();
						if_block0.m(div, text2);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1.d(1);
					if_block1 = current_block_type(component, ctx);
					if_block1.c();
					if_block1.m(p, null);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (if_block0) if_block0.d();
				if_block1.d();
			}
		};
	}

	// (10:2) {#each Object.keys(computedSensorsByType) as sensorType}
	function create_each_block$5(component, ctx) {
		var h2, text0_value = ctx.sensorType, text0, text1, each_anchor;

		var each_value_1 = ctx.computedSensorsByType[ctx.sensorType];

		var each_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block_1$3(component, get_each_context_1$3(ctx, each_value_1, i));
		}

		return {
			c: function create() {
				h2 = createElement("h2");
				text0 = createText(text0_value);
				text1 = createText("\n\n    ");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_anchor = createComment();
				h2.className = "svelte-73m1e0";
				addLoc(h2, file$p, 10, 4, 233);
			},

			m: function mount(target, anchor) {
				insert(target, h2, anchor);
				append(h2, text0);
				insert(target, text1, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(target, anchor);
				}

				insert(target, each_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.Object || changed.computedSensorsByType) && text0_value !== (text0_value = ctx.sensorType)) {
					setData(text0, text0_value);
				}

				if (changed.computedSensorsByType || changed.Object) {
					each_value_1 = ctx.computedSensorsByType[ctx.sensorType];

					for (var i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_1$3(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(each_anchor.parentNode, each_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value_1.length;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(h2);
					detachNode(text1);
				}

				destroyEach(each_blocks, detach);

				if (detach) {
					detachNode(each_anchor);
				}
			}
		};
	}

	function NearbySensors(options) {
		this._debugName = '<NearbySensors>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign({ Object : Object }, options.data);

		this._recompute({ sensors: 1, now: 1 }, this._state);
		if (!('sensors' in this._state)) console.warn("<NearbySensors> was created without expected data property 'sensors'");
		if (!('now' in this._state)) console.warn("<NearbySensors> was created without expected data property 'now'");
		this._intro = !!options.intro;

		this._handlers.destroy = [ondestroy$5];

		this._fragment = create_main_fragment$t(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$n.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(NearbySensors.prototype, protoDev);

	NearbySensors.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('sensorIds' in newState && !this._updatingReadonlyProperty) throw new Error("<NearbySensors>: Cannot set read-only property 'sensorIds'");
		if ('computedSensorsByType' in newState && !this._updatingReadonlyProperty) throw new Error("<NearbySensors>: Cannot set read-only property 'computedSensorsByType'");
	};

	NearbySensors.prototype._recompute = function _recompute(changed, state) {
		if (changed.sensors) {
			if (this._differs(state.sensorIds, (state.sensorIds = sensorIds(state)))) changed.sensorIds = true;
		}

		if (changed.sensors || changed.now) {
			if (this._differs(state.computedSensorsByType, (state.computedSensorsByType = computedSensorsByType(state)))) changed.computedSensorsByType = true;
		}
	};

	/* Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/device/src/Device.html generated by Svelte v2.16.1 */



	function parseAnsi$1(text) {
	  return ansicolor.parse(text);
	}
	function colorJson$2(text) {
	  return util.colorJson(text)
	}
	function oncreate$o() {
	  // adds thisDeviceId, selectedDeviceId, and optionally any part of definition (from this device.def)

	  // quantum --> not yet working!! rewrite this plugin with ES6 import/exports!! forget require here... was getting some error because of it ........
	  //console.log(importable.jobs());

	  this.store.entangle(this);

	  this.set({ deviceView: 'device_log' }); // default, duplicate in Device.html
	  this.store.on('select_device_view', ({ view }) => this.set({ deviceView: view }));
	}
	const file$q = "Users/david/.dmt/core/node/dmt-gui/gui-frontend-core/device/src/Device.html";

	function get_each_context_1$4(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.span = list[i];
		return child_ctx;
	}

	function get_each_context$6(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.line = list[i];
		return child_ctx;
	}

	function create_main_fragment$u(component, ctx) {
		var if_block_anchor, current;

		var if_block = (ctx.loaded && ctx.$connected) && create_if_block$r(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.loaded && ctx.$connected) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$r(component, ctx);
						if (if_block) if_block.c();
					}

					if_block.i(if_block_anchor.parentNode, if_block_anchor);
				} else if (if_block) {
					if_block.o(function() {
						if_block.d(1);
						if_block = null;
					});
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (if_block) if_block.o(outrocallback);
				else outrocallback();

				current = false;
			},

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (1:0) {#if loaded && $connected}
	function create_if_block$r(component, ctx) {
		var div, current_block_type_index, if_block, current;

		var if_block_creators = [
			create_if_block_1$i,
			create_if_block_3$d,
			create_if_block_4$9,
			create_if_block_6$4,
			create_if_block_8$2,
			create_if_block_10$1,
			create_if_block_12$1
		];

		var if_blocks = [];

		function select_block_type(ctx) {
			if (ctx.deviceView == 'device_log') return 0;
			if (ctx.deviceView == 'network_log') return 1;
			if (ctx.deviceView == 'controller_state') return 2;
			if (ctx.deviceView == 'player_state') return 3;
			if (ctx.deviceView == 'nearby_sensors_state') return 4;
			if (ctx.deviceView == 'system_info') return 5;
			if (ctx.deviceView == 'process_info') return 6;
			return -1;
		}

		if (~(current_block_type_index = select_block_type(ctx))) {
			if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);
		}

		return {
			c: function create() {
				div = createElement("div");
				if (if_block) if_block.c();
				div.id = "device";
				div.className = "svelte-17u9232";
				addLoc(div, file$q, 2, 2, 30);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				if (~current_block_type_index) if_blocks[current_block_type_index].m(div, null);
				current = true;
			},

			p: function update(changed, ctx) {
				var previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);
				if (current_block_type_index === previous_block_index) {
					if (~current_block_type_index) if_blocks[current_block_type_index].p(changed, ctx);
				} else {
					if (if_block) {
						if_block.o(function() {
							if_blocks[previous_block_index].d(1);
							if_blocks[previous_block_index] = null;
						});
					}

					if (~current_block_type_index) {
						if_block = if_blocks[current_block_type_index];
						if (!if_block) {
							if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);
							if_block.c();
						}
						if_block.m(div, null);
					} else {
						if_block = null;
					}
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (if_block) if_block.o(outrocallback);
				else outrocallback();

				current = false;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (~current_block_type_index) if_blocks[current_block_type_index].d();
			}
		};
	}

	// (77:42) 
	function create_if_block_12$1(component, ctx) {
		var pre, current;

		function select_block_type_5(ctx) {
			if (ctx.$processInfo) return create_if_block_13$1;
			return create_else_block_5$1;
		}

		var current_block_type = select_block_type_5(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				pre = createElement("pre");
				if_block.c();
				pre.className = "svelte-17u9232";
				addLoc(pre, file$q, 80, 6, 1787);
			},

			m: function mount(target, anchor) {
				insert(target, pre, anchor);
				if_block.m(pre, null);
				current = true;
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type_5(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(pre, null);
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (detach) {
					detachNode(pre);
				}

				if_block.d();
			}
		};
	}

	// (65:41) 
	function create_if_block_10$1(component, ctx) {
		var pre, current;

		function select_block_type_4(ctx) {
			if (ctx.$sysinfo) return create_if_block_11$1;
			return create_else_block_4$1;
		}

		var current_block_type = select_block_type_4(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				pre = createElement("pre");
				if_block.c();
				pre.className = "svelte-17u9232";
				addLoc(pre, file$q, 68, 6, 1558);
			},

			m: function mount(target, anchor) {
				insert(target, pre, anchor);
				if_block.m(pre, null);
				current = true;
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type_4(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(pre, null);
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (detach) {
					detachNode(pre);
				}

				if_block.d();
			}
		};
	}

	// (55:50) 
	function create_if_block_8$2(component, ctx) {
		var current_block_type_index, if_block, if_block_anchor, current;

		var if_block_creators = [
			create_if_block_9$2,
			create_else_block_3$1
		];

		var if_blocks = [];

		function select_block_type_3(ctx) {
			if (ctx.$nearbySensors) return 0;
			return 1;
		}

		current_block_type_index = select_block_type_3(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);

		return {
			c: function create() {
				if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if_blocks[current_block_type_index].m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				var previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type_3(ctx);
				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(changed, ctx);
				} else {
					if_block.o(function() {
						if_blocks[previous_block_index].d(1);
						if_blocks[previous_block_index] = null;
					});

					if_block = if_blocks[current_block_type_index];
					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);
						if_block.c();
					}
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (if_block) if_block.o(outrocallback);
				else outrocallback();

				current = false;
			},

			d: function destroy(detach) {
				if_blocks[current_block_type_index].d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (43:42) 
	function create_if_block_6$4(component, ctx) {
		var pre, current;

		function select_block_type_2(ctx) {
			if (ctx.$player) return create_if_block_7$3;
			return create_else_block_2$1;
		}

		var current_block_type = select_block_type_2(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				pre = createElement("pre");
				if_block.c();
				pre.className = "svelte-17u9232";
				addLoc(pre, file$q, 46, 6, 1089);
			},

			m: function mount(target, anchor) {
				insert(target, pre, anchor);
				if_block.m(pre, null);
				current = true;
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(pre, null);
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (detach) {
					detachNode(pre);
				}

				if_block.d();
			}
		};
	}

	// (31:46) 
	function create_if_block_4$9(component, ctx) {
		var pre, current;

		function select_block_type_1(ctx) {
			if (ctx.$controller) return create_if_block_5$8;
			return create_else_block_1$5;
		}

		var current_block_type = select_block_type_1(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				pre = createElement("pre");
				if_block.c();
				pre.className = "svelte-17u9232";
				addLoc(pre, file$q, 34, 6, 854);
			},

			m: function mount(target, anchor) {
				insert(target, pre, anchor);
				if_block.m(pre, null);
				current = true;
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(pre, null);
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (detach) {
					detachNode(pre);
				}

				if_block.d();
			}
		};
	}

	// (25:42) 
	function create_if_block_3$d(component, ctx) {
		var pre, current;

		return {
			c: function create() {
				pre = createElement("pre");
				pre.textContent = "This information is missing";
				pre.className = "svelte-17u9232";
				addLoc(pre, file$q, 26, 6, 710);
			},

			m: function mount(target, anchor) {
				insert(target, pre, anchor);
				current = true;
			},

			p: noop,

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (detach) {
					detachNode(pre);
				}
			}
		};
	}

	// (12:4) {#if deviceView == 'device_log' }
	function create_if_block_1$i(component, ctx) {
		var if_block_anchor, current;

		var if_block = (ctx.$log) && create_if_block_2$f(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.$log) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_2$f(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (84:8) {:else}
	function create_else_block_5$1(component, ctx) {
		var text;

		return {
			c: function create() {
				text = createText("This information is missing");
			},

			m: function mount(target, anchor) {
				insert(target, text, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(text);
				}
			}
		};
	}

	// (82:8) {#if $processInfo}
	function create_if_block_13$1(component, ctx) {
		var raw_value = colorJson$2(ctx.$processInfo), raw_before, raw_after;

		return {
			c: function create() {
				raw_before = createElement('noscript');
				raw_after = createElement('noscript');
			},

			m: function mount(target, anchor) {
				insert(target, raw_before, anchor);
				raw_before.insertAdjacentHTML("afterend", raw_value);
				insert(target, raw_after, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.$processInfo) && raw_value !== (raw_value = colorJson$2(ctx.$processInfo))) {
					detachBetween(raw_before, raw_after);
					raw_before.insertAdjacentHTML("afterend", raw_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachBetween(raw_before, raw_after);
					detachNode(raw_before);
					detachNode(raw_after);
				}
			}
		};
	}

	// (72:8) {:else}
	function create_else_block_4$1(component, ctx) {
		var text;

		return {
			c: function create() {
				text = createText("This information is missing");
			},

			m: function mount(target, anchor) {
				insert(target, text, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(text);
				}
			}
		};
	}

	// (70:8) {#if $sysinfo}
	function create_if_block_11$1(component, ctx) {
		var raw_value = colorJson$2(ctx.$sysinfo), raw_before, raw_after;

		return {
			c: function create() {
				raw_before = createElement('noscript');
				raw_after = createElement('noscript');
			},

			m: function mount(target, anchor) {
				insert(target, raw_before, anchor);
				raw_before.insertAdjacentHTML("afterend", raw_value);
				insert(target, raw_after, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.$sysinfo) && raw_value !== (raw_value = colorJson$2(ctx.$sysinfo))) {
					detachBetween(raw_before, raw_after);
					raw_before.insertAdjacentHTML("afterend", raw_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachBetween(raw_before, raw_after);
					detachNode(raw_before);
					detachNode(raw_after);
				}
			}
		};
	}

	// (61:6) {:else}
	function create_else_block_3$1(component, ctx) {
		var pre, current;

		return {
			c: function create() {
				pre = createElement("pre");
				pre.textContent = "This information is missing";
				pre.className = "svelte-17u9232";
				addLoc(pre, file$q, 61, 8, 1428);
			},

			m: function mount(target, anchor) {
				insert(target, pre, anchor);
				current = true;
			},

			p: noop,

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (detach) {
					detachNode(pre);
				}
			}
		};
	}

	// (59:6) {#if $nearbySensors}
	function create_if_block_9$2(component, ctx) {
		var current;

		var nearbysensors_initial_data = { sensors: ctx.$nearbySensors };
		var nearbysensors = new NearbySensors({
			root: component.root,
			store: component.store,
			data: nearbysensors_initial_data
		});

		return {
			c: function create() {
				nearbysensors._fragment.c();
			},

			m: function mount(target, anchor) {
				nearbysensors._mount(target, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				var nearbysensors_changes = {};
				if (changed.$nearbySensors) nearbysensors_changes.sensors = ctx.$nearbySensors;
				nearbysensors._set(nearbysensors_changes);
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (nearbysensors) nearbysensors._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy(detach) {
				nearbysensors.destroy(detach);
			}
		};
	}

	// (50:8) {:else}
	function create_else_block_2$1(component, ctx) {
		var text;

		return {
			c: function create() {
				text = createText("This information is missing");
			},

			m: function mount(target, anchor) {
				insert(target, text, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(text);
				}
			}
		};
	}

	// (48:8) {#if $player}
	function create_if_block_7$3(component, ctx) {
		var raw_value = colorJson$2(ctx.$player), raw_before, raw_after;

		return {
			c: function create() {
				raw_before = createElement('noscript');
				raw_after = createElement('noscript');
			},

			m: function mount(target, anchor) {
				insert(target, raw_before, anchor);
				raw_before.insertAdjacentHTML("afterend", raw_value);
				insert(target, raw_after, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.$player) && raw_value !== (raw_value = colorJson$2(ctx.$player))) {
					detachBetween(raw_before, raw_after);
					raw_before.insertAdjacentHTML("afterend", raw_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachBetween(raw_before, raw_after);
					detachNode(raw_before);
					detachNode(raw_after);
				}
			}
		};
	}

	// (38:8) {:else}
	function create_else_block_1$5(component, ctx) {
		var text;

		return {
			c: function create() {
				text = createText("This information is missing");
			},

			m: function mount(target, anchor) {
				insert(target, text, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(text);
				}
			}
		};
	}

	// (36:8) {#if $controller}
	function create_if_block_5$8(component, ctx) {
		var raw_value = colorJson$2(ctx.$controller), raw_before, raw_after;

		return {
			c: function create() {
				raw_before = createElement('noscript');
				raw_after = createElement('noscript');
			},

			m: function mount(target, anchor) {
				insert(target, raw_before, anchor);
				raw_before.insertAdjacentHTML("afterend", raw_value);
				insert(target, raw_after, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.$controller) && raw_value !== (raw_value = colorJson$2(ctx.$controller))) {
					detachBetween(raw_before, raw_after);
					raw_before.insertAdjacentHTML("afterend", raw_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachBetween(raw_before, raw_after);
					detachNode(raw_before);
					detachNode(raw_after);
				}
			}
		};
	}

	// (13:6) {#if $log}
	function create_if_block_2$f(component, ctx) {
		var pre, ul;

		var each_value = ctx.$log;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$6(component, get_each_context$6(ctx, each_value, i));
		}

		var each_else = null;

		if (!each_value.length) {
			each_else = create_else_block$b();
			each_else.c();
		}

		return {
			c: function create() {
				pre = createElement("pre");
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				ul.className = "svelte-17u9232";
				addLoc(ul, file$q, 14, 10, 374);
				pre.className = "svelte-17u9232";
				addLoc(pre, file$q, 13, 8, 358);
			},

			m: function mount(target, anchor) {
				insert(target, pre, anchor);
				append(pre, ul);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}

				if (each_else) {
					each_else.m(ul, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.$log) {
					each_value = ctx.$log;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$6(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$6(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(ul, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}

				if (each_value.length) {
					if (each_else) {
						each_else.d(1);
						each_else = null;
					}
				} else if (!each_else) {
					each_else = create_else_block$b();
					each_else.c();
					each_else.m(ul, null);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(pre);
				}

				destroyEach(each_blocks, detach);

				if (each_else) each_else.d();
			}
		};
	}

	// (18:12) {:else}
	function create_else_block$b(component, ctx) {
		var li;

		return {
			c: function create() {
				li = createElement("li");
				li.textContent = "Log is empty";
				addLoc(li, file$q, 18, 14, 574);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}
			}
		};
	}

	// (17:31) {#each parseAnsi(line.msg).spans as span}
	function create_each_block_1$4(component, ctx) {
		var span, text_value = ctx.span.text, text, span_style_value;

		return {
			c: function create() {
				span = createElement("span");
				text = createText(text_value);
				span.style.cssText = span_style_value = ctx.span.css;
				addLoc(span, file$q, 16, 72, 484);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
				append(span, text);
			},

			p: function update(changed, ctx) {
				if ((changed.$log) && text_value !== (text_value = ctx.span.text)) {
					setData(text, text_value);
				}

				if ((changed.$log) && span_style_value !== (span_style_value = ctx.span.css)) {
					span.style.cssText = span_style_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(span);
				}
			}
		};
	}

	// (16:12) {#each $log as line}
	function create_each_block$6(component, ctx) {
		var li;

		var each_value_1 = parseAnsi$1(ctx.line.msg).spans;

		var each_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block_1$4(component, get_each_context_1$4(ctx, each_value_1, i));
		}

		return {
			c: function create() {
				li = createElement("li");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				li.className = "line";
				addLoc(li, file$q, 16, 14, 426);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(li, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.$log) {
					each_value_1 = parseAnsi$1(ctx.line.msg).spans;

					for (var i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1$4(ctx, each_value_1, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_1$4(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(li, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value_1.length;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	function Device(options) {
		this._debugName = '<Device>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<Device> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["connected","log","controller","player","nearbySensors","sysinfo","processInfo"]), options.data);
		this.store._add(this, ["connected","log","controller","player","nearbySensors","sysinfo","processInfo"]);
		if (!('loaded' in this._state)) console.warn("<Device> was created without expected data property 'loaded'");
		if (!('$connected' in this._state)) console.warn("<Device> was created without expected data property '$connected'");
		if (!('deviceView' in this._state)) console.warn("<Device> was created without expected data property 'deviceView'");
		if (!('$log' in this._state)) console.warn("<Device> was created without expected data property '$log'");
		if (!('$controller' in this._state)) console.warn("<Device> was created without expected data property '$controller'");
		if (!('$player' in this._state)) console.warn("<Device> was created without expected data property '$player'");
		if (!('$nearbySensors' in this._state)) console.warn("<Device> was created without expected data property '$nearbySensors'");
		if (!('$sysinfo' in this._state)) console.warn("<Device> was created without expected data property '$sysinfo'");
		if (!('$processInfo' in this._state)) console.warn("<Device> was created without expected data property '$processInfo'");
		this._intro = !!options.intro;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$u(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$o.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(Device.prototype, protoDev);

	Device.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* src/ImagePreload.html generated by Svelte v2.16.1 */

	function oncreate$p() {}
	const file$r = "src/ImagePreload.html";

	function create_main_fragment$v(component, ctx) {
		var div, text, current;

		return {
			c: function create() {
				div = createElement("div");
				text = createText(ctx.path);
				div.className = "image svelte-xkwd2x";
				setStyle(div, "background-image", "url('" + ctx.path + "')");
				addLoc(div, file$r, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text);
				current = true;
			},

			p: function update(changed, ctx) {
				if (changed.path) {
					setData(text, ctx.path);
					setStyle(div, "background-image", "url('" + ctx.path + "')");
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	function ImagePreload(options) {
		this._debugName = '<ImagePreload>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign({}, options.data);
		if (!('path' in this._state)) console.warn("<ImagePreload> was created without expected data property 'path'");
		this._intro = !!options.intro;

		this._fragment = create_main_fragment$v(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$p.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(ImagePreload.prototype, protoDev);

	ImagePreload.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* src/App.html generated by Svelte v2.16.1 */



	var methods$e = {
	  saveGetParams() {
	    const urlParams = new URLSearchParams(window.location.search);
	    const getParams = {
	      subview: urlParams.get('subview'),
	      q: urlParams.get('q')
	    };
	    this.store.set({ getParams });
	  },
	  switchView(view) {
	    this.store.switchView(view);
	  },
	  select(view) {
	    this.switchView(view);
	  }
	};

	function oncreate$q() {

	  this.storeName = 'home';

	  this.store.entangle(this); // was added later because of ImagePreload ($wallpapers)

	  // https://stackoverflow.com/a/3375140
	  // DISABLE ANNOYING SELECTIONS ON TOUCH SCREENS
	  const checkRPi = () => {
	    if(this.get().loaded) {
	      if(this.get().atRPi) {
	        // window.onload = function() {
	          document.onselectstart = function() {return false;}; // ie
	          document.onmousedown = function() {return false;}; // mozilla
	        // }
	      }
	    } else {
	      setTimeout(checkRPi, 1000);
	    }
	  };

	  setTimeout(checkRPi, 500);

	  ////// ***************
	  //////// optimization option (maybe)... entangle only once at the  ?!
	  ////// ***************

	  document.addEventListener('click', (e) => {
	    // report any user action for purpose of detecting "user idle" -- for example we jump to homescreen
	    // if user is idle for long enough (if we enabled this option in .def file)
	    this.store.guiEngaged();
	  });

	  this.set({ errors: [] });

	  window.onerror = (msg, file, line, col, error) => {

	    const { errors } = this.get();

	    const d = new Date();
	    const time = `${d.getHours()}:${('0' + d.getMinutes()).slice(-2)}`;

	    if (error && error.stack) {
	      errors.push({ msg, stacktrace: error.stack, time });

	      setTimeout(() => {
	        //console.log(this.store.get().localBrowserTime);
	        this.store.action({ action: 'error', storeName: 'gui_errors', payload: error.stack });
	      }, 300); // we wait for the store to connect! we could still miss some messages by sending to currently unconnected store though
	    } else {
	      errors.push({ msg: `"${msg}" (No more info because of CORS, fix: 1) check for the same error on device where gui runs on :80... 2) if more possible errors from this source, then rethrow - see example in dmt-connect/browser/connect around JSON.parse(msg))`, corsProblem: true, time });
	    }

	    this.set({ errors });

	    // COPIED FROM SOMEWHERE ELSE FOR REFERENCE, MAYBE REMOVE IN THE FUTURE...
	    // if we don't do this and we get GUI from different port than 80 (7777) for example, then window.onerror will only get:
	    // "Script error." message without the error object
	    // read more here: https://blog.sentry.io/2016/05/17/what-is-script-error
	    // } else {
	    //   log.error(errMsg);
	    //   log.write(e);
	    // }

	    //return true; // means we caught the error and console won't show it anymore ....
	  };

	  // setTimeout(() => {
	  //   throw new Error("BOOM!")
	  // }, 3000)
	  //throw new Error("BOOM!");

	  window.onpopstate = (event) => {
	    this.saveGetParams();
	    if(!event.state) { // not sure why the first popstate doesn't include anything...
	      this.switchView(this.storeName);
	      return;
	    }
	    this.switchView(event.state.view);
	  };

	  const path = window.location.pathname.replace(/\//g, ''); // "/home/"" => "home"

	  // used in reload, to keep connection to correct store!
	  const urlParams = new URLSearchParams(window.location.search);
	  const initialIp = urlParams.get('ip');
	  if(initialIp) {
	    setTimeout(() => {
	      const deviceId = urlParams.get('deviceId');
	      this.store.switch({ ip: initialIp, deviceId });
	      //this.store.switch({ ip: '192.168.0.80' })
	    }, 100);
	  }

	  this.saveGetParams();
	  this.switchView(path || this.storeName);
	}
	const file$s = "src/App.html";

	function get_each_context_1$5(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.wallpaper = list[i];
		return child_ctx;
	}

	function get_each_context$7(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.error = list[i];
		return child_ctx;
	}

	function create_main_fragment$w(component, ctx) {
		var title_value, text0, text1, text2, div0, text3, div1, text4, text5, current_block_type_index, if_block1, text6, if_block2_anchor, current;

		document.title = title_value = ctx.selectedDeviceId ? `${ctx.selectedDeviceId} - ${ctx.$view}` : 'DMT';

		var actionbar = new ActionBar({
			root: component.root,
			store: component.store
		});

		actionbar.on("select", function(event) {
			component.select(event.view);
		});

		var nearbydevices = new NearbyDevices({
			root: component.root,
			store: component.store
		});

		var sidebarmenus = new SidebarMenus({
			root: component.root,
			store: component.store
		});

		var sidebarbottoms = new SidebarBottoms({
			root: component.root,
			store: component.store
		});

		var sidebar = new Sidebar({
			root: component.root,
			store: component.store,
			slots: { default: createFragment(), sidebar_bottom: createFragment(), sidebar_menu: createFragment() }
		});

		var if_block0 = (ctx.errors && ctx.errors.length > 0) && create_if_block_10$2(component, ctx);

		var if_block_creators = [
			create_if_block_2$g,
			create_else_block$c
		];

		var if_blocks = [];

		function select_block_type(ctx) {
			if (ctx.$view == 'home') return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);

		var if_block2 = (ctx.wallpapers) && create_if_block$s(component, ctx);

		return {
			c: function create() {
				text0 = createText("\n\n");
				actionbar._fragment.c();
				text1 = createText("\n\n");
				nearbydevices._fragment.c();
				text2 = createText("\n\n");
				div0 = createElement("div");
				sidebarmenus._fragment.c();
				text3 = createText("\n  ");
				div1 = createElement("div");
				sidebarbottoms._fragment.c();
				sidebar._fragment.c();
				text4 = createText("\n\n");
				if (if_block0) if_block0.c();
				text5 = createText("\n\n");
				if_block1.c();
				text6 = createText("\n\n\n");
				if (if_block2) if_block2.c();
				if_block2_anchor = createComment();
				setAttribute(div0, "slot", "sidebar_menu");
				div0.className = "svelte-1xfg0o4";
				addLoc(div0, file$s, 10, 2, 315);
				setAttribute(div1, "slot", "sidebar_bottom");
				div1.className = "svelte-1xfg0o4";
				addLoc(div1, file$s, 13, 2, 373);
			},

			m: function mount(target, anchor) {
				insert(target, text0, anchor);
				actionbar._mount(target, anchor);
				insert(target, text1, anchor);
				nearbydevices._mount(target, anchor);
				insert(target, text2, anchor);
				append(sidebar._slotted.sidebar_menu, div0);
				sidebarmenus._mount(div0, null);
				append(sidebar._slotted.default, text3);
				append(sidebar._slotted.sidebar_bottom, div1);
				sidebarbottoms._mount(div1, null);
				sidebar._mount(target, anchor);
				insert(target, text4, anchor);
				if (if_block0) if_block0.m(target, anchor);
				insert(target, text5, anchor);
				if_blocks[current_block_type_index].m(target, anchor);
				insert(target, text6, anchor);
				if (if_block2) if_block2.m(target, anchor);
				insert(target, if_block2_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if ((!current || changed.selectedDeviceId || changed.$view) && title_value !== (title_value = ctx.selectedDeviceId ? `${ctx.selectedDeviceId} - ${ctx.$view}` : 'DMT')) {
					document.title = title_value;
				}

				if (ctx.errors && ctx.errors.length > 0) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_10$2(component, ctx);
						if_block0.c();
						if_block0.m(text5.parentNode, text5);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				var previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);
				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(changed, ctx);
				} else {
					if_block1.o(function() {
						if_blocks[previous_block_index].d(1);
						if_blocks[previous_block_index] = null;
					});

					if_block1 = if_blocks[current_block_type_index];
					if (!if_block1) {
						if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);
						if_block1.c();
					}
					if_block1.m(text6.parentNode, text6);
				}

				if (ctx.wallpapers) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block$s(component, ctx);
						if (if_block2) if_block2.c();
					}

					if_block2.i(if_block2_anchor.parentNode, if_block2_anchor);
				} else if (if_block2) {
					if_block2.o(function() {
						if_block2.d(1);
						if_block2 = null;
					});
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				outrocallback = callAfter(outrocallback, 7);

				if (actionbar) actionbar._fragment.o(outrocallback);
				if (nearbydevices) nearbydevices._fragment.o(outrocallback);
				if (sidebarmenus) sidebarmenus._fragment.o(outrocallback);
				if (sidebarbottoms) sidebarbottoms._fragment.o(outrocallback);
				if (sidebar) sidebar._fragment.o(outrocallback);

				if (if_block1) if_block1.o(outrocallback);
				else outrocallback();

				if (if_block2) if_block2.o(outrocallback);
				else outrocallback();

				current = false;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(text0);
				}

				actionbar.destroy(detach);
				if (detach) {
					detachNode(text1);
				}

				nearbydevices.destroy(detach);
				if (detach) {
					detachNode(text2);
				}

				sidebarmenus.destroy();
				sidebarbottoms.destroy();
				sidebar.destroy(detach);
				if (detach) {
					detachNode(text4);
				}

				if (if_block0) if_block0.d(detach);
				if (detach) {
					detachNode(text5);
				}

				if_blocks[current_block_type_index].d(detach);
				if (detach) {
					detachNode(text6);
				}

				if (if_block2) if_block2.d(detach);
				if (detach) {
					detachNode(if_block2_anchor);
				}
			}
		};
	}

	// (19:0) {#if errors && errors.length > 0}
	function create_if_block_10$2(component, ctx) {
		var div;

		var each_value = ctx.errors.slice(0, 3);

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block_1$5(component, get_each_context$7(ctx, each_value, i));
		}

		return {
			c: function create() {
				div = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				div.className = "errors svelte-1xfg0o4";
				addLoc(div, file$s, 19, 2, 481);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.errors) {
					each_value = ctx.errors.slice(0, 3);

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$7(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_1$5(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (28:8) {#if error.stacktrace}
	function create_if_block_11$2(component, ctx) {
		var text_value = ctx.error.stacktrace, text;

		return {
			c: function create() {
				text = createText(text_value);
			},

			m: function mount(target, anchor) {
				insert(target, text, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.errors) && text_value !== (text_value = ctx.error.stacktrace)) {
					setData(text, text_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(text);
				}
			}
		};
	}

	// (21:4) {#each errors.slice(0, 3) as error}
	function create_each_block_1$5(component, ctx) {
		var div1, div0, text0, span0, text1_value = ctx.error.time, text1, text2, span1, text3_value = ctx.error.msg, text3, text4;

		var if_block = (ctx.error.stacktrace) && create_if_block_11$2(component, ctx);

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				text0 = createText("Error at ");
				span0 = createElement("span");
				text1 = createText(text1_value);
				text2 = createText("\n          ");
				span1 = createElement("span");
				text3 = createText(text3_value);
				text4 = createText("\n\n        ");
				if (if_block) if_block.c();
				span0.className = "time svelte-1xfg0o4";
				addLoc(span0, file$s, 23, 19, 654);
				span1.className = "msg svelte-1xfg0o4";
				addLoc(span1, file$s, 24, 10, 703);
				div0.className = "title svelte-1xfg0o4";
				addLoc(div0, file$s, 22, 8, 615);
				div1.className = "error svelte-1xfg0o4";
				toggleClass(div1, "cors_problem", ctx.error.corsProblem);
				addLoc(div1, file$s, 21, 6, 548);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				append(div0, text0);
				append(div0, span0);
				append(span0, text1);
				append(div0, text2);
				append(div0, span1);
				append(span1, text3);
				append(div1, text4);
				if (if_block) if_block.m(div1, null);
			},

			p: function update(changed, ctx) {
				if ((changed.errors) && text1_value !== (text1_value = ctx.error.time)) {
					setData(text1, text1_value);
				}

				if ((changed.errors) && text3_value !== (text3_value = ctx.error.msg)) {
					setData(text3, text3_value);
				}

				if (ctx.error.stacktrace) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_11$2(component, ctx);
						if_block.c();
						if_block.m(div1, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (changed.errors) {
					toggleClass(div1, "cors_problem", ctx.error.corsProblem);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				if (if_block) if_block.d();
			}
		};
	}

	// (43:0) {:else}
	function create_else_block$c(component, ctx) {
		var div, current_block_type_index, if_block, current;

		var if_block_creators = [
			create_if_block_4$a,
			create_if_block_5$9,
			create_if_block_6$5,
			create_if_block_7$4,
			create_if_block_8$3,
			create_if_block_9$3
		];

		var if_blocks = [];

		function select_block_type_1(ctx) {
			if (ctx.$view == 'player') return 0;
			if (ctx.$view == 'clock') return 1;
			if (ctx.$view == 'ambience') return 2;
			if (ctx.$view == 'calendar') return 3;
			if (ctx.$view == 'help') return 4;
			if (ctx.$view == 'device') return 5;
			return -1;
		}

		if (~(current_block_type_index = select_block_type_1(ctx))) {
			if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);
		}

		return {
			c: function create() {
				div = createElement("div");
				if (if_block) if_block.c();
				div.className = "content_component svelte-1xfg0o4";
				toggleClass(div, "dim_background", ctx.viewDef && ctx.viewDef.dimBackground);
				toggleClass(div, "has_full_sidebar", ctx.viewDef && ctx.viewDef.sidebar == 'true');
				addLoc(div, file$s, 44, 2, 978);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				if (~current_block_type_index) if_blocks[current_block_type_index].m(div, null);
				current = true;
			},

			p: function update(changed, ctx) {
				var previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type_1(ctx);
				if (current_block_type_index !== previous_block_index) {
					if (if_block) {
						if_block.o(function() {
							if_blocks[previous_block_index].d(1);
							if_blocks[previous_block_index] = null;
						});
					}

					if (~current_block_type_index) {
						if_block = if_blocks[current_block_type_index];
						if (!if_block) {
							if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);
							if_block.c();
						}
						if_block.m(div, null);
					} else {
						if_block = null;
					}
				}

				if (changed.viewDef) {
					toggleClass(div, "dim_background", ctx.viewDef && ctx.viewDef.dimBackground);
					toggleClass(div, "has_full_sidebar", ctx.viewDef && ctx.viewDef.sidebar == 'true');
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (if_block) if_block.o(outrocallback);
				else outrocallback();

				current = false;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (~current_block_type_index) if_blocks[current_block_type_index].d();
			}
		};
	}

	// (37:0) {#if $view == 'home'}
	function create_if_block_2$g(component, ctx) {
		var if_block_anchor, current;

		var if_block = (ctx.$controller) && create_if_block_3$e(component);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.$controller) {
					if (!if_block) {
						if_block = create_if_block_3$e(component);
						if_block.c();
					}
					if_block.i(if_block_anchor.parentNode, if_block_anchor);
				} else if (if_block) {
					if_block.o(function() {
						if_block.d(1);
						if_block = null;
					});
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (if_block) if_block.o(outrocallback);
				else outrocallback();

				current = false;
			},

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (56:31) 
	function create_if_block_9$3(component, ctx) {
		var current;

		var device = new Device({
			root: component.root,
			store: component.store
		});

		device.on("select", function(event) {
			component.select(event.view);
		});

		return {
			c: function create() {
				device._fragment.c();
			},

			m: function mount(target, anchor) {
				device._mount(target, anchor);
				current = true;
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (device) device._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy(detach) {
				device.destroy(detach);
			}
		};
	}

	// (54:29) 
	function create_if_block_8$3(component, ctx) {
		var current;

		var help = new Help({
			root: component.root,
			store: component.store
		});

		help.on("select", function(event) {
			component.select(event.view);
		});

		return {
			c: function create() {
				help._fragment.c();
			},

			m: function mount(target, anchor) {
				help._mount(target, anchor);
				current = true;
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (help) help._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy(detach) {
				help.destroy(detach);
			}
		};
	}

	// (52:33) 
	function create_if_block_7$4(component, ctx) {
		var current;

		var calendar = new Calendar$1({
			root: component.root,
			store: component.store
		});

		calendar.on("select", function(event) {
			component.select(event.view);
		});

		return {
			c: function create() {
				calendar._fragment.c();
			},

			m: function mount(target, anchor) {
				calendar._mount(target, anchor);
				current = true;
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (calendar) calendar._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy(detach) {
				calendar.destroy(detach);
			}
		};
	}

	// (50:33) 
	function create_if_block_6$5(component, ctx) {
		var current;

		var ambience = new Ambience({
			root: component.root,
			store: component.store
		});

		ambience.on("select", function(event) {
			component.select(event.view);
		});

		return {
			c: function create() {
				ambience._fragment.c();
			},

			m: function mount(target, anchor) {
				ambience._mount(target, anchor);
				current = true;
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (ambience) ambience._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy(detach) {
				ambience.destroy(detach);
			}
		};
	}

	// (48:30) 
	function create_if_block_5$9(component, ctx) {
		var current;

		var clock = new Clock_1({
			root: component.root,
			store: component.store
		});

		clock.on("select", function(event) {
			component.select(event.view);
		});

		return {
			c: function create() {
				clock._fragment.c();
			},

			m: function mount(target, anchor) {
				clock._mount(target, anchor);
				current = true;
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (clock) clock._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy(detach) {
				clock.destroy(detach);
			}
		};
	}

	// (46:4) {#if $view == 'player'}
	function create_if_block_4$a(component, ctx) {
		var current;

		var player = new Player({
			root: component.root,
			store: component.store
		});

		player.on("select", function(event) {
			component.select(event.view);
		});

		return {
			c: function create() {
				player._fragment.c();
			},

			m: function mount(target, anchor) {
				player._mount(target, anchor);
				current = true;
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (player) player._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy(detach) {
				player.destroy(detach);
			}
		};
	}

	// (39:2) {#if $controller}
	function create_if_block_3$e(component, ctx) {
		var current;

		var home = new Home({
			root: component.root,
			store: component.store
		});

		home.on("select", function(event) {
			component.select(event.view);
		});

		return {
			c: function create() {
				home._fragment.c();
			},

			m: function mount(target, anchor) {
				home._mount(target, anchor);
				current = true;
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (home) home._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy(detach) {
				home.destroy(detach);
			}
		};
	}

	// (64:0) {#if wallpapers}
	function create_if_block$s(component, ctx) {
		var each_anchor, current;

		var each_value_1 = ctx.wallpapers;

		var each_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block$7(component, get_each_context_1$5(ctx, each_value_1, i));
		}

		function outroBlock(i, detach, fn) {
			if (each_blocks[i]) {
				each_blocks[i].o(() => {
					if (detach) {
						each_blocks[i].d(detach);
						each_blocks[i] = null;
					}
					if (fn) fn();
				});
			}
		}

		return {
			c: function create() {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_anchor = createComment();
			},

			m: function mount(target, anchor) {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].i(target, anchor);
				}

				insert(target, each_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (changed.wallpapers) {
					each_value_1 = ctx.wallpapers;

					for (var i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1$5(ctx, each_value_1, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$7(component, child_ctx);
							each_blocks[i].c();
						}
						each_blocks[i].i(each_anchor.parentNode, each_anchor);
					}
					for (; i < each_blocks.length; i += 1) outroBlock(i, 1);
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				each_blocks = each_blocks.filter(Boolean);
				const countdown = callAfter(outrocallback, each_blocks.length);
				for (let i = 0; i < each_blocks.length; i += 1) outroBlock(i, 0, countdown);

				current = false;
			},

			d: function destroy(detach) {
				destroyEach(each_blocks, detach);

				if (detach) {
					detachNode(each_anchor);
				}
			}
		};
	}

	// (66:4) {#if wallpaper}
	function create_if_block_1$j(component, ctx) {
		var current;

		var imagepreload_initial_data = { path: ctx.wallpaper };
		var imagepreload = new ImagePreload({
			root: component.root,
			store: component.store,
			data: imagepreload_initial_data
		});

		return {
			c: function create() {
				imagepreload._fragment.c();
			},

			m: function mount(target, anchor) {
				imagepreload._mount(target, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				var imagepreload_changes = {};
				if (changed.wallpapers) imagepreload_changes.path = ctx.wallpaper;
				imagepreload._set(imagepreload_changes);
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (imagepreload) imagepreload._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy(detach) {
				imagepreload.destroy(detach);
			}
		};
	}

	// (65:2) {#each wallpapers as wallpaper}
	function create_each_block$7(component, ctx) {
		var if_block_anchor, current;

		var if_block = (ctx.wallpaper) && create_if_block_1$j(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.wallpaper) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_1$j(component, ctx);
						if (if_block) if_block.c();
					}

					if_block.i(if_block_anchor.parentNode, if_block_anchor);
				} else if (if_block) {
					if_block.o(function() {
						if_block.d(1);
						if_block = null;
					});
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (if_block) if_block.o(outrocallback);
				else outrocallback();

				current = false;
			},

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	function App(options) {
		this._debugName = '<App>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<App> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["view","controller"]), options.data);
		this.store._add(this, ["view","controller"]);
		if (!('selectedDeviceId' in this._state)) console.warn("<App> was created without expected data property 'selectedDeviceId'");
		if (!('$view' in this._state)) console.warn("<App> was created without expected data property '$view'");
		if (!('errors' in this._state)) console.warn("<App> was created without expected data property 'errors'");
		if (!('$controller' in this._state)) console.warn("<App> was created without expected data property '$controller'");
		if (!('viewDef' in this._state)) console.warn("<App> was created without expected data property 'viewDef'");
		if (!('wallpapers' in this._state)) console.warn("<App> was created without expected data property 'wallpapers'");
		this._intro = !!options.intro;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$w(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$q.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(App.prototype, protoDev);
	assign(App.prototype, methods$e);

	App.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	// doing just const store = new ConnectedStore() probably doesn't work anymore... (but it should be a small fix!! -- not that anyone would want that but still!! Multi-connected stores are great.)
	const store = new MultiConnectedStore();

	const app = new App({
	  target: document.body,
	  store
	});

	window.store = store;

	return app;

}());
//# sourceMappingURL=bundle.js.map
