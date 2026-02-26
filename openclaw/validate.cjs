#!/usr/bin/env node
/**
 * ASTRALMIA — Full Validation (OpenClaw + Engine)
 */
const fs = require("fs");
const path = require("path");

const DIR = __dirname;
let passed = 0, failed = 0;

function check(label, ok) {
  if (ok) { console.log(`  ✅ ${label}`); passed++; }
  else { console.log(`  ❌ ${label}`); failed++; }
}
function exists(f) { return fs.existsSync(path.join(DIR, f)); }
function contains(f, t) { try { return fs.readFileSync(path.join(DIR, f), "utf8").includes(t); } catch { return false; } }

console.log("\n═══════════════════════════════════════════════════════");
console.log("  ✨ ASTRALMIA — Full Validation v3.0");
console.log("═══════════════════════════════════════════════════════\n");

console.log("📂 OpenClaw Config:");
check("openclaw.json exists", exists("openclaw.json"));
check("openclaw.json is valid JSON", (() => { try { JSON.parse(fs.readFileSync(path.join(DIR, "openclaw.json"), "utf8")); return true; } catch { return false; } })());
check("openclaw.json has gateway config", contains("openclaw.json", '"gateway"'));
check("openclaw.json has CJ plugin", contains("openclaw.json", "cj-dropshipping"));

console.log("\n🔮 CJ Plugin:");
check("Plugin manifest", exists("extensions/cj-dropshipping/openclaw.plugin.json"));
check("Plugin index.ts", exists("extensions/cj-dropshipping/index.ts"));
check("Plugin has 14 tools", (() => {
  const c = fs.readFileSync(path.join(DIR, "extensions/cj-dropshipping/index.ts"), "utf8");
  return (c.match(/api\.registerTool\(/g) || []).length === 14;
})());

console.log("\n🧠 Workspace:");
check("SOUL.md", exists("workspace/SOUL.md") && contains("workspace/SOUL.md", "Caela"));
check("AGENTS.md", exists("workspace/AGENTS.md") && contains("workspace/AGENTS.md", "cj_search_products"));
check("IDENTITY.md", exists("workspace/IDENTITY.md"));
check("USER.md", exists("workspace/USER.md"));
check("TOOLS.md", exists("workspace/TOOLS.md"));

console.log("\n⚙️ Engine:");
check("engine/main.js", exists("engine/main.js") && contains("engine/main.js", "startDaemon"));
check("engine/cj-client.js", exists("engine/cj-client.js") && contains("engine/cj-client.js", "CJClient"));
check("engine/product-engine.js", exists("engine/product-engine.js") && contains("engine/product-engine.js", "analyzeProduct"));
check("engine/catalog-scanner.js", exists("engine/catalog-scanner.js") && contains("engine/catalog-scanner.js", "runFullScan"));
check("engine/health-check.js", exists("engine/health-check.js"));
check("engine/test-all.js", exists("engine/test-all.js"));

console.log("\n🚀 Deploy:");
check("ecosystem.config.cjs", exists("ecosystem.config.cjs") && contains("ecosystem.config.cjs", "astralmia-engine"));
check("deploy.sh", exists("deploy.sh"));
check(".env.example", exists(".env.example") && contains(".env.example", "CJ_API_KEY"));
check("package.json", exists("package.json") && contains("package.json", "astralmia-openclaw"));

console.log("\n═══════════════════════════════════════════════════════");
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log(failed === 0 ? "  ✅ ALL CHECKS PASSED" : "  ❌ SOME CHECKS FAILED");
console.log("═══════════════════════════════════════════════════════\n");
process.exit(failed > 0 ? 1 : 0);
