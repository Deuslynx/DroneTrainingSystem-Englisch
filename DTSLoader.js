// ==UserScript==
// @name         DroneTrainingSystem Loader
// @namespace    https://github.com/Deuslynx/DroneTrainingSystem-Englisch
// @version      1.6
// @description  Remote loader for the DroneTraining addon for Bondage Club.
// @author       DeusLynx
// @homepageURL  https://github.com/Deuslynx/DroneTrainingSystem-Englisch
// @supportURL   https://github.com/Deuslynx/DroneTrainingSystem-Englisch/issues
// @updateURL    https://raw.githubusercontent.com/
// @downloadURL  https://raw.githubusercontent.com/
// @match        https://bondageprojects.elementfx.com/*
// @match        https://www.bondageprojects.elementfx.com/*
// @match        https://bondage-europe.com/*
// @match        https://www.bondage-europe.com/*
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      deuslynx.github.io
// @connect      raw.githubusercontent.com
// @run-at       document-end
// ==/UserScript==
/*
// Old loader by zajucd
(async function () {
    "use strict";
    const version = "1.6";
    if (typeof DTSbyDeusLynx === "undefined") {
        const src = `https://deuslynx.github.io/DroneTrainingSystem-Englisch/DroneTrainingSystem-EngVersion.js?v=${version}`;
        const script = document.createElement("script");
        script.src = src;
        script.type = "text/javascript";
        script.crossOrigin = "anonymous";
        document.head.appendChild(script);
    }
})();
*/
// New loader by Sky
(() => {
    "use strict";

    const version = "1.6";
    const pageUrl = "https://deuslynx.github.io/DroneTrainingSystem-Englisch/DroneTrainingSystem.iife.js";
    const fallbackUrls = [
        `${pageUrl}?v=${version}`,
        `https://raw.githubusercontent.com/Deuslynx/DroneTrainingSystem-Englisch/main/dist/DroneTrainingSystem.iife.js?v=${version}`,
    ];

    const non_buildVersion = [
        `https://deuslynx.github.io/DroneTrainingSystem-Englisch/DroneTrainingSystem-EngVersion.js?v=${version}`,
        `https://raw.githubusercontent.com/Deuslynx/DroneTrainingSystem-Englisch/main/DroneTrainingSystem-EngVersion.js?v=${version}`,
    ];

    const alreadyLoaded = () => Boolean(unsafeWindow.DTSbyDeusLynx || unsafeWindow.SH);

    const executeBundle = (code, sourceUrl) => {
        if (alreadyLoaded()) return true;
        try {
            unsafeWindow.eval(`${code}\n//# sourceURL=${sourceUrl}`);
            return true;
        } catch (error) {
            console.error("[DTSbyDeusLynx] Bundle execution failed", sourceUrl, error);
            return false;
        }
    };

    const loadWithGM = (index = 0) => {
        const url = fallbackUrls[index];
        if (!url) {
            console.error("[DTSbyDeusLynx] All bundle sources failed", fallbackUrls);
            return;
        }

        GM_xmlhttpRequest({
            method: "GET",
            url,
            timeout: 30000,
            onload: (response) => {
                const ok = response.status >= 200 && response.status < 300 && Boolean(response.responseText);
                if (!ok || !executeBundle(response.responseText, url)) {
                    console.warn("[DTSbyDeusLynx] Loader source failed, trying fallback", url, response.status);
                    loadWithGM(index + 1);
                }
            },
            onerror: () => loadWithGM(index + 1),
            ontimeout: () => loadWithGM(index + 1),
        });
    };

    // A classic cross-origin script does not need CORS. Do not set script.crossOrigin here.
    const directScript = document.createElement("script");
    directScript.src = fallbackUrls[0];
    directScript.async = false;
    directScript.onload = () => {
        if (!alreadyLoaded()) {
            console.warn("[DTSbyDeusLynx] Direct bundle loaded but SH did not initialize; trying userscript fallback.");
            loadWithGM();
        }
    };
    directScript.onerror = () => {
        directScript.remove();
        loadWithGM();
    };
    (document.head || document.documentElement).appendChild(directScript);
})();