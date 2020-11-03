
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
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
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
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
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
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
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
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
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
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
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
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
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
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
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const getCalendarPage = (month, year, dayProps, weekStart = 0) => {
      let date = new Date(year, month, 1);
      date.setDate(date.getDate() - date.getDay() + weekStart);
      let nextMonth = month === 11 ? 0 : month + 1;
      // ensure days starts on Sunday
      // and end on saturday
      let weeks = [];
      while (date.getMonth() !== nextMonth || date.getDay() !== weekStart || weeks.length !== 6) {
        if (date.getDay() === weekStart) weeks.unshift({ days: [], id: `${year}${month}${year}${weeks.length}` });
        const updated = Object.assign({
          partOfMonth: date.getMonth() === month,
          day: date.getDate(),
          month: date.getMonth(),
          year: date.getFullYear(),
          date: new Date(date)
        }, dayProps(date));
        weeks[0].days.push(updated);
        date.setDate(date.getDate() + 1);
      }
      weeks.reverse();
      return { month, year, weeks };
    };

    const getDayPropsHandler = (start, end, selectableCallback) => {
      let today = new Date();
      today.setHours(0, 0, 0, 0);
      return date => {
        const isInRange = date >= start && date <= end;
        return {
          isInRange,
          selectable: isInRange && (!selectableCallback || selectableCallback(date)),
          isToday: date.getTime() === today.getTime()
        };
      };
    };

    function getMonths(start, end, selectableCallback = null, weekStart = 0) {
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      let endDate = new Date(end.getFullYear(), end.getMonth() + 1, 1);
      let months = [];
      let date = new Date(start.getFullYear(), start.getMonth(), 1);
      let dayPropsHandler = getDayPropsHandler(start, end, selectableCallback);
      while (date < endDate) {
        months.push(getCalendarPage(date.getMonth(), date.getFullYear(), dayPropsHandler, weekStart));
        date.setMonth(date.getMonth() + 1);
      }
      return months;
    }

    const areDatesEquivalent = (a, b) => a.getDate() === b.getDate()
      && a.getMonth() === b.getMonth()
      && a.getFullYear() === b.getFullYear();

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
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
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* node_modules/svelte-calendar/src/Components/Week.svelte generated by Svelte v3.29.0 */
    const file = "node_modules/svelte-calendar/src/Components/Week.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (20:2) {#each days as day}
    function create_each_block(ctx) {
    	let div;
    	let button;
    	let t0_value = /*day*/ ctx[7].date.getDate() + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[6](/*day*/ ctx[7], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(button, "class", "day--label svelte-1f2gkwh");
    			attr_dev(button, "type", "button");
    			toggle_class(button, "selected", areDatesEquivalent(/*day*/ ctx[7].date, /*selected*/ ctx[1]));
    			toggle_class(button, "highlighted", areDatesEquivalent(/*day*/ ctx[7].date, /*highlighted*/ ctx[2]));
    			toggle_class(button, "shake-date", /*shouldShakeDate*/ ctx[3] && areDatesEquivalent(/*day*/ ctx[7].date, /*shouldShakeDate*/ ctx[3]));
    			toggle_class(button, "disabled", !/*day*/ ctx[7].selectable);
    			add_location(button, file, 26, 6, 666);
    			attr_dev(div, "class", "day svelte-1f2gkwh");
    			toggle_class(div, "outside-month", !/*day*/ ctx[7].partOfMonth);
    			toggle_class(div, "is-today", /*day*/ ctx[7].isToday);
    			toggle_class(div, "is-disabled", !/*day*/ ctx[7].selectable);
    			add_location(div, file, 20, 4, 501);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(button, t0);
    			append_dev(div, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*days*/ 1 && t0_value !== (t0_value = /*day*/ ctx[7].date.getDate() + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*areDatesEquivalent, days, selected*/ 3) {
    				toggle_class(button, "selected", areDatesEquivalent(/*day*/ ctx[7].date, /*selected*/ ctx[1]));
    			}

    			if (dirty & /*areDatesEquivalent, days, highlighted*/ 5) {
    				toggle_class(button, "highlighted", areDatesEquivalent(/*day*/ ctx[7].date, /*highlighted*/ ctx[2]));
    			}

    			if (dirty & /*shouldShakeDate, areDatesEquivalent, days*/ 9) {
    				toggle_class(button, "shake-date", /*shouldShakeDate*/ ctx[3] && areDatesEquivalent(/*day*/ ctx[7].date, /*shouldShakeDate*/ ctx[3]));
    			}

    			if (dirty & /*days*/ 1) {
    				toggle_class(button, "disabled", !/*day*/ ctx[7].selectable);
    			}

    			if (dirty & /*days*/ 1) {
    				toggle_class(div, "outside-month", !/*day*/ ctx[7].partOfMonth);
    			}

    			if (dirty & /*days*/ 1) {
    				toggle_class(div, "is-today", /*day*/ ctx[7].isToday);
    			}

    			if (dirty & /*days*/ 1) {
    				toggle_class(div, "is-disabled", !/*day*/ ctx[7].selectable);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(20:2) {#each days as day}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let div_intro;
    	let div_outro;
    	let current;
    	let each_value = /*days*/ ctx[0];
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

    			attr_dev(div, "class", "week svelte-1f2gkwh");
    			add_location(div, file, 14, 0, 343);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*days, areDatesEquivalent, selected, highlighted, shouldShakeDate, dispatch*/ 47) {
    				each_value = /*days*/ ctx[0];
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
    		},
    		i: function intro(local) {
    			if (current) return;

    			if (local) {
    				add_render_callback(() => {
    					if (div_outro) div_outro.end(1);

    					if (!div_intro) div_intro = create_in_transition(div, fly, {
    						x: /*direction*/ ctx[4] * 50,
    						duration: 180,
    						delay: 90
    					});

    					div_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();

    			if (local) {
    				div_outro = create_out_transition(div, fade, { duration: 180 });
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div_outro) div_outro.end();
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Week", slots, []);
    	const dispatch = createEventDispatcher();
    	let { days } = $$props;
    	let { selected } = $$props;
    	let { highlighted } = $$props;
    	let { shouldShakeDate } = $$props;
    	let { direction } = $$props;
    	const writable_props = ["days", "selected", "highlighted", "shouldShakeDate", "direction"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Week> was created with unknown prop '${key}'`);
    	});

    	const click_handler = day => dispatch("dateSelected", day.date);

    	$$self.$$set = $$props => {
    		if ("days" in $$props) $$invalidate(0, days = $$props.days);
    		if ("selected" in $$props) $$invalidate(1, selected = $$props.selected);
    		if ("highlighted" in $$props) $$invalidate(2, highlighted = $$props.highlighted);
    		if ("shouldShakeDate" in $$props) $$invalidate(3, shouldShakeDate = $$props.shouldShakeDate);
    		if ("direction" in $$props) $$invalidate(4, direction = $$props.direction);
    	};

    	$$self.$capture_state = () => ({
    		areDatesEquivalent,
    		fly,
    		fade,
    		createEventDispatcher,
    		dispatch,
    		days,
    		selected,
    		highlighted,
    		shouldShakeDate,
    		direction
    	});

    	$$self.$inject_state = $$props => {
    		if ("days" in $$props) $$invalidate(0, days = $$props.days);
    		if ("selected" in $$props) $$invalidate(1, selected = $$props.selected);
    		if ("highlighted" in $$props) $$invalidate(2, highlighted = $$props.highlighted);
    		if ("shouldShakeDate" in $$props) $$invalidate(3, shouldShakeDate = $$props.shouldShakeDate);
    		if ("direction" in $$props) $$invalidate(4, direction = $$props.direction);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		days,
    		selected,
    		highlighted,
    		shouldShakeDate,
    		direction,
    		dispatch,
    		click_handler
    	];
    }

    class Week extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			days: 0,
    			selected: 1,
    			highlighted: 2,
    			shouldShakeDate: 3,
    			direction: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Week",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*days*/ ctx[0] === undefined && !("days" in props)) {
    			console.warn("<Week> was created without expected prop 'days'");
    		}

    		if (/*selected*/ ctx[1] === undefined && !("selected" in props)) {
    			console.warn("<Week> was created without expected prop 'selected'");
    		}

    		if (/*highlighted*/ ctx[2] === undefined && !("highlighted" in props)) {
    			console.warn("<Week> was created without expected prop 'highlighted'");
    		}

    		if (/*shouldShakeDate*/ ctx[3] === undefined && !("shouldShakeDate" in props)) {
    			console.warn("<Week> was created without expected prop 'shouldShakeDate'");
    		}

    		if (/*direction*/ ctx[4] === undefined && !("direction" in props)) {
    			console.warn("<Week> was created without expected prop 'direction'");
    		}
    	}

    	get days() {
    		throw new Error("<Week>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set days(value) {
    		throw new Error("<Week>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<Week>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Week>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get highlighted() {
    		throw new Error("<Week>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set highlighted(value) {
    		throw new Error("<Week>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shouldShakeDate() {
    		throw new Error("<Week>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shouldShakeDate(value) {
    		throw new Error("<Week>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get direction() {
    		throw new Error("<Week>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set direction(value) {
    		throw new Error("<Week>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-calendar/src/Components/Month.svelte generated by Svelte v3.29.0 */
    const file$1 = "node_modules/svelte-calendar/src/Components/Month.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (20:2) {#each visibleMonth.weeks as week (week.id) }
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let week;
    	let current;

    	week = new Week({
    			props: {
    				days: /*week*/ ctx[8].days,
    				selected: /*selected*/ ctx[1],
    				highlighted: /*highlighted*/ ctx[2],
    				shouldShakeDate: /*shouldShakeDate*/ ctx[3],
    				direction: /*direction*/ ctx[4]
    			},
    			$$inline: true
    		});

    	week.$on("dateSelected", /*dateSelected_handler*/ ctx[6]);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(week.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(week, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const week_changes = {};
    			if (dirty & /*visibleMonth*/ 1) week_changes.days = /*week*/ ctx[8].days;
    			if (dirty & /*selected*/ 2) week_changes.selected = /*selected*/ ctx[1];
    			if (dirty & /*highlighted*/ 4) week_changes.highlighted = /*highlighted*/ ctx[2];
    			if (dirty & /*shouldShakeDate*/ 8) week_changes.shouldShakeDate = /*shouldShakeDate*/ ctx[3];
    			if (dirty & /*direction*/ 16) week_changes.direction = /*direction*/ ctx[4];
    			week.$set(week_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(week.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(week.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(week, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(20:2) {#each visibleMonth.weeks as week (week.id) }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*visibleMonth*/ ctx[0].weeks;
    	validate_each_argument(each_value);
    	const get_key = ctx => /*week*/ ctx[8].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "month-container svelte-ny3kda");
    			add_location(div, file$1, 18, 0, 286);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*visibleMonth, selected, highlighted, shouldShakeDate, direction*/ 31) {
    				const each_value = /*visibleMonth*/ ctx[0].weeks;
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    				check_outros();
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
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
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
    	validate_slots("Month", slots, []);
    	let { id } = $$props;
    	let { visibleMonth } = $$props;
    	let { selected } = $$props;
    	let { highlighted } = $$props;
    	let { shouldShakeDate } = $$props;
    	let lastId = id;
    	let direction;
    	const writable_props = ["id", "visibleMonth", "selected", "highlighted", "shouldShakeDate"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Month> was created with unknown prop '${key}'`);
    	});

    	function dateSelected_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("id" in $$props) $$invalidate(5, id = $$props.id);
    		if ("visibleMonth" in $$props) $$invalidate(0, visibleMonth = $$props.visibleMonth);
    		if ("selected" in $$props) $$invalidate(1, selected = $$props.selected);
    		if ("highlighted" in $$props) $$invalidate(2, highlighted = $$props.highlighted);
    		if ("shouldShakeDate" in $$props) $$invalidate(3, shouldShakeDate = $$props.shouldShakeDate);
    	};

    	$$self.$capture_state = () => ({
    		Week,
    		id,
    		visibleMonth,
    		selected,
    		highlighted,
    		shouldShakeDate,
    		lastId,
    		direction
    	});

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(5, id = $$props.id);
    		if ("visibleMonth" in $$props) $$invalidate(0, visibleMonth = $$props.visibleMonth);
    		if ("selected" in $$props) $$invalidate(1, selected = $$props.selected);
    		if ("highlighted" in $$props) $$invalidate(2, highlighted = $$props.highlighted);
    		if ("shouldShakeDate" in $$props) $$invalidate(3, shouldShakeDate = $$props.shouldShakeDate);
    		if ("lastId" in $$props) $$invalidate(7, lastId = $$props.lastId);
    		if ("direction" in $$props) $$invalidate(4, direction = $$props.direction);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*lastId, id*/ 160) {
    			 {
    				$$invalidate(4, direction = lastId < id ? 1 : -1);
    				$$invalidate(7, lastId = id);
    			}
    		}
    	};

    	return [
    		visibleMonth,
    		selected,
    		highlighted,
    		shouldShakeDate,
    		direction,
    		id,
    		dateSelected_handler
    	];
    }

    class Month extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			id: 5,
    			visibleMonth: 0,
    			selected: 1,
    			highlighted: 2,
    			shouldShakeDate: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Month",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[5] === undefined && !("id" in props)) {
    			console.warn("<Month> was created without expected prop 'id'");
    		}

    		if (/*visibleMonth*/ ctx[0] === undefined && !("visibleMonth" in props)) {
    			console.warn("<Month> was created without expected prop 'visibleMonth'");
    		}

    		if (/*selected*/ ctx[1] === undefined && !("selected" in props)) {
    			console.warn("<Month> was created without expected prop 'selected'");
    		}

    		if (/*highlighted*/ ctx[2] === undefined && !("highlighted" in props)) {
    			console.warn("<Month> was created without expected prop 'highlighted'");
    		}

    		if (/*shouldShakeDate*/ ctx[3] === undefined && !("shouldShakeDate" in props)) {
    			console.warn("<Month> was created without expected prop 'shouldShakeDate'");
    		}
    	}

    	get id() {
    		throw new Error("<Month>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Month>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get visibleMonth() {
    		throw new Error("<Month>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visibleMonth(value) {
    		throw new Error("<Month>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<Month>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Month>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get highlighted() {
    		throw new Error("<Month>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set highlighted(value) {
    		throw new Error("<Month>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shouldShakeDate() {
    		throw new Error("<Month>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shouldShakeDate(value) {
    		throw new Error("<Month>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-calendar/src/Components/NavBar.svelte generated by Svelte v3.29.0 */

    const { Object: Object_1 } = globals;
    const file$2 = "node_modules/svelte-calendar/src/Components/NavBar.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	child_ctx[17] = i;
    	return child_ctx;
    }

    // (64:4) {#each availableMonths as monthDefinition, index}
    function create_each_block$2(ctx) {
    	let div;
    	let span;
    	let t0_value = /*monthDefinition*/ ctx[15].abbrev + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[14](/*monthDefinition*/ ctx[15], /*index*/ ctx[17], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(span, "class", "svelte-1dqf106");
    			add_location(span, file$2, 70, 8, 1978);
    			attr_dev(div, "class", "month-selector--month svelte-1dqf106");
    			toggle_class(div, "selected", /*index*/ ctx[17] === /*month*/ ctx[0]);
    			toggle_class(div, "selectable", /*monthDefinition*/ ctx[15].selectable);
    			add_location(div, file$2, 64, 6, 1741);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(div, t1);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_2, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*availableMonths*/ 64 && t0_value !== (t0_value = /*monthDefinition*/ ctx[15].abbrev + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*month*/ 1) {
    				toggle_class(div, "selected", /*index*/ ctx[17] === /*month*/ ctx[0]);
    			}

    			if (dirty & /*availableMonths*/ 64) {
    				toggle_class(div, "selectable", /*monthDefinition*/ ctx[15].selectable);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(64:4) {#each availableMonths as monthDefinition, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div5;
    	let div3;
    	let div0;
    	let i0;
    	let t0;
    	let div1;
    	let t1_value = /*monthsOfYear*/ ctx[4][/*month*/ ctx[0]][0] + "";
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let div2;
    	let i1;
    	let t5;
    	let div4;
    	let mounted;
    	let dispose;
    	let each_value = /*availableMonths*/ ctx[6];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			i0 = element("i");
    			t0 = space();
    			div1 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			t3 = text(/*year*/ ctx[1]);
    			t4 = space();
    			div2 = element("div");
    			i1 = element("i");
    			t5 = space();
    			div4 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(i0, "class", "arrow left svelte-1dqf106");
    			add_location(i0, file$2, 51, 6, 1286);
    			attr_dev(div0, "class", "control svelte-1dqf106");
    			toggle_class(div0, "enabled", /*canDecrementMonth*/ ctx[3]);
    			add_location(div0, file$2, 48, 4, 1160);
    			attr_dev(div1, "class", "label svelte-1dqf106");
    			add_location(div1, file$2, 53, 4, 1330);
    			attr_dev(i1, "class", "arrow right svelte-1dqf106");
    			add_location(i1, file$2, 59, 6, 1566);
    			attr_dev(div2, "class", "control svelte-1dqf106");
    			toggle_class(div2, "enabled", /*canIncrementMonth*/ ctx[2]);
    			add_location(div2, file$2, 56, 4, 1442);
    			attr_dev(div3, "class", "heading-section svelte-1dqf106");
    			add_location(div3, file$2, 47, 2, 1125);
    			attr_dev(div4, "class", "month-selector svelte-1dqf106");
    			toggle_class(div4, "open", /*monthSelectorOpen*/ ctx[5]);
    			add_location(div4, file$2, 62, 2, 1619);
    			attr_dev(div5, "class", "title");
    			add_location(div5, file$2, 46, 0, 1102);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div3);
    			append_dev(div3, div0);
    			append_dev(div0, i0);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div1, t1);
    			append_dev(div1, t2);
    			append_dev(div1, t3);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, i1);
    			append_dev(div5, t5);
    			append_dev(div5, div4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div4, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[12], false, false, false),
    					listen_dev(div1, "click", /*toggleMonthSelectorOpen*/ ctx[8], false, false, false),
    					listen_dev(div2, "click", /*click_handler_1*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*canDecrementMonth*/ 8) {
    				toggle_class(div0, "enabled", /*canDecrementMonth*/ ctx[3]);
    			}

    			if (dirty & /*monthsOfYear, month*/ 17 && t1_value !== (t1_value = /*monthsOfYear*/ ctx[4][/*month*/ ctx[0]][0] + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*year*/ 2) set_data_dev(t3, /*year*/ ctx[1]);

    			if (dirty & /*canIncrementMonth*/ 4) {
    				toggle_class(div2, "enabled", /*canIncrementMonth*/ ctx[2]);
    			}

    			if (dirty & /*month, availableMonths, monthSelected*/ 577) {
    				each_value = /*availableMonths*/ ctx[6];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div4, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*monthSelectorOpen*/ 32) {
    				toggle_class(div4, "open", /*monthSelectorOpen*/ ctx[5]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots("NavBar", slots, []);
    	const dispatch = createEventDispatcher();
    	let { month } = $$props;
    	let { year } = $$props;
    	let { start } = $$props;
    	let { end } = $$props;
    	let { canIncrementMonth } = $$props;
    	let { canDecrementMonth } = $$props;
    	let { monthsOfYear } = $$props;
    	let monthSelectorOpen = false;
    	let availableMonths;

    	function toggleMonthSelectorOpen() {
    		$$invalidate(5, monthSelectorOpen = !monthSelectorOpen);
    	}

    	function monthSelected(event, { m, i }) {
    		event.stopPropagation();
    		if (!m.selectable) return;
    		dispatch("monthSelected", i);
    		toggleMonthSelectorOpen();
    	}

    	const writable_props = [
    		"month",
    		"year",
    		"start",
    		"end",
    		"canIncrementMonth",
    		"canDecrementMonth",
    		"monthsOfYear"
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NavBar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("incrementMonth", -1);
    	const click_handler_1 = () => dispatch("incrementMonth", 1);
    	const click_handler_2 = (monthDefinition, index, e) => monthSelected(e, { m: monthDefinition, i: index });

    	$$self.$$set = $$props => {
    		if ("month" in $$props) $$invalidate(0, month = $$props.month);
    		if ("year" in $$props) $$invalidate(1, year = $$props.year);
    		if ("start" in $$props) $$invalidate(10, start = $$props.start);
    		if ("end" in $$props) $$invalidate(11, end = $$props.end);
    		if ("canIncrementMonth" in $$props) $$invalidate(2, canIncrementMonth = $$props.canIncrementMonth);
    		if ("canDecrementMonth" in $$props) $$invalidate(3, canDecrementMonth = $$props.canDecrementMonth);
    		if ("monthsOfYear" in $$props) $$invalidate(4, monthsOfYear = $$props.monthsOfYear);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		month,
    		year,
    		start,
    		end,
    		canIncrementMonth,
    		canDecrementMonth,
    		monthsOfYear,
    		monthSelectorOpen,
    		availableMonths,
    		toggleMonthSelectorOpen,
    		monthSelected
    	});

    	$$self.$inject_state = $$props => {
    		if ("month" in $$props) $$invalidate(0, month = $$props.month);
    		if ("year" in $$props) $$invalidate(1, year = $$props.year);
    		if ("start" in $$props) $$invalidate(10, start = $$props.start);
    		if ("end" in $$props) $$invalidate(11, end = $$props.end);
    		if ("canIncrementMonth" in $$props) $$invalidate(2, canIncrementMonth = $$props.canIncrementMonth);
    		if ("canDecrementMonth" in $$props) $$invalidate(3, canDecrementMonth = $$props.canDecrementMonth);
    		if ("monthsOfYear" in $$props) $$invalidate(4, monthsOfYear = $$props.monthsOfYear);
    		if ("monthSelectorOpen" in $$props) $$invalidate(5, monthSelectorOpen = $$props.monthSelectorOpen);
    		if ("availableMonths" in $$props) $$invalidate(6, availableMonths = $$props.availableMonths);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*start, year, end, monthsOfYear*/ 3090) {
    			 {
    				let isOnLowerBoundary = start.getFullYear() === year;
    				let isOnUpperBoundary = end.getFullYear() === year;

    				$$invalidate(6, availableMonths = monthsOfYear.map((m, i) => {
    					return Object.assign({}, { name: m[0], abbrev: m[1] }, {
    						selectable: !isOnLowerBoundary && !isOnUpperBoundary || (!isOnLowerBoundary || i >= start.getMonth()) && (!isOnUpperBoundary || i <= end.getMonth())
    					});
    				}));
    			}
    		}
    	};

    	return [
    		month,
    		year,
    		canIncrementMonth,
    		canDecrementMonth,
    		monthsOfYear,
    		monthSelectorOpen,
    		availableMonths,
    		dispatch,
    		toggleMonthSelectorOpen,
    		monthSelected,
    		start,
    		end,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class NavBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			month: 0,
    			year: 1,
    			start: 10,
    			end: 11,
    			canIncrementMonth: 2,
    			canDecrementMonth: 3,
    			monthsOfYear: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavBar",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*month*/ ctx[0] === undefined && !("month" in props)) {
    			console.warn("<NavBar> was created without expected prop 'month'");
    		}

    		if (/*year*/ ctx[1] === undefined && !("year" in props)) {
    			console.warn("<NavBar> was created without expected prop 'year'");
    		}

    		if (/*start*/ ctx[10] === undefined && !("start" in props)) {
    			console.warn("<NavBar> was created without expected prop 'start'");
    		}

    		if (/*end*/ ctx[11] === undefined && !("end" in props)) {
    			console.warn("<NavBar> was created without expected prop 'end'");
    		}

    		if (/*canIncrementMonth*/ ctx[2] === undefined && !("canIncrementMonth" in props)) {
    			console.warn("<NavBar> was created without expected prop 'canIncrementMonth'");
    		}

    		if (/*canDecrementMonth*/ ctx[3] === undefined && !("canDecrementMonth" in props)) {
    			console.warn("<NavBar> was created without expected prop 'canDecrementMonth'");
    		}

    		if (/*monthsOfYear*/ ctx[4] === undefined && !("monthsOfYear" in props)) {
    			console.warn("<NavBar> was created without expected prop 'monthsOfYear'");
    		}
    	}

    	get month() {
    		throw new Error("<NavBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set month(value) {
    		throw new Error("<NavBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get year() {
    		throw new Error("<NavBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set year(value) {
    		throw new Error("<NavBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get start() {
    		throw new Error("<NavBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set start(value) {
    		throw new Error("<NavBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get end() {
    		throw new Error("<NavBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set end(value) {
    		throw new Error("<NavBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get canIncrementMonth() {
    		throw new Error("<NavBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set canIncrementMonth(value) {
    		throw new Error("<NavBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get canDecrementMonth() {
    		throw new Error("<NavBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set canDecrementMonth(value) {
    		throw new Error("<NavBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get monthsOfYear() {
    		throw new Error("<NavBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set monthsOfYear(value) {
    		throw new Error("<NavBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-calendar/src/Components/Popover.svelte generated by Svelte v3.29.0 */

    const { window: window_1 } = globals;
    const file$3 = "node_modules/svelte-calendar/src/Components/Popover.svelte";
    const get_contents_slot_changes = dirty => ({});
    const get_contents_slot_context = ctx => ({});
    const get_trigger_slot_changes = dirty => ({});
    const get_trigger_slot_context = ctx => ({});

    function create_fragment$3(ctx) {
    	let div4;
    	let div0;
    	let t;
    	let div3;
    	let div2;
    	let div1;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[14]);
    	const trigger_slot_template = /*#slots*/ ctx[13].trigger;
    	const trigger_slot = create_slot(trigger_slot_template, ctx, /*$$scope*/ ctx[12], get_trigger_slot_context);
    	const contents_slot_template = /*#slots*/ ctx[13].contents;
    	const contents_slot = create_slot(contents_slot_template, ctx, /*$$scope*/ ctx[12], get_contents_slot_context);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			if (trigger_slot) trigger_slot.c();
    			t = space();
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			if (contents_slot) contents_slot.c();
    			attr_dev(div0, "class", "trigger");
    			add_location(div0, file$3, 103, 2, 2365);
    			attr_dev(div1, "class", "contents-inner svelte-mc1z8c");
    			add_location(div1, file$3, 114, 6, 2763);
    			attr_dev(div2, "class", "contents svelte-mc1z8c");
    			add_location(div2, file$3, 113, 4, 2704);
    			attr_dev(div3, "class", "contents-wrapper svelte-mc1z8c");
    			set_style(div3, "transform", "translate(-50%,-50%) translate(" + /*translateX*/ ctx[8] + "px, " + /*translateY*/ ctx[7] + "px)");
    			toggle_class(div3, "visible", /*open*/ ctx[0]);
    			toggle_class(div3, "shrink", /*shrink*/ ctx[1]);
    			add_location(div3, file$3, 107, 2, 2487);
    			attr_dev(div4, "class", "sc-popover svelte-mc1z8c");
    			add_location(div4, file$3, 102, 0, 2317);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);

    			if (trigger_slot) {
    				trigger_slot.m(div0, null);
    			}

    			/*div0_binding*/ ctx[15](div0);
    			append_dev(div4, t);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);

    			if (contents_slot) {
    				contents_slot.m(div1, null);
    			}

    			/*div2_binding*/ ctx[16](div2);
    			/*div3_binding*/ ctx[17](div3);
    			/*div4_binding*/ ctx[18](div4);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "resize", /*onwindowresize*/ ctx[14]),
    					listen_dev(div0, "click", /*doOpen*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (trigger_slot) {
    				if (trigger_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(trigger_slot, trigger_slot_template, ctx, /*$$scope*/ ctx[12], dirty, get_trigger_slot_changes, get_trigger_slot_context);
    				}
    			}

    			if (contents_slot) {
    				if (contents_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(contents_slot, contents_slot_template, ctx, /*$$scope*/ ctx[12], dirty, get_contents_slot_changes, get_contents_slot_context);
    				}
    			}

    			if (!current || dirty & /*translateX, translateY*/ 384) {
    				set_style(div3, "transform", "translate(-50%,-50%) translate(" + /*translateX*/ ctx[8] + "px, " + /*translateY*/ ctx[7] + "px)");
    			}

    			if (dirty & /*open*/ 1) {
    				toggle_class(div3, "visible", /*open*/ ctx[0]);
    			}

    			if (dirty & /*shrink*/ 2) {
    				toggle_class(div3, "shrink", /*shrink*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(trigger_slot, local);
    			transition_in(contents_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(trigger_slot, local);
    			transition_out(contents_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (trigger_slot) trigger_slot.d(detaching);
    			/*div0_binding*/ ctx[15](null);
    			if (contents_slot) contents_slot.d(detaching);
    			/*div2_binding*/ ctx[16](null);
    			/*div3_binding*/ ctx[17](null);
    			/*div4_binding*/ ctx[18](null);
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots("Popover", slots, ['trigger','contents']);
    	const dispatch = createEventDispatcher();

    	let once = (el, evt, cb) => {
    		function handler() {
    			cb.apply(this, arguments);
    			el.removeEventListener(evt, handler);
    		}

    		el.addEventListener(evt, handler);
    	};

    	let popover;
    	let w;
    	let triggerContainer;
    	let contentsAnimated;
    	let contentsWrapper;
    	let translateY = 0;
    	let translateX = 0;
    	let { open = false } = $$props;
    	let { shrink } = $$props;
    	let { trigger } = $$props;

    	const close = () => {
    		$$invalidate(1, shrink = true);

    		once(contentsAnimated, "animationend", () => {
    			$$invalidate(1, shrink = false);
    			$$invalidate(0, open = false);
    			dispatch("closed");
    		});
    	};

    	function checkForFocusLoss(evt) {
    		if (!open) return;
    		let el = evt.target;

    		// eslint-disable-next-line
    		do {
    			if (el === popover) return;
    		} while (el = el.parentNode); // eslint-disable-next-line

    		close();
    	}

    	onMount(() => {
    		document.addEventListener("click", checkForFocusLoss);
    		if (!trigger) return;
    		triggerContainer.appendChild(trigger.parentNode.removeChild(trigger));

    		// eslint-disable-next-line
    		return () => {
    			document.removeEventListener("click", checkForFocusLoss);
    		};
    	});

    	const getDistanceToEdges = async () => {
    		if (!open) {
    			$$invalidate(0, open = true);
    		}

    		await tick();
    		let rect = contentsWrapper.getBoundingClientRect();

    		return {
    			top: rect.top + -1 * translateY,
    			bottom: window.innerHeight - rect.bottom + translateY,
    			left: rect.left + -1 * translateX,
    			right: document.body.clientWidth - rect.right + translateX
    		};
    	};

    	const getTranslate = async () => {
    		let dist = await getDistanceToEdges();
    		let x;
    		let y;

    		if (w < 480) {
    			y = dist.bottom;
    		} else if (dist.top < 0) {
    			y = Math.abs(dist.top);
    		} else if (dist.bottom < 0) {
    			y = dist.bottom;
    		} else {
    			y = 0;
    		}

    		if (dist.left < 0) {
    			x = Math.abs(dist.left);
    		} else if (dist.right < 0) {
    			x = dist.right;
    		} else {
    			x = 0;
    		}

    		return { x, y };
    	};

    	const doOpen = async () => {
    		const { x, y } = await getTranslate();
    		$$invalidate(8, translateX = x);
    		$$invalidate(7, translateY = y);
    		$$invalidate(0, open = true);
    		dispatch("opened");
    	};

    	const writable_props = ["open", "shrink", "trigger"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Popover> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(3, w = window_1.innerWidth);
    	}

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			triggerContainer = $$value;
    			$$invalidate(4, triggerContainer);
    		});
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			contentsAnimated = $$value;
    			$$invalidate(5, contentsAnimated);
    		});
    	}

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			contentsWrapper = $$value;
    			$$invalidate(6, contentsWrapper);
    		});
    	}

    	function div4_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			popover = $$value;
    			$$invalidate(2, popover);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("open" in $$props) $$invalidate(0, open = $$props.open);
    		if ("shrink" in $$props) $$invalidate(1, shrink = $$props.shrink);
    		if ("trigger" in $$props) $$invalidate(10, trigger = $$props.trigger);
    		if ("$$scope" in $$props) $$invalidate(12, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		tick,
    		dispatch,
    		once,
    		popover,
    		w,
    		triggerContainer,
    		contentsAnimated,
    		contentsWrapper,
    		translateY,
    		translateX,
    		open,
    		shrink,
    		trigger,
    		close,
    		checkForFocusLoss,
    		getDistanceToEdges,
    		getTranslate,
    		doOpen
    	});

    	$$self.$inject_state = $$props => {
    		if ("once" in $$props) once = $$props.once;
    		if ("popover" in $$props) $$invalidate(2, popover = $$props.popover);
    		if ("w" in $$props) $$invalidate(3, w = $$props.w);
    		if ("triggerContainer" in $$props) $$invalidate(4, triggerContainer = $$props.triggerContainer);
    		if ("contentsAnimated" in $$props) $$invalidate(5, contentsAnimated = $$props.contentsAnimated);
    		if ("contentsWrapper" in $$props) $$invalidate(6, contentsWrapper = $$props.contentsWrapper);
    		if ("translateY" in $$props) $$invalidate(7, translateY = $$props.translateY);
    		if ("translateX" in $$props) $$invalidate(8, translateX = $$props.translateX);
    		if ("open" in $$props) $$invalidate(0, open = $$props.open);
    		if ("shrink" in $$props) $$invalidate(1, shrink = $$props.shrink);
    		if ("trigger" in $$props) $$invalidate(10, trigger = $$props.trigger);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		open,
    		shrink,
    		popover,
    		w,
    		triggerContainer,
    		contentsAnimated,
    		contentsWrapper,
    		translateY,
    		translateX,
    		doOpen,
    		trigger,
    		close,
    		$$scope,
    		slots,
    		onwindowresize,
    		div0_binding,
    		div2_binding,
    		div3_binding,
    		div4_binding
    	];
    }

    class Popover extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			open: 0,
    			shrink: 1,
    			trigger: 10,
    			close: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Popover",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*shrink*/ ctx[1] === undefined && !("shrink" in props)) {
    			console.warn("<Popover> was created without expected prop 'shrink'");
    		}

    		if (/*trigger*/ ctx[10] === undefined && !("trigger" in props)) {
    			console.warn("<Popover> was created without expected prop 'trigger'");
    		}
    	}

    	get open() {
    		throw new Error("<Popover>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<Popover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shrink() {
    		throw new Error("<Popover>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shrink(value) {
    		throw new Error("<Popover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get trigger() {
    		throw new Error("<Popover>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set trigger(value) {
    		throw new Error("<Popover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get close() {
    		return this.$$.ctx[11];
    	}

    	set close(value) {
    		throw new Error("<Popover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * generic function to inject data into token-laden string
     * @param str {String} Required
     * @param name {String} Required
     * @param value {String|Integer} Required
     * @returns {String}
     *
     * @example
     * injectStringData("The following is a token: #{tokenName}", "tokenName", 123); 
     * @returns {String} "The following is a token: 123"
     *
     */
    const injectStringData = (str,name,value) => str
      .replace(new RegExp('#{'+name+'}','g'), value);

    /**
     * Generic function to enforce length of string. 
     * 
     * Pass a string or number to this function and specify the desired length.
     * This function will either pad the # with leading 0's (if str.length < length)
     * or remove data from the end (@fromBack==false) or beginning (@fromBack==true)
     * of the string when str.length > length.
     *
     * When length == str.length or typeof length == 'undefined', this function
     * returns the original @str parameter.
     * 
     * @param str {String} Required
     * @param length {Integer} Required
     * @param fromBack {Boolean} Optional
     * @returns {String}
     *
     */
    const enforceLength = function(str,length,fromBack) {
      str = str.toString();
      if(typeof length == 'undefined') return str;
      if(str.length == length) return str;
      fromBack = (typeof fromBack == 'undefined') ? false : fromBack;
      if(str.length < length) {
        // pad the beginning of the string w/ enough 0's to reach desired length:
        while(length - str.length > 0) str = '0' + str;
      } else if(str.length > length) {
        if(fromBack) {
          // grab the desired #/chars from end of string: ex: '2015' -> '15'
          str = str.substring(str.length-length);
        } else {
          // grab the desired #/chars from beginning of string: ex: '2015' -> '20'
          str = str.substring(0,length);
        }
      }
      return str;
    };

    const daysOfWeek = [ 
      [ 'Sunday', 'Sun' ],
      [ 'Monday', 'Mon' ],
      [ 'Tuesday', 'Tue' ],
      [ 'Wednesday', 'Wed' ],
      [ 'Thursday', 'Thu' ],
      [ 'Friday', 'Fri' ],
      [ 'Saturday', 'Sat' ]
    ];

    const monthsOfYear = [ 
      [ 'January', 'Jan' ],
      [ 'February', 'Feb' ],
      [ 'March', 'Mar' ],
      [ 'April', 'Apr' ],
      [ 'May', 'May' ],
      [ 'June', 'Jun' ],
      [ 'July', 'Jul' ],
      [ 'August', 'Aug' ],
      [ 'September', 'Sep' ],
      [ 'October', 'Oct' ],
      [ 'November', 'Nov' ],
      [ 'December', 'Dec' ]
    ];

    let dictionary = { 
      daysOfWeek, 
      monthsOfYear
    };

    const extendDictionary = (conf) => 
      Object.keys(conf).forEach(key => {
        if(dictionary[key] && dictionary[key].length == conf[key].length) {
          dictionary[key] = conf[key];
        }
      });

    var acceptedDateTokens = [
      { 
        // d: day of the month, 2 digits with leading zeros:
        key: 'd', 
        method: function(date) { return enforceLength(date.getDate(), 2); } 
      }, { 
        // D: textual representation of day, 3 letters: Sun thru Sat
        key: 'D', 
        method: function(date) { return dictionary.daysOfWeek[date.getDay()][1]; } 
      }, { 
        // j: day of month without leading 0's
        key: 'j', 
        method: function(date) { return date.getDate(); } 
      }, { 
        // l: full textual representation of day of week: Sunday thru Saturday
        key: 'l', 
        method: function(date) { return dictionary.daysOfWeek[date.getDay()][0]; } 
      }, { 
        // F: full text month: 'January' thru 'December'
        key: 'F', 
        method: function(date) { return dictionary.monthsOfYear[date.getMonth()][0]; } 
      }, { 
        // m: 2 digit numeric month: '01' - '12':
        key: 'm', 
        method: function(date) { return enforceLength(date.getMonth()+1,2); } 
      }, { 
        // M: a short textual representation of the month, 3 letters: 'Jan' - 'Dec'
        key: 'M', 
        method: function(date) { return dictionary.monthsOfYear[date.getMonth()][1]; } 
      }, { 
        // n: numeric represetation of month w/o leading 0's, '1' - '12':
        key: 'n', 
        method: function(date) { return date.getMonth() + 1; } 
      }, { 
        // Y: Full numeric year, 4 digits
        key: 'Y', 
        method: function(date) { return date.getFullYear(); } 
      }, { 
        // y: 2 digit numeric year:
        key: 'y', 
        method: function(date) { return enforceLength(date.getFullYear(),2,true); }
       }
    ];

    var acceptedTimeTokens = [
      { 
        // a: lowercase ante meridiem and post meridiem 'am' or 'pm'
        key: 'a', 
        method: function(date) { return (date.getHours() > 11) ? 'pm' : 'am'; } 
      }, { 
        // A: uppercase ante merdiiem and post meridiem 'AM' or 'PM'
        key: 'A', 
        method: function(date) { return (date.getHours() > 11) ? 'PM' : 'AM'; } 
      }, { 
        // g: 12-hour format of an hour without leading zeros 1-12
        key: 'g', 
        method: function(date) { return date.getHours() % 12 || 12; } 
      }, { 
        // G: 24-hour format of an hour without leading zeros 0-23
        key: 'G', 
        method: function(date) { return date.getHours(); } 
      }, { 
        // h: 12-hour format of an hour with leading zeros 01-12
        key: 'h', 
        method: function(date) { return enforceLength(date.getHours()%12 || 12,2); } 
      }, { 
        // H: 24-hour format of an hour with leading zeros: 00-23
        key: 'H', 
        method: function(date) { return enforceLength(date.getHours(),2); } 
      }, { 
        // i: Minutes with leading zeros 00-59
        key: 'i', 
        method: function(date) { return enforceLength(date.getMinutes(),2); } 
      }, { 
        // s: Seconds with leading zeros 00-59
        key: 's', 
        method: function(date) { return enforceLength(date.getSeconds(),2); }
       }
    ];

    /**
     * Internationalization object for timeUtils.internationalize().
     * @typedef internationalizeObj
     * @property {Array} [daysOfWeek=[ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ]] daysOfWeek Weekday labels as strings, starting with Sunday.
     * @property {Array} [monthsOfYear=[ 'January','February','March','April','May','June','July','August','September','October','November','December' ]] monthsOfYear Month labels as strings, starting with January.
     */

    /**
     * This function can be used to support additional languages by passing an object with 
     * `daysOfWeek` and `monthsOfYear` attributes.  Each attribute should be an array of
     * strings (ex: `daysOfWeek: ['monday', 'tuesday', 'wednesday'...]`)
     *
     * @param {internationalizeObj} conf
     */
    const internationalize = (conf={}) => { 
      extendDictionary(conf);
    };

    /**
     * generic formatDate function which accepts dynamic templates
     * @param date {Date} Required
     * @param template {String} Optional
     * @returns {String}
     *
     * @example
     * formatDate(new Date(), '#{M}. #{j}, #{Y}')
     * @returns {Number} Returns a formatted date
     *
     */
    const formatDate = (date,template='#{m}/#{d}/#{Y}') => {
      acceptedDateTokens.forEach(token => {
        if(template.indexOf(`#{${token.key}}`) == -1) return; 
        template = injectStringData(template,token.key,token.method(date));
      }); 
      acceptedTimeTokens.forEach(token => {
        if(template.indexOf(`#{${token.key}}`) == -1) return;
        template = injectStringData(template,token.key,token.method(date));
      });
      return template;
    };

    const keyCodes = {
      left: 37,
      up: 38,
      right: 39,
      down: 40,
      pgup: 33,
      pgdown: 34,
      enter: 13,
      escape: 27,
      tab: 9
    };

    const keyCodesArray = Object.keys(keyCodes).map(k => keyCodes[k]);

    /* node_modules/svelte-calendar/src/Components/Datepicker.svelte generated by Svelte v3.29.0 */
    const file$4 = "node_modules/svelte-calendar/src/Components/Datepicker.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[62] = list[i];
    	return child_ctx;
    }

    const get_default_slot_changes = dirty => ({
    	selected: dirty[0] & /*selected*/ 1,
    	formattedSelected: dirty[0] & /*formattedSelected*/ 4
    });

    const get_default_slot_context = ctx => ({
    	selected: /*selected*/ ctx[0],
    	formattedSelected: /*formattedSelected*/ ctx[2]
    });

    // (272:8) {#if !trigger}
    function create_if_block(ctx) {
    	let button;
    	let t;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(/*formattedSelected*/ ctx[2]);
    			attr_dev(button, "class", "calendar-button svelte-1lorc63");
    			attr_dev(button, "type", "button");
    			add_location(button, file$4, 272, 8, 7574);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*formattedSelected*/ 4) set_data_dev(t, /*formattedSelected*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(272:8) {#if !trigger}",
    		ctx
    	});

    	return block;
    }

    // (271:43)          
    function fallback_block(ctx) {
    	let if_block_anchor;
    	let if_block = !/*trigger*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (!/*trigger*/ ctx[1]) {
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
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(271:43)          ",
    		ctx
    	});

    	return block;
    }

    // (270:4) <div slot="trigger">
    function create_trigger_slot(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[38].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[45], get_default_slot_context);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			attr_dev(div, "slot", "trigger");
    			attr_dev(div, "class", "svelte-1lorc63");
    			add_location(div, file$4, 269, 4, 7478);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty[0] & /*selected, formattedSelected*/ 5 | dirty[1] & /*$$scope*/ 16384) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[45], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty[0] & /*formattedSelected, trigger*/ 6) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_trigger_slot.name,
    		type: "slot",
    		source: "(270:4) <div slot=\\\"trigger\\\">",
    		ctx
    	});

    	return block;
    }

    // (293:10) {#each sortedDaysOfWeek as day}
    function create_each_block$3(ctx) {
    	let span;
    	let t_value = /*day*/ ctx[62][1] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "svelte-1lorc63");
    			add_location(span, file$4, 293, 10, 8143);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(293:10) {#each sortedDaysOfWeek as day}",
    		ctx
    	});

    	return block;
    }

    // (279:4) <div slot="contents">
    function create_contents_slot(ctx) {
    	let div0;
    	let div2;
    	let navbar;
    	let t0;
    	let div1;
    	let t1;
    	let month_1;
    	let current;

    	navbar = new NavBar({
    			props: {
    				month: /*month*/ ctx[9],
    				year: /*year*/ ctx[10],
    				canIncrementMonth: /*canIncrementMonth*/ ctx[15],
    				canDecrementMonth: /*canDecrementMonth*/ ctx[16],
    				start: /*start*/ ctx[3],
    				end: /*end*/ ctx[4],
    				monthsOfYear: /*monthsOfYear*/ ctx[5]
    			},
    			$$inline: true
    		});

    	navbar.$on("monthSelected", /*monthSelected_handler*/ ctx[39]);
    	navbar.$on("incrementMonth", /*incrementMonth_handler*/ ctx[40]);
    	let each_value = /*sortedDaysOfWeek*/ ctx[18];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	month_1 = new Month({
    			props: {
    				visibleMonth: /*visibleMonth*/ ctx[13],
    				selected: /*selected*/ ctx[0],
    				highlighted: /*highlighted*/ ctx[7],
    				shouldShakeDate: /*shouldShakeDate*/ ctx[8],
    				id: /*visibleMonthId*/ ctx[14]
    			},
    			$$inline: true
    		});

    	month_1.$on("dateSelected", /*dateSelected_handler*/ ctx[41]);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div2 = element("div");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			create_component(month_1.$$.fragment);
    			attr_dev(div1, "class", "legend svelte-1lorc63");
    			add_location(div1, file$4, 291, 8, 8070);
    			attr_dev(div2, "class", "calendar svelte-1lorc63");
    			add_location(div2, file$4, 279, 6, 7740);
    			attr_dev(div0, "slot", "contents");
    			attr_dev(div0, "class", "svelte-1lorc63");
    			add_location(div0, file$4, 278, 4, 7712);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, div2);
    			mount_component(navbar, div2, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div2, t1);
    			mount_component(month_1, div2, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const navbar_changes = {};
    			if (dirty[0] & /*month*/ 512) navbar_changes.month = /*month*/ ctx[9];
    			if (dirty[0] & /*year*/ 1024) navbar_changes.year = /*year*/ ctx[10];
    			if (dirty[0] & /*canIncrementMonth*/ 32768) navbar_changes.canIncrementMonth = /*canIncrementMonth*/ ctx[15];
    			if (dirty[0] & /*canDecrementMonth*/ 65536) navbar_changes.canDecrementMonth = /*canDecrementMonth*/ ctx[16];
    			if (dirty[0] & /*start*/ 8) navbar_changes.start = /*start*/ ctx[3];
    			if (dirty[0] & /*end*/ 16) navbar_changes.end = /*end*/ ctx[4];
    			if (dirty[0] & /*monthsOfYear*/ 32) navbar_changes.monthsOfYear = /*monthsOfYear*/ ctx[5];
    			navbar.$set(navbar_changes);

    			if (dirty[0] & /*sortedDaysOfWeek*/ 262144) {
    				each_value = /*sortedDaysOfWeek*/ ctx[18];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const month_1_changes = {};
    			if (dirty[0] & /*visibleMonth*/ 8192) month_1_changes.visibleMonth = /*visibleMonth*/ ctx[13];
    			if (dirty[0] & /*selected*/ 1) month_1_changes.selected = /*selected*/ ctx[0];
    			if (dirty[0] & /*highlighted*/ 128) month_1_changes.highlighted = /*highlighted*/ ctx[7];
    			if (dirty[0] & /*shouldShakeDate*/ 256) month_1_changes.shouldShakeDate = /*shouldShakeDate*/ ctx[8];
    			if (dirty[0] & /*visibleMonthId*/ 16384) month_1_changes.id = /*visibleMonthId*/ ctx[14];
    			month_1.$set(month_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(month_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(month_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(navbar);
    			destroy_each(each_blocks, detaching);
    			destroy_component(month_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_contents_slot.name,
    		type: "slot",
    		source: "(279:4) <div slot=\\\"contents\\\">",
    		ctx
    	});

    	return block;
    }

    // (262:2) <Popover     bind:this="{popover}"     bind:open="{isOpen}"     bind:shrink="{isClosing}"     {trigger}     on:opened="{registerOpen}"     on:closed="{registerClose}"   >
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(262:2) <Popover     bind:this=\\\"{popover}\\\"     bind:open=\\\"{isOpen}\\\"     bind:shrink=\\\"{isClosing}\\\"     {trigger}     on:opened=\\\"{registerOpen}\\\"     on:closed=\\\"{registerClose}\\\"   >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let popover_1;
    	let updating_open;
    	let updating_shrink;
    	let current;

    	function popover_1_open_binding(value) {
    		/*popover_1_open_binding*/ ctx[43].call(null, value);
    	}

    	function popover_1_shrink_binding(value) {
    		/*popover_1_shrink_binding*/ ctx[44].call(null, value);
    	}

    	let popover_1_props = {
    		trigger: /*trigger*/ ctx[1],
    		$$slots: {
    			default: [create_default_slot],
    			contents: [create_contents_slot],
    			trigger: [create_trigger_slot]
    		},
    		$$scope: { ctx }
    	};

    	if (/*isOpen*/ ctx[11] !== void 0) {
    		popover_1_props.open = /*isOpen*/ ctx[11];
    	}

    	if (/*isClosing*/ ctx[12] !== void 0) {
    		popover_1_props.shrink = /*isClosing*/ ctx[12];
    	}

    	popover_1 = new Popover({ props: popover_1_props, $$inline: true });
    	/*popover_1_binding*/ ctx[42](popover_1);
    	binding_callbacks.push(() => bind(popover_1, "open", popover_1_open_binding));
    	binding_callbacks.push(() => bind(popover_1, "shrink", popover_1_shrink_binding));
    	popover_1.$on("opened", /*registerOpen*/ ctx[23]);
    	popover_1.$on("closed", /*registerClose*/ ctx[22]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(popover_1.$$.fragment);
    			attr_dev(div, "class", "datepicker svelte-1lorc63");
    			attr_dev(div, "style", /*wrapperStyle*/ ctx[17]);
    			toggle_class(div, "open", /*isOpen*/ ctx[11]);
    			toggle_class(div, "closing", /*isClosing*/ ctx[12]);
    			add_location(div, file$4, 255, 0, 7193);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(popover_1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const popover_1_changes = {};
    			if (dirty[0] & /*trigger*/ 2) popover_1_changes.trigger = /*trigger*/ ctx[1];

    			if (dirty[0] & /*visibleMonth, selected, highlighted, shouldShakeDate, visibleMonthId, month, year, canIncrementMonth, canDecrementMonth, start, end, monthsOfYear, formattedSelected, trigger*/ 124863 | dirty[1] & /*$$scope*/ 16384) {
    				popover_1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_open && dirty[0] & /*isOpen*/ 2048) {
    				updating_open = true;
    				popover_1_changes.open = /*isOpen*/ ctx[11];
    				add_flush_callback(() => updating_open = false);
    			}

    			if (!updating_shrink && dirty[0] & /*isClosing*/ 4096) {
    				updating_shrink = true;
    				popover_1_changes.shrink = /*isClosing*/ ctx[12];
    				add_flush_callback(() => updating_shrink = false);
    			}

    			popover_1.$set(popover_1_changes);

    			if (!current || dirty[0] & /*wrapperStyle*/ 131072) {
    				attr_dev(div, "style", /*wrapperStyle*/ ctx[17]);
    			}

    			if (dirty[0] & /*isOpen*/ 2048) {
    				toggle_class(div, "open", /*isOpen*/ ctx[11]);
    			}

    			if (dirty[0] & /*isClosing*/ 4096) {
    				toggle_class(div, "closing", /*isClosing*/ ctx[12]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(popover_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(popover_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*popover_1_binding*/ ctx[42](null);
    			destroy_component(popover_1);
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
    	validate_slots("Datepicker", slots, ['default']);
    	const dispatch = createEventDispatcher();
    	const today = new Date();
    	let popover;
    	let { format = "#{m}/#{d}/#{Y}" } = $$props;
    	let { start = new Date(1987, 9, 29) } = $$props;
    	let { end = new Date(2020, 9, 29) } = $$props;
    	let { selected = today } = $$props;
    	let { dateChosen = false } = $$props;
    	let { trigger = null } = $$props;
    	let { selectableCallback = null } = $$props;
    	let { weekStart = 0 } = $$props;

    	let { daysOfWeek = [
    		["Sunday", "Sun"],
    		["Monday", "Mon"],
    		["Tuesday", "Tue"],
    		["Wednesday", "Wed"],
    		["Thursday", "Thu"],
    		["Friday", "Fri"],
    		["Saturday", "Sat"]
    	] } = $$props;

    	let { monthsOfYear = [
    		["January", "Jan"],
    		["February", "Feb"],
    		["March", "Mar"],
    		["April", "Apr"],
    		["May", "May"],
    		["June", "Jun"],
    		["July", "Jul"],
    		["August", "Aug"],
    		["September", "Sep"],
    		["October", "Oct"],
    		["November", "Nov"],
    		["December", "Dec"]
    	] } = $$props;

    	let { style = "" } = $$props;
    	let { buttonBackgroundColor = "#fff" } = $$props;
    	let { buttonBorderColor = "#eee" } = $$props;
    	let { buttonTextColor = "#333" } = $$props;
    	let { highlightColor = "#f7901e" } = $$props;
    	let { dayBackgroundColor = "none" } = $$props;
    	let { dayTextColor = "#4a4a4a" } = $$props;
    	let { dayHighlightedBackgroundColor = "#efefef" } = $$props;
    	let { dayHighlightedTextColor = "#4a4a4a" } = $$props;
    	internationalize({ daysOfWeek, monthsOfYear });

    	let sortedDaysOfWeek = weekStart === 0
    	? daysOfWeek
    	: (() => {
    			let dow = daysOfWeek.slice();
    			dow.push(dow.shift());
    			return dow;
    		})();

    	let highlighted = today;
    	let shouldShakeDate = false;
    	let shakeHighlightTimeout;
    	let month = today.getMonth();
    	let year = today.getFullYear();
    	let isOpen = false;
    	let isClosing = false;
    	today.setHours(0, 0, 0, 0);

    	function assignmentHandler(formatted) {
    		if (!trigger) return;
    		$$invalidate(1, trigger.innerHTML = formatted, trigger);
    	}

    	let monthIndex = 0;
    	let { formattedSelected } = $$props;

    	onMount(() => {
    		$$invalidate(9, month = selected.getMonth());
    		$$invalidate(10, year = selected.getFullYear());
    	});

    	function changeMonth(selectedMonth) {
    		$$invalidate(9, month = selectedMonth);
    		$$invalidate(7, highlighted = new Date(year, month, 1));
    	}

    	function incrementMonth(direction, day = 1) {
    		if (direction === 1 && !canIncrementMonth) return;
    		if (direction === -1 && !canDecrementMonth) return;
    		let current = new Date(year, month, 1);
    		current.setMonth(current.getMonth() + direction);
    		$$invalidate(9, month = current.getMonth());
    		$$invalidate(10, year = current.getFullYear());
    		$$invalidate(7, highlighted = new Date(year, month, day));
    	}

    	function getDefaultHighlighted() {
    		return new Date(selected);
    	}

    	const getDay = (m, d, y) => {
    		let theMonth = months.find(aMonth => aMonth.month === m && aMonth.year === y);
    		if (!theMonth) return null;

    		// eslint-disable-next-line
    		for (let i = 0; i < theMonth.weeks.length; ++i) {
    			// eslint-disable-next-line
    			for (let j = 0; j < theMonth.weeks[i].days.length; ++j) {
    				let aDay = theMonth.weeks[i].days[j];
    				if (aDay.month === m && aDay.day === d && aDay.year === y) return aDay;
    			}
    		}

    		return null;
    	};

    	function incrementDayHighlighted(amount) {
    		let proposedDate = new Date(highlighted);
    		proposedDate.setDate(highlighted.getDate() + amount);
    		let correspondingDayObj = getDay(proposedDate.getMonth(), proposedDate.getDate(), proposedDate.getFullYear());
    		if (!correspondingDayObj || !correspondingDayObj.isInRange) return;
    		$$invalidate(7, highlighted = proposedDate);

    		if (amount > 0 && highlighted > lastVisibleDate) {
    			incrementMonth(1, highlighted.getDate());
    		}

    		if (amount < 0 && highlighted < firstVisibleDate) {
    			incrementMonth(-1, highlighted.getDate());
    		}
    	}

    	function checkIfVisibleDateIsSelectable(date) {
    		const proposedDay = getDay(date.getMonth(), date.getDate(), date.getFullYear());
    		return proposedDay && proposedDay.selectable;
    	}

    	function shakeDate(date) {
    		clearTimeout(shakeHighlightTimeout);
    		$$invalidate(8, shouldShakeDate = date);

    		shakeHighlightTimeout = setTimeout(
    			() => {
    				$$invalidate(8, shouldShakeDate = false);
    			},
    			700
    		);
    	}

    	function assignValueToTrigger(formatted) {
    		assignmentHandler(formatted);
    	}

    	function registerSelection(chosen) {
    		if (!checkIfVisibleDateIsSelectable(chosen)) return shakeDate(chosen);

    		// eslint-disable-next-line
    		close();

    		$$invalidate(0, selected = chosen);
    		$$invalidate(24, dateChosen = true);
    		assignValueToTrigger(formattedSelected);
    		return dispatch("dateSelected", { date: chosen });
    	}

    	function handleKeyPress(evt) {
    		if (keyCodesArray.indexOf(evt.keyCode) === -1) return;
    		evt.preventDefault();

    		switch (evt.keyCode) {
    			case keyCodes.left:
    				incrementDayHighlighted(-1);
    				break;
    			case keyCodes.up:
    				incrementDayHighlighted(-7);
    				break;
    			case keyCodes.right:
    				incrementDayHighlighted(1);
    				break;
    			case keyCodes.down:
    				incrementDayHighlighted(7);
    				break;
    			case keyCodes.pgup:
    				incrementMonth(-1);
    				break;
    			case keyCodes.pgdown:
    				incrementMonth(1);
    				break;
    			case keyCodes.escape:
    				// eslint-disable-next-line
    				close();
    				break;
    			case keyCodes.enter:
    				registerSelection(highlighted);
    				break;
    		}
    	}

    	function registerClose() {
    		document.removeEventListener("keydown", handleKeyPress);
    		dispatch("close");
    	}

    	function close() {
    		popover.close();
    		registerClose();
    	}

    	function registerOpen() {
    		$$invalidate(7, highlighted = getDefaultHighlighted());
    		$$invalidate(9, month = selected.getMonth());
    		$$invalidate(10, year = selected.getFullYear());
    		document.addEventListener("keydown", handleKeyPress);
    		dispatch("open");
    	}

    	const writable_props = [
    		"format",
    		"start",
    		"end",
    		"selected",
    		"dateChosen",
    		"trigger",
    		"selectableCallback",
    		"weekStart",
    		"daysOfWeek",
    		"monthsOfYear",
    		"style",
    		"buttonBackgroundColor",
    		"buttonBorderColor",
    		"buttonTextColor",
    		"highlightColor",
    		"dayBackgroundColor",
    		"dayTextColor",
    		"dayHighlightedBackgroundColor",
    		"dayHighlightedTextColor",
    		"formattedSelected"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Datepicker> was created with unknown prop '${key}'`);
    	});

    	const monthSelected_handler = e => changeMonth(e.detail);
    	const incrementMonth_handler = e => incrementMonth(e.detail);
    	const dateSelected_handler = e => registerSelection(e.detail);

    	function popover_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			popover = $$value;
    			$$invalidate(6, popover);
    		});
    	}

    	function popover_1_open_binding(value) {
    		isOpen = value;
    		$$invalidate(11, isOpen);
    	}

    	function popover_1_shrink_binding(value) {
    		isClosing = value;
    		$$invalidate(12, isClosing);
    	}

    	$$self.$$set = $$props => {
    		if ("format" in $$props) $$invalidate(25, format = $$props.format);
    		if ("start" in $$props) $$invalidate(3, start = $$props.start);
    		if ("end" in $$props) $$invalidate(4, end = $$props.end);
    		if ("selected" in $$props) $$invalidate(0, selected = $$props.selected);
    		if ("dateChosen" in $$props) $$invalidate(24, dateChosen = $$props.dateChosen);
    		if ("trigger" in $$props) $$invalidate(1, trigger = $$props.trigger);
    		if ("selectableCallback" in $$props) $$invalidate(26, selectableCallback = $$props.selectableCallback);
    		if ("weekStart" in $$props) $$invalidate(27, weekStart = $$props.weekStart);
    		if ("daysOfWeek" in $$props) $$invalidate(28, daysOfWeek = $$props.daysOfWeek);
    		if ("monthsOfYear" in $$props) $$invalidate(5, monthsOfYear = $$props.monthsOfYear);
    		if ("style" in $$props) $$invalidate(29, style = $$props.style);
    		if ("buttonBackgroundColor" in $$props) $$invalidate(30, buttonBackgroundColor = $$props.buttonBackgroundColor);
    		if ("buttonBorderColor" in $$props) $$invalidate(31, buttonBorderColor = $$props.buttonBorderColor);
    		if ("buttonTextColor" in $$props) $$invalidate(32, buttonTextColor = $$props.buttonTextColor);
    		if ("highlightColor" in $$props) $$invalidate(33, highlightColor = $$props.highlightColor);
    		if ("dayBackgroundColor" in $$props) $$invalidate(34, dayBackgroundColor = $$props.dayBackgroundColor);
    		if ("dayTextColor" in $$props) $$invalidate(35, dayTextColor = $$props.dayTextColor);
    		if ("dayHighlightedBackgroundColor" in $$props) $$invalidate(36, dayHighlightedBackgroundColor = $$props.dayHighlightedBackgroundColor);
    		if ("dayHighlightedTextColor" in $$props) $$invalidate(37, dayHighlightedTextColor = $$props.dayHighlightedTextColor);
    		if ("formattedSelected" in $$props) $$invalidate(2, formattedSelected = $$props.formattedSelected);
    		if ("$$scope" in $$props) $$invalidate(45, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Month,
    		NavBar,
    		Popover,
    		getMonths,
    		formatDate,
    		internationalize,
    		keyCodes,
    		keyCodesArray,
    		onMount,
    		createEventDispatcher,
    		dispatch,
    		today,
    		popover,
    		format,
    		start,
    		end,
    		selected,
    		dateChosen,
    		trigger,
    		selectableCallback,
    		weekStart,
    		daysOfWeek,
    		monthsOfYear,
    		style,
    		buttonBackgroundColor,
    		buttonBorderColor,
    		buttonTextColor,
    		highlightColor,
    		dayBackgroundColor,
    		dayTextColor,
    		dayHighlightedBackgroundColor,
    		dayHighlightedTextColor,
    		sortedDaysOfWeek,
    		highlighted,
    		shouldShakeDate,
    		shakeHighlightTimeout,
    		month,
    		year,
    		isOpen,
    		isClosing,
    		assignmentHandler,
    		monthIndex,
    		formattedSelected,
    		changeMonth,
    		incrementMonth,
    		getDefaultHighlighted,
    		getDay,
    		incrementDayHighlighted,
    		checkIfVisibleDateIsSelectable,
    		shakeDate,
    		assignValueToTrigger,
    		registerSelection,
    		handleKeyPress,
    		registerClose,
    		close,
    		registerOpen,
    		months,
    		visibleMonth,
    		visibleMonthId,
    		lastVisibleDate,
    		firstVisibleDate,
    		canIncrementMonth,
    		canDecrementMonth,
    		wrapperStyle
    	});

    	$$self.$inject_state = $$props => {
    		if ("popover" in $$props) $$invalidate(6, popover = $$props.popover);
    		if ("format" in $$props) $$invalidate(25, format = $$props.format);
    		if ("start" in $$props) $$invalidate(3, start = $$props.start);
    		if ("end" in $$props) $$invalidate(4, end = $$props.end);
    		if ("selected" in $$props) $$invalidate(0, selected = $$props.selected);
    		if ("dateChosen" in $$props) $$invalidate(24, dateChosen = $$props.dateChosen);
    		if ("trigger" in $$props) $$invalidate(1, trigger = $$props.trigger);
    		if ("selectableCallback" in $$props) $$invalidate(26, selectableCallback = $$props.selectableCallback);
    		if ("weekStart" in $$props) $$invalidate(27, weekStart = $$props.weekStart);
    		if ("daysOfWeek" in $$props) $$invalidate(28, daysOfWeek = $$props.daysOfWeek);
    		if ("monthsOfYear" in $$props) $$invalidate(5, monthsOfYear = $$props.monthsOfYear);
    		if ("style" in $$props) $$invalidate(29, style = $$props.style);
    		if ("buttonBackgroundColor" in $$props) $$invalidate(30, buttonBackgroundColor = $$props.buttonBackgroundColor);
    		if ("buttonBorderColor" in $$props) $$invalidate(31, buttonBorderColor = $$props.buttonBorderColor);
    		if ("buttonTextColor" in $$props) $$invalidate(32, buttonTextColor = $$props.buttonTextColor);
    		if ("highlightColor" in $$props) $$invalidate(33, highlightColor = $$props.highlightColor);
    		if ("dayBackgroundColor" in $$props) $$invalidate(34, dayBackgroundColor = $$props.dayBackgroundColor);
    		if ("dayTextColor" in $$props) $$invalidate(35, dayTextColor = $$props.dayTextColor);
    		if ("dayHighlightedBackgroundColor" in $$props) $$invalidate(36, dayHighlightedBackgroundColor = $$props.dayHighlightedBackgroundColor);
    		if ("dayHighlightedTextColor" in $$props) $$invalidate(37, dayHighlightedTextColor = $$props.dayHighlightedTextColor);
    		if ("sortedDaysOfWeek" in $$props) $$invalidate(18, sortedDaysOfWeek = $$props.sortedDaysOfWeek);
    		if ("highlighted" in $$props) $$invalidate(7, highlighted = $$props.highlighted);
    		if ("shouldShakeDate" in $$props) $$invalidate(8, shouldShakeDate = $$props.shouldShakeDate);
    		if ("shakeHighlightTimeout" in $$props) shakeHighlightTimeout = $$props.shakeHighlightTimeout;
    		if ("month" in $$props) $$invalidate(9, month = $$props.month);
    		if ("year" in $$props) $$invalidate(10, year = $$props.year);
    		if ("isOpen" in $$props) $$invalidate(11, isOpen = $$props.isOpen);
    		if ("isClosing" in $$props) $$invalidate(12, isClosing = $$props.isClosing);
    		if ("monthIndex" in $$props) $$invalidate(47, monthIndex = $$props.monthIndex);
    		if ("formattedSelected" in $$props) $$invalidate(2, formattedSelected = $$props.formattedSelected);
    		if ("months" in $$props) $$invalidate(48, months = $$props.months);
    		if ("visibleMonth" in $$props) $$invalidate(13, visibleMonth = $$props.visibleMonth);
    		if ("visibleMonthId" in $$props) $$invalidate(14, visibleMonthId = $$props.visibleMonthId);
    		if ("lastVisibleDate" in $$props) lastVisibleDate = $$props.lastVisibleDate;
    		if ("firstVisibleDate" in $$props) firstVisibleDate = $$props.firstVisibleDate;
    		if ("canIncrementMonth" in $$props) $$invalidate(15, canIncrementMonth = $$props.canIncrementMonth);
    		if ("canDecrementMonth" in $$props) $$invalidate(16, canDecrementMonth = $$props.canDecrementMonth);
    		if ("wrapperStyle" in $$props) $$invalidate(17, wrapperStyle = $$props.wrapperStyle);
    	};

    	let months;
    	let visibleMonth;
    	let visibleMonthId;
    	let lastVisibleDate;
    	let firstVisibleDate;
    	let canIncrementMonth;
    	let canDecrementMonth;
    	let wrapperStyle;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*start, end, selectableCallback, weekStart*/ 201326616) {
    			 $$invalidate(48, months = getMonths(start, end, selectableCallback, weekStart));
    		}

    		if ($$self.$$.dirty[0] & /*month, year*/ 1536 | $$self.$$.dirty[1] & /*months*/ 131072) {
    			 {
    				$$invalidate(47, monthIndex = 0);

    				for (let i = 0; i < months.length; i += 1) {
    					if (months[i].month === month && months[i].year === year) {
    						$$invalidate(47, monthIndex = i);
    					}
    				}
    			}
    		}

    		if ($$self.$$.dirty[1] & /*months, monthIndex*/ 196608) {
    			 $$invalidate(13, visibleMonth = months[monthIndex]);
    		}

    		if ($$self.$$.dirty[0] & /*year, month*/ 1536) {
    			 $$invalidate(14, visibleMonthId = year + month / 100);
    		}

    		if ($$self.$$.dirty[0] & /*visibleMonth*/ 8192) {
    			 lastVisibleDate = visibleMonth.weeks[visibleMonth.weeks.length - 1].days[6].date;
    		}

    		if ($$self.$$.dirty[0] & /*visibleMonth*/ 8192) {
    			 firstVisibleDate = visibleMonth.weeks[0].days[0].date;
    		}

    		if ($$self.$$.dirty[1] & /*monthIndex, months*/ 196608) {
    			 $$invalidate(15, canIncrementMonth = monthIndex < months.length - 1);
    		}

    		if ($$self.$$.dirty[1] & /*monthIndex*/ 65536) {
    			 $$invalidate(16, canDecrementMonth = monthIndex > 0);
    		}

    		if ($$self.$$.dirty[0] & /*buttonBackgroundColor, style*/ 1610612736 | $$self.$$.dirty[1] & /*buttonBorderColor, buttonTextColor, highlightColor, dayBackgroundColor, dayTextColor, dayHighlightedBackgroundColor, dayHighlightedTextColor*/ 127) {
    			 $$invalidate(17, wrapperStyle = `
    --button-background-color: ${buttonBackgroundColor};
    --button-border-color: ${buttonBorderColor};
    --button-text-color: ${buttonTextColor};
    --highlight-color: ${highlightColor};
    --day-background-color: ${dayBackgroundColor};
    --day-text-color: ${dayTextColor};
    --day-highlighted-background-color: ${dayHighlightedBackgroundColor};
    --day-highlighted-text-color: ${dayHighlightedTextColor};
    ${style}
  `);
    		}

    		if ($$self.$$.dirty[0] & /*format, selected*/ 33554433) {
    			 {
    				$$invalidate(2, formattedSelected = typeof format === "function"
    				? format(selected)
    				: formatDate(selected, format));
    			}
    		}
    	};

    	return [
    		selected,
    		trigger,
    		formattedSelected,
    		start,
    		end,
    		monthsOfYear,
    		popover,
    		highlighted,
    		shouldShakeDate,
    		month,
    		year,
    		isOpen,
    		isClosing,
    		visibleMonth,
    		visibleMonthId,
    		canIncrementMonth,
    		canDecrementMonth,
    		wrapperStyle,
    		sortedDaysOfWeek,
    		changeMonth,
    		incrementMonth,
    		registerSelection,
    		registerClose,
    		registerOpen,
    		dateChosen,
    		format,
    		selectableCallback,
    		weekStart,
    		daysOfWeek,
    		style,
    		buttonBackgroundColor,
    		buttonBorderColor,
    		buttonTextColor,
    		highlightColor,
    		dayBackgroundColor,
    		dayTextColor,
    		dayHighlightedBackgroundColor,
    		dayHighlightedTextColor,
    		slots,
    		monthSelected_handler,
    		incrementMonth_handler,
    		dateSelected_handler,
    		popover_1_binding,
    		popover_1_open_binding,
    		popover_1_shrink_binding,
    		$$scope
    	];
    }

    class Datepicker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$4,
    			create_fragment$4,
    			safe_not_equal,
    			{
    				format: 25,
    				start: 3,
    				end: 4,
    				selected: 0,
    				dateChosen: 24,
    				trigger: 1,
    				selectableCallback: 26,
    				weekStart: 27,
    				daysOfWeek: 28,
    				monthsOfYear: 5,
    				style: 29,
    				buttonBackgroundColor: 30,
    				buttonBorderColor: 31,
    				buttonTextColor: 32,
    				highlightColor: 33,
    				dayBackgroundColor: 34,
    				dayTextColor: 35,
    				dayHighlightedBackgroundColor: 36,
    				dayHighlightedTextColor: 37,
    				formattedSelected: 2
    			},
    			[-1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Datepicker",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*formattedSelected*/ ctx[2] === undefined && !("formattedSelected" in props)) {
    			console.warn("<Datepicker> was created without expected prop 'formattedSelected'");
    		}
    	}

    	get format() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set format(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get start() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set start(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get end() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set end(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dateChosen() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dateChosen(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get trigger() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set trigger(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectableCallback() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectableCallback(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get weekStart() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set weekStart(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get daysOfWeek() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set daysOfWeek(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get monthsOfYear() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set monthsOfYear(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get buttonBackgroundColor() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set buttonBackgroundColor(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get buttonBorderColor() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set buttonBorderColor(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get buttonTextColor() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set buttonTextColor(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get highlightColor() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set highlightColor(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dayBackgroundColor() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dayBackgroundColor(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dayTextColor() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dayTextColor(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dayHighlightedBackgroundColor() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dayHighlightedBackgroundColor(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dayHighlightedTextColor() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dayHighlightedTextColor(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get formattedSelected() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set formattedSelected(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

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

    var dayjs_min = createCommonjsModule(function (module, exports) {
    !function(t,e){module.exports=e();}(commonjsGlobal,function(){var t="millisecond",e="second",n="minute",r="hour",i="day",s="week",u="month",a="quarter",o="year",f="date",h=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[^0-9]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?.?(\d+)?$/,c=/\[([^\]]+)]|Y{2,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,d={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_")},$=function(t,e,n){var r=String(t);return !r||r.length>=e?t:""+Array(e+1-r.length).join(n)+t},l={s:$,z:function(t){var e=-t.utcOffset(),n=Math.abs(e),r=Math.floor(n/60),i=n%60;return (e<=0?"+":"-")+$(r,2,"0")+":"+$(i,2,"0")},m:function t(e,n){if(e.date()<n.date())return -t(n,e);var r=12*(n.year()-e.year())+(n.month()-e.month()),i=e.clone().add(r,u),s=n-i<0,a=e.clone().add(r+(s?-1:1),u);return +(-(r+(n-i)/(s?i-a:a-i))||0)},a:function(t){return t<0?Math.ceil(t)||0:Math.floor(t)},p:function(h){return {M:u,y:o,w:s,d:i,D:f,h:r,m:n,s:e,ms:t,Q:a}[h]||String(h||"").toLowerCase().replace(/s$/,"")},u:function(t){return void 0===t}},y="en",M={};M[y]=d;var m=function(t){return t instanceof S},D=function(t,e,n){var r;if(!t)return y;if("string"==typeof t)M[t]&&(r=t),e&&(M[t]=e,r=t);else {var i=t.name;M[i]=t,r=i;}return !n&&r&&(y=r),r||!n&&y},v=function(t,e){if(m(t))return t.clone();var n="object"==typeof e?e:{};return n.date=t,n.args=arguments,new S(n)},g=l;g.l=D,g.i=m,g.w=function(t,e){return v(t,{locale:e.$L,utc:e.$u,x:e.$x,$offset:e.$offset})};var S=function(){function d(t){this.$L=this.$L||D(t.locale,null,!0),this.parse(t);}var $=d.prototype;return $.parse=function(t){this.$d=function(t){var e=t.date,n=t.utc;if(null===e)return new Date(NaN);if(g.u(e))return new Date;if(e instanceof Date)return new Date(e);if("string"==typeof e&&!/Z$/i.test(e)){var r=e.match(h);if(r){var i=r[2]-1||0,s=(r[7]||"0").substring(0,3);return n?new Date(Date.UTC(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,s)):new Date(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,s)}}return new Date(e)}(t),this.$x=t.x||{},this.init();},$.init=function(){var t=this.$d;this.$y=t.getFullYear(),this.$M=t.getMonth(),this.$D=t.getDate(),this.$W=t.getDay(),this.$H=t.getHours(),this.$m=t.getMinutes(),this.$s=t.getSeconds(),this.$ms=t.getMilliseconds();},$.$utils=function(){return g},$.isValid=function(){return !("Invalid Date"===this.$d.toString())},$.isSame=function(t,e){var n=v(t);return this.startOf(e)<=n&&n<=this.endOf(e)},$.isAfter=function(t,e){return v(t)<this.startOf(e)},$.isBefore=function(t,e){return this.endOf(e)<v(t)},$.$g=function(t,e,n){return g.u(t)?this[e]:this.set(n,t)},$.unix=function(){return Math.floor(this.valueOf()/1e3)},$.valueOf=function(){return this.$d.getTime()},$.startOf=function(t,a){var h=this,c=!!g.u(a)||a,d=g.p(t),$=function(t,e){var n=g.w(h.$u?Date.UTC(h.$y,e,t):new Date(h.$y,e,t),h);return c?n:n.endOf(i)},l=function(t,e){return g.w(h.toDate()[t].apply(h.toDate("s"),(c?[0,0,0,0]:[23,59,59,999]).slice(e)),h)},y=this.$W,M=this.$M,m=this.$D,D="set"+(this.$u?"UTC":"");switch(d){case o:return c?$(1,0):$(31,11);case u:return c?$(1,M):$(0,M+1);case s:var v=this.$locale().weekStart||0,S=(y<v?y+7:y)-v;return $(c?m-S:m+(6-S),M);case i:case f:return l(D+"Hours",0);case r:return l(D+"Minutes",1);case n:return l(D+"Seconds",2);case e:return l(D+"Milliseconds",3);default:return this.clone()}},$.endOf=function(t){return this.startOf(t,!1)},$.$set=function(s,a){var h,c=g.p(s),d="set"+(this.$u?"UTC":""),$=(h={},h[i]=d+"Date",h[f]=d+"Date",h[u]=d+"Month",h[o]=d+"FullYear",h[r]=d+"Hours",h[n]=d+"Minutes",h[e]=d+"Seconds",h[t]=d+"Milliseconds",h)[c],l=c===i?this.$D+(a-this.$W):a;if(c===u||c===o){var y=this.clone().set(f,1);y.$d[$](l),y.init(),this.$d=y.set(f,Math.min(this.$D,y.daysInMonth())).$d;}else $&&this.$d[$](l);return this.init(),this},$.set=function(t,e){return this.clone().$set(t,e)},$.get=function(t){return this[g.p(t)]()},$.add=function(t,a){var f,h=this;t=Number(t);var c=g.p(a),d=function(e){var n=v(h);return g.w(n.date(n.date()+Math.round(e*t)),h)};if(c===u)return this.set(u,this.$M+t);if(c===o)return this.set(o,this.$y+t);if(c===i)return d(1);if(c===s)return d(7);var $=(f={},f[n]=6e4,f[r]=36e5,f[e]=1e3,f)[c]||1,l=this.$d.getTime()+t*$;return g.w(l,this)},$.subtract=function(t,e){return this.add(-1*t,e)},$.format=function(t){var e=this;if(!this.isValid())return "Invalid Date";var n=t||"YYYY-MM-DDTHH:mm:ssZ",r=g.z(this),i=this.$locale(),s=this.$H,u=this.$m,a=this.$M,o=i.weekdays,f=i.months,h=function(t,r,i,s){return t&&(t[r]||t(e,n))||i[r].substr(0,s)},d=function(t){return g.s(s%12||12,t,"0")},$=i.meridiem||function(t,e,n){var r=t<12?"AM":"PM";return n?r.toLowerCase():r},l={YY:String(this.$y).slice(-2),YYYY:this.$y,M:a+1,MM:g.s(a+1,2,"0"),MMM:h(i.monthsShort,a,f,3),MMMM:h(f,a),D:this.$D,DD:g.s(this.$D,2,"0"),d:String(this.$W),dd:h(i.weekdaysMin,this.$W,o,2),ddd:h(i.weekdaysShort,this.$W,o,3),dddd:o[this.$W],H:String(s),HH:g.s(s,2,"0"),h:d(1),hh:d(2),a:$(s,u,!0),A:$(s,u,!1),m:String(u),mm:g.s(u,2,"0"),s:String(this.$s),ss:g.s(this.$s,2,"0"),SSS:g.s(this.$ms,3,"0"),Z:r};return n.replace(c,function(t,e){return e||l[t]||r.replace(":","")})},$.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},$.diff=function(t,f,h){var c,d=g.p(f),$=v(t),l=6e4*($.utcOffset()-this.utcOffset()),y=this-$,M=g.m(this,$);return M=(c={},c[o]=M/12,c[u]=M,c[a]=M/3,c[s]=(y-l)/6048e5,c[i]=(y-l)/864e5,c[r]=y/36e5,c[n]=y/6e4,c[e]=y/1e3,c)[d]||y,h?M:g.a(M)},$.daysInMonth=function(){return this.endOf(u).$D},$.$locale=function(){return M[this.$L]},$.locale=function(t,e){if(!t)return this.$L;var n=this.clone(),r=D(t,e,!0);return r&&(n.$L=r),n},$.clone=function(){return g.w(this.$d,this)},$.toDate=function(){return new Date(this.valueOf())},$.toJSON=function(){return this.isValid()?this.toISOString():null},$.toISOString=function(){return this.$d.toISOString()},$.toString=function(){return this.$d.toUTCString()},d}(),p=S.prototype;return v.prototype=p,[["$ms",t],["$s",e],["$m",n],["$H",r],["$W",i],["$M",u],["$y",o],["$D",f]].forEach(function(t){p[t[1]]=function(e){return this.$g(e,t[0],t[1])};}),v.extend=function(t,e){return t(e,S,v),v},v.locale=D,v.isDayjs=m,v.unix=function(t){return v(1e3*t)},v.en=M[y],v.Ls=M,v});
    });

    function serialize(form) {
      const response = {};

      [...form.elements].forEach(function elements(input, _index) {
        // I know this "switch (true)" isn't beautiful, but it works!!!
        switch (true) {
          case !input.name:
          case input.disabled:
          case /(file|reset|submit|button)/i.test(input.type):
            break;
          case /(select-multiple)/i.test(input.type):
            response[input.name] = [];
            [...input.options].forEach(function options(option, _selectIndex) {
              if (option.selected) {
                response[input.name].push(option.value);
              }
            });
            break;
          case /(radio)/i.test(input.type):
            if (input.checked) {
              response[input.name] = input.value;
            }
            break;
          case /(checkbox)/i.test(input.type):
            if (input.checked) {
              response[input.name] = [...(response[input.name] || []), input.value];
            }
            break;
          default:
            if (input.value) {
              response[input.name] = input.value;
            }
            break;
        }
      });
      return response;
    }

    function deserialize(form, values) {
      [...form.elements].forEach(function elements(input, _index) {
        // I know this "switch (true)" isn't beautiful, but it works!!!
        switch (true) {
          case !input.name:
          case input.disabled:
          case /(file|reset|submit|button)/i.test(input.type):
            break;
          case /(select-multiple)/i.test(input.type):
            [...input.options].forEach(function options(option, _selectIndex) {
              option.selected =
                values[input.name] && values[input.name].includes(option.value);
            });
            break;
          case /(radio)/i.test(input.type):
            input.checked =
              values[input.name] && values[input.name] === input.value;
            break;
          case /(checkbox)/i.test(input.type):
            input.checked =
              values[input.name] && values[input.name].includes(input.value);
            break;
          default:
            input.value = values[input.name] || "";
            break;
        }
      });
    }

    function getValues(node) {
      let initialUpdateDone = 0;

      const inputs = [...node.getElementsByTagName('input')];

      inputs.forEach(el => {
        el.oninput = node.onchange;
      });

      node.addEventListener('input', handleUpdate);

      function handleUpdate() {
        node.dispatchEvent(new CustomEvent('update', {
          detail: { ...serialize(node) }
        }));
      }

      handleUpdate();

      return {
        update(values) {
          if (initialUpdateDone === 2) {
            deserialize(node, values);
          }
          else {
            initialUpdateDone += 1;
          }
        },
        destroy() {
          node.removeEventListener('input', handleUpdate);
        }
      };
    }

    function useActions(node, actions = []) {
      let cleanUpFunctions = [];

      // Apply each action
      actions.forEach(([action, options]) => {

        // Save the destroy method, supply a dummy one if the action doesn't contain one.
        const { destroy = () => { } } = action(node, options) || { destroy: () => { } };
        cleanUpFunctions.push(destroy);
      });

      return {
        destroy() {
          cleanUpFunctions.forEach(destroy => destroy());
        }
      };
    }

    /* node_modules/@svelteschool/svelte-forms/src/Form.svelte generated by Svelte v3.29.0 */
    const file$5 = "node_modules/@svelteschool/svelte-forms/src/Form.svelte";

    function create_fragment$5(ctx) {
    	let form;
    	let getValues_action;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			form = element("form");
    			if (default_slot) default_slot.c();
    			add_location(form, file$5, 8, 0, 193);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);

    			if (default_slot) {
    				default_slot.m(form, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(form, "update", /*update_handler*/ ctx[5], false, false, false),
    					action_destroyer(getValues_action = getValues.call(null, form, /*values*/ ctx[0])),
    					action_destroyer(useActions_action = useActions.call(null, form, /*actions*/ ctx[1])),
    					listen_dev(form, "submit", /*submit_handler*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}

    			if (getValues_action && is_function(getValues_action.update) && dirty & /*values*/ 1) getValues_action.update.call(null, /*values*/ ctx[0]);
    			if (useActions_action && is_function(useActions_action.update) && dirty & /*actions*/ 2) useActions_action.update.call(null, /*actions*/ ctx[1]);
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
    			if (detaching) detach_dev(form);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots("Form", slots, ['default']);
    	let { values = undefined } = $$props;
    	let { actions = [] } = $$props;
    	const writable_props = ["values", "actions"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Form> was created with unknown prop '${key}'`);
    	});

    	function submit_handler(event) {
    		bubble($$self, event);
    	}

    	const update_handler = ({ detail }) => $$invalidate(0, values = detail);

    	$$self.$$set = $$props => {
    		if ("values" in $$props) $$invalidate(0, values = $$props.values);
    		if ("actions" in $$props) $$invalidate(1, actions = $$props.actions);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ getValues, useActions, values, actions });

    	$$self.$inject_state = $$props => {
    		if ("values" in $$props) $$invalidate(0, values = $$props.values);
    		if ("actions" in $$props) $$invalidate(1, actions = $$props.actions);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [values, actions, $$scope, slots, submit_handler, update_handler];
    }

    class Form extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { values: 0, actions: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Form",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get values() {
    		throw new Error("<Form>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set values(value) {
    		throw new Error("<Form>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get actions() {
    		throw new Error("<Form>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set actions(value) {
    		throw new Error("<Form>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ErrorMsg.svelte generated by Svelte v3.29.0 */

    const file$6 = "src/ErrorMsg.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*errMsgText*/ ctx[0]);
    			attr_dev(div, "class", "error-msg");
    			add_location(div, file$6, 4, 0, 77);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*errMsgText*/ 1) set_data_dev(t, /*errMsgText*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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
    	validate_slots("ErrorMsg", slots, []);
    	let { errMsgText = "Something is not quite right." } = $$props;
    	const writable_props = ["errMsgText"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ErrorMsg> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("errMsgText" in $$props) $$invalidate(0, errMsgText = $$props.errMsgText);
    	};

    	$$self.$capture_state = () => ({ errMsgText });

    	$$self.$inject_state = $$props => {
    		if ("errMsgText" in $$props) $$invalidate(0, errMsgText = $$props.errMsgText);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [errMsgText];
    }

    class ErrorMsg extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { errMsgText: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ErrorMsg",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get errMsgText() {
    		throw new Error("<ErrorMsg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set errMsgText(value) {
    		throw new Error("<ErrorMsg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.29.0 */

    const { Error: Error_1, Object: Object_1$1, console: console_1 } = globals;
    const file$7 = "src/App.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i];
    	child_ctx[36] = i;
    	return child_ctx;
    }

    // (195:12) {#if dateChosen}
    function create_if_block_12(ctx) {
    	let div0;
    	let t1;
    	let div1;
    	let t2_value = /*weekDates*/ ctx[13][0].format("DD/MM/YYYY") + "";
    	let t2;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "Week Commencing";
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			attr_dev(div0, "class", "week-info-text");
    			add_location(div0, file$7, 195, 14, 6775);
    			attr_dev(div1, "class", "week-info-text");
    			add_location(div1, file$7, 196, 14, 6839);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*weekDates*/ 8192 && t2_value !== (t2_value = /*weekDates*/ ctx[13][0].format("DD/MM/YYYY") + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(195:12) {#if dateChosen}",
    		ctx
    	});

    	return block;
    }

    // (312:10) {:else}
    function create_else_block(ctx) {
    	let error;
    	let current;

    	error = new ErrorMsg({
    			props: { errMsgText: "Please select a start date" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(error.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(error, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(error.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(error.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(error, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(312:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (203:10) {#if dateChosen}
    function create_if_block_10(ctx) {
    	let div1;
    	let div0;
    	let input0;
    	let t1;
    	let div3;
    	let div2;
    	let input1;
    	let t3;
    	let div5;
    	let div4;
    	let input2;
    	let t5;
    	let div7;
    	let div6;
    	let input3;
    	let t7;
    	let div9;
    	let div8;
    	let input4;
    	let t9;
    	let if_block_anchor;
    	let if_block = /*includeWeekends*/ ctx[10] && create_if_block_11(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "MON";
    			input0 = element("input");
    			t1 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div2.textContent = "TUE";
    			input1 = element("input");
    			t3 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div4.textContent = "WED";
    			input2 = element("input");
    			t5 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div6.textContent = "THU";
    			input3 = element("input");
    			t7 = space();
    			div9 = element("div");
    			div8 = element("div");
    			div8.textContent = "FRI";
    			input4 = element("input");
    			t9 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div0, "class", "day-label");
    			add_location(div0, file$7, 204, 14, 7053);
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "min", "0");
    			attr_dev(input0, "class", "field-input time-unit w-input svelte-eq46ml");
    			attr_dev(input0, "maxlength", "256");
    			attr_dev(input0, "name", "monWeek1");
    			attr_dev(input0, "data-name", "monWeek1");
    			attr_dev(input0, "placeholder", "0");
    			input0.value = "0";
    			input0.required = true;
    			attr_dev(input0, "id", "mon");
    			toggle_class(input0, "error", /*timesheetData*/ ctx[5].monWeek1 > 16 && /*timeSheetUnitSelected*/ ctx[11] === "hours" || /*timesheetData*/ ctx[5].monWeek1 > 1 && /*timeSheetUnitSelected*/ ctx[11] === "days");
    			add_location(input0, file$7, 204, 46, 7085);
    			attr_dev(div1, "class", "day-wrap");
    			add_location(div1, file$7, 203, 12, 7016);
    			attr_dev(div2, "class", "day-label");
    			add_location(div2, file$7, 218, 14, 7645);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "min", "0");
    			attr_dev(input1, "max", "16");
    			attr_dev(input1, "class", "field-input time-unit w-input svelte-eq46ml");
    			attr_dev(input1, "maxlength", "256");
    			attr_dev(input1, "name", "tueWeek1");
    			attr_dev(input1, "data-name", "tueWeek1");
    			attr_dev(input1, "placeholder", "0");
    			input1.value = "0";
    			input1.required = true;
    			attr_dev(input1, "id", "tue");
    			toggle_class(input1, "error", /*timesheetData*/ ctx[5].tueWeek1 > 16 && /*timeSheetUnitSelected*/ ctx[11] === "hours" || /*timesheetData*/ ctx[5].tueWeek1 > 1 && /*timeSheetUnitSelected*/ ctx[11] === "days");
    			add_location(input1, file$7, 218, 46, 7677);
    			attr_dev(div3, "class", "day-wrap");
    			add_location(div3, file$7, 217, 12, 7608);
    			attr_dev(div4, "class", "day-label");
    			add_location(div4, file$7, 233, 14, 8262);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "min", "0");
    			attr_dev(input2, "max", "16");
    			attr_dev(input2, "class", "field-input time-unit w-input svelte-eq46ml");
    			attr_dev(input2, "maxlength", "256");
    			attr_dev(input2, "name", "wedWeek1");
    			attr_dev(input2, "data-name", "wedWeek1");
    			attr_dev(input2, "placeholder", "0");
    			input2.value = "0";
    			input2.required = true;
    			attr_dev(input2, "id", "wed");
    			toggle_class(input2, "error", /*timesheetData*/ ctx[5].wedWeek1 > 16 && /*timeSheetUnitSelected*/ ctx[11] === "hours" || /*timesheetData*/ ctx[5].wedWeek1 > 1 && /*timeSheetUnitSelected*/ ctx[11] === "days");
    			add_location(input2, file$7, 233, 46, 8294);
    			attr_dev(div5, "class", "day-wrap");
    			add_location(div5, file$7, 232, 12, 8225);
    			attr_dev(div6, "class", "day-label");
    			add_location(div6, file$7, 248, 14, 8879);
    			attr_dev(input3, "type", "number");
    			attr_dev(input3, "min", "0");
    			attr_dev(input3, "max", "16");
    			attr_dev(input3, "class", "field-input time-unit w-input svelte-eq46ml");
    			attr_dev(input3, "maxlength", "256");
    			attr_dev(input3, "name", "thuWeek1");
    			attr_dev(input3, "data-name", "thuWeek1");
    			attr_dev(input3, "placeholder", "0");
    			input3.value = "0";
    			input3.required = true;
    			attr_dev(input3, "id", "thu");
    			toggle_class(input3, "error", /*timesheetData*/ ctx[5].thuWeek1 > 16 && /*timeSheetUnitSelected*/ ctx[11] === "hours" || /*timesheetData*/ ctx[5].thuWeek1 > 1 && /*timeSheetUnitSelected*/ ctx[11] === "days");
    			add_location(input3, file$7, 248, 46, 8911);
    			attr_dev(div7, "class", "day-wrap");
    			add_location(div7, file$7, 247, 12, 8842);
    			attr_dev(div8, "class", "day-label");
    			add_location(div8, file$7, 263, 14, 9496);
    			attr_dev(input4, "type", "number");
    			attr_dev(input4, "min", "0");
    			attr_dev(input4, "max", "16");
    			attr_dev(input4, "class", "field-input time-unit w-input svelte-eq46ml");
    			attr_dev(input4, "maxlength", "256");
    			attr_dev(input4, "name", "friWeek1");
    			attr_dev(input4, "data-name", "friWeek1");
    			attr_dev(input4, "placeholder", "0");
    			input4.value = "0";
    			input4.required = true;
    			attr_dev(input4, "id", "fri");
    			toggle_class(input4, "error", /*timesheetData*/ ctx[5].friWeek1 > 16 && /*timeSheetUnitSelected*/ ctx[11] === "hours" || /*timesheetData*/ ctx[5].friWeek1 > 1 && /*timeSheetUnitSelected*/ ctx[11] === "days");
    			add_location(input4, file$7, 263, 46, 9528);
    			attr_dev(div9, "class", "day-wrap");
    			add_location(div9, file$7, 262, 12, 9459);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, input0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div3, input1);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div5, input2);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div6);
    			append_dev(div7, input3);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div8);
    			append_dev(div9, input4);
    			insert_dev(target, t9, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*timesheetData, timeSheetUnitSelected*/ 2080) {
    				toggle_class(input0, "error", /*timesheetData*/ ctx[5].monWeek1 > 16 && /*timeSheetUnitSelected*/ ctx[11] === "hours" || /*timesheetData*/ ctx[5].monWeek1 > 1 && /*timeSheetUnitSelected*/ ctx[11] === "days");
    			}

    			if (dirty[0] & /*timesheetData, timeSheetUnitSelected*/ 2080) {
    				toggle_class(input1, "error", /*timesheetData*/ ctx[5].tueWeek1 > 16 && /*timeSheetUnitSelected*/ ctx[11] === "hours" || /*timesheetData*/ ctx[5].tueWeek1 > 1 && /*timeSheetUnitSelected*/ ctx[11] === "days");
    			}

    			if (dirty[0] & /*timesheetData, timeSheetUnitSelected*/ 2080) {
    				toggle_class(input2, "error", /*timesheetData*/ ctx[5].wedWeek1 > 16 && /*timeSheetUnitSelected*/ ctx[11] === "hours" || /*timesheetData*/ ctx[5].wedWeek1 > 1 && /*timeSheetUnitSelected*/ ctx[11] === "days");
    			}

    			if (dirty[0] & /*timesheetData, timeSheetUnitSelected*/ 2080) {
    				toggle_class(input3, "error", /*timesheetData*/ ctx[5].thuWeek1 > 16 && /*timeSheetUnitSelected*/ ctx[11] === "hours" || /*timesheetData*/ ctx[5].thuWeek1 > 1 && /*timeSheetUnitSelected*/ ctx[11] === "days");
    			}

    			if (dirty[0] & /*timesheetData, timeSheetUnitSelected*/ 2080) {
    				toggle_class(input4, "error", /*timesheetData*/ ctx[5].friWeek1 > 16 && /*timeSheetUnitSelected*/ ctx[11] === "hours" || /*timesheetData*/ ctx[5].friWeek1 > 1 && /*timeSheetUnitSelected*/ ctx[11] === "days");
    			}

    			if (/*includeWeekends*/ ctx[10]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_11(ctx);
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
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div7);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div9);
    			if (detaching) detach_dev(t9);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(203:10) {#if dateChosen}",
    		ctx
    	});

    	return block;
    }

    // (278:12) {#if includeWeekends}
    function create_if_block_11(ctx) {
    	let div4;
    	let div1;
    	let div0;
    	let input0;
    	let t1;
    	let div3;
    	let div2;
    	let input1;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "SAT";
    			input0 = element("input");
    			t1 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div2.textContent = "SUN";
    			input1 = element("input");
    			attr_dev(div0, "class", "day-label");
    			add_location(div0, file$7, 280, 18, 10196);
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "min", "0");
    			attr_dev(input0, "max", "16");
    			attr_dev(input0, "class", "field-input time-unit w-input svelte-eq46ml");
    			attr_dev(input0, "maxlength", "256");
    			attr_dev(input0, "name", "satWeek1");
    			attr_dev(input0, "data-name", "satWeek1");
    			attr_dev(input0, "placeholder", "0");
    			input0.value = "0";
    			input0.required = true;
    			attr_dev(input0, "id", "sat");
    			toggle_class(input0, "error", /*timesheetData*/ ctx[5].satWeek1 > 16 && /*timeSheetUnitSelected*/ ctx[11] === "hours" || /*timesheetData*/ ctx[5].satWeek1 > 1 && /*timeSheetUnitSelected*/ ctx[11] === "days");
    			add_location(input0, file$7, 280, 50, 10228);
    			attr_dev(div1, "class", "day-wrap");
    			add_location(div1, file$7, 279, 16, 10155);
    			attr_dev(div2, "class", "day-label");
    			add_location(div2, file$7, 295, 18, 10873);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "min", "0");
    			attr_dev(input1, "max", "16");
    			attr_dev(input1, "class", "field-input time-unit w-input svelte-eq46ml");
    			attr_dev(input1, "maxlength", "256");
    			attr_dev(input1, "name", "sunWeek1");
    			attr_dev(input1, "data-name", "sunWeek1");
    			attr_dev(input1, "placeholder", "0");
    			input1.value = "0";
    			input1.required = true;
    			attr_dev(input1, "id", "sun");
    			toggle_class(input1, "error", /*timesheetData*/ ctx[5].sunWeek1 > 16 && /*timeSheetUnitSelected*/ ctx[11] === "hours" || /*timesheetData*/ ctx[5].sunWeek1 > 1 && /*timeSheetUnitSelected*/ ctx[11] === "days");
    			add_location(input1, file$7, 295, 50, 10905);
    			attr_dev(div3, "class", "day-wrap");
    			add_location(div3, file$7, 294, 16, 10832);
    			attr_dev(div4, "class", "weekend-wrap");
    			add_location(div4, file$7, 278, 14, 10112);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			append_dev(div1, input0);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div3, input1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*timesheetData, timeSheetUnitSelected*/ 2080) {
    				toggle_class(input0, "error", /*timesheetData*/ ctx[5].satWeek1 > 16 && /*timeSheetUnitSelected*/ ctx[11] === "hours" || /*timesheetData*/ ctx[5].satWeek1 > 1 && /*timeSheetUnitSelected*/ ctx[11] === "days");
    			}

    			if (dirty[0] & /*timesheetData, timeSheetUnitSelected*/ 2080) {
    				toggle_class(input1, "error", /*timesheetData*/ ctx[5].sunWeek1 > 16 && /*timeSheetUnitSelected*/ ctx[11] === "hours" || /*timesheetData*/ ctx[5].sunWeek1 > 1 && /*timeSheetUnitSelected*/ ctx[11] === "days");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(278:12) {#if includeWeekends}",
    		ctx
    	});

    	return block;
    }

    // (315:10) {#if dateChosen && weeks == 0}
    function create_if_block_9(ctx) {
    	let div;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			attr_dev(input, "type", "button");
    			attr_dev(input, "class", "add-remove-button w-button svelte-eq46ml");
    			input.value = "+";
    			add_location(input, file$7, 316, 14, 11726);
    			attr_dev(div, "class", "week-button-wrap");
    			add_location(div, file$7, 315, 12, 11681);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);

    			if (!mounted) {
    				dispose = listen_dev(input, "click", /*click_handler_1*/ ctx[24], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(315:10) {#if dateChosen && weeks == 0}",
    		ctx
    	});

    	return block;
    }

    // (394:12) {#if includeWeekends}
    function create_if_block_8(ctx) {
    	let div4;
    	let div1;
    	let div0;
    	let input0;
    	let input0_name_value;
    	let input0_data_name_value;
    	let t1;
    	let div3;
    	let div2;
    	let input1;
    	let input1_name_value;
    	let input1_data_name_value;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "SAT";
    			input0 = element("input");
    			t1 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div2.textContent = "SUN";
    			input1 = element("input");
    			attr_dev(div0, "class", "day-label");
    			add_location(div0, file$7, 396, 18, 15401);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "field-input time-unit w-input svelte-eq46ml");
    			attr_dev(input0, "maxlength", "256");
    			attr_dev(input0, "name", input0_name_value = "satWeek" + (/*index*/ ctx[36] + 2));
    			attr_dev(input0, "data-name", input0_data_name_value = "satWeek" + (/*index*/ ctx[36] + 2));
    			attr_dev(input0, "placeholder", "0");
    			input0.value = "0";
    			attr_dev(input0, "id", "sat");
    			toggle_class(input0, "error", /*timesheetData*/ ctx[5][`satWeek${/*index*/ ctx[36] + 2}`] > 16 && /*timeSheetUnitSelected*/ ctx[11] === "hours" || /*timesheetData*/ ctx[5][`satWeek${/*index*/ ctx[36] + 2}`] > 1 && /*timeSheetUnitSelected*/ ctx[11] === "days");
    			add_location(input0, file$7, 396, 50, 15433);
    			attr_dev(div1, "class", "day-wrap");
    			add_location(div1, file$7, 395, 16, 15360);
    			attr_dev(div2, "class", "day-label");
    			add_location(div2, file$7, 408, 18, 16038);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "field-input time-unit w-input svelte-eq46ml");
    			attr_dev(input1, "maxlength", "256");
    			attr_dev(input1, "name", input1_name_value = "sunWeek" + (/*index*/ ctx[36] + 2));
    			attr_dev(input1, "data-name", input1_data_name_value = "sunWeek" + (/*index*/ ctx[36] + 2));
    			attr_dev(input1, "placeholder", "0");
    			input1.value = "0";
    			attr_dev(input1, "id", "sun");
    			toggle_class(input1, "error", /*timesheetData*/ ctx[5][`sunWeek${/*index*/ ctx[36] + 2}`] > 16 && /*timeSheetUnitSelected*/ ctx[11] === "hours" || /*timesheetData*/ ctx[5][`sunWeek${/*index*/ ctx[36] + 2}`] > 1 && /*timeSheetUnitSelected*/ ctx[11] === "days");
    			add_location(input1, file$7, 408, 50, 16070);
    			attr_dev(div3, "class", "day-wrap");
    			add_location(div3, file$7, 407, 16, 15997);
    			attr_dev(div4, "class", "weekend-wrap");
    			add_location(div4, file$7, 394, 14, 15317);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			append_dev(div1, input0);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div3, input1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*timesheetData, timeSheetUnitSelected*/ 2080) {
    				toggle_class(input0, "error", /*timesheetData*/ ctx[5][`satWeek${/*index*/ ctx[36] + 2}`] > 16 && /*timeSheetUnitSelected*/ ctx[11] === "hours" || /*timesheetData*/ ctx[5][`satWeek${/*index*/ ctx[36] + 2}`] > 1 && /*timeSheetUnitSelected*/ ctx[11] === "days");
    			}

    			if (dirty[0] & /*timesheetData, timeSheetUnitSelected*/ 2080) {
    				toggle_class(input1, "error", /*timesheetData*/ ctx[5][`sunWeek${/*index*/ ctx[36] + 2}`] > 16 && /*timeSheetUnitSelected*/ ctx[11] === "hours" || /*timesheetData*/ ctx[5][`sunWeek${/*index*/ ctx[36] + 2}`] > 1 && /*timeSheetUnitSelected*/ ctx[11] === "days");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(394:12) {#if includeWeekends}",
    		ctx
    	});

    	return block;
    }

    // (422:12) {#if weeks == index + 1}
    function create_if_block_6(ctx) {
    	let div;
    	let input;
    	let t;
    	let mounted;
    	let dispose;
    	let if_block = /*weeks*/ ctx[6] < 5 && create_if_block_7(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(input, "type", "button");
    			attr_dev(input, "class", "add-remove-button remove w-button svelte-eq46ml");
    			input.value = "–";
    			add_location(input, file$7, 423, 16, 16755);
    			attr_dev(div, "class", "week-button-wrap");
    			add_location(div, file$7, 422, 14, 16708);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);

    			if (!mounted) {
    				dispose = listen_dev(input, "click", /*click_handler_2*/ ctx[25], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*weeks*/ ctx[6] < 5) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_7(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(422:12) {#if weeks == index + 1}",
    		ctx
    	});

    	return block;
    }

    // (429:16) {#if weeks < 5}
    function create_if_block_7(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "button");
    			attr_dev(input, "class", "add-remove-button w-button svelte-eq46ml");
    			input.value = "+";
    			add_location(input, file$7, 429, 18, 16978);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);

    			if (!mounted) {
    				dispose = listen_dev(input, "click", /*click_handler_3*/ ctx[26], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(429:16) {#if weeks < 5}",
    		ctx
    	});

    	return block;
    }

    // (326:8) {#each Array(weeks) as week, index}
    function create_each_block$4(ctx) {
    	let div13;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t2_value = /*weekDates*/ ctx[13][/*index*/ ctx[36] + 1].format("DD/MM/YYYY") + "";
    	let t2;
    	let t3;
    	let div4;
    	let div3;
    	let input0;
    	let input0_class_value;
    	let input0_name_value;
    	let input0_data_name_value;
    	let t5;
    	let div6;
    	let div5;
    	let input1;
    	let input1_name_value;
    	let input1_data_name_value;
    	let t7;
    	let div8;
    	let div7;
    	let input2;
    	let input2_name_value;
    	let input2_data_name_value;
    	let t9;
    	let div10;
    	let div9;
    	let input3;
    	let input3_name_value;
    	let input3_data_name_value;
    	let t11;
    	let div12;
    	let div11;
    	let input4;
    	let input4_name_value;
    	let input4_data_name_value;
    	let t13;
    	let t14;
    	let if_block0 = /*includeWeekends*/ ctx[10] && create_if_block_8(ctx);
    	let if_block1 = /*weeks*/ ctx[6] == /*index*/ ctx[36] + 1 && create_if_block_6(ctx);

    	const block = {
    		c: function create() {
    			div13 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Week Commencing";
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div3.textContent = "MON";
    			input0 = element("input");
    			t5 = space();
    			div6 = element("div");
    			div5 = element("div");
    			div5.textContent = "TUE";
    			input1 = element("input");
    			t7 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div7.textContent = "WED";
    			input2 = element("input");
    			t9 = space();
    			div10 = element("div");
    			div9 = element("div");
    			div9.textContent = "THU";
    			input3 = element("input");
    			t11 = space();
    			div12 = element("div");
    			div11 = element("div");
    			div11.textContent = "FRI";
    			input4 = element("input");
    			t13 = space();
    			if (if_block0) if_block0.c();
    			t14 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "week-info-text");
    			add_location(div0, file$7, 328, 14, 12127);
    			attr_dev(div1, "class", "week-info-text");
    			add_location(div1, file$7, 329, 14, 12191);
    			attr_dev(div2, "class", "week-info");
    			add_location(div2, file$7, 327, 12, 12089);
    			attr_dev(div3, "class", "day-label");
    			add_location(div3, file$7, 334, 14, 12369);
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "class", input0_class_value = "" + (null_to_empty("field-input time-unit w-input") + " svelte-eq46ml"));
    			attr_dev(input0, "maxlength", "256");
    			attr_dev(input0, "name", input0_name_value = "monWeek" + (/*index*/ ctx[36] + 2));
    			attr_dev(input0, "data-name", input0_data_name_value = "monWeek" + (/*index*/ ctx[36] + 2));
    			attr_dev(input0, "placeholder", "0");
    			input0.value = "0";
    			attr_dev(input0, "id", "mon");
    			toggle_class(input0, "error", /*timesheetData*/ ctx[5][`monWeek${/*index*/ ctx[36] + 2}`] > 16 && /*timeSheetUnitSelected*/ ctx[11] === "hours" || /*timesheetData*/ ctx[5][`monWeek${/*index*/ ctx[36] + 2}`] > 1 && /*timeSheetUnitSelected*/ ctx[11] === "days");
    			add_location(input0, file$7, 334, 46, 12401);
    			attr_dev(div4, "class", "day-wrap");
    			add_location(div4, file$7, 333, 12, 12332);
    			attr_dev(div5, "class", "day-label");
    			add_location(div5, file$7, 346, 14, 12962);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "field-input time-unit w-input svelte-eq46ml");
    			attr_dev(input1, "maxlength", "256");
    			attr_dev(input1, "name", input1_name_value = "tueWeek" + (/*index*/ ctx[36] + 2));
    			attr_dev(input1, "data-name", input1_data_name_value = "tueWeek" + (/*index*/ ctx[36] + 2));
    			attr_dev(input1, "placeholder", "0");
    			input1.value = "0";
    			attr_dev(input1, "id", "tue");
    			toggle_class(input1, "error", /*timesheetData*/ ctx[5][`tueWeek${/*index*/ ctx[36] + 2}`] > 16 && /*timeSheetUnitSelected*/ ctx[11] === "hours" || /*timesheetData*/ ctx[5][`tueWeek${/*index*/ ctx[36] + 2}`] > 1 && /*timeSheetUnitSelected*/ ctx[11] === "days");
    			add_location(input1, file$7, 346, 46, 12994);
    			attr_dev(div6, "class", "day-wrap");
    			add_location(div6, file$7, 345, 12, 12925);
    			attr_dev(div7, "class", "day-label");
    			add_location(div7, file$7, 358, 14, 13551);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "class", "field-input time-unit w-input svelte-eq46ml");
    			attr_dev(input2, "maxlength", "256");
    			attr_dev(input2, "name", input2_name_value = "wedWeek" + (/*index*/ ctx[36] + 2));
    			attr_dev(input2, "data-name", input2_data_name_value = "wedWeek" + (/*index*/ ctx[36] + 2));
    			attr_dev(input2, "placeholder", "0");
    			input2.value = "0";
    			attr_dev(input2, "id", "wed");
    			toggle_class(input2, "error", /*timesheetData*/ ctx[5][`wedWeek${/*index*/ ctx[36] + 2}`] > 16 && /*timeSheetUnitSelected*/ ctx[11] === "hours" || /*timesheetData*/ ctx[5][`wedWeek${/*index*/ ctx[36] + 2}`] > 1 && /*timeSheetUnitSelected*/ ctx[11] === "days");
    			add_location(input2, file$7, 358, 46, 13583);
    			attr_dev(div8, "class", "day-wrap");
    			add_location(div8, file$7, 357, 12, 13514);
    			attr_dev(div9, "class", "day-label");
    			add_location(div9, file$7, 370, 14, 14140);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "class", "field-input time-unit w-input svelte-eq46ml");
    			attr_dev(input3, "maxlength", "256");
    			attr_dev(input3, "name", input3_name_value = "thuWeek" + (/*index*/ ctx[36] + 2));
    			attr_dev(input3, "data-name", input3_data_name_value = "thuWeek" + (/*index*/ ctx[36] + 2));
    			attr_dev(input3, "placeholder", "0");
    			input3.value = "0";
    			attr_dev(input3, "id", "thu");
    			toggle_class(input3, "error", /*timesheetData*/ ctx[5][`thuWeek${/*index*/ ctx[36] + 2}`] > 16 && /*timeSheetUnitSelected*/ ctx[11] === "hours" || /*timesheetData*/ ctx[5][`thuWeek${/*index*/ ctx[36] + 2}`] > 1 && /*timeSheetUnitSelected*/ ctx[11] === "days");
    			add_location(input3, file$7, 370, 46, 14172);
    			attr_dev(div10, "class", "day-wrap");
    			add_location(div10, file$7, 369, 12, 14103);
    			attr_dev(div11, "class", "day-label");
    			add_location(div11, file$7, 382, 14, 14729);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "class", "field-input time-unit w-input svelte-eq46ml");
    			attr_dev(input4, "maxlength", "256");
    			attr_dev(input4, "name", input4_name_value = "friWeek" + (/*index*/ ctx[36] + 2));
    			attr_dev(input4, "data-name", input4_data_name_value = "friWeek" + (/*index*/ ctx[36] + 2));
    			attr_dev(input4, "placeholder", "0");
    			input4.value = "0";
    			attr_dev(input4, "id", "fri");
    			toggle_class(input4, "error", /*timesheetData*/ ctx[5][`friWeek${/*index*/ ctx[36] + 2}`] > 16 && /*timeSheetUnitSelected*/ ctx[11] === "hours" || /*timesheetData*/ ctx[5][`friWeek${/*index*/ ctx[36] + 2}`] > 1 && /*timeSheetUnitSelected*/ ctx[11] === "days");
    			add_location(input4, file$7, 382, 46, 14761);
    			attr_dev(div12, "class", "day-wrap");
    			add_location(div12, file$7, 381, 12, 14692);
    			attr_dev(div13, "class", "form-content-wrap week-row");
    			add_location(div13, file$7, 326, 10, 12036);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div13, anchor);
    			append_dev(div13, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div13, t3);
    			append_dev(div13, div4);
    			append_dev(div4, div3);
    			append_dev(div4, input0);
    			append_dev(div13, t5);
    			append_dev(div13, div6);
    			append_dev(div6, div5);
    			append_dev(div6, input1);
    			append_dev(div13, t7);
    			append_dev(div13, div8);
    			append_dev(div8, div7);
    			append_dev(div8, input2);
    			append_dev(div13, t9);
    			append_dev(div13, div10);
    			append_dev(div10, div9);
    			append_dev(div10, input3);
    			append_dev(div13, t11);
    			append_dev(div13, div12);
    			append_dev(div12, div11);
    			append_dev(div12, input4);
    			append_dev(div13, t13);
    			if (if_block0) if_block0.m(div13, null);
    			append_dev(div13, t14);
    			if (if_block1) if_block1.m(div13, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*weekDates*/ 8192 && t2_value !== (t2_value = /*weekDates*/ ctx[13][/*index*/ ctx[36] + 1].format("DD/MM/YYYY") + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*timesheetData, timeSheetUnitSelected*/ 2080) {
    				toggle_class(input0, "error", /*timesheetData*/ ctx[5][`monWeek${/*index*/ ctx[36] + 2}`] > 16 && /*timeSheetUnitSelected*/ ctx[11] === "hours" || /*timesheetData*/ ctx[5][`monWeek${/*index*/ ctx[36] + 2}`] > 1 && /*timeSheetUnitSelected*/ ctx[11] === "days");
    			}

    			if (dirty[0] & /*timesheetData, timeSheetUnitSelected*/ 2080) {
    				toggle_class(input1, "error", /*timesheetData*/ ctx[5][`tueWeek${/*index*/ ctx[36] + 2}`] > 16 && /*timeSheetUnitSelected*/ ctx[11] === "hours" || /*timesheetData*/ ctx[5][`tueWeek${/*index*/ ctx[36] + 2}`] > 1 && /*timeSheetUnitSelected*/ ctx[11] === "days");
    			}

    			if (dirty[0] & /*timesheetData, timeSheetUnitSelected*/ 2080) {
    				toggle_class(input2, "error", /*timesheetData*/ ctx[5][`wedWeek${/*index*/ ctx[36] + 2}`] > 16 && /*timeSheetUnitSelected*/ ctx[11] === "hours" || /*timesheetData*/ ctx[5][`wedWeek${/*index*/ ctx[36] + 2}`] > 1 && /*timeSheetUnitSelected*/ ctx[11] === "days");
    			}

    			if (dirty[0] & /*timesheetData, timeSheetUnitSelected*/ 2080) {
    				toggle_class(input3, "error", /*timesheetData*/ ctx[5][`thuWeek${/*index*/ ctx[36] + 2}`] > 16 && /*timeSheetUnitSelected*/ ctx[11] === "hours" || /*timesheetData*/ ctx[5][`thuWeek${/*index*/ ctx[36] + 2}`] > 1 && /*timeSheetUnitSelected*/ ctx[11] === "days");
    			}

    			if (dirty[0] & /*timesheetData, timeSheetUnitSelected*/ 2080) {
    				toggle_class(input4, "error", /*timesheetData*/ ctx[5][`friWeek${/*index*/ ctx[36] + 2}`] > 16 && /*timeSheetUnitSelected*/ ctx[11] === "hours" || /*timesheetData*/ ctx[5][`friWeek${/*index*/ ctx[36] + 2}`] > 1 && /*timeSheetUnitSelected*/ ctx[11] === "days");
    			}

    			if (/*includeWeekends*/ ctx[10]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_8(ctx);
    					if_block0.c();
    					if_block0.m(div13, t14);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*weeks*/ ctx[6] == /*index*/ ctx[36] + 1) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_6(ctx);
    					if_block1.c();
    					if_block1.m(div13, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div13);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(326:8) {#each Array(weeks) as week, index}",
    		ctx
    	});

    	return block;
    }

    // (443:69) 
    function create_if_block_5(ctx) {
    	let error;
    	let current;

    	error = new ErrorMsg({
    			props: {
    				errMsgText: "You can only record up to 1 day per day!"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(error.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(error, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(error.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(error.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(error, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(443:69) ",
    		ctx
    	});

    	return block;
    }

    // (440:8) {#if !dayInputValid && timeSheetUnitSelected === 'hours'}
    function create_if_block_4(ctx) {
    	let error;
    	let current;

    	error = new ErrorMsg({
    			props: {
    				errMsgText: "You can only record between 0 and 16 hours per day!"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(error.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(error, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(error.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(error.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(error, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(440:8) {#if !dayInputValid && timeSheetUnitSelected === 'hours'}",
    		ctx
    	});

    	return block;
    }

    // (459:10) {#if !candEmailValid}
    function create_if_block_3(ctx) {
    	let error;
    	let current;

    	error = new ErrorMsg({
    			props: {
    				errMsgText: "Please enter a valid email address"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(error.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(error, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(error.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(error.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(error, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(459:10) {#if !candEmailValid}",
    		ctx
    	});

    	return block;
    }

    // (474:12) {#if !candEmailValid}
    function create_if_block_2(ctx) {
    	let error;
    	let current;

    	error = new ErrorMsg({
    			props: {
    				errMsgText: "Please enter a valid email address"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(error.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(error, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(error.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(error.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(error, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(474:12) {#if !candEmailValid}",
    		ctx
    	});

    	return block;
    }

    // (493:12) {#if !managerEmailValid}
    function create_if_block_1(ctx) {
    	let error;
    	let current;

    	error = new ErrorMsg({
    			props: {
    				errMsgText: "Please enter a valid email address"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(error.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(error, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(error.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(error.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(error, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(493:12) {#if !managerEmailValid}",
    		ctx
    	});

    	return block;
    }

    // (496:12) {#if candEmail && managerEmail === candEmail}
    function create_if_block$1(ctx) {
    	let error;
    	let current;

    	error = new ErrorMsg({
    			props: {
    				errMsgText: "Email addresses cannot be the same."
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(error.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(error, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(error.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(error.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(error, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(496:12) {#if candEmail && managerEmail === candEmail}",
    		ctx
    	});

    	return block;
    }

    // (144:4) <Form bind:values={timesheetData}>
    function create_default_slot$1(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let select;
    	let option0;
    	let option1;
    	let t5;
    	let label;
    	let input0;
    	let span;
    	let t7;
    	let p0;
    	let t10;
    	let div22;
    	let datepicker;
    	let updating_formattedSelected;
    	let updating_dateChosen;
    	let updating_selected;
    	let t11;
    	let div5;
    	let div4;
    	let t12;
    	let current_block_type_index;
    	let if_block1;
    	let t13;
    	let t14;
    	let t15;
    	let current_block_type_index_1;
    	let if_block3;
    	let t16;
    	let div21;
    	let div7;
    	let div6;
    	let t18;
    	let input1;
    	let input1_class_value;
    	let t19;
    	let t20;
    	let div10;
    	let div9;
    	let div8;
    	let t22;
    	let input2;
    	let input2_class_value;
    	let t23;
    	let t24;
    	let div13;
    	let div12;
    	let div11;
    	let t26;
    	let input3;
    	let input3_class_value;
    	let t27;
    	let t28;
    	let t29;
    	let div16;
    	let div15;
    	let div14;
    	let t31;
    	let input4;
    	let t32;
    	let div20;
    	let div18;
    	let div17;
    	let t34;
    	let p1;
    	let t35;
    	let br;
    	let t36;
    	let button;
    	let t38;
    	let div19;
    	let t39;
    	let a0;
    	let t41;
    	let a1;
    	let current;
    	let mounted;
    	let dispose;

    	function datepicker_formattedSelected_binding(value) {
    		/*datepicker_formattedSelected_binding*/ ctx[21].call(null, value);
    	}

    	function datepicker_dateChosen_binding(value) {
    		/*datepicker_dateChosen_binding*/ ctx[22].call(null, value);
    	}

    	function datepicker_selected_binding(value) {
    		/*datepicker_selected_binding*/ ctx[23].call(null, value);
    	}

    	let datepicker_props = {
    		format: /*dateFormat*/ ctx[14],
    		end: /*inThirtyDays*/ ctx[12],
    		selectableCallback: /*mondaysOnlyCallback*/ ctx[16],
    		buttonBackgroundColor: "#0064fe",
    		buttonTextColor: "white",
    		highlightColor: "#0064fe",
    		dayBackgroundColor: "#efefef",
    		dayTextColor: "#333",
    		dayHighlightedBackgroundColor: "#0064fe",
    		dayHighlightedTextColor: "#fff"
    	};

    	if (/*formattedSelected*/ ctx[7] !== void 0) {
    		datepicker_props.formattedSelected = /*formattedSelected*/ ctx[7];
    	}

    	if (/*dateChosen*/ ctx[8] !== void 0) {
    		datepicker_props.dateChosen = /*dateChosen*/ ctx[8];
    	}

    	if (/*selectedDate*/ ctx[9] !== void 0) {
    		datepicker_props.selected = /*selectedDate*/ ctx[9];
    	}

    	datepicker = new Datepicker({ props: datepicker_props, $$inline: true });
    	binding_callbacks.push(() => bind(datepicker, "formattedSelected", datepicker_formattedSelected_binding));
    	binding_callbacks.push(() => bind(datepicker, "dateChosen", datepicker_dateChosen_binding));
    	binding_callbacks.push(() => bind(datepicker, "selected", datepicker_selected_binding));
    	let if_block0 = /*dateChosen*/ ctx[8] && create_if_block_12(ctx);
    	const if_block_creators = [create_if_block_10, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*dateChosen*/ ctx[8]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block2 = /*dateChosen*/ ctx[8] && /*weeks*/ ctx[6] == 0 && create_if_block_9(ctx);
    	let each_value = Array(/*weeks*/ ctx[6]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const if_block_creators_1 = [create_if_block_4, create_if_block_5];
    	const if_blocks_1 = [];

    	function select_block_type_1(ctx, dirty) {
    		if (!/*dayInputValid*/ ctx[0] && /*timeSheetUnitSelected*/ ctx[11] === "hours") return 0;
    		if (!/*dayInputValid*/ ctx[0] && /*timeSheetUnitSelected*/ ctx[11] === "days") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index_1 = select_block_type_1(ctx))) {
    		if_block3 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    	}

    	let if_block4 = !/*candEmailValid*/ ctx[2] && create_if_block_3(ctx);
    	let if_block5 = !/*candEmailValid*/ ctx[2] && create_if_block_2(ctx);
    	let if_block6 = !/*managerEmailValid*/ ctx[4] && create_if_block_1(ctx);
    	let if_block7 = /*candEmail*/ ctx[1] && /*managerEmail*/ ctx[3] === /*candEmail*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Fill in your timesheet";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "Do you record time hourly or daily?\n          ";
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Hourly\n            ";
    			option1 = element("option");
    			option1.textContent = "Daily";
    			t5 = space();
    			label = element("label");
    			input0 = element("input");
    			span = element("span");
    			span.textContent = "Include weekends?";
    			t7 = space();
    			p0 = element("p");
    			p0.textContent = `Please tell us the Monday you want your timesheet to start on ${/*jwt*/ ctx[15]}`;
    			t10 = space();
    			div22 = element("div");
    			create_component(datepicker.$$.fragment);
    			t11 = space();
    			div5 = element("div");
    			div4 = element("div");
    			if (if_block0) if_block0.c();
    			t12 = space();
    			if_block1.c();
    			t13 = space();
    			if (if_block2) if_block2.c();
    			t14 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t15 = space();
    			if (if_block3) if_block3.c();
    			t16 = space();
    			div21 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			div6.textContent = "Please enter your name";
    			t18 = space();
    			input1 = element("input");
    			t19 = space();
    			if (if_block4) if_block4.c();
    			t20 = space();
    			div10 = element("div");
    			div9 = element("div");
    			div8 = element("div");
    			div8.textContent = "Please enter your email address";
    			t22 = space();
    			input2 = element("input");
    			t23 = space();
    			if (if_block5) if_block5.c();
    			t24 = space();
    			div13 = element("div");
    			div12 = element("div");
    			div11 = element("div");
    			div11.textContent = "Please enter the email address for the person who approves your\n                timesheet";
    			t26 = space();
    			input3 = element("input");
    			t27 = space();
    			if (if_block6) if_block6.c();
    			t28 = space();
    			if (if_block7) if_block7.c();
    			t29 = space();
    			div16 = element("div");
    			div15 = element("div");
    			div14 = element("div");
    			div14.textContent = "Please give a brief description of what you worked on";
    			t31 = space();
    			input4 = element("input");
    			t32 = space();
    			div20 = element("div");
    			div18 = element("div");
    			div17 = element("div");
    			div17.textContent = "Confirm Submission.";
    			t34 = space();
    			p1 = element("p");
    			t35 = text("We will not send you any marketing. You will be contacted\n                regarding this timesheet and your contact details will be\n                deleted in 3 months. If you are interested in a branded\n                timesheet portal for your agency please contact us.");
    			br = element("br");
    			t36 = space();
    			button = element("button");
    			button.textContent = "Complete Submission";
    			t38 = space();
    			div19 = element("div");
    			t39 = text("By submitting, you are agreeing to our\n              ");
    			a0 = element("a");
    			a0.textContent = "Terms";
    			t41 = text("\n              and\n              ");
    			a1 = element("a");
    			a1.textContent = "Privacy Policy";
    			attr_dev(div0, "class", "form-section-title");
    			add_location(div0, file$7, 146, 10, 4885);
    			attr_dev(div1, "class", "paragraph");
    			add_location(div1, file$7, 147, 10, 4956);
    			option0.__value = "hours";
    			option0.value = option0.__value;
    			add_location(option0, file$7, 156, 47, 5334);
    			option1.__value = "days";
    			option1.value = option1.__value;
    			add_location(option1, file$7, 159, 12, 5412);
    			attr_dev(select, "id", "time-unit-select");
    			attr_dev(select, "name", "time-unit-select");
    			attr_dev(select, "data-name", "time-unit-select");
    			select.required = "";
    			attr_dev(select, "class", "field-input select w-select");
    			if (/*timeSheetUnitSelected*/ ctx[11] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[19].call(select));
    			add_location(select, file$7, 149, 16, 5044);
    			attr_dev(input0, "type", "checkbox");
    			attr_dev(input0, "id", "weekend-checkbox");
    			attr_dev(input0, "name", "weekend-checkbox");
    			attr_dev(input0, "data-name", "weekend-checkbox");
    			attr_dev(input0, "class", "w-checkbox-input svelte-eq46ml");
    			add_location(input0, file$7, 160, 36, 5493);
    			attr_dev(span, "for", "weekend-checkbox");
    			attr_dev(span, "class", "paragraph w-form-label");
    			add_location(span, file$7, 166, 41, 5733);
    			attr_dev(label, "class", "w-checkbox");
    			add_location(label, file$7, 160, 10, 5467);
    			attr_dev(div2, "class", "form-title-wrap");
    			add_location(div2, file$7, 145, 8, 4845);
    			attr_dev(p0, "class", "paragraph");
    			add_location(p0, file$7, 171, 8, 5878);
    			attr_dev(div3, "class", "form-content");
    			add_location(div3, file$7, 144, 6, 4810);
    			attr_dev(div4, "class", "week-info");
    			add_location(div4, file$7, 193, 10, 6708);
    			attr_dev(div5, "class", "form-content-wrap week-row");
    			add_location(div5, file$7, 192, 8, 6657);
    			add_location(div6, file$7, 447, 12, 17671);
    			attr_dev(div7, "class", "label-with-tooltip");
    			add_location(div7, file$7, 446, 10, 17626);
    			attr_dev(input1, "type", "text");

    			attr_dev(input1, "class", input1_class_value = "" + (null_to_empty(/*candEmailValid*/ ctx[2]
    			? "field-input w-input"
    			: "field-input w-input error") + " svelte-eq46ml"));

    			attr_dev(input1, "maxlength", "256");
    			attr_dev(input1, "name", "candName");
    			attr_dev(input1, "data-name", "emailinput");
    			attr_dev(input1, "placeholder", "Name");
    			attr_dev(input1, "id", "emailinput");
    			add_location(input1, file$7, 448, 16, 17721);
    			add_location(div8, file$7, 463, 14, 18289);
    			attr_dev(div9, "class", "label-with-tooltip");
    			add_location(div9, file$7, 462, 12, 18242);
    			attr_dev(input2, "type", "email");

    			attr_dev(input2, "class", input2_class_value = "" + (null_to_empty(/*candEmailValid*/ ctx[2]
    			? "field-input w-input"
    			: "field-input w-input error") + " svelte-eq46ml"));

    			attr_dev(input2, "maxlength", "256");
    			attr_dev(input2, "name", "emailinput");
    			attr_dev(input2, "data-name", "emailinput");
    			attr_dev(input2, "placeholder", "Your work email address");
    			attr_dev(input2, "id", "emailinput");
    			add_location(input2, file$7, 464, 18, 18350);
    			attr_dev(div10, "class", "form-content-wrap vertical");
    			add_location(div10, file$7, 461, 10, 18189);
    			add_location(div11, file$7, 479, 14, 18947);
    			attr_dev(div12, "class", "label-with-tooltip");
    			add_location(div12, file$7, 478, 12, 18900);
    			attr_dev(input3, "type", "email");

    			attr_dev(input3, "class", input3_class_value = "" + (null_to_empty(/*managerEmailValid*/ ctx[4]
    			? "field-input w-input"
    			: "field-input w-input error") + " svelte-eq46ml"));

    			attr_dev(input3, "maxlength", "256");
    			attr_dev(input3, "name", "manageremailinput");
    			attr_dev(input3, "data-name", "manageremailinput");
    			attr_dev(input3, "placeholder", "Approver business email address");
    			attr_dev(input3, "id", "manageremailinput");
    			add_location(input3, file$7, 483, 18, 19098);
    			attr_dev(div13, "class", "form-content-wrap vertical");
    			add_location(div13, file$7, 477, 10, 18847);
    			add_location(div14, file$7, 501, 14, 19882);
    			attr_dev(div15, "class", "label-with-tooltip");
    			add_location(div15, file$7, 500, 12, 19835);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "class", "field-input longer w-input svelte-eq46ml");
    			attr_dev(input4, "maxlength", "256");
    			attr_dev(input4, "name", "projectDesc");
    			attr_dev(input4, "data-name", "project-placeholder-text");
    			attr_dev(input4, "placeholder", "eg. Wrote custom code for time approved input forms.");
    			attr_dev(input4, "id", "project-placeholder-text");
    			add_location(input4, file$7, 502, 18, 19965);
    			attr_dev(div16, "class", "form-content-wrap vertical");
    			add_location(div16, file$7, 499, 10, 19782);
    			attr_dev(div17, "class", "form-section-title");
    			add_location(div17, file$7, 513, 14, 20405);
    			add_location(br, file$7, 518, 67, 20786);
    			attr_dev(p1, "class", "paragraph");
    			add_location(p1, file$7, 514, 14, 20477);
    			attr_dev(div18, "class", "form-title-wrap");
    			add_location(div18, file$7, 512, 12, 20361);
    			attr_dev(button, "class", "submit-button w-button");
    			attr_dev(button, "type", "submit");
    			add_location(button, file$7, 520, 18, 20830);
    			attr_dev(a0, "href", "");
    			attr_dev(a0, "class", "form07_link");
    			add_location(a0, file$7, 526, 14, 21110);
    			attr_dev(a1, "href", "");
    			attr_dev(a1, "class", "form07_link");
    			add_location(a1, file$7, 528, 14, 21180);
    			attr_dev(div19, "class", "legal-disclaimer");
    			add_location(div19, file$7, 524, 12, 21012);
    			attr_dev(div20, "class", "form-content final");
    			add_location(div20, file$7, 511, 10, 20316);
    			attr_dev(div21, "class", "form-content-wrap vertical");
    			add_location(div21, file$7, 445, 8, 17575);
    			attr_dev(div22, "class", "form-content-wrap vertical");
    			add_location(div22, file$7, 175, 6, 6010);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div2, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			select_option(select, /*timeSheetUnitSelected*/ ctx[11]);
    			append_dev(div2, t5);
    			append_dev(div2, label);
    			append_dev(label, input0);
    			input0.checked = /*includeWeekends*/ ctx[10];
    			append_dev(label, span);
    			append_dev(div3, t7);
    			append_dev(div3, p0);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div22, anchor);
    			mount_component(datepicker, div22, null);
    			append_dev(div22, t11);
    			append_dev(div22, div5);
    			append_dev(div5, div4);
    			if (if_block0) if_block0.m(div4, null);
    			append_dev(div5, t12);
    			if_blocks[current_block_type_index].m(div5, null);
    			append_dev(div5, t13);
    			if (if_block2) if_block2.m(div5, null);
    			append_dev(div22, t14);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div22, null);
    			}

    			append_dev(div22, t15);

    			if (~current_block_type_index_1) {
    				if_blocks_1[current_block_type_index_1].m(div22, null);
    			}

    			append_dev(div22, t16);
    			append_dev(div22, div21);
    			append_dev(div21, div7);
    			append_dev(div7, div6);
    			append_dev(div7, t18);
    			append_dev(div21, input1);
    			append_dev(div21, t19);
    			if (if_block4) if_block4.m(div21, null);
    			append_dev(div21, t20);
    			append_dev(div21, div10);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div9, t22);
    			append_dev(div10, input2);
    			set_input_value(input2, /*candEmail*/ ctx[1]);
    			append_dev(div10, t23);
    			if (if_block5) if_block5.m(div10, null);
    			append_dev(div21, t24);
    			append_dev(div21, div13);
    			append_dev(div13, div12);
    			append_dev(div12, div11);
    			append_dev(div12, t26);
    			append_dev(div13, input3);
    			set_input_value(input3, /*managerEmail*/ ctx[3]);
    			append_dev(div13, t27);
    			if (if_block6) if_block6.m(div13, null);
    			append_dev(div13, t28);
    			if (if_block7) if_block7.m(div13, null);
    			append_dev(div21, t29);
    			append_dev(div21, div16);
    			append_dev(div16, div15);
    			append_dev(div15, div14);
    			append_dev(div15, t31);
    			append_dev(div16, input4);
    			append_dev(div21, t32);
    			append_dev(div21, div20);
    			append_dev(div20, div18);
    			append_dev(div18, div17);
    			append_dev(div18, t34);
    			append_dev(div18, p1);
    			append_dev(p1, t35);
    			append_dev(p1, br);
    			append_dev(div18, t36);
    			append_dev(div20, button);
    			append_dev(div20, t38);
    			append_dev(div20, div19);
    			append_dev(div19, t39);
    			append_dev(div19, a0);
    			append_dev(div19, t41);
    			append_dev(div19, a1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "click", /*click_handler*/ ctx[18], false, false, false),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[19]),
    					listen_dev(input0, "change", /*input0_change_handler*/ ctx[20]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[27]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[28]),
    					listen_dev(button, "click", prevent_default(/*click_handler_4*/ ctx[29]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*timeSheetUnitSelected*/ 2048) {
    				select_option(select, /*timeSheetUnitSelected*/ ctx[11]);
    			}

    			if (dirty[0] & /*includeWeekends*/ 1024) {
    				input0.checked = /*includeWeekends*/ ctx[10];
    			}

    			const datepicker_changes = {};
    			if (dirty[0] & /*inThirtyDays*/ 4096) datepicker_changes.end = /*inThirtyDays*/ ctx[12];

    			if (!updating_formattedSelected && dirty[0] & /*formattedSelected*/ 128) {
    				updating_formattedSelected = true;
    				datepicker_changes.formattedSelected = /*formattedSelected*/ ctx[7];
    				add_flush_callback(() => updating_formattedSelected = false);
    			}

    			if (!updating_dateChosen && dirty[0] & /*dateChosen*/ 256) {
    				updating_dateChosen = true;
    				datepicker_changes.dateChosen = /*dateChosen*/ ctx[8];
    				add_flush_callback(() => updating_dateChosen = false);
    			}

    			if (!updating_selected && dirty[0] & /*selectedDate*/ 512) {
    				updating_selected = true;
    				datepicker_changes.selected = /*selectedDate*/ ctx[9];
    				add_flush_callback(() => updating_selected = false);
    			}

    			datepicker.$set(datepicker_changes);

    			if (/*dateChosen*/ ctx[8]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_12(ctx);
    					if_block0.c();
    					if_block0.m(div4, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

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
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(div5, t13);
    			}

    			if (/*dateChosen*/ ctx[8] && /*weeks*/ ctx[6] == 0) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_9(ctx);
    					if_block2.c();
    					if_block2.m(div5, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty[0] & /*weeks, timesheetData, timeSheetUnitSelected, includeWeekends, weekDates*/ 11360) {
    				each_value = Array(/*weeks*/ ctx[6]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div22, t15);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			let previous_block_index_1 = current_block_type_index_1;
    			current_block_type_index_1 = select_block_type_1(ctx);

    			if (current_block_type_index_1 !== previous_block_index_1) {
    				if (if_block3) {
    					group_outros();

    					transition_out(if_blocks_1[previous_block_index_1], 1, 1, () => {
    						if_blocks_1[previous_block_index_1] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index_1) {
    					if_block3 = if_blocks_1[current_block_type_index_1];

    					if (!if_block3) {
    						if_block3 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    						if_block3.c();
    					}

    					transition_in(if_block3, 1);
    					if_block3.m(div22, t16);
    				} else {
    					if_block3 = null;
    				}
    			}

    			if (!current || dirty[0] & /*candEmailValid*/ 4 && input1_class_value !== (input1_class_value = "" + (null_to_empty(/*candEmailValid*/ ctx[2]
    			? "field-input w-input"
    			: "field-input w-input error") + " svelte-eq46ml"))) {
    				attr_dev(input1, "class", input1_class_value);
    			}

    			if (!/*candEmailValid*/ ctx[2]) {
    				if (if_block4) {
    					if (dirty[0] & /*candEmailValid*/ 4) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block_3(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(div21, t20);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*candEmailValid*/ 4 && input2_class_value !== (input2_class_value = "" + (null_to_empty(/*candEmailValid*/ ctx[2]
    			? "field-input w-input"
    			: "field-input w-input error") + " svelte-eq46ml"))) {
    				attr_dev(input2, "class", input2_class_value);
    			}

    			if (dirty[0] & /*candEmail*/ 2 && input2.value !== /*candEmail*/ ctx[1]) {
    				set_input_value(input2, /*candEmail*/ ctx[1]);
    			}

    			if (!/*candEmailValid*/ ctx[2]) {
    				if (if_block5) {
    					if (dirty[0] & /*candEmailValid*/ 4) {
    						transition_in(if_block5, 1);
    					}
    				} else {
    					if_block5 = create_if_block_2(ctx);
    					if_block5.c();
    					transition_in(if_block5, 1);
    					if_block5.m(div10, null);
    				}
    			} else if (if_block5) {
    				group_outros();

    				transition_out(if_block5, 1, 1, () => {
    					if_block5 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*managerEmailValid*/ 16 && input3_class_value !== (input3_class_value = "" + (null_to_empty(/*managerEmailValid*/ ctx[4]
    			? "field-input w-input"
    			: "field-input w-input error") + " svelte-eq46ml"))) {
    				attr_dev(input3, "class", input3_class_value);
    			}

    			if (dirty[0] & /*managerEmail*/ 8 && input3.value !== /*managerEmail*/ ctx[3]) {
    				set_input_value(input3, /*managerEmail*/ ctx[3]);
    			}

    			if (!/*managerEmailValid*/ ctx[4]) {
    				if (if_block6) {
    					if (dirty[0] & /*managerEmailValid*/ 16) {
    						transition_in(if_block6, 1);
    					}
    				} else {
    					if_block6 = create_if_block_1(ctx);
    					if_block6.c();
    					transition_in(if_block6, 1);
    					if_block6.m(div13, t28);
    				}
    			} else if (if_block6) {
    				group_outros();

    				transition_out(if_block6, 1, 1, () => {
    					if_block6 = null;
    				});

    				check_outros();
    			}

    			if (/*candEmail*/ ctx[1] && /*managerEmail*/ ctx[3] === /*candEmail*/ ctx[1]) {
    				if (if_block7) {
    					if (dirty[0] & /*candEmail, managerEmail*/ 10) {
    						transition_in(if_block7, 1);
    					}
    				} else {
    					if_block7 = create_if_block$1(ctx);
    					if_block7.c();
    					transition_in(if_block7, 1);
    					if_block7.m(div13, null);
    				}
    			} else if (if_block7) {
    				group_outros();

    				transition_out(if_block7, 1, 1, () => {
    					if_block7 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(datepicker.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			transition_in(if_block5);
    			transition_in(if_block6);
    			transition_in(if_block7);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(datepicker.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			transition_out(if_block5);
    			transition_out(if_block6);
    			transition_out(if_block7);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div22);
    			destroy_component(datepicker);
    			if (if_block0) if_block0.d();
    			if_blocks[current_block_type_index].d();
    			if (if_block2) if_block2.d();
    			destroy_each(each_blocks, detaching);

    			if (~current_block_type_index_1) {
    				if_blocks_1[current_block_type_index_1].d();
    			}

    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();
    			if (if_block7) if_block7.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(144:4) <Form bind:values={timesheetData}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div5;
    	let div4;
    	let form;
    	let updating_values;
    	let t0;
    	let div1;
    	let div0;
    	let t2;
    	let div3;
    	let div2;
    	let current;

    	function form_values_binding(value) {
    		/*form_values_binding*/ ctx[30].call(null, value);
    	}

    	let form_props = {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	if (/*timesheetData*/ ctx[5] !== void 0) {
    		form_props.values = /*timesheetData*/ ctx[5];
    	}

    	form = new Form({ props: form_props, $$inline: true });
    	binding_callbacks.push(() => bind(form, "values", form_values_binding));

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			create_component(form.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "We will send you a notification when the person who approves your\n        timesheets has responded to your submission. If you have not had a\n        response in 7 days please communicate directly with the approver.";
    			t2 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div2.textContent = "Oops! Something went wrong while submitting the form";
    			add_location(div0, file$7, 538, 6, 21472);
    			attr_dev(div1, "class", "success-message w-form-done");
    			add_location(div1, file$7, 537, 4, 21424);
    			add_location(div2, file$7, 548, 6, 21910);
    			attr_dev(div3, "class", "error-message w-form-fail");
    			add_location(div3, file$7, 547, 4, 21864);
    			attr_dev(div4, "class", "form-wrapper w-form");
    			add_location(div4, file$7, 142, 2, 4731);
    			attr_dev(div5, "class", "form-full");
    			add_location(div5, file$7, 141, 0, 4705);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			mount_component(form, div4, null);
    			append_dev(div4, t0);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const form_changes = {};

    			if (dirty[0] & /*candEmail, managerEmail, managerEmailValid, candEmailValid, dayInputValid, timeSheetUnitSelected, weeks, timesheetData, includeWeekends, weekDates, dateChosen, inThirtyDays, formattedSelected, selectedDate*/ 16383 | dirty[1] & /*$$scope*/ 64) {
    				form_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_values && dirty[0] & /*timesheetData*/ 32) {
    				updating_values = true;
    				form_changes.values = /*timesheetData*/ ctx[5];
    				add_flush_callback(() => updating_values = false);
    			}

    			form.$set(form_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(form.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(form.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_component(form);
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
    	validate_slots("App", slots, []);
    	let dayInputValid = true;
    	let candEmail;
    	let candEmailValid = true;
    	let managerEmail;
    	let managerEmailValid = true;
    	let timesheetData = {};
    	let timesheetDataBetter = {};
    	let weeks = 0;
    	let dateFormat = "#{d}/#{m}/#{Y}";
    	let formattedSelected;
    	let dateChosen = false;
    	let selectedDate;
    	let includeWeekends = false;
    	let timeSheetUnitSelected = "hours";
    	const today = new Date();
    	const jwt = window.location.search.slice(1).split("&")[0].split("=")[1];

    	const validateEmail = email => {
    		const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    		return re.test(String(email).toLowerCase());
    	};

    	// set the datepicker to only accept mondays
    	let mondaysOnlyCallback = date => date.getDay() !== 0 && date.getDay() !== 2 && date.getDay() !== 3 && date.getDay() !== 4 && date.getDay() !== 5 && date.getDay() !== 6;

    	// max future date is today + 30 days
    	let inThirtyDays;

    	// array of weekcommencing days. updates as the date is picked or changed
    	let weekDates = [];

    	const getFormData = () => {
    		// set validations to true before running the checks
    		$$invalidate(0, dayInputValid = true);

    		// check emails are valid
    		$$invalidate(2, candEmailValid = validateEmail(candEmail));

    		$$invalidate(4, managerEmailValid = validateEmail(managerEmail));

    		// exit the function if either check comes back as false
    		if (!candEmailValid || !managerEmailValid) return;

    		// build the empty object and add single values
    		timesheetDataBetter = {};

    		timesheetDataBetter.weeks = [];
    		timesheetDataBetter.timeUnitSelected = timeSheetUnitSelected;
    		timesheetDataBetter.managerEmail = timesheetData.manageremailinput;
    		timesheetDataBetter.candidateEmail = timesheetData.emailinput;
    		timesheetDataBetter.projectDesc = timesheetData.projectDesc;
    		timesheetDataBetter.candName = timesheetData.candName;

    		// run through each week and add the day values (0 if NaN) and weekcommecing date
    		for (let i = 0; i < weeks + 1; i++) {
    			timesheetDataBetter.weeks.push({
    				weekCommencing: weekDates[i],
    				mon: +timesheetData[`monWeek${i + 1}`] || 0,
    				tue: +timesheetData[`tueWeek${i + 1}`] || 0,
    				wed: +timesheetData[`wedWeek${i + 1}`] || 0,
    				thu: +timesheetData[`thuWeek${i + 1}`] || 0,
    				fri: +timesheetData[`friWeek${i + 1}`] || 0,
    				sat: +timesheetData[`satWeek${i + 1}`] || 0,
    				sun: +timesheetData[`sunWeek${i + 1}`] || 0
    			});

    			// check to see if any days have too many hours / days listed
    			Object.keys(timesheetDataBetter.weeks[i]).filter(key => key != "weekCommencing").map(key => {
    				if (timeSheetUnitSelected === "hours" && timesheetDataBetter.weeks[i][key] > 16 || timeSheetUnitSelected === "days" && timesheetDataBetter.weeks[i][key] > 1) {
    					$$invalidate(0, dayInputValid = false);
    					console.log("day input valid should now be false");
    				}
    			});
    		}

    		//exit the function if the days are invalid
    		if (!dayInputValid) return;

    		console.log(timesheetDataBetter);
    		console.log(timesheetData);

    		// send the new object to integromat endpoint (will add a proper endpoint soon)
    		(async () => {
    			const rawResponse = await fetch("https://hook.integromat.com/qm43sxmnkfnkhiqdhaosipmeojppgtm7", {
    				method: "POST",
    				headers: {
    					Accept: "application/json",
    					"Content-Type": "application/json"
    				},
    				body: JSON.stringify({ timesheetDataBetter })
    			}).then(res => console.log(res.status)).catch(err => console.log(err));
    		})(); // const content = await rawResponse.json();
    		// console.log(content);
    	};

    	const writable_props = [];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, dayInputValid = true);

    	function select_change_handler() {
    		timeSheetUnitSelected = select_value(this);
    		$$invalidate(11, timeSheetUnitSelected);
    	}

    	function input0_change_handler() {
    		includeWeekends = this.checked;
    		$$invalidate(10, includeWeekends);
    	}

    	function datepicker_formattedSelected_binding(value) {
    		formattedSelected = value;
    		$$invalidate(7, formattedSelected);
    	}

    	function datepicker_dateChosen_binding(value) {
    		dateChosen = value;
    		$$invalidate(8, dateChosen);
    	}

    	function datepicker_selected_binding(value) {
    		selectedDate = value;
    		$$invalidate(9, selectedDate);
    	}

    	const click_handler_1 = () => $$invalidate(6, weeks++, weeks);
    	const click_handler_2 = () => $$invalidate(6, weeks--, weeks);
    	const click_handler_3 = () => $$invalidate(6, weeks++, weeks);

    	function input2_input_handler() {
    		candEmail = this.value;
    		$$invalidate(1, candEmail);
    	}

    	function input3_input_handler() {
    		managerEmail = this.value;
    		$$invalidate(3, managerEmail);
    	}

    	const click_handler_4 = () => getFormData();

    	function form_values_binding(value) {
    		timesheetData = value;
    		$$invalidate(5, timesheetData);
    	}

    	$$self.$capture_state = () => ({
    		Datepicker,
    		dayjs: dayjs_min,
    		Form,
    		Error: ErrorMsg,
    		dayInputValid,
    		candEmail,
    		candEmailValid,
    		managerEmail,
    		managerEmailValid,
    		timesheetData,
    		timesheetDataBetter,
    		weeks,
    		dateFormat,
    		formattedSelected,
    		dateChosen,
    		selectedDate,
    		includeWeekends,
    		timeSheetUnitSelected,
    		today,
    		jwt,
    		validateEmail,
    		mondaysOnlyCallback,
    		inThirtyDays,
    		weekDates,
    		getFormData
    	});

    	$$self.$inject_state = $$props => {
    		if ("dayInputValid" in $$props) $$invalidate(0, dayInputValid = $$props.dayInputValid);
    		if ("candEmail" in $$props) $$invalidate(1, candEmail = $$props.candEmail);
    		if ("candEmailValid" in $$props) $$invalidate(2, candEmailValid = $$props.candEmailValid);
    		if ("managerEmail" in $$props) $$invalidate(3, managerEmail = $$props.managerEmail);
    		if ("managerEmailValid" in $$props) $$invalidate(4, managerEmailValid = $$props.managerEmailValid);
    		if ("timesheetData" in $$props) $$invalidate(5, timesheetData = $$props.timesheetData);
    		if ("timesheetDataBetter" in $$props) timesheetDataBetter = $$props.timesheetDataBetter;
    		if ("weeks" in $$props) $$invalidate(6, weeks = $$props.weeks);
    		if ("dateFormat" in $$props) $$invalidate(14, dateFormat = $$props.dateFormat);
    		if ("formattedSelected" in $$props) $$invalidate(7, formattedSelected = $$props.formattedSelected);
    		if ("dateChosen" in $$props) $$invalidate(8, dateChosen = $$props.dateChosen);
    		if ("selectedDate" in $$props) $$invalidate(9, selectedDate = $$props.selectedDate);
    		if ("includeWeekends" in $$props) $$invalidate(10, includeWeekends = $$props.includeWeekends);
    		if ("timeSheetUnitSelected" in $$props) $$invalidate(11, timeSheetUnitSelected = $$props.timeSheetUnitSelected);
    		if ("mondaysOnlyCallback" in $$props) $$invalidate(16, mondaysOnlyCallback = $$props.mondaysOnlyCallback);
    		if ("inThirtyDays" in $$props) $$invalidate(12, inThirtyDays = $$props.inThirtyDays);
    		if ("weekDates" in $$props) $$invalidate(13, weekDates = $$props.weekDates);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*selectedDate*/ 512) {
    			 {
    				$$invalidate(13, weekDates = [
    					dayjs_min(selectedDate),
    					dayjs_min(selectedDate).add(7, "day"),
    					dayjs_min(selectedDate).add(14, "day"),
    					dayjs_min(selectedDate).add(21, "day"),
    					dayjs_min(selectedDate).add(28, "day"),
    					dayjs_min(selectedDate).add(35, "day")
    				]);
    			}
    		}
    	};

    	 {
    		const date = new Date(today);
    		date.setDate(date.getDate() + 30);
    		$$invalidate(12, inThirtyDays = date);
    	}

    	return [
    		dayInputValid,
    		candEmail,
    		candEmailValid,
    		managerEmail,
    		managerEmailValid,
    		timesheetData,
    		weeks,
    		formattedSelected,
    		dateChosen,
    		selectedDate,
    		includeWeekends,
    		timeSheetUnitSelected,
    		inThirtyDays,
    		weekDates,
    		dateFormat,
    		jwt,
    		mondaysOnlyCallback,
    		getFormData,
    		click_handler,
    		select_change_handler,
    		input0_change_handler,
    		datepicker_formattedSelected_binding,
    		datepicker_dateChosen_binding,
    		datepicker_selected_binding,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		input2_input_handler,
    		input3_input_handler,
    		click_handler_4,
    		form_values_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
