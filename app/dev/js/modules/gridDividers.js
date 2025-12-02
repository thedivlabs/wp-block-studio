export function gridDividers(element, args = {}, uniqueId = false) {
    if (!element || !uniqueId) {
        return;
    }

    console.log(args);

    const { divider, breakpoints = {} } = args;
    if (!divider) {
        return;
    }

    const settings = WPBS?.settings ?? {};
    const themeBreakpoints = settings.breakpoints ?? {};

    // New: derive columns per breakpoint from args.breakpoints[bpKey].props.columns
    const breakpointEntries = Object.entries(breakpoints || {});

    if (!breakpointEntries.length) {
        return;
    }

    const container = element.querySelector(":scope > .loop-container");
    if (!container) {
        return;
    }

    const cards = container.querySelectorAll(".loop-card");
    const total = cards.length;

    if (!total) {
        return;
    }

    const selector = "." + uniqueId;

    // Build an array of breakpoint configs, sorted by min width
    const breakpointConfigs = breakpointEntries
        .map(([bpKey, bpData]) => {
            const colsRaw = bpData?.props?.columns;
            const cols = parseInt(colsRaw, 10) || 0;
            if (!cols) {
                return null;
            }

            const rawValue = themeBreakpoints[bpKey];

            // If this breakpoint doesn't exist in theme.json, skip it
            if (!rawValue) {
                return null;
            }

            // Extract numeric value for sorting (e.g. "768px" -> 768)
            const numeric = parseFloat(String(rawValue)) || 0;

            return {
                bpKey,
                value: rawValue,
                numeric,
                cols,
            };
        })
        .filter(Boolean)
        .sort((a, b) => a.numeric - b.numeric);

    if (!breakpointConfigs.length) {
        return;
    }

    // Helper to compute how many items are in the last row for a given col count
    const getLastRowCount = (cols) => {
        if (cols <= 0) return 0;
        const fullRows = Math.floor(total / cols);
        const remainder = total - fullRows * cols;
        return remainder || cols;
    };

    // Helper to create the media query wrapper
    const wrapWithMedia = (rules, min, max) => {
        if (min && max) {
            return [
                "@media screen and (min-width: " +
                min +
                ") and (max-width: calc(" +
                max +
                " - 1px)) {",
                rules,
                "}",
            ].join("\n");
        }
        if (!min && max) {
            // Smallest range: only max
            return [
                "@media screen and (max-width: calc(" + max + " - 1px)) {",
                rules,
                "}",
            ].join("\n");
        }
        // Largest range: only min
        return [
            "@media screen and (min-width: " + min + ") {",
            rules,
            "}",
        ].join("\n");
    };

    // Helper to generate the divider CSS rules for a given column count
    const buildRulesForCols = (cols, lastCount) => {
        const n = cols;
        const last = lastCount;

        return [
            // Remove vertical divider on first column
            selector +
            " .loop-container > .loop-card:nth-of-type(" +
            n +
            "n+1):after { content: none !important; }",

            // General vertical divider height for items not in first row
            selector +
            " .loop-container > .loop-card:nth-of-type(n+" +
            (n + 1) +
            "):after {" +
            " height: calc(100% + (var(--grid-row-gap, var(--grid-col-gap)) / 2));" +
            " top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2));" +
            " }",

            // Enable horizontal dividers when we have more than one row
            selector +
            " .loop-container:has(> .loop-card:nth-of-type(" +
            (n + 1) +
            ")) > .loop-card:before { content:\"\"; }",

            // First row: top alignment
            selector +
            " .loop-container:has(> .loop-card:nth-of-type(" +
            (n + 1) +
            ")) > .loop-card:nth-of-type(-n+" +
            (n + 1) +
            "):after {" +
            " height: calc(100% + (var(--grid-row-gap, var(--grid-col-gap)) / 2));" +
            " top: 0;" +
            " }",

            // Middle rows: full height dividers
            selector +
            " .loop-container:has(> .loop-card:nth-of-type(" +
            (n + 1) +
            ")) > .loop-card:nth-of-type(n+" +
            (n + 2) +
            "):after {" +
            " height: calc(100% + var(--grid-row-gap, var(--grid-col-gap, 0px)));" +
            " top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2));" +
            " }",

            // Horizontal divider width on last column of each row
            selector +
            " .loop-container > .loop-card:nth-of-type(" +
            n +
            "n):before {" +
            " width: calc(100% + calc(var(--grid-col-gap) / 2));" +
            " }",

            // Horizontal divider width on first column of each row
            selector +
            " .loop-container > .loop-card:nth-of-type(" +
            n +
            "n+1):before {" +
            " width: " +
            (n > 1
                ? "calc(100% + calc(var(--grid-col-gap) / 2))"
                : "100%") +
            ";" +
            " left: 0;" +
            " }",

            // Last row: clamp vertical dividers and remove horizontal bottom dividers
            selector +
            " .loop-container:has(> .loop-card:nth-of-type(" +
            (n + 1) +
            ")) > .loop-card:nth-last-of-type(-n+" +
            last +
            "):after {" +
            " height: calc(100% + calc(var(--grid-row-gap, var(--grid-col-gap)) / 2)) !important;" +
            " top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2));" +
            " }",

            selector +
            " .loop-container > .loop-card:nth-last-of-type(-n+" +
            last +
            "):before {" +
            " content: none !important;" +
            " }",
        ].join("\n");
    };

    const styleChunks = [];

    breakpointConfigs.forEach((config, index) => {
        const {value, cols} = config;
        const lastCount = getLastRowCount(cols);

        if (cols <= 0 || lastCount <= 0) {
            return;
        }

        const isFirst = index === 0;
        const isLast = index === breakpointConfigs.length - 1;

        // For middle tiers, min is current, max is next
        const mediaMin = isFirst ? null : value;
        const mediaMax = isLast ? null : breakpointConfigs[index + 1]?.value;

        const rules = buildRulesForCols(cols, lastCount);
        styleChunks.push(wrapWithMedia(rules, mediaMin, mediaMax));
    });

    if (!styleChunks.length) {
        return;
    }

    const styleCss = styleChunks.join("\n\n");

    const styleTag = document.createElement("style");
    const styleSelector = [uniqueId, "divider-styles"].join("-");

    // Remove any existing tag for this instance
    document.querySelectorAll("." + styleSelector).forEach((tag) => tag.remove());

    styleTag.classList.add(styleSelector);
    styleTag.textContent = styleCss;

    document.head.appendChild(styleTag);

    element.classList.add("--divider");
}