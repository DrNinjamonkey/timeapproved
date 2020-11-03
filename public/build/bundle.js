
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
    const outroing = new Set();
    let outros;
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
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
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

    /* src/Components/LoadingScreen.svelte generated by Svelte v3.29.0 */

    const file = "src/Components/LoadingScreen.svelte";

    function create_fragment(ctx) {
    	let div14;
    	let div13;
    	let style;
    	let t1;
    	let div12;
    	let div0;
    	let t2;
    	let div1;
    	let t3;
    	let div2;
    	let t4;
    	let div3;
    	let t5;
    	let div4;
    	let t6;
    	let div5;
    	let t7;
    	let div6;
    	let t8;
    	let div7;
    	let t9;
    	let div8;
    	let t10;
    	let div9;
    	let t11;
    	let div10;
    	let t12;
    	let div11;

    	const block = {
    		c: function create() {
    			div14 = element("div");
    			div13 = element("div");
    			style = element("style");
    			style.textContent = ".lds-spinner {\n          color: official;\n          display: inline-block;\n          position: relative;\n          width: 80px;\n          height: 80px;\n        }\n        .lds-spinner div {\n          transform-origin: 40px 40px;\n          animation: lds-spinner 1.2s linear infinite;\n        }\n        .lds-spinner div:after {\n          content: \" \";\n          display: block;\n          position: absolute;\n          top: 3px;\n          left: 37px;\n          width: 6px;\n          height: 18px;\n          border-radius: 20%;\n          background: #000000;\n        }\n        .lds-spinner div:nth-child(1) {\n          transform: rotate(0deg);\n          animation-delay: -1.1s;\n        }\n        .lds-spinner div:nth-child(2) {\n          transform: rotate(30deg);\n          animation-delay: -1s;\n        }\n        .lds-spinner div:nth-child(3) {\n          transform: rotate(60deg);\n          animation-delay: -0.9s;\n        }\n        .lds-spinner div:nth-child(4) {\n          transform: rotate(90deg);\n          animation-delay: -0.8s;\n        }\n        .lds-spinner div:nth-child(5) {\n          transform: rotate(120deg);\n          animation-delay: -0.7s;\n        }\n        .lds-spinner div:nth-child(6) {\n          transform: rotate(150deg);\n          animation-delay: -0.6s;\n        }\n        .lds-spinner div:nth-child(7) {\n          transform: rotate(180deg);\n          animation-delay: -0.5s;\n        }\n        .lds-spinner div:nth-child(8) {\n          transform: rotate(210deg);\n          animation-delay: -0.4s;\n        }\n        .lds-spinner div:nth-child(9) {\n          transform: rotate(240deg);\n          animation-delay: -0.3s;\n        }\n        .lds-spinner div:nth-child(10) {\n          transform: rotate(270deg);\n          animation-delay: -0.2s;\n        }\n        .lds-spinner div:nth-child(11) {\n          transform: rotate(300deg);\n          animation-delay: -0.1s;\n        }\n        .lds-spinner div:nth-child(12) {\n          transform: rotate(330deg);\n          animation-delay: 0s;\n        }\n        @keyframes lds-spinner {\n          0% {\n            opacity: 1;\n          }\n          100% {\n            opacity: 0;\n          }\n        }";
    			t1 = space();
    			div12 = element("div");
    			div0 = element("div");
    			t2 = space();
    			div1 = element("div");
    			t3 = space();
    			div2 = element("div");
    			t4 = space();
    			div3 = element("div");
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div5 = element("div");
    			t7 = space();
    			div6 = element("div");
    			t8 = space();
    			div7 = element("div");
    			t9 = space();
    			div8 = element("div");
    			t10 = space();
    			div9 = element("div");
    			t11 = space();
    			div10 = element("div");
    			t12 = space();
    			div11 = element("div");
    			add_location(style, file, 2, 6, 77);
    			add_location(div0, file, 83, 8, 2305);
    			add_location(div1, file, 84, 8, 2321);
    			add_location(div2, file, 85, 8, 2337);
    			add_location(div3, file, 86, 8, 2353);
    			add_location(div4, file, 87, 8, 2369);
    			add_location(div5, file, 88, 8, 2385);
    			add_location(div6, file, 89, 8, 2401);
    			add_location(div7, file, 90, 8, 2417);
    			add_location(div8, file, 91, 8, 2433);
    			add_location(div9, file, 92, 8, 2449);
    			add_location(div10, file, 93, 8, 2465);
    			add_location(div11, file, 94, 8, 2481);
    			attr_dev(div12, "class", "lds-spinner");
    			add_location(div12, file, 82, 6, 2271);
    			attr_dev(div13, "class", "loading-spinner w-embed");
    			add_location(div13, file, 1, 4, 33);
    			attr_dev(div14, "class", "loading-screen");
    			add_location(div14, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div14, anchor);
    			append_dev(div14, div13);
    			append_dev(div13, style);
    			append_dev(div13, t1);
    			append_dev(div13, div12);
    			append_dev(div12, div0);
    			append_dev(div12, t2);
    			append_dev(div12, div1);
    			append_dev(div12, t3);
    			append_dev(div12, div2);
    			append_dev(div12, t4);
    			append_dev(div12, div3);
    			append_dev(div12, t5);
    			append_dev(div12, div4);
    			append_dev(div12, t6);
    			append_dev(div12, div5);
    			append_dev(div12, t7);
    			append_dev(div12, div6);
    			append_dev(div12, t8);
    			append_dev(div12, div7);
    			append_dev(div12, t9);
    			append_dev(div12, div8);
    			append_dev(div12, t10);
    			append_dev(div12, div9);
    			append_dev(div12, t11);
    			append_dev(div12, div10);
    			append_dev(div12, t12);
    			append_dev(div12, div11);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div14);
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
    	validate_slots("LoadingScreen", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LoadingScreen> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class LoadingScreen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LoadingScreen",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/ContractorDash.svelte generated by Svelte v3.29.0 */
    const file$1 = "src/ContractorDash.svelte";

    function create_fragment$1(ctx) {
    	let div65;
    	let h3;
    	let t1;
    	let div18;
    	let div17;
    	let div16;
    	let div15;
    	let div2;
    	let div1;
    	let div0;
    	let t3;
    	let div5;
    	let div4;
    	let div3;
    	let t5;
    	let div8;
    	let div7;
    	let div6;
    	let t7;
    	let div11;
    	let div10;
    	let div9;
    	let t9;
    	let div14;
    	let div13;
    	let div12;
    	let t11;
    	let div34;
    	let div33;
    	let div32;
    	let div31;
    	let div20;
    	let div19;
    	let t13;
    	let div23;
    	let div21;
    	let t15;
    	let div22;
    	let t17;
    	let div25;
    	let div24;
    	let t19;
    	let div27;
    	let div26;
    	let t21;
    	let div30;
    	let div29;
    	let div28;
    	let img;
    	let img_src_value;
    	let t23;
    	let div49;
    	let div48;
    	let div47;
    	let div46;
    	let div36;
    	let div35;
    	let t25;
    	let div38;
    	let div37;
    	let t27;
    	let div40;
    	let div39;
    	let t29;
    	let div42;
    	let div41;
    	let t31;
    	let div45;
    	let div44;
    	let div43;
    	let t33;
    	let div64;
    	let div63;
    	let div62;
    	let div61;
    	let div51;
    	let div50;
    	let t35;
    	let div53;
    	let div52;
    	let t37;
    	let div55;
    	let div54;
    	let t39;
    	let div57;
    	let div56;
    	let t41;
    	let div60;
    	let div59;
    	let div58;
    	let t43;
    	let a;
    	let t45;
    	let loadingscreen;
    	let current;
    	loadingscreen = new LoadingScreen({ $$inline: true });

    	const block = {
    		c: function create() {
    			div65 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Your Timesheets";
    			t1 = space();
    			div18 = element("div");
    			div17 = element("div");
    			div16 = element("div");
    			div15 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Date Created";
    			t3 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div3.textContent = "Contract";
    			t5 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			div6.textContent = "W/C";
    			t7 = space();
    			div11 = element("div");
    			div10 = element("div");
    			div9 = element("div");
    			div9.textContent = "Total";
    			t9 = space();
    			div14 = element("div");
    			div13 = element("div");
    			div12 = element("div");
    			div12.textContent = "Status";
    			t11 = space();
    			div34 = element("div");
    			div33 = element("div");
    			div32 = element("div");
    			div31 = element("div");
    			div20 = element("div");
    			div19 = element("div");
    			div19.textContent = "05-10-20";
    			t13 = space();
    			div23 = element("div");
    			div21 = element("div");
    			div21.textContent = "Emb Linux";
    			t15 = space();
    			div22 = element("div");
    			div22.textContent = "Platform";
    			t17 = space();
    			div25 = element("div");
    			div24 = element("div");
    			div24.textContent = "Platform";
    			t19 = space();
    			div27 = element("div");
    			div26 = element("div");
    			div26.textContent = "57 Hours";
    			t21 = space();
    			div30 = element("div");
    			div29 = element("div");
    			div28 = element("div");
    			div28.textContent = "Approved";
    			img = element("img");
    			t23 = space();
    			div49 = element("div");
    			div48 = element("div");
    			div47 = element("div");
    			div46 = element("div");
    			div36 = element("div");
    			div35 = element("div");
    			div35.textContent = "05-10-20";
    			t25 = space();
    			div38 = element("div");
    			div37 = element("div");
    			div37.textContent = "Emb Linux";
    			t27 = space();
    			div40 = element("div");
    			div39 = element("div");
    			div39.textContent = "Platform";
    			t29 = space();
    			div42 = element("div");
    			div41 = element("div");
    			div41.textContent = "57 Hours";
    			t31 = space();
    			div45 = element("div");
    			div44 = element("div");
    			div43 = element("div");
    			div43.textContent = "Pending";
    			t33 = space();
    			div64 = element("div");
    			div63 = element("div");
    			div62 = element("div");
    			div61 = element("div");
    			div51 = element("div");
    			div50 = element("div");
    			div50.textContent = "05-10-20";
    			t35 = space();
    			div53 = element("div");
    			div52 = element("div");
    			div52.textContent = "Emb Linux";
    			t37 = space();
    			div55 = element("div");
    			div54 = element("div");
    			div54.textContent = "Platform";
    			t39 = space();
    			div57 = element("div");
    			div56 = element("div");
    			div56.textContent = "57 Hours";
    			t41 = space();
    			div60 = element("div");
    			div59 = element("div");
    			div58 = element("div");
    			div58.textContent = "Rejected";
    			t43 = space();
    			a = element("a");
    			a.textContent = "+";
    			t45 = space();
    			create_component(loadingscreen.$$.fragment);
    			attr_dev(h3, "class", "heading");
    			add_location(h3, file$1, 5, 2, 130);
    			attr_dev(div0, "class", "ts-text title");
    			add_location(div0, file$1, 12, 14, 381);
    			attr_dev(div1, "class", "ts-data");
    			add_location(div1, file$1, 11, 12, 345);
    			attr_dev(div2, "class", "text-col");
    			add_location(div2, file$1, 10, 10, 310);
    			attr_dev(div3, "class", "ts-text title");
    			add_location(div3, file$1, 17, 14, 544);
    			attr_dev(div4, "class", "ts-data");
    			add_location(div4, file$1, 16, 12, 508);
    			attr_dev(div5, "class", "text-col");
    			add_location(div5, file$1, 15, 10, 473);
    			attr_dev(div6, "class", "ts-text title");
    			add_location(div6, file$1, 22, 14, 703);
    			attr_dev(div7, "class", "ts-data");
    			add_location(div7, file$1, 21, 12, 667);
    			attr_dev(div8, "class", "text-col");
    			add_location(div8, file$1, 20, 10, 632);
    			attr_dev(div9, "class", "ts-text title");
    			add_location(div9, file$1, 27, 14, 857);
    			attr_dev(div10, "class", "ts-data");
    			add_location(div10, file$1, 26, 12, 821);
    			attr_dev(div11, "class", "text-col");
    			add_location(div11, file$1, 25, 10, 786);
    			attr_dev(div12, "class", "ts-text title");
    			add_location(div12, file$1, 32, 14, 1013);
    			attr_dev(div13, "class", "ts-data");
    			add_location(div13, file$1, 31, 12, 977);
    			attr_dev(div14, "class", "text-col");
    			add_location(div14, file$1, 30, 10, 942);
    			attr_dev(div15, "class", "data-row");
    			add_location(div15, file$1, 9, 8, 277);
    			attr_dev(div16, "class", "box-padding");
    			add_location(div16, file$1, 8, 6, 243);
    			attr_dev(div17, "class", "white-box progress-box");
    			add_location(div17, file$1, 7, 4, 200);
    			attr_dev(div18, "class", "dash-row");
    			add_location(div18, file$1, 6, 2, 173);
    			attr_dev(div19, "class", "ts-text");
    			add_location(div19, file$1, 44, 12, 1311);
    			attr_dev(div20, "class", "text-col");
    			add_location(div20, file$1, 43, 10, 1276);
    			attr_dev(div21, "class", "ts-text small");
    			add_location(div21, file$1, 47, 12, 1409);
    			attr_dev(div22, "class", "ts-text small");
    			add_location(div22, file$1, 48, 12, 1464);
    			attr_dev(div23, "class", "text-col");
    			add_location(div23, file$1, 46, 10, 1374);
    			attr_dev(div24, "class", "ts-text");
    			add_location(div24, file$1, 51, 12, 1568);
    			attr_dev(div25, "class", "text-col");
    			add_location(div25, file$1, 50, 10, 1533);
    			attr_dev(div26, "class", "ts-text");
    			add_location(div26, file$1, 54, 12, 1666);
    			attr_dev(div27, "class", "text-col");
    			add_location(div27, file$1, 53, 10, 1631);
    			attr_dev(div28, "class", "ts-text");
    			add_location(div28, file$1, 58, 14, 1808);
    			if (img.src !== (img_src_value = "images/download-4---filled24x242x.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "loading", "lazy");
    			attr_dev(img, "height", "20");
    			attr_dev(img, "alt", "download icon");
    			attr_dev(img, "width", "20");
    			attr_dev(img, "class", "download-icon");
    			add_location(img, file$1, 58, 49, 1843);
    			attr_dev(div29, "class", "status approved");
    			add_location(div29, file$1, 57, 12, 1764);
    			attr_dev(div30, "class", "text-col");
    			add_location(div30, file$1, 56, 10, 1729);
    			attr_dev(div31, "class", "data-row");
    			add_location(div31, file$1, 42, 8, 1243);
    			attr_dev(div32, "class", "box-padding");
    			add_location(div32, file$1, 41, 6, 1209);
    			attr_dev(div33, "class", "white-box progress-box");
    			add_location(div33, file$1, 40, 4, 1166);
    			attr_dev(div34, "class", "dash-row");
    			add_location(div34, file$1, 39, 2, 1139);
    			attr_dev(div35, "class", "ts-text");
    			add_location(div35, file$1, 76, 12, 2329);
    			attr_dev(div36, "class", "text-col");
    			add_location(div36, file$1, 75, 10, 2294);
    			attr_dev(div37, "class", "ts-text");
    			add_location(div37, file$1, 79, 12, 2427);
    			attr_dev(div38, "class", "text-col");
    			add_location(div38, file$1, 78, 10, 2392);
    			attr_dev(div39, "class", "ts-text");
    			add_location(div39, file$1, 82, 12, 2526);
    			attr_dev(div40, "class", "text-col");
    			add_location(div40, file$1, 81, 10, 2491);
    			attr_dev(div41, "class", "ts-text");
    			add_location(div41, file$1, 85, 12, 2624);
    			attr_dev(div42, "class", "text-col");
    			add_location(div42, file$1, 84, 10, 2589);
    			attr_dev(div43, "class", "ts-text");
    			add_location(div43, file$1, 89, 14, 2765);
    			attr_dev(div44, "class", "status pending");
    			add_location(div44, file$1, 88, 12, 2722);
    			attr_dev(div45, "class", "text-col");
    			add_location(div45, file$1, 87, 10, 2687);
    			attr_dev(div46, "class", "data-row");
    			add_location(div46, file$1, 74, 8, 2261);
    			attr_dev(div47, "class", "box-padding");
    			add_location(div47, file$1, 73, 6, 2227);
    			attr_dev(div48, "class", "white-box progress-box");
    			add_location(div48, file$1, 72, 4, 2184);
    			attr_dev(div49, "class", "dash-row");
    			add_location(div49, file$1, 71, 2, 2157);
    			attr_dev(div50, "class", "ts-text");
    			add_location(div50, file$1, 101, 12, 3058);
    			attr_dev(div51, "class", "text-col");
    			add_location(div51, file$1, 100, 10, 3023);
    			attr_dev(div52, "class", "ts-text");
    			add_location(div52, file$1, 104, 12, 3156);
    			attr_dev(div53, "class", "text-col");
    			add_location(div53, file$1, 103, 10, 3121);
    			attr_dev(div54, "class", "ts-text");
    			add_location(div54, file$1, 107, 12, 3255);
    			attr_dev(div55, "class", "text-col");
    			add_location(div55, file$1, 106, 10, 3220);
    			attr_dev(div56, "class", "ts-text");
    			add_location(div56, file$1, 110, 12, 3353);
    			attr_dev(div57, "class", "text-col");
    			add_location(div57, file$1, 109, 10, 3318);
    			attr_dev(div58, "class", "ts-text");
    			add_location(div58, file$1, 114, 14, 3495);
    			attr_dev(div59, "class", "status rejected");
    			add_location(div59, file$1, 113, 12, 3451);
    			attr_dev(div60, "class", "text-col");
    			add_location(div60, file$1, 112, 10, 3416);
    			attr_dev(div61, "class", "data-row");
    			add_location(div61, file$1, 99, 8, 2990);
    			attr_dev(div62, "class", "box-padding");
    			add_location(div62, file$1, 98, 6, 2956);
    			attr_dev(div63, "class", "white-box progress-box");
    			add_location(div63, file$1, 97, 4, 2913);
    			attr_dev(div64, "class", "dash-row");
    			add_location(div64, file$1, 96, 2, 2886);
    			attr_dev(a, "href", "_");
    			attr_dev(a, "class", "menu-add w-button");
    			add_location(a, file$1, 121, 2, 3617);
    			attr_dev(div65, "class", "dashboard-container contractor");
    			add_location(div65, file$1, 4, 0, 83);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div65, anchor);
    			append_dev(div65, h3);
    			append_dev(div65, t1);
    			append_dev(div65, div18);
    			append_dev(div18, div17);
    			append_dev(div17, div16);
    			append_dev(div16, div15);
    			append_dev(div15, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div15, t3);
    			append_dev(div15, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div15, t5);
    			append_dev(div15, div8);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div15, t7);
    			append_dev(div15, div11);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			append_dev(div15, t9);
    			append_dev(div15, div14);
    			append_dev(div14, div13);
    			append_dev(div13, div12);
    			append_dev(div65, t11);
    			append_dev(div65, div34);
    			append_dev(div34, div33);
    			append_dev(div33, div32);
    			append_dev(div32, div31);
    			append_dev(div31, div20);
    			append_dev(div20, div19);
    			append_dev(div31, t13);
    			append_dev(div31, div23);
    			append_dev(div23, div21);
    			append_dev(div23, t15);
    			append_dev(div23, div22);
    			append_dev(div31, t17);
    			append_dev(div31, div25);
    			append_dev(div25, div24);
    			append_dev(div31, t19);
    			append_dev(div31, div27);
    			append_dev(div27, div26);
    			append_dev(div31, t21);
    			append_dev(div31, div30);
    			append_dev(div30, div29);
    			append_dev(div29, div28);
    			append_dev(div29, img);
    			append_dev(div65, t23);
    			append_dev(div65, div49);
    			append_dev(div49, div48);
    			append_dev(div48, div47);
    			append_dev(div47, div46);
    			append_dev(div46, div36);
    			append_dev(div36, div35);
    			append_dev(div46, t25);
    			append_dev(div46, div38);
    			append_dev(div38, div37);
    			append_dev(div46, t27);
    			append_dev(div46, div40);
    			append_dev(div40, div39);
    			append_dev(div46, t29);
    			append_dev(div46, div42);
    			append_dev(div42, div41);
    			append_dev(div46, t31);
    			append_dev(div46, div45);
    			append_dev(div45, div44);
    			append_dev(div44, div43);
    			append_dev(div65, t33);
    			append_dev(div65, div64);
    			append_dev(div64, div63);
    			append_dev(div63, div62);
    			append_dev(div62, div61);
    			append_dev(div61, div51);
    			append_dev(div51, div50);
    			append_dev(div61, t35);
    			append_dev(div61, div53);
    			append_dev(div53, div52);
    			append_dev(div61, t37);
    			append_dev(div61, div55);
    			append_dev(div55, div54);
    			append_dev(div61, t39);
    			append_dev(div61, div57);
    			append_dev(div57, div56);
    			append_dev(div61, t41);
    			append_dev(div61, div60);
    			append_dev(div60, div59);
    			append_dev(div59, div58);
    			append_dev(div65, t43);
    			append_dev(div65, a);
    			append_dev(div65, t45);
    			mount_component(loadingscreen, div65, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loadingscreen.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loadingscreen.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div65);
    			destroy_component(loadingscreen);
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
    	validate_slots("ContractorDash", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ContractorDash> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ LoadingScreen });
    	return [];
    }

    class ContractorDash extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContractorDash",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/ManagerDash.svelte generated by Svelte v3.29.0 */
    const file$2 = "src/ManagerDash.svelte";

    function create_fragment$2(ctx) {
    	let div64;
    	let h3;
    	let t1;
    	let div18;
    	let div17;
    	let div16;
    	let div15;
    	let div2;
    	let div1;
    	let div0;
    	let t3;
    	let div5;
    	let div4;
    	let div3;
    	let t5;
    	let div8;
    	let div7;
    	let div6;
    	let t7;
    	let div11;
    	let div10;
    	let div9;
    	let t9;
    	let div14;
    	let div13;
    	let div12;
    	let t11;
    	let div33;
    	let div32;
    	let div31;
    	let div30;
    	let div20;
    	let div19;
    	let t13;
    	let div22;
    	let div21;
    	let t15;
    	let div24;
    	let div23;
    	let t17;
    	let div26;
    	let div25;
    	let t19;
    	let div29;
    	let div28;
    	let div27;
    	let t21;
    	let div48;
    	let div47;
    	let div46;
    	let div45;
    	let div35;
    	let div34;
    	let t23;
    	let div37;
    	let div36;
    	let t25;
    	let div39;
    	let div38;
    	let t27;
    	let div41;
    	let div40;
    	let t29;
    	let div44;
    	let div43;
    	let div42;
    	let t31;
    	let div63;
    	let div62;
    	let div61;
    	let div60;
    	let div50;
    	let div49;
    	let t33;
    	let div52;
    	let div51;
    	let t35;
    	let div54;
    	let div53;
    	let t37;
    	let div56;
    	let div55;
    	let t39;
    	let div59;
    	let div58;
    	let div57;
    	let t41;
    	let a;
    	let t43;
    	let loadingscreen;
    	let current;
    	loadingscreen = new LoadingScreen({ $$inline: true });

    	const block = {
    		c: function create() {
    			div64 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Your Contracts";
    			t1 = space();
    			div18 = element("div");
    			div17 = element("div");
    			div16 = element("div");
    			div15 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Date Created";
    			t3 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div3.textContent = "Contract";
    			t5 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			div6.textContent = "Approving Manager";
    			t7 = space();
    			div11 = element("div");
    			div10 = element("div");
    			div9 = element("div");
    			div9.textContent = "Contractor";
    			t9 = space();
    			div14 = element("div");
    			div13 = element("div");
    			div12 = element("div");
    			div12.textContent = "Status";
    			t11 = space();
    			div33 = element("div");
    			div32 = element("div");
    			div31 = element("div");
    			div30 = element("div");
    			div20 = element("div");
    			div19 = element("div");
    			div19.textContent = "05-10-20";
    			t13 = space();
    			div22 = element("div");
    			div21 = element("div");
    			div21.textContent = "Emb Linux";
    			t15 = space();
    			div24 = element("div");
    			div23 = element("div");
    			div23.textContent = "jacevans84+man@gmail.com";
    			t17 = space();
    			div26 = element("div");
    			div25 = element("div");
    			div25.textContent = "jacevans84@gmail.com";
    			t19 = space();
    			div29 = element("div");
    			div28 = element("div");
    			div27 = element("div");
    			div27.textContent = "Active";
    			t21 = space();
    			div48 = element("div");
    			div47 = element("div");
    			div46 = element("div");
    			div45 = element("div");
    			div35 = element("div");
    			div34 = element("div");
    			div34.textContent = "05-10-20";
    			t23 = space();
    			div37 = element("div");
    			div36 = element("div");
    			div36.textContent = "Emb Linux";
    			t25 = space();
    			div39 = element("div");
    			div38 = element("div");
    			div38.textContent = "jacevans84@gmail.com";
    			t27 = space();
    			div41 = element("div");
    			div40 = element("div");
    			div40.textContent = "jacevans84@gmail.com";
    			t29 = space();
    			div44 = element("div");
    			div43 = element("div");
    			div42 = element("div");
    			div42.textContent = "Pending";
    			t31 = space();
    			div63 = element("div");
    			div62 = element("div");
    			div61 = element("div");
    			div60 = element("div");
    			div50 = element("div");
    			div49 = element("div");
    			div49.textContent = "05-10-20";
    			t33 = space();
    			div52 = element("div");
    			div51 = element("div");
    			div51.textContent = "Emb Linux";
    			t35 = space();
    			div54 = element("div");
    			div53 = element("div");
    			div53.textContent = "jacevans84@gmail.com";
    			t37 = space();
    			div56 = element("div");
    			div55 = element("div");
    			div55.textContent = "jacevans84@gmail.com";
    			t39 = space();
    			div59 = element("div");
    			div58 = element("div");
    			div57 = element("div");
    			div57.textContent = "Archived";
    			t41 = space();
    			a = element("a");
    			a.textContent = "+";
    			t43 = space();
    			create_component(loadingscreen.$$.fragment);
    			attr_dev(h3, "class", "heading");
    			add_location(h3, file$2, 5, 4, 129);
    			attr_dev(div0, "class", "ts-text title");
    			add_location(div0, file$2, 12, 16, 393);
    			attr_dev(div1, "class", "ts-data");
    			add_location(div1, file$2, 11, 14, 355);
    			attr_dev(div2, "class", "text-col");
    			add_location(div2, file$2, 10, 12, 318);
    			attr_dev(div3, "class", "ts-text title");
    			add_location(div3, file$2, 17, 16, 566);
    			attr_dev(div4, "class", "ts-data");
    			add_location(div4, file$2, 16, 14, 528);
    			attr_dev(div5, "class", "text-col");
    			add_location(div5, file$2, 15, 12, 491);
    			attr_dev(div6, "class", "ts-text title");
    			add_location(div6, file$2, 22, 16, 735);
    			attr_dev(div7, "class", "ts-data");
    			add_location(div7, file$2, 21, 14, 697);
    			attr_dev(div8, "class", "text-col");
    			add_location(div8, file$2, 20, 12, 660);
    			attr_dev(div9, "class", "ts-text title");
    			add_location(div9, file$2, 27, 16, 913);
    			attr_dev(div10, "class", "ts-data");
    			add_location(div10, file$2, 26, 14, 875);
    			attr_dev(div11, "class", "text-col");
    			add_location(div11, file$2, 25, 12, 838);
    			attr_dev(div12, "class", "ts-text title");
    			add_location(div12, file$2, 32, 16, 1084);
    			attr_dev(div13, "class", "ts-data");
    			add_location(div13, file$2, 31, 14, 1046);
    			attr_dev(div14, "class", "text-col");
    			add_location(div14, file$2, 30, 12, 1009);
    			attr_dev(div15, "class", "data-row");
    			add_location(div15, file$2, 9, 10, 283);
    			attr_dev(div16, "class", "box-padding");
    			add_location(div16, file$2, 8, 8, 247);
    			attr_dev(div17, "class", "white-box progress-box");
    			add_location(div17, file$2, 7, 6, 202);
    			attr_dev(div18, "class", "dash-row");
    			add_location(div18, file$2, 6, 4, 173);
    			attr_dev(div19, "class", "ts-text");
    			add_location(div19, file$2, 44, 14, 1406);
    			attr_dev(div20, "class", "text-col");
    			add_location(div20, file$2, 43, 12, 1369);
    			attr_dev(div21, "class", "ts-text");
    			add_location(div21, file$2, 47, 14, 1510);
    			attr_dev(div22, "class", "text-col");
    			add_location(div22, file$2, 46, 12, 1473);
    			attr_dev(div23, "class", "ts-text small");
    			add_location(div23, file$2, 50, 14, 1615);
    			attr_dev(div24, "class", "text-col");
    			add_location(div24, file$2, 49, 12, 1578);
    			attr_dev(div25, "class", "ts-text small");
    			add_location(div25, file$2, 53, 14, 1741);
    			attr_dev(div26, "class", "text-col");
    			add_location(div26, file$2, 52, 12, 1704);
    			attr_dev(div27, "class", "ts-text");
    			add_location(div27, file$2, 57, 16, 1909);
    			attr_dev(div28, "class", "status approved");
    			add_location(div28, file$2, 56, 14, 1863);
    			attr_dev(div29, "class", "text-col");
    			add_location(div29, file$2, 55, 12, 1826);
    			attr_dev(div30, "class", "data-row");
    			add_location(div30, file$2, 42, 10, 1334);
    			attr_dev(div31, "class", "box-padding");
    			add_location(div31, file$2, 41, 8, 1298);
    			attr_dev(div32, "class", "white-box progress-box");
    			add_location(div32, file$2, 40, 6, 1253);
    			attr_dev(div33, "class", "dash-row");
    			add_location(div33, file$2, 39, 4, 1224);
    			attr_dev(div34, "class", "ts-text");
    			add_location(div34, file$2, 69, 14, 2225);
    			attr_dev(div35, "class", "text-col");
    			add_location(div35, file$2, 68, 12, 2188);
    			attr_dev(div36, "class", "ts-text");
    			add_location(div36, file$2, 72, 14, 2329);
    			attr_dev(div37, "class", "text-col");
    			add_location(div37, file$2, 71, 12, 2292);
    			attr_dev(div38, "class", "ts-text small");
    			add_location(div38, file$2, 75, 14, 2434);
    			attr_dev(div39, "class", "text-col");
    			add_location(div39, file$2, 74, 12, 2397);
    			attr_dev(div40, "class", "ts-text small");
    			add_location(div40, file$2, 78, 14, 2556);
    			attr_dev(div41, "class", "text-col");
    			add_location(div41, file$2, 77, 12, 2519);
    			attr_dev(div42, "class", "ts-text");
    			add_location(div42, file$2, 82, 16, 2723);
    			attr_dev(div43, "class", "status pending");
    			add_location(div43, file$2, 81, 14, 2678);
    			attr_dev(div44, "class", "text-col");
    			add_location(div44, file$2, 80, 12, 2641);
    			attr_dev(div45, "class", "data-row");
    			add_location(div45, file$2, 67, 10, 2153);
    			attr_dev(div46, "class", "box-padding");
    			add_location(div46, file$2, 66, 8, 2117);
    			attr_dev(div47, "class", "white-box progress-box");
    			add_location(div47, file$2, 65, 6, 2072);
    			attr_dev(div48, "class", "dash-row");
    			add_location(div48, file$2, 64, 4, 2043);
    			attr_dev(div49, "class", "ts-text");
    			add_location(div49, file$2, 94, 14, 3040);
    			attr_dev(div50, "class", "text-col");
    			add_location(div50, file$2, 93, 12, 3003);
    			attr_dev(div51, "class", "ts-text");
    			add_location(div51, file$2, 97, 14, 3144);
    			attr_dev(div52, "class", "text-col");
    			add_location(div52, file$2, 96, 12, 3107);
    			attr_dev(div53, "class", "ts-text small");
    			add_location(div53, file$2, 100, 14, 3249);
    			attr_dev(div54, "class", "text-col");
    			add_location(div54, file$2, 99, 12, 3212);
    			attr_dev(div55, "class", "ts-text small");
    			add_location(div55, file$2, 103, 14, 3371);
    			attr_dev(div56, "class", "text-col");
    			add_location(div56, file$2, 102, 12, 3334);
    			attr_dev(div57, "class", "ts-text");
    			add_location(div57, file$2, 107, 16, 3539);
    			attr_dev(div58, "class", "status rejected");
    			add_location(div58, file$2, 106, 14, 3493);
    			attr_dev(div59, "class", "text-col");
    			add_location(div59, file$2, 105, 12, 3456);
    			attr_dev(div60, "class", "data-row");
    			add_location(div60, file$2, 92, 10, 2968);
    			attr_dev(div61, "class", "box-padding");
    			add_location(div61, file$2, 91, 8, 2932);
    			attr_dev(div62, "class", "white-box progress-box");
    			add_location(div62, file$2, 90, 6, 2887);
    			attr_dev(div63, "class", "dash-row");
    			add_location(div63, file$2, 89, 4, 2858);
    			attr_dev(a, "href", "_");
    			attr_dev(a, "class", "menu-add w-button");
    			add_location(a, file$2, 114, 4, 3675);
    			attr_dev(div64, "class", "dashboard-container manager");
    			add_location(div64, file$2, 4, 0, 83);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div64, anchor);
    			append_dev(div64, h3);
    			append_dev(div64, t1);
    			append_dev(div64, div18);
    			append_dev(div18, div17);
    			append_dev(div17, div16);
    			append_dev(div16, div15);
    			append_dev(div15, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div15, t3);
    			append_dev(div15, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div15, t5);
    			append_dev(div15, div8);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div15, t7);
    			append_dev(div15, div11);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			append_dev(div15, t9);
    			append_dev(div15, div14);
    			append_dev(div14, div13);
    			append_dev(div13, div12);
    			append_dev(div64, t11);
    			append_dev(div64, div33);
    			append_dev(div33, div32);
    			append_dev(div32, div31);
    			append_dev(div31, div30);
    			append_dev(div30, div20);
    			append_dev(div20, div19);
    			append_dev(div30, t13);
    			append_dev(div30, div22);
    			append_dev(div22, div21);
    			append_dev(div30, t15);
    			append_dev(div30, div24);
    			append_dev(div24, div23);
    			append_dev(div30, t17);
    			append_dev(div30, div26);
    			append_dev(div26, div25);
    			append_dev(div30, t19);
    			append_dev(div30, div29);
    			append_dev(div29, div28);
    			append_dev(div28, div27);
    			append_dev(div64, t21);
    			append_dev(div64, div48);
    			append_dev(div48, div47);
    			append_dev(div47, div46);
    			append_dev(div46, div45);
    			append_dev(div45, div35);
    			append_dev(div35, div34);
    			append_dev(div45, t23);
    			append_dev(div45, div37);
    			append_dev(div37, div36);
    			append_dev(div45, t25);
    			append_dev(div45, div39);
    			append_dev(div39, div38);
    			append_dev(div45, t27);
    			append_dev(div45, div41);
    			append_dev(div41, div40);
    			append_dev(div45, t29);
    			append_dev(div45, div44);
    			append_dev(div44, div43);
    			append_dev(div43, div42);
    			append_dev(div64, t31);
    			append_dev(div64, div63);
    			append_dev(div63, div62);
    			append_dev(div62, div61);
    			append_dev(div61, div60);
    			append_dev(div60, div50);
    			append_dev(div50, div49);
    			append_dev(div60, t33);
    			append_dev(div60, div52);
    			append_dev(div52, div51);
    			append_dev(div60, t35);
    			append_dev(div60, div54);
    			append_dev(div54, div53);
    			append_dev(div60, t37);
    			append_dev(div60, div56);
    			append_dev(div56, div55);
    			append_dev(div60, t39);
    			append_dev(div60, div59);
    			append_dev(div59, div58);
    			append_dev(div58, div57);
    			append_dev(div64, t41);
    			append_dev(div64, a);
    			append_dev(div64, t43);
    			mount_component(loadingscreen, div64, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loadingscreen.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loadingscreen.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div64);
    			destroy_component(loadingscreen);
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
    	validate_slots("ManagerDash", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ManagerDash> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ LoadingScreen });
    	return [];
    }

    class ManagerDash extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ManagerDash",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/NewContract.svelte generated by Svelte v3.29.0 */
    const file$3 = "src/NewContract.svelte";

    function create_fragment$3(ctx) {
    	let div22;
    	let h3;
    	let t1;
    	let div21;
    	let div20;
    	let div19;
    	let div18;
    	let form;
    	let div13;
    	let div1;
    	let div0;
    	let t3;
    	let div4;
    	let div3;
    	let div2;
    	let t5;
    	let input0;
    	let t6;
    	let div7;
    	let div6;
    	let div5;
    	let t8;
    	let input1;
    	let t9;
    	let div10;
    	let div9;
    	let div8;
    	let t10;
    	let strong;
    	let t11;
    	let br0;
    	let t12;
    	let t13;
    	let br1;
    	let t14;
    	let t15;
    	let input2;
    	let t16;
    	let div12;
    	let input3;
    	let t17;
    	let div11;
    	let t18;
    	let a0;
    	let t20;
    	let a1;
    	let t22;
    	let div15;
    	let div14;
    	let t24;
    	let div17;
    	let div16;
    	let t26;
    	let loadingscreen;
    	let t27;
    	let a2;
    	let current;
    	loadingscreen = new LoadingScreen({ $$inline: true });

    	const block = {
    		c: function create() {
    			div22 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Add a New Contract";
    			t1 = space();
    			div21 = element("div");
    			div20 = element("div");
    			div19 = element("div");
    			div18 = element("div");
    			form = element("form");
    			div13 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Fill in the contract details";
    			t3 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div2.textContent = "Please enter a short contract title";
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div5.textContent = "Please enter the email address for the person who\n                      approves the timesheet";
    			t8 = space();
    			input1 = element("input");
    			t9 = space();
    			div10 = element("div");
    			div9 = element("div");
    			div8 = element("div");
    			t10 = text("Please enter the email address for the contractor. This\n                      should\n                      ");
    			strong = element("strong");
    			t11 = text("match their");
    			br0 = element("br");
    			t12 = text("existing timeapproved");
    			t13 = text("\n                      account if they have one. If they do not already have");
    			br1 = element("br");
    			t14 = text("one\n                      they should sign up with this email address.");
    			t15 = space();
    			input2 = element("input");
    			t16 = space();
    			div12 = element("div");
    			input3 = element("input");
    			t17 = space();
    			div11 = element("div");
    			t18 = text("By submitting, you are agreeing to our\n                    ");
    			a0 = element("a");
    			a0.textContent = "Terms";
    			t20 = text("\n                    and\n                    ");
    			a1 = element("a");
    			a1.textContent = "Privacy Policy";
    			t22 = space();
    			div15 = element("div");
    			div14 = element("div");
    			div14.textContent = "Thanks! I have received your form submission, I'll get\n                back to you shortly!";
    			t24 = space();
    			div17 = element("div");
    			div16 = element("div");
    			div16.textContent = "Oops! Something went wrong while submitting the form";
    			t26 = space();
    			create_component(loadingscreen.$$.fragment);
    			t27 = space();
    			a2 = element("a");
    			a2.textContent = "+";
    			attr_dev(h3, "class", "heading");
    			add_location(h3, file$3, 5, 4, 135);
    			attr_dev(div0, "class", "form-section-title");
    			add_location(div0, file$3, 20, 18, 782);
    			attr_dev(div1, "class", "form-title-wrap");
    			add_location(div1, file$3, 19, 16, 734);
    			add_location(div2, file$3, 26, 20, 1040);
    			attr_dev(div3, "class", "label-with-tooltip");
    			add_location(div3, file$3, 25, 18, 987);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "field-input w-input");
    			attr_dev(input0, "maxlength", "256");
    			attr_dev(input0, "name", "contractDesc");
    			attr_dev(input0, "data-name", "contractDesc");
    			attr_dev(input0, "placeholder", "C++ Development");
    			attr_dev(input0, "id", "contractDesc");
    			add_location(input0, file$3, 27, 24, 1111);
    			attr_dev(div4, "class", "form-content-wrap vertical");
    			add_location(div4, file$3, 24, 16, 928);
    			add_location(div5, file$3, 38, 20, 1561);
    			attr_dev(div6, "class", "label-with-tooltip");
    			add_location(div6, file$3, 37, 18, 1508);
    			attr_dev(input1, "type", "email");
    			attr_dev(input1, "class", "field-input w-input");
    			attr_dev(input1, "maxlength", "256");
    			attr_dev(input1, "name", "approvingMan");
    			attr_dev(input1, "data-name", "approvingMan");
    			attr_dev(input1, "placeholder", "j.smith@yourdomain.com");
    			attr_dev(input1, "id", "approvingMan-2");
    			input1.required = "";
    			add_location(input1, file$3, 42, 24, 1735);
    			attr_dev(div7, "class", "form-content-wrap vertical");
    			add_location(div7, file$3, 36, 16, 1449);
    			add_location(br0, file$3, 57, 41, 2407);
    			add_location(strong, file$3, 57, 22, 2388);
    			add_location(br1, file$3, 58, 75, 2519);
    			attr_dev(div8, "class", "form-instructions");
    			add_location(div8, file$3, 54, 20, 2227);
    			attr_dev(div9, "class", "label-with-tooltip");
    			add_location(div9, file$3, 53, 18, 2174);
    			attr_dev(input2, "type", "email");
    			attr_dev(input2, "class", "field-input w-input");
    			attr_dev(input2, "maxlength", "256");
    			attr_dev(input2, "name", "contractorEmail");
    			attr_dev(input2, "data-name", "contractorEmail");
    			attr_dev(input2, "placeholder", "contractor@domain.com");
    			attr_dev(input2, "id", "contractorEmail");
    			input2.required = "";
    			add_location(input2, file$3, 61, 24, 2647);
    			attr_dev(div10, "class", "form-content-wrap vertical");
    			add_location(div10, file$3, 52, 16, 2115);
    			attr_dev(input3, "type", "submit");
    			input3.value = "Add Contract";
    			attr_dev(input3, "data-wait", "Working on that...");
    			attr_dev(input3, "wait", "Calculating Nash Equilibrium...");
    			attr_dev(input3, "data-ix", "show-content-onslide");
    			attr_dev(input3, "class", "submit-button w-button");
    			add_location(input3, file$3, 72, 18, 3084);
    			attr_dev(a0, "href", "_");
    			attr_dev(a0, "class", "form-link");
    			add_location(a0, file$3, 81, 20, 3509);
    			attr_dev(a1, "href", "_");
    			attr_dev(a1, "class", "form-link");
    			add_location(a1, file$3, 83, 20, 3593);
    			attr_dev(div11, "class", "legal-disclaimer");
    			add_location(div11, file$3, 79, 18, 3399);
    			attr_dev(div12, "class", "form-content final");
    			add_location(div12, file$3, 71, 16, 3033);
    			attr_dev(div13, "class", "form-content");
    			add_location(div13, file$3, 18, 14, 691);
    			attr_dev(form, "id", "email-form");
    			attr_dev(form, "name", "email-form");
    			attr_dev(form, "data-name", "Email Form");
    			attr_dev(form, "redirect", "/success");
    			attr_dev(form, "data-redirect", "/success");
    			attr_dev(form, "action", "https://docs.google.com/forms/u/0/d/e/1FAIpQLSfa4w80QHhQ86KfD4--eP2ds0vCJseMC9C9Pjzy2-sM3ODG7w/formResponse");
    			attr_dev(form, "method", "post");
    			add_location(form, file$3, 10, 12, 339);
    			add_location(div14, file$3, 89, 14, 3799);
    			attr_dev(div15, "class", "success-message w-form-done");
    			add_location(div15, file$3, 88, 12, 3743);
    			add_location(div16, file$3, 95, 14, 4024);
    			attr_dev(div17, "class", "error-message w-form-fail");
    			add_location(div17, file$3, 94, 12, 3970);
    			attr_dev(div18, "class", "form-wrapper w-form");
    			add_location(div18, file$3, 9, 10, 293);
    			attr_dev(div19, "class", "box-padding");
    			add_location(div19, file$3, 8, 8, 257);
    			attr_dev(div20, "class", "white-box progress-box");
    			add_location(div20, file$3, 7, 6, 212);
    			attr_dev(div21, "class", "dash-row");
    			add_location(div21, file$3, 6, 4, 183);
    			attr_dev(a2, "href", "_");
    			attr_dev(a2, "class", "menu-add back w-button");
    			add_location(a2, file$3, 102, 4, 4184);
    			attr_dev(div22, "class", "dashboard-container add-timesheet");
    			add_location(div22, file$3, 4, 0, 83);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div22, anchor);
    			append_dev(div22, h3);
    			append_dev(div22, t1);
    			append_dev(div22, div21);
    			append_dev(div21, div20);
    			append_dev(div20, div19);
    			append_dev(div19, div18);
    			append_dev(div18, form);
    			append_dev(form, div13);
    			append_dev(div13, div1);
    			append_dev(div1, div0);
    			append_dev(div13, t3);
    			append_dev(div13, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div3, t5);
    			append_dev(div4, input0);
    			append_dev(div13, t6);
    			append_dev(div13, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div6, t8);
    			append_dev(div7, input1);
    			append_dev(div13, t9);
    			append_dev(div13, div10);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, t10);
    			append_dev(div8, strong);
    			append_dev(strong, t11);
    			append_dev(strong, br0);
    			append_dev(strong, t12);
    			append_dev(div8, t13);
    			append_dev(div8, br1);
    			append_dev(div8, t14);
    			append_dev(div9, t15);
    			append_dev(div10, input2);
    			append_dev(div13, t16);
    			append_dev(div13, div12);
    			append_dev(div12, input3);
    			append_dev(div12, t17);
    			append_dev(div12, div11);
    			append_dev(div11, t18);
    			append_dev(div11, a0);
    			append_dev(div11, t20);
    			append_dev(div11, a1);
    			append_dev(div18, t22);
    			append_dev(div18, div15);
    			append_dev(div15, div14);
    			append_dev(div18, t24);
    			append_dev(div18, div17);
    			append_dev(div17, div16);
    			append_dev(div19, t26);
    			mount_component(loadingscreen, div19, null);
    			append_dev(div22, t27);
    			append_dev(div22, a2);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loadingscreen.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loadingscreen.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div22);
    			destroy_component(loadingscreen);
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
    	validate_slots("NewContract", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NewContract> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ LoadingScreen });
    	return [];
    }

    class NewContract extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NewContract",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/NewTimesheet.svelte generated by Svelte v3.29.0 */
    const file$4 = "src/NewTimesheet.svelte";

    function create_fragment$4(ctx) {
    	let div58;
    	let h3;
    	let t1;
    	let div57;
    	let div56;
    	let div55;
    	let div54;
    	let form;
    	let div49;
    	let div1;
    	let div0;
    	let t3;
    	let p;
    	let t5;
    	let div3;
    	let input0;
    	let label;
    	let input1;
    	let span;
    	let t7;
    	let div2;
    	let t9;
    	let div23;
    	let div6;
    	let div4;
    	let t11;
    	let div5;
    	let t13;
    	let div8;
    	let div7;
    	let input2;
    	let t15;
    	let div10;
    	let div9;
    	let input3;
    	let t17;
    	let div12;
    	let div11;
    	let input4;
    	let t19;
    	let div14;
    	let div13;
    	let input5;
    	let t21;
    	let div16;
    	let div15;
    	let input6;
    	let t23;
    	let div21;
    	let div18;
    	let div17;
    	let input7;
    	let t25;
    	let div20;
    	let div19;
    	let input8;
    	let t27;
    	let div22;
    	let a0;
    	let t29;
    	let a1;
    	let t31;
    	let div43;
    	let div25;
    	let div24;
    	let input9;
    	let t33;
    	let div27;
    	let div26;
    	let input10;
    	let t35;
    	let div29;
    	let div28;
    	let input11;
    	let t37;
    	let div31;
    	let div30;
    	let input12;
    	let t39;
    	let div33;
    	let div32;
    	let input13;
    	let t41;
    	let div38;
    	let div35;
    	let div34;
    	let input14;
    	let t43;
    	let div37;
    	let div36;
    	let input15;
    	let t45;
    	let div41;
    	let div39;
    	let t47;
    	let div40;
    	let t49;
    	let div42;
    	let a2;
    	let t51;
    	let a3;
    	let t53;
    	let div46;
    	let div45;
    	let div44;
    	let t55;
    	let input16;
    	let t56;
    	let div48;
    	let input17;
    	let t57;
    	let div47;
    	let t58;
    	let a4;
    	let t60;
    	let a5;
    	let t62;
    	let div51;
    	let div50;
    	let t64;
    	let div53;
    	let div52;
    	let t66;
    	let loadingscreen;
    	let t67;
    	let a6;
    	let current;
    	loadingscreen = new LoadingScreen({ $$inline: true });

    	const block = {
    		c: function create() {
    			div58 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Add a New Timesheet";
    			t1 = space();
    			div57 = element("div");
    			div56 = element("div");
    			div55 = element("div");
    			div54 = element("div");
    			form = element("form");
    			div49 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Fill in your timesheet";
    			t3 = space();
    			p = element("p");
    			p.textContent = "Please tell us the Monday you want your timesheet to start\n                    on";
    			t5 = space();
    			div3 = element("div");
    			input0 = element("input");
    			label = element("label");
    			input1 = element("input");
    			span = element("span");
    			span.textContent = "Include weekends?";
    			t7 = space();
    			div2 = element("div");
    			div2.textContent = "Please enter the number of units per day.";
    			t9 = space();
    			div23 = element("div");
    			div6 = element("div");
    			div4 = element("div");
    			div4.textContent = "Week Commencing";
    			t11 = space();
    			div5 = element("div");
    			div5.textContent = "WEEK";
    			t13 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div7.textContent = "MON";
    			input2 = element("input");
    			t15 = space();
    			div10 = element("div");
    			div9 = element("div");
    			div9.textContent = "TUE";
    			input3 = element("input");
    			t17 = space();
    			div12 = element("div");
    			div11 = element("div");
    			div11.textContent = "WED";
    			input4 = element("input");
    			t19 = space();
    			div14 = element("div");
    			div13 = element("div");
    			div13.textContent = "THU";
    			input5 = element("input");
    			t21 = space();
    			div16 = element("div");
    			div15 = element("div");
    			div15.textContent = "FRI";
    			input6 = element("input");
    			t23 = space();
    			div21 = element("div");
    			div18 = element("div");
    			div17 = element("div");
    			div17.textContent = "SAT";
    			input7 = element("input");
    			t25 = space();
    			div20 = element("div");
    			div19 = element("div");
    			div19.textContent = "SUN";
    			input8 = element("input");
    			t27 = space();
    			div22 = element("div");
    			a0 = element("a");
    			a0.textContent = "–";
    			t29 = space();
    			a1 = element("a");
    			a1.textContent = "+";
    			t31 = space();
    			div43 = element("div");
    			div25 = element("div");
    			div24 = element("div");
    			div24.textContent = "MON";
    			input9 = element("input");
    			t33 = space();
    			div27 = element("div");
    			div26 = element("div");
    			div26.textContent = "TUE";
    			input10 = element("input");
    			t35 = space();
    			div29 = element("div");
    			div28 = element("div");
    			div28.textContent = "WED";
    			input11 = element("input");
    			t37 = space();
    			div31 = element("div");
    			div30 = element("div");
    			div30.textContent = "THU";
    			input12 = element("input");
    			t39 = space();
    			div33 = element("div");
    			div32 = element("div");
    			div32.textContent = "FRI";
    			input13 = element("input");
    			t41 = space();
    			div38 = element("div");
    			div35 = element("div");
    			div34 = element("div");
    			div34.textContent = "SAT";
    			input14 = element("input");
    			t43 = space();
    			div37 = element("div");
    			div36 = element("div");
    			div36.textContent = "SUN";
    			input15 = element("input");
    			t45 = space();
    			div41 = element("div");
    			div39 = element("div");
    			div39.textContent = "Week Commencing";
    			t47 = space();
    			div40 = element("div");
    			div40.textContent = "WEEK";
    			t49 = space();
    			div42 = element("div");
    			a2 = element("a");
    			a2.textContent = "–";
    			t51 = space();
    			a3 = element("a");
    			a3.textContent = "+";
    			t53 = space();
    			div46 = element("div");
    			div45 = element("div");
    			div44 = element("div");
    			div44.textContent = "Please give a brief description of what you worked on";
    			t55 = space();
    			input16 = element("input");
    			t56 = space();
    			div48 = element("div");
    			input17 = element("input");
    			t57 = space();
    			div47 = element("div");
    			t58 = text("By submitting, you are agreeing to our\n                    ");
    			a4 = element("a");
    			a4.textContent = "Terms";
    			t60 = text("\n                    and\n                    ");
    			a5 = element("a");
    			a5.textContent = "Privacy Policy";
    			t62 = space();
    			div51 = element("div");
    			div50 = element("div");
    			div50.textContent = "Success message text";
    			t64 = space();
    			div53 = element("div");
    			div52 = element("div");
    			div52.textContent = "Oops! Something went wrong while submitting the form";
    			t66 = space();
    			create_component(loadingscreen.$$.fragment);
    			t67 = space();
    			a6 = element("a");
    			a6.textContent = "+";
    			attr_dev(h3, "class", "heading");
    			add_location(h3, file$4, 5, 4, 135);
    			attr_dev(div0, "class", "form-section-title");
    			add_location(div0, file$4, 20, 18, 783);
    			attr_dev(p, "class", "paragraph top");
    			add_location(p, file$4, 21, 18, 862);
    			attr_dev(div1, "class", "form-title-wrap");
    			add_location(div1, file$4, 19, 16, 735);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "field-input date w-input");
    			attr_dev(input0, "maxlength", "256");
    			attr_dev(input0, "name", "timesheetstartdate-2");
    			attr_dev(input0, "data-name", "Timesheetstartdate 2");
    			attr_dev(input0, "placeholder", "Timesheet Start");
    			attr_dev(input0, "id", "timesheetstartdate-2");
    			add_location(input0, file$4, 27, 18, 1111);
    			attr_dev(input1, "type", "checkbox");
    			attr_dev(input1, "id", "weekend-checkbox-2");
    			attr_dev(input1, "name", "weekend-checkbox-2");
    			attr_dev(input1, "data-name", "Weekend Checkbox 2");
    			attr_dev(input1, "class", "w-checkbox-input");
    			add_location(input1, file$4, 35, 39, 1484);
    			attr_dev(span, "for", "weekend-checkbox-2");
    			attr_dev(span, "class", "paragraph w-form-label");
    			add_location(span, file$4, 40, 49, 1725);
    			attr_dev(label, "class", "w-checkbox");
    			add_location(label, file$4, 34, 48, 1438);
    			attr_dev(div2, "class", "paragraph");
    			add_location(div2, file$4, 43, 18, 1882);
    			attr_dev(div3, "class", "form-content-wrap vertical");
    			add_location(div3, file$4, 26, 16, 1052);
    			attr_dev(div4, "class", "week-info-text");
    			add_location(div4, file$4, 49, 20, 2135);
    			attr_dev(div5, "class", "week-info-text");
    			add_location(div5, file$4, 50, 20, 2205);
    			attr_dev(div6, "class", "week-info");
    			add_location(div6, file$4, 48, 18, 2091);
    			attr_dev(div7, "class", "day-label");
    			add_location(div7, file$4, 53, 20, 2330);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "class", "field-input time-unit w-input");
    			attr_dev(input2, "maxlength", "256");
    			attr_dev(input2, "name", "mon-2");
    			attr_dev(input2, "data-name", "Mon 2");
    			attr_dev(input2, "placeholder", "0");
    			attr_dev(input2, "id", "mon-2");
    			add_location(input2, file$4, 53, 52, 2362);
    			attr_dev(div8, "class", "day-wrap");
    			add_location(div8, file$4, 52, 18, 2287);
    			attr_dev(div9, "class", "day-label");
    			add_location(div9, file$4, 63, 20, 2736);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "class", "field-input time-unit w-input");
    			attr_dev(input3, "maxlength", "256");
    			attr_dev(input3, "name", "tue-2");
    			attr_dev(input3, "data-name", "Tue 2");
    			attr_dev(input3, "placeholder", "0");
    			attr_dev(input3, "id", "tue-2");
    			add_location(input3, file$4, 63, 52, 2768);
    			attr_dev(div10, "class", "day-wrap");
    			add_location(div10, file$4, 62, 18, 2693);
    			attr_dev(div11, "class", "day-label");
    			add_location(div11, file$4, 73, 20, 3142);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "class", "field-input time-unit w-input");
    			attr_dev(input4, "maxlength", "256");
    			attr_dev(input4, "name", "wed-2");
    			attr_dev(input4, "data-name", "Wed 2");
    			attr_dev(input4, "placeholder", "0");
    			attr_dev(input4, "id", "wed-2");
    			add_location(input4, file$4, 73, 52, 3174);
    			attr_dev(div12, "class", "day-wrap");
    			add_location(div12, file$4, 72, 18, 3099);
    			attr_dev(div13, "class", "day-label");
    			add_location(div13, file$4, 83, 20, 3548);
    			attr_dev(input5, "type", "text");
    			attr_dev(input5, "class", "field-input time-unit w-input");
    			attr_dev(input5, "maxlength", "256");
    			attr_dev(input5, "name", "thu-2");
    			attr_dev(input5, "data-name", "Thu 2");
    			attr_dev(input5, "placeholder", "0");
    			attr_dev(input5, "id", "thu-2");
    			add_location(input5, file$4, 83, 52, 3580);
    			attr_dev(div14, "class", "day-wrap");
    			add_location(div14, file$4, 82, 18, 3505);
    			attr_dev(div15, "class", "day-label");
    			add_location(div15, file$4, 93, 20, 3954);
    			attr_dev(input6, "type", "text");
    			attr_dev(input6, "class", "field-input time-unit w-input");
    			attr_dev(input6, "maxlength", "256");
    			attr_dev(input6, "name", "fri-2");
    			attr_dev(input6, "data-name", "Fri 2");
    			attr_dev(input6, "placeholder", "0");
    			attr_dev(input6, "id", "fri-2");
    			add_location(input6, file$4, 93, 52, 3986);
    			attr_dev(div16, "class", "day-wrap");
    			add_location(div16, file$4, 92, 18, 3911);
    			attr_dev(div17, "class", "day-label");
    			add_location(div17, file$4, 104, 22, 4409);
    			attr_dev(input7, "type", "text");
    			attr_dev(input7, "class", "field-input time-unit w-input");
    			attr_dev(input7, "maxlength", "256");
    			attr_dev(input7, "name", "sat-2");
    			attr_dev(input7, "data-name", "Sat 2");
    			attr_dev(input7, "placeholder", "0");
    			attr_dev(input7, "id", "sat-2");
    			add_location(input7, file$4, 104, 54, 4441);
    			attr_dev(div18, "class", "day-wrap");
    			add_location(div18, file$4, 103, 20, 4364);
    			attr_dev(div19, "class", "day-label");
    			add_location(div19, file$4, 114, 22, 4835);
    			attr_dev(input8, "type", "text");
    			attr_dev(input8, "class", "field-input time-unit w-input");
    			attr_dev(input8, "maxlength", "256");
    			attr_dev(input8, "name", "sun-2");
    			attr_dev(input8, "data-name", "Sun 2");
    			attr_dev(input8, "placeholder", "0");
    			attr_dev(input8, "id", "sun-2");
    			add_location(input8, file$4, 114, 54, 4867);
    			attr_dev(div20, "class", "day-wrap");
    			add_location(div20, file$4, 113, 20, 4790);
    			attr_dev(div21, "class", "weekend-wrap");
    			add_location(div21, file$4, 102, 18, 4317);
    			attr_dev(a0, "href", "_");
    			attr_dev(a0, "class", "add-remove-button remove w-button");
    			add_location(a0, file$4, 125, 20, 5290);
    			attr_dev(a1, "href", "_");
    			attr_dev(a1, "class", "add-remove-button w-button");
    			add_location(a1, file$4, 128, 20, 5414);
    			attr_dev(div22, "class", "week-button-wrap");
    			add_location(div22, file$4, 124, 18, 5239);
    			attr_dev(div23, "class", "form-content-wrap week-row");
    			add_location(div23, file$4, 47, 16, 2032);
    			attr_dev(div24, "class", "day-label");
    			add_location(div24, file$4, 133, 20, 5633);
    			attr_dev(input9, "type", "text");
    			attr_dev(input9, "maxlength", "256");
    			attr_dev(input9, "name", "entry.477314549");
    			attr_dev(input9, "data-name", "entry.477314549");
    			attr_dev(input9, "placeholder", "0");
    			attr_dev(input9, "class", "field-input time-unit error w-input");
    			add_location(input9, file$4, 133, 52, 5665);
    			attr_dev(div25, "class", "day-wrap");
    			add_location(div25, file$4, 132, 18, 5590);
    			attr_dev(div26, "class", "day-label");
    			add_location(div26, file$4, 142, 20, 6032);
    			attr_dev(input10, "type", "text");
    			attr_dev(input10, "maxlength", "256");
    			attr_dev(input10, "name", "entry.919645818");
    			attr_dev(input10, "data-name", "entry.919645818");
    			attr_dev(input10, "placeholder", "0");
    			attr_dev(input10, "class", "field-input time-unit w-input");
    			add_location(input10, file$4, 142, 52, 6064);
    			attr_dev(div27, "class", "day-wrap");
    			add_location(div27, file$4, 141, 18, 5989);
    			attr_dev(div28, "class", "day-label");
    			add_location(div28, file$4, 151, 20, 6425);
    			attr_dev(input11, "type", "text");
    			attr_dev(input11, "maxlength", "256");
    			attr_dev(input11, "name", "entry.2083568294");
    			attr_dev(input11, "data-name", "entry.2083568294");
    			attr_dev(input11, "placeholder", "0");
    			attr_dev(input11, "class", "field-input time-unit w-input");
    			add_location(input11, file$4, 151, 52, 6457);
    			attr_dev(div29, "class", "day-wrap");
    			add_location(div29, file$4, 150, 18, 6382);
    			attr_dev(div30, "class", "day-label");
    			add_location(div30, file$4, 160, 20, 6820);
    			attr_dev(input12, "type", "text");
    			attr_dev(input12, "maxlength", "256");
    			attr_dev(input12, "name", "entry.317335576");
    			attr_dev(input12, "data-name", "entry.317335576");
    			attr_dev(input12, "placeholder", "0");
    			attr_dev(input12, "class", "field-input time-unit w-input");
    			add_location(input12, file$4, 160, 52, 6852);
    			attr_dev(div31, "class", "day-wrap");
    			add_location(div31, file$4, 159, 18, 6777);
    			attr_dev(div32, "class", "day-label");
    			add_location(div32, file$4, 169, 20, 7213);
    			attr_dev(input13, "type", "text");
    			attr_dev(input13, "maxlength", "256");
    			attr_dev(input13, "name", "entry.1927404421");
    			attr_dev(input13, "data-name", "entry.1927404421");
    			attr_dev(input13, "placeholder", "0");
    			attr_dev(input13, "class", "field-input time-unit w-input");
    			add_location(input13, file$4, 169, 52, 7245);
    			attr_dev(div33, "class", "day-wrap");
    			add_location(div33, file$4, 168, 18, 7170);
    			attr_dev(div34, "class", "day-label");
    			add_location(div34, file$4, 179, 22, 7657);
    			attr_dev(input14, "type", "text");
    			attr_dev(input14, "maxlength", "256");
    			attr_dev(input14, "name", "entry.1043325632");
    			attr_dev(input14, "data-name", "entry.1043325632");
    			attr_dev(input14, "placeholder", "0");
    			attr_dev(input14, "class", "field-input time-unit w-input");
    			add_location(input14, file$4, 179, 54, 7689);
    			attr_dev(div35, "class", "day-wrap");
    			add_location(div35, file$4, 178, 20, 7612);
    			attr_dev(div36, "class", "day-label");
    			add_location(div36, file$4, 188, 22, 8070);
    			attr_dev(input15, "type", "text");
    			attr_dev(input15, "maxlength", "256");
    			attr_dev(input15, "name", "entry.956646951");
    			attr_dev(input15, "data-name", "entry.956646951");
    			attr_dev(input15, "placeholder", "0");
    			attr_dev(input15, "class", "field-input time-unit w-input");
    			add_location(input15, file$4, 188, 54, 8102);
    			attr_dev(div37, "class", "day-wrap");
    			add_location(div37, file$4, 187, 20, 8025);
    			attr_dev(div38, "class", "weekend-wrap");
    			add_location(div38, file$4, 177, 18, 7565);
    			attr_dev(div39, "class", "week-info-text");
    			add_location(div39, file$4, 198, 20, 8503);
    			attr_dev(div40, "class", "week-info-text");
    			add_location(div40, file$4, 199, 20, 8573);
    			attr_dev(div41, "class", "week-info");
    			add_location(div41, file$4, 197, 18, 8459);
    			attr_dev(a2, "href", "_");
    			attr_dev(a2, "class", "add-remove-button remove w-button");
    			add_location(a2, file$4, 202, 20, 8706);
    			attr_dev(a3, "href", "_");
    			attr_dev(a3, "class", "add-remove-button w-button");
    			add_location(a3, file$4, 205, 20, 8830);
    			attr_dev(div42, "class", "week-button-wrap");
    			add_location(div42, file$4, 201, 18, 8655);
    			attr_dev(div43, "class", "form-content-wrap week-row");
    			add_location(div43, file$4, 131, 16, 5531);
    			add_location(div44, file$4, 210, 20, 9059);
    			attr_dev(div45, "class", "label-with-tooltip");
    			add_location(div45, file$4, 209, 18, 9006);
    			attr_dev(input16, "type", "text");
    			attr_dev(input16, "class", "field-input longer w-input");
    			attr_dev(input16, "maxlength", "256");
    			attr_dev(input16, "name", "project-placeholder-text-2");
    			attr_dev(input16, "data-name", "Project Placeholder Text 2");
    			attr_dev(input16, "placeholder", "eg. Wrote custom code for time approved input forms.");
    			attr_dev(input16, "id", "project-placeholder-text-2");
    			add_location(input16, file$4, 213, 24, 9192);
    			attr_dev(div46, "class", "form-content-wrap vertical");
    			add_location(div46, file$4, 208, 16, 8947);
    			attr_dev(input17, "type", "submit");
    			input17.value = "Complete Submission";
    			attr_dev(input17, "data-wait", "Working on that...");
    			attr_dev(input17, "wait", "Calculating Nash Equilibrium...");
    			attr_dev(input17, "data-ix", "show-content-onslide");
    			attr_dev(input17, "class", "submit-button w-button");
    			add_location(input17, file$4, 223, 18, 9667);
    			attr_dev(a4, "href", "_");
    			attr_dev(a4, "class", "form-link");
    			add_location(a4, file$4, 232, 20, 10099);
    			attr_dev(a5, "href", "_");
    			attr_dev(a5, "class", "form-link");
    			add_location(a5, file$4, 234, 20, 10183);
    			attr_dev(div47, "class", "legal-disclaimer");
    			add_location(div47, file$4, 230, 18, 9989);
    			attr_dev(div48, "class", "form-content final");
    			add_location(div48, file$4, 222, 16, 9616);
    			attr_dev(div49, "class", "form-content");
    			add_location(div49, file$4, 18, 14, 692);
    			attr_dev(form, "id", "email-form");
    			attr_dev(form, "name", "email-form");
    			attr_dev(form, "data-name", "Email Form");
    			attr_dev(form, "redirect", "/success");
    			attr_dev(form, "data-redirect", "/success");
    			attr_dev(form, "action", "https://docs.google.com/forms/u/0/d/e/1FAIpQLSfa4w80QHhQ86KfD4--eP2ds0vCJseMC9C9Pjzy2-sM3ODG7w/formResponse");
    			attr_dev(form, "method", "post");
    			add_location(form, file$4, 10, 12, 340);
    			add_location(div50, file$4, 240, 14, 10389);
    			attr_dev(div51, "class", "success-message w-form-done");
    			add_location(div51, file$4, 239, 12, 10333);
    			add_location(div52, file$4, 245, 14, 10537);
    			attr_dev(div53, "class", "error-message w-form-fail");
    			add_location(div53, file$4, 244, 12, 10483);
    			attr_dev(div54, "class", "form-wrapper w-form");
    			add_location(div54, file$4, 9, 10, 294);
    			attr_dev(div55, "class", "box-padding");
    			add_location(div55, file$4, 8, 8, 258);
    			attr_dev(div56, "class", "white-box progress-box");
    			add_location(div56, file$4, 7, 6, 213);
    			attr_dev(div57, "class", "dash-row");
    			add_location(div57, file$4, 6, 4, 184);
    			attr_dev(a6, "href", "_");
    			attr_dev(a6, "class", "menu-add back w-button");
    			add_location(a6, file$4, 251, 4, 10691);
    			attr_dev(div58, "class", "dashboard-container add-timesheet");
    			add_location(div58, file$4, 4, 0, 83);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div58, anchor);
    			append_dev(div58, h3);
    			append_dev(div58, t1);
    			append_dev(div58, div57);
    			append_dev(div57, div56);
    			append_dev(div56, div55);
    			append_dev(div55, div54);
    			append_dev(div54, form);
    			append_dev(form, div49);
    			append_dev(div49, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t3);
    			append_dev(div1, p);
    			append_dev(div49, t5);
    			append_dev(div49, div3);
    			append_dev(div3, input0);
    			append_dev(div3, label);
    			append_dev(label, input1);
    			append_dev(label, span);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			append_dev(div49, t9);
    			append_dev(div49, div23);
    			append_dev(div23, div6);
    			append_dev(div6, div4);
    			append_dev(div6, t11);
    			append_dev(div6, div5);
    			append_dev(div23, t13);
    			append_dev(div23, div8);
    			append_dev(div8, div7);
    			append_dev(div8, input2);
    			append_dev(div23, t15);
    			append_dev(div23, div10);
    			append_dev(div10, div9);
    			append_dev(div10, input3);
    			append_dev(div23, t17);
    			append_dev(div23, div12);
    			append_dev(div12, div11);
    			append_dev(div12, input4);
    			append_dev(div23, t19);
    			append_dev(div23, div14);
    			append_dev(div14, div13);
    			append_dev(div14, input5);
    			append_dev(div23, t21);
    			append_dev(div23, div16);
    			append_dev(div16, div15);
    			append_dev(div16, input6);
    			append_dev(div23, t23);
    			append_dev(div23, div21);
    			append_dev(div21, div18);
    			append_dev(div18, div17);
    			append_dev(div18, input7);
    			append_dev(div21, t25);
    			append_dev(div21, div20);
    			append_dev(div20, div19);
    			append_dev(div20, input8);
    			append_dev(div23, t27);
    			append_dev(div23, div22);
    			append_dev(div22, a0);
    			append_dev(div22, t29);
    			append_dev(div22, a1);
    			append_dev(div49, t31);
    			append_dev(div49, div43);
    			append_dev(div43, div25);
    			append_dev(div25, div24);
    			append_dev(div25, input9);
    			append_dev(div43, t33);
    			append_dev(div43, div27);
    			append_dev(div27, div26);
    			append_dev(div27, input10);
    			append_dev(div43, t35);
    			append_dev(div43, div29);
    			append_dev(div29, div28);
    			append_dev(div29, input11);
    			append_dev(div43, t37);
    			append_dev(div43, div31);
    			append_dev(div31, div30);
    			append_dev(div31, input12);
    			append_dev(div43, t39);
    			append_dev(div43, div33);
    			append_dev(div33, div32);
    			append_dev(div33, input13);
    			append_dev(div43, t41);
    			append_dev(div43, div38);
    			append_dev(div38, div35);
    			append_dev(div35, div34);
    			append_dev(div35, input14);
    			append_dev(div38, t43);
    			append_dev(div38, div37);
    			append_dev(div37, div36);
    			append_dev(div37, input15);
    			append_dev(div43, t45);
    			append_dev(div43, div41);
    			append_dev(div41, div39);
    			append_dev(div41, t47);
    			append_dev(div41, div40);
    			append_dev(div43, t49);
    			append_dev(div43, div42);
    			append_dev(div42, a2);
    			append_dev(div42, t51);
    			append_dev(div42, a3);
    			append_dev(div49, t53);
    			append_dev(div49, div46);
    			append_dev(div46, div45);
    			append_dev(div45, div44);
    			append_dev(div45, t55);
    			append_dev(div46, input16);
    			append_dev(div49, t56);
    			append_dev(div49, div48);
    			append_dev(div48, input17);
    			append_dev(div48, t57);
    			append_dev(div48, div47);
    			append_dev(div47, t58);
    			append_dev(div47, a4);
    			append_dev(div47, t60);
    			append_dev(div47, a5);
    			append_dev(div54, t62);
    			append_dev(div54, div51);
    			append_dev(div51, div50);
    			append_dev(div54, t64);
    			append_dev(div54, div53);
    			append_dev(div53, div52);
    			append_dev(div57, t66);
    			mount_component(loadingscreen, div57, null);
    			append_dev(div58, t67);
    			append_dev(div58, a6);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loadingscreen.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loadingscreen.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div58);
    			destroy_component(loadingscreen);
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
    	validate_slots("NewTimesheet", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NewTimesheet> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ LoadingScreen });
    	return [];
    }

    class NewTimesheet extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NewTimesheet",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.29.0 */
    const file$5 = "src/App.svelte";

    // (14:4) {#if isContractor}
    function create_if_block_3(ctx) {
    	let contractordash;
    	let current;
    	contractordash = new ContractorDash({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(contractordash.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(contractordash, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contractordash.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contractordash.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(contractordash, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(14:4) {#if isContractor}",
    		ctx
    	});

    	return block;
    }

    // (17:4) {#if isManager}
    function create_if_block_2(ctx) {
    	let managerdash;
    	let current;
    	managerdash = new ManagerDash({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(managerdash.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(managerdash, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(managerdash.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(managerdash.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(managerdash, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(17:4) {#if isManager}",
    		ctx
    	});

    	return block;
    }

    // (20:4) {#if addTimesheet}
    function create_if_block_1(ctx) {
    	let newtimesheet;
    	let current;
    	newtimesheet = new NewTimesheet({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(newtimesheet.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(newtimesheet, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(newtimesheet.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(newtimesheet.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(newtimesheet, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(20:4) {#if addTimesheet}",
    		ctx
    	});

    	return block;
    }

    // (23:4) {#if addContract}
    function create_if_block(ctx) {
    	let newcontract;
    	let current;
    	newcontract = new NewContract({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(newcontract.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(newcontract, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(newcontract.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(newcontract.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(newcontract, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(23:4) {#if addContract}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let body;
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let current;
    	let if_block0 = /*isContractor*/ ctx[0] && create_if_block_3(ctx);
    	let if_block1 = /*isManager*/ ctx[1] && create_if_block_2(ctx);
    	let if_block2 = /*addTimesheet*/ ctx[2] && create_if_block_1(ctx);
    	let if_block3 = /*addContract*/ ctx[3] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			body = element("body");
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			attr_dev(div, "class", "page-wrapper");
    			add_location(div, file$5, 12, 2, 352);
    			attr_dev(body, "class", "body dashboard");
    			add_location(body, file$5, 11, 0, 320);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			if (if_block2) if_block2.m(div, null);
    			append_dev(div, t2);
    			if (if_block3) if_block3.m(div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
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
    	validate_slots("App", slots, []);
    	let isContractor = true;
    	let isManager = false;
    	let addTimesheet = false;
    	let addContract = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ContractorDash,
    		ManagerDash,
    		NewContract,
    		NewTimesheet,
    		isContractor,
    		isManager,
    		addTimesheet,
    		addContract
    	});

    	$$self.$inject_state = $$props => {
    		if ("isContractor" in $$props) $$invalidate(0, isContractor = $$props.isContractor);
    		if ("isManager" in $$props) $$invalidate(1, isManager = $$props.isManager);
    		if ("addTimesheet" in $$props) $$invalidate(2, addTimesheet = $$props.addTimesheet);
    		if ("addContract" in $$props) $$invalidate(3, addContract = $$props.addContract);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isContractor, isManager, addTimesheet, addContract];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
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
