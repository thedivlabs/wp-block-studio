import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from 'Components/Style';
import {useEffect, useMemo} from "@wordpress/element";
import {getCSSFromStyle, normalizeGapVal} from "Includes/helper";

const selector = "wpbs-layout-grid-container";

const LoopPlaceholders = ({count = 0}) => {
    if (!count || count < 1) return null;

    const items = [];
    for (let i = 0; i < count; i++) {
        items.push(
            <div
                key={`placeholder-${i}`}
                className="loop-card --placeholder"
                aria-hidden="true"
                style={{width: '100%'}}
            />
        );
    }

    return <>{items}</>;
};

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

            const {attributes, styleData, BlockWrapper, setCss, context} = props;
            const classNames = getClassNames(attributes, styleData);

            const {'wpbs/isLoop': isLoop, 'wpbs/query': query} = context;

            const gapCss = useMemo(() => buildGapCSS(attributes), [JSON.stringify(attributes?.style?.spacing?.blockGap), attributes?.['wpbs-style']]);

            useEffect(() => {
                setCss(gapCss);
            }, [gapCss])

            return (
                <>
                    <BlockWrapper
                        props={props}
                        className={classNames}
                    >
                        {/*{isLoop && query?.posts_per_page && (
                            <LoopPlaceholders
                                count={Math.max(parseInt((query?.posts_per_page || 0), 10) - 1, 0)}
                            />
                        )}*/}
                    </BlockWrapper>
                </>
            );
        }, {
            hasChildren: true
        }),

    save: withStyleSave((props) => {
        const {attributes, styleData, BlockWrapper} = props;
        const classNames = getClassNames(attributes, styleData);

        return (
            <BlockWrapper
                props={props}
                className={classNames}
            />
        );
    }, {
        hasChildren: true
    }),
});
