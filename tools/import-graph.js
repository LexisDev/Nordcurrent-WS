const fs = require("fs");
const path = require("path");

const SRC = path.resolve(__dirname, "..", "src");

function walk(dir, acc = []) {
    for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        const st = fs.statSync(full);
        if (st.isDirectory()) walk(full, acc);
        else if (name.endsWith(".ts")) acc.push(full);
    }
    return acc;
}

const files = walk(SRC);
const set = new Set(files.map((f) => path.resolve(f)));

const importRe = /(?:import[\s\S]*?from\s*|import\s*|require\s*\(\s*|export[\s\S]*?from\s*)["']([^"']+)["']/g;

function resolveImport(fromFile, spec) {
    if (!spec.startsWith(".")) return null; // external module
    let base = path.resolve(path.dirname(fromFile), spec);
    const candidates = [base + ".ts", path.join(base, "index.ts")];
    for (const c of candidates) {
        if (set.has(path.resolve(c))) return path.resolve(c);
    }
    return null;
}

const deps = new Map(); // file -> Set(file)
const rdeps = new Map(); // file -> Set(file)
for (const f of files) {
    const content = fs.readFileSync(f, "utf8");
    const d = new Set();
    let m;
    while ((m = importRe.exec(content))) {
        const r = resolveImport(f, m[1]);
        if (r) d.add(r);
    }
    deps.set(path.resolve(f), d);
    for (const r of d) {
        if (!rdeps.has(r)) rdeps.set(r, new Set());
        rdeps.get(r).add(path.resolve(f));
    }
}

function rel(f) {
    return path.relative(SRC, f).split(path.sep).join("/");
}

function roots() {
    const r = [];
    for (const f of files) {
        const rl = rel(f);
        if (rl === "server.ts" || rl === "server-cluster.ts") r.push(path.resolve(f));
        if (rl.startsWith("commands/")) r.push(path.resolve(f));
        if (rl.startsWith("notifications/")) r.push(path.resolve(f));
    }
    return r;
}

function closureFrom(start) {
    const seen = new Set();
    const stack = [...start];
    while (stack.length) {
        const cur = stack.pop();
        if (seen.has(cur)) continue;
        seen.add(cur);
        for (const d of deps.get(cur) || []) stack.push(d);
    }
    return seen;
}

const cmd = process.argv[2];
if (cmd === "orphans") {
    const reach = closureFrom(roots());
    const orphans = files.map((f) => path.resolve(f)).filter((f) => !reach.has(f));
    orphans.sort();
    console.log(orphans.map(rel).join("\n"));
    console.error(`\nTOTAL FILES: ${files.length}, REACHABLE: ${reach.size}, ORPHANS: ${orphans.length}`);
} else if (cmd === "rdeps") {
    const target = path.resolve(SRC, process.argv[3]);
    const r = rdeps.get(target) || new Set();
    console.log([...r].map(rel).sort().join("\n"));
    console.error(`\n${process.argv[3]} imported by ${r.size} files`);
} else if (cmd === "closure") {
    const target = path.resolve(SRC, process.argv[3]);
    const c = closureFrom([target]);
    console.log([...c].map(rel).sort().join("\n"));
    console.error(`\nclosure size: ${c.size}`);
} else {
    console.error("unknown command");
}
