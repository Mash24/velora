/**
 * Production TTFB baseline for Velora storefront + admin login.
 * Usage: node scripts/perf-baseline.mjs [baseUrl]
 */
const base = process.argv[2] || "http://127.0.0.1:3001";

const routes = [
  "/",
  "/shop",
  "/product/examination-gloves",
  "/your-order",
  "/delivery",
  "/contact",
  "/about",
  "/bulk-orders",
  "/admin/login",
];

async function sample(path) {
  const t0 = Date.now();
  const res = await fetch(`${base}${path}`, {
    redirect: "manual",
    headers: { "cache-control": "no-cache" },
  });
  const buf = await res.arrayBuffer();
  const ms = Date.now() - t0;
  return { path, status: res.status, ms, bytes: buf.byteLength };
}

async function measure(path, n = 3) {
  // warm
  await sample(path);
  const samples = [];
  for (let i = 0; i < n; i++) samples.push(await sample(path));
  const avg = Math.round(samples.reduce((a, s) => a + s.ms, 0) / samples.length);
  const bytes = Math.round(samples.reduce((a, s) => a + s.bytes, 0) / samples.length);
  return {
    path,
    status: samples[0].status,
    avgMs: avg,
    minMs: Math.min(...samples.map((s) => s.ms)),
    maxMs: Math.max(...samples.map((s) => s.ms)),
    bytes,
    samples: samples.map((s) => s.ms),
  };
}

console.log(JSON.stringify({ base, at: new Date().toISOString() }, null, 0));
for (const path of routes) {
  const row = await measure(path);
  console.log(JSON.stringify(row));
}
