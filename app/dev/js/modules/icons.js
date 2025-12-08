/**
 * Material Icon Manager
 *
 * Loads immediately (safe), but defers expensive parsing until the
 * first call to updateEditorIcons().
 */

let cleanList = [];
let dirtyList = [];
let parsed = false;

const LINK_ID = "wpbs-material-icons-editor-css-css";

const BASE_URL =
    "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:" +
    "opsz,wght,FILL,GRAD@20..48,200..500,0..1,0";

// --------------------------------------------------------------
// Lazy heavy work: extract icon_names from existing stylesheet
// --------------------------------------------------------------

function extractNamesFromHref(href = "") {
    if (!href.includes("icon_names=")) return [];
    try {
        const url = new URL(href);
        const param = url.searchParams.get("icon_names") || "";
        return param
            .split(",")
            .map((n) => n.trim())
            .filter(Boolean);
    } catch (err) {
        return [];
    }
}

function ensureParsed() {
    if (parsed) return;

    const link = document.getElementById(LINK_ID);
    if (link) {
        const href = link.getAttribute("href") || link.dataset.href || "";
        cleanList = extractNamesFromHref(href);
    }

    parsed = true;
}

// --------------------------------------------------------------
// Merge + update stylesheet
// --------------------------------------------------------------

function updateLinkTag() {
    const allNames = Array.from(new Set([...cleanList, ...dirtyList])).sort();
    const href = `${BASE_URL}&icon_names=${allNames.join(",")}&display=swap`;
    
    let link = document.getElementById(LINK_ID);

    if (!link) {
        link = document.createElement("link");
        link.id = LINK_ID;
        link.rel = "stylesheet";
        document.head.appendChild(link);
    }

    link.href = href;
    link.dataset.href = href;
}

// --------------------------------------------------------------
// Public API called by IconControl
// --------------------------------------------------------------

export function updateEditorIcons(iconArray = []) {
    // heavy work deferred to this moment
    ensureParsed();

    // collect dirty icon names
    dirtyList = Array.from(
        new Set(
            iconArray
                .map((i) => i?.name)
                .filter(Boolean)
        )
    );

    updateLinkTag();
}
