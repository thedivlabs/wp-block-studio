// controls.js

import {useCallback} from "@wordpress/element";
import {
    PanelBody,
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl,
} from "@wordpress/components";

import {BreakpointPanels} from "Components/BreakpointPanels";
import {DividerOptions} from "Components/DividerOptions";

/* --------------------------------------------------------------
 * Normalize wpbs-grid settings (NO QUERY ANYMORE)
 * -------------------------------------------------------------- */
export const normalizeGridSettings = (raw) => {
    if (raw && (raw.props || raw.breakpoints || raw.divider)) {
        return {
            props: raw.props || {},
            breakpoints: raw.breakpoints || {},
            divider: raw.divider || {},
        };
    }

    // Legacy flat shape
    return {
        props: raw || {},
        breakpoints: {},
        divider: {},
    };
};

/* --------------------------------------------------------------
 * Base Renderer
 * -------------------------------------------------------------- */
const GridBaseRenderer = ({entry, update}) => {
    const props = entry?.props || {};

    return (
        <Grid columns={2} columnGap={10} rowGap={10} style={{padding: "14px"}}>
            <NumberControl
                label="Columns"
                value={props.columns ?? 3}
                onChange={(val) =>
                    update({
                        props: {columns: parseInt(val, 10) || 1}
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
 * Breakpoint Renderer (Old behavior preserved)
 * -------------------------------------------------------------- */
const GridBreakpointRenderer = ({entry, update}) => {
    const props = entry?.props || {};

    return (
        <Grid columns={2} columnGap={10} rowGap={10} style={{padding: "14px"}}>
            <NumberControl
                label="Columns"
                value={props.columns ?? ""}
                onChange={(val) => {
                    if (val === "") {
                        update({}); // OLD behavior: no deletion, no mutation
                        return;
                    }
                    update({
                        props: {
                            columns: parseInt(val, 10) || 1,
                        }
                    });
                }}
                min={1}
                max={6}
                __next40pxDefaultSize
            />
        </Grid>
    );
};

/* --------------------------------------------------------------
 * GridInspector
 * -------------------------------------------------------------- */
export function GridInspector({gridSettings, updateGridSettings, blockProps}) {

    return (
        <>
            {/* Divider */}
            <PanelBody title="Divider" initialOpen={false} className="wpbs-block-controls">
                <DividerOptions
                    value={gridSettings.divider}
                    onChange={(divider) => {
                        updateGridSettings({
                            ...gridSettings,
                            divider,
                        });
                    }}
                    props={blockProps}
                />
            </PanelBody>

            {/* Breakpoints */}
            <PanelBody title="Grid Layout" initialOpen={false} className="wpbs-block-controls is-style-unstyled">
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
        </>
    );
}
