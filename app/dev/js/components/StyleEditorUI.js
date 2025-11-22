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
    const [layout, setLayout] = useState({});

    useEffect(() => {

        if (!isEqual(cleanObject(settings), cleanObject(layout))) {
            setLayout(settings);
        }

    }, [settings])


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


    const updateLayout = useCallback((nextPanels) => {
        setLayout(nextPanels);
    }, []);


    const LayoutFieldsPanel = useCallback(
        ({entry, update}) => (
            <LayoutFields
                label="Settings"
                settings={entry ?? {}}
                updateFn={(nextProps) => update(nextProps)}
            />
        ),
        []
    );

    const BreakpointFieldsPanel = useCallback(
        ({entry, update}) => (
            <LayoutFields
                label="Settings"
                settings={entry ?? {}}
                updateFn={(nextProps) => update(nextProps)}
            />
        ),
        []
    );


    const BreakpointPanelsUI = useMemo(
        () => (
            <BreakpointPanels
                value={layout}
                onChange={updateLayout}
                label="Layout"
                render={{
                    base: LayoutFieldsPanel,
                    breakpoints: BreakpointFieldsPanel,
                }}
            />
        ),
        [layout]
    );

    return (
        <InspectorControls group="styles">
            {BreakpointPanelsUI}
        </InspectorControls>
    );
};
