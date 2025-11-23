import {
    useState,
    useEffect,
    useCallback,
} from "@wordpress/element";
import {InspectorControls} from "@wordpress/block-editor";

import {BreakpointPanels} from "./BreakpointPanels";
import {LayoutFields} from "./LayoutFields";
import {cleanObject} from "Includes/helper";
import {isEqual} from "lodash";
import {HoverFields} from "Components/HoverFields";

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

    const baseLayoutSuppress = [
        'padding',
        'margin',
        'gap',
        'border',
    ]

    return (
        <InspectorControls group="styles">
            <BreakpointPanels
                value={layout}
                onChange={updateSettings}
                label="Layout"
                render={{
                    base: ({entry, update}) => {

                        return <>
                            <LayoutFields
                                label="Settings"
                                settings={entry ?? {}}
                                suppress={baseLayoutSuppress}
                                updateFn={(data, reset = false) => update(data, reset)}
                            />
                            <HoverFields
                                settings={entry.hover ?? {}}
                                updateFn={(data, reset) => update({hover: data}, reset)}
                            />
                        </>;
                    },
                    breakpoints: ({entry, update}) => {

                        return <>
                            <LayoutFields
                                label="Settings"
                                settings={entry ?? {}}
                                updateFn={(data, reset = false) => update(data, reset)}
                            />
                            <HoverFields
                                settings={entry.hover ?? {}}
                                updateFn={(data, reset) => update({hover: data}, reset)}
                            />
                        </>;
                    },
                }}
            />
        </InspectorControls>
    );
};
