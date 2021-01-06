var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function self$1(fn) {
        return function (event) {
            // @ts-ignore
            if (event.target === this)
                fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/Logo.svelte generated by Svelte v3.31.0 */

    const file = "src/components/Logo.svelte";

    function create_fragment(ctx) {
    	let div;
    	let span0;
    	let t1;
    	let span1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			span0.textContent = "DMT";
    			t1 = space();
    			span1 = element("span");
    			span1.textContent = "Insight";
    			attr_dev(span0, "class", "dmt svelte-154ltdc");
    			add_location(span0, file, 0, 5, 5);
    			attr_dev(span1, "class", "insight svelte-154ltdc");
    			add_location(span1, file, 0, 34, 34);
    			add_location(div, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(div, t1);
    			append_dev(div, span1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Logo", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Logo> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Logo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Logo",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/views/Loading.svelte generated by Svelte v3.31.0 */
    const file$1 = "src/views/Loading.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let logo;
    	let t0;
    	let p;
    	let t1;
    	let t2_value = (".").repeat(/*dots*/ ctx[0]) + "";
    	let t2;
    	let current;
    	logo = new Logo({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(logo.$$.fragment);
    			t0 = space();
    			p = element("p");
    			t1 = text("Connecting to host");
    			t2 = text(t2_value);
    			add_location(p, file$1, 19, 2, 360);
    			attr_dev(div, "class", "wrapper svelte-uacyvv");
    			add_location(div, file$1, 17, 0, 325);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(logo, div, null);
    			append_dev(div, t0);
    			append_dev(div, p);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*dots*/ 1) && t2_value !== (t2_value = (".").repeat(/*dots*/ ctx[0]) + "")) set_data_dev(t2, t2_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(logo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(logo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(logo);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Loading", slots, []);
    	let dots = 1;

    	onMount(() => {
    		const handler = setInterval(
    			() => {
    				if (dots >= 3) $$invalidate(0, dots = 0);
    				$$invalidate(0, dots = dots + 1);
    			},
    			500
    		);

    		return () => clearInterval(handler);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Loading> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, Logo, dots });

    	$$self.$inject_state = $$props => {
    		if ("dots" in $$props) $$invalidate(0, dots = $$props.dots);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [dots];
    }

    class Loading extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Loading",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/components/NavLink.svelte generated by Svelte v3.31.0 */

    const file$2 = "src/components/NavLink.svelte";

    function create_fragment$2(ctx) {
    	let a;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			attr_dev(a, "href", /*href*/ ctx[0]);
    			attr_dev(a, "class", "svelte-66robx");
    			add_location(a, file$2, 4, 0, 39);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*href*/ 1) {
    				attr_dev(a, "href", /*href*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NavLink", slots, ['default']);
    	let { href } = $$props;
    	const writable_props = ["href"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NavLink> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("href" in $$props) $$invalidate(0, href = $$props.href);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ href });

    	$$self.$inject_state = $$props => {
    		if ("href" in $$props) $$invalidate(0, href = $$props.href);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [href, $$scope, slots];
    }

    class NavLink extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { href: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavLink",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*href*/ ctx[0] === undefined && !("href" in props)) {
    			console.warn("<NavLink> was created without expected prop 'href'");
    		}
    	}

    	get href() {
    		throw new Error("<NavLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<NavLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Navbar.svelte generated by Svelte v3.31.0 */
    const file$3 = "src/components/Navbar.svelte";

    // (8:2) <NavLink href="#json">
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Raw JSON");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(8:2) <NavLink href=\\\"#json\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let nav;
    	let logo;
    	let t;
    	let navlink;
    	let current;
    	logo = new Logo({ $$inline: true });

    	navlink = new NavLink({
    			props: {
    				href: "#json",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			create_component(logo.$$.fragment);
    			t = space();
    			create_component(navlink.$$.fragment);
    			attr_dev(nav, "class", "view-container svelte-it26em");
    			add_location(nav, file$3, 5, 0, 98);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			mount_component(logo, nav, null);
    			append_dev(nav, t);
    			mount_component(navlink, nav, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const navlink_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				navlink_changes.$$scope = { dirty, ctx };
    			}

    			navlink.$set(navlink_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(logo.$$.fragment, local);
    			transition_in(navlink.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(logo.$$.fragment, local);
    			transition_out(navlink.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_component(logo);
    			destroy_component(navlink);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Navbar", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Logo, NavLink });
    	return [];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    		path: basedir,
    		exports: {},
    		require: function (path, base) {
    			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    		}
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var ansi_up = createCommonjsModule(function (module, exports) {
    /*  ansi_up.js
     *  author : Dru Nelson
     *  license : MIT
     *  http://github.com/drudru/ansi_up
     */
    (function (root, factory) {
        if ( typeof exports.nodeName !== 'string') {
            // CommonJS
            factory(exports);
        } else {
            // Browser globals
            var exp = {};
            factory(exp);
            root.AnsiUp = exp.default;
        }
    }(commonjsGlobal, function (exports) {
    var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };
    var PacketKind;
    (function (PacketKind) {
        PacketKind[PacketKind["EOS"] = 0] = "EOS";
        PacketKind[PacketKind["Text"] = 1] = "Text";
        PacketKind[PacketKind["Incomplete"] = 2] = "Incomplete";
        PacketKind[PacketKind["ESC"] = 3] = "ESC";
        PacketKind[PacketKind["Unknown"] = 4] = "Unknown";
        PacketKind[PacketKind["SGR"] = 5] = "SGR";
        PacketKind[PacketKind["OSCURL"] = 6] = "OSCURL";
    })(PacketKind || (PacketKind = {}));
    var AnsiUp = (function () {
        function AnsiUp() {
            this.VERSION = "4.0.4";
            this.setup_palettes();
            this._use_classes = false;
            this._escape_for_html = true;
            this.bold = false;
            this.fg = this.bg = null;
            this._buffer = '';
            this._url_whitelist = { 'http': 1, 'https': 1 };
        }
        Object.defineProperty(AnsiUp.prototype, "use_classes", {
            get: function () {
                return this._use_classes;
            },
            set: function (arg) {
                this._use_classes = arg;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnsiUp.prototype, "escape_for_html", {
            get: function () {
                return this._escape_for_html;
            },
            set: function (arg) {
                this._escape_for_html = arg;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnsiUp.prototype, "url_whitelist", {
            get: function () {
                return this._url_whitelist;
            },
            set: function (arg) {
                this._url_whitelist = arg;
            },
            enumerable: true,
            configurable: true
        });
        AnsiUp.prototype.setup_palettes = function () {
            var _this = this;
            this.ansi_colors =
                [
                    [
                        { rgb: [0, 0, 0], class_name: "ansi-black" },
                        { rgb: [187, 0, 0], class_name: "ansi-red" },
                        { rgb: [0, 187, 0], class_name: "ansi-green" },
                        { rgb: [187, 187, 0], class_name: "ansi-yellow" },
                        { rgb: [0, 0, 187], class_name: "ansi-blue" },
                        { rgb: [187, 0, 187], class_name: "ansi-magenta" },
                        { rgb: [0, 187, 187], class_name: "ansi-cyan" },
                        { rgb: [255, 255, 255], class_name: "ansi-white" }
                    ],
                    [
                        { rgb: [85, 85, 85], class_name: "ansi-bright-black" },
                        { rgb: [255, 85, 85], class_name: "ansi-bright-red" },
                        { rgb: [0, 255, 0], class_name: "ansi-bright-green" },
                        { rgb: [255, 255, 85], class_name: "ansi-bright-yellow" },
                        { rgb: [85, 85, 255], class_name: "ansi-bright-blue" },
                        { rgb: [255, 85, 255], class_name: "ansi-bright-magenta" },
                        { rgb: [85, 255, 255], class_name: "ansi-bright-cyan" },
                        { rgb: [255, 255, 255], class_name: "ansi-bright-white" }
                    ]
                ];
            this.palette_256 = [];
            this.ansi_colors.forEach(function (palette) {
                palette.forEach(function (rec) {
                    _this.palette_256.push(rec);
                });
            });
            var levels = [0, 95, 135, 175, 215, 255];
            for (var r = 0; r < 6; ++r) {
                for (var g = 0; g < 6; ++g) {
                    for (var b = 0; b < 6; ++b) {
                        var col = { rgb: [levels[r], levels[g], levels[b]], class_name: 'truecolor' };
                        this.palette_256.push(col);
                    }
                }
            }
            var grey_level = 8;
            for (var i = 0; i < 24; ++i, grey_level += 10) {
                var gry = { rgb: [grey_level, grey_level, grey_level], class_name: 'truecolor' };
                this.palette_256.push(gry);
            }
        };
        AnsiUp.prototype.escape_txt_for_html = function (txt) {
            return txt.replace(/[&<>]/gm, function (str) {
                if (str === "&")
                    return "&amp;";
                if (str === "<")
                    return "&lt;";
                if (str === ">")
                    return "&gt;";
            });
        };
        AnsiUp.prototype.append_buffer = function (txt) {
            var str = this._buffer + txt;
            this._buffer = str;
        };
        AnsiUp.prototype.get_next_packet = function () {
            var pkt = {
                kind: PacketKind.EOS,
                text: '',
                url: ''
            };
            var len = this._buffer.length;
            if (len == 0)
                return pkt;
            var pos = this._buffer.indexOf("\x1B");
            if (pos == -1) {
                pkt.kind = PacketKind.Text;
                pkt.text = this._buffer;
                this._buffer = '';
                return pkt;
            }
            if (pos > 0) {
                pkt.kind = PacketKind.Text;
                pkt.text = this._buffer.slice(0, pos);
                this._buffer = this._buffer.slice(pos);
                return pkt;
            }
            if (pos == 0) {
                if (len == 1) {
                    pkt.kind = PacketKind.Incomplete;
                    return pkt;
                }
                var next_char = this._buffer.charAt(1);
                if ((next_char != '[') && (next_char != ']')) {
                    pkt.kind = PacketKind.ESC;
                    pkt.text = this._buffer.slice(0, 1);
                    this._buffer = this._buffer.slice(1);
                    return pkt;
                }
                if (next_char == '[') {
                    if (!this._csi_regex) {
                        this._csi_regex = rgx(__makeTemplateObject(["\n                        ^                           # beginning of line\n                                                    #\n                                                    # First attempt\n                        (?:                         # legal sequence\n                          \u001B[                      # CSI\n                          ([<-?]?)              # private-mode char\n                          ([d;]*)                    # any digits or semicolons\n                          ([ -/]?               # an intermediate modifier\n                          [@-~])                # the command\n                        )\n                        |                           # alternate (second attempt)\n                        (?:                         # illegal sequence\n                          \u001B[                      # CSI\n                          [ -~]*                # anything legal\n                          ([\0-\u001F:])              # anything illegal\n                        )\n                    "], ["\n                        ^                           # beginning of line\n                                                    #\n                                                    # First attempt\n                        (?:                         # legal sequence\n                          \\x1b\\[                      # CSI\n                          ([\\x3c-\\x3f]?)              # private-mode char\n                          ([\\d;]*)                    # any digits or semicolons\n                          ([\\x20-\\x2f]?               # an intermediate modifier\n                          [\\x40-\\x7e])                # the command\n                        )\n                        |                           # alternate (second attempt)\n                        (?:                         # illegal sequence\n                          \\x1b\\[                      # CSI\n                          [\\x20-\\x7e]*                # anything legal\n                          ([\\x00-\\x1f:])              # anything illegal\n                        )\n                    "]));
                    }
                    var match = this._buffer.match(this._csi_regex);
                    if (match === null) {
                        pkt.kind = PacketKind.Incomplete;
                        return pkt;
                    }
                    if (match[4]) {
                        pkt.kind = PacketKind.ESC;
                        pkt.text = this._buffer.slice(0, 1);
                        this._buffer = this._buffer.slice(1);
                        return pkt;
                    }
                    if ((match[1] != '') || (match[3] != 'm'))
                        pkt.kind = PacketKind.Unknown;
                    else
                        pkt.kind = PacketKind.SGR;
                    pkt.text = match[2];
                    var rpos = match[0].length;
                    this._buffer = this._buffer.slice(rpos);
                    return pkt;
                }
                if (next_char == ']') {
                    if (len < 4) {
                        pkt.kind = PacketKind.Incomplete;
                        return pkt;
                    }
                    if ((this._buffer.charAt(2) != '8')
                        || (this._buffer.charAt(3) != ';')) {
                        pkt.kind = PacketKind.ESC;
                        pkt.text = this._buffer.slice(0, 1);
                        this._buffer = this._buffer.slice(1);
                        return pkt;
                    }
                    if (!this._osc_st) {
                        this._osc_st = rgxG(__makeTemplateObject(["\n                        (?:                         # legal sequence\n                          (\u001B\\)                    # ESC                           |                           # alternate\n                          (\u0007)                      # BEL (what xterm did)\n                        )\n                        |                           # alternate (second attempt)\n                        (                           # illegal sequence\n                          [\0-\u0006]                 # anything illegal\n                          |                           # alternate\n                          [\b-\u001A]                 # anything illegal\n                          |                           # alternate\n                          [\u001C-\u001F]                 # anything illegal\n                        )\n                    "], ["\n                        (?:                         # legal sequence\n                          (\\x1b\\\\)                    # ESC \\\n                          |                           # alternate\n                          (\\x07)                      # BEL (what xterm did)\n                        )\n                        |                           # alternate (second attempt)\n                        (                           # illegal sequence\n                          [\\x00-\\x06]                 # anything illegal\n                          |                           # alternate\n                          [\\x08-\\x1a]                 # anything illegal\n                          |                           # alternate\n                          [\\x1c-\\x1f]                 # anything illegal\n                        )\n                    "]));
                    }
                    this._osc_st.lastIndex = 0;
                    {
                        var match_1 = this._osc_st.exec(this._buffer);
                        if (match_1 === null) {
                            pkt.kind = PacketKind.Incomplete;
                            return pkt;
                        }
                        if (match_1[3]) {
                            pkt.kind = PacketKind.ESC;
                            pkt.text = this._buffer.slice(0, 1);
                            this._buffer = this._buffer.slice(1);
                            return pkt;
                        }
                    }
                    {
                        var match_2 = this._osc_st.exec(this._buffer);
                        if (match_2 === null) {
                            pkt.kind = PacketKind.Incomplete;
                            return pkt;
                        }
                        if (match_2[3]) {
                            pkt.kind = PacketKind.ESC;
                            pkt.text = this._buffer.slice(0, 1);
                            this._buffer = this._buffer.slice(1);
                            return pkt;
                        }
                    }
                    if (!this._osc_regex) {
                        this._osc_regex = rgx(__makeTemplateObject(["\n                        ^                           # beginning of line\n                                                    #\n                        \u001B]8;                    # OSC Hyperlink\n                        [ -:<-~]*       # params (excluding ;)\n                        ;                           # end of params\n                        ([!-~]{0,512})        # URL capture\n                        (?:                         # ST\n                          (?:\u001B\\)                  # ESC                           |                           # alternate\n                          (?:\u0007)                    # BEL (what xterm did)\n                        )\n                        ([!-~]+)              # TEXT capture\n                        \u001B]8;;                   # OSC Hyperlink End\n                        (?:                         # ST\n                          (?:\u001B\\)                  # ESC                           |                           # alternate\n                          (?:\u0007)                    # BEL (what xterm did)\n                        )\n                    "], ["\n                        ^                           # beginning of line\n                                                    #\n                        \\x1b\\]8;                    # OSC Hyperlink\n                        [\\x20-\\x3a\\x3c-\\x7e]*       # params (excluding ;)\n                        ;                           # end of params\n                        ([\\x21-\\x7e]{0,512})        # URL capture\n                        (?:                         # ST\n                          (?:\\x1b\\\\)                  # ESC \\\n                          |                           # alternate\n                          (?:\\x07)                    # BEL (what xterm did)\n                        )\n                        ([\\x21-\\x7e]+)              # TEXT capture\n                        \\x1b\\]8;;                   # OSC Hyperlink End\n                        (?:                         # ST\n                          (?:\\x1b\\\\)                  # ESC \\\n                          |                           # alternate\n                          (?:\\x07)                    # BEL (what xterm did)\n                        )\n                    "]));
                    }
                    var match = this._buffer.match(this._osc_regex);
                    if (match === null) {
                        pkt.kind = PacketKind.ESC;
                        pkt.text = this._buffer.slice(0, 1);
                        this._buffer = this._buffer.slice(1);
                        return pkt;
                    }
                    pkt.kind = PacketKind.OSCURL;
                    pkt.url = match[1];
                    pkt.text = match[2];
                    var rpos = match[0].length;
                    this._buffer = this._buffer.slice(rpos);
                    return pkt;
                }
            }
        };
        AnsiUp.prototype.ansi_to_html = function (txt) {
            this.append_buffer(txt);
            var blocks = [];
            while (true) {
                var packet = this.get_next_packet();
                if ((packet.kind == PacketKind.EOS)
                    || (packet.kind == PacketKind.Incomplete))
                    break;
                if ((packet.kind == PacketKind.ESC)
                    || (packet.kind == PacketKind.Unknown))
                    continue;
                if (packet.kind == PacketKind.Text)
                    blocks.push(this.transform_to_html(this.with_state(packet)));
                else if (packet.kind == PacketKind.SGR)
                    this.process_ansi(packet);
                else if (packet.kind == PacketKind.OSCURL)
                    blocks.push(this.process_hyperlink(packet));
            }
            return blocks.join("");
        };
        AnsiUp.prototype.with_state = function (pkt) {
            return { bold: this.bold, fg: this.fg, bg: this.bg, text: pkt.text };
        };
        AnsiUp.prototype.process_ansi = function (pkt) {
            var sgr_cmds = pkt.text.split(';');
            while (sgr_cmds.length > 0) {
                var sgr_cmd_str = sgr_cmds.shift();
                var num = parseInt(sgr_cmd_str, 10);
                if (isNaN(num) || num === 0) {
                    this.fg = this.bg = null;
                    this.bold = false;
                }
                else if (num === 1) {
                    this.bold = true;
                }
                else if (num === 22) {
                    this.bold = false;
                }
                else if (num === 39) {
                    this.fg = null;
                }
                else if (num === 49) {
                    this.bg = null;
                }
                else if ((num >= 30) && (num < 38)) {
                    this.fg = this.ansi_colors[0][(num - 30)];
                }
                else if ((num >= 40) && (num < 48)) {
                    this.bg = this.ansi_colors[0][(num - 40)];
                }
                else if ((num >= 90) && (num < 98)) {
                    this.fg = this.ansi_colors[1][(num - 90)];
                }
                else if ((num >= 100) && (num < 108)) {
                    this.bg = this.ansi_colors[1][(num - 100)];
                }
                else if (num === 38 || num === 48) {
                    if (sgr_cmds.length > 0) {
                        var is_foreground = (num === 38);
                        var mode_cmd = sgr_cmds.shift();
                        if (mode_cmd === '5' && sgr_cmds.length > 0) {
                            var palette_index = parseInt(sgr_cmds.shift(), 10);
                            if (palette_index >= 0 && palette_index <= 255) {
                                if (is_foreground)
                                    this.fg = this.palette_256[palette_index];
                                else
                                    this.bg = this.palette_256[palette_index];
                            }
                        }
                        if (mode_cmd === '2' && sgr_cmds.length > 2) {
                            var r = parseInt(sgr_cmds.shift(), 10);
                            var g = parseInt(sgr_cmds.shift(), 10);
                            var b = parseInt(sgr_cmds.shift(), 10);
                            if ((r >= 0 && r <= 255) && (g >= 0 && g <= 255) && (b >= 0 && b <= 255)) {
                                var c = { rgb: [r, g, b], class_name: 'truecolor' };
                                if (is_foreground)
                                    this.fg = c;
                                else
                                    this.bg = c;
                            }
                        }
                    }
                }
            }
        };
        AnsiUp.prototype.transform_to_html = function (fragment) {
            var txt = fragment.text;
            if (txt.length === 0)
                return txt;
            if (this._escape_for_html)
                txt = this.escape_txt_for_html(txt);
            if (!fragment.bold && fragment.fg === null && fragment.bg === null)
                return txt;
            var styles = [];
            var classes = [];
            var fg = fragment.fg;
            var bg = fragment.bg;
            if (fragment.bold)
                styles.push('font-weight:bold');
            if (!this._use_classes) {
                if (fg)
                    styles.push("color:rgb(" + fg.rgb.join(',') + ")");
                if (bg)
                    styles.push("background-color:rgb(" + bg.rgb + ")");
            }
            else {
                if (fg) {
                    if (fg.class_name !== 'truecolor') {
                        classes.push(fg.class_name + "-fg");
                    }
                    else {
                        styles.push("color:rgb(" + fg.rgb.join(',') + ")");
                    }
                }
                if (bg) {
                    if (bg.class_name !== 'truecolor') {
                        classes.push(bg.class_name + "-bg");
                    }
                    else {
                        styles.push("background-color:rgb(" + bg.rgb.join(',') + ")");
                    }
                }
            }
            var class_string = '';
            var style_string = '';
            if (classes.length)
                class_string = " class=\"" + classes.join(' ') + "\"";
            if (styles.length)
                style_string = " style=\"" + styles.join(';') + "\"";
            return "<span" + style_string + class_string + ">" + txt + "</span>";
        };
        AnsiUp.prototype.process_hyperlink = function (pkt) {
            var parts = pkt.url.split(':');
            if (parts.length < 1)
                return '';
            if (!this._url_whitelist[parts[0]])
                return '';
            var result = "<a href=\"" + this.escape_txt_for_html(pkt.url) + "\">" + this.escape_txt_for_html(pkt.text) + "</a>";
            return result;
        };
        return AnsiUp;
    }());
    function rgx(tmplObj) {
        var subst = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            subst[_i - 1] = arguments[_i];
        }
        var regexText = tmplObj.raw[0];
        var wsrgx = /^\s+|\s+\n|\s*#[\s\S]*?\n|\n/gm;
        var txt2 = regexText.replace(wsrgx, '');
        return new RegExp(txt2);
    }
    function rgxG(tmplObj) {
        var subst = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            subst[_i - 1] = arguments[_i];
        }
        var regexText = tmplObj.raw[0];
        var wsrgx = /^\s+|\s+\n|\s*#[\s\S]*?\n|\n/gm;
        var txt2 = regexText.replace(wsrgx, '');
        return new RegExp(txt2, 'g');
    }

        Object.defineProperty(exports, "__esModule", { value: true });
        exports.default = AnsiUp;
    }));
    });

    var AnsiUp = /*@__PURE__*/getDefaultExportFromCjs(ansi_up);

    var mark = createCommonjsModule(function (module, exports) {
    /*!***************************************************
    * mark.js v8.11.1
    * https://markjs.io/
    * Copyright (c) 2014–2018, Julian Kühnel
    * Released under the MIT license https://git.io/vwTVl
    *****************************************************/

    (function (global, factory) {
    	 module.exports = factory() ;
    }(commonjsGlobal, (function () {
    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };











    var classCallCheck = function (instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    };

    var createClass = function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();







    var _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    var DOMIterator = function () {
      function DOMIterator(ctx) {
        var iframes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        var exclude = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
        var iframesTimeout = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 5000;
        classCallCheck(this, DOMIterator);

        this.ctx = ctx;
        this.iframes = iframes;
        this.exclude = exclude;
        this.iframesTimeout = iframesTimeout;
      }

      createClass(DOMIterator, [{
        key: 'getContexts',
        value: function getContexts() {
          var ctx = void 0,
              filteredCtx = [];
          if (typeof this.ctx === 'undefined' || !this.ctx) {
            ctx = [];
          } else if (NodeList.prototype.isPrototypeOf(this.ctx)) {
            ctx = Array.prototype.slice.call(this.ctx);
          } else if (Array.isArray(this.ctx)) {
            ctx = this.ctx;
          } else if (typeof this.ctx === 'string') {
            ctx = Array.prototype.slice.call(document.querySelectorAll(this.ctx));
          } else {
            ctx = [this.ctx];
          }
          ctx.forEach(function (ctx) {
            var isDescendant = filteredCtx.filter(function (contexts) {
              return contexts.contains(ctx);
            }).length > 0;
            if (filteredCtx.indexOf(ctx) === -1 && !isDescendant) {
              filteredCtx.push(ctx);
            }
          });
          return filteredCtx;
        }
      }, {
        key: 'getIframeContents',
        value: function getIframeContents(ifr, successFn) {
          var errorFn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};

          var doc = void 0;
          try {
            var ifrWin = ifr.contentWindow;
            doc = ifrWin.document;
            if (!ifrWin || !doc) {
              throw new Error('iframe inaccessible');
            }
          } catch (e) {
            errorFn();
          }
          if (doc) {
            successFn(doc);
          }
        }
      }, {
        key: 'isIframeBlank',
        value: function isIframeBlank(ifr) {
          var bl = 'about:blank',
              src = ifr.getAttribute('src').trim(),
              href = ifr.contentWindow.location.href;
          return href === bl && src !== bl && src;
        }
      }, {
        key: 'observeIframeLoad',
        value: function observeIframeLoad(ifr, successFn, errorFn) {
          var _this = this;

          var called = false,
              tout = null;
          var listener = function listener() {
            if (called) {
              return;
            }
            called = true;
            clearTimeout(tout);
            try {
              if (!_this.isIframeBlank(ifr)) {
                ifr.removeEventListener('load', listener);
                _this.getIframeContents(ifr, successFn, errorFn);
              }
            } catch (e) {
              errorFn();
            }
          };
          ifr.addEventListener('load', listener);
          tout = setTimeout(listener, this.iframesTimeout);
        }
      }, {
        key: 'onIframeReady',
        value: function onIframeReady(ifr, successFn, errorFn) {
          try {
            if (ifr.contentWindow.document.readyState === 'complete') {
              if (this.isIframeBlank(ifr)) {
                this.observeIframeLoad(ifr, successFn, errorFn);
              } else {
                this.getIframeContents(ifr, successFn, errorFn);
              }
            } else {
              this.observeIframeLoad(ifr, successFn, errorFn);
            }
          } catch (e) {
            errorFn();
          }
        }
      }, {
        key: 'waitForIframes',
        value: function waitForIframes(ctx, done) {
          var _this2 = this;

          var eachCalled = 0;
          this.forEachIframe(ctx, function () {
            return true;
          }, function (ifr) {
            eachCalled++;
            _this2.waitForIframes(ifr.querySelector('html'), function () {
              if (! --eachCalled) {
                done();
              }
            });
          }, function (handled) {
            if (!handled) {
              done();
            }
          });
        }
      }, {
        key: 'forEachIframe',
        value: function forEachIframe(ctx, filter, each) {
          var _this3 = this;

          var end = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function () {};

          var ifr = ctx.querySelectorAll('iframe'),
              open = ifr.length,
              handled = 0;
          ifr = Array.prototype.slice.call(ifr);
          var checkEnd = function checkEnd() {
            if (--open <= 0) {
              end(handled);
            }
          };
          if (!open) {
            checkEnd();
          }
          ifr.forEach(function (ifr) {
            if (DOMIterator.matches(ifr, _this3.exclude)) {
              checkEnd();
            } else {
              _this3.onIframeReady(ifr, function (con) {
                if (filter(ifr)) {
                  handled++;
                  each(con);
                }
                checkEnd();
              }, checkEnd);
            }
          });
        }
      }, {
        key: 'createIterator',
        value: function createIterator(ctx, whatToShow, filter) {
          return document.createNodeIterator(ctx, whatToShow, filter, false);
        }
      }, {
        key: 'createInstanceOnIframe',
        value: function createInstanceOnIframe(contents) {
          return new DOMIterator(contents.querySelector('html'), this.iframes);
        }
      }, {
        key: 'compareNodeIframe',
        value: function compareNodeIframe(node, prevNode, ifr) {
          var compCurr = node.compareDocumentPosition(ifr),
              prev = Node.DOCUMENT_POSITION_PRECEDING;
          if (compCurr & prev) {
            if (prevNode !== null) {
              var compPrev = prevNode.compareDocumentPosition(ifr),
                  after = Node.DOCUMENT_POSITION_FOLLOWING;
              if (compPrev & after) {
                return true;
              }
            } else {
              return true;
            }
          }
          return false;
        }
      }, {
        key: 'getIteratorNode',
        value: function getIteratorNode(itr) {
          var prevNode = itr.previousNode();
          var node = void 0;
          if (prevNode === null) {
            node = itr.nextNode();
          } else {
            node = itr.nextNode() && itr.nextNode();
          }
          return {
            prevNode: prevNode,
            node: node
          };
        }
      }, {
        key: 'checkIframeFilter',
        value: function checkIframeFilter(node, prevNode, currIfr, ifr) {
          var key = false,
              handled = false;
          ifr.forEach(function (ifrDict, i) {
            if (ifrDict.val === currIfr) {
              key = i;
              handled = ifrDict.handled;
            }
          });
          if (this.compareNodeIframe(node, prevNode, currIfr)) {
            if (key === false && !handled) {
              ifr.push({
                val: currIfr,
                handled: true
              });
            } else if (key !== false && !handled) {
              ifr[key].handled = true;
            }
            return true;
          }
          if (key === false) {
            ifr.push({
              val: currIfr,
              handled: false
            });
          }
          return false;
        }
      }, {
        key: 'handleOpenIframes',
        value: function handleOpenIframes(ifr, whatToShow, eCb, fCb) {
          var _this4 = this;

          ifr.forEach(function (ifrDict) {
            if (!ifrDict.handled) {
              _this4.getIframeContents(ifrDict.val, function (con) {
                _this4.createInstanceOnIframe(con).forEachNode(whatToShow, eCb, fCb);
              });
            }
          });
        }
      }, {
        key: 'iterateThroughNodes',
        value: function iterateThroughNodes(whatToShow, ctx, eachCb, filterCb, doneCb) {
          var _this5 = this;

          var itr = this.createIterator(ctx, whatToShow, filterCb);
          var ifr = [],
              elements = [],
              node = void 0,
              prevNode = void 0,
              retrieveNodes = function retrieveNodes() {
            var _getIteratorNode = _this5.getIteratorNode(itr);

            prevNode = _getIteratorNode.prevNode;
            node = _getIteratorNode.node;

            return node;
          };
          while (retrieveNodes()) {
            if (this.iframes) {
              this.forEachIframe(ctx, function (currIfr) {
                return _this5.checkIframeFilter(node, prevNode, currIfr, ifr);
              }, function (con) {
                _this5.createInstanceOnIframe(con).forEachNode(whatToShow, function (ifrNode) {
                  return elements.push(ifrNode);
                }, filterCb);
              });
            }
            elements.push(node);
          }
          elements.forEach(function (node) {
            eachCb(node);
          });
          if (this.iframes) {
            this.handleOpenIframes(ifr, whatToShow, eachCb, filterCb);
          }
          doneCb();
        }
      }, {
        key: 'forEachNode',
        value: function forEachNode(whatToShow, each, filter) {
          var _this6 = this;

          var done = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function () {};

          var contexts = this.getContexts();
          var open = contexts.length;
          if (!open) {
            done();
          }
          contexts.forEach(function (ctx) {
            var ready = function ready() {
              _this6.iterateThroughNodes(whatToShow, ctx, each, filter, function () {
                if (--open <= 0) {
                  done();
                }
              });
            };
            if (_this6.iframes) {
              _this6.waitForIframes(ctx, ready);
            } else {
              ready();
            }
          });
        }
      }], [{
        key: 'matches',
        value: function matches(element, selector) {
          var selectors = typeof selector === 'string' ? [selector] : selector,
              fn = element.matches || element.matchesSelector || element.msMatchesSelector || element.mozMatchesSelector || element.oMatchesSelector || element.webkitMatchesSelector;
          if (fn) {
            var match = false;
            selectors.every(function (sel) {
              if (fn.call(element, sel)) {
                match = true;
                return false;
              }
              return true;
            });
            return match;
          } else {
            return false;
          }
        }
      }]);
      return DOMIterator;
    }();

    var Mark$1 = function () {
      function Mark(ctx) {
        classCallCheck(this, Mark);

        this.ctx = ctx;
        this.ie = false;
        var ua = window.navigator.userAgent;
        if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) {
          this.ie = true;
        }
      }

      createClass(Mark, [{
        key: 'log',
        value: function log(msg) {
          var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'debug';

          var log = this.opt.log;
          if (!this.opt.debug) {
            return;
          }
          if ((typeof log === 'undefined' ? 'undefined' : _typeof(log)) === 'object' && typeof log[level] === 'function') {
            log[level]('mark.js: ' + msg);
          }
        }
      }, {
        key: 'escapeStr',
        value: function escapeStr(str) {
          return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
        }
      }, {
        key: 'createRegExp',
        value: function createRegExp(str) {
          if (this.opt.wildcards !== 'disabled') {
            str = this.setupWildcardsRegExp(str);
          }
          str = this.escapeStr(str);
          if (Object.keys(this.opt.synonyms).length) {
            str = this.createSynonymsRegExp(str);
          }
          if (this.opt.ignoreJoiners || this.opt.ignorePunctuation.length) {
            str = this.setupIgnoreJoinersRegExp(str);
          }
          if (this.opt.diacritics) {
            str = this.createDiacriticsRegExp(str);
          }
          str = this.createMergedBlanksRegExp(str);
          if (this.opt.ignoreJoiners || this.opt.ignorePunctuation.length) {
            str = this.createJoinersRegExp(str);
          }
          if (this.opt.wildcards !== 'disabled') {
            str = this.createWildcardsRegExp(str);
          }
          str = this.createAccuracyRegExp(str);
          return str;
        }
      }, {
        key: 'createSynonymsRegExp',
        value: function createSynonymsRegExp(str) {
          var syn = this.opt.synonyms,
              sens = this.opt.caseSensitive ? '' : 'i',
              joinerPlaceholder = this.opt.ignoreJoiners || this.opt.ignorePunctuation.length ? '\0' : '';
          for (var index in syn) {
            if (syn.hasOwnProperty(index)) {
              var value = syn[index],
                  k1 = this.opt.wildcards !== 'disabled' ? this.setupWildcardsRegExp(index) : this.escapeStr(index),
                  k2 = this.opt.wildcards !== 'disabled' ? this.setupWildcardsRegExp(value) : this.escapeStr(value);
              if (k1 !== '' && k2 !== '') {
                str = str.replace(new RegExp('(' + this.escapeStr(k1) + '|' + this.escapeStr(k2) + ')', 'gm' + sens), joinerPlaceholder + ('(' + this.processSynomyms(k1) + '|') + (this.processSynomyms(k2) + ')') + joinerPlaceholder);
              }
            }
          }
          return str;
        }
      }, {
        key: 'processSynomyms',
        value: function processSynomyms(str) {
          if (this.opt.ignoreJoiners || this.opt.ignorePunctuation.length) {
            str = this.setupIgnoreJoinersRegExp(str);
          }
          return str;
        }
      }, {
        key: 'setupWildcardsRegExp',
        value: function setupWildcardsRegExp(str) {
          str = str.replace(/(?:\\)*\?/g, function (val) {
            return val.charAt(0) === '\\' ? '?' : '\x01';
          });
          return str.replace(/(?:\\)*\*/g, function (val) {
            return val.charAt(0) === '\\' ? '*' : '\x02';
          });
        }
      }, {
        key: 'createWildcardsRegExp',
        value: function createWildcardsRegExp(str) {
          var spaces = this.opt.wildcards === 'withSpaces';
          return str.replace(/\u0001/g, spaces ? '[\\S\\s]?' : '\\S?').replace(/\u0002/g, spaces ? '[\\S\\s]*?' : '\\S*');
        }
      }, {
        key: 'setupIgnoreJoinersRegExp',
        value: function setupIgnoreJoinersRegExp(str) {
          return str.replace(/[^(|)\\]/g, function (val, indx, original) {
            var nextChar = original.charAt(indx + 1);
            if (/[(|)\\]/.test(nextChar) || nextChar === '') {
              return val;
            } else {
              return val + '\0';
            }
          });
        }
      }, {
        key: 'createJoinersRegExp',
        value: function createJoinersRegExp(str) {
          var joiner = [];
          var ignorePunctuation = this.opt.ignorePunctuation;
          if (Array.isArray(ignorePunctuation) && ignorePunctuation.length) {
            joiner.push(this.escapeStr(ignorePunctuation.join('')));
          }
          if (this.opt.ignoreJoiners) {
            joiner.push('\\u00ad\\u200b\\u200c\\u200d');
          }
          return joiner.length ? str.split(/\u0000+/).join('[' + joiner.join('') + ']*') : str;
        }
      }, {
        key: 'createDiacriticsRegExp',
        value: function createDiacriticsRegExp(str) {
          var sens = this.opt.caseSensitive ? '' : 'i',
              dct = this.opt.caseSensitive ? ['aàáảãạăằắẳẵặâầấẩẫậäåāą', 'AÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÄÅĀĄ', 'cçćč', 'CÇĆČ', 'dđď', 'DĐĎ', 'eèéẻẽẹêềếểễệëěēę', 'EÈÉẺẼẸÊỀẾỂỄỆËĚĒĘ', 'iìíỉĩịîïī', 'IÌÍỈĨỊÎÏĪ', 'lł', 'LŁ', 'nñňń', 'NÑŇŃ', 'oòóỏõọôồốổỗộơởỡớờợöøō', 'OÒÓỎÕỌÔỒỐỔỖỘƠỞỠỚỜỢÖØŌ', 'rř', 'RŘ', 'sšśșş', 'SŠŚȘŞ', 'tťțţ', 'TŤȚŢ', 'uùúủũụưừứửữựûüůū', 'UÙÚỦŨỤƯỪỨỬỮỰÛÜŮŪ', 'yýỳỷỹỵÿ', 'YÝỲỶỸỴŸ', 'zžżź', 'ZŽŻŹ'] : ['aàáảãạăằắẳẵặâầấẩẫậäåāąAÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÄÅĀĄ', 'cçćčCÇĆČ', 'dđďDĐĎ', 'eèéẻẽẹêềếểễệëěēęEÈÉẺẼẸÊỀẾỂỄỆËĚĒĘ', 'iìíỉĩịîïīIÌÍỈĨỊÎÏĪ', 'lłLŁ', 'nñňńNÑŇŃ', 'oòóỏõọôồốổỗộơởỡớờợöøōOÒÓỎÕỌÔỒỐỔỖỘƠỞỠỚỜỢÖØŌ', 'rřRŘ', 'sšśșşSŠŚȘŞ', 'tťțţTŤȚŢ', 'uùúủũụưừứửữựûüůūUÙÚỦŨỤƯỪỨỬỮỰÛÜŮŪ', 'yýỳỷỹỵÿYÝỲỶỸỴŸ', 'zžżźZŽŻŹ'];
          var handled = [];
          str.split('').forEach(function (ch) {
            dct.every(function (dct) {
              if (dct.indexOf(ch) !== -1) {
                if (handled.indexOf(dct) > -1) {
                  return false;
                }
                str = str.replace(new RegExp('[' + dct + ']', 'gm' + sens), '[' + dct + ']');
                handled.push(dct);
              }
              return true;
            });
          });
          return str;
        }
      }, {
        key: 'createMergedBlanksRegExp',
        value: function createMergedBlanksRegExp(str) {
          return str.replace(/[\s]+/gmi, '[\\s]+');
        }
      }, {
        key: 'createAccuracyRegExp',
        value: function createAccuracyRegExp(str) {
          var _this = this;

          var chars = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~¡¿';
          var acc = this.opt.accuracy,
              val = typeof acc === 'string' ? acc : acc.value,
              ls = typeof acc === 'string' ? [] : acc.limiters,
              lsJoin = '';
          ls.forEach(function (limiter) {
            lsJoin += '|' + _this.escapeStr(limiter);
          });
          switch (val) {
            case 'partially':
            default:
              return '()(' + str + ')';
            case 'complementary':
              lsJoin = '\\s' + (lsJoin ? lsJoin : this.escapeStr(chars));
              return '()([^' + lsJoin + ']*' + str + '[^' + lsJoin + ']*)';
            case 'exactly':
              return '(^|\\s' + lsJoin + ')(' + str + ')(?=$|\\s' + lsJoin + ')';
          }
        }
      }, {
        key: 'getSeparatedKeywords',
        value: function getSeparatedKeywords(sv) {
          var _this2 = this;

          var stack = [];
          sv.forEach(function (kw) {
            if (!_this2.opt.separateWordSearch) {
              if (kw.trim() && stack.indexOf(kw) === -1) {
                stack.push(kw);
              }
            } else {
              kw.split(' ').forEach(function (kwSplitted) {
                if (kwSplitted.trim() && stack.indexOf(kwSplitted) === -1) {
                  stack.push(kwSplitted);
                }
              });
            }
          });
          return {
            'keywords': stack.sort(function (a, b) {
              return b.length - a.length;
            }),
            'length': stack.length
          };
        }
      }, {
        key: 'isNumeric',
        value: function isNumeric(value) {
          return Number(parseFloat(value)) == value;
        }
      }, {
        key: 'checkRanges',
        value: function checkRanges(array) {
          var _this3 = this;

          if (!Array.isArray(array) || Object.prototype.toString.call(array[0]) !== '[object Object]') {
            this.log('markRanges() will only accept an array of objects');
            this.opt.noMatch(array);
            return [];
          }
          var stack = [];
          var last = 0;
          array.sort(function (a, b) {
            return a.start - b.start;
          }).forEach(function (item) {
            var _callNoMatchOnInvalid = _this3.callNoMatchOnInvalidRanges(item, last),
                start = _callNoMatchOnInvalid.start,
                end = _callNoMatchOnInvalid.end,
                valid = _callNoMatchOnInvalid.valid;

            if (valid) {
              item.start = start;
              item.length = end - start;
              stack.push(item);
              last = end;
            }
          });
          return stack;
        }
      }, {
        key: 'callNoMatchOnInvalidRanges',
        value: function callNoMatchOnInvalidRanges(range, last) {
          var start = void 0,
              end = void 0,
              valid = false;
          if (range && typeof range.start !== 'undefined') {
            start = parseInt(range.start, 10);
            end = start + parseInt(range.length, 10);
            if (this.isNumeric(range.start) && this.isNumeric(range.length) && end - last > 0 && end - start > 0) {
              valid = true;
            } else {
              this.log('Ignoring invalid or overlapping range: ' + ('' + JSON.stringify(range)));
              this.opt.noMatch(range);
            }
          } else {
            this.log('Ignoring invalid range: ' + JSON.stringify(range));
            this.opt.noMatch(range);
          }
          return {
            start: start,
            end: end,
            valid: valid
          };
        }
      }, {
        key: 'checkWhitespaceRanges',
        value: function checkWhitespaceRanges(range, originalLength, string) {
          var end = void 0,
              valid = true,
              max = string.length,
              offset = originalLength - max,
              start = parseInt(range.start, 10) - offset;
          start = start > max ? max : start;
          end = start + parseInt(range.length, 10);
          if (end > max) {
            end = max;
            this.log('End range automatically set to the max value of ' + max);
          }
          if (start < 0 || end - start < 0 || start > max || end > max) {
            valid = false;
            this.log('Invalid range: ' + JSON.stringify(range));
            this.opt.noMatch(range);
          } else if (string.substring(start, end).replace(/\s+/g, '') === '') {
            valid = false;
            this.log('Skipping whitespace only range: ' + JSON.stringify(range));
            this.opt.noMatch(range);
          }
          return {
            start: start,
            end: end,
            valid: valid
          };
        }
      }, {
        key: 'getTextNodes',
        value: function getTextNodes(cb) {
          var _this4 = this;

          var val = '',
              nodes = [];
          this.iterator.forEachNode(NodeFilter.SHOW_TEXT, function (node) {
            nodes.push({
              start: val.length,
              end: (val += node.textContent).length,
              node: node
            });
          }, function (node) {
            if (_this4.matchesExclude(node.parentNode)) {
              return NodeFilter.FILTER_REJECT;
            } else {
              return NodeFilter.FILTER_ACCEPT;
            }
          }, function () {
            cb({
              value: val,
              nodes: nodes
            });
          });
        }
      }, {
        key: 'matchesExclude',
        value: function matchesExclude(el) {
          return DOMIterator.matches(el, this.opt.exclude.concat(['script', 'style', 'title', 'head', 'html']));
        }
      }, {
        key: 'wrapRangeInTextNode',
        value: function wrapRangeInTextNode(node, start, end) {
          var hEl = !this.opt.element ? 'mark' : this.opt.element,
              startNode = node.splitText(start),
              ret = startNode.splitText(end - start);
          var repl = document.createElement(hEl);
          repl.setAttribute('data-markjs', 'true');
          if (this.opt.className) {
            repl.setAttribute('class', this.opt.className);
          }
          repl.textContent = startNode.textContent;
          startNode.parentNode.replaceChild(repl, startNode);
          return ret;
        }
      }, {
        key: 'wrapRangeInMappedTextNode',
        value: function wrapRangeInMappedTextNode(dict, start, end, filterCb, eachCb) {
          var _this5 = this;

          dict.nodes.every(function (n, i) {
            var sibl = dict.nodes[i + 1];
            if (typeof sibl === 'undefined' || sibl.start > start) {
              if (!filterCb(n.node)) {
                return false;
              }
              var s = start - n.start,
                  e = (end > n.end ? n.end : end) - n.start,
                  startStr = dict.value.substr(0, n.start),
                  endStr = dict.value.substr(e + n.start);
              n.node = _this5.wrapRangeInTextNode(n.node, s, e);
              dict.value = startStr + endStr;
              dict.nodes.forEach(function (k, j) {
                if (j >= i) {
                  if (dict.nodes[j].start > 0 && j !== i) {
                    dict.nodes[j].start -= e;
                  }
                  dict.nodes[j].end -= e;
                }
              });
              end -= e;
              eachCb(n.node.previousSibling, n.start);
              if (end > n.end) {
                start = n.end;
              } else {
                return false;
              }
            }
            return true;
          });
        }
      }, {
        key: 'wrapMatches',
        value: function wrapMatches(regex, ignoreGroups, filterCb, eachCb, endCb) {
          var _this6 = this;

          var matchIdx = ignoreGroups === 0 ? 0 : ignoreGroups + 1;
          this.getTextNodes(function (dict) {
            dict.nodes.forEach(function (node) {
              node = node.node;
              var match = void 0;
              while ((match = regex.exec(node.textContent)) !== null && match[matchIdx] !== '') {
                if (!filterCb(match[matchIdx], node)) {
                  continue;
                }
                var pos = match.index;
                if (matchIdx !== 0) {
                  for (var i = 1; i < matchIdx; i++) {
                    pos += match[i].length;
                  }
                }
                node = _this6.wrapRangeInTextNode(node, pos, pos + match[matchIdx].length);
                eachCb(node.previousSibling);
                regex.lastIndex = 0;
              }
            });
            endCb();
          });
        }
      }, {
        key: 'wrapMatchesAcrossElements',
        value: function wrapMatchesAcrossElements(regex, ignoreGroups, filterCb, eachCb, endCb) {
          var _this7 = this;

          var matchIdx = ignoreGroups === 0 ? 0 : ignoreGroups + 1;
          this.getTextNodes(function (dict) {
            var match = void 0;
            while ((match = regex.exec(dict.value)) !== null && match[matchIdx] !== '') {
              var start = match.index;
              if (matchIdx !== 0) {
                for (var i = 1; i < matchIdx; i++) {
                  start += match[i].length;
                }
              }
              var end = start + match[matchIdx].length;
              _this7.wrapRangeInMappedTextNode(dict, start, end, function (node) {
                return filterCb(match[matchIdx], node);
              }, function (node, lastIndex) {
                regex.lastIndex = lastIndex;
                eachCb(node);
              });
            }
            endCb();
          });
        }
      }, {
        key: 'wrapRangeFromIndex',
        value: function wrapRangeFromIndex(ranges, filterCb, eachCb, endCb) {
          var _this8 = this;

          this.getTextNodes(function (dict) {
            var originalLength = dict.value.length;
            ranges.forEach(function (range, counter) {
              var _checkWhitespaceRange = _this8.checkWhitespaceRanges(range, originalLength, dict.value),
                  start = _checkWhitespaceRange.start,
                  end = _checkWhitespaceRange.end,
                  valid = _checkWhitespaceRange.valid;

              if (valid) {
                _this8.wrapRangeInMappedTextNode(dict, start, end, function (node) {
                  return filterCb(node, range, dict.value.substring(start, end), counter);
                }, function (node) {
                  eachCb(node, range);
                });
              }
            });
            endCb();
          });
        }
      }, {
        key: 'unwrapMatches',
        value: function unwrapMatches(node) {
          var parent = node.parentNode;
          var docFrag = document.createDocumentFragment();
          while (node.firstChild) {
            docFrag.appendChild(node.removeChild(node.firstChild));
          }
          parent.replaceChild(docFrag, node);
          if (!this.ie) {
            parent.normalize();
          } else {
            this.normalizeTextNode(parent);
          }
        }
      }, {
        key: 'normalizeTextNode',
        value: function normalizeTextNode(node) {
          if (!node) {
            return;
          }
          if (node.nodeType === 3) {
            while (node.nextSibling && node.nextSibling.nodeType === 3) {
              node.nodeValue += node.nextSibling.nodeValue;
              node.parentNode.removeChild(node.nextSibling);
            }
          } else {
            this.normalizeTextNode(node.firstChild);
          }
          this.normalizeTextNode(node.nextSibling);
        }
      }, {
        key: 'markRegExp',
        value: function markRegExp(regexp, opt) {
          var _this9 = this;

          this.opt = opt;
          this.log('Searching with expression "' + regexp + '"');
          var totalMatches = 0,
              fn = 'wrapMatches';
          var eachCb = function eachCb(element) {
            totalMatches++;
            _this9.opt.each(element);
          };
          if (this.opt.acrossElements) {
            fn = 'wrapMatchesAcrossElements';
          }
          this[fn](regexp, this.opt.ignoreGroups, function (match, node) {
            return _this9.opt.filter(node, match, totalMatches);
          }, eachCb, function () {
            if (totalMatches === 0) {
              _this9.opt.noMatch(regexp);
            }
            _this9.opt.done(totalMatches);
          });
        }
      }, {
        key: 'mark',
        value: function mark(sv, opt) {
          var _this10 = this;

          this.opt = opt;
          var totalMatches = 0,
              fn = 'wrapMatches';

          var _getSeparatedKeywords = this.getSeparatedKeywords(typeof sv === 'string' ? [sv] : sv),
              kwArr = _getSeparatedKeywords.keywords,
              kwArrLen = _getSeparatedKeywords.length,
              sens = this.opt.caseSensitive ? '' : 'i',
              handler = function handler(kw) {
            var regex = new RegExp(_this10.createRegExp(kw), 'gm' + sens),
                matches = 0;
            _this10.log('Searching with expression "' + regex + '"');
            _this10[fn](regex, 1, function (term, node) {
              return _this10.opt.filter(node, kw, totalMatches, matches);
            }, function (element) {
              matches++;
              totalMatches++;
              _this10.opt.each(element);
            }, function () {
              if (matches === 0) {
                _this10.opt.noMatch(kw);
              }
              if (kwArr[kwArrLen - 1] === kw) {
                _this10.opt.done(totalMatches);
              } else {
                handler(kwArr[kwArr.indexOf(kw) + 1]);
              }
            });
          };

          if (this.opt.acrossElements) {
            fn = 'wrapMatchesAcrossElements';
          }
          if (kwArrLen === 0) {
            this.opt.done(totalMatches);
          } else {
            handler(kwArr[0]);
          }
        }
      }, {
        key: 'markRanges',
        value: function markRanges(rawRanges, opt) {
          var _this11 = this;

          this.opt = opt;
          var totalMatches = 0,
              ranges = this.checkRanges(rawRanges);
          if (ranges && ranges.length) {
            this.log('Starting to mark with the following ranges: ' + JSON.stringify(ranges));
            this.wrapRangeFromIndex(ranges, function (node, range, match, counter) {
              return _this11.opt.filter(node, range, match, counter);
            }, function (element, range) {
              totalMatches++;
              _this11.opt.each(element, range);
            }, function () {
              _this11.opt.done(totalMatches);
            });
          } else {
            this.opt.done(totalMatches);
          }
        }
      }, {
        key: 'unmark',
        value: function unmark(opt) {
          var _this12 = this;

          this.opt = opt;
          var sel = this.opt.element ? this.opt.element : '*';
          sel += '[data-markjs]';
          if (this.opt.className) {
            sel += '.' + this.opt.className;
          }
          this.log('Removal selector "' + sel + '"');
          this.iterator.forEachNode(NodeFilter.SHOW_ELEMENT, function (node) {
            _this12.unwrapMatches(node);
          }, function (node) {
            var matchesSel = DOMIterator.matches(node, sel),
                matchesExclude = _this12.matchesExclude(node);
            if (!matchesSel || matchesExclude) {
              return NodeFilter.FILTER_REJECT;
            } else {
              return NodeFilter.FILTER_ACCEPT;
            }
          }, this.opt.done);
        }
      }, {
        key: 'opt',
        set: function set$$1(val) {
          this._opt = _extends({}, {
            'element': '',
            'className': '',
            'exclude': [],
            'iframes': false,
            'iframesTimeout': 5000,
            'separateWordSearch': true,
            'diacritics': true,
            'synonyms': {},
            'accuracy': 'partially',
            'acrossElements': false,
            'caseSensitive': false,
            'ignoreJoiners': false,
            'ignoreGroups': 0,
            'ignorePunctuation': [],
            'wildcards': 'disabled',
            'each': function each() {},
            'noMatch': function noMatch() {},
            'filter': function filter() {
              return true;
            },
            'done': function done() {},
            'debug': false,
            'log': window.console
          }, val);
        },
        get: function get$$1() {
          return this._opt;
        }
      }, {
        key: 'iterator',
        get: function get$$1() {
          return new DOMIterator(this.ctx, this.opt.iframes, this.opt.exclude, this.opt.iframesTimeout);
        }
      }]);
      return Mark;
    }();

    function Mark(ctx) {
      var _this = this;

      var instance = new Mark$1(ctx);
      this.mark = function (sv, opt) {
        instance.mark(sv, opt);
        return _this;
      };
      this.markRegExp = function (sv, opt) {
        instance.markRegExp(sv, opt);
        return _this;
      };
      this.markRanges = function (sv, opt) {
        instance.markRanges(sv, opt);
        return _this;
      };
      this.unmark = function (opt) {
        instance.unmark(opt);
        return _this;
      };
      return this;
    }

    return Mark;

    })));
    });

    /* src/views/LogView.svelte generated by Svelte v3.31.0 */
    const file$4 = "src/views/LogView.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (32:2) {#each log as msg}
    function create_each_block(ctx) {
    	let div;
    	let html_tag;
    	let raw_value = /*msg*/ ctx[9] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			html_tag = new HtmlTag(t);
    			add_location(div, file$4, 32, 4, 702);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			html_tag.m(raw_value, div);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*log*/ 4 && raw_value !== (raw_value = /*msg*/ ctx[9] + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(32:2) {#each log as msg}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let each_value = /*log*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "log-content svelte-18fkjoc");
    			toggle_class(div, "lineWrap", /*lineWrap*/ ctx[0]);
    			add_location(div, file$4, 30, 0, 613);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			/*div_binding*/ ctx[5](div);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*log*/ 4) {
    				each_value = /*log*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*lineWrap*/ 1) {
    				toggle_class(div, "lineWrap", /*lineWrap*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			/*div_binding*/ ctx[5](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LogView", slots, []);
    	let { data } = $$props;
    	let { search = "" } = $$props;
    	let { lineWrap = false } = $$props;
    	const ansiUp = new AnsiUp();
    	let logContent;

    	function highlightSearchText(value) {
    		// Always unmark before highlight
    		marker?.unmark();

    		// Mark value if truthy
    		if (value) {
    			marker?.mark(value);
    		}
    	}

    	const writable_props = ["data", "search", "lineWrap"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LogView> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			logContent = $$value;
    			$$invalidate(1, logContent);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(3, data = $$props.data);
    		if ("search" in $$props) $$invalidate(4, search = $$props.search);
    		if ("lineWrap" in $$props) $$invalidate(0, lineWrap = $$props.lineWrap);
    	};

    	$$self.$capture_state = () => ({
    		AnsiUp,
    		Mark: mark,
    		data,
    		search,
    		lineWrap,
    		ansiUp,
    		logContent,
    		highlightSearchText,
    		log,
    		marker
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(3, data = $$props.data);
    		if ("search" in $$props) $$invalidate(4, search = $$props.search);
    		if ("lineWrap" in $$props) $$invalidate(0, lineWrap = $$props.lineWrap);
    		if ("logContent" in $$props) $$invalidate(1, logContent = $$props.logContent);
    		if ("log" in $$props) $$invalidate(2, log = $$props.log);
    		if ("marker" in $$props) marker = $$props.marker;
    	};

    	let log;
    	let marker;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data*/ 8) {
    			 $$invalidate(2, log = data.map(v => ansiUp.ansi_to_html(v.msg)) || []);
    		}

    		if ($$self.$$.dirty & /*logContent*/ 2) {
    			 marker = logContent != null ? new mark(logContent) : undefined;
    		}

    		if ($$self.$$.dirty & /*log, search*/ 20) {
    			 (highlightSearchText(search));
    		}
    	};

    	return [lineWrap, logContent, log, data, search, div_binding];
    }

    class LogView extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { data: 3, search: 4, lineWrap: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LogView",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[3] === undefined && !("data" in props)) {
    			console.warn("<LogView> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<LogView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<LogView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get search() {
    		throw new Error("<LogView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set search(value) {
    		throw new Error("<LogView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lineWrap() {
    		throw new Error("<LogView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lineWrap(value) {
    		throw new Error("<LogView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function backOut(t) {
        const s = 1.70158;
        return --t * t * ((s + 1) * t + s) + 1;
    }
    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function quadIn(t) {
        return t * t;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    var contextKey = {};

    /* node_modules/svelte-json-tree/src/JSONArrow.svelte generated by Svelte v3.31.0 */

    const file$5 = "node_modules/svelte-json-tree/src/JSONArrow.svelte";

    function create_fragment$5(ctx) {
    	let div1;
    	let div0;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = `${"▶"}`;
    			attr_dev(div0, "class", "arrow svelte-1vyml86");
    			toggle_class(div0, "expanded", /*expanded*/ ctx[0]);
    			add_location(div0, file$5, 29, 2, 622);
    			attr_dev(div1, "class", "container svelte-1vyml86");
    			add_location(div1, file$5, 28, 0, 587);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*expanded*/ 1) {
    				toggle_class(div0, "expanded", /*expanded*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("JSONArrow", slots, []);
    	let { expanded } = $$props;
    	const writable_props = ["expanded"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<JSONArrow> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("expanded" in $$props) $$invalidate(0, expanded = $$props.expanded);
    	};

    	$$self.$capture_state = () => ({ expanded });

    	$$self.$inject_state = $$props => {
    		if ("expanded" in $$props) $$invalidate(0, expanded = $$props.expanded);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [expanded, click_handler];
    }

    class JSONArrow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { expanded: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "JSONArrow",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*expanded*/ ctx[0] === undefined && !("expanded" in props)) {
    			console.warn("<JSONArrow> was created without expected prop 'expanded'");
    		}
    	}

    	get expanded() {
    		throw new Error("<JSONArrow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expanded(value) {
    		throw new Error("<JSONArrow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-json-tree/src/JSONKey.svelte generated by Svelte v3.31.0 */

    const file$6 = "node_modules/svelte-json-tree/src/JSONKey.svelte";

    // (16:0) {#if showKey && key}
    function create_if_block(ctx) {
    	let label;
    	let span;
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			span = element("span");
    			t0 = text(/*key*/ ctx[0]);
    			t1 = text(/*colon*/ ctx[2]);
    			add_location(span, file$6, 17, 4, 399);
    			attr_dev(label, "class", "svelte-1vlbacg");
    			toggle_class(label, "spaced", /*isParentExpanded*/ ctx[1]);
    			add_location(label, file$6, 16, 2, 346);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, span);
    			append_dev(span, t0);
    			append_dev(span, t1);

    			if (!mounted) {
    				dispose = listen_dev(label, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*key*/ 1) set_data_dev(t0, /*key*/ ctx[0]);
    			if (dirty & /*colon*/ 4) set_data_dev(t1, /*colon*/ ctx[2]);

    			if (dirty & /*isParentExpanded*/ 2) {
    				toggle_class(label, "spaced", /*isParentExpanded*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(16:0) {#if showKey && key}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let if_block_anchor;
    	let if_block = /*showKey*/ ctx[3] && /*key*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showKey*/ ctx[3] && /*key*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("JSONKey", slots, []);

    	let { key } = $$props,
    		{ isParentExpanded } = $$props,
    		{ isParentArray = false } = $$props,
    		{ colon = ":" } = $$props;

    	const writable_props = ["key", "isParentExpanded", "isParentArray", "colon"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<JSONKey> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(0, key = $$props.key);
    		if ("isParentExpanded" in $$props) $$invalidate(1, isParentExpanded = $$props.isParentExpanded);
    		if ("isParentArray" in $$props) $$invalidate(4, isParentArray = $$props.isParentArray);
    		if ("colon" in $$props) $$invalidate(2, colon = $$props.colon);
    	};

    	$$self.$capture_state = () => ({
    		key,
    		isParentExpanded,
    		isParentArray,
    		colon,
    		showKey
    	});

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(0, key = $$props.key);
    		if ("isParentExpanded" in $$props) $$invalidate(1, isParentExpanded = $$props.isParentExpanded);
    		if ("isParentArray" in $$props) $$invalidate(4, isParentArray = $$props.isParentArray);
    		if ("colon" in $$props) $$invalidate(2, colon = $$props.colon);
    		if ("showKey" in $$props) $$invalidate(3, showKey = $$props.showKey);
    	};

    	let showKey;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isParentExpanded, isParentArray, key*/ 19) {
    			 $$invalidate(3, showKey = isParentExpanded || !isParentArray || key != +key);
    		}
    	};

    	return [key, isParentExpanded, colon, showKey, isParentArray, click_handler];
    }

    class JSONKey extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			key: 0,
    			isParentExpanded: 1,
    			isParentArray: 4,
    			colon: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "JSONKey",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[0] === undefined && !("key" in props)) {
    			console.warn("<JSONKey> was created without expected prop 'key'");
    		}

    		if (/*isParentExpanded*/ ctx[1] === undefined && !("isParentExpanded" in props)) {
    			console.warn("<JSONKey> was created without expected prop 'isParentExpanded'");
    		}
    	}

    	get key() {
    		throw new Error("<JSONKey>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<JSONKey>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isParentExpanded() {
    		throw new Error("<JSONKey>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isParentExpanded(value) {
    		throw new Error("<JSONKey>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isParentArray() {
    		throw new Error("<JSONKey>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isParentArray(value) {
    		throw new Error("<JSONKey>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colon() {
    		throw new Error("<JSONKey>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colon(value) {
    		throw new Error("<JSONKey>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-json-tree/src/JSONNested.svelte generated by Svelte v3.31.0 */
    const file$7 = "node_modules/svelte-json-tree/src/JSONNested.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[20] = i;
    	return child_ctx;
    }

    // (57:4) {#if expandable && isParentExpanded}
    function create_if_block_3(ctx) {
    	let jsonarrow;
    	let current;

    	jsonarrow = new JSONArrow({
    			props: { expanded: /*expanded*/ ctx[0] },
    			$$inline: true
    		});

    	jsonarrow.$on("click", /*toggleExpand*/ ctx[15]);

    	const block = {
    		c: function create() {
    			create_component(jsonarrow.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(jsonarrow, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const jsonarrow_changes = {};
    			if (dirty & /*expanded*/ 1) jsonarrow_changes.expanded = /*expanded*/ ctx[0];
    			jsonarrow.$set(jsonarrow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(jsonarrow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(jsonarrow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(jsonarrow, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(57:4) {#if expandable && isParentExpanded}",
    		ctx
    	});

    	return block;
    }

    // (75:4) {:else}
    function create_else_block(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "…";
    			add_location(span, file$7, 75, 6, 2085);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(75:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (63:4) {#if isParentExpanded}
    function create_if_block$1(ctx) {
    	let ul;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*slicedKeys*/ ctx[13];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block = /*slicedKeys*/ ctx[13].length < /*previewKeys*/ ctx[7].length && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(ul, "class", "svelte-rwxv37");
    			toggle_class(ul, "collapse", !/*expanded*/ ctx[0]);
    			add_location(ul, file$7, 63, 6, 1589);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(ul, t);
    			if (if_block) if_block.m(ul, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(ul, "click", /*expand*/ ctx[16], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*expanded, previewKeys, getKey, slicedKeys, isArray, getValue, getPreviewValue*/ 10129) {
    				each_value = /*slicedKeys*/ ctx[13];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, t);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*slicedKeys*/ ctx[13].length < /*previewKeys*/ ctx[7].length) {
    				if (if_block) ; else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(ul, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*expanded*/ 1) {
    				toggle_class(ul, "collapse", !/*expanded*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(63:4) {#if isParentExpanded}",
    		ctx
    	});

    	return block;
    }

    // (67:10) {#if !expanded && index < previewKeys.length - 1}
    function create_if_block_2(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = ",";
    			attr_dev(span, "class", "comma svelte-rwxv37");
    			add_location(span, file$7, 67, 12, 1901);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(67:10) {#if !expanded && index < previewKeys.length - 1}",
    		ctx
    	});

    	return block;
    }

    // (65:8) {#each slicedKeys as key, index}
    function create_each_block$1(ctx) {
    	let jsonnode;
    	let t;
    	let if_block_anchor;
    	let current;

    	jsonnode = new JSONNode({
    			props: {
    				key: /*getKey*/ ctx[8](/*key*/ ctx[12]),
    				isParentExpanded: /*expanded*/ ctx[0],
    				isParentArray: /*isArray*/ ctx[4],
    				value: /*expanded*/ ctx[0]
    				? /*getValue*/ ctx[9](/*key*/ ctx[12])
    				: /*getPreviewValue*/ ctx[10](/*key*/ ctx[12])
    			},
    			$$inline: true
    		});

    	let if_block = !/*expanded*/ ctx[0] && /*index*/ ctx[20] < /*previewKeys*/ ctx[7].length - 1 && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			create_component(jsonnode.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			mount_component(jsonnode, target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const jsonnode_changes = {};
    			if (dirty & /*getKey, slicedKeys*/ 8448) jsonnode_changes.key = /*getKey*/ ctx[8](/*key*/ ctx[12]);
    			if (dirty & /*expanded*/ 1) jsonnode_changes.isParentExpanded = /*expanded*/ ctx[0];
    			if (dirty & /*isArray*/ 16) jsonnode_changes.isParentArray = /*isArray*/ ctx[4];

    			if (dirty & /*expanded, getValue, slicedKeys, getPreviewValue*/ 9729) jsonnode_changes.value = /*expanded*/ ctx[0]
    			? /*getValue*/ ctx[9](/*key*/ ctx[12])
    			: /*getPreviewValue*/ ctx[10](/*key*/ ctx[12]);

    			jsonnode.$set(jsonnode_changes);

    			if (!/*expanded*/ ctx[0] && /*index*/ ctx[20] < /*previewKeys*/ ctx[7].length - 1) {
    				if (if_block) ; else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(jsonnode.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(jsonnode.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(jsonnode, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(65:8) {#each slicedKeys as key, index}",
    		ctx
    	});

    	return block;
    }

    // (71:8) {#if slicedKeys.length < previewKeys.length }
    function create_if_block_1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "…";
    			add_location(span, file$7, 71, 10, 2026);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(71:8) {#if slicedKeys.length < previewKeys.length }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let li;
    	let label_1;
    	let t0;
    	let jsonkey;
    	let t1;
    	let span1;
    	let span0;
    	let t2;
    	let t3;
    	let t4;
    	let current_block_type_index;
    	let if_block1;
    	let t5;
    	let span2;
    	let t6;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*expandable*/ ctx[11] && /*isParentExpanded*/ ctx[2] && create_if_block_3(ctx);

    	jsonkey = new JSONKey({
    			props: {
    				key: /*key*/ ctx[12],
    				colon: /*context*/ ctx[14].colon,
    				isParentExpanded: /*isParentExpanded*/ ctx[2],
    				isParentArray: /*isParentArray*/ ctx[3]
    			},
    			$$inline: true
    		});

    	jsonkey.$on("click", /*toggleExpand*/ ctx[15]);
    	const if_block_creators = [create_if_block$1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*isParentExpanded*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			label_1 = element("label");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			create_component(jsonkey.$$.fragment);
    			t1 = space();
    			span1 = element("span");
    			span0 = element("span");
    			t2 = text(/*label*/ ctx[1]);
    			t3 = text(/*bracketOpen*/ ctx[5]);
    			t4 = space();
    			if_block1.c();
    			t5 = space();
    			span2 = element("span");
    			t6 = text(/*bracketClose*/ ctx[6]);
    			add_location(span0, file$7, 60, 34, 1504);
    			add_location(span1, file$7, 60, 4, 1474);
    			attr_dev(label_1, "class", "svelte-rwxv37");
    			add_location(label_1, file$7, 55, 2, 1253);
    			add_location(span2, file$7, 77, 2, 2112);
    			attr_dev(li, "class", "svelte-rwxv37");
    			toggle_class(li, "indent", /*isParentExpanded*/ ctx[2]);
    			add_location(li, file$7, 54, 0, 1214);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, label_1);
    			if (if_block0) if_block0.m(label_1, null);
    			append_dev(label_1, t0);
    			mount_component(jsonkey, label_1, null);
    			append_dev(label_1, t1);
    			append_dev(label_1, span1);
    			append_dev(span1, span0);
    			append_dev(span0, t2);
    			append_dev(span1, t3);
    			append_dev(li, t4);
    			if_blocks[current_block_type_index].m(li, null);
    			append_dev(li, t5);
    			append_dev(li, span2);
    			append_dev(span2, t6);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(span1, "click", /*toggleExpand*/ ctx[15], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*expandable*/ ctx[11] && /*isParentExpanded*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*expandable, isParentExpanded*/ 2052) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(label_1, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			const jsonkey_changes = {};
    			if (dirty & /*key*/ 4096) jsonkey_changes.key = /*key*/ ctx[12];
    			if (dirty & /*isParentExpanded*/ 4) jsonkey_changes.isParentExpanded = /*isParentExpanded*/ ctx[2];
    			if (dirty & /*isParentArray*/ 8) jsonkey_changes.isParentArray = /*isParentArray*/ ctx[3];
    			jsonkey.$set(jsonkey_changes);
    			if (!current || dirty & /*label*/ 2) set_data_dev(t2, /*label*/ ctx[1]);
    			if (!current || dirty & /*bracketOpen*/ 32) set_data_dev(t3, /*bracketOpen*/ ctx[5]);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				} else {
    					if_block1.p(ctx, dirty);
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(li, t5);
    			}

    			if (!current || dirty & /*bracketClose*/ 64) set_data_dev(t6, /*bracketClose*/ ctx[6]);

    			if (dirty & /*isParentExpanded*/ 4) {
    				toggle_class(li, "indent", /*isParentExpanded*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(jsonkey.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(jsonkey.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (if_block0) if_block0.d();
    			destroy_component(jsonkey);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("JSONNested", slots, []);

    	let { key } = $$props,
    		{ keys } = $$props,
    		{ colon = ":" } = $$props,
    		{ label = "" } = $$props,
    		{ isParentExpanded } = $$props,
    		{ isParentArray } = $$props,
    		{ isArray = false } = $$props,
    		{ bracketOpen } = $$props,
    		{ bracketClose } = $$props;

    	let { previewKeys = keys } = $$props;
    	let { getKey = key => key } = $$props;
    	let { getValue = key => key } = $$props;
    	let { getPreviewValue = getValue } = $$props;
    	let { expanded = false } = $$props, { expandable = true } = $$props;
    	const context = getContext(contextKey);
    	setContext(contextKey, { ...context, colon });

    	function toggleExpand() {
    		$$invalidate(0, expanded = !expanded);
    	}

    	function expand() {
    		$$invalidate(0, expanded = true);
    	}

    	const writable_props = [
    		"key",
    		"keys",
    		"colon",
    		"label",
    		"isParentExpanded",
    		"isParentArray",
    		"isArray",
    		"bracketOpen",
    		"bracketClose",
    		"previewKeys",
    		"getKey",
    		"getValue",
    		"getPreviewValue",
    		"expanded",
    		"expandable"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<JSONNested> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(12, key = $$props.key);
    		if ("keys" in $$props) $$invalidate(17, keys = $$props.keys);
    		if ("colon" in $$props) $$invalidate(18, colon = $$props.colon);
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("isParentExpanded" in $$props) $$invalidate(2, isParentExpanded = $$props.isParentExpanded);
    		if ("isParentArray" in $$props) $$invalidate(3, isParentArray = $$props.isParentArray);
    		if ("isArray" in $$props) $$invalidate(4, isArray = $$props.isArray);
    		if ("bracketOpen" in $$props) $$invalidate(5, bracketOpen = $$props.bracketOpen);
    		if ("bracketClose" in $$props) $$invalidate(6, bracketClose = $$props.bracketClose);
    		if ("previewKeys" in $$props) $$invalidate(7, previewKeys = $$props.previewKeys);
    		if ("getKey" in $$props) $$invalidate(8, getKey = $$props.getKey);
    		if ("getValue" in $$props) $$invalidate(9, getValue = $$props.getValue);
    		if ("getPreviewValue" in $$props) $$invalidate(10, getPreviewValue = $$props.getPreviewValue);
    		if ("expanded" in $$props) $$invalidate(0, expanded = $$props.expanded);
    		if ("expandable" in $$props) $$invalidate(11, expandable = $$props.expandable);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		contextKey,
    		JSONArrow,
    		JSONNode,
    		JSONKey,
    		key,
    		keys,
    		colon,
    		label,
    		isParentExpanded,
    		isParentArray,
    		isArray,
    		bracketOpen,
    		bracketClose,
    		previewKeys,
    		getKey,
    		getValue,
    		getPreviewValue,
    		expanded,
    		expandable,
    		context,
    		toggleExpand,
    		expand,
    		slicedKeys
    	});

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(12, key = $$props.key);
    		if ("keys" in $$props) $$invalidate(17, keys = $$props.keys);
    		if ("colon" in $$props) $$invalidate(18, colon = $$props.colon);
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("isParentExpanded" in $$props) $$invalidate(2, isParentExpanded = $$props.isParentExpanded);
    		if ("isParentArray" in $$props) $$invalidate(3, isParentArray = $$props.isParentArray);
    		if ("isArray" in $$props) $$invalidate(4, isArray = $$props.isArray);
    		if ("bracketOpen" in $$props) $$invalidate(5, bracketOpen = $$props.bracketOpen);
    		if ("bracketClose" in $$props) $$invalidate(6, bracketClose = $$props.bracketClose);
    		if ("previewKeys" in $$props) $$invalidate(7, previewKeys = $$props.previewKeys);
    		if ("getKey" in $$props) $$invalidate(8, getKey = $$props.getKey);
    		if ("getValue" in $$props) $$invalidate(9, getValue = $$props.getValue);
    		if ("getPreviewValue" in $$props) $$invalidate(10, getPreviewValue = $$props.getPreviewValue);
    		if ("expanded" in $$props) $$invalidate(0, expanded = $$props.expanded);
    		if ("expandable" in $$props) $$invalidate(11, expandable = $$props.expandable);
    		if ("slicedKeys" in $$props) $$invalidate(13, slicedKeys = $$props.slicedKeys);
    	};

    	let slicedKeys;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isParentExpanded*/ 4) {
    			 if (!isParentExpanded) {
    				$$invalidate(0, expanded = false);
    			}
    		}

    		if ($$self.$$.dirty & /*expanded, keys, previewKeys*/ 131201) {
    			 $$invalidate(13, slicedKeys = expanded ? keys : previewKeys.slice(0, 5));
    		}
    	};

    	return [
    		expanded,
    		label,
    		isParentExpanded,
    		isParentArray,
    		isArray,
    		bracketOpen,
    		bracketClose,
    		previewKeys,
    		getKey,
    		getValue,
    		getPreviewValue,
    		expandable,
    		key,
    		slicedKeys,
    		context,
    		toggleExpand,
    		expand,
    		keys,
    		colon
    	];
    }

    class JSONNested extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			key: 12,
    			keys: 17,
    			colon: 18,
    			label: 1,
    			isParentExpanded: 2,
    			isParentArray: 3,
    			isArray: 4,
    			bracketOpen: 5,
    			bracketClose: 6,
    			previewKeys: 7,
    			getKey: 8,
    			getValue: 9,
    			getPreviewValue: 10,
    			expanded: 0,
    			expandable: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "JSONNested",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[12] === undefined && !("key" in props)) {
    			console.warn("<JSONNested> was created without expected prop 'key'");
    		}

    		if (/*keys*/ ctx[17] === undefined && !("keys" in props)) {
    			console.warn("<JSONNested> was created without expected prop 'keys'");
    		}

    		if (/*isParentExpanded*/ ctx[2] === undefined && !("isParentExpanded" in props)) {
    			console.warn("<JSONNested> was created without expected prop 'isParentExpanded'");
    		}

    		if (/*isParentArray*/ ctx[3] === undefined && !("isParentArray" in props)) {
    			console.warn("<JSONNested> was created without expected prop 'isParentArray'");
    		}

    		if (/*bracketOpen*/ ctx[5] === undefined && !("bracketOpen" in props)) {
    			console.warn("<JSONNested> was created without expected prop 'bracketOpen'");
    		}

    		if (/*bracketClose*/ ctx[6] === undefined && !("bracketClose" in props)) {
    			console.warn("<JSONNested> was created without expected prop 'bracketClose'");
    		}
    	}

    	get key() {
    		throw new Error("<JSONNested>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<JSONNested>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get keys() {
    		throw new Error("<JSONNested>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set keys(value) {
    		throw new Error("<JSONNested>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colon() {
    		throw new Error("<JSONNested>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colon(value) {
    		throw new Error("<JSONNested>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<JSONNested>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<JSONNested>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isParentExpanded() {
    		throw new Error("<JSONNested>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isParentExpanded(value) {
    		throw new Error("<JSONNested>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isParentArray() {
    		throw new Error("<JSONNested>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isParentArray(value) {
    		throw new Error("<JSONNested>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isArray() {
    		throw new Error("<JSONNested>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isArray(value) {
    		throw new Error("<JSONNested>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bracketOpen() {
    		throw new Error("<JSONNested>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bracketOpen(value) {
    		throw new Error("<JSONNested>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bracketClose() {
    		throw new Error("<JSONNested>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bracketClose(value) {
    		throw new Error("<JSONNested>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get previewKeys() {
    		throw new Error("<JSONNested>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set previewKeys(value) {
    		throw new Error("<JSONNested>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getKey() {
    		throw new Error("<JSONNested>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getKey(value) {
    		throw new Error("<JSONNested>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getValue() {
    		throw new Error("<JSONNested>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getValue(value) {
    		throw new Error("<JSONNested>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getPreviewValue() {
    		throw new Error("<JSONNested>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getPreviewValue(value) {
    		throw new Error("<JSONNested>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get expanded() {
    		throw new Error("<JSONNested>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expanded(value) {
    		throw new Error("<JSONNested>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get expandable() {
    		throw new Error("<JSONNested>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expandable(value) {
    		throw new Error("<JSONNested>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-json-tree/src/JSONObjectNode.svelte generated by Svelte v3.31.0 */

    const { Object: Object_1 } = globals;

    function create_fragment$8(ctx) {
    	let jsonnested;
    	let current;

    	jsonnested = new JSONNested({
    			props: {
    				key: /*key*/ ctx[0],
    				expanded: /*expanded*/ ctx[4],
    				isParentExpanded: /*isParentExpanded*/ ctx[1],
    				isParentArray: /*isParentArray*/ ctx[2],
    				keys: /*keys*/ ctx[5],
    				previewKeys: /*keys*/ ctx[5],
    				getValue: /*getValue*/ ctx[6],
    				label: "" + (/*nodeType*/ ctx[3] + " "),
    				bracketOpen: "{",
    				bracketClose: "}"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(jsonnested.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(jsonnested, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const jsonnested_changes = {};
    			if (dirty & /*key*/ 1) jsonnested_changes.key = /*key*/ ctx[0];
    			if (dirty & /*expanded*/ 16) jsonnested_changes.expanded = /*expanded*/ ctx[4];
    			if (dirty & /*isParentExpanded*/ 2) jsonnested_changes.isParentExpanded = /*isParentExpanded*/ ctx[1];
    			if (dirty & /*isParentArray*/ 4) jsonnested_changes.isParentArray = /*isParentArray*/ ctx[2];
    			if (dirty & /*keys*/ 32) jsonnested_changes.keys = /*keys*/ ctx[5];
    			if (dirty & /*keys*/ 32) jsonnested_changes.previewKeys = /*keys*/ ctx[5];
    			if (dirty & /*nodeType*/ 8) jsonnested_changes.label = "" + (/*nodeType*/ ctx[3] + " ");
    			jsonnested.$set(jsonnested_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(jsonnested.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(jsonnested.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(jsonnested, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("JSONObjectNode", slots, []);

    	let { key } = $$props,
    		{ value } = $$props,
    		{ isParentExpanded } = $$props,
    		{ isParentArray } = $$props,
    		{ nodeType } = $$props;

    	let { expanded = false } = $$props;

    	function getValue(key) {
    		return value[key];
    	}

    	const writable_props = ["key", "value", "isParentExpanded", "isParentArray", "nodeType", "expanded"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<JSONObjectNode> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(0, key = $$props.key);
    		if ("value" in $$props) $$invalidate(7, value = $$props.value);
    		if ("isParentExpanded" in $$props) $$invalidate(1, isParentExpanded = $$props.isParentExpanded);
    		if ("isParentArray" in $$props) $$invalidate(2, isParentArray = $$props.isParentArray);
    		if ("nodeType" in $$props) $$invalidate(3, nodeType = $$props.nodeType);
    		if ("expanded" in $$props) $$invalidate(4, expanded = $$props.expanded);
    	};

    	$$self.$capture_state = () => ({
    		JSONNested,
    		key,
    		value,
    		isParentExpanded,
    		isParentArray,
    		nodeType,
    		expanded,
    		getValue,
    		keys
    	});

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(0, key = $$props.key);
    		if ("value" in $$props) $$invalidate(7, value = $$props.value);
    		if ("isParentExpanded" in $$props) $$invalidate(1, isParentExpanded = $$props.isParentExpanded);
    		if ("isParentArray" in $$props) $$invalidate(2, isParentArray = $$props.isParentArray);
    		if ("nodeType" in $$props) $$invalidate(3, nodeType = $$props.nodeType);
    		if ("expanded" in $$props) $$invalidate(4, expanded = $$props.expanded);
    		if ("keys" in $$props) $$invalidate(5, keys = $$props.keys);
    	};

    	let keys;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 128) {
    			 $$invalidate(5, keys = Object.getOwnPropertyNames(value));
    		}
    	};

    	return [
    		key,
    		isParentExpanded,
    		isParentArray,
    		nodeType,
    		expanded,
    		keys,
    		getValue,
    		value
    	];
    }

    class JSONObjectNode extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			key: 0,
    			value: 7,
    			isParentExpanded: 1,
    			isParentArray: 2,
    			nodeType: 3,
    			expanded: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "JSONObjectNode",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[0] === undefined && !("key" in props)) {
    			console.warn("<JSONObjectNode> was created without expected prop 'key'");
    		}

    		if (/*value*/ ctx[7] === undefined && !("value" in props)) {
    			console.warn("<JSONObjectNode> was created without expected prop 'value'");
    		}

    		if (/*isParentExpanded*/ ctx[1] === undefined && !("isParentExpanded" in props)) {
    			console.warn("<JSONObjectNode> was created without expected prop 'isParentExpanded'");
    		}

    		if (/*isParentArray*/ ctx[2] === undefined && !("isParentArray" in props)) {
    			console.warn("<JSONObjectNode> was created without expected prop 'isParentArray'");
    		}

    		if (/*nodeType*/ ctx[3] === undefined && !("nodeType" in props)) {
    			console.warn("<JSONObjectNode> was created without expected prop 'nodeType'");
    		}
    	}

    	get key() {
    		throw new Error("<JSONObjectNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<JSONObjectNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<JSONObjectNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<JSONObjectNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isParentExpanded() {
    		throw new Error("<JSONObjectNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isParentExpanded(value) {
    		throw new Error("<JSONObjectNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isParentArray() {
    		throw new Error("<JSONObjectNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isParentArray(value) {
    		throw new Error("<JSONObjectNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nodeType() {
    		throw new Error("<JSONObjectNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nodeType(value) {
    		throw new Error("<JSONObjectNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get expanded() {
    		throw new Error("<JSONObjectNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expanded(value) {
    		throw new Error("<JSONObjectNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-json-tree/src/JSONArrayNode.svelte generated by Svelte v3.31.0 */

    const { Object: Object_1$1 } = globals;

    function create_fragment$9(ctx) {
    	let jsonnested;
    	let current;

    	jsonnested = new JSONNested({
    			props: {
    				key: /*key*/ ctx[0],
    				expanded: /*expanded*/ ctx[4],
    				isParentExpanded: /*isParentExpanded*/ ctx[2],
    				isParentArray: /*isParentArray*/ ctx[3],
    				isArray: true,
    				keys: /*keys*/ ctx[5],
    				previewKeys: /*previewKeys*/ ctx[6],
    				getValue: /*getValue*/ ctx[7],
    				label: "Array(" + /*value*/ ctx[1].length + ")",
    				bracketOpen: "[",
    				bracketClose: "]"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(jsonnested.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(jsonnested, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const jsonnested_changes = {};
    			if (dirty & /*key*/ 1) jsonnested_changes.key = /*key*/ ctx[0];
    			if (dirty & /*expanded*/ 16) jsonnested_changes.expanded = /*expanded*/ ctx[4];
    			if (dirty & /*isParentExpanded*/ 4) jsonnested_changes.isParentExpanded = /*isParentExpanded*/ ctx[2];
    			if (dirty & /*isParentArray*/ 8) jsonnested_changes.isParentArray = /*isParentArray*/ ctx[3];
    			if (dirty & /*keys*/ 32) jsonnested_changes.keys = /*keys*/ ctx[5];
    			if (dirty & /*previewKeys*/ 64) jsonnested_changes.previewKeys = /*previewKeys*/ ctx[6];
    			if (dirty & /*value*/ 2) jsonnested_changes.label = "Array(" + /*value*/ ctx[1].length + ")";
    			jsonnested.$set(jsonnested_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(jsonnested.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(jsonnested.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(jsonnested, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("JSONArrayNode", slots, []);

    	let { key } = $$props,
    		{ value } = $$props,
    		{ isParentExpanded } = $$props,
    		{ isParentArray } = $$props;

    	let { expanded = false } = $$props;
    	const filteredKey = new Set(["length"]);

    	function getValue(key) {
    		return value[key];
    	}

    	const writable_props = ["key", "value", "isParentExpanded", "isParentArray", "expanded"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<JSONArrayNode> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(0, key = $$props.key);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("isParentExpanded" in $$props) $$invalidate(2, isParentExpanded = $$props.isParentExpanded);
    		if ("isParentArray" in $$props) $$invalidate(3, isParentArray = $$props.isParentArray);
    		if ("expanded" in $$props) $$invalidate(4, expanded = $$props.expanded);
    	};

    	$$self.$capture_state = () => ({
    		JSONNested,
    		key,
    		value,
    		isParentExpanded,
    		isParentArray,
    		expanded,
    		filteredKey,
    		getValue,
    		keys,
    		previewKeys
    	});

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(0, key = $$props.key);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("isParentExpanded" in $$props) $$invalidate(2, isParentExpanded = $$props.isParentExpanded);
    		if ("isParentArray" in $$props) $$invalidate(3, isParentArray = $$props.isParentArray);
    		if ("expanded" in $$props) $$invalidate(4, expanded = $$props.expanded);
    		if ("keys" in $$props) $$invalidate(5, keys = $$props.keys);
    		if ("previewKeys" in $$props) $$invalidate(6, previewKeys = $$props.previewKeys);
    	};

    	let keys;
    	let previewKeys;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 2) {
    			 $$invalidate(5, keys = Object.getOwnPropertyNames(value));
    		}

    		if ($$self.$$.dirty & /*keys*/ 32) {
    			 $$invalidate(6, previewKeys = keys.filter(key => !filteredKey.has(key)));
    		}
    	};

    	return [
    		key,
    		value,
    		isParentExpanded,
    		isParentArray,
    		expanded,
    		keys,
    		previewKeys,
    		getValue
    	];
    }

    class JSONArrayNode extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			key: 0,
    			value: 1,
    			isParentExpanded: 2,
    			isParentArray: 3,
    			expanded: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "JSONArrayNode",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[0] === undefined && !("key" in props)) {
    			console.warn("<JSONArrayNode> was created without expected prop 'key'");
    		}

    		if (/*value*/ ctx[1] === undefined && !("value" in props)) {
    			console.warn("<JSONArrayNode> was created without expected prop 'value'");
    		}

    		if (/*isParentExpanded*/ ctx[2] === undefined && !("isParentExpanded" in props)) {
    			console.warn("<JSONArrayNode> was created without expected prop 'isParentExpanded'");
    		}

    		if (/*isParentArray*/ ctx[3] === undefined && !("isParentArray" in props)) {
    			console.warn("<JSONArrayNode> was created without expected prop 'isParentArray'");
    		}
    	}

    	get key() {
    		throw new Error("<JSONArrayNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<JSONArrayNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<JSONArrayNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<JSONArrayNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isParentExpanded() {
    		throw new Error("<JSONArrayNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isParentExpanded(value) {
    		throw new Error("<JSONArrayNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isParentArray() {
    		throw new Error("<JSONArrayNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isParentArray(value) {
    		throw new Error("<JSONArrayNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get expanded() {
    		throw new Error("<JSONArrayNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expanded(value) {
    		throw new Error("<JSONArrayNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-json-tree/src/JSONIterableArrayNode.svelte generated by Svelte v3.31.0 */

    function create_fragment$a(ctx) {
    	let jsonnested;
    	let current;

    	jsonnested = new JSONNested({
    			props: {
    				key: /*key*/ ctx[0],
    				isParentExpanded: /*isParentExpanded*/ ctx[1],
    				isParentArray: /*isParentArray*/ ctx[2],
    				keys: /*keys*/ ctx[4],
    				getKey,
    				getValue,
    				isArray: true,
    				label: "" + (/*nodeType*/ ctx[3] + "(" + /*keys*/ ctx[4].length + ")"),
    				bracketOpen: "{",
    				bracketClose: "}"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(jsonnested.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(jsonnested, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const jsonnested_changes = {};
    			if (dirty & /*key*/ 1) jsonnested_changes.key = /*key*/ ctx[0];
    			if (dirty & /*isParentExpanded*/ 2) jsonnested_changes.isParentExpanded = /*isParentExpanded*/ ctx[1];
    			if (dirty & /*isParentArray*/ 4) jsonnested_changes.isParentArray = /*isParentArray*/ ctx[2];
    			if (dirty & /*keys*/ 16) jsonnested_changes.keys = /*keys*/ ctx[4];
    			if (dirty & /*nodeType, keys*/ 24) jsonnested_changes.label = "" + (/*nodeType*/ ctx[3] + "(" + /*keys*/ ctx[4].length + ")");
    			jsonnested.$set(jsonnested_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(jsonnested.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(jsonnested.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(jsonnested, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getKey(key) {
    	return String(key[0]);
    }

    function getValue(key) {
    	return key[1];
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("JSONIterableArrayNode", slots, []);

    	let { key } = $$props,
    		{ value } = $$props,
    		{ isParentExpanded } = $$props,
    		{ isParentArray } = $$props,
    		{ nodeType } = $$props;

    	let keys = [];
    	const writable_props = ["key", "value", "isParentExpanded", "isParentArray", "nodeType"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<JSONIterableArrayNode> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(0, key = $$props.key);
    		if ("value" in $$props) $$invalidate(5, value = $$props.value);
    		if ("isParentExpanded" in $$props) $$invalidate(1, isParentExpanded = $$props.isParentExpanded);
    		if ("isParentArray" in $$props) $$invalidate(2, isParentArray = $$props.isParentArray);
    		if ("nodeType" in $$props) $$invalidate(3, nodeType = $$props.nodeType);
    	};

    	$$self.$capture_state = () => ({
    		JSONNested,
    		key,
    		value,
    		isParentExpanded,
    		isParentArray,
    		nodeType,
    		keys,
    		getKey,
    		getValue
    	});

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(0, key = $$props.key);
    		if ("value" in $$props) $$invalidate(5, value = $$props.value);
    		if ("isParentExpanded" in $$props) $$invalidate(1, isParentExpanded = $$props.isParentExpanded);
    		if ("isParentArray" in $$props) $$invalidate(2, isParentArray = $$props.isParentArray);
    		if ("nodeType" in $$props) $$invalidate(3, nodeType = $$props.nodeType);
    		if ("keys" in $$props) $$invalidate(4, keys = $$props.keys);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 32) {
    			 {
    				let result = [];
    				let i = 0;

    				for (const entry of value) {
    					result.push([i++, entry]);
    				}

    				$$invalidate(4, keys = result);
    			}
    		}
    	};

    	return [key, isParentExpanded, isParentArray, nodeType, keys, value];
    }

    class JSONIterableArrayNode extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			key: 0,
    			value: 5,
    			isParentExpanded: 1,
    			isParentArray: 2,
    			nodeType: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "JSONIterableArrayNode",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[0] === undefined && !("key" in props)) {
    			console.warn("<JSONIterableArrayNode> was created without expected prop 'key'");
    		}

    		if (/*value*/ ctx[5] === undefined && !("value" in props)) {
    			console.warn("<JSONIterableArrayNode> was created without expected prop 'value'");
    		}

    		if (/*isParentExpanded*/ ctx[1] === undefined && !("isParentExpanded" in props)) {
    			console.warn("<JSONIterableArrayNode> was created without expected prop 'isParentExpanded'");
    		}

    		if (/*isParentArray*/ ctx[2] === undefined && !("isParentArray" in props)) {
    			console.warn("<JSONIterableArrayNode> was created without expected prop 'isParentArray'");
    		}

    		if (/*nodeType*/ ctx[3] === undefined && !("nodeType" in props)) {
    			console.warn("<JSONIterableArrayNode> was created without expected prop 'nodeType'");
    		}
    	}

    	get key() {
    		throw new Error("<JSONIterableArrayNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<JSONIterableArrayNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<JSONIterableArrayNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<JSONIterableArrayNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isParentExpanded() {
    		throw new Error("<JSONIterableArrayNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isParentExpanded(value) {
    		throw new Error("<JSONIterableArrayNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isParentArray() {
    		throw new Error("<JSONIterableArrayNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isParentArray(value) {
    		throw new Error("<JSONIterableArrayNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nodeType() {
    		throw new Error("<JSONIterableArrayNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nodeType(value) {
    		throw new Error("<JSONIterableArrayNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    class MapEntry {
      constructor(key, value) {
        this.key = key;
        this.value = value;
      }
    }

    /* node_modules/svelte-json-tree/src/JSONIterableMapNode.svelte generated by Svelte v3.31.0 */

    function create_fragment$b(ctx) {
    	let jsonnested;
    	let current;

    	jsonnested = new JSONNested({
    			props: {
    				key: /*key*/ ctx[0],
    				isParentExpanded: /*isParentExpanded*/ ctx[1],
    				isParentArray: /*isParentArray*/ ctx[2],
    				keys: /*keys*/ ctx[4],
    				getKey: getKey$1,
    				getValue: getValue$1,
    				label: "" + (/*nodeType*/ ctx[3] + "(" + /*keys*/ ctx[4].length + ")"),
    				colon: "",
    				bracketOpen: "{",
    				bracketClose: "}"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(jsonnested.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(jsonnested, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const jsonnested_changes = {};
    			if (dirty & /*key*/ 1) jsonnested_changes.key = /*key*/ ctx[0];
    			if (dirty & /*isParentExpanded*/ 2) jsonnested_changes.isParentExpanded = /*isParentExpanded*/ ctx[1];
    			if (dirty & /*isParentArray*/ 4) jsonnested_changes.isParentArray = /*isParentArray*/ ctx[2];
    			if (dirty & /*keys*/ 16) jsonnested_changes.keys = /*keys*/ ctx[4];
    			if (dirty & /*nodeType, keys*/ 24) jsonnested_changes.label = "" + (/*nodeType*/ ctx[3] + "(" + /*keys*/ ctx[4].length + ")");
    			jsonnested.$set(jsonnested_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(jsonnested.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(jsonnested.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(jsonnested, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getKey$1(entry) {
    	return entry[0];
    }

    function getValue$1(entry) {
    	return entry[1];
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("JSONIterableMapNode", slots, []);

    	let { key } = $$props,
    		{ value } = $$props,
    		{ isParentExpanded } = $$props,
    		{ isParentArray } = $$props,
    		{ nodeType } = $$props;

    	let keys = [];
    	const writable_props = ["key", "value", "isParentExpanded", "isParentArray", "nodeType"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<JSONIterableMapNode> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(0, key = $$props.key);
    		if ("value" in $$props) $$invalidate(5, value = $$props.value);
    		if ("isParentExpanded" in $$props) $$invalidate(1, isParentExpanded = $$props.isParentExpanded);
    		if ("isParentArray" in $$props) $$invalidate(2, isParentArray = $$props.isParentArray);
    		if ("nodeType" in $$props) $$invalidate(3, nodeType = $$props.nodeType);
    	};

    	$$self.$capture_state = () => ({
    		JSONNested,
    		MapEntry,
    		key,
    		value,
    		isParentExpanded,
    		isParentArray,
    		nodeType,
    		keys,
    		getKey: getKey$1,
    		getValue: getValue$1
    	});

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(0, key = $$props.key);
    		if ("value" in $$props) $$invalidate(5, value = $$props.value);
    		if ("isParentExpanded" in $$props) $$invalidate(1, isParentExpanded = $$props.isParentExpanded);
    		if ("isParentArray" in $$props) $$invalidate(2, isParentArray = $$props.isParentArray);
    		if ("nodeType" in $$props) $$invalidate(3, nodeType = $$props.nodeType);
    		if ("keys" in $$props) $$invalidate(4, keys = $$props.keys);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 32) {
    			 {
    				let result = [];
    				let i = 0;

    				for (const entry of value) {
    					result.push([i++, new MapEntry(entry[0], entry[1])]);
    				}

    				$$invalidate(4, keys = result);
    			}
    		}
    	};

    	return [key, isParentExpanded, isParentArray, nodeType, keys, value];
    }

    class JSONIterableMapNode extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			key: 0,
    			value: 5,
    			isParentExpanded: 1,
    			isParentArray: 2,
    			nodeType: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "JSONIterableMapNode",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[0] === undefined && !("key" in props)) {
    			console.warn("<JSONIterableMapNode> was created without expected prop 'key'");
    		}

    		if (/*value*/ ctx[5] === undefined && !("value" in props)) {
    			console.warn("<JSONIterableMapNode> was created without expected prop 'value'");
    		}

    		if (/*isParentExpanded*/ ctx[1] === undefined && !("isParentExpanded" in props)) {
    			console.warn("<JSONIterableMapNode> was created without expected prop 'isParentExpanded'");
    		}

    		if (/*isParentArray*/ ctx[2] === undefined && !("isParentArray" in props)) {
    			console.warn("<JSONIterableMapNode> was created without expected prop 'isParentArray'");
    		}

    		if (/*nodeType*/ ctx[3] === undefined && !("nodeType" in props)) {
    			console.warn("<JSONIterableMapNode> was created without expected prop 'nodeType'");
    		}
    	}

    	get key() {
    		throw new Error("<JSONIterableMapNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<JSONIterableMapNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<JSONIterableMapNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<JSONIterableMapNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isParentExpanded() {
    		throw new Error("<JSONIterableMapNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isParentExpanded(value) {
    		throw new Error("<JSONIterableMapNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isParentArray() {
    		throw new Error("<JSONIterableMapNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isParentArray(value) {
    		throw new Error("<JSONIterableMapNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nodeType() {
    		throw new Error("<JSONIterableMapNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nodeType(value) {
    		throw new Error("<JSONIterableMapNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-json-tree/src/JSONMapEntryNode.svelte generated by Svelte v3.31.0 */

    function create_fragment$c(ctx) {
    	let jsonnested;
    	let current;

    	jsonnested = new JSONNested({
    			props: {
    				expanded: /*expanded*/ ctx[4],
    				isParentExpanded: /*isParentExpanded*/ ctx[2],
    				isParentArray: /*isParentArray*/ ctx[3],
    				key: /*isParentExpanded*/ ctx[2]
    				? String(/*key*/ ctx[0])
    				: /*value*/ ctx[1].key,
    				keys: /*keys*/ ctx[5],
    				getValue: /*getValue*/ ctx[6],
    				label: /*isParentExpanded*/ ctx[2] ? "Entry " : "=> ",
    				bracketOpen: "{",
    				bracketClose: "}"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(jsonnested.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(jsonnested, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const jsonnested_changes = {};
    			if (dirty & /*expanded*/ 16) jsonnested_changes.expanded = /*expanded*/ ctx[4];
    			if (dirty & /*isParentExpanded*/ 4) jsonnested_changes.isParentExpanded = /*isParentExpanded*/ ctx[2];
    			if (dirty & /*isParentArray*/ 8) jsonnested_changes.isParentArray = /*isParentArray*/ ctx[3];

    			if (dirty & /*isParentExpanded, key, value*/ 7) jsonnested_changes.key = /*isParentExpanded*/ ctx[2]
    			? String(/*key*/ ctx[0])
    			: /*value*/ ctx[1].key;

    			if (dirty & /*isParentExpanded*/ 4) jsonnested_changes.label = /*isParentExpanded*/ ctx[2] ? "Entry " : "=> ";
    			jsonnested.$set(jsonnested_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(jsonnested.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(jsonnested.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(jsonnested, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("JSONMapEntryNode", slots, []);

    	let { key } = $$props,
    		{ value } = $$props,
    		{ isParentExpanded } = $$props,
    		{ isParentArray } = $$props;

    	let { expanded = false } = $$props;
    	const keys = ["key", "value"];

    	function getValue(key) {
    		return value[key];
    	}

    	const writable_props = ["key", "value", "isParentExpanded", "isParentArray", "expanded"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<JSONMapEntryNode> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(0, key = $$props.key);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("isParentExpanded" in $$props) $$invalidate(2, isParentExpanded = $$props.isParentExpanded);
    		if ("isParentArray" in $$props) $$invalidate(3, isParentArray = $$props.isParentArray);
    		if ("expanded" in $$props) $$invalidate(4, expanded = $$props.expanded);
    	};

    	$$self.$capture_state = () => ({
    		JSONNested,
    		key,
    		value,
    		isParentExpanded,
    		isParentArray,
    		expanded,
    		keys,
    		getValue
    	});

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(0, key = $$props.key);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("isParentExpanded" in $$props) $$invalidate(2, isParentExpanded = $$props.isParentExpanded);
    		if ("isParentArray" in $$props) $$invalidate(3, isParentArray = $$props.isParentArray);
    		if ("expanded" in $$props) $$invalidate(4, expanded = $$props.expanded);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [key, value, isParentExpanded, isParentArray, expanded, keys, getValue];
    }

    class JSONMapEntryNode extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
    			key: 0,
    			value: 1,
    			isParentExpanded: 2,
    			isParentArray: 3,
    			expanded: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "JSONMapEntryNode",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[0] === undefined && !("key" in props)) {
    			console.warn("<JSONMapEntryNode> was created without expected prop 'key'");
    		}

    		if (/*value*/ ctx[1] === undefined && !("value" in props)) {
    			console.warn("<JSONMapEntryNode> was created without expected prop 'value'");
    		}

    		if (/*isParentExpanded*/ ctx[2] === undefined && !("isParentExpanded" in props)) {
    			console.warn("<JSONMapEntryNode> was created without expected prop 'isParentExpanded'");
    		}

    		if (/*isParentArray*/ ctx[3] === undefined && !("isParentArray" in props)) {
    			console.warn("<JSONMapEntryNode> was created without expected prop 'isParentArray'");
    		}
    	}

    	get key() {
    		throw new Error("<JSONMapEntryNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<JSONMapEntryNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<JSONMapEntryNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<JSONMapEntryNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isParentExpanded() {
    		throw new Error("<JSONMapEntryNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isParentExpanded(value) {
    		throw new Error("<JSONMapEntryNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isParentArray() {
    		throw new Error("<JSONMapEntryNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isParentArray(value) {
    		throw new Error("<JSONMapEntryNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get expanded() {
    		throw new Error("<JSONMapEntryNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expanded(value) {
    		throw new Error("<JSONMapEntryNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-json-tree/src/JSONValueNode.svelte generated by Svelte v3.31.0 */
    const file$8 = "node_modules/svelte-json-tree/src/JSONValueNode.svelte";

    function create_fragment$d(ctx) {
    	let li;
    	let jsonkey;
    	let t0;
    	let span;

    	let t1_value = (/*valueGetter*/ ctx[2]
    	? /*valueGetter*/ ctx[2](/*value*/ ctx[1])
    	: /*value*/ ctx[1]) + "";

    	let t1;
    	let span_class_value;
    	let current;

    	jsonkey = new JSONKey({
    			props: {
    				key: /*key*/ ctx[0],
    				colon: /*colon*/ ctx[6],
    				isParentExpanded: /*isParentExpanded*/ ctx[3],
    				isParentArray: /*isParentArray*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(jsonkey.$$.fragment);
    			t0 = space();
    			span = element("span");
    			t1 = text(t1_value);
    			attr_dev(span, "class", span_class_value = "" + (null_to_empty(/*nodeType*/ ctx[5]) + " svelte-3bjyvl"));
    			add_location(span, file$8, 47, 2, 948);
    			attr_dev(li, "class", "svelte-3bjyvl");
    			toggle_class(li, "indent", /*isParentExpanded*/ ctx[3]);
    			add_location(li, file$8, 45, 0, 846);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(jsonkey, li, null);
    			append_dev(li, t0);
    			append_dev(li, span);
    			append_dev(span, t1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const jsonkey_changes = {};
    			if (dirty & /*key*/ 1) jsonkey_changes.key = /*key*/ ctx[0];
    			if (dirty & /*isParentExpanded*/ 8) jsonkey_changes.isParentExpanded = /*isParentExpanded*/ ctx[3];
    			if (dirty & /*isParentArray*/ 16) jsonkey_changes.isParentArray = /*isParentArray*/ ctx[4];
    			jsonkey.$set(jsonkey_changes);

    			if ((!current || dirty & /*valueGetter, value*/ 6) && t1_value !== (t1_value = (/*valueGetter*/ ctx[2]
    			? /*valueGetter*/ ctx[2](/*value*/ ctx[1])
    			: /*value*/ ctx[1]) + "")) set_data_dev(t1, t1_value);

    			if (!current || dirty & /*nodeType*/ 32 && span_class_value !== (span_class_value = "" + (null_to_empty(/*nodeType*/ ctx[5]) + " svelte-3bjyvl"))) {
    				attr_dev(span, "class", span_class_value);
    			}

    			if (dirty & /*isParentExpanded*/ 8) {
    				toggle_class(li, "indent", /*isParentExpanded*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(jsonkey.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(jsonkey.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(jsonkey);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("JSONValueNode", slots, []);

    	let { key } = $$props,
    		{ value } = $$props,
    		{ valueGetter = null } = $$props,
    		{ isParentExpanded } = $$props,
    		{ isParentArray } = $$props,
    		{ nodeType } = $$props;

    	const { colon } = getContext(contextKey);
    	const writable_props = ["key", "value", "valueGetter", "isParentExpanded", "isParentArray", "nodeType"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<JSONValueNode> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(0, key = $$props.key);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("valueGetter" in $$props) $$invalidate(2, valueGetter = $$props.valueGetter);
    		if ("isParentExpanded" in $$props) $$invalidate(3, isParentExpanded = $$props.isParentExpanded);
    		if ("isParentArray" in $$props) $$invalidate(4, isParentArray = $$props.isParentArray);
    		if ("nodeType" in $$props) $$invalidate(5, nodeType = $$props.nodeType);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		contextKey,
    		JSONKey,
    		key,
    		value,
    		valueGetter,
    		isParentExpanded,
    		isParentArray,
    		nodeType,
    		colon
    	});

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(0, key = $$props.key);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("valueGetter" in $$props) $$invalidate(2, valueGetter = $$props.valueGetter);
    		if ("isParentExpanded" in $$props) $$invalidate(3, isParentExpanded = $$props.isParentExpanded);
    		if ("isParentArray" in $$props) $$invalidate(4, isParentArray = $$props.isParentArray);
    		if ("nodeType" in $$props) $$invalidate(5, nodeType = $$props.nodeType);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [key, value, valueGetter, isParentExpanded, isParentArray, nodeType, colon];
    }

    class JSONValueNode extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			key: 0,
    			value: 1,
    			valueGetter: 2,
    			isParentExpanded: 3,
    			isParentArray: 4,
    			nodeType: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "JSONValueNode",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[0] === undefined && !("key" in props)) {
    			console.warn("<JSONValueNode> was created without expected prop 'key'");
    		}

    		if (/*value*/ ctx[1] === undefined && !("value" in props)) {
    			console.warn("<JSONValueNode> was created without expected prop 'value'");
    		}

    		if (/*isParentExpanded*/ ctx[3] === undefined && !("isParentExpanded" in props)) {
    			console.warn("<JSONValueNode> was created without expected prop 'isParentExpanded'");
    		}

    		if (/*isParentArray*/ ctx[4] === undefined && !("isParentArray" in props)) {
    			console.warn("<JSONValueNode> was created without expected prop 'isParentArray'");
    		}

    		if (/*nodeType*/ ctx[5] === undefined && !("nodeType" in props)) {
    			console.warn("<JSONValueNode> was created without expected prop 'nodeType'");
    		}
    	}

    	get key() {
    		throw new Error("<JSONValueNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<JSONValueNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<JSONValueNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<JSONValueNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get valueGetter() {
    		throw new Error("<JSONValueNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set valueGetter(value) {
    		throw new Error("<JSONValueNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isParentExpanded() {
    		throw new Error("<JSONValueNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isParentExpanded(value) {
    		throw new Error("<JSONValueNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isParentArray() {
    		throw new Error("<JSONValueNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isParentArray(value) {
    		throw new Error("<JSONValueNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nodeType() {
    		throw new Error("<JSONValueNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nodeType(value) {
    		throw new Error("<JSONValueNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-json-tree/src/ErrorNode.svelte generated by Svelte v3.31.0 */
    const file$9 = "node_modules/svelte-json-tree/src/ErrorNode.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (40:2) {#if isParentExpanded}
    function create_if_block_2$1(ctx) {
    	let jsonarrow;
    	let current;

    	jsonarrow = new JSONArrow({
    			props: { expanded: /*expanded*/ ctx[0] },
    			$$inline: true
    		});

    	jsonarrow.$on("click", /*toggleExpand*/ ctx[7]);

    	const block = {
    		c: function create() {
    			create_component(jsonarrow.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(jsonarrow, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const jsonarrow_changes = {};
    			if (dirty & /*expanded*/ 1) jsonarrow_changes.expanded = /*expanded*/ ctx[0];
    			jsonarrow.$set(jsonarrow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(jsonarrow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(jsonarrow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(jsonarrow, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(40:2) {#if isParentExpanded}",
    		ctx
    	});

    	return block;
    }

    // (45:2) {#if isParentExpanded}
    function create_if_block$2(ctx) {
    	let ul;
    	let current;
    	let if_block = /*expanded*/ ctx[0] && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			if (if_block) if_block.c();
    			attr_dev(ul, "class", "svelte-1ca3gb2");
    			toggle_class(ul, "collapse", !/*expanded*/ ctx[0]);
    			add_location(ul, file$9, 45, 4, 1134);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			if (if_block) if_block.m(ul, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*expanded*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*expanded*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(ul, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*expanded*/ 1) {
    				toggle_class(ul, "collapse", !/*expanded*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(45:2) {#if isParentExpanded}",
    		ctx
    	});

    	return block;
    }

    // (47:6) {#if expanded}
    function create_if_block_1$1(ctx) {
    	let jsonnode;
    	let t0;
    	let li;
    	let jsonkey;
    	let t1;
    	let span;
    	let current;

    	jsonnode = new JSONNode({
    			props: {
    				key: "message",
    				value: /*value*/ ctx[2].message
    			},
    			$$inline: true
    		});

    	jsonkey = new JSONKey({
    			props: {
    				key: "stack",
    				colon: ":",
    				isParentExpanded: /*isParentExpanded*/ ctx[3]
    			},
    			$$inline: true
    		});

    	let each_value = /*stack*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			create_component(jsonnode.$$.fragment);
    			t0 = space();
    			li = element("li");
    			create_component(jsonkey.$$.fragment);
    			t1 = space();
    			span = element("span");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(span, file$9, 50, 10, 1330);
    			attr_dev(li, "class", "svelte-1ca3gb2");
    			add_location(li, file$9, 48, 8, 1252);
    		},
    		m: function mount(target, anchor) {
    			mount_component(jsonnode, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, li, anchor);
    			mount_component(jsonkey, li, null);
    			append_dev(li, t1);
    			append_dev(li, span);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(span, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const jsonnode_changes = {};
    			if (dirty & /*value*/ 4) jsonnode_changes.value = /*value*/ ctx[2].message;
    			jsonnode.$set(jsonnode_changes);
    			const jsonkey_changes = {};
    			if (dirty & /*isParentExpanded*/ 8) jsonkey_changes.isParentExpanded = /*isParentExpanded*/ ctx[3];
    			jsonkey.$set(jsonkey_changes);

    			if (dirty & /*stack*/ 32) {
    				each_value = /*stack*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(span, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(jsonnode.$$.fragment, local);
    			transition_in(jsonkey.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(jsonnode.$$.fragment, local);
    			transition_out(jsonkey.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(jsonnode, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(li);
    			destroy_component(jsonkey);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(47:6) {#if expanded}",
    		ctx
    	});

    	return block;
    }

    // (52:12) {#each stack as line, index}
    function create_each_block$2(ctx) {
    	let span;
    	let t_value = /*line*/ ctx[8] + "";
    	let t;
    	let br;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			br = element("br");
    			attr_dev(span, "class", "svelte-1ca3gb2");
    			toggle_class(span, "indent", /*index*/ ctx[10] > 0);
    			add_location(span, file$9, 52, 14, 1392);
    			add_location(br, file$9, 52, 58, 1436);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    			insert_dev(target, br, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*stack*/ 32 && t_value !== (t_value = /*line*/ ctx[8] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(52:12) {#each stack as line, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let li;
    	let t0;
    	let jsonkey;
    	let t1;
    	let span;
    	let t2;
    	let t3_value = (/*expanded*/ ctx[0] ? "" : /*value*/ ctx[2].message) + "";
    	let t3;
    	let t4;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*isParentExpanded*/ ctx[3] && create_if_block_2$1(ctx);

    	jsonkey = new JSONKey({
    			props: {
    				key: /*key*/ ctx[1],
    				colon: /*context*/ ctx[6].colon,
    				isParentExpanded: /*isParentExpanded*/ ctx[3],
    				isParentArray: /*isParentArray*/ ctx[4]
    			},
    			$$inline: true
    		});

    	let if_block1 = /*isParentExpanded*/ ctx[3] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			create_component(jsonkey.$$.fragment);
    			t1 = space();
    			span = element("span");
    			t2 = text("Error: ");
    			t3 = text(t3_value);
    			t4 = space();
    			if (if_block1) if_block1.c();
    			add_location(span, file$9, 43, 2, 1033);
    			attr_dev(li, "class", "svelte-1ca3gb2");
    			toggle_class(li, "indent", /*isParentExpanded*/ ctx[3]);
    			add_location(li, file$9, 38, 0, 831);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			if (if_block0) if_block0.m(li, null);
    			append_dev(li, t0);
    			mount_component(jsonkey, li, null);
    			append_dev(li, t1);
    			append_dev(li, span);
    			append_dev(span, t2);
    			append_dev(span, t3);
    			append_dev(li, t4);
    			if (if_block1) if_block1.m(li, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*toggleExpand*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isParentExpanded*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*isParentExpanded*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(li, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			const jsonkey_changes = {};
    			if (dirty & /*key*/ 2) jsonkey_changes.key = /*key*/ ctx[1];
    			if (dirty & /*isParentExpanded*/ 8) jsonkey_changes.isParentExpanded = /*isParentExpanded*/ ctx[3];
    			if (dirty & /*isParentArray*/ 16) jsonkey_changes.isParentArray = /*isParentArray*/ ctx[4];
    			jsonkey.$set(jsonkey_changes);
    			if ((!current || dirty & /*expanded, value*/ 5) && t3_value !== (t3_value = (/*expanded*/ ctx[0] ? "" : /*value*/ ctx[2].message) + "")) set_data_dev(t3, t3_value);

    			if (/*isParentExpanded*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*isParentExpanded*/ 8) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(li, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*isParentExpanded*/ 8) {
    				toggle_class(li, "indent", /*isParentExpanded*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(jsonkey.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(jsonkey.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (if_block0) if_block0.d();
    			destroy_component(jsonkey);
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ErrorNode", slots, []);

    	let { key } = $$props,
    		{ value } = $$props,
    		{ isParentExpanded } = $$props,
    		{ isParentArray } = $$props;

    	let { expanded = false } = $$props;
    	const context = getContext(contextKey);
    	setContext(contextKey, { ...context, colon: ":" });

    	function toggleExpand() {
    		$$invalidate(0, expanded = !expanded);
    	}

    	const writable_props = ["key", "value", "isParentExpanded", "isParentArray", "expanded"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ErrorNode> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(1, key = $$props.key);
    		if ("value" in $$props) $$invalidate(2, value = $$props.value);
    		if ("isParentExpanded" in $$props) $$invalidate(3, isParentExpanded = $$props.isParentExpanded);
    		if ("isParentArray" in $$props) $$invalidate(4, isParentArray = $$props.isParentArray);
    		if ("expanded" in $$props) $$invalidate(0, expanded = $$props.expanded);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		contextKey,
    		JSONArrow,
    		JSONNode,
    		JSONKey,
    		key,
    		value,
    		isParentExpanded,
    		isParentArray,
    		expanded,
    		context,
    		toggleExpand,
    		stack
    	});

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(1, key = $$props.key);
    		if ("value" in $$props) $$invalidate(2, value = $$props.value);
    		if ("isParentExpanded" in $$props) $$invalidate(3, isParentExpanded = $$props.isParentExpanded);
    		if ("isParentArray" in $$props) $$invalidate(4, isParentArray = $$props.isParentArray);
    		if ("expanded" in $$props) $$invalidate(0, expanded = $$props.expanded);
    		if ("stack" in $$props) $$invalidate(5, stack = $$props.stack);
    	};

    	let stack;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 4) {
    			 $$invalidate(5, stack = value.stack.split("\n"));
    		}

    		if ($$self.$$.dirty & /*isParentExpanded*/ 8) {
    			 if (!isParentExpanded) {
    				$$invalidate(0, expanded = false);
    			}
    		}
    	};

    	return [
    		expanded,
    		key,
    		value,
    		isParentExpanded,
    		isParentArray,
    		stack,
    		context,
    		toggleExpand
    	];
    }

    class ErrorNode extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			key: 1,
    			value: 2,
    			isParentExpanded: 3,
    			isParentArray: 4,
    			expanded: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ErrorNode",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[1] === undefined && !("key" in props)) {
    			console.warn("<ErrorNode> was created without expected prop 'key'");
    		}

    		if (/*value*/ ctx[2] === undefined && !("value" in props)) {
    			console.warn("<ErrorNode> was created without expected prop 'value'");
    		}

    		if (/*isParentExpanded*/ ctx[3] === undefined && !("isParentExpanded" in props)) {
    			console.warn("<ErrorNode> was created without expected prop 'isParentExpanded'");
    		}

    		if (/*isParentArray*/ ctx[4] === undefined && !("isParentArray" in props)) {
    			console.warn("<ErrorNode> was created without expected prop 'isParentArray'");
    		}
    	}

    	get key() {
    		throw new Error("<ErrorNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<ErrorNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ErrorNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ErrorNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isParentExpanded() {
    		throw new Error("<ErrorNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isParentExpanded(value) {
    		throw new Error("<ErrorNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isParentArray() {
    		throw new Error("<ErrorNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isParentArray(value) {
    		throw new Error("<ErrorNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get expanded() {
    		throw new Error("<ErrorNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expanded(value) {
    		throw new Error("<ErrorNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function objType(obj) {
      const type = Object.prototype.toString.call(obj).slice(8, -1);
      if (type === 'Object') {
        if (typeof obj[Symbol.iterator] === 'function') {
          return 'Iterable';
        }
        return obj.constructor.name;
      }

      return type;
    }

    /* node_modules/svelte-json-tree/src/JSONNode.svelte generated by Svelte v3.31.0 */

    function create_fragment$f(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*componentType*/ ctx[5];

    	function switch_props(ctx) {
    		return {
    			props: {
    				key: /*key*/ ctx[0],
    				value: /*value*/ ctx[1],
    				isParentExpanded: /*isParentExpanded*/ ctx[2],
    				isParentArray: /*isParentArray*/ ctx[3],
    				nodeType: /*nodeType*/ ctx[4],
    				valueGetter: /*valueGetter*/ ctx[6]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const switch_instance_changes = {};
    			if (dirty & /*key*/ 1) switch_instance_changes.key = /*key*/ ctx[0];
    			if (dirty & /*value*/ 2) switch_instance_changes.value = /*value*/ ctx[1];
    			if (dirty & /*isParentExpanded*/ 4) switch_instance_changes.isParentExpanded = /*isParentExpanded*/ ctx[2];
    			if (dirty & /*isParentArray*/ 8) switch_instance_changes.isParentArray = /*isParentArray*/ ctx[3];
    			if (dirty & /*nodeType*/ 16) switch_instance_changes.nodeType = /*nodeType*/ ctx[4];
    			if (dirty & /*valueGetter*/ 64) switch_instance_changes.valueGetter = /*valueGetter*/ ctx[6];

    			if (switch_value !== (switch_value = /*componentType*/ ctx[5])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("JSONNode", slots, []);

    	let { key } = $$props,
    		{ value } = $$props,
    		{ isParentExpanded } = $$props,
    		{ isParentArray } = $$props;

    	function getComponent(nodeType) {
    		switch (nodeType) {
    			case "Object":
    				return JSONObjectNode;
    			case "Error":
    				return ErrorNode;
    			case "Array":
    				return JSONArrayNode;
    			case "Iterable":
    			case "Map":
    			case "Set":
    				return typeof value.set === "function"
    				? JSONIterableMapNode
    				: JSONIterableArrayNode;
    			case "MapEntry":
    				return JSONMapEntryNode;
    			default:
    				return JSONValueNode;
    		}
    	}

    	function getValueGetter(nodeType) {
    		switch (nodeType) {
    			case "Object":
    			case "Error":
    			case "Array":
    			case "Iterable":
    			case "Map":
    			case "Set":
    			case "MapEntry":
    			case "Number":
    				return undefined;
    			case "String":
    				return raw => `"${raw}"`;
    			case "Boolean":
    				return raw => raw ? "true" : "false";
    			case "Date":
    				return raw => raw.toISOString();
    			case "Null":
    				return () => "null";
    			case "Undefined":
    				return () => "undefined";
    			case "Function":
    			case "Symbol":
    				return raw => raw.toString();
    			default:
    				return () => `<${nodeType}>`;
    		}
    	}

    	const writable_props = ["key", "value", "isParentExpanded", "isParentArray"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<JSONNode> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(0, key = $$props.key);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("isParentExpanded" in $$props) $$invalidate(2, isParentExpanded = $$props.isParentExpanded);
    		if ("isParentArray" in $$props) $$invalidate(3, isParentArray = $$props.isParentArray);
    	};

    	$$self.$capture_state = () => ({
    		JSONObjectNode,
    		JSONArrayNode,
    		JSONIterableArrayNode,
    		JSONIterableMapNode,
    		JSONMapEntryNode,
    		JSONValueNode,
    		ErrorNode,
    		objType,
    		key,
    		value,
    		isParentExpanded,
    		isParentArray,
    		getComponent,
    		getValueGetter,
    		nodeType,
    		componentType,
    		valueGetter
    	});

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(0, key = $$props.key);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("isParentExpanded" in $$props) $$invalidate(2, isParentExpanded = $$props.isParentExpanded);
    		if ("isParentArray" in $$props) $$invalidate(3, isParentArray = $$props.isParentArray);
    		if ("nodeType" in $$props) $$invalidate(4, nodeType = $$props.nodeType);
    		if ("componentType" in $$props) $$invalidate(5, componentType = $$props.componentType);
    		if ("valueGetter" in $$props) $$invalidate(6, valueGetter = $$props.valueGetter);
    	};

    	let nodeType;
    	let componentType;
    	let valueGetter;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 2) {
    			 $$invalidate(4, nodeType = objType(value));
    		}

    		if ($$self.$$.dirty & /*nodeType*/ 16) {
    			 $$invalidate(5, componentType = getComponent(nodeType));
    		}

    		if ($$self.$$.dirty & /*nodeType*/ 16) {
    			 $$invalidate(6, valueGetter = getValueGetter(nodeType));
    		}
    	};

    	return [
    		key,
    		value,
    		isParentExpanded,
    		isParentArray,
    		nodeType,
    		componentType,
    		valueGetter
    	];
    }

    class JSONNode extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			key: 0,
    			value: 1,
    			isParentExpanded: 2,
    			isParentArray: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "JSONNode",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[0] === undefined && !("key" in props)) {
    			console.warn("<JSONNode> was created without expected prop 'key'");
    		}

    		if (/*value*/ ctx[1] === undefined && !("value" in props)) {
    			console.warn("<JSONNode> was created without expected prop 'value'");
    		}

    		if (/*isParentExpanded*/ ctx[2] === undefined && !("isParentExpanded" in props)) {
    			console.warn("<JSONNode> was created without expected prop 'isParentExpanded'");
    		}

    		if (/*isParentArray*/ ctx[3] === undefined && !("isParentArray" in props)) {
    			console.warn("<JSONNode> was created without expected prop 'isParentArray'");
    		}
    	}

    	get key() {
    		throw new Error("<JSONNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<JSONNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<JSONNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<JSONNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isParentExpanded() {
    		throw new Error("<JSONNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isParentExpanded(value) {
    		throw new Error("<JSONNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isParentArray() {
    		throw new Error("<JSONNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isParentArray(value) {
    		throw new Error("<JSONNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-json-tree/src/Root.svelte generated by Svelte v3.31.0 */
    const file$a = "node_modules/svelte-json-tree/src/Root.svelte";

    function create_fragment$g(ctx) {
    	let ul;
    	let jsonnode;
    	let current;

    	jsonnode = new JSONNode({
    			props: {
    				key: /*key*/ ctx[0],
    				value: /*value*/ ctx[1],
    				isParentExpanded: true,
    				isParentArray: false
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			create_component(jsonnode.$$.fragment);
    			attr_dev(ul, "class", "svelte-773n60");
    			add_location(ul, file$a, 37, 0, 1295);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			mount_component(jsonnode, ul, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const jsonnode_changes = {};
    			if (dirty & /*key*/ 1) jsonnode_changes.key = /*key*/ ctx[0];
    			if (dirty & /*value*/ 2) jsonnode_changes.value = /*value*/ ctx[1];
    			jsonnode.$set(jsonnode_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(jsonnode.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(jsonnode.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_component(jsonnode);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Root", slots, []);
    	setContext(contextKey, {});
    	let { key = "" } = $$props, { value } = $$props;
    	const writable_props = ["key", "value"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Root> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(0, key = $$props.key);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({
    		JSONNode,
    		setContext,
    		contextKey,
    		key,
    		value
    	});

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(0, key = $$props.key);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [key, value];
    }

    class Root extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { key: 0, value: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Root",
    			options,
    			id: create_fragment$g.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[1] === undefined && !("value" in props)) {
    			console.warn("<Root> was created without expected prop 'value'");
    		}
    	}

    	get key() {
    		throw new Error("<Root>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<Root>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Root>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Root>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ButtonIcon.svelte generated by Svelte v3.31.0 */

    const file$b = "src/components/ButtonIcon.svelte";

    function create_fragment$h(ctx) {
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "class", "svelte-1t1iahb");
    			add_location(button, file$b, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ButtonIcon", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ButtonIcon> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots, click_handler];
    }

    class ButtonIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ButtonIcon",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /**
     * A writable store of the URL hash
     * @returns {import('svelte/store').Writable<string>}
     */
    function hashStore() {
      const hash = readable(window.location.hash, set => {
        const update = () => set(window.location.hash);
        window.addEventListener('hashchange', update);
        return () => window.removeEventListener('hashchange', update);
      });

      return {
        subscribe: hash.subscribe,
        set: v => (window.location.hash = v),
        update: fn => set(fn(window.location.hash))
      };
    }

    const hash$1 = hashStore();

    /* src/views/RawJSONDialog.svelte generated by Svelte v3.31.0 */
    const file$c = "src/views/RawJSONDialog.svelte";

    // (23:12) <ButtonIcon on:click={closeDialog}>
    function create_default_slot$1(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M6.2253 4.81108C5.83477 4.42056 5.20161 4.42056 4.81108 4.81108C4.42056 5.20161 4.42056 5.83477 4.81108 6.2253L10.5858 12L4.81114 17.7747C4.42062 18.1652 4.42062 18.7984 4.81114 19.1889C5.20167 19.5794 5.83483 19.5794 6.22535 19.1889L12 13.4142L17.7747 19.1889C18.1652 19.5794 18.7984 19.5794 19.1889 19.1889C19.5794 18.7984 19.5794 18.1652 19.1889 17.7747L13.4142 12L19.189 6.2253C19.5795 5.83477 19.5795 5.20161 19.189 4.81108C18.7985 4.42056 18.1653 4.42056 17.7748 4.81108L12 10.5858L6.2253 4.81108Z");
    			attr_dev(path, "fill", "currentColor");
    			add_location(path, file$c, 25, 16, 981);
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$c, 24, 14, 869);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(23:12) <ButtonIcon on:click={closeDialog}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let div6;
    	let div5;
    	let div4;
    	let div3;
    	let div2;
    	let div0;
    	let h1;
    	let t1;
    	let buttonicon;
    	let t2;
    	let div1;
    	let jsontree;
    	let div5_intro;
    	let div5_outro;
    	let div6_transition;
    	let t3;
    	let div7;
    	let current;
    	let mounted;
    	let dispose;

    	buttonicon = new ButtonIcon({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	buttonicon.$on("click", /*closeDialog*/ ctx[1]);

    	jsontree = new Root({
    			props: { value: /*data*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Raw JSON";
    			t1 = space();
    			create_component(buttonicon.$$.fragment);
    			t2 = space();
    			div1 = element("div");
    			create_component(jsontree.$$.fragment);
    			t3 = space();
    			div7 = element("div");
    			attr_dev(h1, "class", "svelte-3athcr");
    			add_location(h1, file$c, 21, 12, 745);
    			attr_dev(div0, "class", "dialog__header svelte-3athcr");
    			add_location(div0, file$c, 20, 10, 704);
    			attr_dev(div1, "class", "dialog__content svelte-3athcr");
    			add_location(div1, file$c, 32, 10, 1644);
    			attr_dev(div2, "class", "dialog svelte-3athcr");
    			add_location(div2, file$c, 19, 8, 673);
    			attr_dev(div3, "class", "view-container svelte-3athcr");
    			add_location(div3, file$c, 18, 6, 636);
    			attr_dev(div4, "class", "dialog-container svelte-3athcr");
    			add_location(div4, file$c, 17, 4, 599);
    			add_location(div5, file$c, 16, 2, 473);
    			attr_dev(div6, "class", "dialog-backdrop svelte-3athcr");
    			add_location(div6, file$c, 15, 0, 377);
    			add_location(div7, file$c, 40, 0, 1784);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			mount_component(buttonicon, div0, null);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			mount_component(jsontree, div1, null);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div7, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div6, "click", self$1(/*closeDialog*/ ctx[1]), false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			const buttonicon_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				buttonicon_changes.$$scope = { dirty, ctx };
    			}

    			buttonicon.$set(buttonicon_changes);
    			const jsontree_changes = {};
    			if (dirty & /*data*/ 1) jsontree_changes.value = /*data*/ ctx[0];
    			jsontree.$set(jsontree_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(buttonicon.$$.fragment, local);
    			transition_in(jsontree.$$.fragment, local);

    			add_render_callback(() => {
    				if (div5_outro) div5_outro.end(1);

    				if (!div5_intro) div5_intro = create_in_transition(div5, scale, {
    					start: 0.9,
    					easing: backOut,
    					duration: 200
    				});

    				div5_intro.start();
    			});

    			add_render_callback(() => {
    				if (!div6_transition) div6_transition = create_bidirectional_transition(div6, fade, { duration: 150 }, true);
    				div6_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(buttonicon.$$.fragment, local);
    			transition_out(jsontree.$$.fragment, local);
    			if (div5_intro) div5_intro.invalidate();

    			div5_outro = create_out_transition(div5, scale, {
    				start: 0.9,
    				easing: quadIn,
    				duration: 150
    			});

    			if (!div6_transition) div6_transition = create_bidirectional_transition(div6, fade, { duration: 150 }, false);
    			div6_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_component(buttonicon);
    			destroy_component(jsontree);
    			if (detaching && div5_outro) div5_outro.end();
    			if (detaching && div6_transition) div6_transition.end();
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div7);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let $hash;
    	validate_store(hash$1, "hash");
    	component_subscribe($$self, hash$1, $$value => $$invalidate(2, $hash = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("RawJSONDialog", slots, []);
    	let { data = true } = $$props;

    	// Dialog only opens when `#json`
    	function closeDialog() {
    		set_store_value(hash$1, $hash = "", $hash);
    	}

    	const writable_props = ["data"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<RawJSONDialog> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({
    		scale,
    		fade,
    		backOut,
    		quadIn,
    		JSONTree: Root,
    		ButtonIcon,
    		hash: hash$1,
    		data,
    		closeDialog,
    		$hash
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, closeDialog];
    }

    class RawJSONDialog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RawJSONDialog",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get data() {
    		throw new Error("<RawJSONDialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<RawJSONDialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/tables/NearbyDevicesTable.svelte generated by Svelte v3.31.0 */

    const file$d = "src/tables/NearbyDevicesTable.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (35:4) {:else}
    function create_else_block$1(ctx) {
    	let tr;
    	let td;
    	let t1;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td = element("td");
    			td.textContent = "No nearby devices found";
    			t1 = space();
    			attr_dev(td, "class", "table-empty-text svelte-1u7sob6");
    			attr_dev(td, "colspan", "100");
    			add_location(td, file$d, 36, 8, 1009);
    			add_location(tr, file$d, 35, 6, 996);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td);
    			append_dev(tr, t1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(35:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (22:10) {#if row.thisDevice}
    function create_if_block$3(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "this";
    			attr_dev(span, "class", "svelte-1u7sob6");
    			add_location(span, file$d, 22, 12, 425);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(22:10) {#if row.thisDevice}",
    		ctx
    	});

    	return block;
    }

    // (19:4) {#each data as row}
    function create_each_block$3(ctx) {
    	let tr;
    	let td0;
    	let t0;
    	let t1_value = /*row*/ ctx[1].deviceName + "";
    	let t1;
    	let t2;
    	let td1;
    	let span;

    	let t3_value = (/*row*/ ctx[1].versionCompareSymbol
    	? /*row*/ ctx[1].versionCompareSymbol
    	: "") + "";

    	let t3;
    	let t4;
    	let t5_value = /*row*/ ctx[1].dmtVersion + "";
    	let t5;
    	let t6;
    	let td2;
    	let t7_value = /*row*/ ctx[1].ip + "";
    	let t7;
    	let t8;
    	let td3;
    	let t9_value = /*row*/ ctx[1].platform + "";
    	let t9;
    	let t10;
    	let td4;
    	let t11_value = /*row*/ ctx[1].uptime + "";
    	let t11;
    	let t12;
    	let td5;
    	let t13_value = /*row*/ ctx[1].username + "";
    	let t13;
    	let t14;
    	let td6;
    	let t15_value = (/*row*/ ctx[1].apssid ? /*row*/ ctx[1].apssid : "/") + "";
    	let t15;
    	let t16;
    	let td7;
    	let t17_value = /*row*/ ctx[1].deviceKey.substring(0, 8) + "";
    	let t17;
    	let t18;
    	let td7_title_value;
    	let t19;
    	let if_block = /*row*/ ctx[1].thisDevice && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			if (if_block) if_block.c();
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			td1 = element("td");
    			span = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			t5 = text(t5_value);
    			t6 = space();
    			td2 = element("td");
    			t7 = text(t7_value);
    			t8 = space();
    			td3 = element("td");
    			t9 = text(t9_value);
    			t10 = space();
    			td4 = element("td");
    			t11 = text(t11_value);
    			t12 = space();
    			td5 = element("td");
    			t13 = text(t13_value);
    			t14 = space();
    			td6 = element("td");
    			t15 = text(t15_value);
    			t16 = space();
    			td7 = element("td");
    			t17 = text(t17_value);
    			t18 = text("...");
    			t19 = space();
    			attr_dev(td0, "class", "device_name svelte-1u7sob6");
    			add_location(td0, file$d, 20, 8, 357);
    			attr_dev(span, "class", "svelte-1u7sob6");
    			add_location(span, file$d, 26, 32, 532);
    			attr_dev(td1, "class", "dmt_version svelte-1u7sob6");
    			add_location(td1, file$d, 26, 8, 508);
    			attr_dev(td2, "class", "device_ip svelte-1u7sob6");
    			add_location(td2, file$d, 27, 8, 634);
    			attr_dev(td3, "class", "platform svelte-1u7sob6");
    			add_location(td3, file$d, 28, 8, 678);
    			attr_dev(td4, "class", "uptime svelte-1u7sob6");
    			add_location(td4, file$d, 29, 8, 727);
    			attr_dev(td5, "class", "user svelte-1u7sob6");
    			add_location(td5, file$d, 30, 8, 772);
    			attr_dev(td6, "class", "apssid svelte-1u7sob6");
    			add_location(td6, file$d, 31, 8, 817);
    			attr_dev(td7, "class", "device_key svelte-1u7sob6");
    			attr_dev(td7, "title", td7_title_value = /*row*/ ctx[1].deviceKey);
    			add_location(td7, file$d, 32, 8, 881);
    			toggle_class(tr, "stale", /*row*/ ctx[1].stale);
    			add_location(tr, file$d, 19, 6, 320);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			if (if_block) if_block.m(td0, null);
    			append_dev(td0, t0);
    			append_dev(td0, t1);
    			append_dev(tr, t2);
    			append_dev(tr, td1);
    			append_dev(td1, span);
    			append_dev(span, t3);
    			append_dev(td1, t4);
    			append_dev(td1, t5);
    			append_dev(tr, t6);
    			append_dev(tr, td2);
    			append_dev(td2, t7);
    			append_dev(tr, t8);
    			append_dev(tr, td3);
    			append_dev(td3, t9);
    			append_dev(tr, t10);
    			append_dev(tr, td4);
    			append_dev(td4, t11);
    			append_dev(tr, t12);
    			append_dev(tr, td5);
    			append_dev(td5, t13);
    			append_dev(tr, t14);
    			append_dev(tr, td6);
    			append_dev(td6, t15);
    			append_dev(tr, t16);
    			append_dev(tr, td7);
    			append_dev(td7, t17);
    			append_dev(td7, t18);
    			append_dev(tr, t19);
    		},
    		p: function update(ctx, dirty) {
    			if (/*row*/ ctx[1].thisDevice) {
    				if (if_block) ; else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(td0, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*data*/ 1 && t1_value !== (t1_value = /*row*/ ctx[1].deviceName + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*data*/ 1 && t3_value !== (t3_value = (/*row*/ ctx[1].versionCompareSymbol
    			? /*row*/ ctx[1].versionCompareSymbol
    			: "") + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*data*/ 1 && t5_value !== (t5_value = /*row*/ ctx[1].dmtVersion + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*data*/ 1 && t7_value !== (t7_value = /*row*/ ctx[1].ip + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*data*/ 1 && t9_value !== (t9_value = /*row*/ ctx[1].platform + "")) set_data_dev(t9, t9_value);
    			if (dirty & /*data*/ 1 && t11_value !== (t11_value = /*row*/ ctx[1].uptime + "")) set_data_dev(t11, t11_value);
    			if (dirty & /*data*/ 1 && t13_value !== (t13_value = /*row*/ ctx[1].username + "")) set_data_dev(t13, t13_value);
    			if (dirty & /*data*/ 1 && t15_value !== (t15_value = (/*row*/ ctx[1].apssid ? /*row*/ ctx[1].apssid : "/") + "")) set_data_dev(t15, t15_value);
    			if (dirty & /*data*/ 1 && t17_value !== (t17_value = /*row*/ ctx[1].deviceKey.substring(0, 8) + "")) set_data_dev(t17, t17_value);

    			if (dirty & /*data*/ 1 && td7_title_value !== (td7_title_value = /*row*/ ctx[1].deviceKey)) {
    				attr_dev(td7, "title", td7_title_value);
    			}

    			if (dirty & /*data*/ 1) {
    				toggle_class(tr, "stale", /*row*/ ctx[1].stale);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(19:4) {#each data as row}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let th6;
    	let t13;
    	let th7;
    	let t15;
    	let tbody;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$1(ctx);
    	}

    	const block = {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Device";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "DMT version";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Local IP";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Platform";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Uptime";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "User";
    			t11 = space();
    			th6 = element("th");
    			th6.textContent = "AP SSID";
    			t13 = space();
    			th7 = element("th");
    			th7.textContent = "Device key";
    			t15 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			add_location(th0, file$d, 7, 6, 77);
    			add_location(th1, file$d, 8, 6, 99);
    			add_location(th2, file$d, 9, 6, 126);
    			add_location(th3, file$d, 10, 6, 150);
    			add_location(th4, file$d, 11, 6, 174);
    			add_location(th5, file$d, 12, 6, 196);
    			add_location(th6, file$d, 13, 6, 216);
    			add_location(th7, file$d, 14, 6, 239);
    			add_location(tr, file$d, 6, 4, 66);
    			add_location(thead, file$d, 5, 2, 54);
    			add_location(tbody, file$d, 17, 2, 282);
    			attr_dev(table, "class", "svelte-1u7sob6");
    			add_location(table, file$d, 4, 0, 44);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(tr, t5);
    			append_dev(tr, th3);
    			append_dev(tr, t7);
    			append_dev(tr, th4);
    			append_dev(tr, t9);
    			append_dev(tr, th5);
    			append_dev(tr, t11);
    			append_dev(tr, th6);
    			append_dev(tr, t13);
    			append_dev(tr, th7);
    			append_dev(table, t15);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(tbody, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*data*/ 1) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;

    				if (each_value.length) {
    					if (each_1_else) {
    						each_1_else.d(1);
    						each_1_else = null;
    					}
    				} else if (!each_1_else) {
    					each_1_else = create_else_block$1(ctx);
    					each_1_else.c();
    					each_1_else.m(tbody, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    			if (each_1_else) each_1_else.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NearbyDevicesTable", slots, []);
    	let { data = [] } = $$props;
    	const writable_props = ["data"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NearbyDevicesTable> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ data });

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data];
    }

    class NearbyDevicesTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NearbyDevicesTable",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get data() {
    		throw new Error("<NearbyDevicesTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<NearbyDevicesTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/tables/ConnectionsTable.svelte generated by Svelte v3.31.0 */

    const file$e = "src/tables/ConnectionsTable.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (22:4) {:else}
    function create_else_block$2(ctx) {
    	let tr;
    	let td;
    	let t1;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td = element("td");
    			td.textContent = "No connections found";
    			t1 = space();
    			attr_dev(td, "class", "table-empty-text");
    			attr_dev(td, "colspan", "100");
    			add_location(td, file$e, 23, 8, 464);
    			add_location(tr, file$e, 22, 6, 451);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td);
    			append_dev(tr, t1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(22:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (15:4) {#each data as row}
    function create_each_block$4(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*row*/ ctx[1].address + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*row*/ ctx[1].protocol + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*row*/ ctx[1].lane + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*row*/ ctx[1].deviceKey.substring(0, 8) + "";
    	let t6;
    	let t7;
    	let td3_title_value;
    	let t8;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = text("...");
    			t8 = space();
    			add_location(td0, file$e, 16, 8, 245);
    			add_location(td1, file$e, 17, 8, 276);
    			add_location(td2, file$e, 18, 8, 308);
    			attr_dev(td3, "class", "device_key svelte-1qihu4z");
    			attr_dev(td3, "title", td3_title_value = /*row*/ ctx[1].deviceKey);
    			add_location(td3, file$e, 19, 8, 336);
    			add_location(tr, file$e, 15, 6, 232);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, t6);
    			append_dev(td3, t7);
    			append_dev(tr, t8);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && t0_value !== (t0_value = /*row*/ ctx[1].address + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*data*/ 1 && t2_value !== (t2_value = /*row*/ ctx[1].protocol + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*data*/ 1 && t4_value !== (t4_value = /*row*/ ctx[1].lane + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*data*/ 1 && t6_value !== (t6_value = /*row*/ ctx[1].deviceKey.substring(0, 8) + "")) set_data_dev(t6, t6_value);

    			if (dirty & /*data*/ 1 && td3_title_value !== (td3_title_value = /*row*/ ctx[1].deviceKey)) {
    				attr_dev(td3, "title", td3_title_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(15:4) {#each data as row}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let tbody;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$2(ctx);
    	}

    	const block = {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Address";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Protocol";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Lane";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Remote device key";
    			t7 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			add_location(th0, file$e, 7, 6, 77);
    			add_location(th1, file$e, 8, 6, 100);
    			add_location(th2, file$e, 9, 6, 124);
    			add_location(th3, file$e, 10, 6, 144);
    			add_location(tr, file$e, 6, 4, 66);
    			add_location(thead, file$e, 5, 2, 54);
    			add_location(tbody, file$e, 13, 2, 194);
    			attr_dev(table, "class", "svelte-1qihu4z");
    			add_location(table, file$e, 4, 0, 44);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(tr, t5);
    			append_dev(tr, th3);
    			append_dev(table, t7);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(tbody, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*data*/ 1) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;

    				if (each_value.length) {
    					if (each_1_else) {
    						each_1_else.d(1);
    						each_1_else = null;
    					}
    				} else if (!each_1_else) {
    					each_1_else = create_else_block$2(ctx);
    					each_1_else.c();
    					each_1_else.m(tbody, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    			if (each_1_else) each_1_else.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ConnectionsTable", slots, []);
    	let { data = [] } = $$props;
    	const writable_props = ["data"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ConnectionsTable> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ data });

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data];
    }

    class ConnectionsTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ConnectionsTable",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get data() {
    		throw new Error("<ConnectionsTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<ConnectionsTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/tables/PeerlistTable.svelte generated by Svelte v3.31.0 */

    const file$f = "src/tables/PeerlistTable.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (24:4) {:else}
    function create_else_block$3(ctx) {
    	let tr;
    	let td;
    	let t1;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td = element("td");
    			td.textContent = "No peers connected";
    			t1 = space();
    			attr_dev(td, "class", "table-empty-text");
    			attr_dev(td, "colspan", "100");
    			add_location(td, file$f, 25, 8, 634);
    			add_location(tr, file$f, 24, 6, 621);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td);
    			append_dev(tr, t1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(24:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (20:8) {#if row.peerState}
    function create_if_block$4(ctx) {
    	let td;
    	let span;

    	let t0_value = (/*row*/ ctx[1].versionCompareSymbol
    	? /*row*/ ctx[1].versionCompareSymbol
    	: "") + "";

    	let t0;
    	let t1;
    	let t2_value = /*row*/ ctx[1].peerState.dmtVersion + "";
    	let t2;

    	const block = {
    		c: function create() {
    			td = element("td");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			attr_dev(span, "class", "svelte-7040cv");
    			add_location(span, file$f, 20, 34, 473);
    			attr_dev(td, "class", "dmt_version svelte-7040cv");
    			add_location(td, file$f, 20, 10, 449);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, span);
    			append_dev(span, t0);
    			append_dev(td, t1);
    			append_dev(td, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && t0_value !== (t0_value = (/*row*/ ctx[1].versionCompareSymbol
    			? /*row*/ ctx[1].versionCompareSymbol
    			: "") + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*data*/ 1 && t2_value !== (t2_value = /*row*/ ctx[1].peerState.dmtVersion + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(20:8) {#if row.peerState}",
    		ctx
    	});

    	return block;
    }

    // (15:4) {#each data as row}
    function create_each_block$5(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*row*/ ctx[1].address + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*row*/ ctx[1].deviceTag + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = (/*row*/ ctx[1].connected ? "YES" : "✖") + "";
    	let t4;
    	let t5;
    	let t6;
    	let if_block = /*row*/ ctx[1].peerState && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			if (if_block) if_block.c();
    			t6 = space();
    			add_location(td0, file$f, 16, 8, 246);
    			attr_dev(td1, "class", "device_tag svelte-7040cv");
    			add_location(td1, file$f, 17, 8, 277);
    			attr_dev(td2, "class", "connected svelte-7040cv");
    			toggle_class(td2, "ok", /*row*/ ctx[1].connected);
    			add_location(td2, file$f, 18, 8, 329);
    			add_location(tr, file$f, 15, 6, 233);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			if (if_block) if_block.m(tr, null);
    			append_dev(tr, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && t0_value !== (t0_value = /*row*/ ctx[1].address + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*data*/ 1 && t2_value !== (t2_value = /*row*/ ctx[1].deviceTag + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*data*/ 1 && t4_value !== (t4_value = (/*row*/ ctx[1].connected ? "YES" : "✖") + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*data*/ 1) {
    				toggle_class(td2, "ok", /*row*/ ctx[1].connected);
    			}

    			if (/*row*/ ctx[1].peerState) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(tr, t6);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(15:4) {#each data as row}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let tbody;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$3(ctx);
    	}

    	const block = {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Address";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Device tag";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Connected";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "DMT version";
    			t7 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			add_location(th0, file$f, 7, 6, 77);
    			add_location(th1, file$f, 8, 6, 100);
    			add_location(th2, file$f, 9, 6, 126);
    			add_location(th3, file$f, 10, 6, 151);
    			add_location(tr, file$f, 6, 4, 66);
    			add_location(thead, file$f, 5, 2, 54);
    			add_location(tbody, file$f, 13, 2, 195);
    			attr_dev(table, "class", "svelte-7040cv");
    			add_location(table, file$f, 4, 0, 44);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(tr, t5);
    			append_dev(tr, th3);
    			append_dev(table, t7);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(tbody, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*data*/ 1) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;

    				if (each_value.length) {
    					if (each_1_else) {
    						each_1_else.d(1);
    						each_1_else = null;
    					}
    				} else if (!each_1_else) {
    					each_1_else = create_else_block$3(ctx);
    					each_1_else.c();
    					each_1_else.m(tbody, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    			if (each_1_else) each_1_else.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PeerlistTable", slots, []);
    	let { data = [] } = $$props;
    	const writable_props = ["data"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PeerlistTable> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ data });

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data];
    }

    class PeerlistTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PeerlistTable",
    			options,
    			id: create_fragment$l.name
    		});
    	}

    	get data() {
    		throw new Error("<PeerlistTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<PeerlistTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/views/Dashboard.svelte generated by Svelte v3.31.0 */
    const file$g = "src/views/Dashboard.svelte";

    // (58:0) {#if $hash === '#json'}
    function create_if_block$5(ctx) {
    	let rawjsondialog;
    	let current;

    	rawjsondialog = new RawJSONDialog({
    			props: { data: /*state*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(rawjsondialog.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(rawjsondialog, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const rawjsondialog_changes = {};
    			if (dirty & /*state*/ 1) rawjsondialog_changes.data = /*state*/ ctx[0];
    			rawjsondialog.$set(rawjsondialog_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(rawjsondialog.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(rawjsondialog.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(rawjsondialog, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(58:0) {#if $hash === '#json'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let navbar;
    	let t0;
    	let div3;
    	let section0;
    	let h10;
    	let t2;
    	let nearbydevicestable;
    	let t3;
    	let section1;
    	let h11;
    	let t5;
    	let peerlisttable;
    	let t6;
    	let section2;
    	let h12;
    	let t8;
    	let div2;
    	let div0;
    	let h20;
    	let t10;
    	let connectionstable0;
    	let t11;
    	let div1;
    	let h21;
    	let t13;
    	let connectionstable1;
    	let t14;
    	let if_block_anchor;
    	let current;
    	navbar = new Navbar({ $$inline: true });

    	nearbydevicestable = new NearbyDevicesTable({
    			props: { data: /*state*/ ctx[0].nearbyDevices },
    			$$inline: true
    		});

    	peerlisttable = new PeerlistTable({
    			props: { data: /*state*/ ctx[0].peerlist },
    			$$inline: true
    		});

    	connectionstable0 = new ConnectionsTable({ props: { data: [] }, $$inline: true });
    	connectionstable1 = new ConnectionsTable({ props: { data: [] }, $$inline: true });
    	let if_block = /*$hash*/ ctx[1] === "#json" && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			div3 = element("div");
    			section0 = element("section");
    			h10 = element("h1");
    			h10.textContent = "Nearby devices";
    			t2 = space();
    			create_component(nearbydevicestable.$$.fragment);
    			t3 = space();
    			section1 = element("section");
    			h11 = element("h1");
    			h11.textContent = "Peerlist";
    			t5 = space();
    			create_component(peerlisttable.$$.fragment);
    			t6 = space();
    			section2 = element("section");
    			h12 = element("h1");
    			h12.textContent = "Connections";
    			t8 = space();
    			div2 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Outgoing";
    			t10 = space();
    			create_component(connectionstable0.$$.fragment);
    			t11 = space();
    			div1 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Incoming";
    			t13 = space();
    			create_component(connectionstable1.$$.fragment);
    			t14 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			add_location(h10, file$g, 22, 4, 546);
    			attr_dev(section0, "class", "svelte-ijb579");
    			add_location(section0, file$g, 21, 2, 532);
    			add_location(h11, file$g, 27, 4, 654);
    			attr_dev(section1, "class", "svelte-ijb579");
    			add_location(section1, file$g, 26, 2, 640);
    			add_location(h12, file$g, 32, 4, 746);
    			add_location(h20, file$g, 35, 8, 853);
    			attr_dev(div0, "class", "connections-grid__left svelte-ijb579");
    			add_location(div0, file$g, 34, 6, 808);
    			add_location(h21, file$g, 39, 8, 975);
    			attr_dev(div1, "class", "connections-grid__right svelte-ijb579");
    			add_location(div1, file$g, 38, 6, 929);
    			attr_dev(div2, "class", "connections-grid svelte-ijb579");
    			add_location(div2, file$g, 33, 4, 771);
    			attr_dev(section2, "class", "svelte-ijb579");
    			add_location(section2, file$g, 31, 2, 732);
    			attr_dev(div3, "class", "view-container");
    			add_location(div3, file$g, 20, 0, 501);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, section0);
    			append_dev(section0, h10);
    			append_dev(section0, t2);
    			mount_component(nearbydevicestable, section0, null);
    			append_dev(div3, t3);
    			append_dev(div3, section1);
    			append_dev(section1, h11);
    			append_dev(section1, t5);
    			mount_component(peerlisttable, section1, null);
    			append_dev(div3, t6);
    			append_dev(div3, section2);
    			append_dev(section2, h12);
    			append_dev(section2, t8);
    			append_dev(section2, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h20);
    			append_dev(div0, t10);
    			mount_component(connectionstable0, div0, null);
    			append_dev(div2, t11);
    			append_dev(div2, div1);
    			append_dev(div1, h21);
    			append_dev(div1, t13);
    			mount_component(connectionstable1, div1, null);
    			insert_dev(target, t14, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const nearbydevicestable_changes = {};
    			if (dirty & /*state*/ 1) nearbydevicestable_changes.data = /*state*/ ctx[0].nearbyDevices;
    			nearbydevicestable.$set(nearbydevicestable_changes);
    			const peerlisttable_changes = {};
    			if (dirty & /*state*/ 1) peerlisttable_changes.data = /*state*/ ctx[0].peerlist;
    			peerlisttable.$set(peerlisttable_changes);

    			if (/*$hash*/ ctx[1] === "#json") {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$hash*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(nearbydevicestable.$$.fragment, local);
    			transition_in(peerlisttable.$$.fragment, local);
    			transition_in(connectionstable0.$$.fragment, local);
    			transition_in(connectionstable1.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(nearbydevicestable.$$.fragment, local);
    			transition_out(peerlisttable.$$.fragment, local);
    			transition_out(connectionstable0.$$.fragment, local);
    			transition_out(connectionstable1.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
    			destroy_component(nearbydevicestable);
    			destroy_component(peerlisttable);
    			destroy_component(connectionstable0);
    			destroy_component(connectionstable1);
    			if (detaching) detach_dev(t14);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let $hash;
    	validate_store(hash$1, "hash");
    	component_subscribe($$self, hash$1, $$value => $$invalidate(1, $hash = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Dashboard", slots, []);
    	let { state } = $$props;
    	let logLineWrap = false;
    	let logSearchText = "";
    	const writable_props = ["state"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Dashboard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("state" in $$props) $$invalidate(0, state = $$props.state);
    	};

    	$$self.$capture_state = () => ({
    		Navbar,
    		LogView,
    		RawJsonDialog: RawJSONDialog,
    		NearbyDevicesTable,
    		ConnectionsTable,
    		PeerlistTable,
    		hash: hash$1,
    		state,
    		logLineWrap,
    		logSearchText,
    		$hash
    	});

    	$$self.$inject_state = $$props => {
    		if ("state" in $$props) $$invalidate(0, state = $$props.state);
    		if ("logLineWrap" in $$props) logLineWrap = $$props.logLineWrap;
    		if ("logSearchText" in $$props) logSearchText = $$props.logSearchText;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [state, $hash];
    }

    class Dashboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, { state: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dashboard",
    			options,
    			id: create_fragment$m.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*state*/ ctx[0] === undefined && !("state" in props)) {
    			console.warn("<Dashboard> was created without expected prop 'state'");
    		}
    	}

    	get state() {
    		throw new Error("<Dashboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Dashboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.31.0 */
    const file$h = "src/App.svelte";

    // (12:2) {:else}
    function create_else_block$4(ctx) {
    	let dashboard;
    	let current;

    	dashboard = new Dashboard({
    			props: { state: /*$state*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(dashboard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(dashboard, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const dashboard_changes = {};
    			if (dirty & /*$state*/ 8) dashboard_changes.state = /*$state*/ ctx[3];
    			dashboard.$set(dashboard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dashboard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dashboard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dashboard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(12:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (10:2) {#if !$connected}
    function create_if_block$6(ctx) {
    	let loading;
    	let current;
    	loading = new Loading({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(loading.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loading, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loading.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loading.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loading, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(10:2) {#if !$connected}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$6, create_else_block$4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*$connected*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if_block.c();
    			attr_dev(main, "class", "svelte-ipu353");
    			add_location(main, file$h, 8, 0, 165);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if_blocks[current_block_type_index].m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(main, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let $connected,
    		$$unsubscribe_connected = noop,
    		$$subscribe_connected = () => ($$unsubscribe_connected(), $$unsubscribe_connected = subscribe(connected, $$value => $$invalidate(2, $connected = $$value)), connected);

    	let $state,
    		$$unsubscribe_state = noop,
    		$$subscribe_state = () => ($$unsubscribe_state(), $$unsubscribe_state = subscribe(state, $$value => $$invalidate(3, $state = $$value)), state);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_connected());
    	$$self.$$.on_destroy.push(() => $$unsubscribe_state());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { connected } = $$props;
    	validate_store(connected, "connected");
    	$$subscribe_connected();
    	let { state } = $$props;
    	validate_store(state, "state");
    	$$subscribe_state();
    	const writable_props = ["connected", "state"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("connected" in $$props) $$subscribe_connected($$invalidate(0, connected = $$props.connected));
    		if ("state" in $$props) $$subscribe_state($$invalidate(1, state = $$props.state));
    	};

    	$$self.$capture_state = () => ({
    		Loading,
    		Dashboard,
    		connected,
    		state,
    		$connected,
    		$state
    	});

    	$$self.$inject_state = $$props => {
    		if ("connected" in $$props) $$subscribe_connected($$invalidate(0, connected = $$props.connected));
    		if ("state" in $$props) $$subscribe_state($$invalidate(1, state = $$props.state));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [connected, state, $connected, $state];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, { connected: 0, state: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$n.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*connected*/ ctx[0] === undefined && !("connected" in props)) {
    			console.warn("<App> was created without expected prop 'connected'");
    		}

    		if (/*state*/ ctx[1] === undefined && !("state" in props)) {
    			console.warn("<App> was created without expected prop 'state'");
    		}
    	}

    	get connected() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set connected(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /*!
     * https://github.com/Starcounter-Jack/JSON-Patch
     * (c) 2017 Joachim Wester
     * MIT license
     */
    var __extends =  (function () {
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

    var fastJsonPatch = Object.assign({}, core, duplex, {
        JsonPatchError: PatchError,
        deepClone: _deepClone,
        escapePathComponent,
        unescapePathComponent
    });

    function noop$1() {}

    class RunnableLink {
      constructor(prev, next, fn) {
        this.prev = prev;
        this.next = next;
        this.fn = fn || noop$1;
      }

      run(data) {
        this.fn(data);
        this.next && this.next.run(data);
      }
    }

    class LinkedList {
      constructor(linkConstructor) {
        this.head = new RunnableLink();
        this.tail = new RunnableLink(this.head);
        this.head.next = this.tail;
        this.linkConstructor = linkConstructor;
        this.reg = {};
      }

      insert(data) {
        const link = new RunnableLink(this.tail.prev, this.tail, data);
        link.next.prev = link;
        link.prev.next = link;
        return link;
      }

      remove(link) {
        link.prev.next = link.next;
        link.next.prev = link.prev;
      }
    }

    let id = 0;
    const splitter = /[\s,]+/g;

    class Eev {
      constructor() {
        this.__events_list = {};
      }

      on(names, fn) {
        names.split(splitter).forEach(name => {
          const list = this.__events_list[name] || (this.__events_list[name] = new LinkedList());
          const eev = fn._eev || (fn._eev = ++id);

          list.reg[eev] || (list.reg[eev] = list.insert(fn));
        });
      }

      off(names, fn) {
        fn &&
          names.split(splitter).forEach(name => {
            const list = this.__events_list[name];

            if (!list) {
              return;
            }

            const link = list.reg[fn._eev];

            list.reg[fn._eev] = undefined;

            list && link && list.remove(link);
          });
      }

      removeListener(...args) {
        this.off(...args);
      }

      emit(name, data) {
        const evt = this.__events_list[name];
        evt && evt.head.run(data);
      }
    }

    // 💡 we use Emitter inside ConnectedStore to emit 'ready' event
    // 💡 and inside MultiConnectedStore to also emit a few events

    class WritableStore extends Eev {
      constructor(initialState) {
        super();

        this.state = initialState;

        this.subscriptions = [];
      }

      set(state) {
        this.state = state;

        this.pushStateToSubscribers();
      }

      get() {
        return this.state;
      }

      subscribe(handler) {
        this.subscriptions.push(handler);

        handler(this.state);

        return () => {
          this.subscriptions = this.subscriptions.filter(sub => sub !== handler);
        };
      }

      pushStateToSubscribers() {
        this.subscriptions.forEach(handler => handler(this.state));
      }
    }

    function log(msg) {
      console.log(`${new Date().toLocaleString()} → ${msg}`);
    }

    function listify(obj) {
      if (typeof obj == 'undefined' || obj == null) {
        return [];
      }
      return Array.isArray(obj) ? obj : [obj];
    }

    function bufferToHex(buffer) {
      return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }

    function hexToBuffer(hex) {
      const tokens = hex.match(/.{1,2}(?=(.{2})+(?!.))|.{1,2}$/g);
      return new Uint8Array(tokens.map((token) => parseInt(token, 16)));
    }

    function integerToByteArray(long, arrayLen = 8) {
      const byteArray = new Array(arrayLen).fill(0);

      for (let index = 0; index < byteArray.length; index++) {
        const byte = long & 0xff;
        byteArray[index] = byte;
        long = (long - byte) / 256;
      }

      return byteArray;
    }

    var commonjsGlobal$1 = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function getDefaultExportFromCjs$1 (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule$1(fn, basedir, module) {
    	return module = {
    		path: basedir,
    		exports: {},
    		require: function (path, base) {
    			return commonjsRequire$1(path, (base === undefined || base === null) ? module.path : base);
    		}
    	}, fn(module, module.exports), module.exports;
    }

    function getAugmentedNamespace(n) {
    	if (n.__esModule) return n;
    	var a = Object.defineProperty({}, '__esModule', {value: true});
    	Object.keys(n).forEach(function (k) {
    		var d = Object.getOwnPropertyDescriptor(n, k);
    		Object.defineProperty(a, k, d.get ? d : {
    			enumerable: true,
    			get: function () {
    				return n[k];
    			}
    		});
    	});
    	return a;
    }

    function commonjsRequire$1 () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var _nodeResolve_empty = {};

    var _nodeResolve_empty$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': _nodeResolve_empty
    });

    var require$$0 = /*@__PURE__*/getAugmentedNamespace(_nodeResolve_empty$1);

    var naclFast = createCommonjsModule$1(function (module) {
    (function(nacl) {

    // Ported in 2014 by Dmitry Chestnykh and Devi Mandiri.
    // Public domain.
    //
    // Implementation derived from TweetNaCl version 20140427.
    // See for details: http://tweetnacl.cr.yp.to/

    var gf = function(init) {
      var i, r = new Float64Array(16);
      if (init) for (i = 0; i < init.length; i++) r[i] = init[i];
      return r;
    };

    //  Pluggable, initialized in high-level API below.
    var randombytes = function(/* x, n */) { throw new Error('no PRNG'); };

    var _0 = new Uint8Array(16);
    var _9 = new Uint8Array(32); _9[0] = 9;

    var gf0 = gf(),
        gf1 = gf([1]),
        _121665 = gf([0xdb41, 1]),
        D = gf([0x78a3, 0x1359, 0x4dca, 0x75eb, 0xd8ab, 0x4141, 0x0a4d, 0x0070, 0xe898, 0x7779, 0x4079, 0x8cc7, 0xfe73, 0x2b6f, 0x6cee, 0x5203]),
        D2 = gf([0xf159, 0x26b2, 0x9b94, 0xebd6, 0xb156, 0x8283, 0x149a, 0x00e0, 0xd130, 0xeef3, 0x80f2, 0x198e, 0xfce7, 0x56df, 0xd9dc, 0x2406]),
        X = gf([0xd51a, 0x8f25, 0x2d60, 0xc956, 0xa7b2, 0x9525, 0xc760, 0x692c, 0xdc5c, 0xfdd6, 0xe231, 0xc0a4, 0x53fe, 0xcd6e, 0x36d3, 0x2169]),
        Y = gf([0x6658, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666]),
        I = gf([0xa0b0, 0x4a0e, 0x1b27, 0xc4ee, 0xe478, 0xad2f, 0x1806, 0x2f43, 0xd7a7, 0x3dfb, 0x0099, 0x2b4d, 0xdf0b, 0x4fc1, 0x2480, 0x2b83]);

    function ts64(x, i, h, l) {
      x[i]   = (h >> 24) & 0xff;
      x[i+1] = (h >> 16) & 0xff;
      x[i+2] = (h >>  8) & 0xff;
      x[i+3] = h & 0xff;
      x[i+4] = (l >> 24)  & 0xff;
      x[i+5] = (l >> 16)  & 0xff;
      x[i+6] = (l >>  8)  & 0xff;
      x[i+7] = l & 0xff;
    }

    function vn(x, xi, y, yi, n) {
      var i,d = 0;
      for (i = 0; i < n; i++) d |= x[xi+i]^y[yi+i];
      return (1 & ((d - 1) >>> 8)) - 1;
    }

    function crypto_verify_16(x, xi, y, yi) {
      return vn(x,xi,y,yi,16);
    }

    function crypto_verify_32(x, xi, y, yi) {
      return vn(x,xi,y,yi,32);
    }

    function core_salsa20(o, p, k, c) {
      var j0  = c[ 0] & 0xff | (c[ 1] & 0xff)<<8 | (c[ 2] & 0xff)<<16 | (c[ 3] & 0xff)<<24,
          j1  = k[ 0] & 0xff | (k[ 1] & 0xff)<<8 | (k[ 2] & 0xff)<<16 | (k[ 3] & 0xff)<<24,
          j2  = k[ 4] & 0xff | (k[ 5] & 0xff)<<8 | (k[ 6] & 0xff)<<16 | (k[ 7] & 0xff)<<24,
          j3  = k[ 8] & 0xff | (k[ 9] & 0xff)<<8 | (k[10] & 0xff)<<16 | (k[11] & 0xff)<<24,
          j4  = k[12] & 0xff | (k[13] & 0xff)<<8 | (k[14] & 0xff)<<16 | (k[15] & 0xff)<<24,
          j5  = c[ 4] & 0xff | (c[ 5] & 0xff)<<8 | (c[ 6] & 0xff)<<16 | (c[ 7] & 0xff)<<24,
          j6  = p[ 0] & 0xff | (p[ 1] & 0xff)<<8 | (p[ 2] & 0xff)<<16 | (p[ 3] & 0xff)<<24,
          j7  = p[ 4] & 0xff | (p[ 5] & 0xff)<<8 | (p[ 6] & 0xff)<<16 | (p[ 7] & 0xff)<<24,
          j8  = p[ 8] & 0xff | (p[ 9] & 0xff)<<8 | (p[10] & 0xff)<<16 | (p[11] & 0xff)<<24,
          j9  = p[12] & 0xff | (p[13] & 0xff)<<8 | (p[14] & 0xff)<<16 | (p[15] & 0xff)<<24,
          j10 = c[ 8] & 0xff | (c[ 9] & 0xff)<<8 | (c[10] & 0xff)<<16 | (c[11] & 0xff)<<24,
          j11 = k[16] & 0xff | (k[17] & 0xff)<<8 | (k[18] & 0xff)<<16 | (k[19] & 0xff)<<24,
          j12 = k[20] & 0xff | (k[21] & 0xff)<<8 | (k[22] & 0xff)<<16 | (k[23] & 0xff)<<24,
          j13 = k[24] & 0xff | (k[25] & 0xff)<<8 | (k[26] & 0xff)<<16 | (k[27] & 0xff)<<24,
          j14 = k[28] & 0xff | (k[29] & 0xff)<<8 | (k[30] & 0xff)<<16 | (k[31] & 0xff)<<24,
          j15 = c[12] & 0xff | (c[13] & 0xff)<<8 | (c[14] & 0xff)<<16 | (c[15] & 0xff)<<24;

      var x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7,
          x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14,
          x15 = j15, u;

      for (var i = 0; i < 20; i += 2) {
        u = x0 + x12 | 0;
        x4 ^= u<<7 | u>>>(32-7);
        u = x4 + x0 | 0;
        x8 ^= u<<9 | u>>>(32-9);
        u = x8 + x4 | 0;
        x12 ^= u<<13 | u>>>(32-13);
        u = x12 + x8 | 0;
        x0 ^= u<<18 | u>>>(32-18);

        u = x5 + x1 | 0;
        x9 ^= u<<7 | u>>>(32-7);
        u = x9 + x5 | 0;
        x13 ^= u<<9 | u>>>(32-9);
        u = x13 + x9 | 0;
        x1 ^= u<<13 | u>>>(32-13);
        u = x1 + x13 | 0;
        x5 ^= u<<18 | u>>>(32-18);

        u = x10 + x6 | 0;
        x14 ^= u<<7 | u>>>(32-7);
        u = x14 + x10 | 0;
        x2 ^= u<<9 | u>>>(32-9);
        u = x2 + x14 | 0;
        x6 ^= u<<13 | u>>>(32-13);
        u = x6 + x2 | 0;
        x10 ^= u<<18 | u>>>(32-18);

        u = x15 + x11 | 0;
        x3 ^= u<<7 | u>>>(32-7);
        u = x3 + x15 | 0;
        x7 ^= u<<9 | u>>>(32-9);
        u = x7 + x3 | 0;
        x11 ^= u<<13 | u>>>(32-13);
        u = x11 + x7 | 0;
        x15 ^= u<<18 | u>>>(32-18);

        u = x0 + x3 | 0;
        x1 ^= u<<7 | u>>>(32-7);
        u = x1 + x0 | 0;
        x2 ^= u<<9 | u>>>(32-9);
        u = x2 + x1 | 0;
        x3 ^= u<<13 | u>>>(32-13);
        u = x3 + x2 | 0;
        x0 ^= u<<18 | u>>>(32-18);

        u = x5 + x4 | 0;
        x6 ^= u<<7 | u>>>(32-7);
        u = x6 + x5 | 0;
        x7 ^= u<<9 | u>>>(32-9);
        u = x7 + x6 | 0;
        x4 ^= u<<13 | u>>>(32-13);
        u = x4 + x7 | 0;
        x5 ^= u<<18 | u>>>(32-18);

        u = x10 + x9 | 0;
        x11 ^= u<<7 | u>>>(32-7);
        u = x11 + x10 | 0;
        x8 ^= u<<9 | u>>>(32-9);
        u = x8 + x11 | 0;
        x9 ^= u<<13 | u>>>(32-13);
        u = x9 + x8 | 0;
        x10 ^= u<<18 | u>>>(32-18);

        u = x15 + x14 | 0;
        x12 ^= u<<7 | u>>>(32-7);
        u = x12 + x15 | 0;
        x13 ^= u<<9 | u>>>(32-9);
        u = x13 + x12 | 0;
        x14 ^= u<<13 | u>>>(32-13);
        u = x14 + x13 | 0;
        x15 ^= u<<18 | u>>>(32-18);
      }
       x0 =  x0 +  j0 | 0;
       x1 =  x1 +  j1 | 0;
       x2 =  x2 +  j2 | 0;
       x3 =  x3 +  j3 | 0;
       x4 =  x4 +  j4 | 0;
       x5 =  x5 +  j5 | 0;
       x6 =  x6 +  j6 | 0;
       x7 =  x7 +  j7 | 0;
       x8 =  x8 +  j8 | 0;
       x9 =  x9 +  j9 | 0;
      x10 = x10 + j10 | 0;
      x11 = x11 + j11 | 0;
      x12 = x12 + j12 | 0;
      x13 = x13 + j13 | 0;
      x14 = x14 + j14 | 0;
      x15 = x15 + j15 | 0;

      o[ 0] = x0 >>>  0 & 0xff;
      o[ 1] = x0 >>>  8 & 0xff;
      o[ 2] = x0 >>> 16 & 0xff;
      o[ 3] = x0 >>> 24 & 0xff;

      o[ 4] = x1 >>>  0 & 0xff;
      o[ 5] = x1 >>>  8 & 0xff;
      o[ 6] = x1 >>> 16 & 0xff;
      o[ 7] = x1 >>> 24 & 0xff;

      o[ 8] = x2 >>>  0 & 0xff;
      o[ 9] = x2 >>>  8 & 0xff;
      o[10] = x2 >>> 16 & 0xff;
      o[11] = x2 >>> 24 & 0xff;

      o[12] = x3 >>>  0 & 0xff;
      o[13] = x3 >>>  8 & 0xff;
      o[14] = x3 >>> 16 & 0xff;
      o[15] = x3 >>> 24 & 0xff;

      o[16] = x4 >>>  0 & 0xff;
      o[17] = x4 >>>  8 & 0xff;
      o[18] = x4 >>> 16 & 0xff;
      o[19] = x4 >>> 24 & 0xff;

      o[20] = x5 >>>  0 & 0xff;
      o[21] = x5 >>>  8 & 0xff;
      o[22] = x5 >>> 16 & 0xff;
      o[23] = x5 >>> 24 & 0xff;

      o[24] = x6 >>>  0 & 0xff;
      o[25] = x6 >>>  8 & 0xff;
      o[26] = x6 >>> 16 & 0xff;
      o[27] = x6 >>> 24 & 0xff;

      o[28] = x7 >>>  0 & 0xff;
      o[29] = x7 >>>  8 & 0xff;
      o[30] = x7 >>> 16 & 0xff;
      o[31] = x7 >>> 24 & 0xff;

      o[32] = x8 >>>  0 & 0xff;
      o[33] = x8 >>>  8 & 0xff;
      o[34] = x8 >>> 16 & 0xff;
      o[35] = x8 >>> 24 & 0xff;

      o[36] = x9 >>>  0 & 0xff;
      o[37] = x9 >>>  8 & 0xff;
      o[38] = x9 >>> 16 & 0xff;
      o[39] = x9 >>> 24 & 0xff;

      o[40] = x10 >>>  0 & 0xff;
      o[41] = x10 >>>  8 & 0xff;
      o[42] = x10 >>> 16 & 0xff;
      o[43] = x10 >>> 24 & 0xff;

      o[44] = x11 >>>  0 & 0xff;
      o[45] = x11 >>>  8 & 0xff;
      o[46] = x11 >>> 16 & 0xff;
      o[47] = x11 >>> 24 & 0xff;

      o[48] = x12 >>>  0 & 0xff;
      o[49] = x12 >>>  8 & 0xff;
      o[50] = x12 >>> 16 & 0xff;
      o[51] = x12 >>> 24 & 0xff;

      o[52] = x13 >>>  0 & 0xff;
      o[53] = x13 >>>  8 & 0xff;
      o[54] = x13 >>> 16 & 0xff;
      o[55] = x13 >>> 24 & 0xff;

      o[56] = x14 >>>  0 & 0xff;
      o[57] = x14 >>>  8 & 0xff;
      o[58] = x14 >>> 16 & 0xff;
      o[59] = x14 >>> 24 & 0xff;

      o[60] = x15 >>>  0 & 0xff;
      o[61] = x15 >>>  8 & 0xff;
      o[62] = x15 >>> 16 & 0xff;
      o[63] = x15 >>> 24 & 0xff;
    }

    function core_hsalsa20(o,p,k,c) {
      var j0  = c[ 0] & 0xff | (c[ 1] & 0xff)<<8 | (c[ 2] & 0xff)<<16 | (c[ 3] & 0xff)<<24,
          j1  = k[ 0] & 0xff | (k[ 1] & 0xff)<<8 | (k[ 2] & 0xff)<<16 | (k[ 3] & 0xff)<<24,
          j2  = k[ 4] & 0xff | (k[ 5] & 0xff)<<8 | (k[ 6] & 0xff)<<16 | (k[ 7] & 0xff)<<24,
          j3  = k[ 8] & 0xff | (k[ 9] & 0xff)<<8 | (k[10] & 0xff)<<16 | (k[11] & 0xff)<<24,
          j4  = k[12] & 0xff | (k[13] & 0xff)<<8 | (k[14] & 0xff)<<16 | (k[15] & 0xff)<<24,
          j5  = c[ 4] & 0xff | (c[ 5] & 0xff)<<8 | (c[ 6] & 0xff)<<16 | (c[ 7] & 0xff)<<24,
          j6  = p[ 0] & 0xff | (p[ 1] & 0xff)<<8 | (p[ 2] & 0xff)<<16 | (p[ 3] & 0xff)<<24,
          j7  = p[ 4] & 0xff | (p[ 5] & 0xff)<<8 | (p[ 6] & 0xff)<<16 | (p[ 7] & 0xff)<<24,
          j8  = p[ 8] & 0xff | (p[ 9] & 0xff)<<8 | (p[10] & 0xff)<<16 | (p[11] & 0xff)<<24,
          j9  = p[12] & 0xff | (p[13] & 0xff)<<8 | (p[14] & 0xff)<<16 | (p[15] & 0xff)<<24,
          j10 = c[ 8] & 0xff | (c[ 9] & 0xff)<<8 | (c[10] & 0xff)<<16 | (c[11] & 0xff)<<24,
          j11 = k[16] & 0xff | (k[17] & 0xff)<<8 | (k[18] & 0xff)<<16 | (k[19] & 0xff)<<24,
          j12 = k[20] & 0xff | (k[21] & 0xff)<<8 | (k[22] & 0xff)<<16 | (k[23] & 0xff)<<24,
          j13 = k[24] & 0xff | (k[25] & 0xff)<<8 | (k[26] & 0xff)<<16 | (k[27] & 0xff)<<24,
          j14 = k[28] & 0xff | (k[29] & 0xff)<<8 | (k[30] & 0xff)<<16 | (k[31] & 0xff)<<24,
          j15 = c[12] & 0xff | (c[13] & 0xff)<<8 | (c[14] & 0xff)<<16 | (c[15] & 0xff)<<24;

      var x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7,
          x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14,
          x15 = j15, u;

      for (var i = 0; i < 20; i += 2) {
        u = x0 + x12 | 0;
        x4 ^= u<<7 | u>>>(32-7);
        u = x4 + x0 | 0;
        x8 ^= u<<9 | u>>>(32-9);
        u = x8 + x4 | 0;
        x12 ^= u<<13 | u>>>(32-13);
        u = x12 + x8 | 0;
        x0 ^= u<<18 | u>>>(32-18);

        u = x5 + x1 | 0;
        x9 ^= u<<7 | u>>>(32-7);
        u = x9 + x5 | 0;
        x13 ^= u<<9 | u>>>(32-9);
        u = x13 + x9 | 0;
        x1 ^= u<<13 | u>>>(32-13);
        u = x1 + x13 | 0;
        x5 ^= u<<18 | u>>>(32-18);

        u = x10 + x6 | 0;
        x14 ^= u<<7 | u>>>(32-7);
        u = x14 + x10 | 0;
        x2 ^= u<<9 | u>>>(32-9);
        u = x2 + x14 | 0;
        x6 ^= u<<13 | u>>>(32-13);
        u = x6 + x2 | 0;
        x10 ^= u<<18 | u>>>(32-18);

        u = x15 + x11 | 0;
        x3 ^= u<<7 | u>>>(32-7);
        u = x3 + x15 | 0;
        x7 ^= u<<9 | u>>>(32-9);
        u = x7 + x3 | 0;
        x11 ^= u<<13 | u>>>(32-13);
        u = x11 + x7 | 0;
        x15 ^= u<<18 | u>>>(32-18);

        u = x0 + x3 | 0;
        x1 ^= u<<7 | u>>>(32-7);
        u = x1 + x0 | 0;
        x2 ^= u<<9 | u>>>(32-9);
        u = x2 + x1 | 0;
        x3 ^= u<<13 | u>>>(32-13);
        u = x3 + x2 | 0;
        x0 ^= u<<18 | u>>>(32-18);

        u = x5 + x4 | 0;
        x6 ^= u<<7 | u>>>(32-7);
        u = x6 + x5 | 0;
        x7 ^= u<<9 | u>>>(32-9);
        u = x7 + x6 | 0;
        x4 ^= u<<13 | u>>>(32-13);
        u = x4 + x7 | 0;
        x5 ^= u<<18 | u>>>(32-18);

        u = x10 + x9 | 0;
        x11 ^= u<<7 | u>>>(32-7);
        u = x11 + x10 | 0;
        x8 ^= u<<9 | u>>>(32-9);
        u = x8 + x11 | 0;
        x9 ^= u<<13 | u>>>(32-13);
        u = x9 + x8 | 0;
        x10 ^= u<<18 | u>>>(32-18);

        u = x15 + x14 | 0;
        x12 ^= u<<7 | u>>>(32-7);
        u = x12 + x15 | 0;
        x13 ^= u<<9 | u>>>(32-9);
        u = x13 + x12 | 0;
        x14 ^= u<<13 | u>>>(32-13);
        u = x14 + x13 | 0;
        x15 ^= u<<18 | u>>>(32-18);
      }

      o[ 0] = x0 >>>  0 & 0xff;
      o[ 1] = x0 >>>  8 & 0xff;
      o[ 2] = x0 >>> 16 & 0xff;
      o[ 3] = x0 >>> 24 & 0xff;

      o[ 4] = x5 >>>  0 & 0xff;
      o[ 5] = x5 >>>  8 & 0xff;
      o[ 6] = x5 >>> 16 & 0xff;
      o[ 7] = x5 >>> 24 & 0xff;

      o[ 8] = x10 >>>  0 & 0xff;
      o[ 9] = x10 >>>  8 & 0xff;
      o[10] = x10 >>> 16 & 0xff;
      o[11] = x10 >>> 24 & 0xff;

      o[12] = x15 >>>  0 & 0xff;
      o[13] = x15 >>>  8 & 0xff;
      o[14] = x15 >>> 16 & 0xff;
      o[15] = x15 >>> 24 & 0xff;

      o[16] = x6 >>>  0 & 0xff;
      o[17] = x6 >>>  8 & 0xff;
      o[18] = x6 >>> 16 & 0xff;
      o[19] = x6 >>> 24 & 0xff;

      o[20] = x7 >>>  0 & 0xff;
      o[21] = x7 >>>  8 & 0xff;
      o[22] = x7 >>> 16 & 0xff;
      o[23] = x7 >>> 24 & 0xff;

      o[24] = x8 >>>  0 & 0xff;
      o[25] = x8 >>>  8 & 0xff;
      o[26] = x8 >>> 16 & 0xff;
      o[27] = x8 >>> 24 & 0xff;

      o[28] = x9 >>>  0 & 0xff;
      o[29] = x9 >>>  8 & 0xff;
      o[30] = x9 >>> 16 & 0xff;
      o[31] = x9 >>> 24 & 0xff;
    }

    function crypto_core_salsa20(out,inp,k,c) {
      core_salsa20(out,inp,k,c);
    }

    function crypto_core_hsalsa20(out,inp,k,c) {
      core_hsalsa20(out,inp,k,c);
    }

    var sigma = new Uint8Array([101, 120, 112, 97, 110, 100, 32, 51, 50, 45, 98, 121, 116, 101, 32, 107]);
                // "expand 32-byte k"

    function crypto_stream_salsa20_xor(c,cpos,m,mpos,b,n,k) {
      var z = new Uint8Array(16), x = new Uint8Array(64);
      var u, i;
      for (i = 0; i < 16; i++) z[i] = 0;
      for (i = 0; i < 8; i++) z[i] = n[i];
      while (b >= 64) {
        crypto_core_salsa20(x,z,k,sigma);
        for (i = 0; i < 64; i++) c[cpos+i] = m[mpos+i] ^ x[i];
        u = 1;
        for (i = 8; i < 16; i++) {
          u = u + (z[i] & 0xff) | 0;
          z[i] = u & 0xff;
          u >>>= 8;
        }
        b -= 64;
        cpos += 64;
        mpos += 64;
      }
      if (b > 0) {
        crypto_core_salsa20(x,z,k,sigma);
        for (i = 0; i < b; i++) c[cpos+i] = m[mpos+i] ^ x[i];
      }
      return 0;
    }

    function crypto_stream_salsa20(c,cpos,b,n,k) {
      var z = new Uint8Array(16), x = new Uint8Array(64);
      var u, i;
      for (i = 0; i < 16; i++) z[i] = 0;
      for (i = 0; i < 8; i++) z[i] = n[i];
      while (b >= 64) {
        crypto_core_salsa20(x,z,k,sigma);
        for (i = 0; i < 64; i++) c[cpos+i] = x[i];
        u = 1;
        for (i = 8; i < 16; i++) {
          u = u + (z[i] & 0xff) | 0;
          z[i] = u & 0xff;
          u >>>= 8;
        }
        b -= 64;
        cpos += 64;
      }
      if (b > 0) {
        crypto_core_salsa20(x,z,k,sigma);
        for (i = 0; i < b; i++) c[cpos+i] = x[i];
      }
      return 0;
    }

    function crypto_stream(c,cpos,d,n,k) {
      var s = new Uint8Array(32);
      crypto_core_hsalsa20(s,n,k,sigma);
      var sn = new Uint8Array(8);
      for (var i = 0; i < 8; i++) sn[i] = n[i+16];
      return crypto_stream_salsa20(c,cpos,d,sn,s);
    }

    function crypto_stream_xor(c,cpos,m,mpos,d,n,k) {
      var s = new Uint8Array(32);
      crypto_core_hsalsa20(s,n,k,sigma);
      var sn = new Uint8Array(8);
      for (var i = 0; i < 8; i++) sn[i] = n[i+16];
      return crypto_stream_salsa20_xor(c,cpos,m,mpos,d,sn,s);
    }

    /*
    * Port of Andrew Moon's Poly1305-donna-16. Public domain.
    * https://github.com/floodyberry/poly1305-donna
    */

    var poly1305 = function(key) {
      this.buffer = new Uint8Array(16);
      this.r = new Uint16Array(10);
      this.h = new Uint16Array(10);
      this.pad = new Uint16Array(8);
      this.leftover = 0;
      this.fin = 0;

      var t0, t1, t2, t3, t4, t5, t6, t7;

      t0 = key[ 0] & 0xff | (key[ 1] & 0xff) << 8; this.r[0] = ( t0                     ) & 0x1fff;
      t1 = key[ 2] & 0xff | (key[ 3] & 0xff) << 8; this.r[1] = ((t0 >>> 13) | (t1 <<  3)) & 0x1fff;
      t2 = key[ 4] & 0xff | (key[ 5] & 0xff) << 8; this.r[2] = ((t1 >>> 10) | (t2 <<  6)) & 0x1f03;
      t3 = key[ 6] & 0xff | (key[ 7] & 0xff) << 8; this.r[3] = ((t2 >>>  7) | (t3 <<  9)) & 0x1fff;
      t4 = key[ 8] & 0xff | (key[ 9] & 0xff) << 8; this.r[4] = ((t3 >>>  4) | (t4 << 12)) & 0x00ff;
      this.r[5] = ((t4 >>>  1)) & 0x1ffe;
      t5 = key[10] & 0xff | (key[11] & 0xff) << 8; this.r[6] = ((t4 >>> 14) | (t5 <<  2)) & 0x1fff;
      t6 = key[12] & 0xff | (key[13] & 0xff) << 8; this.r[7] = ((t5 >>> 11) | (t6 <<  5)) & 0x1f81;
      t7 = key[14] & 0xff | (key[15] & 0xff) << 8; this.r[8] = ((t6 >>>  8) | (t7 <<  8)) & 0x1fff;
      this.r[9] = ((t7 >>>  5)) & 0x007f;

      this.pad[0] = key[16] & 0xff | (key[17] & 0xff) << 8;
      this.pad[1] = key[18] & 0xff | (key[19] & 0xff) << 8;
      this.pad[2] = key[20] & 0xff | (key[21] & 0xff) << 8;
      this.pad[3] = key[22] & 0xff | (key[23] & 0xff) << 8;
      this.pad[4] = key[24] & 0xff | (key[25] & 0xff) << 8;
      this.pad[5] = key[26] & 0xff | (key[27] & 0xff) << 8;
      this.pad[6] = key[28] & 0xff | (key[29] & 0xff) << 8;
      this.pad[7] = key[30] & 0xff | (key[31] & 0xff) << 8;
    };

    poly1305.prototype.blocks = function(m, mpos, bytes) {
      var hibit = this.fin ? 0 : (1 << 11);
      var t0, t1, t2, t3, t4, t5, t6, t7, c;
      var d0, d1, d2, d3, d4, d5, d6, d7, d8, d9;

      var h0 = this.h[0],
          h1 = this.h[1],
          h2 = this.h[2],
          h3 = this.h[3],
          h4 = this.h[4],
          h5 = this.h[5],
          h6 = this.h[6],
          h7 = this.h[7],
          h8 = this.h[8],
          h9 = this.h[9];

      var r0 = this.r[0],
          r1 = this.r[1],
          r2 = this.r[2],
          r3 = this.r[3],
          r4 = this.r[4],
          r5 = this.r[5],
          r6 = this.r[6],
          r7 = this.r[7],
          r8 = this.r[8],
          r9 = this.r[9];

      while (bytes >= 16) {
        t0 = m[mpos+ 0] & 0xff | (m[mpos+ 1] & 0xff) << 8; h0 += ( t0                     ) & 0x1fff;
        t1 = m[mpos+ 2] & 0xff | (m[mpos+ 3] & 0xff) << 8; h1 += ((t0 >>> 13) | (t1 <<  3)) & 0x1fff;
        t2 = m[mpos+ 4] & 0xff | (m[mpos+ 5] & 0xff) << 8; h2 += ((t1 >>> 10) | (t2 <<  6)) & 0x1fff;
        t3 = m[mpos+ 6] & 0xff | (m[mpos+ 7] & 0xff) << 8; h3 += ((t2 >>>  7) | (t3 <<  9)) & 0x1fff;
        t4 = m[mpos+ 8] & 0xff | (m[mpos+ 9] & 0xff) << 8; h4 += ((t3 >>>  4) | (t4 << 12)) & 0x1fff;
        h5 += ((t4 >>>  1)) & 0x1fff;
        t5 = m[mpos+10] & 0xff | (m[mpos+11] & 0xff) << 8; h6 += ((t4 >>> 14) | (t5 <<  2)) & 0x1fff;
        t6 = m[mpos+12] & 0xff | (m[mpos+13] & 0xff) << 8; h7 += ((t5 >>> 11) | (t6 <<  5)) & 0x1fff;
        t7 = m[mpos+14] & 0xff | (m[mpos+15] & 0xff) << 8; h8 += ((t6 >>>  8) | (t7 <<  8)) & 0x1fff;
        h9 += ((t7 >>> 5)) | hibit;

        c = 0;

        d0 = c;
        d0 += h0 * r0;
        d0 += h1 * (5 * r9);
        d0 += h2 * (5 * r8);
        d0 += h3 * (5 * r7);
        d0 += h4 * (5 * r6);
        c = (d0 >>> 13); d0 &= 0x1fff;
        d0 += h5 * (5 * r5);
        d0 += h6 * (5 * r4);
        d0 += h7 * (5 * r3);
        d0 += h8 * (5 * r2);
        d0 += h9 * (5 * r1);
        c += (d0 >>> 13); d0 &= 0x1fff;

        d1 = c;
        d1 += h0 * r1;
        d1 += h1 * r0;
        d1 += h2 * (5 * r9);
        d1 += h3 * (5 * r8);
        d1 += h4 * (5 * r7);
        c = (d1 >>> 13); d1 &= 0x1fff;
        d1 += h5 * (5 * r6);
        d1 += h6 * (5 * r5);
        d1 += h7 * (5 * r4);
        d1 += h8 * (5 * r3);
        d1 += h9 * (5 * r2);
        c += (d1 >>> 13); d1 &= 0x1fff;

        d2 = c;
        d2 += h0 * r2;
        d2 += h1 * r1;
        d2 += h2 * r0;
        d2 += h3 * (5 * r9);
        d2 += h4 * (5 * r8);
        c = (d2 >>> 13); d2 &= 0x1fff;
        d2 += h5 * (5 * r7);
        d2 += h6 * (5 * r6);
        d2 += h7 * (5 * r5);
        d2 += h8 * (5 * r4);
        d2 += h9 * (5 * r3);
        c += (d2 >>> 13); d2 &= 0x1fff;

        d3 = c;
        d3 += h0 * r3;
        d3 += h1 * r2;
        d3 += h2 * r1;
        d3 += h3 * r0;
        d3 += h4 * (5 * r9);
        c = (d3 >>> 13); d3 &= 0x1fff;
        d3 += h5 * (5 * r8);
        d3 += h6 * (5 * r7);
        d3 += h7 * (5 * r6);
        d3 += h8 * (5 * r5);
        d3 += h9 * (5 * r4);
        c += (d3 >>> 13); d3 &= 0x1fff;

        d4 = c;
        d4 += h0 * r4;
        d4 += h1 * r3;
        d4 += h2 * r2;
        d4 += h3 * r1;
        d4 += h4 * r0;
        c = (d4 >>> 13); d4 &= 0x1fff;
        d4 += h5 * (5 * r9);
        d4 += h6 * (5 * r8);
        d4 += h7 * (5 * r7);
        d4 += h8 * (5 * r6);
        d4 += h9 * (5 * r5);
        c += (d4 >>> 13); d4 &= 0x1fff;

        d5 = c;
        d5 += h0 * r5;
        d5 += h1 * r4;
        d5 += h2 * r3;
        d5 += h3 * r2;
        d5 += h4 * r1;
        c = (d5 >>> 13); d5 &= 0x1fff;
        d5 += h5 * r0;
        d5 += h6 * (5 * r9);
        d5 += h7 * (5 * r8);
        d5 += h8 * (5 * r7);
        d5 += h9 * (5 * r6);
        c += (d5 >>> 13); d5 &= 0x1fff;

        d6 = c;
        d6 += h0 * r6;
        d6 += h1 * r5;
        d6 += h2 * r4;
        d6 += h3 * r3;
        d6 += h4 * r2;
        c = (d6 >>> 13); d6 &= 0x1fff;
        d6 += h5 * r1;
        d6 += h6 * r0;
        d6 += h7 * (5 * r9);
        d6 += h8 * (5 * r8);
        d6 += h9 * (5 * r7);
        c += (d6 >>> 13); d6 &= 0x1fff;

        d7 = c;
        d7 += h0 * r7;
        d7 += h1 * r6;
        d7 += h2 * r5;
        d7 += h3 * r4;
        d7 += h4 * r3;
        c = (d7 >>> 13); d7 &= 0x1fff;
        d7 += h5 * r2;
        d7 += h6 * r1;
        d7 += h7 * r0;
        d7 += h8 * (5 * r9);
        d7 += h9 * (5 * r8);
        c += (d7 >>> 13); d7 &= 0x1fff;

        d8 = c;
        d8 += h0 * r8;
        d8 += h1 * r7;
        d8 += h2 * r6;
        d8 += h3 * r5;
        d8 += h4 * r4;
        c = (d8 >>> 13); d8 &= 0x1fff;
        d8 += h5 * r3;
        d8 += h6 * r2;
        d8 += h7 * r1;
        d8 += h8 * r0;
        d8 += h9 * (5 * r9);
        c += (d8 >>> 13); d8 &= 0x1fff;

        d9 = c;
        d9 += h0 * r9;
        d9 += h1 * r8;
        d9 += h2 * r7;
        d9 += h3 * r6;
        d9 += h4 * r5;
        c = (d9 >>> 13); d9 &= 0x1fff;
        d9 += h5 * r4;
        d9 += h6 * r3;
        d9 += h7 * r2;
        d9 += h8 * r1;
        d9 += h9 * r0;
        c += (d9 >>> 13); d9 &= 0x1fff;

        c = (((c << 2) + c)) | 0;
        c = (c + d0) | 0;
        d0 = c & 0x1fff;
        c = (c >>> 13);
        d1 += c;

        h0 = d0;
        h1 = d1;
        h2 = d2;
        h3 = d3;
        h4 = d4;
        h5 = d5;
        h6 = d6;
        h7 = d7;
        h8 = d8;
        h9 = d9;

        mpos += 16;
        bytes -= 16;
      }
      this.h[0] = h0;
      this.h[1] = h1;
      this.h[2] = h2;
      this.h[3] = h3;
      this.h[4] = h4;
      this.h[5] = h5;
      this.h[6] = h6;
      this.h[7] = h7;
      this.h[8] = h8;
      this.h[9] = h9;
    };

    poly1305.prototype.finish = function(mac, macpos) {
      var g = new Uint16Array(10);
      var c, mask, f, i;

      if (this.leftover) {
        i = this.leftover;
        this.buffer[i++] = 1;
        for (; i < 16; i++) this.buffer[i] = 0;
        this.fin = 1;
        this.blocks(this.buffer, 0, 16);
      }

      c = this.h[1] >>> 13;
      this.h[1] &= 0x1fff;
      for (i = 2; i < 10; i++) {
        this.h[i] += c;
        c = this.h[i] >>> 13;
        this.h[i] &= 0x1fff;
      }
      this.h[0] += (c * 5);
      c = this.h[0] >>> 13;
      this.h[0] &= 0x1fff;
      this.h[1] += c;
      c = this.h[1] >>> 13;
      this.h[1] &= 0x1fff;
      this.h[2] += c;

      g[0] = this.h[0] + 5;
      c = g[0] >>> 13;
      g[0] &= 0x1fff;
      for (i = 1; i < 10; i++) {
        g[i] = this.h[i] + c;
        c = g[i] >>> 13;
        g[i] &= 0x1fff;
      }
      g[9] -= (1 << 13);

      mask = (c ^ 1) - 1;
      for (i = 0; i < 10; i++) g[i] &= mask;
      mask = ~mask;
      for (i = 0; i < 10; i++) this.h[i] = (this.h[i] & mask) | g[i];

      this.h[0] = ((this.h[0]       ) | (this.h[1] << 13)                    ) & 0xffff;
      this.h[1] = ((this.h[1] >>>  3) | (this.h[2] << 10)                    ) & 0xffff;
      this.h[2] = ((this.h[2] >>>  6) | (this.h[3] <<  7)                    ) & 0xffff;
      this.h[3] = ((this.h[3] >>>  9) | (this.h[4] <<  4)                    ) & 0xffff;
      this.h[4] = ((this.h[4] >>> 12) | (this.h[5] <<  1) | (this.h[6] << 14)) & 0xffff;
      this.h[5] = ((this.h[6] >>>  2) | (this.h[7] << 11)                    ) & 0xffff;
      this.h[6] = ((this.h[7] >>>  5) | (this.h[8] <<  8)                    ) & 0xffff;
      this.h[7] = ((this.h[8] >>>  8) | (this.h[9] <<  5)                    ) & 0xffff;

      f = this.h[0] + this.pad[0];
      this.h[0] = f & 0xffff;
      for (i = 1; i < 8; i++) {
        f = (((this.h[i] + this.pad[i]) | 0) + (f >>> 16)) | 0;
        this.h[i] = f & 0xffff;
      }

      mac[macpos+ 0] = (this.h[0] >>> 0) & 0xff;
      mac[macpos+ 1] = (this.h[0] >>> 8) & 0xff;
      mac[macpos+ 2] = (this.h[1] >>> 0) & 0xff;
      mac[macpos+ 3] = (this.h[1] >>> 8) & 0xff;
      mac[macpos+ 4] = (this.h[2] >>> 0) & 0xff;
      mac[macpos+ 5] = (this.h[2] >>> 8) & 0xff;
      mac[macpos+ 6] = (this.h[3] >>> 0) & 0xff;
      mac[macpos+ 7] = (this.h[3] >>> 8) & 0xff;
      mac[macpos+ 8] = (this.h[4] >>> 0) & 0xff;
      mac[macpos+ 9] = (this.h[4] >>> 8) & 0xff;
      mac[macpos+10] = (this.h[5] >>> 0) & 0xff;
      mac[macpos+11] = (this.h[5] >>> 8) & 0xff;
      mac[macpos+12] = (this.h[6] >>> 0) & 0xff;
      mac[macpos+13] = (this.h[6] >>> 8) & 0xff;
      mac[macpos+14] = (this.h[7] >>> 0) & 0xff;
      mac[macpos+15] = (this.h[7] >>> 8) & 0xff;
    };

    poly1305.prototype.update = function(m, mpos, bytes) {
      var i, want;

      if (this.leftover) {
        want = (16 - this.leftover);
        if (want > bytes)
          want = bytes;
        for (i = 0; i < want; i++)
          this.buffer[this.leftover + i] = m[mpos+i];
        bytes -= want;
        mpos += want;
        this.leftover += want;
        if (this.leftover < 16)
          return;
        this.blocks(this.buffer, 0, 16);
        this.leftover = 0;
      }

      if (bytes >= 16) {
        want = bytes - (bytes % 16);
        this.blocks(m, mpos, want);
        mpos += want;
        bytes -= want;
      }

      if (bytes) {
        for (i = 0; i < bytes; i++)
          this.buffer[this.leftover + i] = m[mpos+i];
        this.leftover += bytes;
      }
    };

    function crypto_onetimeauth(out, outpos, m, mpos, n, k) {
      var s = new poly1305(k);
      s.update(m, mpos, n);
      s.finish(out, outpos);
      return 0;
    }

    function crypto_onetimeauth_verify(h, hpos, m, mpos, n, k) {
      var x = new Uint8Array(16);
      crypto_onetimeauth(x,0,m,mpos,n,k);
      return crypto_verify_16(h,hpos,x,0);
    }

    function crypto_secretbox(c,m,d,n,k) {
      var i;
      if (d < 32) return -1;
      crypto_stream_xor(c,0,m,0,d,n,k);
      crypto_onetimeauth(c, 16, c, 32, d - 32, c);
      for (i = 0; i < 16; i++) c[i] = 0;
      return 0;
    }

    function crypto_secretbox_open(m,c,d,n,k) {
      var i;
      var x = new Uint8Array(32);
      if (d < 32) return -1;
      crypto_stream(x,0,32,n,k);
      if (crypto_onetimeauth_verify(c, 16,c, 32,d - 32,x) !== 0) return -1;
      crypto_stream_xor(m,0,c,0,d,n,k);
      for (i = 0; i < 32; i++) m[i] = 0;
      return 0;
    }

    function set25519(r, a) {
      var i;
      for (i = 0; i < 16; i++) r[i] = a[i]|0;
    }

    function car25519(o) {
      var i, v, c = 1;
      for (i = 0; i < 16; i++) {
        v = o[i] + c + 65535;
        c = Math.floor(v / 65536);
        o[i] = v - c * 65536;
      }
      o[0] += c-1 + 37 * (c-1);
    }

    function sel25519(p, q, b) {
      var t, c = ~(b-1);
      for (var i = 0; i < 16; i++) {
        t = c & (p[i] ^ q[i]);
        p[i] ^= t;
        q[i] ^= t;
      }
    }

    function pack25519(o, n) {
      var i, j, b;
      var m = gf(), t = gf();
      for (i = 0; i < 16; i++) t[i] = n[i];
      car25519(t);
      car25519(t);
      car25519(t);
      for (j = 0; j < 2; j++) {
        m[0] = t[0] - 0xffed;
        for (i = 1; i < 15; i++) {
          m[i] = t[i] - 0xffff - ((m[i-1]>>16) & 1);
          m[i-1] &= 0xffff;
        }
        m[15] = t[15] - 0x7fff - ((m[14]>>16) & 1);
        b = (m[15]>>16) & 1;
        m[14] &= 0xffff;
        sel25519(t, m, 1-b);
      }
      for (i = 0; i < 16; i++) {
        o[2*i] = t[i] & 0xff;
        o[2*i+1] = t[i]>>8;
      }
    }

    function neq25519(a, b) {
      var c = new Uint8Array(32), d = new Uint8Array(32);
      pack25519(c, a);
      pack25519(d, b);
      return crypto_verify_32(c, 0, d, 0);
    }

    function par25519(a) {
      var d = new Uint8Array(32);
      pack25519(d, a);
      return d[0] & 1;
    }

    function unpack25519(o, n) {
      var i;
      for (i = 0; i < 16; i++) o[i] = n[2*i] + (n[2*i+1] << 8);
      o[15] &= 0x7fff;
    }

    function A(o, a, b) {
      for (var i = 0; i < 16; i++) o[i] = a[i] + b[i];
    }

    function Z(o, a, b) {
      for (var i = 0; i < 16; i++) o[i] = a[i] - b[i];
    }

    function M(o, a, b) {
      var v, c,
         t0 = 0,  t1 = 0,  t2 = 0,  t3 = 0,  t4 = 0,  t5 = 0,  t6 = 0,  t7 = 0,
         t8 = 0,  t9 = 0, t10 = 0, t11 = 0, t12 = 0, t13 = 0, t14 = 0, t15 = 0,
        t16 = 0, t17 = 0, t18 = 0, t19 = 0, t20 = 0, t21 = 0, t22 = 0, t23 = 0,
        t24 = 0, t25 = 0, t26 = 0, t27 = 0, t28 = 0, t29 = 0, t30 = 0,
        b0 = b[0],
        b1 = b[1],
        b2 = b[2],
        b3 = b[3],
        b4 = b[4],
        b5 = b[5],
        b6 = b[6],
        b7 = b[7],
        b8 = b[8],
        b9 = b[9],
        b10 = b[10],
        b11 = b[11],
        b12 = b[12],
        b13 = b[13],
        b14 = b[14],
        b15 = b[15];

      v = a[0];
      t0 += v * b0;
      t1 += v * b1;
      t2 += v * b2;
      t3 += v * b3;
      t4 += v * b4;
      t5 += v * b5;
      t6 += v * b6;
      t7 += v * b7;
      t8 += v * b8;
      t9 += v * b9;
      t10 += v * b10;
      t11 += v * b11;
      t12 += v * b12;
      t13 += v * b13;
      t14 += v * b14;
      t15 += v * b15;
      v = a[1];
      t1 += v * b0;
      t2 += v * b1;
      t3 += v * b2;
      t4 += v * b3;
      t5 += v * b4;
      t6 += v * b5;
      t7 += v * b6;
      t8 += v * b7;
      t9 += v * b8;
      t10 += v * b9;
      t11 += v * b10;
      t12 += v * b11;
      t13 += v * b12;
      t14 += v * b13;
      t15 += v * b14;
      t16 += v * b15;
      v = a[2];
      t2 += v * b0;
      t3 += v * b1;
      t4 += v * b2;
      t5 += v * b3;
      t6 += v * b4;
      t7 += v * b5;
      t8 += v * b6;
      t9 += v * b7;
      t10 += v * b8;
      t11 += v * b9;
      t12 += v * b10;
      t13 += v * b11;
      t14 += v * b12;
      t15 += v * b13;
      t16 += v * b14;
      t17 += v * b15;
      v = a[3];
      t3 += v * b0;
      t4 += v * b1;
      t5 += v * b2;
      t6 += v * b3;
      t7 += v * b4;
      t8 += v * b5;
      t9 += v * b6;
      t10 += v * b7;
      t11 += v * b8;
      t12 += v * b9;
      t13 += v * b10;
      t14 += v * b11;
      t15 += v * b12;
      t16 += v * b13;
      t17 += v * b14;
      t18 += v * b15;
      v = a[4];
      t4 += v * b0;
      t5 += v * b1;
      t6 += v * b2;
      t7 += v * b3;
      t8 += v * b4;
      t9 += v * b5;
      t10 += v * b6;
      t11 += v * b7;
      t12 += v * b8;
      t13 += v * b9;
      t14 += v * b10;
      t15 += v * b11;
      t16 += v * b12;
      t17 += v * b13;
      t18 += v * b14;
      t19 += v * b15;
      v = a[5];
      t5 += v * b0;
      t6 += v * b1;
      t7 += v * b2;
      t8 += v * b3;
      t9 += v * b4;
      t10 += v * b5;
      t11 += v * b6;
      t12 += v * b7;
      t13 += v * b8;
      t14 += v * b9;
      t15 += v * b10;
      t16 += v * b11;
      t17 += v * b12;
      t18 += v * b13;
      t19 += v * b14;
      t20 += v * b15;
      v = a[6];
      t6 += v * b0;
      t7 += v * b1;
      t8 += v * b2;
      t9 += v * b3;
      t10 += v * b4;
      t11 += v * b5;
      t12 += v * b6;
      t13 += v * b7;
      t14 += v * b8;
      t15 += v * b9;
      t16 += v * b10;
      t17 += v * b11;
      t18 += v * b12;
      t19 += v * b13;
      t20 += v * b14;
      t21 += v * b15;
      v = a[7];
      t7 += v * b0;
      t8 += v * b1;
      t9 += v * b2;
      t10 += v * b3;
      t11 += v * b4;
      t12 += v * b5;
      t13 += v * b6;
      t14 += v * b7;
      t15 += v * b8;
      t16 += v * b9;
      t17 += v * b10;
      t18 += v * b11;
      t19 += v * b12;
      t20 += v * b13;
      t21 += v * b14;
      t22 += v * b15;
      v = a[8];
      t8 += v * b0;
      t9 += v * b1;
      t10 += v * b2;
      t11 += v * b3;
      t12 += v * b4;
      t13 += v * b5;
      t14 += v * b6;
      t15 += v * b7;
      t16 += v * b8;
      t17 += v * b9;
      t18 += v * b10;
      t19 += v * b11;
      t20 += v * b12;
      t21 += v * b13;
      t22 += v * b14;
      t23 += v * b15;
      v = a[9];
      t9 += v * b0;
      t10 += v * b1;
      t11 += v * b2;
      t12 += v * b3;
      t13 += v * b4;
      t14 += v * b5;
      t15 += v * b6;
      t16 += v * b7;
      t17 += v * b8;
      t18 += v * b9;
      t19 += v * b10;
      t20 += v * b11;
      t21 += v * b12;
      t22 += v * b13;
      t23 += v * b14;
      t24 += v * b15;
      v = a[10];
      t10 += v * b0;
      t11 += v * b1;
      t12 += v * b2;
      t13 += v * b3;
      t14 += v * b4;
      t15 += v * b5;
      t16 += v * b6;
      t17 += v * b7;
      t18 += v * b8;
      t19 += v * b9;
      t20 += v * b10;
      t21 += v * b11;
      t22 += v * b12;
      t23 += v * b13;
      t24 += v * b14;
      t25 += v * b15;
      v = a[11];
      t11 += v * b0;
      t12 += v * b1;
      t13 += v * b2;
      t14 += v * b3;
      t15 += v * b4;
      t16 += v * b5;
      t17 += v * b6;
      t18 += v * b7;
      t19 += v * b8;
      t20 += v * b9;
      t21 += v * b10;
      t22 += v * b11;
      t23 += v * b12;
      t24 += v * b13;
      t25 += v * b14;
      t26 += v * b15;
      v = a[12];
      t12 += v * b0;
      t13 += v * b1;
      t14 += v * b2;
      t15 += v * b3;
      t16 += v * b4;
      t17 += v * b5;
      t18 += v * b6;
      t19 += v * b7;
      t20 += v * b8;
      t21 += v * b9;
      t22 += v * b10;
      t23 += v * b11;
      t24 += v * b12;
      t25 += v * b13;
      t26 += v * b14;
      t27 += v * b15;
      v = a[13];
      t13 += v * b0;
      t14 += v * b1;
      t15 += v * b2;
      t16 += v * b3;
      t17 += v * b4;
      t18 += v * b5;
      t19 += v * b6;
      t20 += v * b7;
      t21 += v * b8;
      t22 += v * b9;
      t23 += v * b10;
      t24 += v * b11;
      t25 += v * b12;
      t26 += v * b13;
      t27 += v * b14;
      t28 += v * b15;
      v = a[14];
      t14 += v * b0;
      t15 += v * b1;
      t16 += v * b2;
      t17 += v * b3;
      t18 += v * b4;
      t19 += v * b5;
      t20 += v * b6;
      t21 += v * b7;
      t22 += v * b8;
      t23 += v * b9;
      t24 += v * b10;
      t25 += v * b11;
      t26 += v * b12;
      t27 += v * b13;
      t28 += v * b14;
      t29 += v * b15;
      v = a[15];
      t15 += v * b0;
      t16 += v * b1;
      t17 += v * b2;
      t18 += v * b3;
      t19 += v * b4;
      t20 += v * b5;
      t21 += v * b6;
      t22 += v * b7;
      t23 += v * b8;
      t24 += v * b9;
      t25 += v * b10;
      t26 += v * b11;
      t27 += v * b12;
      t28 += v * b13;
      t29 += v * b14;
      t30 += v * b15;

      t0  += 38 * t16;
      t1  += 38 * t17;
      t2  += 38 * t18;
      t3  += 38 * t19;
      t4  += 38 * t20;
      t5  += 38 * t21;
      t6  += 38 * t22;
      t7  += 38 * t23;
      t8  += 38 * t24;
      t9  += 38 * t25;
      t10 += 38 * t26;
      t11 += 38 * t27;
      t12 += 38 * t28;
      t13 += 38 * t29;
      t14 += 38 * t30;
      // t15 left as is

      // first car
      c = 1;
      v =  t0 + c + 65535; c = Math.floor(v / 65536);  t0 = v - c * 65536;
      v =  t1 + c + 65535; c = Math.floor(v / 65536);  t1 = v - c * 65536;
      v =  t2 + c + 65535; c = Math.floor(v / 65536);  t2 = v - c * 65536;
      v =  t3 + c + 65535; c = Math.floor(v / 65536);  t3 = v - c * 65536;
      v =  t4 + c + 65535; c = Math.floor(v / 65536);  t4 = v - c * 65536;
      v =  t5 + c + 65535; c = Math.floor(v / 65536);  t5 = v - c * 65536;
      v =  t6 + c + 65535; c = Math.floor(v / 65536);  t6 = v - c * 65536;
      v =  t7 + c + 65535; c = Math.floor(v / 65536);  t7 = v - c * 65536;
      v =  t8 + c + 65535; c = Math.floor(v / 65536);  t8 = v - c * 65536;
      v =  t9 + c + 65535; c = Math.floor(v / 65536);  t9 = v - c * 65536;
      v = t10 + c + 65535; c = Math.floor(v / 65536); t10 = v - c * 65536;
      v = t11 + c + 65535; c = Math.floor(v / 65536); t11 = v - c * 65536;
      v = t12 + c + 65535; c = Math.floor(v / 65536); t12 = v - c * 65536;
      v = t13 + c + 65535; c = Math.floor(v / 65536); t13 = v - c * 65536;
      v = t14 + c + 65535; c = Math.floor(v / 65536); t14 = v - c * 65536;
      v = t15 + c + 65535; c = Math.floor(v / 65536); t15 = v - c * 65536;
      t0 += c-1 + 37 * (c-1);

      // second car
      c = 1;
      v =  t0 + c + 65535; c = Math.floor(v / 65536);  t0 = v - c * 65536;
      v =  t1 + c + 65535; c = Math.floor(v / 65536);  t1 = v - c * 65536;
      v =  t2 + c + 65535; c = Math.floor(v / 65536);  t2 = v - c * 65536;
      v =  t3 + c + 65535; c = Math.floor(v / 65536);  t3 = v - c * 65536;
      v =  t4 + c + 65535; c = Math.floor(v / 65536);  t4 = v - c * 65536;
      v =  t5 + c + 65535; c = Math.floor(v / 65536);  t5 = v - c * 65536;
      v =  t6 + c + 65535; c = Math.floor(v / 65536);  t6 = v - c * 65536;
      v =  t7 + c + 65535; c = Math.floor(v / 65536);  t7 = v - c * 65536;
      v =  t8 + c + 65535; c = Math.floor(v / 65536);  t8 = v - c * 65536;
      v =  t9 + c + 65535; c = Math.floor(v / 65536);  t9 = v - c * 65536;
      v = t10 + c + 65535; c = Math.floor(v / 65536); t10 = v - c * 65536;
      v = t11 + c + 65535; c = Math.floor(v / 65536); t11 = v - c * 65536;
      v = t12 + c + 65535; c = Math.floor(v / 65536); t12 = v - c * 65536;
      v = t13 + c + 65535; c = Math.floor(v / 65536); t13 = v - c * 65536;
      v = t14 + c + 65535; c = Math.floor(v / 65536); t14 = v - c * 65536;
      v = t15 + c + 65535; c = Math.floor(v / 65536); t15 = v - c * 65536;
      t0 += c-1 + 37 * (c-1);

      o[ 0] = t0;
      o[ 1] = t1;
      o[ 2] = t2;
      o[ 3] = t3;
      o[ 4] = t4;
      o[ 5] = t5;
      o[ 6] = t6;
      o[ 7] = t7;
      o[ 8] = t8;
      o[ 9] = t9;
      o[10] = t10;
      o[11] = t11;
      o[12] = t12;
      o[13] = t13;
      o[14] = t14;
      o[15] = t15;
    }

    function S(o, a) {
      M(o, a, a);
    }

    function inv25519(o, i) {
      var c = gf();
      var a;
      for (a = 0; a < 16; a++) c[a] = i[a];
      for (a = 253; a >= 0; a--) {
        S(c, c);
        if(a !== 2 && a !== 4) M(c, c, i);
      }
      for (a = 0; a < 16; a++) o[a] = c[a];
    }

    function pow2523(o, i) {
      var c = gf();
      var a;
      for (a = 0; a < 16; a++) c[a] = i[a];
      for (a = 250; a >= 0; a--) {
          S(c, c);
          if(a !== 1) M(c, c, i);
      }
      for (a = 0; a < 16; a++) o[a] = c[a];
    }

    function crypto_scalarmult(q, n, p) {
      var z = new Uint8Array(32);
      var x = new Float64Array(80), r, i;
      var a = gf(), b = gf(), c = gf(),
          d = gf(), e = gf(), f = gf();
      for (i = 0; i < 31; i++) z[i] = n[i];
      z[31]=(n[31]&127)|64;
      z[0]&=248;
      unpack25519(x,p);
      for (i = 0; i < 16; i++) {
        b[i]=x[i];
        d[i]=a[i]=c[i]=0;
      }
      a[0]=d[0]=1;
      for (i=254; i>=0; --i) {
        r=(z[i>>>3]>>>(i&7))&1;
        sel25519(a,b,r);
        sel25519(c,d,r);
        A(e,a,c);
        Z(a,a,c);
        A(c,b,d);
        Z(b,b,d);
        S(d,e);
        S(f,a);
        M(a,c,a);
        M(c,b,e);
        A(e,a,c);
        Z(a,a,c);
        S(b,a);
        Z(c,d,f);
        M(a,c,_121665);
        A(a,a,d);
        M(c,c,a);
        M(a,d,f);
        M(d,b,x);
        S(b,e);
        sel25519(a,b,r);
        sel25519(c,d,r);
      }
      for (i = 0; i < 16; i++) {
        x[i+16]=a[i];
        x[i+32]=c[i];
        x[i+48]=b[i];
        x[i+64]=d[i];
      }
      var x32 = x.subarray(32);
      var x16 = x.subarray(16);
      inv25519(x32,x32);
      M(x16,x16,x32);
      pack25519(q,x16);
      return 0;
    }

    function crypto_scalarmult_base(q, n) {
      return crypto_scalarmult(q, n, _9);
    }

    function crypto_box_keypair(y, x) {
      randombytes(x, 32);
      return crypto_scalarmult_base(y, x);
    }

    function crypto_box_beforenm(k, y, x) {
      var s = new Uint8Array(32);
      crypto_scalarmult(s, x, y);
      return crypto_core_hsalsa20(k, _0, s, sigma);
    }

    var crypto_box_afternm = crypto_secretbox;
    var crypto_box_open_afternm = crypto_secretbox_open;

    function crypto_box(c, m, d, n, y, x) {
      var k = new Uint8Array(32);
      crypto_box_beforenm(k, y, x);
      return crypto_box_afternm(c, m, d, n, k);
    }

    function crypto_box_open(m, c, d, n, y, x) {
      var k = new Uint8Array(32);
      crypto_box_beforenm(k, y, x);
      return crypto_box_open_afternm(m, c, d, n, k);
    }

    var K = [
      0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
      0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
      0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
      0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
      0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
      0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
      0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
      0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
      0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
      0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
      0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
      0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
      0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
      0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
      0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
      0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
      0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
      0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
      0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
      0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
      0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
      0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
      0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
      0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
      0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
      0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
      0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
      0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
      0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
      0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
      0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
      0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
      0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
      0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
      0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
      0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
      0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
      0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
      0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
      0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
    ];

    function crypto_hashblocks_hl(hh, hl, m, n) {
      var wh = new Int32Array(16), wl = new Int32Array(16),
          bh0, bh1, bh2, bh3, bh4, bh5, bh6, bh7,
          bl0, bl1, bl2, bl3, bl4, bl5, bl6, bl7,
          th, tl, i, j, h, l, a, b, c, d;

      var ah0 = hh[0],
          ah1 = hh[1],
          ah2 = hh[2],
          ah3 = hh[3],
          ah4 = hh[4],
          ah5 = hh[5],
          ah6 = hh[6],
          ah7 = hh[7],

          al0 = hl[0],
          al1 = hl[1],
          al2 = hl[2],
          al3 = hl[3],
          al4 = hl[4],
          al5 = hl[5],
          al6 = hl[6],
          al7 = hl[7];

      var pos = 0;
      while (n >= 128) {
        for (i = 0; i < 16; i++) {
          j = 8 * i + pos;
          wh[i] = (m[j+0] << 24) | (m[j+1] << 16) | (m[j+2] << 8) | m[j+3];
          wl[i] = (m[j+4] << 24) | (m[j+5] << 16) | (m[j+6] << 8) | m[j+7];
        }
        for (i = 0; i < 80; i++) {
          bh0 = ah0;
          bh1 = ah1;
          bh2 = ah2;
          bh3 = ah3;
          bh4 = ah4;
          bh5 = ah5;
          bh6 = ah6;
          bh7 = ah7;

          bl0 = al0;
          bl1 = al1;
          bl2 = al2;
          bl3 = al3;
          bl4 = al4;
          bl5 = al5;
          bl6 = al6;
          bl7 = al7;

          // add
          h = ah7;
          l = al7;

          a = l & 0xffff; b = l >>> 16;
          c = h & 0xffff; d = h >>> 16;

          // Sigma1
          h = ((ah4 >>> 14) | (al4 << (32-14))) ^ ((ah4 >>> 18) | (al4 << (32-18))) ^ ((al4 >>> (41-32)) | (ah4 << (32-(41-32))));
          l = ((al4 >>> 14) | (ah4 << (32-14))) ^ ((al4 >>> 18) | (ah4 << (32-18))) ^ ((ah4 >>> (41-32)) | (al4 << (32-(41-32))));

          a += l & 0xffff; b += l >>> 16;
          c += h & 0xffff; d += h >>> 16;

          // Ch
          h = (ah4 & ah5) ^ (~ah4 & ah6);
          l = (al4 & al5) ^ (~al4 & al6);

          a += l & 0xffff; b += l >>> 16;
          c += h & 0xffff; d += h >>> 16;

          // K
          h = K[i*2];
          l = K[i*2+1];

          a += l & 0xffff; b += l >>> 16;
          c += h & 0xffff; d += h >>> 16;

          // w
          h = wh[i%16];
          l = wl[i%16];

          a += l & 0xffff; b += l >>> 16;
          c += h & 0xffff; d += h >>> 16;

          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;

          th = c & 0xffff | d << 16;
          tl = a & 0xffff | b << 16;

          // add
          h = th;
          l = tl;

          a = l & 0xffff; b = l >>> 16;
          c = h & 0xffff; d = h >>> 16;

          // Sigma0
          h = ((ah0 >>> 28) | (al0 << (32-28))) ^ ((al0 >>> (34-32)) | (ah0 << (32-(34-32)))) ^ ((al0 >>> (39-32)) | (ah0 << (32-(39-32))));
          l = ((al0 >>> 28) | (ah0 << (32-28))) ^ ((ah0 >>> (34-32)) | (al0 << (32-(34-32)))) ^ ((ah0 >>> (39-32)) | (al0 << (32-(39-32))));

          a += l & 0xffff; b += l >>> 16;
          c += h & 0xffff; d += h >>> 16;

          // Maj
          h = (ah0 & ah1) ^ (ah0 & ah2) ^ (ah1 & ah2);
          l = (al0 & al1) ^ (al0 & al2) ^ (al1 & al2);

          a += l & 0xffff; b += l >>> 16;
          c += h & 0xffff; d += h >>> 16;

          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;

          bh7 = (c & 0xffff) | (d << 16);
          bl7 = (a & 0xffff) | (b << 16);

          // add
          h = bh3;
          l = bl3;

          a = l & 0xffff; b = l >>> 16;
          c = h & 0xffff; d = h >>> 16;

          h = th;
          l = tl;

          a += l & 0xffff; b += l >>> 16;
          c += h & 0xffff; d += h >>> 16;

          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;

          bh3 = (c & 0xffff) | (d << 16);
          bl3 = (a & 0xffff) | (b << 16);

          ah1 = bh0;
          ah2 = bh1;
          ah3 = bh2;
          ah4 = bh3;
          ah5 = bh4;
          ah6 = bh5;
          ah7 = bh6;
          ah0 = bh7;

          al1 = bl0;
          al2 = bl1;
          al3 = bl2;
          al4 = bl3;
          al5 = bl4;
          al6 = bl5;
          al7 = bl6;
          al0 = bl7;

          if (i%16 === 15) {
            for (j = 0; j < 16; j++) {
              // add
              h = wh[j];
              l = wl[j];

              a = l & 0xffff; b = l >>> 16;
              c = h & 0xffff; d = h >>> 16;

              h = wh[(j+9)%16];
              l = wl[(j+9)%16];

              a += l & 0xffff; b += l >>> 16;
              c += h & 0xffff; d += h >>> 16;

              // sigma0
              th = wh[(j+1)%16];
              tl = wl[(j+1)%16];
              h = ((th >>> 1) | (tl << (32-1))) ^ ((th >>> 8) | (tl << (32-8))) ^ (th >>> 7);
              l = ((tl >>> 1) | (th << (32-1))) ^ ((tl >>> 8) | (th << (32-8))) ^ ((tl >>> 7) | (th << (32-7)));

              a += l & 0xffff; b += l >>> 16;
              c += h & 0xffff; d += h >>> 16;

              // sigma1
              th = wh[(j+14)%16];
              tl = wl[(j+14)%16];
              h = ((th >>> 19) | (tl << (32-19))) ^ ((tl >>> (61-32)) | (th << (32-(61-32)))) ^ (th >>> 6);
              l = ((tl >>> 19) | (th << (32-19))) ^ ((th >>> (61-32)) | (tl << (32-(61-32)))) ^ ((tl >>> 6) | (th << (32-6)));

              a += l & 0xffff; b += l >>> 16;
              c += h & 0xffff; d += h >>> 16;

              b += a >>> 16;
              c += b >>> 16;
              d += c >>> 16;

              wh[j] = (c & 0xffff) | (d << 16);
              wl[j] = (a & 0xffff) | (b << 16);
            }
          }
        }

        // add
        h = ah0;
        l = al0;

        a = l & 0xffff; b = l >>> 16;
        c = h & 0xffff; d = h >>> 16;

        h = hh[0];
        l = hl[0];

        a += l & 0xffff; b += l >>> 16;
        c += h & 0xffff; d += h >>> 16;

        b += a >>> 16;
        c += b >>> 16;
        d += c >>> 16;

        hh[0] = ah0 = (c & 0xffff) | (d << 16);
        hl[0] = al0 = (a & 0xffff) | (b << 16);

        h = ah1;
        l = al1;

        a = l & 0xffff; b = l >>> 16;
        c = h & 0xffff; d = h >>> 16;

        h = hh[1];
        l = hl[1];

        a += l & 0xffff; b += l >>> 16;
        c += h & 0xffff; d += h >>> 16;

        b += a >>> 16;
        c += b >>> 16;
        d += c >>> 16;

        hh[1] = ah1 = (c & 0xffff) | (d << 16);
        hl[1] = al1 = (a & 0xffff) | (b << 16);

        h = ah2;
        l = al2;

        a = l & 0xffff; b = l >>> 16;
        c = h & 0xffff; d = h >>> 16;

        h = hh[2];
        l = hl[2];

        a += l & 0xffff; b += l >>> 16;
        c += h & 0xffff; d += h >>> 16;

        b += a >>> 16;
        c += b >>> 16;
        d += c >>> 16;

        hh[2] = ah2 = (c & 0xffff) | (d << 16);
        hl[2] = al2 = (a & 0xffff) | (b << 16);

        h = ah3;
        l = al3;

        a = l & 0xffff; b = l >>> 16;
        c = h & 0xffff; d = h >>> 16;

        h = hh[3];
        l = hl[3];

        a += l & 0xffff; b += l >>> 16;
        c += h & 0xffff; d += h >>> 16;

        b += a >>> 16;
        c += b >>> 16;
        d += c >>> 16;

        hh[3] = ah3 = (c & 0xffff) | (d << 16);
        hl[3] = al3 = (a & 0xffff) | (b << 16);

        h = ah4;
        l = al4;

        a = l & 0xffff; b = l >>> 16;
        c = h & 0xffff; d = h >>> 16;

        h = hh[4];
        l = hl[4];

        a += l & 0xffff; b += l >>> 16;
        c += h & 0xffff; d += h >>> 16;

        b += a >>> 16;
        c += b >>> 16;
        d += c >>> 16;

        hh[4] = ah4 = (c & 0xffff) | (d << 16);
        hl[4] = al4 = (a & 0xffff) | (b << 16);

        h = ah5;
        l = al5;

        a = l & 0xffff; b = l >>> 16;
        c = h & 0xffff; d = h >>> 16;

        h = hh[5];
        l = hl[5];

        a += l & 0xffff; b += l >>> 16;
        c += h & 0xffff; d += h >>> 16;

        b += a >>> 16;
        c += b >>> 16;
        d += c >>> 16;

        hh[5] = ah5 = (c & 0xffff) | (d << 16);
        hl[5] = al5 = (a & 0xffff) | (b << 16);

        h = ah6;
        l = al6;

        a = l & 0xffff; b = l >>> 16;
        c = h & 0xffff; d = h >>> 16;

        h = hh[6];
        l = hl[6];

        a += l & 0xffff; b += l >>> 16;
        c += h & 0xffff; d += h >>> 16;

        b += a >>> 16;
        c += b >>> 16;
        d += c >>> 16;

        hh[6] = ah6 = (c & 0xffff) | (d << 16);
        hl[6] = al6 = (a & 0xffff) | (b << 16);

        h = ah7;
        l = al7;

        a = l & 0xffff; b = l >>> 16;
        c = h & 0xffff; d = h >>> 16;

        h = hh[7];
        l = hl[7];

        a += l & 0xffff; b += l >>> 16;
        c += h & 0xffff; d += h >>> 16;

        b += a >>> 16;
        c += b >>> 16;
        d += c >>> 16;

        hh[7] = ah7 = (c & 0xffff) | (d << 16);
        hl[7] = al7 = (a & 0xffff) | (b << 16);

        pos += 128;
        n -= 128;
      }

      return n;
    }

    function crypto_hash(out, m, n) {
      var hh = new Int32Array(8),
          hl = new Int32Array(8),
          x = new Uint8Array(256),
          i, b = n;

      hh[0] = 0x6a09e667;
      hh[1] = 0xbb67ae85;
      hh[2] = 0x3c6ef372;
      hh[3] = 0xa54ff53a;
      hh[4] = 0x510e527f;
      hh[5] = 0x9b05688c;
      hh[6] = 0x1f83d9ab;
      hh[7] = 0x5be0cd19;

      hl[0] = 0xf3bcc908;
      hl[1] = 0x84caa73b;
      hl[2] = 0xfe94f82b;
      hl[3] = 0x5f1d36f1;
      hl[4] = 0xade682d1;
      hl[5] = 0x2b3e6c1f;
      hl[6] = 0xfb41bd6b;
      hl[7] = 0x137e2179;

      crypto_hashblocks_hl(hh, hl, m, n);
      n %= 128;

      for (i = 0; i < n; i++) x[i] = m[b-n+i];
      x[n] = 128;

      n = 256-128*(n<112?1:0);
      x[n-9] = 0;
      ts64(x, n-8,  (b / 0x20000000) | 0, b << 3);
      crypto_hashblocks_hl(hh, hl, x, n);

      for (i = 0; i < 8; i++) ts64(out, 8*i, hh[i], hl[i]);

      return 0;
    }

    function add(p, q) {
      var a = gf(), b = gf(), c = gf(),
          d = gf(), e = gf(), f = gf(),
          g = gf(), h = gf(), t = gf();

      Z(a, p[1], p[0]);
      Z(t, q[1], q[0]);
      M(a, a, t);
      A(b, p[0], p[1]);
      A(t, q[0], q[1]);
      M(b, b, t);
      M(c, p[3], q[3]);
      M(c, c, D2);
      M(d, p[2], q[2]);
      A(d, d, d);
      Z(e, b, a);
      Z(f, d, c);
      A(g, d, c);
      A(h, b, a);

      M(p[0], e, f);
      M(p[1], h, g);
      M(p[2], g, f);
      M(p[3], e, h);
    }

    function cswap(p, q, b) {
      var i;
      for (i = 0; i < 4; i++) {
        sel25519(p[i], q[i], b);
      }
    }

    function pack(r, p) {
      var tx = gf(), ty = gf(), zi = gf();
      inv25519(zi, p[2]);
      M(tx, p[0], zi);
      M(ty, p[1], zi);
      pack25519(r, ty);
      r[31] ^= par25519(tx) << 7;
    }

    function scalarmult(p, q, s) {
      var b, i;
      set25519(p[0], gf0);
      set25519(p[1], gf1);
      set25519(p[2], gf1);
      set25519(p[3], gf0);
      for (i = 255; i >= 0; --i) {
        b = (s[(i/8)|0] >> (i&7)) & 1;
        cswap(p, q, b);
        add(q, p);
        add(p, p);
        cswap(p, q, b);
      }
    }

    function scalarbase(p, s) {
      var q = [gf(), gf(), gf(), gf()];
      set25519(q[0], X);
      set25519(q[1], Y);
      set25519(q[2], gf1);
      M(q[3], X, Y);
      scalarmult(p, q, s);
    }

    function crypto_sign_keypair(pk, sk, seeded) {
      var d = new Uint8Array(64);
      var p = [gf(), gf(), gf(), gf()];
      var i;

      if (!seeded) randombytes(sk, 32);
      crypto_hash(d, sk, 32);
      d[0] &= 248;
      d[31] &= 127;
      d[31] |= 64;

      scalarbase(p, d);
      pack(pk, p);

      for (i = 0; i < 32; i++) sk[i+32] = pk[i];
      return 0;
    }

    var L = new Float64Array([0xed, 0xd3, 0xf5, 0x5c, 0x1a, 0x63, 0x12, 0x58, 0xd6, 0x9c, 0xf7, 0xa2, 0xde, 0xf9, 0xde, 0x14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x10]);

    function modL(r, x) {
      var carry, i, j, k;
      for (i = 63; i >= 32; --i) {
        carry = 0;
        for (j = i - 32, k = i - 12; j < k; ++j) {
          x[j] += carry - 16 * x[i] * L[j - (i - 32)];
          carry = Math.floor((x[j] + 128) / 256);
          x[j] -= carry * 256;
        }
        x[j] += carry;
        x[i] = 0;
      }
      carry = 0;
      for (j = 0; j < 32; j++) {
        x[j] += carry - (x[31] >> 4) * L[j];
        carry = x[j] >> 8;
        x[j] &= 255;
      }
      for (j = 0; j < 32; j++) x[j] -= carry * L[j];
      for (i = 0; i < 32; i++) {
        x[i+1] += x[i] >> 8;
        r[i] = x[i] & 255;
      }
    }

    function reduce(r) {
      var x = new Float64Array(64), i;
      for (i = 0; i < 64; i++) x[i] = r[i];
      for (i = 0; i < 64; i++) r[i] = 0;
      modL(r, x);
    }

    // Note: difference from C - smlen returned, not passed as argument.
    function crypto_sign(sm, m, n, sk) {
      var d = new Uint8Array(64), h = new Uint8Array(64), r = new Uint8Array(64);
      var i, j, x = new Float64Array(64);
      var p = [gf(), gf(), gf(), gf()];

      crypto_hash(d, sk, 32);
      d[0] &= 248;
      d[31] &= 127;
      d[31] |= 64;

      var smlen = n + 64;
      for (i = 0; i < n; i++) sm[64 + i] = m[i];
      for (i = 0; i < 32; i++) sm[32 + i] = d[32 + i];

      crypto_hash(r, sm.subarray(32), n+32);
      reduce(r);
      scalarbase(p, r);
      pack(sm, p);

      for (i = 32; i < 64; i++) sm[i] = sk[i];
      crypto_hash(h, sm, n + 64);
      reduce(h);

      for (i = 0; i < 64; i++) x[i] = 0;
      for (i = 0; i < 32; i++) x[i] = r[i];
      for (i = 0; i < 32; i++) {
        for (j = 0; j < 32; j++) {
          x[i+j] += h[i] * d[j];
        }
      }

      modL(sm.subarray(32), x);
      return smlen;
    }

    function unpackneg(r, p) {
      var t = gf(), chk = gf(), num = gf(),
          den = gf(), den2 = gf(), den4 = gf(),
          den6 = gf();

      set25519(r[2], gf1);
      unpack25519(r[1], p);
      S(num, r[1]);
      M(den, num, D);
      Z(num, num, r[2]);
      A(den, r[2], den);

      S(den2, den);
      S(den4, den2);
      M(den6, den4, den2);
      M(t, den6, num);
      M(t, t, den);

      pow2523(t, t);
      M(t, t, num);
      M(t, t, den);
      M(t, t, den);
      M(r[0], t, den);

      S(chk, r[0]);
      M(chk, chk, den);
      if (neq25519(chk, num)) M(r[0], r[0], I);

      S(chk, r[0]);
      M(chk, chk, den);
      if (neq25519(chk, num)) return -1;

      if (par25519(r[0]) === (p[31]>>7)) Z(r[0], gf0, r[0]);

      M(r[3], r[0], r[1]);
      return 0;
    }

    function crypto_sign_open(m, sm, n, pk) {
      var i;
      var t = new Uint8Array(32), h = new Uint8Array(64);
      var p = [gf(), gf(), gf(), gf()],
          q = [gf(), gf(), gf(), gf()];

      if (n < 64) return -1;

      if (unpackneg(q, pk)) return -1;

      for (i = 0; i < n; i++) m[i] = sm[i];
      for (i = 0; i < 32; i++) m[i+32] = pk[i];
      crypto_hash(h, m, n);
      reduce(h);
      scalarmult(p, q, h);

      scalarbase(q, sm.subarray(32));
      add(p, q);
      pack(t, p);

      n -= 64;
      if (crypto_verify_32(sm, 0, t, 0)) {
        for (i = 0; i < n; i++) m[i] = 0;
        return -1;
      }

      for (i = 0; i < n; i++) m[i] = sm[i + 64];
      return n;
    }

    var crypto_secretbox_KEYBYTES = 32,
        crypto_secretbox_NONCEBYTES = 24,
        crypto_secretbox_ZEROBYTES = 32,
        crypto_secretbox_BOXZEROBYTES = 16,
        crypto_scalarmult_BYTES = 32,
        crypto_scalarmult_SCALARBYTES = 32,
        crypto_box_PUBLICKEYBYTES = 32,
        crypto_box_SECRETKEYBYTES = 32,
        crypto_box_BEFORENMBYTES = 32,
        crypto_box_NONCEBYTES = crypto_secretbox_NONCEBYTES,
        crypto_box_ZEROBYTES = crypto_secretbox_ZEROBYTES,
        crypto_box_BOXZEROBYTES = crypto_secretbox_BOXZEROBYTES,
        crypto_sign_BYTES = 64,
        crypto_sign_PUBLICKEYBYTES = 32,
        crypto_sign_SECRETKEYBYTES = 64,
        crypto_sign_SEEDBYTES = 32,
        crypto_hash_BYTES = 64;

    nacl.lowlevel = {
      crypto_core_hsalsa20: crypto_core_hsalsa20,
      crypto_stream_xor: crypto_stream_xor,
      crypto_stream: crypto_stream,
      crypto_stream_salsa20_xor: crypto_stream_salsa20_xor,
      crypto_stream_salsa20: crypto_stream_salsa20,
      crypto_onetimeauth: crypto_onetimeauth,
      crypto_onetimeauth_verify: crypto_onetimeauth_verify,
      crypto_verify_16: crypto_verify_16,
      crypto_verify_32: crypto_verify_32,
      crypto_secretbox: crypto_secretbox,
      crypto_secretbox_open: crypto_secretbox_open,
      crypto_scalarmult: crypto_scalarmult,
      crypto_scalarmult_base: crypto_scalarmult_base,
      crypto_box_beforenm: crypto_box_beforenm,
      crypto_box_afternm: crypto_box_afternm,
      crypto_box: crypto_box,
      crypto_box_open: crypto_box_open,
      crypto_box_keypair: crypto_box_keypair,
      crypto_hash: crypto_hash,
      crypto_sign: crypto_sign,
      crypto_sign_keypair: crypto_sign_keypair,
      crypto_sign_open: crypto_sign_open,

      crypto_secretbox_KEYBYTES: crypto_secretbox_KEYBYTES,
      crypto_secretbox_NONCEBYTES: crypto_secretbox_NONCEBYTES,
      crypto_secretbox_ZEROBYTES: crypto_secretbox_ZEROBYTES,
      crypto_secretbox_BOXZEROBYTES: crypto_secretbox_BOXZEROBYTES,
      crypto_scalarmult_BYTES: crypto_scalarmult_BYTES,
      crypto_scalarmult_SCALARBYTES: crypto_scalarmult_SCALARBYTES,
      crypto_box_PUBLICKEYBYTES: crypto_box_PUBLICKEYBYTES,
      crypto_box_SECRETKEYBYTES: crypto_box_SECRETKEYBYTES,
      crypto_box_BEFORENMBYTES: crypto_box_BEFORENMBYTES,
      crypto_box_NONCEBYTES: crypto_box_NONCEBYTES,
      crypto_box_ZEROBYTES: crypto_box_ZEROBYTES,
      crypto_box_BOXZEROBYTES: crypto_box_BOXZEROBYTES,
      crypto_sign_BYTES: crypto_sign_BYTES,
      crypto_sign_PUBLICKEYBYTES: crypto_sign_PUBLICKEYBYTES,
      crypto_sign_SECRETKEYBYTES: crypto_sign_SECRETKEYBYTES,
      crypto_sign_SEEDBYTES: crypto_sign_SEEDBYTES,
      crypto_hash_BYTES: crypto_hash_BYTES,

      gf: gf,
      D: D,
      L: L,
      pack25519: pack25519,
      unpack25519: unpack25519,
      M: M,
      A: A,
      S: S,
      Z: Z,
      pow2523: pow2523,
      add: add,
      set25519: set25519,
      modL: modL,
      scalarmult: scalarmult,
      scalarbase: scalarbase,
    };

    /* High-level API */

    function checkLengths(k, n) {
      if (k.length !== crypto_secretbox_KEYBYTES) throw new Error('bad key size');
      if (n.length !== crypto_secretbox_NONCEBYTES) throw new Error('bad nonce size');
    }

    function checkBoxLengths(pk, sk) {
      if (pk.length !== crypto_box_PUBLICKEYBYTES) throw new Error('bad public key size');
      if (sk.length !== crypto_box_SECRETKEYBYTES) throw new Error('bad secret key size');
    }

    function checkArrayTypes() {
      for (var i = 0; i < arguments.length; i++) {
        if (!(arguments[i] instanceof Uint8Array))
          throw new TypeError('unexpected type, use Uint8Array');
      }
    }

    function cleanup(arr) {
      for (var i = 0; i < arr.length; i++) arr[i] = 0;
    }

    nacl.randomBytes = function(n) {
      var b = new Uint8Array(n);
      randombytes(b, n);
      return b;
    };

    nacl.secretbox = function(msg, nonce, key) {
      checkArrayTypes(msg, nonce, key);
      checkLengths(key, nonce);
      var m = new Uint8Array(crypto_secretbox_ZEROBYTES + msg.length);
      var c = new Uint8Array(m.length);
      for (var i = 0; i < msg.length; i++) m[i+crypto_secretbox_ZEROBYTES] = msg[i];
      crypto_secretbox(c, m, m.length, nonce, key);
      return c.subarray(crypto_secretbox_BOXZEROBYTES);
    };

    nacl.secretbox.open = function(box, nonce, key) {
      checkArrayTypes(box, nonce, key);
      checkLengths(key, nonce);
      var c = new Uint8Array(crypto_secretbox_BOXZEROBYTES + box.length);
      var m = new Uint8Array(c.length);
      for (var i = 0; i < box.length; i++) c[i+crypto_secretbox_BOXZEROBYTES] = box[i];
      if (c.length < 32) return null;
      if (crypto_secretbox_open(m, c, c.length, nonce, key) !== 0) return null;
      return m.subarray(crypto_secretbox_ZEROBYTES);
    };

    nacl.secretbox.keyLength = crypto_secretbox_KEYBYTES;
    nacl.secretbox.nonceLength = crypto_secretbox_NONCEBYTES;
    nacl.secretbox.overheadLength = crypto_secretbox_BOXZEROBYTES;

    nacl.scalarMult = function(n, p) {
      checkArrayTypes(n, p);
      if (n.length !== crypto_scalarmult_SCALARBYTES) throw new Error('bad n size');
      if (p.length !== crypto_scalarmult_BYTES) throw new Error('bad p size');
      var q = new Uint8Array(crypto_scalarmult_BYTES);
      crypto_scalarmult(q, n, p);
      return q;
    };

    nacl.scalarMult.base = function(n) {
      checkArrayTypes(n);
      if (n.length !== crypto_scalarmult_SCALARBYTES) throw new Error('bad n size');
      var q = new Uint8Array(crypto_scalarmult_BYTES);
      crypto_scalarmult_base(q, n);
      return q;
    };

    nacl.scalarMult.scalarLength = crypto_scalarmult_SCALARBYTES;
    nacl.scalarMult.groupElementLength = crypto_scalarmult_BYTES;

    nacl.box = function(msg, nonce, publicKey, secretKey) {
      var k = nacl.box.before(publicKey, secretKey);
      return nacl.secretbox(msg, nonce, k);
    };

    nacl.box.before = function(publicKey, secretKey) {
      checkArrayTypes(publicKey, secretKey);
      checkBoxLengths(publicKey, secretKey);
      var k = new Uint8Array(crypto_box_BEFORENMBYTES);
      crypto_box_beforenm(k, publicKey, secretKey);
      return k;
    };

    nacl.box.after = nacl.secretbox;

    nacl.box.open = function(msg, nonce, publicKey, secretKey) {
      var k = nacl.box.before(publicKey, secretKey);
      return nacl.secretbox.open(msg, nonce, k);
    };

    nacl.box.open.after = nacl.secretbox.open;

    nacl.box.keyPair = function() {
      var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
      var sk = new Uint8Array(crypto_box_SECRETKEYBYTES);
      crypto_box_keypair(pk, sk);
      return {publicKey: pk, secretKey: sk};
    };

    nacl.box.keyPair.fromSecretKey = function(secretKey) {
      checkArrayTypes(secretKey);
      if (secretKey.length !== crypto_box_SECRETKEYBYTES)
        throw new Error('bad secret key size');
      var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
      crypto_scalarmult_base(pk, secretKey);
      return {publicKey: pk, secretKey: new Uint8Array(secretKey)};
    };

    nacl.box.publicKeyLength = crypto_box_PUBLICKEYBYTES;
    nacl.box.secretKeyLength = crypto_box_SECRETKEYBYTES;
    nacl.box.sharedKeyLength = crypto_box_BEFORENMBYTES;
    nacl.box.nonceLength = crypto_box_NONCEBYTES;
    nacl.box.overheadLength = nacl.secretbox.overheadLength;

    nacl.sign = function(msg, secretKey) {
      checkArrayTypes(msg, secretKey);
      if (secretKey.length !== crypto_sign_SECRETKEYBYTES)
        throw new Error('bad secret key size');
      var signedMsg = new Uint8Array(crypto_sign_BYTES+msg.length);
      crypto_sign(signedMsg, msg, msg.length, secretKey);
      return signedMsg;
    };

    nacl.sign.open = function(signedMsg, publicKey) {
      checkArrayTypes(signedMsg, publicKey);
      if (publicKey.length !== crypto_sign_PUBLICKEYBYTES)
        throw new Error('bad public key size');
      var tmp = new Uint8Array(signedMsg.length);
      var mlen = crypto_sign_open(tmp, signedMsg, signedMsg.length, publicKey);
      if (mlen < 0) return null;
      var m = new Uint8Array(mlen);
      for (var i = 0; i < m.length; i++) m[i] = tmp[i];
      return m;
    };

    nacl.sign.detached = function(msg, secretKey) {
      var signedMsg = nacl.sign(msg, secretKey);
      var sig = new Uint8Array(crypto_sign_BYTES);
      for (var i = 0; i < sig.length; i++) sig[i] = signedMsg[i];
      return sig;
    };

    nacl.sign.detached.verify = function(msg, sig, publicKey) {
      checkArrayTypes(msg, sig, publicKey);
      if (sig.length !== crypto_sign_BYTES)
        throw new Error('bad signature size');
      if (publicKey.length !== crypto_sign_PUBLICKEYBYTES)
        throw new Error('bad public key size');
      var sm = new Uint8Array(crypto_sign_BYTES + msg.length);
      var m = new Uint8Array(crypto_sign_BYTES + msg.length);
      var i;
      for (i = 0; i < crypto_sign_BYTES; i++) sm[i] = sig[i];
      for (i = 0; i < msg.length; i++) sm[i+crypto_sign_BYTES] = msg[i];
      return (crypto_sign_open(m, sm, sm.length, publicKey) >= 0);
    };

    nacl.sign.keyPair = function() {
      var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
      var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
      crypto_sign_keypair(pk, sk);
      return {publicKey: pk, secretKey: sk};
    };

    nacl.sign.keyPair.fromSecretKey = function(secretKey) {
      checkArrayTypes(secretKey);
      if (secretKey.length !== crypto_sign_SECRETKEYBYTES)
        throw new Error('bad secret key size');
      var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
      for (var i = 0; i < pk.length; i++) pk[i] = secretKey[32+i];
      return {publicKey: pk, secretKey: new Uint8Array(secretKey)};
    };

    nacl.sign.keyPair.fromSeed = function(seed) {
      checkArrayTypes(seed);
      if (seed.length !== crypto_sign_SEEDBYTES)
        throw new Error('bad seed size');
      var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
      var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
      for (var i = 0; i < 32; i++) sk[i] = seed[i];
      crypto_sign_keypair(pk, sk, true);
      return {publicKey: pk, secretKey: sk};
    };

    nacl.sign.publicKeyLength = crypto_sign_PUBLICKEYBYTES;
    nacl.sign.secretKeyLength = crypto_sign_SECRETKEYBYTES;
    nacl.sign.seedLength = crypto_sign_SEEDBYTES;
    nacl.sign.signatureLength = crypto_sign_BYTES;

    nacl.hash = function(msg) {
      checkArrayTypes(msg);
      var h = new Uint8Array(crypto_hash_BYTES);
      crypto_hash(h, msg, msg.length);
      return h;
    };

    nacl.hash.hashLength = crypto_hash_BYTES;

    nacl.verify = function(x, y) {
      checkArrayTypes(x, y);
      // Zero length arguments are considered not equal.
      if (x.length === 0 || y.length === 0) return false;
      if (x.length !== y.length) return false;
      return (vn(x, 0, y, 0, x.length) === 0) ? true : false;
    };

    nacl.setPRNG = function(fn) {
      randombytes = fn;
    };

    (function() {
      // Initialize PRNG if environment provides CSPRNG.
      // If not, methods calling randombytes will throw.
      var crypto = typeof self !== 'undefined' ? (self.crypto || self.msCrypto) : null;
      if (crypto && crypto.getRandomValues) {
        // Browsers.
        var QUOTA = 65536;
        nacl.setPRNG(function(x, n) {
          var i, v = new Uint8Array(n);
          for (i = 0; i < n; i += QUOTA) {
            crypto.getRandomValues(v.subarray(i, i + Math.min(n - i, QUOTA)));
          }
          for (i = 0; i < n; i++) x[i] = v[i];
          cleanup(v);
        });
      } else if (typeof commonjsRequire$1 !== 'undefined') {
        // Node.js.
        crypto = require$$0;
        if (crypto && crypto.randomBytes) {
          nacl.setPRNG(function(x, n) {
            var i, v = crypto.randomBytes(n);
            for (i = 0; i < n; i++) x[i] = v[i];
            cleanup(v);
          });
        }
      }
    })();

    })( module.exports ? module.exports : (self.nacl = self.nacl || {}));
    });

    var naclUtil = createCommonjsModule$1(function (module) {
    // Written in 2014-2016 by Dmitry Chestnykh and Devi Mandiri.
    // Public domain.
    (function(root, f) {
      if ( module.exports) module.exports = f();
      else if (root.nacl) root.nacl.util = f();
      else {
        root.nacl = {};
        root.nacl.util = f();
      }
    }(commonjsGlobal$1, function() {

      var util = {};

      function validateBase64(s) {
        if (!(/^(?:[A-Za-z0-9+\/]{2}[A-Za-z0-9+\/]{2})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/.test(s))) {
          throw new TypeError('invalid encoding');
        }
      }

      util.decodeUTF8 = function(s) {
        if (typeof s !== 'string') throw new TypeError('expected string');
        var i, d = unescape(encodeURIComponent(s)), b = new Uint8Array(d.length);
        for (i = 0; i < d.length; i++) b[i] = d.charCodeAt(i);
        return b;
      };

      util.encodeUTF8 = function(arr) {
        var i, s = [];
        for (i = 0; i < arr.length; i++) s.push(String.fromCharCode(arr[i]));
        return decodeURIComponent(escape(s.join('')));
      };

      if (typeof atob === 'undefined') {
        // Node.js

        if (typeof Buffer.from !== 'undefined') {
           // Node v6 and later
          util.encodeBase64 = function (arr) { // v6 and later
              return Buffer.from(arr).toString('base64');
          };

          util.decodeBase64 = function (s) {
            validateBase64(s);
            return new Uint8Array(Array.prototype.slice.call(Buffer.from(s, 'base64'), 0));
          };

        } else {
          // Node earlier than v6
          util.encodeBase64 = function (arr) { // v6 and later
            return (new Buffer(arr)).toString('base64');
          };

          util.decodeBase64 = function(s) {
            validateBase64(s);
            return new Uint8Array(Array.prototype.slice.call(new Buffer(s, 'base64'), 0));
          };
        }

      } else {
        // Browsers

        util.encodeBase64 = function(arr) {
          var i, s = [], len = arr.length;
          for (i = 0; i < len; i++) s.push(String.fromCharCode(arr[i]));
          return btoa(s.join(''));
        };

        util.decodeBase64 = function(s) {
          validateBase64(s);
          var i, d = atob(s), b = new Uint8Array(d.length);
          for (i = 0; i < d.length; i++) b[i] = d.charCodeAt(i);
          return b;
        };

      }

      return util;

    }));
    });

    function isObject(obj) {
      return obj !== undefined && obj !== null && obj.constructor == Object;
    }

    function addHeader(_msg, flag) {
      const msg = new Uint8Array(_msg.length + 1);

      const header = new Uint8Array(1);
      header[0] = flag;

      msg.set(header);
      msg.set(_msg, header.length);

      return msg;
    }

    naclFast.util = naclUtil;

    function send({ data, connector }) {
      if (isObject(data)) {
        data = JSON.stringify(data);
      }

      const nonce = new Uint8Array(integerToByteArray(2 * connector.sentCount, 24));

      if (!connector.closed()) {
        if (connector.sentCount > 1) {
          let flag = 0;

          if (typeof data == 'string') {
            flag = 1;
          }

          const _encodedMessage = flag == 1 ? naclFast.util.decodeUTF8(data) : data;
          const encodedMessage = addHeader(_encodedMessage, flag);

          const encryptedMessage = naclFast.secretbox(encodedMessage, nonce, connector.sharedSecret);

          if (connector.verbose) {
            console.log();
            console.log(`Connector → Sending encrypted message #${connector.sentCount} @ ${connector.address}:`);
            console.log(data);
          }

          connector.connection.websocket.send(encryptedMessage);
        } else {
          if (connector.verbose) {
            console.log();
            console.log(`Connector → Sending message #${connector.sentCount} @ ${connector.address}:`);
            console.log(data);
          }

          connector.connection.websocket.send(data);
        }
      } else {
        console.log(`⚠️ Warning: "${data}" was not sent because connector is not ready`);
      }
    }

    naclFast.util = naclUtil;

    function isRpcCallResult(jsonData) {
      return Object.keys(jsonData).includes('result') || Object.keys(jsonData).includes('error');
    }

    function wireReceive({ jsonData, encryptedData, rawMessage, wasEncrypted, connector }) {
      connector.lastMessageAt = Date.now();

      const nonce = new Uint8Array(integerToByteArray(2 * connector.receivedCount + 1, 24));

      if (connector.verbose && !wasEncrypted) {
        console.log();
        console.log(`Connector → Received message #${connector.receivedCount} @ ${connector.address}:`);
      }

      // 💡 unencrypted jsonData !
      if (jsonData) {
        if (jsonData.jsonrpc) {
          if (isRpcCallResult(jsonData)) {
            if (connector.verbose && !wasEncrypted) {
              console.log('Received plain-text rpc result');
              console.log(jsonData);
            }

            connector.rpcClient.jsonrpcMsgReceive(rawMessage);
          } else {
            connector.emit('json_rpc', rawMessage);
          }
        } else {
          connector.emit('receive', { jsonData, rawMessage });
        }
      } else if (encryptedData) {
        // 💡 encryptedJson data!!
        if (connector.verbose == 'extra') {
          console.log('Received bytes:');
          console.log(encryptedData);
          console.log(`Decrypting with shared secret ${connector.sharedSecret}...`);
        }

        const _decryptedMessage = naclFast.secretbox.open(encryptedData, nonce, connector.sharedSecret);

        const flag = _decryptedMessage[0];
        const decryptedMessage = _decryptedMessage.subarray(1);

        if (flag == 1) {
          const decodedMessage = naclFast.util.encodeUTF8(decryptedMessage);

          try {
            const jsonData = JSON.parse(decodedMessage);

            // 💡 rpc
            if (jsonData.jsonrpc) {
              if (connector.verbose) {
                console.log('Received and decrypted rpc result:');
                console.log(jsonData);
              }

              wireReceive({ jsonData, rawMessage: decodedMessage, wasEncrypted: true, connector });
            } else if (jsonData.tag) {
              // 💡 tag
              const msg = jsonData;

              if (msg.tag == 'file_not_found') {
                connector.emit(msg.tag, { ...msg, ...{ tag: undefined } });
              } else if (msg.tag == 'binary_start') {
                connector.emit(msg.tag, { ...msg, ...{ tag: undefined } });
              } else if (msg.tag == 'binary_end') {
                connector.emit(msg.tag, { sessionId: msg.sessionId });
              } else {
                connector.emit('receive', { jsonData, rawMessage: decodedMessage });
              }
            } else if (jsonData.state) {
              // 💡 Initial state sending ... part of Connectome protocol
              connector.emit('receive_state', jsonData.state);
            } else if (jsonData.diff) {
              // 💡 Subsequent JSON patch diffs (rfc6902)* ... part of Connectome protocol
              connector.emit('receive_diff', jsonData.diff);
            } else {
              connector.emit('receive', { jsonData, rawMessage: decodedMessage });
            }
          } catch (e) {
            console.log("Couldn't parse json message although the flag was for string ...");
            throw e;
          }
        } else {
          const binaryData = decryptedMessage;

          const sessionId = Buffer.from(binaryData.buffer, binaryData.byteOffset, 64).toString();
          const binaryPayload = Buffer.from(binaryData.buffer, binaryData.byteOffset + 64);

          connector.emit('binary_data', { sessionId, data: binaryPayload });
        }
      }
    }

    class Channel extends Eev {
      constructor(connector) {
        super();

        this.connector = connector;
      }

      send(...args) {
        this.connector.send(...args);
      }
    }

    var errorCodes = {
      PARSE_ERROR: -32700,
      INVALID_REQUEST: -32600,
      METHOD_NOT_FOUND: -32601,
      INVALID_PARAMS: -32602,
      REMOTE_INTERNAL_ERROR: -32603
    };

    class MoleServer {
      constructor({ transports }) {
        if (!transports) throw new Error('TRANSPORT_REQUIRED');

        this.transportsToRegister = transports;
        this.methods = {};
      }

      setMethodPrefix(methodPrefix) {
        this.methodPrefix = methodPrefix;
      }

      expose(methods) {
        this.methods = methods;
      }

      registerTransport(transport) {
        transport.onData(this._processRequest.bind(this, transport));
      }

      async _processRequest(transport, data) {
        const requestData = JSON.parse(data);
        let responseData;

        if (Array.isArray(requestData)) {
          responseData = await Promise.all(requestData.map(request => this._callMethod(request, transport)));
        } else {
          responseData = await this._callMethod(requestData, transport);
        }

        return JSON.stringify(responseData);
      }

      async _callMethod(request, transport) {
        const isRequest = request.hasOwnProperty('method');
        if (!isRequest) return;

        const { method, params = [], id } = request;

        let methodName = method;

        if (methodName.includes('::')) {
          const [prefix, name] = methodName.split('::');
          methodName = name;
          if (this.methodPrefix && prefix != this.methodPrefix) {
            return;
          }
        }

        const methodNotFound =
          !this.methods[methodName] ||
          typeof this.methods[methodName] !== 'function' ||
          methodName === 'constructor' ||
          methodName.startsWith('_') ||
          this.methods[methodName] === Object.prototype[methodName];

        let response = {};

        if (methodNotFound) {
          response = {
            jsonrpc: '2.0',
            id,
            error: {
              code: errorCodes.METHOD_NOT_FOUND,
              message: `Method [${methodName}] not found on remote target object`
            }
          };
        } else {
          this.currentTransport = transport;

          try {
            const result = await this.methods[methodName].apply(this.methods, params);

            if (!id) return;

            response = {
              jsonrpc: '2.0',
              result: typeof result === 'undefined' ? null : result,
              id
            };
          } catch (e) {
            console.log(`Exposed RPC method ${method} internal error:`);
            console.log(e);
            console.log('Sending this error as a result to calling client ...');
            response = {
              jsonrpc: '2.0',
              error: {
                code: errorCodes.REMOTE_INTERNAL_ERROR,
                message: `Method [${method}] internal error: ${e.stack}`
              },
              id
            };
          }
        }

        return response;
      }

      run() {
        for (const transport of this.transportsToRegister) {
          this.registerTransport(transport);
        }

        this.transportsToRegister = [];
      }
    }

    class Base extends Error {
      constructor(data = {}) {
        super();

        if (!data.code) throw new Error('Code required');
        if (!data.message) throw new Error('Message required');

        this.code = data.code;
        this.message = data.message;
      }
    }

    class MethodNotFound extends Base {
      constructor(message) {
        super({
          code: errorCodes.METHOD_NOT_FOUND,
          message: message || 'Method not found'
        });
      }
    }

    class InvalidParams extends Base {
      constructor() {
        super({
          code: errorCodes.INVALID_PARAMS,
          message: 'Invalid params'
        });
      }
    }

    class RemoteInternalError extends Base {
      constructor(message) {
        super({
          code: errorCodes.REMOTE_INTERNAL_ERROR,
          message: `Error originating at remote endpoint: ${message}` || 'Remote Internal error'
        });
      }
    }

    class ParseError extends Base {
      constructor() {
        super({
          code: errorCodes.PARSE_ERROR,
          message: 'Parse error'
        });
      }
    }

    class InvalidRequest extends Base {
      constructor() {
        super({
          code: errorCodes.INVALID_REQUEST,
          message: 'Invalid request'
        });
      }
    }

    class ServerError extends Base {}

    class RequestTimeout extends ServerError {
      constructor(message, timeout) {
        super({
          code: -32001,
          message: `Request exceeded maximum execution time (${timeout}ms): ${message}`
        });
      }
    }

    var X = {
      Base,
      MethodNotFound,
      InvalidRequest,
      InvalidParams,
      RemoteInternalError,
      ServerError,
      ParseError,
      RequestTimeout
    };

    class MoleClient {
      constructor({ transport, requestTimeout = 20000 }) {
        if (!transport) throw new Error('TRANSPORT_REQUIRED');
        this.transport = transport;

        this.requestTimeout = requestTimeout;

        this.pendingRequest = {};
        this.initialized = false;
      }

      setMethodPrefix(methodPrefix) {
        this.methodPrefix = methodPrefix;
      }

      async callMethod(methodName, params) {
        this._init();

        const method = this.methodPrefix ? `${this.methodPrefix}::${methodName}` : methodName;

        const request = this._makeRequestObject({ method, params });

        return this._sendRequest({ object: request, id: request.id });
      }

      notify(method, params) {
        this._init();

        const request = this._makeRequestObject({ method, params, mode: 'notify' });
        this.transport.sendData(JSON.stringify(request));
        return true;
      }

      async runBatch(calls) {
        const batchId = this._generateId();
        let onlyNotifications = true;

        const batchRequest = [];

        for (const [method, params, mode] of calls) {
          const request = this._makeRequestObject({ method, params, mode, batchId });

          if (request.id) {
            onlyNotifications = false;
          }

          batchRequest.push(request);
        }

        if (onlyNotifications) {
          return this.transport.sendData(JSON.stringify(batchRequest));
        }

        return this._sendRequest({ object: batchRequest, id: batchId });
      }

      _init() {
        if (this.initialized) return;

        this.transport.onData(this._processResponse.bind(this));

        this.initialized = true;
      }

      _sendRequest({ object, id }) {
        const data = JSON.stringify(object);

        return new Promise((resolve, reject) => {
          this.pendingRequest[id] = { resolve, reject, sentObject: object };

          setTimeout(() => {
            if (this.pendingRequest[id]) {
              delete this.pendingRequest[id];

              reject(new X.RequestTimeout(data, this.requestTimeout));
            }
          }, this.requestTimeout);

          try {
            this.transport.sendData(data);
          } catch (e) {
            delete this.pendingRequest[id];
            reject(e);
          }
        });
      }

      _processResponse(data) {
        const response = JSON.parse(data);

        if (Array.isArray(response)) {
          this._processBatchResponse(response);
        } else {
          this._processSingleCallResponse(response);
        }
      }

      _processSingleCallResponse(response) {
        const isSuccessfulResponse = response.hasOwnProperty('result') || false;
        const isErrorResponse = response.hasOwnProperty('error');

        if (!isSuccessfulResponse && !isErrorResponse) return;

        const resolvers = this.pendingRequest[response.id];
        delete this.pendingRequest[response.id];

        if (!resolvers) return;

        if (isSuccessfulResponse) {
          resolvers.resolve(response.result);
        } else if (isErrorResponse) {
          const errorObject = this._makeErrorObject(response.error);
          resolvers.reject(errorObject);
        }
      }

      _processBatchResponse(responses) {
        let batchId;
        const responseById = {};
        const errorsWithoutId = [];

        for (const response of responses) {
          if (response.id) {
            if (!batchId) {
              batchId = response.id.split('|')[0];
            }

            responseById[response.id] = response;
          } else if (response.error) {
            errorsWithoutId.push(response.error);
          }
        }

        if (!this.pendingRequest[batchId]) return;

        const { sentObject, resolve } = this.pendingRequest[batchId];
        delete this.pendingRequest[batchId];

        const batchResults = [];
        let errorIdx = 0;
        for (const request of sentObject) {
          if (!request.id) {
            batchResults.push(null);
            continue;
          }

          const response = responseById[request.id];

          if (response) {
            const isSuccessfulResponse = response.hasOwnProperty('result') || false;

            if (isSuccessfulResponse) {
              batchResults.push({
                success: true,
                result: response.result
              });
            } else {
              batchResults.push({
                success: false,
                result: this._makeErrorObject(response.error)
              });
            }
          } else {
            batchResults.push({
              success: false,
              error: this._makeErrorObject(errorsWithoutId[errorIdx])
            });
            errorIdx++;
          }
        }

        resolve(batchResults);
      }

      _makeRequestObject({ method, params, mode, batchId }) {
        const request = {
          jsonrpc: '2.0',
          method
        };

        if (params && params.length) {
          request.params = params;
        }

        if (mode !== 'notify') {
          request.id = batchId ? `${batchId}|${this._generateId()}` : this._generateId();
        }

        return request;
      }

      _makeErrorObject(errorData) {
        const errorBuilder = {
          [errorCodes.METHOD_NOT_FOUND]: () => {
            return new X.MethodNotFound(errorData.message);
          },
          [errorCodes.REMOTE_INTERNAL_ERROR]: () => {
            return new X.RemoteInternalError(errorData.message);
          }
        }[errorData.code];

        return errorBuilder();
      }

      _generateId() {
        const alphabet = 'bjectSymhasOwnProp-0123456789ABCDEFGHIJKLMNQRTUVWXYZ_dfgiklquvxz';
        let size = 10;
        let id = '';

        while (0 < size--) {
          id += alphabet[(Math.random() * 64) | 0];
        }

        return id;
      }
    }

    function proxify(moleClient) {
      const callMethodProxy = proxifyOwnMethod(moleClient.callMethod.bind(moleClient));
      const notifyProxy = proxifyOwnMethod(moleClient.notify.bind(moleClient));

      return new Proxy(moleClient, {
        get(target, methodName) {
          if (methodName === 'notify') {
            return notifyProxy;
          }

          if (methodName === 'callMethod') {
            return callMethodProxy;
          }

          if (methodName === 'then') {
            return;
          }

          if (methodName === 'setMethodPrefix') {
            return (...params) => moleClient.setMethodPrefix(params);
          }

          return (...params) => target.callMethod.call(target, methodName, params);
        }
      });
    }

    function proxifyOwnMethod(ownMethod) {
      return new Proxy(ownMethod, {
        get(target, methodName) {
          return (...params) => target.call(null, methodName, params);
        },
        apply(target, _, args) {
          return target.apply(null, args);
        }
      });
    }

    class MoleClientProxified extends MoleClient {
      constructor(...args) {
        super(...args);
        return proxify(this);
      }
    }

    class TransportClientChannel {
      constructor(channel) {
        this.channel = channel;
      }

      onData(callback) {
        this.channel.on('json_rpc', callback);
      }

      sendData(data) {
        this.channel.send(data);
      }
    }

    class TransportServerChannel {
      constructor(channel) {
        this.channel = channel;
      }

      onData(callback) {
        this.channel.on('json_rpc', async reqData => {
          const resData = await callback(reqData);
          if (!resData) return;

          this.channel.send(resData);
        });
      }
    }

    var mole = /*#__PURE__*/Object.freeze({
        __proto__: null,
        MoleServer: MoleServer,
        MoleClient: MoleClient,
        MoleClientProxified: MoleClientProxified,
        ClientTransport: TransportClientChannel,
        ServerTransport: TransportServerChannel
    });

    class ConnectomeError extends Error {
      constructor(message, errorCode) {
        super(message);

        this.name = this.constructor.name;

        this.errorCode = errorCode;
      }

      errorCode() {
        return this.errorCode;
      }
    }

    const { MoleClient: MoleClient$1, ClientTransport } = mole;

    class SpecificRpcClient {
      constructor(connectorOrServersideChannel, methodPrefix, requestTimeout) {
        this.moleChannel = new Channel(connectorOrServersideChannel);
        this.methodPrefix = methodPrefix;

        this.connectorOrServersideChannel = connectorOrServersideChannel;

        this.client = new MoleClient$1({
          requestTimeout,
          transport: new ClientTransport(this.moleChannel)
        });
      }

      jsonrpcMsgReceive(stringMessage) {
        this.moleChannel.emit('json_rpc', stringMessage);
      }

      call(methodName, params) {
        if (this.connectorOrServersideChannel.closed()) {
          return new Promise((success, reject) => {
            reject(
              new ConnectomeError(
                `Method call [${this.methodPrefix}::${methodName}] on closed channel or connector ignored. Please add a check for closed channel in your code.`,
                'CLOSED_CHANNEL'
              )
            );
          });
        }

        return this.client.callMethod(`${this.methodPrefix}::${methodName}`, params);
      }
    }

    const DEFAULT_REQUEST_TIMEOUT = 5000;

    class RpcClient {
      constructor(connectorOrServersideChannel, requestTimeout) {
        this.connectorOrServersideChannel = connectorOrServersideChannel;
        this.remoteObjects = {};
        this.requestTimeout = requestTimeout || DEFAULT_REQUEST_TIMEOUT;
      }

      remoteObject(methodPrefix) {
        const remoteObject = this.remoteObjects[methodPrefix];
        if (!remoteObject) {
          this.remoteObjects[methodPrefix] = new SpecificRpcClient(this.connectorOrServersideChannel, methodPrefix, this.requestTimeout);
        }
        return this.remoteObjects[methodPrefix];
      }

      jsonrpcMsgReceive(stringMessage) {
        for (const remoteObject of Object.values(this.remoteObjects)) {
          remoteObject.jsonrpcMsgReceive(stringMessage);
        }
      }
    }

    class RPCTarget {
      constructor({ serversideChannel, serverMethods, methodPrefix }) {
        const transports = [new TransportServerChannel(serversideChannel)];
        this.server = new MoleServer({ transports });
        this.server.expose(serverMethods);
        this.server.setMethodPrefix(methodPrefix);
        this.server.run();
      }
    }

    naclFast.util = naclUtil;

    function newKeypair() {
      const keys = naclFast.box.keyPair();
      const publicKeyHex = bufferToHex(keys.publicKey);
      const privateKeyHex = bufferToHex(keys.secretKey);

      return { privateKey: keys.secretKey, publicKey: keys.publicKey, privateKeyHex, publicKeyHex };
    }

    naclFast.util = naclUtil;

    class Connector extends Eev {
      constructor({ address, protocol, lane, keypair = newKeypair(), rpcRequestTimeout, verbose = false, tag } = {}) {
        super();

        this.protocol = protocol;
        this.lane = lane;

        const { privateKey: clientPrivateKey, publicKey: clientPublicKey } = keypair;

        this.clientPrivateKey = clientPrivateKey;
        this.clientPublicKey = clientPublicKey;
        this.clientPublicKeyHex = bufferToHex(clientPublicKey);

        this.rpcClient = new RpcClient(this, rpcRequestTimeout);

        this.address = address;
        this.verbose = verbose;
        this.tag = tag;

        this.sentCount = 0;
        this.receivedCount = 0;

        this.successfulConnectsCount = 0;
      }

      send(data) {
        send({ data, connector: this });
        this.sentCount += 1;
      }

      wireReceive({ jsonData, encryptedData, rawMessage }) {
        wireReceive({ jsonData, encryptedData, rawMessage, connector: this });
        this.receivedCount += 1;
      }

      isReady() {
        return this.ready;
      }

      closed() {
        return !this.connected;
      }

      decommission() {
        this.decommissioned = true;
      }

      connectStatus(connected) {
        if (connected) {
          this.sentCount = 0;
          this.receivedCount = 0;

          this.connected = true;

          this.successfulConnectsCount += 1;

          const num = this.successfulConnectsCount;

          this.diffieHellman({
            clientPrivateKey: this.clientPrivateKey,
            clientPublicKey: this.clientPublicKey,
            lane: this.lane
          })
            .then(({ sharedSecret, sharedSecretHex }) => {
              this.ready = true;
              this.connectedAt = Date.now();

              this.emit('ready', { sharedSecret, sharedSecretHex });

              console.log(`✓ Ready: DMT Protocol Connector [ ${this.address} (${this.tag}) · ${this.protocol}/${this.lane} ]`);
            })
            .catch(e => {
              if (num == this.successfulConnectsCount) {
                console.log(e);
                console.log('dropping connection and retrying again');
                this.connection.terminate();
              }
            });
        } else {
          if (this.connected) {
            this.emit('disconnect');
          }

          if (this.connected == undefined) {
            console.log(`Connector ${this.address} (${this.tag}) was not able to connect at first try, setting READY to false`);
          }

          this.connected = false;
          this.ready = false;
          delete this.connectedAt;
        }
      }

      remoteObject(handle) {
        return {
          call: (methodName, params = []) => {
            return this.rpcClient.remoteObject(handle).call(methodName, listify(params));
          }
        };
      }

      attachObject(handle, obj) {
        new RPCTarget({ serversideChannel: this, serverMethods: obj, methodPrefix: handle });
      }

      diffieHellman({ clientPrivateKey, clientPublicKey, lane }) {
        return new Promise((success, reject) => {
          this.remoteObject('Auth')
            .call('exchangePubkeys', { pubkey: this.clientPublicKeyHex })
            .then(remotePubkeyHex => {
              const sharedSecret = naclFast.box.before(hexToBuffer(remotePubkeyHex), clientPrivateKey);
              const sharedSecretHex = bufferToHex(sharedSecret);
              this.sharedSecret = sharedSecret;

              this._remotePubkeyHex = remotePubkeyHex;

              success({ sharedSecret, sharedSecretHex });

              if (this.verbose) {
                console.log('Established shared secret through diffie-hellman exchange:');
                console.log(sharedSecretHex);
              }

              this.remoteObject('Auth')
                .call('finalizeHandshake', { lane })
                .then(() => {})
                .catch(reject);
            })
            .catch(reject);
        });
      }

      clientPubkey() {
        return this.clientPublicKeyHex;
      }

      remotePubkeyHex() {
        return this._remotePubkeyHex;
      }

      remoteAddress() {
        return this.address;
      }
    }

    const browser = typeof window !== 'undefined';

    const wsCONNECTING = 0;
    const wsOPEN = 1;

    function establishAndMaintainConnection({ address, ssl = false, port, protocol, lane, keypair, remotePubkey, rpcRequestTimeout, verbose, tag }, { WebSocket, log }) {
      const wsProtocol = ssl ? 'wss' : 'ws';
      const endpoint = port.toString().startsWith('/') ? `${wsProtocol}://${address}${port}` : `${wsProtocol}://${address}:${port}`;

      const connector = new Connector({ address, protocol, lane, rpcRequestTimeout, keypair, verbose, tag });

      if (connector.connection) {
        return connector;
      }

      connector.connection = {
        terminate() {
          this.websocket._removeAllCallbacks();
          this.websocket.close();
          connector.connectStatus(false);
        },
        endpoint,
        checkTicker: 0
      };

      setTimeout(() => tryReconnect({ connector, endpoint, protocol }, { WebSocket, log }), 10);

      const connectionCheckInterval = 1500;
      const callback = () => {
        if (!connector.decommissioned) {
          checkConnection({ connector, endpoint, protocol }, { WebSocket, log });
          setTimeout(callback, connectionCheckInterval);
        }
      };

      setTimeout(callback, connectionCheckInterval);

      return connector;
    }

    function checkConnection({ connector, endpoint, protocol }, { WebSocket, log }) {
      const conn = connector.connection;

      if (connectionIdle(conn) || connector.decommissioned) {
        if (connectionIdle(conn)) {
          log(`Connection ${connector.connection.endpoint} became idle, closing websocket ${conn.websocket.rand}`);
        } else {
          log(`Connection ${connector.connection.endpoint} decommisioned, closing websocket ${conn.websocket.rand}, will not retry again `);
        }

        conn.terminate();
        return;
      }

      const connected = socketConnected(conn);
      if (connected) {
        conn.websocket.send('ping');
      } else {
        if (connector.connected == undefined) {
          log(`Setting connector status to FALSE because connector.connected is undefined`);
          connector.connectStatus(false);
        }

        tryReconnect({ connector, endpoint, protocol }, { WebSocket, log });
      }

      conn.checkTicker += 1;
    }

    function tryReconnect({ connector, endpoint, protocol }, { WebSocket, log }) {
      const conn = connector.connection;

      if (conn.currentlyTryingWS && conn.currentlyTryingWS.readyState == wsCONNECTING) {
        if (conn.currentlyTryingWS._waitForConnectCounter == 3) {
          conn.currentlyTryingWS._removeAllCallbacks();
          conn.currentlyTryingWS.close();
        } else {
          conn.currentlyTryingWS._waitForConnectCounter += 1;
          return;
        }
      }

      const ws = new WebSocket(endpoint, protocol);

      conn.currentlyTryingWS = ws;
      conn.currentlyTryingWS._waitForConnectCounter = 0;

      ws.rand = Math.random();

      if (browser) {
        ws.binaryType = 'arraybuffer';
      }

      if (!browser) {
        ws.on('error', error => {});
      }

      const openCallback = m => {
        conn.currentlyTryingWS = null;
        conn.checkTicker = 0;
        addSocketListeners({ ws, connector, openCallback }, { log });
        conn.websocket = ws;
        connector.connectStatus(true);
      };

      ws._removeAllCallbacks = () => {
        ws.removeEventListener('open', openCallback);
      };

      if (browser) {
        ws.addEventListener('open', openCallback);
      } else {
        ws.on('open', openCallback);
      }
    }

    function addSocketListeners({ ws, connector, openCallback }, { log }) {
      const conn = connector.connection;

      const errorCallback = m => {
        log(`websocket ${ws.rand} conn ${connector.connection.endpoint} error`);
        log(m);
      };

      const closeCallback = m => {
        connector.connectStatus(false);
      };

      const messageCallback = _msg => {
        conn.checkTicker = 0;

        const msg = browser ? _msg.data : _msg;

        if (msg == 'pong') {
          return;
        }

        let jsonData;

        try {
          jsonData = JSON.parse(msg);
        } catch (e) {}

        if (jsonData) {
          connector.wireReceive({ jsonData, rawMessage: msg });
        } else {
          const encryptedData = browser ? new Uint8Array(msg) : msg;
          connector.wireReceive({ encryptedData });
        }
      };

      ws._removeAllCallbacks = () => {
        ws.removeEventListener('error', errorCallback);
        ws.removeEventListener('close', closeCallback);
        ws.removeEventListener('message', messageCallback);

        ws.removeEventListener('open', openCallback);
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
    }

    function socketConnected(conn) {
      return conn.websocket && conn.websocket.readyState == wsOPEN;
    }

    function connectionIdle(conn) {
      return socketConnected(conn) && conn.checkTicker > 5;
    }

    function establishAndMaintainConnection$1(opts) {
      return establishAndMaintainConnection(opts, { WebSocket, log });
    }

    const { applyPatch: applyJSONPatch } = fastJsonPatch;

    class ConnectedStore extends WritableStore {
      constructor({
        address,
        ssl = false,
        port,
        protocol,
        lane,
        keypair = newKeypair(),
        logStore,
        rpcRequestTimeout,
        verbose
      } = {}) {
        super({});

        if (!address) {
          throw new Error('ConnectedStore: missing address');
        }

        this.ssl = ssl;
        this.protocol = protocol;
        this.lane = lane;

        this.logStore = logStore;
        this.verbose = verbose;

        this.rpcRequestTimeout = rpcRequestTimeout;

        this.connected = new WritableStore();

        this.connect(address, port, keypair);
      }

      action({ action, namespace, payload }) {
        if (this.connector.connected) {
          console.log(`Sending action ${action} over connector ${this.connector.address}`);
          this.connector.send({ action, namespace, payload });
        } else {
          console.log(
            'Warning: trying to send action over disconnected connector, this should be prevented by GUI (to disable any state-changing element when not connected)'
          );
        }
      }

      remoteObject(handle) {
        return this.connector.remoteObject(handle);
      }

      connect(address, port, keypair) {
        this.connector = establishAndMaintainConnection$1({
          address,
          ssl: this.ssl,
          port,
          protocol: this.protocol,
          lane: this.lane,
          keypair,
          rpcRequestTimeout: this.rpcRequestTimeout,
          verbose: this.verbose
        });

        this.connector.on('ready', ({ sharedSecret, sharedSecretHex }) => {
          this.connected.set(true);
          this.emit('ready');
        });

        // 💡 connected == undefined ==> while trying to connect
        // 💡 connected == false => while disconnected
        // 💡 connected == true => while connected
        setTimeout(() => {
          if (this.connected.get() == undefined) {
            this.connected.set(false);
          }
        }, 300);

        this.connector.on('disconnect', () => {
          this.connected.set(false);
        });

        // 💡 Special incoming JSON message: { state: ... } ... parsed as part of 'Connectome State Syncing Protocol'
        this.connector.on('receive_state', state => {
          this.wireStateReceived = true;

          if (this.verbose) {
            console.log(`New store ${address} / ${this.protocol} / ${this.lane} state:`);
            console.log(state);
          }

          this.set(state);
        });

        // 💡 Special incoming JSON message: { diff: ... } ... parsed as part of 'Connectome State Syncing Protocol'
        this.connector.on('receive_diff', diff => {
          if (this.wireStateReceived) {
            applyJSONPatch(this.state, diff);
            this.pushStateToSubscribers();
          }
        });
      }
    }

    function makeConnectedStore(opts) {
      const store = new ConnectedStore(opts);

      const { connected, action: sendJSON, remoteObject, connector } = store;

      function sendText(str) {
        connector.send(str);
      }

      return { state: store, connected, sendJSON, sendText, remoteObject };
    }

    var pointer = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Pointer = void 0;
    /**
    Unescape token part of a JSON Pointer string

    `token` should *not* contain any '/' characters.

    > Evaluation of each reference token begins by decoding any escaped
    > character sequence.  This is performed by first transforming any
    > occurrence of the sequence '~1' to '/', and then transforming any
    > occurrence of the sequence '~0' to '~'.  By performing the
    > substitutions in this order, an implementation avoids the error of
    > turning '~01' first into '~1' and then into '/', which would be
    > incorrect (the string '~01' correctly becomes '~1' after
    > transformation).

    Here's my take:

    ~1 is unescaped with higher priority than ~0 because it is a lower-order escape character.
    I say "lower order" because '/' needs escaping due to the JSON Pointer serialization technique.
    Whereas, '~' is escaped because escaping '/' uses the '~' character.
    */
    function unescape(token) {
        return token.replace(/~1/g, '/').replace(/~0/g, '~');
    }
    /** Escape token part of a JSON Pointer string

    > '~' needs to be encoded as '~0' and '/'
    > needs to be encoded as '~1' when these characters appear in a
    > reference token.

    This is the exact inverse of `unescape()`, so the reverse replacements must take place in reverse order.
    */
    function escape(token) {
        return token.replace(/~/g, '~0').replace(/\//g, '~1');
    }
    /**
    JSON Pointer representation
    */
    var Pointer = /** @class */ (function () {
        function Pointer(tokens) {
            if (tokens === void 0) { tokens = ['']; }
            this.tokens = tokens;
        }
        /**
        `path` *must* be a properly escaped string.
        */
        Pointer.fromJSON = function (path) {
            var tokens = path.split('/').map(unescape);
            if (tokens[0] !== '')
                throw new Error("Invalid JSON Pointer: " + path);
            return new Pointer(tokens);
        };
        Pointer.prototype.toString = function () {
            return this.tokens.map(escape).join('/');
        };
        /**
        Returns an object with 'parent', 'key', and 'value' properties.
        In the special case that this Pointer's path == "",
        this object will be {parent: null, key: '', value: object}.
        Otherwise, parent and key will have the property such that parent[key] == value.
        */
        Pointer.prototype.evaluate = function (object) {
            var parent = null;
            var key = '';
            var value = object;
            for (var i = 1, l = this.tokens.length; i < l; i++) {
                parent = value;
                key = this.tokens[i];
                // not sure if this the best way to handle non-existant paths...
                value = (parent || {})[key];
            }
            return { parent: parent, key: key, value: value };
        };
        Pointer.prototype.get = function (object) {
            return this.evaluate(object).value;
        };
        Pointer.prototype.set = function (object, value) {
            var cursor = object;
            for (var i = 1, l = this.tokens.length - 1, token = this.tokens[i]; i < l; i++) {
                // not sure if this the best way to handle non-existant paths...
                cursor = (cursor || {})[token];
            }
            if (cursor) {
                cursor[this.tokens[this.tokens.length - 1]] = value;
            }
        };
        Pointer.prototype.push = function (token) {
            // mutable
            this.tokens.push(token);
        };
        /**
        `token` should be a String. It'll be coerced to one anyway.
      
        immutable (shallowly)
        */
        Pointer.prototype.add = function (token) {
            var tokens = this.tokens.concat(String(token));
            return new Pointer(tokens);
        };
        return Pointer;
    }());
    exports.Pointer = Pointer;
    });

    var util = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.clone = exports.objectType = exports.hasOwnProperty = void 0;
    exports.hasOwnProperty = Object.prototype.hasOwnProperty;
    function objectType(object) {
        if (object === undefined) {
            return 'undefined';
        }
        if (object === null) {
            return 'null';
        }
        if (Array.isArray(object)) {
            return 'array';
        }
        return typeof object;
    }
    exports.objectType = objectType;
    function isNonPrimitive(value) {
        // loose-equality checking for null is faster than strict checking for each of null/undefined/true/false
        // checking null first, then calling typeof, is faster than vice-versa
        return value != null && typeof value == 'object';
    }
    /**
    Recursively copy a value.

    @param source - should be a JavaScript primitive, Array, or (plain old) Object.
    @returns copy of source where every Array and Object have been recursively
             reconstructed from their constituent elements
    */
    function clone(source) {
        if (!isNonPrimitive(source)) {
            // short-circuiting is faster than a single return
            return source;
        }
        // x.constructor == Array is the fastest way to check if x is an Array
        if (source.constructor == Array) {
            // construction via imperative for-loop is faster than source.map(arrayVsObject)
            var length_1 = source.length;
            // setting the Array length during construction is faster than just `[]` or `new Array()`
            var arrayTarget = new Array(length_1);
            for (var i = 0; i < length_1; i++) {
                arrayTarget[i] = clone(source[i]);
            }
            return arrayTarget;
        }
        // Object
        var objectTarget = {};
        // declaring the variable (with const) inside the loop is faster
        for (var key in source) {
            // hasOwnProperty costs a bit of performance, but it's semantically necessary
            // using a global helper is MUCH faster than calling source.hasOwnProperty(key)
            if (exports.hasOwnProperty.call(source, key)) {
                objectTarget[key] = clone(source[key]);
            }
        }
        return objectTarget;
    }
    exports.clone = clone;
    });

    var diff = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.diffAny = exports.diffObjects = exports.diffArrays = exports.intersection = exports.subtract = exports.isDestructive = void 0;
     // we only need this for type inference

    function isDestructive(_a) {
        var op = _a.op;
        return op === 'remove' || op === 'replace' || op === 'copy' || op === 'move';
    }
    exports.isDestructive = isDestructive;
    /**
    List the keys in `minuend` that are not in `subtrahend`.

    A key is only considered if it is both 1) an own-property (o.hasOwnProperty(k))
    of the object, and 2) has a value that is not undefined. This is to match JSON
    semantics, where JSON object serialization drops keys with undefined values.

    @param minuend Object of interest
    @param subtrahend Object of comparison
    @returns Array of keys that are in `minuend` but not in `subtrahend`.
    */
    function subtract(minuend, subtrahend) {
        // initialize empty object; we only care about the keys, the values can be anything
        var obj = {};
        // build up obj with all the properties of minuend
        for (var add_key in minuend) {
            if (util.hasOwnProperty.call(minuend, add_key) && minuend[add_key] !== undefined) {
                obj[add_key] = 1;
            }
        }
        // now delete all the properties of subtrahend from obj
        // (deleting a missing key has no effect)
        for (var del_key in subtrahend) {
            if (util.hasOwnProperty.call(subtrahend, del_key) && subtrahend[del_key] !== undefined) {
                delete obj[del_key];
            }
        }
        // finally, extract whatever keys remain in obj
        return Object.keys(obj);
    }
    exports.subtract = subtract;
    /**
    List the keys that shared by all `objects`.

    The semantics of what constitutes a "key" is described in {@link subtract}.

    @param objects Array of objects to compare
    @returns Array of keys that are in ("own-properties" of) every object in `objects`.
    */
    function intersection(objects) {
        var length = objects.length;
        // prepare empty counter to keep track of how many objects each key occurred in
        var counter = {};
        // go through each object and increment the counter for each key in that object
        for (var i = 0; i < length; i++) {
            var object = objects[i];
            for (var key in object) {
                if (util.hasOwnProperty.call(object, key) && object[key] !== undefined) {
                    counter[key] = (counter[key] || 0) + 1;
                }
            }
        }
        // now delete all keys from the counter that were not seen in every object
        for (var key in counter) {
            if (counter[key] < length) {
                delete counter[key];
            }
        }
        // finally, extract whatever keys remain in the counter
        return Object.keys(counter);
    }
    exports.intersection = intersection;
    function isArrayAdd(array_operation) {
        return array_operation.op === 'add';
    }
    function isArrayRemove(array_operation) {
        return array_operation.op === 'remove';
    }
    function appendArrayOperation(base, operation) {
        return {
            // the new operation must be pushed on the end
            operations: base.operations.concat(operation),
            cost: base.cost + 1,
        };
    }
    /**
    Calculate the shortest sequence of operations to get from `input` to `output`,
    using a dynamic programming implementation of the Levenshtein distance algorithm.

    To get from the input ABC to the output AZ we could just delete all the input
    and say "insert A, insert Z" and be done with it. That's what we do if the
    input is empty. But we can be smarter.

              output
                   A   Z
                   -   -
              [0]  1   2
    input A |  1  [0]  1
          B |  2  [1]  1
          C |  3   2  [2]

    1) start at 0,0 (+0)
    2) keep A (+0)
    3) remove B (+1)
    4) replace C with Z (+1)

    If the `input` (source) is empty, they'll all be in the top row, resulting in an
    array of 'add' operations.
    If the `output` (target) is empty, everything will be in the left column,
    resulting in an array of 'remove' operations.

    @returns A list of add/remove/replace operations.
    */
    function diffArrays(input, output, ptr, diff) {
        if (diff === void 0) { diff = diffAny; }
        // set up cost matrix (very simple initialization: just a map)
        var memo = {
            '0,0': { operations: [], cost: 0 },
        };
        /**
        Calculate the cheapest sequence of operations required to get from
        input.slice(0, i) to output.slice(0, j).
        There may be other valid sequences with the same cost, but none cheaper.
      
        @param i The row in the layout above
        @param j The column in the layout above
        @returns An object containing a list of operations, along with the total cost
                 of applying them (+1 for each add/remove/replace operation)
        */
        function dist(i, j) {
            // memoized
            var memo_key = i + "," + j;
            var memoized = memo[memo_key];
            if (memoized === undefined) {
                // TODO: this !diff(...).length usage could/should be lazy
                if (i > 0 && j > 0 && !diff(input[i - 1], output[j - 1], new pointer.Pointer()).length) {
                    // equal (no operations => no cost)
                    memoized = dist(i - 1, j - 1);
                }
                else {
                    var alternatives = [];
                    if (i > 0) {
                        // NOT topmost row
                        var remove_base = dist(i - 1, j);
                        var remove_operation = {
                            op: 'remove',
                            index: i - 1,
                        };
                        alternatives.push(appendArrayOperation(remove_base, remove_operation));
                    }
                    if (j > 0) {
                        // NOT leftmost column
                        var add_base = dist(i, j - 1);
                        var add_operation = {
                            op: 'add',
                            index: i - 1,
                            value: output[j - 1],
                        };
                        alternatives.push(appendArrayOperation(add_base, add_operation));
                    }
                    if (i > 0 && j > 0) {
                        // TABLE MIDDLE
                        // supposing we replaced it, compute the rest of the costs:
                        var replace_base = dist(i - 1, j - 1);
                        // okay, the general plan is to replace it, but we can be smarter,
                        // recursing into the structure and replacing only part of it if
                        // possible, but to do so we'll need the original value
                        var replace_operation = {
                            op: 'replace',
                            index: i - 1,
                            original: input[i - 1],
                            value: output[j - 1],
                        };
                        alternatives.push(appendArrayOperation(replace_base, replace_operation));
                    }
                    // the only other case, i === 0 && j === 0, has already been memoized
                    // the meat of the algorithm:
                    // sort by cost to find the lowest one (might be several ties for lowest)
                    // [4, 6, 7, 1, 2].sort((a, b) => a - b) -> [ 1, 2, 4, 6, 7 ]
                    var best = alternatives.sort(function (a, b) { return a.cost - b.cost; })[0];
                    memoized = best;
                }
                memo[memo_key] = memoized;
            }
            return memoized;
        }
        // handle weird objects masquerading as Arrays that don't have proper length
        // properties by using 0 for everything but positive numbers
        var input_length = (isNaN(input.length) || input.length <= 0) ? 0 : input.length;
        var output_length = (isNaN(output.length) || output.length <= 0) ? 0 : output.length;
        var array_operations = dist(input_length, output_length).operations;
        var padded_operations = array_operations.reduce(function (_a, array_operation) {
            var operations = _a[0], padding = _a[1];
            if (isArrayAdd(array_operation)) {
                var padded_index = array_operation.index + 1 + padding;
                var index_token = padded_index < (input_length + padding) ? String(padded_index) : '-';
                var operation = {
                    op: array_operation.op,
                    path: ptr.add(index_token).toString(),
                    value: array_operation.value,
                };
                // padding++ // maybe only if array_operation.index > -1 ?
                return [operations.concat(operation), padding + 1];
            }
            else if (isArrayRemove(array_operation)) {
                var operation = {
                    op: array_operation.op,
                    path: ptr.add(String(array_operation.index + padding)).toString(),
                };
                // padding--
                return [operations.concat(operation), padding - 1];
            }
            else { // replace
                var replace_ptr = ptr.add(String(array_operation.index + padding));
                var replace_operations = diff(array_operation.original, array_operation.value, replace_ptr);
                return [operations.concat.apply(operations, replace_operations), padding];
            }
        }, [[], 0])[0];
        return padded_operations;
    }
    exports.diffArrays = diffArrays;
    function diffObjects(input, output, ptr, diff) {
        if (diff === void 0) { diff = diffAny; }
        // if a key is in input but not output -> remove it
        var operations = [];
        subtract(input, output).forEach(function (key) {
            operations.push({ op: 'remove', path: ptr.add(key).toString() });
        });
        // if a key is in output but not input -> add it
        subtract(output, input).forEach(function (key) {
            operations.push({ op: 'add', path: ptr.add(key).toString(), value: output[key] });
        });
        // if a key is in both, diff it recursively
        intersection([input, output]).forEach(function (key) {
            operations.push.apply(operations, diff(input[key], output[key], ptr.add(key)));
        });
        return operations;
    }
    exports.diffObjects = diffObjects;
    /**
    `diffAny()` returns an empty array if `input` and `output` are materially equal
    (i.e., would produce equivalent JSON); otherwise it produces an array of patches
    that would transform `input` into `output`.

    > Here, "equal" means that the value at the target location and the
    > value conveyed by "value" are of the same JSON type, and that they
    > are considered equal by the following rules for that type:
    > o  strings: are considered equal if they contain the same number of
    >    Unicode characters and their code points are byte-by-byte equal.
    > o  numbers: are considered equal if their values are numerically
    >    equal.
    > o  arrays: are considered equal if they contain the same number of
    >    values, and if each value can be considered equal to the value at
    >    the corresponding position in the other array, using this list of
    >    type-specific rules.
    > o  objects: are considered equal if they contain the same number of
    >    members, and if each member can be considered equal to a member in
    >    the other object, by comparing their keys (as strings) and their
    >    values (using this list of type-specific rules).
    > o  literals (false, true, and null): are considered equal if they are
    >    the same.
    */
    function diffAny(input, output, ptr, diff) {
        if (diff === void 0) { diff = diffAny; }
        // strict equality handles literals, numbers, and strings (a sufficient but not necessary cause)
        if (input === output) {
            return [];
        }
        var input_type = util.objectType(input);
        var output_type = util.objectType(output);
        if (input_type == 'array' && output_type == 'array') {
            return diffArrays(input, output, ptr, diff);
        }
        if (input_type == 'object' && output_type == 'object') {
            return diffObjects(input, output, ptr, diff);
        }
        // at this point we know that input and output are materially different;
        // could be array -> object, object -> array, boolean -> undefined,
        // number -> string, or some other combination, but nothing that can be split
        // up into multiple patches: so `output` must replace `input` wholesale.
        return [{ op: 'replace', path: ptr.toString(), value: output }];
    }
    exports.diffAny = diffAny;
    });

    var patch = createCommonjsModule$1(function (module, exports) {
    var __extends = (commonjsGlobal$1 && commonjsGlobal$1.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.apply = exports.InvalidOperationError = exports.test = exports.copy = exports.move = exports.replace = exports.remove = exports.add = exports.TestError = exports.MissingError = void 0;



    var MissingError = /** @class */ (function (_super) {
        __extends(MissingError, _super);
        function MissingError(path) {
            var _this = _super.call(this, "Value required at path: " + path) || this;
            _this.path = path;
            _this.name = 'MissingError';
            return _this;
        }
        return MissingError;
    }(Error));
    exports.MissingError = MissingError;
    var TestError = /** @class */ (function (_super) {
        __extends(TestError, _super);
        function TestError(actual, expected) {
            var _this = _super.call(this, "Test failed: " + actual + " != " + expected) || this;
            _this.actual = actual;
            _this.expected = expected;
            _this.name = 'TestError';
            return _this;
        }
        return TestError;
    }(Error));
    exports.TestError = TestError;
    function _add(object, key, value) {
        if (Array.isArray(object)) {
            // `key` must be an index
            if (key == '-') {
                object.push(value);
            }
            else {
                var index = parseInt(key, 10);
                object.splice(index, 0, value);
            }
        }
        else {
            object[key] = value;
        }
    }
    function _remove(object, key) {
        if (Array.isArray(object)) {
            // '-' syntax doesn't make sense when removing
            var index = parseInt(key, 10);
            object.splice(index, 1);
        }
        else {
            // not sure what the proper behavior is when path = ''
            delete object[key];
        }
    }
    /**
    >  o  If the target location specifies an array index, a new value is
    >     inserted into the array at the specified index.
    >  o  If the target location specifies an object member that does not
    >     already exist, a new member is added to the object.
    >  o  If the target location specifies an object member that does exist,
    >     that member's value is replaced.
    */
    function add(object, operation) {
        var endpoint = pointer.Pointer.fromJSON(operation.path).evaluate(object);
        // it's not exactly a "MissingError" in the same way that `remove` is -- more like a MissingParent, or something
        if (endpoint.parent === undefined) {
            return new MissingError(operation.path);
        }
        _add(endpoint.parent, endpoint.key, util.clone(operation.value));
        return null;
    }
    exports.add = add;
    /**
    > The "remove" operation removes the value at the target location.
    > The target location MUST exist for the operation to be successful.
    */
    function remove(object, operation) {
        // endpoint has parent, key, and value properties
        var endpoint = pointer.Pointer.fromJSON(operation.path).evaluate(object);
        if (endpoint.value === undefined) {
            return new MissingError(operation.path);
        }
        // not sure what the proper behavior is when path = ''
        _remove(endpoint.parent, endpoint.key);
        return null;
    }
    exports.remove = remove;
    /**
    > The "replace" operation replaces the value at the target location
    > with a new value.  The operation object MUST contain a "value" member
    > whose content specifies the replacement value.
    > The target location MUST exist for the operation to be successful.

    > This operation is functionally identical to a "remove" operation for
    > a value, followed immediately by an "add" operation at the same
    > location with the replacement value.

    Even more simply, it's like the add operation with an existence check.
    */
    function replace(object, operation) {
        var endpoint = pointer.Pointer.fromJSON(operation.path).evaluate(object);
        if (endpoint.parent === null) {
            return new MissingError(operation.path);
        }
        // this existence check treats arrays as a special case
        if (Array.isArray(endpoint.parent)) {
            if (parseInt(endpoint.key, 10) >= endpoint.parent.length) {
                return new MissingError(operation.path);
            }
        }
        else if (endpoint.value === undefined) {
            return new MissingError(operation.path);
        }
        endpoint.parent[endpoint.key] = operation.value;
        return null;
    }
    exports.replace = replace;
    /**
    > The "move" operation removes the value at a specified location and
    > adds it to the target location.
    > The operation object MUST contain a "from" member, which is a string
    > containing a JSON Pointer value that references the location in the
    > target document to move the value from.
    > This operation is functionally identical to a "remove" operation on
    > the "from" location, followed immediately by an "add" operation at
    > the target location with the value that was just removed.

    > The "from" location MUST NOT be a proper prefix of the "path"
    > location; i.e., a location cannot be moved into one of its children.

    TODO: throw if the check described in the previous paragraph fails.
    */
    function move(object, operation) {
        var from_endpoint = pointer.Pointer.fromJSON(operation.from).evaluate(object);
        if (from_endpoint.value === undefined) {
            return new MissingError(operation.from);
        }
        var endpoint = pointer.Pointer.fromJSON(operation.path).evaluate(object);
        if (endpoint.parent === undefined) {
            return new MissingError(operation.path);
        }
        _remove(from_endpoint.parent, from_endpoint.key);
        _add(endpoint.parent, endpoint.key, from_endpoint.value);
        return null;
    }
    exports.move = move;
    /**
    > The "copy" operation copies the value at a specified location to the
    > target location.
    > The operation object MUST contain a "from" member, which is a string
    > containing a JSON Pointer value that references the location in the
    > target document to copy the value from.
    > The "from" location MUST exist for the operation to be successful.

    > This operation is functionally identical to an "add" operation at the
    > target location using the value specified in the "from" member.

    Alternatively, it's like 'move' without the 'remove'.
    */
    function copy(object, operation) {
        var from_endpoint = pointer.Pointer.fromJSON(operation.from).evaluate(object);
        if (from_endpoint.value === undefined) {
            return new MissingError(operation.from);
        }
        var endpoint = pointer.Pointer.fromJSON(operation.path).evaluate(object);
        if (endpoint.parent === undefined) {
            return new MissingError(operation.path);
        }
        _add(endpoint.parent, endpoint.key, util.clone(from_endpoint.value));
        return null;
    }
    exports.copy = copy;
    /**
    > The "test" operation tests that a value at the target location is
    > equal to a specified value.
    > The operation object MUST contain a "value" member that conveys the
    > value to be compared to the target location's value.
    > The target location MUST be equal to the "value" value for the
    > operation to be considered successful.
    */
    function test(object, operation) {
        var endpoint = pointer.Pointer.fromJSON(operation.path).evaluate(object);
        // TODO: this diffAny(...).length usage could/should be lazy
        if (diff.diffAny(endpoint.value, operation.value, new pointer.Pointer()).length) {
            return new TestError(endpoint.value, operation.value);
        }
        return null;
    }
    exports.test = test;
    var InvalidOperationError = /** @class */ (function (_super) {
        __extends(InvalidOperationError, _super);
        function InvalidOperationError(operation) {
            var _this = _super.call(this, "Invalid operation: " + operation.op) || this;
            _this.operation = operation;
            _this.name = 'InvalidOperationError';
            return _this;
        }
        return InvalidOperationError;
    }(Error));
    exports.InvalidOperationError = InvalidOperationError;
    /**
    Switch on `operation.op`, applying the corresponding patch function for each
    case to `object`.
    */
    function apply(object, operation) {
        // not sure why TypeScript can't infer typesafety of:
        //   {add, remove, replace, move, copy, test}[operation.op](object, operation)
        // (seems like a bug)
        switch (operation.op) {
            case 'add': return add(object, operation);
            case 'remove': return remove(object, operation);
            case 'replace': return replace(object, operation);
            case 'move': return move(object, operation);
            case 'copy': return copy(object, operation);
            case 'test': return test(object, operation);
        }
        return new InvalidOperationError(operation);
    }
    exports.apply = apply;
    });

    var rfc6902 = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createTests = exports.createPatch = exports.applyPatch = void 0;



    /**
    Apply a 'application/json-patch+json'-type patch to an object.

    `patch` *must* be an array of operations.

    > Operation objects MUST have exactly one "op" member, whose value
    > indicates the operation to perform.  Its value MUST be one of "add",
    > "remove", "replace", "move", "copy", or "test"; other values are
    > errors.

    This method mutates the target object in-place.

    @returns list of results, one for each operation: `null` indicated success,
             otherwise, the result will be an instance of one of the Error classes:
             MissingError, InvalidOperationError, or TestError.
    */
    function applyPatch(object, patch$1) {
        return patch$1.map(function (operation) { return patch.apply(object, operation); });
    }
    exports.applyPatch = applyPatch;
    function wrapVoidableDiff(diff$1) {
        function wrappedDiff(input, output, ptr) {
            var custom_patch = diff$1(input, output, ptr);
            // ensure an array is always returned
            return Array.isArray(custom_patch) ? custom_patch : diff.diffAny(input, output, ptr, wrappedDiff);
        }
        return wrappedDiff;
    }
    /**
    Produce a 'application/json-patch+json'-type patch to get from one object to
    another.

    This does not alter `input` or `output` unless they have a property getter with
    side-effects (which is not a good idea anyway).

    `diff` is called on each pair of comparable non-primitive nodes in the
    `input`/`output` object trees, producing nested patches. Return `undefined`
    to fall back to default behaviour.

    Returns list of operations to perform on `input` to produce `output`.
    */
    function createPatch(input, output, diff$1) {
        var ptr = new pointer.Pointer();
        // a new Pointer gets a default path of [''] if not specified
        return (diff$1 ? wrapVoidableDiff(diff$1) : diff.diffAny)(input, output, ptr);
    }
    exports.createPatch = createPatch;
    /**
    Create a test operation based on `input`'s current evaluation of the JSON
    Pointer `path`; if such a pointer cannot be resolved, returns undefined.
    */
    function createTest(input, path) {
        var endpoint = pointer.Pointer.fromJSON(path).evaluate(input);
        if (endpoint !== undefined) {
            return { op: 'test', path: path, value: endpoint.value };
        }
    }
    /**
    Produce an 'application/json-patch+json'-type list of tests, to verify that
    existing values in an object are identical to the those captured at some
    checkpoint (whenever this function is called).

    This does not alter `input` or `output` unless they have a property getter with
    side-effects (which is not a good idea anyway).

    Returns list of test operations.
    */
    function createTests(input, patch) {
        var tests = new Array();
        patch.filter(diff.isDestructive).forEach(function (operation) {
            var pathTest = createTest(input, operation.path);
            if (pathTest)
                tests.push(pathTest);
            if ('from' in operation) {
                var fromTest = createTest(input, operation.from);
                if (fromTest)
                    tests.push(fromTest);
            }
        });
        return tests;
    }
    exports.createTests = createTests;
    });

    var rfc6902$1 = /*@__PURE__*/getDefaultExportFromCjs$1(rfc6902);

    const generateJsonPatch = rfc6902$1.createPatch;

    const address = window.location.hostname;
    const port = 7780;

    const protocol = 'dmt';
    const lane = 'gui';

    const { connected, state } = new makeConnectedStore({ address, port, protocol, lane });

    const app = new App({
      target: document.body,
      props: {
        connected,
        state
      }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
