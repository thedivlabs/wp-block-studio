// block.js

import "./scss/block.scss";

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {InnerBlocks, InspectorControls} from "@wordpress/block-editor";
import {PanelBody} from "@wordpress/components";
import {useCallback, useEffect, useMemo} from "@wordpress/element";
import {isEqual} from "lodash";

import {cleanObject} from "Includes/helper";
import {LOOP_ATTRIBUTES, Loop} from "Components/Loop";
import {GALLERY_ATTRIBUTES, MediaGalleryControls} from "Components/MediaGallery";
import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from "Components/Style";

import {GridInspector, normalizeGridSettings} from "./controls";

const selector = "wpbs-layout-grid";

/* --------------------------------------------------------------
 * Class Names (fixed argument order)
 * -------------------------------------------------------------- */
const getClassNames = (attributes = {}, settings = {}, isLoop, isGallery, isMasonry) => {
    return [
        selector,
        attributes.uniqueId ?? "",
        "w-full flex relative",
        isLoop ? "--loop" : null,
        isGallery ? "--gallery" : null,
        isMasonry ? "--masonry" : null,
    ]
        .filter(Boolean)
        .join(" ");
};

/* --------------------------------------------------------------
 * CSS Builder
 * -------------------------------------------------------------- */
const getCssProps = (settings) => {
    const baseProps = settings?.props || {};
    const breakpoints = settings?.breakpoints || {};

    const css = {props: {}, breakpoints: {}};

    const baseColumns = baseProps.columns ?? null;
    if (baseColumns != null) {
        css.props["--columns"] = baseColumns;
        css.props["--divider"] = Object.values(settings?.divider?.border ?? {}).join(" ");
    }

    Object.entries(breakpoints).forEach(([bpKey, bpEntry = {}]) => {
        const bpProps = bpEntry?.props || {};
        const bpColumns = bpProps.columns ?? null;
        if (bpColumns == null) return;
        css.breakpoints[bpKey] = {props: {"--columns": bpColumns}};
    });

    return cleanObject(css);
};

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        ...GALLERY_ATTRIBUTES,
        ...LOOP_ATTRIBUTES,
    },

    edit: withStyle((props) => {
        const {attributes, BlockWrapper, setCss, setAttributes} = props;

        const rawGrid = attributes["wpbs-grid"] || {};
        const gridSettings = useMemo(
            () => normalizeGridSettings(rawGrid),
            [rawGrid]
        );

        const className = attributes?.className ?? "";
        const isLoop = className.includes("is-style-loop");
        const isGallery = className.includes("is-style-gallery");
        const isMasonry = className.includes("is-style-masonry");

        const classNames = getClassNames(attributes, gridSettings, isLoop, isGallery, isMasonry);

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
            setCss(getCssProps(gridSettings));
        }, [gridSettings, setCss]);

        const updateGridSettings = useCallback(
            (nextValue) => {
                const normalized = normalizeGridSettings(nextValue);
                if (!isEqual(gridSettings, normalized)) {
                    setAttributes({"wpbs-grid": normalized});
                }
            },
            [gridSettings, setAttributes]
        );

        return (
            <>
                <InspectorControls group="styles">

                    {isLoop && (
                        <PanelBody title="Loop" initialOpen={false}>
                            <Loop attributes={attributes} setAttributes={setAttributes} enabled={isLoop}/>
                        </PanelBody>
                    )}

                    {isGallery && (
                        <PanelBody title="Gallery" initialOpen={false}>
                            <MediaGalleryControls attributes={attributes} setAttributes={setAttributes}
                                                  enabled={isGallery}/>
                        </PanelBody>
                    )}

                    {/* Grid Panels */}
                    <GridInspector
                        gridSettings={gridSettings}
                        updateGridSettings={updateGridSettings}
                        blockProps={props}
                    />

                </InspectorControls>

                <BlockWrapper props={props} className={classNames}/>
            </>
        );
    }, {
        hasBackground: false,
        hasChildren: true,
    }),

    save: withStyleSave((props) => {
        const {attributes, BlockWrapper} = props;

        const gridSettings = normalizeGridSettings(attributes["wpbs-grid"] || {});

        const className = attributes?.className ?? "";
        const isLoop = className.includes("is-style-loop");
        const isGallery = className.includes("is-style-gallery");
        const isMasonry = className.includes("is-style-masonry");

        const classNames = getClassNames(attributes, gridSettings, isLoop, isGallery, isMasonry);

        const blockExtraProps = {
            divider: gridSettings.divider || {},
            breakpoints: gridSettings.breakpoints || {},
            uniqueId: attributes.uniqueId || null,
            props: gridSettings.props || {}
        };

        // ❌ query removed — Loop/Gallery handle queries now

        return (
            <BlockWrapper
                props={props}
                className={classNames}
                data-wp-interactive="wpbs/layout-grid"
                data-wp-init="actions.init"
                data-wp-context={JSON.stringify(blockExtraProps)}
            >
                <InnerBlocks.Content/>
            </BlockWrapper>
        );
    }, {
        hasBackground: false,
        hasChildren: true
    }),
});
