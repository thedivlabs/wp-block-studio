import "./scss/block.scss";

import { registerBlockType } from "@wordpress/blocks";
import metadata from "./block.json";

import { InnerBlocks } from "@wordpress/block-editor";

import {
    PanelBody,
    TextControl,
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl,
    ToggleControl,
} from "@wordpress/components";

import { useCallback, useEffect, useMemo } from "@wordpress/element";
import { isEqual } from "lodash";

import { cleanObject } from "Includes/helper";

import {
    STYLE_ATTRIBUTES,
    withStyle,
    withStyleSave,
} from "Components/Style";

import { QueryConfigPanel } from "Components/QueryConfigPanel";
import { BreakpointPanels } from "Components/BreakpointPanels";

const selector = "wpbs-layout-grid";

/* --------------------------------------------------------------
 * Normalize wpbs-grid settings
 * Must preserve props, breakpoints, AND query.
 * -------------------------------------------------------------- */
const normalizeGridSettings = (raw) => {
    if (raw && (raw.props || raw.breakpoints || raw.query)) {
        return {
            props: raw.props || {},
            breakpoints: raw.breakpoints || {},
            query: raw.query || {},
        };
    }

    // Legacy flat shape
    return {
        props: raw || {},
        breakpoints: {},
        query: {},
    };
};

/* --------------------------------------------------------------
 * Class names
 * -------------------------------------------------------------- */
