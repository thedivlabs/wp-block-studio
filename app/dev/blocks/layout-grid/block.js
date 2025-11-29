import { registerBlockType } from "@wordpress/blocks";
import {
    InspectorControls,
    useBlockProps,
    useInnerBlocksProps,
    InnerBlocks,
    PanelColorSettings,
} from "@wordpress/block-editor";
import {
    useCallback,
    useMemo,
    Fragment,
} from "@wordpress/element";
import {
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl,
    __experimentalBorderControl as BorderControl,
    __experimentalInputControl as InputControl,
    __experimentalUnitControl as UnitControl,
    PanelBody,
    ToggleControl,
    TextControl,
    BaseControl,
} from "@wordpress/components";
import { useInstanceId } from "@wordpress/compose";
import { isEqual } from "lodash";

import { QueryConfigPanel } from "Components/QueryConfigPanel";
import { BreakpointPanels } from "Components/BreakpointPanels";

import "./scss/block.scss";

/* --------------------------------------------------------------
 * Utility: classnames
 * -------------------------------------------------------------- */
const blockClassNames = (attributes) => {
    const { settings = {}, "wpbs-grid": grid = {} } = attributes;
    const centered = !!(grid?.props && grid.props.centered);

    return [
        "wpbs-layout-grid",
        settings?.instanceId ?? null,
        centered ? "--centered" : null,
    ]
        .filter(Boolean)
        .join(" ");
};

/* --------------------------------------------------------------
 * CSS helper for grid props
 * -------------------------------------------------------------- */
const buildCssFromProps = (props = {}) => {
    return Object.entries(props)
        .filter(([, val]) => val !== undefined && val !== null && val !== "")
        .map(([key, val]) => {
            const cssName = key.startsWith("--") ? key : `--${key}`;
            return `${cssName}:${val};`;
        })
        .join("");
};

/* --------------------------------------------------------------
 * Style element renderer (editor only)
 * -------------------------------------------------------------- */
const GridStyle = ({ grid, breakpoints, instanceId }) => {
    if (!grid || !instanceId) return null;

    const selector = `.wpbs-layout-grid.${instanceId}`;
    const baseProps = grid.props || {};
    const bpEntries = grid.breakpoints || {};

    const baseRules = `${selector}{${buildCssFromProps(baseProps)}}`;

    const responsiveRules = Object.entries(bpEntries)
        .map(([bpKey, entry]) => {
            const bpConfig = breakpoints[bpKey];
            if (!bpConfig || !bpConfig.size) {
                return "";
            }

            const bpProps = entry?.props || {};
            const vars = buildCssFromProps(bpProps);
            if (!vars) return "";

            const maxWidth = bpConfig.size - 1;
            return `@media(max-width:${maxWidth}px){${selector}{${vars}}}`;
        })
        .join("");

    const css = baseRules + responsiveRules;

    if (!css.trim()) return null;

    return <style>{css}</style>;
};

/* --------------------------------------------------------------
 * Breakpoint renderers
 * -------------------------------------------------------------- */

const GridBaseRenderer = ({ entry, update }) => {
    const props = entry.props || {};
    const columns = props.columns ?? 3;
    const centered = !!props.centered;

    return (
        <Fragment>
            <Grid columns={2} columnGap={10} rowGap={10}>
                <NumberControl
                    label="Columns"
                    value={columns}
                    onChange={(val) =>
                        update({
                            props: { columns: parseInt(val, 10) || 1 },
                        })
                    }
                    min={1}
                    max={6}
                    __next40pxDefaultSize
                />

                <ToggleControl
                    label="Centered"
                    checked={centered}
                    onChange={(val) =>
                        update({
                            props: { centered: !!val },
                        })
                    }
                    __nextHasNoMarginBottom
                />
            </Grid>
        </Fragment>
    );
};

