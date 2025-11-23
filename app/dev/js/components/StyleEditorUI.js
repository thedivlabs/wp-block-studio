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
        const cleanedLocal = cleanObject(layout, true);
        const cleanedExternal = cleanObject(settings, true);
        if (!isEqual(cleanedLocal, cleanedExternal)) {
            updateStyleSettings(layout);
        }
    }, [layout]);

    const updateSettings = (newLayout) => {
        setLayout(newLayout);
    }

    return (
        <InspectorControls group="styles">
            <BreakpointPanels
                value={layout}
                onChange={updateSettings}
                label="Layout"
                render={{
                    base: ({entry, update}) => {

                        console.log(entry);

                        return <LayoutFields
                            label="Settings"
                            settings={entry ?? {}}
                            updateFn={update}
                        />;
                    },
                    breakpoints: ({entry, update}) => {

                        console.log(entry);

                        return <LayoutFields
                            label="Settings"
                            settings={entry ?? {}}
                            updateFn={update}
                        />;
                    },
                }}
            />
        </InspectorControls>
    );
};
