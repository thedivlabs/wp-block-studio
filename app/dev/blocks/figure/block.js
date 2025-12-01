import "./scss/block.scss";

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {FigureInspector} from "./controls";
import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from "Components/Style";
import {useCallback, useEffect, useMemo} from "@wordpress/element";
import ResponsivePicture from "Components/ResponsivePicture";
import {getAnchorProps} from "Components/Link";
import {cleanObject, resolveFeaturedMedia} from "Includes/helper";
import {getBreakpointPropsList, anyProp, hasAnyImage} from "./utils";
import {isEqual} from "lodash";

const selector = "wpbs-figure";

/**
 * Normalize wpbs-figure shape into { props, breakpoints }
 * Supports legacy flat format.
 */
const normalizeSettings = (raw) => {
    if (raw && (raw.props || raw.breakpoints)) {
        return {
            props: raw.props || {},
            breakpoints: raw.breakpoints || {},
        };
    }

    return {
        props: raw || {},
        breakpoints: {},
    };
};

const getClassNames = (attributes = {}, settings = {}) => {
    const base = settings.props || {};
    const bpPropsList = getBreakpointPropsList(settings);
    const hasImage = hasAnyImage(base, bpPropsList);

    return [
        selector,
        attributes.uniqueId ?? "",
        "h-fit w-fit max-w-full max-h-full flex",

        anyProp(base, bpPropsList, "contain") ? "--contain" : null,
        anyProp(base, bpPropsList, "blend") ? "--blend" : null,
        anyProp(base, bpPropsList, "overlay") ? "--overlay" : null,
        anyProp(base, bpPropsList, "origin") ? "--origin" : null,

        !hasImage ? "--empty" : null,
    ]
        .filter(Boolean)
        .join(" ");
};

function renderFigureContent(settings, attributes, isEditor = false) {
    const baseProps = settings?.props || {};
    const bpMap = settings?.breakpoints || {};

    const wrapWithLink = (content) => {
        const link = baseProps.link;
        if (!link) return content;

        return !isEditor ? (
            <a {...getAnchorProps(link)}>{content}</a>
        ) : (
            <a>{content}</a>
        );
    };

    const finalSettings = {
        props: {...baseProps},
        breakpoints: {},
    };

    // -------------------------
    // BASE IMAGE LOGIC
    // -------------------------
    const baseType = baseProps.type;
    const baseRes = (baseProps.resolution || "large").toUpperCase();

    finalSettings.props.image = resolveFeaturedMedia({
        type: baseType,
        media: baseProps.image,
        resolution: baseRes,
        isEditor,
    });

    // -------------------------
    // BREAKPOINT IMAGE LOGIC
    // -------------------------
    Object.entries(bpMap).forEach(([bpKey, bpEntry]) => {
        const bpProps = bpEntry?.props || {};
        const bpType = bpProps.type || baseProps.type;
        const bpRes = (
            bpProps.resolution ||
            baseProps.resolution ||
            "large"
        ).toUpperCase();

        const imageObj = resolveFeaturedMedia({
            type: bpType,
            media: bpProps.image || baseProps.image,
            resolution: bpRes,
            isEditor,
        });

        finalSettings.breakpoints[bpKey] = {
            props: {
                ...bpProps,
                image: imageObj,
            },
        };
    });

    const content = (
        <ResponsivePicture
            settings={finalSettings}
            editor={!!isEditor}
        />
    );

    return wrapWithLink(content);
}

function getCssProps(settings) {
    const baseProps = settings?.props || {};
    const breakpoints = settings?.breakpoints || {};

    const overlay = baseProps.overlay ?? null;
    const origin = baseProps.origin ?? null;
    const blend = baseProps.blend ?? null;
    const contain = baseProps.contain ?? null;

    const css = {
        props: {
            "--overlay": overlay,
            "--origin": origin,
            "--blend": blend,
            "--contain": contain,
        },
        breakpoints: {},
    };

    Object.entries(breakpoints).forEach(([bpKey, bpEntry = {}]) => {
        const bpProps = bpEntry?.props || {};

        const bpOverlay = bpProps.overlay ?? null;
        const bpOrigin = bpProps.origin ?? null;
        const bpBlend = bpProps.blend ?? null;
        const bpContain = bpProps.contain ?? null;

        css.breakpoints[bpKey] = {
            props: {
                "--overlay": bpOverlay,
                "--origin": bpOrigin,
                "--blend": bpBlend,
                "--contain": bpContain,
            },
        };
    });

    return cleanObject(css);
}

function getPreload(settings) {
    const preloadObj = [];

    const baseProps = settings?.props || {};
    const breakpoints = settings?.breakpoints || {};

    if (!baseProps.eager) return preloadObj;

    // Base image
    const baseImage = baseProps.image;
    if (baseImage?.id && !baseImage.isPlaceholder) {
        preloadObj.push({
            id: baseImage.id,
            type: "image",
        });
    }

    // Breakpoint images
    for (const [bpKey, bpEntry] of Object.entries(breakpoints)) {
        const bpProps = bpEntry?.props || {};
        const bpImage = bpProps.image;

        if (bpImage?.id && !bpImage.isPlaceholder) {
            preloadObj.push({
                id: bpImage.id,
                type: "image",
                breakpoint: bpKey,
            });
        }
    }

    return preloadObj;
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        "wpbs-figure": {
            type: "object",
            default: {},
        },
    },

    edit: withStyle((props) => {
        const {
            attributes,
            BlockWrapper,
            setCss,
            setPreload,
            setAttributes,
        } = props;

        const rawSettings = attributes["wpbs-figure"] || {};

        const settings = useMemo(
            () => normalizeSettings(rawSettings),
            [rawSettings]
        );

        const classNames = getClassNames(attributes, settings);

        // ---------------------------------------------------------
        // SEND CSS + PRELOAD TO HOC (mirrors video block)
        // ---------------------------------------------------------
        useEffect(() => {
            setCss(getCssProps(settings));
            setPreload(getPreload(settings));
        }, [settings, setCss, setPreload]);

        const updateSettings = useCallback(
            (nextValue) => {
                const normalized = normalizeSettings(nextValue);
                if (!isEqual(settings, normalized)) {
                    setAttributes({
                        "wpbs-figure": normalized,
                    });
                }
            },
            [settings, setAttributes]
        );

        const inspectorPanel = useMemo(
            () => (
                <FigureInspector
                    attributes={attributes}
                    updateSettings={updateSettings}
                />
            ),
            [attributes, updateSettings]
        );

        return (
            <>
                {inspectorPanel}

                <BlockWrapper
                    props={props}
                    className={classNames}
                >
                    {renderFigureContent(settings, attributes, true)}
                </BlockWrapper>
            </>
        );
    }, {
        tagName: "figure",
    }),

    save: withStyleSave((props) => {
        const {attributes, BlockWrapper} = props;

        const rawSettings = attributes["wpbs-figure"] || {};
        const settings = normalizeSettings(rawSettings);
        const classNames = getClassNames(attributes, settings);

        return (
            <BlockWrapper
                props={props}
                className={classNames}
            >
                {renderFigureContent(settings, attributes, false)}
            </BlockWrapper>
        );
    }, {
        tagName: "figure",
    }),
});