const getClassNames = (attributes = {}, settings = {}) => {
    const base = settings.props || {};
    const bpMap = settings.breakpoints || {};

    const isMasonry =
        base.masonry ||
        Object.values(bpMap).some((entry) => entry?.masonry);

    return [
        selector,
        attributes.uniqueId ?? "",
        "w-full flex relative",
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

    const baseColumns = baseProps.columns ?? null;
    const baseCentered = baseProps.centered ?? null;

    const css = {
        props: {
            "--columns": baseColumns,
            "--centered": baseCentered ? "1" : null,
        },
        breakpoints: {},
    };

    Object.entries(breakpoints).forEach(([bpKey, bpEntry = {}]) => {
        const bpProps = bpEntry || {};
        const bpColumns = bpProps.columns ?? null;
        const bpCentered = bpProps.centered ?? null;

        css.breakpoints[bpKey] = {
            props: {
                "--columns": bpColumns,
                "--centered": bpCentered ? "1" : null,
            },
        };
    });

    return cleanObject(css);
};

const getPreload = () => [];

/* --------------------------------------------------------------
 * Breakpoint Renderers
 * -------------------------------------------------------------- */
const GridBaseRenderer = ({ entry, update }) => {
    const props = entry ?? {};

    return (
        <Grid columns={2} columnGap={10} rowGap={10}>
            <NumberControl
                label="Columns"
                value={props.columns ?? 3}
                onChange={(val) =>
                    update({ columns: parseInt(val, 10) || 1 })
                }
                min={1}
                max={6}
                __next40pxDefaultSize
            />

            <ToggleControl
                label="Centered"
                checked={!!props.centered}
                onChange={(val) => update({ centered: !!val })}
                __next40pxDefaultSize
            />
        </Grid>
    );
};

const GridBreakpointRenderer = ({ entry, update }) => {
    const props = entry ?? {};

    return (
        <Grid columns={1} columnGap={10} rowGap={10}>
            <NumberControl
                label="Columns"
                value={props.columns ?? ""}
                onChange={(val) => {
                    if (val === "") {
                        update({}); // No change (inherit base)
                    } else {
                        update({ columns: parseInt(val, 10) || 1 });
                    }
                }}
                min={1}
                max={6}
                __next40pxDefaultSize
            />

            <ToggleControl
                label="Centered"
                checked={!!props.centered}
                onChange={(val) => update({ centered: !!val })}
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

        "wpbs-grid": {
            type: "object",
            default: {},
        },
    },

    /* ----------------------------------------------------------
     * EDIT
     * ---------------------------------------------------------- */
    edit: withStyle((props) => {
        const {
            attributes,
            BlockWrapper,
            setCss,
            setPreload,
            setAttributes,
        } = props;

        const rawGrid = attributes["wpbs-grid"] || {};
        const gridSettings = useMemo(
            () => normalizeGridSettings(rawGrid),
            [rawGrid]
        );

        const classNames = getClassNames(attributes, gridSettings);

        /* --------------------------------------------
         * Sync style + preload
         * -------------------------------------------- */
        useEffect(() => {
            setCss(getCssProps(gridSettings));
            setPreload(getPreload(gridSettings));
        }, [gridSettings, setCss, setPreload]);

        /* --------------------------------------------
         * Unified updater
         * Everything (props, breakpoints, query) goes through here
         * -------------------------------------------- */
        const updateGridSettings = useCallback(
            (nextValue) => {
                const normalized = normalizeGridSettings(nextValue);
                if (!isEqual(gridSettings, normalized)) {
                    setAttributes({ "wpbs-grid": normalized });
                }
            },
            [gridSettings, setAttributes]
        );

        /* Query updates are now part of `wpbs-grid` */
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
         * Inspector
         * -------------------------------------------- */
        const inspectorPanel = (
            <PanelBody title="Grid" group="styles" initialOpen={true}>
                {/* Non-breakpoint global options */}
                <Grid columns={1} columnGap={10} rowGap={16}>
                    <TextControl
                        label="Button Label"
                        value={gridSettings.props.buttonLabel || ""}
                        onChange={(val) =>
                            updateGridSettings({
                                ...gridSettings,
                                props: {
                                    ...gridSettings.props,
                                    buttonLabel: val,
                                },
                            })
                        }
                        __next40pxDefaultSize
                    />
                </Grid>

                {/* Breakpoint dynamic layout */}
                <BreakpointPanels
                    value={gridSettings}
                    onChange={updateGridSettings}
                    label="Grid Layout"
                    render={{
                        base: GridBaseRenderer,
                        breakpoints: GridBreakpointRenderer,
                    }}
                />

                {/* Query editor */}
                <PanelBody title="Query" initialOpen={false}>
                    <QueryConfigPanel
                        value={gridSettings.query || {}}
                        onChange={updateQuerySettings}
                    />
                </PanelBody>
            </PanelBody>
        );

        return (
            <>
                {inspectorPanel}

                <BlockWrapper
                    props={props}
                    className={classNames}
                    hasBackground={true}
                    tagName="div"
                    wrapperProps={{
                        "data-wp-interactive": "wpbs/layout-grid",
                        "data-wp-init": "actions.init",
                        "data-wp-context": JSON.stringify({
                            query: gridSettings.query || {},
                            grid: gridSettings || {},
                        }),
                    }}
                >
                    <InnerBlocks
                        allowedBlocks={[
                            "wpbs/layout-element",
                            "wpbs/layout-grid-container",
                            "wpbs/pagination-button",
                            "core/query-pagination",
                        ]}
                    />
                </BlockWrapper>
            </>
        );
    }),

    /* ----------------------------------------------------------
     * SAVE
     * ---------------------------------------------------------- */
    save: withStyleSave((props) => {
        const { attributes, BlockWrapper } = props;

        const gridSettings = normalizeGridSettings(
            attributes["wpbs-grid"] || {}
        );
        const classNames = getClassNames(attributes, gridSettings);

        return (
            <BlockWrapper
                props={props}
                className={classNames}
                hasBackground={true}
                tagName="div"
                wrapperProps={{
                    "data-wp-interactive": "wpbs/layout-grid",
                    "data-wp-init": "actions.init",
                    "data-wp-context": JSON.stringify({
                        query: gridSettings.query || {},
                        grid: gridSettings || {},
                    }),
                    ...(attributes?.["wpbs-props"] || {}),
                }}
            >
                <InnerBlocks.Content />
            </BlockWrapper>
        );
    }),
});