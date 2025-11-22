import {useState, useEffect, useMemo, useCallback} from "@wordpress/element";
import {InspectorControls} from "@wordpress/block-editor";
import {BreakpointPanels} from "./BreakpointPanels";
import {LayoutFields} from "./LayoutFields";
import {cleanObject} from "Includes/helper";
import {isEqual} from "lodash";

export const StyleEditorUI = ({settings = {}, updateStyleSettings}) => {

    const [baseProps, setBaseProps] = useState(settings.props || {});
    const [bps, setBps] = useState(settings.breakpoints || {});


    const updateBaseProps = useCallback((next) => {
        setBaseProps(prev => {
            const updated = next && Object.keys(next).length === 0
                ? {}
                : { ...prev, ...next };

            const result = {
                props: updated,
                breakpoints: bps,
            };
            if (!isEqual(cleanObject(settings, true), cleanObject(result, true))) {
                updateStyleSettings(result);
            }

            return updated;
        });
    }, [bps, settings, updateStyleSettings]);


    const updateBreakpoints = useCallback((nextBps) => {
        setBps(() => {
            const result = {
                props: baseProps,
                breakpoints: nextBps,
            };

            if (!isEqual(cleanObject(settings, true), cleanObject(result, true))) {
                updateStyleSettings(result);
            }

            return nextBps;
        });
    }, [baseProps, settings, updateStyleSettings]);


    const LayoutFieldsPanel = useCallback(
        ({bpKey, entry, update}) => (
            <LayoutFields
                settings={baseProps}
                updateFn={updateBaseProps}
            />
        ),
        [baseProps, updateBaseProps]
    );

    const BreakpointFieldsPanel = useCallback(
        ({bpKey, entry, update}) => (
            <LayoutFields
                settings={entry.props ?? {}}
                updateFn={(nextProps) => update({props: nextProps})}
            />
        ),
        [] // stable, no deps needed
    );


// -------------------------
// BREAKPOINT PANELS UI
// -------------------------
    const BreakpointPanelsUI = useMemo(
        () => (
            <BreakpointPanels
                value={bps}
                onChange={updateBreakpoints}
                label="Layout"
                render={{
                    base: LayoutFieldsPanel,
                    breakpoints: BreakpointFieldsPanel,
                }}
            />
        ),
        [bps, LayoutFieldsPanel, BreakpointFieldsPanel, updateBreakpoints]
    );


    return (
        <InspectorControls group="styles">
            {BreakpointPanelsUI}
        </InspectorControls>
    );
};
