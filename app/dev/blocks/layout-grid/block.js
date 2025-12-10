import "./scss/block.scss";

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {InnerBlocks, InspectorControls} from "@wordpress/block-editor";

import {
    PanelBody,
    TextControl,
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl,
    ToggleControl,
    TabPanel, SelectControl,
} from "@wordpress/components";

import {useCallback, useEffect, useMemo} from "@wordpress/element";
import {isEqual} from "lodash";

import {cleanObject} from "Includes/helper";
import {LOOP_ATTRIBUTES, Loop} from "Components/Loop";
import {GALLERY_ATTRIBUTES, MediaGalleryControls} from "Components/MediaGallery";

import {
    STYLE_ATTRIBUTES,
    withStyle,
    withStyleSave,
} from "Components/Style";

import {BreakpointPanels} from "Components/BreakpointPanels";
import {DividerOptions} from "Components/DividerOptions";

const selector = "wpbs-layout-grid";


/* --------------------------------------------------------------
 * Normalize wpbs-grid settings
 * Must preserve props, breakpoints, AND query, AND divider.
 * -------------------------------------------------------------- */
const normalizeGridSettings = (raw) => {
    if (
        raw &&
        (raw.props ||
            raw.breakpoints ||
            raw.query ||
            raw.divider)
    ) {
        return {
            props: raw.props || {},
            breakpoints: raw.breakpoints || {},
            query: raw.query || {},
            divider: raw.divider || {},
        };
    }

    // Legacy flat shape
    return {
        props: raw || {},
        breakpoints: {},
        query: {},
        divider: {},
    };
};

/* --------------------------------------------------------------
 * Class names
 * -------------------------------------------------------------- */
