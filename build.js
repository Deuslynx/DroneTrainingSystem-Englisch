// build.js
// Bundles src/main.js (and everything it imports) into a single userscript
// file at dist/DroneTrainingSystem.user.js, with the Tampermonkey/Greasemonkey
// metadata block prepended as a banner.
//
// Usage:
//   npm install
//   npm run build
//   (or: node build.js  /  node build.js --watch)

const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs");

const banner = `// ==UserScript==
// @name         DroneTrainingSystem English (LSCG + Legacy Compatible)
// @namespace    local
// @version      1.6.20260722-lscg
// @description  English DroneTrainingSystem with LSCG ModSDK hooks and legacy DTS migration. No remote loader.
// @author       Original from zajucd; Further developed by DeusLynx (full English version)
// @match        https://bondageprojects.elementfx.com/*
// @match        https://www.bondageprojects.elementfx.com/*
// @match        https://bondage-europe.com/*
// @match        https://www.bondage-europe.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==
`;

const isWatch = process.argv.includes("--watch");

// esbuild always indents its printed output with 2 spaces per level and has
// no option to change that. To get tab indentation instead, we post-process
// the generated file: every 2 leading spaces (esbuild's fixed indent width)
// become one tab.
function convertIndentToTabs(filePath) {
    const contents = fs.readFileSync(filePath, "utf8");
    const converted = contents
        .split("\n")
        .map((line) => {
            const match = line.match(/^( +)/);
            if (!match) return line;
            const spaces = match[1].length;
            const tabCount = Math.floor(spaces / 2);
            const leftoverSpaces = spaces % 2; // odd space counts, if any, are preserved as-is
            return "\t".repeat(tabCount) + " ".repeat(leftoverSpaces) + line.slice(spaces);
        })
        .join("\n");
    fs.writeFileSync(filePath, converted, "utf8");
}

/** @type {import('esbuild').BuildOptions} */
const options = {
    entryPoints: [path.join(__dirname, "src", "main.js")],
    outfile: path.join(__dirname, "dist", "DroneTrainingSystem.user.js"),
    bundle: true,
    format: "iife",
    platform: "browser",
    target: "es2020",
    // The game itself defines Player, ChatRoomData, ServerSend, etc. as
    // real globals at runtime, so we don't want esbuild to try to
    // resolve/shim them - just leave every unresolved global reference as-is.
    // (esbuild does this automatically for bundle+iife; nothing external to
    // mark since there are no npm dependencies in this project.)
    minify: false,
    sourcemap: false,
    legalComments: "none",
    charset: "utf8",
    banner: { js: banner },
    logLevel: "info",
};

async function run() {
    if (isWatch) {
        // In watch mode esbuild rewrites the file on every rebuild, so we
        // need to re-run the tab conversion after each rebuild too. The
        // `onEnd` hook fires after every build (initial + rebuilds).
        options.plugins = [
            {
                name: "tabs-indent",
                setup(build) {
                    build.onEnd((result) => {
                        if (result.errors.length === 0) {
                            convertIndentToTabs(options.outfile);
                            console.log(`Rebuilt ${options.outfile} (tabs applied)`);
                        }
                    });
                },
            },
        ];
        const ctx = await esbuild.context(options);
        await ctx.watch();
        console.log("Watching for changes... (Ctrl+C to stop)");
    }
    else {
        await esbuild.build(options);
        convertIndentToTabs(options.outfile);
        console.log(`Built ${options.outfile} (tabs applied)`);
    }
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
