import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from 'Components/Style';
import {useEffect, useMemo} from "@wordpress/element";
import {getCSSFromStyle, normalizeGapVal} from "Includes/helper";

const selector = "wpbs-layout-grid-container";

const getClassNames = (attributes = {}, styleData) => {
    const {"wpbs-layout-grid-container": settings} = attributes;

    return [
        selector,
        'loop-container w-full flex flex-wrap relative z-20',
        "block",
        "relative",
    ]
        .filter(Boolean)
        .join(' ');
};

function buildGapCSS(attributes) {
    const style = attributes?.["wpbs-style"] || {};
    const baseGap = attributes?.style?.spacing?.blockGap || {};

    const css = {
        props: {},
        breakpoints: {},
    };

    /* -------------------------
       BASE GAP
    ------------------------- */
    const baseTop = getCSSFromStyle(normalizeGapVal(baseGap.top));
    const baseLeft = getCSSFromStyle(normalizeGapVal(baseGap.left));

    if (baseTop) {
        css.props["--grid-row-gap"] = baseTop;
    }

    if (baseLeft) {
        css.props["--grid-col-gap"] = baseLeft;
    }

    /* -------------------------
       BREAKPOINT GAPS
    ------------------------- */
    const bps = style.breakpoints || {};

    Object.entries(bps).forEach(([bpKey, bpData]) => {
        const gap = bpData?.style?.spacing?.blockGap || {};

        const bpTop = getCSSFromStyle(normalizeGapVal(gap.top));
        const bpLeft = getCSSFromStyle(normalizeGapVal(gap.left));

        // skip empty breakpoint
        if (!bpTop && !bpLeft) return;

        css.breakpoints[bpKey] = {
            props: {}
        };

        if (bpTop) {
            css.breakpoints[bpKey].props["--grid-row-gap"] = bpTop;
        }

        if (bpLeft) {
            css.breakpoints[bpKey].props["--grid-column-gap"] = bpLeft;
        }
    });

    return css;
}


registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        "wpbs-layout-grid-container": {
            type: "object",
            default: {},
        },
    },

    edit: withStyle(
        (props) => {
            const {attributes, setAttributes, styleData, BlockWrapper, setCss, context} = props;
            const classNames = getClassNames(attributes, styleData);

            const {'wpbs/isLoop': isLoopFromContext, 'wpbs/query': query} = context;

            // Only update attributes if different
            useEffect(() => {
                if (attributes.isLoop !== isLoopFromContext) {
                    setAttributes({isLoop: isLoopFromContext});
                }
            }, [isLoopFromContext, attributes.isLoop, setAttributes]);

            const gapCss = useMemo(() => buildGapCSS(attributes), [
                JSON.stringify(attributes?.style?.spacing?.blockGap),
                attributes?.['wpbs-style']
            ]);

            useEffect(() => {
                setCss(gapCss);
            }, [gapCss]);

            return (
                <BlockWrapper props={props} className={classNames}/>
            );
        },
        {
            hasChildren: true,
            hasBackground: false
        }
    ),
    save: withStyleSave((props) => {
        const {attributes, styleData, BlockWrapper} = props;
        const classNames = getClassNames(attributes, styleData);

        const isLoop = !!attributes?.isLoop;

        return (
            !!isLoop ? <BlockWrapper
                props={props}
                className={classNames}
            >
                {'%%__BLOCK_CONTENT_AREA__%%'}
            </BlockWrapper> : <BlockWrapper
                props={props}
                className={classNames}
            />
        );
    }, {
        hasChildren: true,
        hasBackground: false
    }),
});
