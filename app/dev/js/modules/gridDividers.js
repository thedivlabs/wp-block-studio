export function gridDividers(element, args = {}, uniqueId = false) {
    if (!element || !uniqueId) return;

    const {divider, breakpoints: bpConfig = {}} = args;
    if (!divider) return;

    const container = element.querySelector(':scope > .loop-container');
    if (!container) return;

    const cards = container.querySelectorAll('.loop-card');
    const total = cards.length;
    if (total === 0) return;

    const selector = '.' + uniqueId;

    // Base columns (desktop) — from base props
    const colBase = parseInt(args?.props?.columns ?? '3', 10) || 1;
    const lastRowBase = total % colBase || colBase;

    const themeBreakpoints = (window.WPBS?.settings?.breakpoints) || {};

    // ------------------------------------------------------------------
    // Normalize theme + config breakpoints into sorted array:
    // [ { key, sizeNumber, sizeCss, cols }, ... ]   (smallest first)
    // ------------------------------------------------------------------
    const bpDefs = Object.entries(bpConfig)
        .map(([key, entry = {}]) => {
            const cols = parseInt(entry?.props?.columns ?? 0, 10) || 0;
            const raw = themeBreakpoints[key];

            // raw may be "768px", 768, or { size: 768 }
            let sizeValue = null;
            if (raw != null && typeof raw === 'object' && 'size' in raw) {
                sizeValue = raw.size;
            } else {
                sizeValue = raw;
            }

            let sizeNumber = 0;
            let sizeCss = '';

            if (typeof sizeValue === 'number') {
                sizeNumber = sizeValue;
                sizeCss = `${sizeValue}px`;
            } else if (typeof sizeValue === 'string') {
                sizeNumber = parseInt(sizeValue, 10) || 0;
                sizeCss = sizeValue;
            }

            return {
                key,
                sizeNumber,
                sizeCss,
                cols,
            };
        })
        .filter((bp) => bp.cols > 0 && bp.sizeCss) // must have columns + usable size
        .sort((a, b) => a.sizeNumber - b.sizeNumber); // smallest first

    // ------------------------------------------------------------------
    // Original rule generator (unchanged)
    // ------------------------------------------------------------------
    const buildRules = (cols, lastRow) => [
        `${selector} .loop-container > .loop-card:nth-of-type(${cols}n+1):after { 
        content: none !important; 
    }`,

        `${selector} .loop-container > .loop-card:nth-of-type(n+${cols + 1}):after { 
        height: calc(100% + (var(--grid-row-gap, var(--grid-col-gap)) / 2));
        top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2));
    }`,

        `${selector} .loop-container:has(> .loop-card:nth-of-type(${cols + 1})) > .loop-card:before { 
        content: ""; 
    }`,

        `${selector} .loop-container:has(> .loop-card:nth-of-type(${cols + 1})) 
        > .loop-card:nth-of-type(-n+${cols + 1}):after { 
        height: calc(100% + (var(--grid-row-gap, var(--grid-col-gap)) / 2));
        top: 0;
    }`,

        `${selector} .loop-container:has(> .loop-card:nth-of-type(${cols + 1})) 
        > .loop-card:nth-of-type(n+${cols + 2}):after { 
        height: calc(100% + var(--grid-row-gap, var(--grid-col-gap, 0px)));
        top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2));
    }`,

        `${selector} .loop-container > .loop-card:nth-of-type(${cols}n):before {
        width: calc(100% + calc(var(--grid-col-gap) / 2));
    }`,

        `${selector} .loop-container > .loop-card:nth-of-type(${cols}n+1):before {
        width: ${cols > 1
            ? 'calc(100% + calc(var(--grid-col-gap) / 2))'
            : '100%'};
        left: 0;
    }`,

        // HORIZONTAL LAST ROW
        `${selector} .loop-container:has(> .loop-card:nth-of-type(${cols + 1})) 
        > .loop-card:nth-last-of-type(-n+${lastRow}):after {
        height: calc(100% + calc(var(--grid-row-gap, var(--grid-col-gap)) / 2)) !important;
        top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2));
    }`,

        `${selector} .loop-container > .loop-card:nth-last-of-type(-n+${lastRow}):before { 
        content: none !important; 
    }`,

        // 🔥 NEW — REMOVE VERTICAL LINE + ICON FROM LAST ROW
        `${selector} .loop-container > .loop-card:nth-last-of-type(-n+${lastRow}):after {
        content: "" !important;
        border-left: none !important;
        height: 0 !important;
    }`,
    ];

    // ------------------------------------------------------------------
    // Build media queries for ANY number of breakpoints
    // ------------------------------------------------------------------
    let styleCss = '';

    if (bpDefs.length === 0) {
        // No breakpoints: global rules with base columns
        styleCss = buildRules(colBase, lastRowBase).join('\n');
    } else {
        const segments = [];

        // Segment 0: < first breakpoint  => first bp's columns
        {
            const bp0 = bpDefs[0];
            const cols = bp0.cols;
            const lastRow = total % cols || cols;

            segments.push({
                min: null,
                max: `calc(${bp0.sizeCss} - 1px)`,
                cols,
                lastRow,
            });
        }

        // Middle segments: between breakpoints
        for (let i = 0; i < bpDefs.length - 1; i++) {
            const bpCurrent = bpDefs[i];
            const bpNext = bpDefs[i + 1];

            // Convention: in range [bpCurrent, bpNext) we use bpNext's columns
            const cols = bpNext.cols;
            const lastRow = total % cols || cols;

            segments.push({
                min: bpCurrent.sizeCss,
                max: `calc(${bpNext.sizeCss} - 1px)`,
                cols,
                lastRow,
            });
        }

        // Final segment: >= last breakpoint => base columns
        {
            const lastBp = bpDefs[bpDefs.length - 1];
            segments.push({
                min: lastBp.sizeCss,
                max: null,
                cols: colBase,
                lastRow: lastRowBase,
            });
        }

        // Turn segments into @media blocks
        styleCss = segments
            .map(({min, max, cols, lastRow}) => {
                let open = '';
                if (min && max) {
                    open = `@media screen and (min-width: ${min}) and (max-width: ${max}) {`;
                } else if (!min && max) {
                    open = `@media screen and (max-width: ${max}) {`;
                } else if (min && !max) {
                    open = `@media screen and (min-width: ${min}) {`;
                } // no (min,max) case not used here

                const rules = buildRules(cols, lastRow).join('\n');
                const close = open ? '}' : '';

                return [open, rules, close].filter(Boolean).join('\n');
            })
            .join('\n');
    }

    // ------------------------------------------------------
// ICON CUSTOM PROPERTIES (applied globally to selector)
// ------------------------------------------------------
    if (divider?.icon) {
        const icon = divider.icon;

        // ensure the icon name becomes a valid CSS string for 'content'
        const iconContent = icon.name ? `"${icon.name}"` : '""';

        styleCss += `

/* Divider Icon Variables */
${selector} {
    --divider-icon: ${iconContent};
    --divider-icon-size: ${icon.size ? icon.size + 'px' : '1em'};
    --divider-icon-color: ${icon.color || 'currentColor'};
    --divider-icon-variation: ${icon.css || "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24'"};
    --divider-size: ${divider?.border?.width};
}
`;
    }

    // ------------------------------------------------------------------
    // Inject style tag (unchanged)
    // ------------------------------------------------------------------
    const styleTag = document.createElement('style');
    const styleSelector = `${uniqueId}-divider-styles`;

    [...document.querySelectorAll('.' + styleSelector)].forEach((t) => t.remove());

    styleTag.classList.add(styleSelector);
    styleTag.textContent = styleCss;

    document.head.appendChild(styleTag);

    element.classList.add('--divider');
}