const GridBreakpointRenderer = ({ entry, update }) => {
    const props = entry.props || {};
    const columns = props.columns ?? "";

    return (
        <Grid columns={1} columnGap={10} rowGap={10}>
            <NumberControl
                label="Columns"
                value={columns}
                onChange={(val) =>
                    update({
                        props: {
                            columns: val === "" ? undefined : parseInt(val, 10) || 1,
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

/* --------------------------------------------------------------
 * BLOCK REGISTRATION
 * -------------------------------------------------------------- */
registerBlockType("wpbs/layout-grid", {
    edit: ({ attributes, setAttributes }) => {
        const {
            settings = {},
            query = {},
            "wpbs-grid": gridValue = {},
        } = attributes;

        const {
            buttonLabel = "Load more",
        } = settings;

        const themeBreakpoints = WPBS?.settings?.breakpoints || {};
        const instanceId = useInstanceId(Object, "wpbs-layout-grid");

        /* --------------------------------------------
         * Block wrapper props
         * -------------------------------------------- */
        const blockProps = useBlockProps({
            className: blockClassNames(attributes),
            style: Object.fromEntries(
                Object.entries({
                    "--column-gap": attributes?.style?.spacing?.blockGap?.left,
                    "--row-gap": attributes?.style?.spacing?.blockGap?.top,
                }).filter(([, v]) => v !== undefined)
            ),
        });

        /* --------------------------------------------
         * Inner blocks (card blueprint)
         * -------------------------------------------- */
        const innerBlocksProps = useInnerBlocksProps(blockProps, {
            allowedBlocks: ["wpbs/layout-grid-card"],
        });

        /* --------------------------------------------
         * Update settings (non-grid, non-query)
         * -------------------------------------------- */
        const updateSettings = useCallback(
            (patch = {}) => {
                const next = { ...settings, ...patch };
                if (!isEqual(settings, next)) {
                    next.instanceId = instanceId;
                    setAttributes({ settings: next });
                }
            },
            [settings, setAttributes]
        );

        /* --------------------------------------------
         * Update grid attribute (global + breakpoints)
         * -------------------------------------------- */
        const updateGrid = useCallback(
            (next) => {
                setAttributes({ "wpbs-grid": next || {} });
            },
            [setAttributes]
        );

        const updateGridPartial = useCallback(
            (patch = {}) => {
                const next = { ...(gridValue || {}), ...patch };
                setAttributes({ "wpbs-grid": next });
            },
            [gridValue, setAttributes]
        );

        const grid = gridValue || {};

        /* --------------------------------------------
         * RENDER
         * -------------------------------------------- */
        return (
            <>
                <InspectorControls>
                    {/* -------------------------
                     * Query Configuration Panel
                     * ------------------------- */}
                    <QueryConfigPanel
                        value={query}
                        onChange={(next) => setAttributes({ query: next })}
                        options={WPBS?.settings?.queryOptions || {}}
                    />

                    {/* -------------------------
                     * Grid Layout & Options
                     * ------------------------- */}
                    <PanelBody
                        title="Grid"
                        group="styles"
                        initialOpen={true}
                    >
                        {/* Global / non-breakpoint options */}
                        <Grid columns={1} columnGap={10} rowGap={16}>
                            <TextControl
                                label="Button Label"
                                value={buttonLabel}
                                onChange={(val) =>
                                    updateSettings({ buttonLabel: val })
                                }
                                __next40pxDefaultSize
                            />

                            <BorderControl
                                __next40pxDefaultSize
                                enableAlpha
                                enableStyle
                                disableUnits
                                value={grid.divider || {}}
                                colors={WPBS?.settings?.colors ?? []}
                                __experimentalIsRenderedInSidebar={true}
                                label="Divider"
                                onChange={(newValue) =>
                                    updateGridPartial({ divider: newValue })
                                }
                                shouldSanitizeBorder
                            />
                        </Grid>

                        <Grid columns={2} columnGap={10} rowGap={16}>
                            <InputControl
                                label="Divider Icon"
                                value={grid["divider-icon"] || ""}
                                onChange={(val) =>
                                    updateGridPartial({
                                        "divider-icon": val,
                                    })
                                }
                                __next40pxDefaultSize
                            />

                            <UnitControl
                                label="Icon Size"
                                value={grid["divider-icon-size"] || ""}
                                isResetValueOnUnitChange={true}
                                onChange={(val) =>
                                    updateGridPartial({
                                        "divider-icon-size": val,
                                    })
                                }
                                units={[
                                    { value: "px", label: "px", default: "0px" },
                                    { value: "em", label: "em", default: "0em" },
                                    { value: "rem", label: "rem", default: "0rem" },
                                    { value: "vw", label: "vw", default: "0vw" },
                                ]}
                                __next40pxDefaultSize
                            />
                        </Grid>

                        <PanelColorSettings
                            enableAlpha
                            className="!p-0 !border-0 [&_.components-tools-panel-item]:!m-0"
                            colorSettings={[
                                {
                                    slug: "divider-icon-color",
                                    label: "Divider Icon Color",
                                    value: grid["divider-icon-color"],
                                    onChange: (newValue) =>
                                        updateGridPartial({
                                            "divider-icon-color": newValue,
                                        }),
                                    isShownByDefault: true,
                                },
                            ]}
                        />

                        {/* Breakpoint-based grid settings */}
                        <BreakpointPanels
                            value={grid}
                            onChange={updateGrid}
                            label="Grid Settings"
                            render={{
                                base: GridBaseRenderer,
                                breakpoints: GridBreakpointRenderer,
                            }}
                        />
                    </PanelBody>
                </InspectorControls>

                <div {...innerBlocksProps} />

                {/* Editor-only style for responsive columns */}
                <GridStyle
                    grid={grid}
                    breakpoints={themeBreakpoints}
                    instanceId={settings.instanceId || instanceId}
                />
            </>
        );
    },

    /* --------------------------------------------------------------
     * SAVE
     * -------------------------------------------------------------- */
    save: ({ attributes }) => {
        const {
            settings = {},
            query = {},
        } = attributes;

        const blockProps = useBlockProps.save({
            className: blockClassNames(attributes),
            "data-wp-interactive": "wpbs/layout-grid",
            "data-wp-context": JSON.stringify({
                query: query || {},
                buttonLabel: settings?.buttonLabel || "Load more",
            }),
            "data-wp-init": "actions.init",
            style: Object.fromEntries(
                Object.entries({
                    "--column-gap": attributes?.style?.spacing?.blockGap?.left,
                    "--row-gap": attributes?.style?.spacing?.blockGap?.top,
                    columnGap: attributes?.style?.spacing?.blockGap?.left,
                    rowGap: attributes?.style?.spacing?.blockGap?.top,
                }).filter(([, v]) => v !== undefined)
            ),
        });

        return (
            <div {...blockProps}>
                {/* Template-driven cards */}
                <template
                    data-wp-each--item={"state.items"}
                    data-wp-each-key={"context.item.id"}
                >
                    <InnerBlocks.Content />
                </template>

                {/* Footer load more */}
                <div
                    className="wpbs-layout-grid__footer"
                    data-wp-class--hidden="!state.hasMore"
                >
                    <button
                        type="button"
                        class="wp-element-button"
                        data-wp-on--click="actions.loadMore"
                    >
                        {settings?.buttonLabel ?? "Load more"}
                    </button>
                </div>
            </div>
        );
    },
});