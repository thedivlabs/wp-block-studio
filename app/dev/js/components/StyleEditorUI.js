// StyleEditorUI.js
import {
    useState,
    useEffect,
    useMemo,
    useCallback,
} from "@wordpress/element";
import {InspectorControls} from "@wordpress/block-editor";

import {BreakpointPanels} from "./BreakpointPanels";
import {LayoutFields} from "./LayoutFields";
import {cleanObject} from "Includes/helper";
import {isEqual, debounce} from "lodash";

export const StyleEditorUI = ({settings = {}, updateStyleSettings}) => {
    // ----------------------------------------
    // LOCAL STATE (flat-entry layout)
    // layout = { base:{...}, xs:{...}, md:{...} }
    // ----------------------------------------
    const [layout, setLayout] = useState(() => settings);

// Keep layout in sync when settings updates externally
    useEffect(() => {
        setLayout(settings);
    }, [settings]);

    const debouncedCommit = useMemo(() =>
            debounce((nextLayout, externalSettings) => {
                const cleanedLocal = cleanObject(nextLayout, true);
                const cleanedExternal = cleanObject(externalSettings, true);

                if (!isEqual(cleanedLocal, cleanedExternal)) {
                    updateStyleSettings(nextLayout);
                }
            }, 500),
        [updateStyleSettings]);

    useEffect(() => {
        debouncedCommit(layout, settings);
        return () => debouncedCommit.cancel();
    }, [layout]);




    return (
        <InspectorControls group="styles">
            <BreakpointPanels
                value={layout}
                onChange={(nextPanels) => {
                    console.log(nextPanels);
                    setLayout(nextPanels);
                }}
                label="Layout"
                render={{
                    base: ({entry, update}) => (
                        <LayoutFields
                            label="Settings"
                            settings={entry ?? {}}
                            updateFn={(nextProps) => update(nextProps)}
                        />
                    ),
                    breakpoints: ({entry, update}) => (
                        <LayoutFields
                            label="Settings"
                            settings={entry ?? {}}
                            updateFn={(nextProps) => update(nextProps)}
                        />
                    ),
                }}
            />
        </InspectorControls>
    );
};
