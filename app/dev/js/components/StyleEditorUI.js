import {
    useState,
    useEffect,
    useCallback,
    Fragment,
} from "@wordpress/element";
import {InspectorControls} from "@wordpress/block-editor";

import {BreakpointPanels} from "./BreakpointPanels";
import {LayoutFields} from "./LayoutFields";
import {HoverFields} from "Components/HoverFields";

import {cleanObject} from "Includes/helper";
import {isEqual} from "lodash";

export const StyleEditorUI = ({settings = {}, updateStyleSettings}) => {

    const [layout, setLayout] = useState(settings);

    useEffect(() => {
        const cleanedIncoming = cleanObject(settings || {}, false);
        const cleanedLocal = cleanObject(layout || {}, false);

        if (!isEqual(cleanedIncoming, cleanedLocal)) {
            setLayout(settings || {});
        }
    }, [settings]);

    const updateSettings = useCallback(
        (nextLayout) => {
            setLayout(nextLayout);
            updateStyleSettings(nextLayout);
        },
        [updateStyleSettings]
    );

    const baseLayoutSuppress = [
        "padding",
        "margin",
        "gap",
        "border",
    ];

    return (
        <InspectorControls group="styles">
            <BreakpointPanels
                value={layout}
                onChange={updateSettings}
                label="Layout"
                render={{

                    // ------------------- BASE -------------------
                    base: ({entry, update}) => (
                        <Fragment>
                            <LayoutFields
                                label="Settings"
                                settings={entry.props ?? {}}
                                suppress={baseLayoutSuppress}
                                updateFn={(patch, reset) =>
                                    update({ props: patch }, reset)
                                }
                            />

                            <HoverFields
                                settings={entry.hover ?? {}}
                                updateFn={(patch, reset) =>
                                    update({ hover: patch }, reset)
                                }
                            />
                        </Fragment>
                    ),

                    // ---------------- BREAKPOINTS ----------------
                    breakpoints: ({entry, update}) => (
                        <Fragment>
                            <LayoutFields
                                label="Settings"
                                settings={entry.props ?? {}}
                                updateFn={(patch, reset) =>
                                    update({ props: patch }, reset)
                                }
                            />

                            <HoverFields
                                settings={entry.hover ?? {}}
                                updateFn={(patch, reset) =>
                                    update({ hover: patch }, reset)
                                }
                            />
                        </Fragment>
                    ),
                }}
            />
        </InspectorControls>
    );
};
