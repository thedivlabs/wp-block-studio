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
import {isEqual, merge} from "lodash";
import {PanelBody} from "@wordpress/components";

const mergeEntry = (entry, patch, reset = false) => {
    const base = reset ? {} : (entry || {});
    // Deep merge into a fresh object to keep things immutable
    return merge({}, base, patch || {});
};

export const StyleEditorUI = ({settings = {}, updateStyleSettings}) => {
    const [layout, setLayout] = useState(settings);

    useEffect(() => {
        const cleanedIncoming = cleanObject(settings || {}, false);
        const cleanedLocal = cleanObject(layout || {}, false);

        if (!isEqual(cleanedIncoming, cleanedLocal)) {
            setLayout(settings || {});
        }
    }, [settings, layout]);

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

    const baseRenderer = ({entry, update}) => {
        const currentEntry = entry || {};

        const handleLayoutUpdate = (patch, reset = false) => {
            const nextEntry = mergeEntry(currentEntry, {props: patch}, reset);
            update(nextEntry);
        };

        const handleHoverUpdate = (patch, reset = false) => {
            const nextEntry = mergeEntry(currentEntry, {hover: patch}, reset);
            update(nextEntry);
        };

        return (
            <Fragment>
                <LayoutFields
                    label="Settings"
                    settings={currentEntry.props || {}}
                    suppress={baseLayoutSuppress}
                    updateFn={handleLayoutUpdate}
                />

                <HoverFields
                    settings={currentEntry.hover || {}}
                    updateFn={handleHoverUpdate}
                />
            </Fragment>
        );
    };

    const breakpointRenderer = ({entry, update}) => {
        const currentEntry = entry || {};

        const handleLayoutUpdate = (patch, reset = false) => {
            const nextEntry = mergeEntry(currentEntry, {props: patch}, reset);
            update(nextEntry);
        };

        const handleHoverUpdate = (patch, reset = false) => {
            const nextEntry = mergeEntry(currentEntry, {hover: patch}, reset);
            update(nextEntry);
        };

        return (
            <Fragment>
                <LayoutFields
                    label="Settings"
                    settings={currentEntry.props || {}}
                    updateFn={handleLayoutUpdate}
                />

                <HoverFields
                    settings={currentEntry.hover || {}}
                    updateFn={handleHoverUpdate}
                />
            </Fragment>
        );
    };

    // Make sure `breakpoints` exists, but otherwise just pass through
    const normalizedLayout = {
        ...(layout || {}),
        breakpoints: (layout && layout.breakpoints) || {},
    };

    return (
        <PanelBody title={"Styles"} initialOpen={false} className={'is-style-unstyled'}>
            <BreakpointPanels
                value={normalizedLayout}
                onChange={updateSettings}
                label="Layout"
                render={{
                    base: baseRenderer,
                    breakpoints: breakpointRenderer,
                }}
            />
        </PanelBody>
    );
};
