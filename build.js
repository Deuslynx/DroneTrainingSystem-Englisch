// build.js
// Step 1: Bundles src/main.js (and everything it imports) into a single userscript file at dist/DroneTrainingSystem.iife.js
//         metadata block prepended and // #region / // #endregion markers wrapped around each original source file's contribution
// Step 2: copies that finished file's contents verbatim into dist/DroneTrainingSystem.user.js. 
// 
// Usage:
//   npm install
//   npm run build
//   (or: node build.js  /  node build.js --watch)

const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs");

const banner = `// ==UserScript==
// @name DroneTrainingSystem English (LSCG + Legacy Compatible)
// @namespace local
// @version 1.6.20260722-lscg
// @description English DroneTrainingSystem with LSCG ModSDK hooks and legacy DTS migration. No remote loader.
// @author Original from zajucd; Further developed by DeusLynx (full English version)
// @license MIT
// @include /^https:\\/\\/(www\\.)?bondageprojects\\.elementfx\\.com\\/R\\d+\\/(BondageClub|\\d+)\\/(\\d+\\.html)?$/
// @include /^https:\\/\\/(www\\.)?bondage-europe\\.com\\/R\\d+\\/(BondageClub|\\d+)\\/(\\d+\\.html)?$/
// @include /^https:\\/\\/(www\\.)?bondageprojects\\.com\\/R\\d+\\/$/
// @grant none
// @run-at document-end
// ==/UserScript==
`;

const isWatch = process.argv.includes("--watch");

// esbuild always indents its printed output with 2 spaces per level and has no option to change that
// To get tab indentation instead, post-process the generated file: every 2 leading spaces become one tab
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

// ----- Region markers (// #region file.js ... // #endregion) -----
// esbuild deletes import/export statements entirely once bundled and any comment "attached" to one of those gets deleted right along with it 
// So instead have esbuild emit a sourcemap, decode it, and use it to find the exact output-line boundaries
// (where the "current source file" changes) then insert markers there
// This is independent of whatever esbuild does or doesn't do with comments

const VLQ_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const VLQ_LOOKUP = {};
for (let i = 0; i < VLQ_CHARS.length; i++) VLQ_LOOKUP[VLQ_CHARS[i]] = i;

// Decodes one comma-separated mapping "segment" (a run of base64-VLQ chars)
// into its array of signed integer fields, per the source-map v3 spec.
function decodeVLQSegment(segment) {
    const values = [];
    let shift = 0;
    let value = 0;
    for (let i = 0; i < segment.length; i++) {
        const digit = VLQ_LOOKUP[segment[i]];
        const cont = (digit & 32) !== 0;
        value += (digit & 31) << shift;
        if (cont) {
            shift += 5;
        }
        else {
            const negate = (value & 1) === 1;
            value >>= 1;
            values.push(negate ? -value : value);
            value = 0;
            shift = 0;
        }
    }
    return values;
}

// Returns an array where index = 0-based generated-line number and value = the basename of the original source file that line came from 
// (or null for lines with no mapping at all, e.g. banner lines or gaps)
function mapLinesToSourceFiles(map) {
    const sourceNames = map.sources.map((s) => path.basename(s));
    let sourceIndex = 0; // running total across the whole mappings string, not reset per line
    return map.mappings.split(";").map((lineMappings) => {
        let lineSource = null;
        if (lineMappings.length > 0) {
            for (const segment of lineMappings.split(",")) {
                if (segment.length === 0) continue;
                const fields = decodeVLQSegment(segment); // [genCol, srcIndexDelta, srcLine, srcCol, nameIdx?]
                if (fields.length >= 2) {
                    sourceIndex += fields[1];
                    if (lineSource == null) lineSource = sourceNames[sourceIndex];
                }
            }
        }
        return lineSource;
    });
}

// Attribute each unmapped line to the NEXT mapped source instead of the previous one
// Only a genuinely trailing run of unmapped lines (nothing mapped after them at all, e.g. the closing `})();` of the IIFE wrapper) stays unattributed
function forwardFillSources(lineSources) {
    const effective = new Array(lineSources.length).fill(null);
    let next = null;
    for (let i = lineSources.length - 1; i >= 0; i--) {
        if (lineSources[i] != null) next = lineSources[i];
        effective[i] = lineSources[i] != null ? lineSources[i] : next;
    }
    return effective;
}

function insertRegionMarkers(outFilePath, mapFilePath) {
    const map = JSON.parse(fs.readFileSync(mapFilePath, "utf8"));
    const lineSources = forwardFillSources(mapLinesToSourceFiles(map));
    const outLines = fs.readFileSync(outFilePath, "utf8").split("\n");

    // Drop esbuild's own "//# sourceMappingURL=..." comment - we delete the
    // intermediate .map file right after this runs, so a dangling reference
    // to it has no use in the shipped bundle
    const lastLine = outLines[outLines.length - 1];
    if (lastLine && lastLine.startsWith("//# sourceMappingURL=")) {
        outLines.pop();
    }

    const rebuilt = [];
    let currentSource = null;
    for (let i = 0; i < outLines.length; i++) {
        const lineSource = lineSources[i];
        if (lineSource !== currentSource) {
            if (currentSource !== null) rebuilt.push("// #endregion");
            if (lineSource !== null) rebuilt.push(`// #region ${lineSource}`);
            currentSource = lineSource;
        }
        rebuilt.push(outLines[i]);
    }
    if (currentSource !== null) rebuilt.push("// #endregion");

    fs.writeFileSync(outFilePath, rebuilt.join("\n"), "utf8");
}

function postProcess(outfile) {
    const mapFile = `${outfile}.map`;
    if (fs.existsSync(mapFile)) {
        insertRegionMarkers(outfile, mapFile);
        fs.unlinkSync(mapFile);
    }
    convertIndentToTabs(outfile);
}

function publishSecondCopy(iifeFile, userFile) {
    fs.copyFileSync(iifeFile, userFile);
}

const iifeOutfile = path.join(__dirname, "dist", "DroneTrainingSystem.iife.js");
const userOutfile = path.join(__dirname, "dist", "DroneTrainingSystem.user.js");

/** @type {import('esbuild').BuildOptions} */
const options = {
    entryPoints: [path.join(__dirname, "src", "main.js")],
    outfile: iifeOutfile,
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
    sourcemap: "external", // consumed by insertRegionMarkers(), then deleted
    legalComments: "none",
    charset: "utf8",
    banner: { js: banner },
    logLevel: "info",
};

async function run() {
    if (isWatch) {
        // In watch mode esbuild rewrites the file on every rebuild, so we need to re-run post-processing after each rebuildtoo. 
        // The `onEnd` hook fires after every build (initial + rebuilds).
        options.plugins = [
            {
                name: "post-process",
                setup(build) {
                    build.onEnd((result) => {
                        if (result.errors.length === 0) {
                            postProcess(options.outfile);
                            publishSecondCopy(iifeOutfile, userOutfile);
                            console.log(`Rebuilt ${iifeOutfile} -> copied to ${userOutfile}`);
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
        postProcess(options.outfile);
        publishSecondCopy(iifeOutfile, userOutfile);
        console.log(`Built ${iifeOutfile} -> copied to ${userOutfile}`);
    }
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});