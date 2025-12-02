export function gridDividers(element, args = {}, uniqueId = false) {
    if (!element || !uniqueId) return;

    const { divider, breakpoints: bpConfig = {} } = args;
    if (!divider) return;

    const container = element.querySelector(':scope > .loop-container');
    if (!container) return;

    const cards = container.querySelectorAll('.loop-card');
    const total = cards.length;
    if (total === 0) return;

    const selector = '.' + uniqueId;

    // Base columns (desktop) — keep current behavior
    const colBase = parseInt(args?.props?.columns ?? '3', 10) || 1;
    //    const colBase = parseInt(args?.props?.columns ?? "3");
    const lastRowBase = total % colBase || colBase;

    const themeBreakpoints = (window.WPBS?.settings?.breakpoints) || {};

    // Normalize theme breakpoint -> { key, sizeNumber, sizeCss, cols }
    const bpDefs = Object.entries(bpConfig)
        .map(([key, entry = {}]) => {
            const cols = parseInt(entry?.props?.columns ?? 1, 10) || 0;
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

        `${selector} .loop-container:has(> .loop-card:nth-of-type(${cols + 1})) 
            > .loop-card:nth-last-of-type(-n+${lastRow}):after {
            height: calc(100% + calc(var(--grid-row-gap, var(--grid-col-gap)) / 2)) !important;
            top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2));
        }`,

        `${selector} .loop-container > .loop-card:nth-last-of-type(-n+${lastRow}):before { 
            content: none !important; 
        }`,
    ];

    let styleCss = '';

    if (bpDefs.length === 0) {
        // ------------------------------------------
        // NO BREAKPOINTS — keep existing base-only behavior
        // ------------------------------------------
        styleCss = buildRules(colBase, lastRowBase).join('\n');
    } else if (bpDefs.length === 1) {
        // ------------------------------------------
        // ONE BREAKPOINT
        // < bp1 => bp1.cols
        // >= bp1 => base cols
        // ------------------------------------------
        const bp1 = bpDefs[0];
        const colMobile = bp1.cols;
        const lastRowMobile = total % colMobile || colMobile;

        styleCss = [
            `@media screen and (max-width: calc(${bp1.sizeCss} - 1px)) {`,
            ...buildRules(colMobile, lastRowMobile),
            `}`,

            `@media screen and (min-width: ${bp1.sizeCss}) {`,
            ...buildRules(colBase, lastRowBase),
            `}`,
        ].join('\n');
    } else {
        // ------------------------------------------
        // TWO OR MORE BREAKPOINTS
        // < bp1 => bp1.cols   (mobile)
        // bp1–bp2 => bp2.cols (small)
        // >= bp2 => base cols
        // ------------------------------------------
        const bp1 = bpDefs[0];
        const bp2 = bpDefs[1];

        const colMobile = bp1.cols;
        const colSmall = bp2.cols;

        const lastRowMobile = total % colMobile || colMobile;
        const lastRowSmall = total % colSmall || colSmall;

        styleCss = [
            `@media screen and (max-width: calc(${bp1.sizeCss} - 1px)) {`,
            ...buildRules(colMobile, lastRowMobile),
            `}`,

            `@media screen and (min-width: ${bp1.sizeCss}) and (max-width: calc(${bp2.sizeCss} - 1px)) {`,
            ...buildRules(colSmall, lastRowSmall),
            `}`,

            `@media screen and (min-width: ${bp2.sizeCss}) {`,
            ...buildRules(colBase, lastRowBase),
            `}`,
        ].join('\n');
    }

    // Inject style tag
    const styleTag = document.createElement('style');
    const styleSelector = `${uniqueId}-divider-styles`;

    [...document.querySelectorAll('.' + styleSelector)].forEach((t) => t.remove());

    styleTag.classList.add(styleSelector);
    styleTag.textContent = styleCss;

    document.head.appendChild(styleTag);

    element.classList.add('--divider');
}