const getClassNames = (attributes = {}, settings = {}, isGallery, isMasonry, isLoop) => {
    const base = settings.props || {};
    const bpMap = settings.breakpoints || {};

    return [
        selector,
        attributes.uniqueId ?? "",
        "w-full flex relative",
        isLoop ? '--loop' : null,
        isGallery ? '--gallery' : null,
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

    const css = {
        props: {},
        breakpoints: {},
    };

    // Base columns
    const baseColumns = baseProps.columns ?? null;
    if (baseColumns != null) {
        css.props["--columns"] = baseColumns;
        css.props["--divider"] = Object.values(settings?.divider?.border ?? {}).join(' ');
    }

    // Breakpoint columns
    Object.entries(breakpoints).forEach(([bpKey, bpEntry = {}]) => {
        const bpProps = bpEntry?.props || {};
        const bpColumns = bpProps.columns ?? null;

        if (bpColumns == null) return; // skip empty bps

        css.breakpoints[bpKey] = {
            props: {
                "--columns": bpColumns,
            },
        };
    });

    return cleanObject(css);
};


/* --------------------------------------------------------------
 * Breakpoint Renderers
 * -------------------------------------------------------------- */

const GridBaseRenderer = ({entry, update}) => {
    const props = entry?.props || {};

    return (
        <Grid columns={2} columnGap={10} rowGap={10} style={{padding: '14px'}}>
            <NumberControl
                label="Columns"
                value={props.columns ?? 3}
                onChange={(val) =>
                    update({
                        props: {
                            columns: parseInt(val, 10) || 1,
                        },
                    })
                }
                min={1}
                max={6}
                __next40pxDefaultSize
            />
        </Grid>
    );
};
const GridBreakpointRenderer = ({entry, update}) => {
    const props = entry?.props || {};

    return (
        <Grid columns={2} columnGap={10} rowGap={10} style={{padding: '14px'}}>
            <NumberControl
                label="Columns"
                value={props.columns ?? ""}
                onChange={(val) => {
                    if (val === "") {
                        update({}); // no change
                    } else {
                        update({
                            props: {
                                columns: parseInt(val, 10) || 1,
                            },
                        });
                    }
                }}
                min={1}
                max={6}
                __next40pxDefaultSize
            />
        </Grid>
    );
};
/* --------------------------------------------------------------
 * BLOCK REGISTRATION
 * -------------------------------------------------------------- */
registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        ...GALLERY_ATTRIBUTES,
        ...LOOP_ATTRIBUTES,
    },

    /* ----------------------------------------------------------
     * EDIT
     * ---------------------------------------------------------- */
    edit: withStyle((props) => {
        const {
            attributes,
            BlockWrapper,
            setCss,
            setAttributes,
        } = props;

        const rawGrid = attributes["wpbs-grid"] || {};
        const gridSettings = useMemo(
            () => normalizeGridSettings(rawGrid),
            [rawGrid]
        );

        const isLoop = (attributes?.className ?? "").includes("is-style-loop");
        const isGallery = (attributes?.className ?? "").includes("is-style-gallery");
        const isMasonry = (attributes?.className ?? "").includes("is-style-masonry");

        const classNames = getClassNames(attributes, gridSettings, isLoop, isGallery, isMasonry);

        /* --------------------------------------------
         * Sync CSS + Preload
         * -------------------------------------------- */
        useEffect(() => {
            setCss(getCssProps(gridSettings));
        }, [gridSettings, setCss]);

        /* --------------------------------------------
         * Unified updater
         * -------------------------------------------- */
        const updateGridSettings = useCallback(
            (nextValue) => {
                const normalized = normalizeGridSettings(nextValue);
                if (!isEqual(gridSettings, normalized)) {
                    setAttributes({"wpbs-grid": normalized});
                }
            },
            [gridSettings, setAttributes]
        );

        const updateQuerySettings = useCallback(
            (nextValue) => {
                const cleaned = cleanObject(nextValue || {}, false);
                const current = gridSettings.query || {};

                if (!isEqual(current, cleaned)) {
                    updateGridSettings({
                        ...gridSettings,
                        query: cleaned,
                    });
                }
            },
            [gridSettings, updateGridSettings]
        );

        /* --------------------------------------------
         * Tabs Content
         * -------------------------------------------- */

        const tabLoop = useMemo(
            () => (
                <Grid
                    columns={1}
                    columnGap={10}
                    rowGap={16}
                >
                    <Loop
                        attributes={attributes}
                        setAttributes={setAttributes}
                        enabled={isLoop}
                    />
                </Grid>
            ),
            [gridSettings?.query, updateQuerySettings]
        );

        const tabDivider = useMemo(
            () => (
                <DividerOptions
                    value={gridSettings.divider}
                    onChange={(next) => {

                        updateGridSettings({
                            ...gridSettings,
                            divider: next,
                        })
                    }

                    }
                    props={props}
                />
            ),
            [gridSettings, updateGridSettings, props]
        );

        const tabGallery = useMemo(
            () => (
                <MediaGalleryControls
                    attributes={attributes}
                    setAttributes={setAttributes}
                    enabled={isGallery}
                />
            ),
            [gridSettings, updateGridSettings, props]
        );

        /* --------------------------------------------
         * Inspector Controls
         * -------------------------------------------- */
        const inspectorPanel = (
            <PanelBody
                title="Grid"
                group="styles"
                initialOpen={false}
                className="wpbs-block-controls is-style-unstyled"
            >
                <div className="wpbs-block-settings">
                    <TabPanel
                        className="wpbs-editor-tabs wpbs-block-settings__panel"
                        initialTabName="divider"
                        tabs={[
                            {name: "divider", title: "Divider"},
                            ...(isLoop ? [{name: "loop", title: "Loop"}] : []),
                            ...(isGallery ? [{name: "gallery", title: "Gallery"}] : []),
                        ]}
                    >
                        {(tab) => {
                            switch (tab.name) {
                                case "loop":
                                    return isLoop ? tabLoop : null;
                                case "divider":
                                    return tabDivider;
                                case "gallery":
                                    return tabGallery;
                            }
                        }}
                    </TabPanel>
                </div>
                {/* Breakpoints BELOW tabs */}
                <BreakpointPanels
                    value={gridSettings}
                    onChange={updateGridSettings}
                    label="Grid Layout"
                    render={{
                        base: GridBaseRenderer,
                        breakpoints: GridBreakpointRenderer,
                    }}
                />
            </PanelBody>
        );

        return (
            <>
                <InspectorControls group="styles">
                    {inspectorPanel}
                </InspectorControls>

                <BlockWrapper
                    props={props}
                    className={classNames}
                >
                </BlockWrapper>
            </>
        );
    }, {
        hasBackground: false,
        hasChildren: true
    }),

    /* ----------------------------------------------------------
     * SAVE
     * ---------------------------------------------------------- */
    save: withStyleSave((props) => {
        const {attributes, BlockWrapper} = props;

        const gridSettings = normalizeGridSettings(
            attributes["wpbs-grid"] || {}
        );

        const isLoop = (attributes?.className ?? "").includes("is-style-loop");
        const isGallery = (attributes?.className ?? "").includes("is-style-gallery");
        const isMasonry = (attributes?.className ?? "").includes("is-style-masonry");

        const classNames = getClassNames(attributes, gridSettings, isGallery, isMasonry, isLoop);

        const blockExtraProps = {
            divider: gridSettings.divider || {},
            breakpoints: gridSettings.breakpoints || {},
            uniqueId: attributes.uniqueId || null,
            props: gridSettings.props || {}
        };

        if (isLoop) {
            blockExtraProps.query = gridSettings.query || {};
        }

        return (
            <BlockWrapper
                props={props}
                className={classNames}
                {...{
                    "data-wp-interactive": "wpbs/layout-grid",
                    "data-wp-init": "actions.init",
                    "data-wp-context": JSON.stringify(blockExtraProps),
                }}
            >
                <InnerBlocks.Content/>

            </BlockWrapper>
        );
    }, {
        hasBackground: false,
        hasChildren: true
    }),
});