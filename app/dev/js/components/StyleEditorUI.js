import {useState, useEffect, useMemo, useCallback} from "@wordpress/element";
import {InspectorControls} from "@wordpress/block-editor";
import {BreakpointPanels} from "./BreakpointPanels";
import {LayoutFields} from "./LayoutFields";

export const StyleEditorUI = ({settings = {}, updateStyleSettings}) => {

    // -------------------------
    // LOCAL MIRRORED STATE
    // -------------------------
    const [localSettings, setLocalSettings] = useState(() => ({
        props: settings.props || {},
        breakpoints: settings.breakpoints || {},
    }));

    // re-sync when block updates externally
    useEffect(() => {
        setLocalSettings({
            props: settings.props || {},
            breakpoints: settings.breakpoints || {},
        });
    }, [settings]);

    // stable memo derived values
    const baseProps = useMemo(() => localSettings.props, [localSettings.props]);
    const bps = useMemo(() => localSettings.breakpoints, [localSettings.breakpoints]);

    // update base props (LayoutFields)
    const updateBaseProps = useCallback((next) => {
        setLocalSettings(prev => {
            const updated = {
                ...prev,
                props: {...prev.props, ...next}
            };
            updateStyleSettings(updated);
            return updated;
        });
    }, [updateStyleSettings]);

    // update breakpoints (BreakpointPanels)
    const updateBreakpoints = useCallback((nextBps) => {
        setLocalSettings(prev => {
            const updated = {
                ...prev,
                breakpoints: nextBps
            };
            updateStyleSettings(updated);
            return updated;
        });
    }, [updateStyleSettings]);

    const BreakpointPanelsWrapper = useMemo(() => <BreakpointPanels
        value={bps}
        onChange={updateBreakpoints}
        label="Layout"
        render={{
            base: ({bpKey, entry, update}) => (
                <LayoutFields
                    label="Layout"
                    settings={baseProps}
                    updateFn={updateBaseProps}
                />
            ),

            breakpoints: ({bpKey, entry, update}) => (
                <LayoutFields
                    label="Layout"
                    settings={entry.props ?? {}}
                    updateFn={(nextProps) => update({props: nextProps})}
                />
            ),
        }}
    />, [updateBreakpoints]);

    return (
        <InspectorControls group="styles">

            {BreakpointPanelsWrapper}


        </InspectorControls>
    );
};
