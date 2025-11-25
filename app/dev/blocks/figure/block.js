import './scss/block.scss'

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {FigureInspector} from './controls';
import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from 'Components/Style';
import {useCallback, useEffect, useMemo} from "@wordpress/element";
import ResponsivePicture from "Components/ResponsivePicture";
import {getAnchorProps} from "Components/Link";
import {cleanObject, resolveFeaturedMedia} from "Includes/helper";
import {
    getBreakpointPropsList,
    anyProp,
    hasAnyImage,
} from "./utils";

const selector = "wpbs-figure";

const getClassNames = (attributes = {}, styleData) => {
    const raw = attributes["wpbs-figure"] || {};
    const base = raw.props || {};

    const bpPropsList = getBreakpointPropsList(raw);
    const hasImage = hasAnyImage(base, bpPropsList);

    return [
        selector,
        "h-fit w-fit max-w-full max-h-full flex",

        anyProp(base, bpPropsList, "contain") ? "--contain" : null,
        anyProp(base, bpPropsList, "blend") ? "--blend" : null,
        anyProp(base, bpPropsList, "overlay") ? "--overlay" : null,
        anyProp(base, bpPropsList, "origin") ? "--origin" : null,

        !hasImage ? "--empty" : null,

        attributes.uniqueId ?? "",
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

        return !isEditor
            ? <a {...getAnchorProps(link)}>{content}</a>
            : <a>{content}</a>;
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
        const bpProps = bpEntry.props || {};
        const bpType = bpProps.type || baseProps.type;
        const bpRes = (bpProps.resolution || baseProps.resolution || "large").toUpperCase();

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
            }
        };

    });

    // ============================================================
    // Pass to ResponsivePicture
    // ============================================================

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

    // ----- base props (no breakpoint) -----
    const overlay = baseProps.overlay ?? null;
    const origin = baseProps.origin ?? null;
    const blend = baseProps.blend ?? null;

    const css = {
        props: {
            "--overlay": overlay,
            "--origin": origin,
            "--blend": blend,
        },
        breakpoints: {},
    };

    // ----- breakpoint overrides -----
    Object.entries(breakpoints).forEach(([bpKey, bpEntry = {}]) => {
        const bpProps = bpEntry.props || {};

        const bpOverlay = bpProps.overlay ?? null;
        const bpOrigin = bpProps.origin ?? null;
        const bpBlend = bpProps.blend ?? null;
        const bpContain = bpProps.contain

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

    edit: withStyle(
        (props) => {

            const {attributes, styleData, BlockWrapper, setCss, setPreload, setAttributes} = props;

            const {'wpbs-figure': settings = {}} = attributes;

            const classNames = getClassNames(attributes, styleData);

            // ---------------------------------------------------------
            // SEND CSS + PRELOAD TO HOC
            // ---------------------------------------------------------
            useEffect(() => {
                setCss(getCssProps(settings));
                setPreload(getPreload(settings));   // ← uniqueId removed
            }, [settings]);

            const updateSettings = useCallback((newValue) => {
                const result = {
                    ...settings,
                    ...newValue,
                };

                setAttributes({
                    'wpbs-figure': result
                });
            }, [setAttributes, settings]);

            const inspectorPanel = useMemo(() => (
                <FigureInspector
                    attributes={attributes}
                    updateSettings={updateSettings}
                />
            ), [settings]);

            return (
                <>
                    {inspectorPanel}

                    <BlockWrapper
                        props={props}
                        className={classNames}
                        hasBackground={true}
                        tagName="figure"
                    >
                        {renderFigureContent(settings, attributes, true)}
                    </BlockWrapper>
                </>
            );

        }),


    save: withStyleSave((props) => {
        const {attributes, styleData, BlockWrapper} = props;
        const settings = attributes["wpbs-figure"] || {};
        const classNames = getClassNames(attributes, styleData);

        return (
            <BlockWrapper
                props={props}
                className={classNames}
                hasBackground={true}
                tagName="figure"
            >
                {renderFigureContent(settings, attributes, false)}
            </BlockWrapper>
        );
    }),


});
