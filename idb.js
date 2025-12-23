/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let a;
const b = new WeakMap(),
    c = new WeakMap(),
    d = new WeakMap(),
    e = new WeakMap(),
    f = new WeakMap();

function g(h) {
    return new Proxy(h, {
        get(i, j, k) {
            if (i instanceof IDBTransaction) {
                if ("done" === j) return c.get(i);
                if ("objectStoreNames" === j) return i.objectStoreNames || d.get(i);
                if ("store" === j) {
                    const names = i.objectStoreNames || d.get(i);
                    return names.length === 1 ? k.objectStore(names[0]) : undefined;
                }
            }

            const v = i[j];
            if ("function" == typeof v) {
                return (...args) => l(v.apply(i, args));
            }

            // Convenience delegation for single-store transactions
            if (i instanceof IDBTransaction && v === undefined) {
                const names = i.objectStoreNames || d.get(i);
                if (names && names.length === 1) {
                    const s = i.objectStore(names[0]);
                    const sv = s[j];
                    if (sv !== undefined) {
                        return "function" == typeof sv ? (...args) => l(sv.apply(s, args)) : l(sv);
                    }
                }
            }

            return l(v);
        },
        has(i, j) {
            return (i instanceof IDBTransaction && ("done" === j || "store" === j)) || Reflect.has(i, j);
        },
        set(i, j, k) {
            i[j] = k;
            return true;
        }
    });
}

function h(i) {
    if (i instanceof IDBRequest) return function(p) {
        const q = new Promise(((r, s) => {
            const t = () => {
                    p.removeEventListener("success", u), p.removeEventListener("error", v)
                },
                u = () => {
                    r(p.result), t()
                },
                v = () => {
                    s(p.error), t()
                };
            p.addEventListener("success", u), p.addEventListener("error", v)
        }));
        return q.then((r => {
            r instanceof IDBCursor && b.set(r, p)
        })), q
    }(i);
    if (f.has(i)) return f.get(i);
    const j = new Promise(((p, q) => {
        const r = () => {
                i.removeEventListener("complete", s), i.removeEventListener("error", t), i.removeEventListener("abort", t)
            },
            s = () => {
                p(), r()
            },
            t = () => {
                q(i.error || new DOMException("AbortError", "AbortError")), r()
            };
        i.addEventListener("complete", s), i.addEventListener("error", t), i.addEventListener("abort", t)
    }));
    return f.set(i, j), j
}

function i(j, k, m = "readonly") {
    const p = j.transaction(k, m);
    d.set(p, j.objectStoreNames);
    c.set(p, h(p));
    return g(p);
}

class j {
    constructor(k) {
        e.set(this, k)
    }
    get name() {
        return e.get(this).name
    }
    get version() {
        return e.get(this).version
    }
    get objectStoreNames() {
        return e.get(this).objectStoreNames
    }
    get done() {
        return (a || (a = h(this))).then((() => {}))
    }
    close() {
        e.get(this).close()
    }
    transaction(k, p, ...q) {
        const r = e.get(this).transaction(k, p, ...q);
        d.set(r, Array.isArray(k) ? k : [k]);
        c.set(r, h(r));
        const s = g(r);
        if (q[0]) q[0](s, (t => {
            t.done.catch((() => {}));
            t.abort();
        }));
        return s;
    }
    add(k, p, q) {
        return i(e.get(this), k, "readwrite").add(p, q)
    }
    clear(k) {
        return i(e.get(this), k, "readwrite").clear()
    }
    count(k, p) {
        return i(e.get(this), k).count(p)
    }
    delete(k, p) {
        return i(e.get(this), k, "readwrite").delete(p)
    }
    get(k, p) {
        return i(e.get(this), k).get(p)
    }
    getAll(k, p, q) {
        return i(e.get(this), k).getAll(p, q)
    }
    getAllFromIndex(k, p, q, r) {
        return i(e.get(this), k).getFromIndex(p, q, r)
    }
    getAllKeys(k, p, q) {
        return i(e.get(this), k).getAllKeys(p, q)
    }
    getAllKeysFromIndex(k, p, q, r) {
        return i(e.get(this), k).getKeysFromIndex(p, q, r)
    }
    getFromIndex(k, p, q) {
        return i(e.get(this), k).getFromIndex(p, q)
    }
    getKey(k, p) {
        return i(e.get(this), k).getKey(p)
    }
    getKeyFromIndex(k, p, q) {
        return i(e.get(this), k).getKeyFromIndex(p, q)
    }
    put(k, p, q) {
        return i(e.get(this), k, "readwrite").put(p, q)
    }
}

function k(p) {
    return p instanceof IDBCursor ? new Proxy(p, {
        get(q, r) {
            if ("value" === r) return l(q.value);
            const s = q[r];
            return "function" == typeof s ? s.bind(q) : s
        }
    }) : p
}

function l(p) {
    if ("function" == typeof p) return g(p);
    if (p instanceof IDBRequest) return h(p);
    if (p instanceof IDBTransaction) return g(p);
    if (p instanceof IDBCursor) return k(p);
    if (p !== Object(p)) return p;
    
    const q = new WeakMap();
    const r = {
        get(s, t) {
            if (q.has(s)) {
                const u = q.get(s)[t];
                if (u !== undefined) return u;
            }
            let v = s[t];
            if ("function" == typeof v) {
                const originalV = v;
                v = (...args) => l(originalV.apply(s, args));
            }
            if ("value" === t) v = l(v);
            if (!q.has(s)) q.set(s, {});
            q.get(s)[t] = v;
            return v;
        }
    };
    const res = new Proxy(p, r);
    e.set(res, p);
    return res;
}

async function openDB(p, q, {
    blocked: r,
    blocking: s,
    terminated: t,
    upgrade: u
} = {}) {
    const v = indexedDB.open(p, q),
        w = h(v);
    if (u) v.addEventListener("upgradeneeded", (x => {
        u(new j(v.result), x.oldVersion, x.newVersion, g(v.transaction))
    }));
    if (r) v.addEventListener("blocked", (x => r(x.oldVersion, x.newVersion, x)));
    return w.then((x => {
        if (s) x.addEventListener("versionchange", (y => s(x.version, y.newVersion, y)));
        if (t) x.addEventListener("close", (() => t()));
        return wrap(x);
    }));
}

async function deleteDB(p, {
    blocked: q
} = {}) {
    const r = indexedDB.deleteDatabase(p);
    if (q) r.addEventListener("blocked", (s => q(s.oldVersion, s)));
    return h(r).then((() => {}));
}

const wrap = p => new j(p),
    unwrap = p => e.get(p);

export {
    deleteDB,
    openDB,
    unwrap,
    wrap
};