import {useState, useEffect, useMemo, useCallback} from "@wordpress/element";
import {InspectorControls} from "@wordpress/block-editor";
import {BreakpointPanels} from "./BreakpointPanels";
import {LayoutFields} from "./LayoutFields";
import {cleanObject} from "Includes/helper";
import {isEqual} from "lodash";

export const StyleEditorUI = ({settings = {}, updateStyleSettings}) => {
    // -------------------------
    // LOCAL MIRRORED STATE
    // -------------------------
    const [localSettings, setLocalSettings] = useState(() => ({
        props: settings.props || {},
        breakpoints: settings.breakpoints || {},
    }));

    // -------------------------
    // DERIVED VALUES
    // -------------------------
    const baseProps = localSettings.props || {};
    const bps = localSettings.breakpoints || {};


    // -------------------------
    // UPDATE BASE PROPS (LayoutFields)
    // -------------------------
    const updateBaseProps = useCallback(
        (next) => {
            setLocalSettings((prev) => {
                let nextProps;

                // Special case: ToolsPanel resetAll → we want to clear props entirely
                if (next && Object.keys(next).length === 0) {
                    nextProps = {};
                } else {
                    nextProps = {
                        ...prev.props,
                        ...next,
                    };
                }

                const result = {
                    ...prev,
                    props: nextProps,
                };

                // Only push up if something actually changed vs current external settings
                const cleanedExternal = cleanObject(settings, true);
                const cleanedResult = cleanObject(result, true);

                if (!isEqual(cleanedExternal, cleanedResult)) {
                    updateStyleSettings(result);
                }

                return result;
            });
        },
        [settings, updateStyleSettings]
    );

    // -------------------------
    // UPDATE BREAKPOINTS (BreakpointPanels)
    // -------------------------
    const updateBreakpoints = useCallback(
        (nextBps) => {
            setLocalSettings((prev) => {
                const result = {
                    ...prev,
                    breakpoints: nextBps,
                };

                const cleanedExternal = cleanObject(settings, true);
                const cleanedResult = cleanObject(result, true);

                if (!isEqual(cleanedExternal, cleanedResult)) {
                    updateStyleSettings(result);
                }

                return result;
            });
        },
        [settings?.breakpoints, updateStyleSettings]
    );

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
