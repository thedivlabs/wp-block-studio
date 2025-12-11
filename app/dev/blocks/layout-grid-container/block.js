import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from 'Components/Style';
import {useEffect, useMemo} from "@wordpress/element";
import {getCSSFromStyle, normalizeGapVal} from "Includes/helper";

const selector = "wpbs-layout-grid-container";

/* --------------------------------------------------------------
 * Class Names (simple like slider wrapper)
 * -------------------------------------------------------------- */
const getClassNames = (attributes = {}, styleData) => {
    return [
        selector,
        "grid-container",
        "w-full",
        "flex",
        "flex-wrap",
        "relative",
        "z-20",
        "block"
    ].join(" ");
};

/* --------------------------------------------------------------
 * GAP CSS Builder (your original logic untouched)
 * -------------------------------------------------------------- */
function buildGapCSS(attributes) {
    const style = attributes?.["wpbs-style"] || {};
    const baseGap = attributes?.style?.spacing?.blockGap || {};

    const css = {
        props: {},
        breakpoints: {},
    };

    // Base
    const baseTop = getCSSFromStyle(normalizeGapVal(baseGap.top));
    const baseLeft = getCSSFromStyle(normalizeGapVal(baseGap.left));

    if (baseTop) css.props["--grid-row-gap"] = baseTop;
    if (baseLeft) css.props["--grid-col-gap"] = baseLeft;

    // Breakpoints
    const bps = style.breakpoints || {};

    Object.entries(bps).forEach(([bpKey, bpData]) => {
        const gap = bpData?.style?.spacing?.blockGap || {};
        const bpTop = getCSSFromStyle(normalizeGapVal(gap.top));
        const bpLeft = getCSSFromStyle(normalizeGapVal(gap.left));

        if (!bpTop && !bpLeft) return;

        css.breakpoints[bpKey] = {props: {}};

        if (bpTop) css.breakpoints[bpKey].props["--grid-row-gap"] = bpTop;
        if (bpLeft) css.breakpoints[bpKey].props["--grid-column-gap"] = bpLeft;
    });

    return css;
}


/* --------------------------------------------------------------
 * BLOCK REGISTRATION — simplified like slider wrapper
 * -------------------------------------------------------------- */
registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,

        // Keep container-specific attrs
        "wpbs-layout-grid-container": {
            type: "object",
            default: {},
        },
    },

    /* ----------------------------------------------------------
     * EDIT
     * ---------------------------------------------------------- */
    edit: withStyle((props) => {
        const {attributes, BlockWrapper, styleData, setCss, context, setAttributes} = props;

        const classNames = getClassNames(attributes, styleData);

        const gapCss = useMemo(() => buildGapCSS(attributes), [
            JSON.stringify(attributes?.style?.spacing?.blockGap),
            attributes?.["wpbs-style"],
        ]);

        const {'wpbs/isGallery': isGallery, 'wpbs/isLoop': isLoop} = context;


        useEffect(() => {
            const next = {
                isLoop,
                isGallery
            };

            if (
                next.isLoop !== attributes.isLoop ||
                next.isGallery !== attributes.isGallery
            ) {
                setAttributes(next);
            }
        }, [isLoop, isGallery]);

        useEffect(() => {
            setCss(gapCss);
        }, [gapCss]);

        return (
            <BlockWrapper
                props={props}
                className={classNames}
            />
        );
    }, {
        hasChildren: true,
        hasBackground: false,
    }),

    /* ----------------------------------------------------------
     * SAVE — no loop condition, same as slider wrapper
     * ---------------------------------------------------------- */
    save: withStyleSave((props) => {
        const {attributes, BlockWrapper, styleData} = props;

        const classNames = getClassNames(attributes, styleData);

        return (
            <BlockWrapper
                props={props}
                className={classNames}
            />
        );
    }, {
        hasChildren: true,
        hasBackground: false,
    }),
});
