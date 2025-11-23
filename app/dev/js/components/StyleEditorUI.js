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

    const [layout, setLayout] = useState(settings);


    useEffect(() => {
        const cleanedIncoming = cleanObject(settings || {}, true);
        const cleanedLocal = cleanObject(layout || {}, true);

        if (!isEqual(cleanedIncoming, cleanedLocal)) {
            setLayout(settings || {});
        }
    }, [settings]);

// 2. Update attributes ONLY on user action
    const updateSettings = useCallback((nextLayout) => {
        setLayout(nextLayout);
        updateStyleSettings(nextLayout); // safe, user-initiated
    }, [updateStyleSettings]);


    return (
        <InspectorControls group="styles">
            <BreakpointPanels
                value={layout}
                onChange={updateSettings}
                label="Layout"
                render={{
                    base: ({entry, update, bpKey}) => {

                        return <LayoutFields
                            label="Settings"
                            settings={entry ?? {}}
                            updateFn={(data, reset = false) => update(bpKey, data, reset)}
                        />;
                    },
                    breakpoints: ({entry, update, bpKey}) => {

                        return <LayoutFields
                            label="Settings"
                            settings={entry ?? {}}
                            updateFn={(data, reset = false) => update(bpKey, data, reset)}
                        />;
                    },
                }}
            />
        </InspectorControls>
    );
};
