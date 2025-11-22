// StyleEditorUI.js
import {
    useState,
    useEffect,
    useMemo,
    useCallback
} from "@wordpress/element";
import {InspectorControls} from "@wordpress/block-editor";

import {BreakpointPanels} from "./BreakpointPanels";
import {LayoutFields} from "./LayoutFields";
import _ from "lodash";

export const StyleEditorUI = ({settings = {}, updateStyleSettings}) => {

    // ----------------------------------------
    // LOCAL STATE — initialized from settings ONCE
    // ----------------------------------------
    const [localProps, setLocalProps] = useState(settings.props || {});
    const [localBreakpoints, setLocalBreakpoints] = useState(settings.breakpoints || {});

    // ----------------------------------------
    // DERIVED LAYOUT OBJECT (like old localLayout)
    // ----------------------------------------
    const localLayout = useMemo(
        () => ({
            props: localProps,
            breakpoints: localBreakpoints,
        }),
        [localProps, localBreakpoints]
    );

    // ----------------------------------------
    // DEBOUNCED COMMIT TO ATTRIBUTES (same pattern as old code)
    // ----------------------------------------
    const debouncedCommit = useMemo(
        () => _.debounce((next) => updateStyleSettings(next), 300),
        [updateStyleSettings]
    );

    useEffect(() => {
        debouncedCommit(localLayout);
        return () => debouncedCommit.cancel();
    }, [localLayout, debouncedCommit]);

    // ----------------------------------------
    // UPDATE BASE PROPS
    // ----------------------------------------
    const updateBaseProps = useCallback((next) => {
        setLocalProps((prev) => {
            // ToolsPanel resetAll → clear all props
            if (next && Object.keys(next).length === 0) {
                return {};
            }
            return {
                ...prev,
                ...next,
            };
        });
    }, []);

    // ----------------------------------------
    // UPDATE BREAKPOINTS (from BreakpointPanels)
    // ----------------------------------------
    const updateBreakpoints = useCallback((nextBps) => {
        setLocalBreakpoints(nextBps || {});
    }, []);

    // ----------------------------------------
    // RENDER PANELS
    // ----------------------------------------
    const LayoutFieldsPanel = useCallback(
        () => (
            <LayoutFields
                label="Layout"
                settings={localProps}
                updateFn={updateBaseProps}
            />
        ),
        [localProps, updateBaseProps]
    );

    const BreakpointFieldsPanel = useCallback(
        ({bpKey, entry, update}) => (
            <LayoutFields
                label="Layout"
                settings={entry.props ?? {}}
                updateFn={(nextProps) => update({props: nextProps})}
            />
        ),
        []
    );

    const BreakpointPanelsUI = useMemo(
        () => (
            <BreakpointPanels
                value={localBreakpoints}
                onChange={updateBreakpoints}
                label="Layout"
                render={{
                    base: LayoutFieldsPanel,
                    breakpoints: BreakpointFieldsPanel,
                }}
            />
        ),
        [localBreakpoints, updateBreakpoints, LayoutFieldsPanel, BreakpointFieldsPanel]
    );

    return (
        <InspectorControls group="styles">
            {BreakpointPanelsUI}
        </InspectorControls>
    );
};
