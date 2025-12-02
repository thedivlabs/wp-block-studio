export function gridDividers(element, args = {}, uniqueId = false) {
    if (!element || !uniqueId) return;

    const { divider } = args;
    if (!divider) return;
console.log(args);
    // Base columns ONLY (no breakpoints)
    const colBase = parseInt(args?.props?.columns ?? "3");

    const container = element.querySelector(":scope > .loop-container");
    if (!container) return;

    const cards = container.querySelectorAll(".loop-card");
    const total = cards.length;

    const selector = "." + uniqueId;

    // Base-only last row count
    const lastRowBase =
        Math.floor(total - Math.floor(total / colBase) * colBase) || colBase;

    // --------------------------------------------------------------
    // Base-only divider CSS (NO media queries)
    // --------------------------------------------------------------
    const styleCss = [
        `${selector} .loop-container > .loop-card:nth-of-type(${colBase}n+1):after { 
            content: none !important; 
        }`,

        `${selector} .loop-container > .loop-card:nth-of-type(n+${colBase + 1}):after { 
            height: calc(100% + (var(--grid-row-gap, var(--grid-col-gap)) / 2));
            top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2));
        }`,

        `${selector} .loop-container:has(> .loop-card:nth-of-type(${colBase + 1})) > .loop-card:before { 
            content: ""; 
        }`,

        `${selector} .loop-container:has(> .loop-card:nth-of-type(${colBase + 1})) 
            > .loop-card:nth-of-type(-n+${colBase + 1}):after { 
            height: calc(100% + (var(--grid-row-gap, var(--grid-col-gap)) / 2));
            top: 0;
        }`,

        `${selector} .loop-container:has(> .loop-card:nth-of-type(${colBase + 1})) 
            > .loop-card:nth-of-type(n+${colBase + 2}):after { 
            height: calc(100% + var(--grid-row-gap, var(--grid-col-gap, 0px)));
            top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2));
        }`,

        `${selector} .loop-container > .loop-card:nth-of-type(${colBase}n):before {
            width: calc(100% + calc(var(--grid-col-gap) / 2));
        }`,

        `${selector} .loop-container > .loop-card:nth-of-type(${colBase}n+1):before {
            width: ${colBase > 1 ?
            "calc(100% + calc(var(--grid-col-gap) / 2))" :
            "100%"};
            left: 0;
        }`,

        `${selector} .loop-container:has(> .loop-card:nth-of-type(${colBase + 1})) 
            > .loop-card:nth-last-of-type(-n+${lastRowBase}):after {
            height: calc(100% + calc(var(--grid-row-gap, var(--grid-col-gap)) / 2)) !important;
            top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2));
        }`,

        `${selector} .loop-container > .loop-card:nth-last-of-type(-n+${lastRowBase}):before { 
            content: none !important; 
        }`,
    ].join("\n");

    // Inject style tag
    const styleTag = document.createElement("style");
    const styleSelector = `${uniqueId}-divider-styles`;

    [...document.querySelectorAll("." + styleSelector)].forEach(t => t.remove());

    styleTag.classList.add(styleSelector);
    styleTag.textContent = styleCss;

    document.head.appendChild(styleTag);

    element.classList.add("--divider");
}