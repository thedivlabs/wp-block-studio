import {
    useState,
    useEffect,
    useCallback,
    Fragment,
} from "@wordpress/element";

import {BreakpointPanels} from "./BreakpointPanels";
import {LayoutFields} from "./LayoutFields";
import {HoverFields} from "Components/HoverFields";

import {cleanObject, normalizeBreakpoints} from "Includes/helper";
import {isEqual, merge} from "lodash";
import {PanelBody} from "@wordpress/components";

const mergeEntry = (entry, patch, reset = false) => {
    const base = reset ? {} : (entry || {});
    return merge({}, base, patch || {});
};

export const StyleEditorUI = ({settings = {}, updateStyleSettings}) => {
    const [layout, setLayout] = useState(settings);

    useEffect(() => {
        const incoming = cleanObject(settings || {}, false);
        const local = cleanObject(layout || {}, false);

        if (!isEqual(incoming, local)) {
            setLayout(settings || {});
        }
    }, [settings, layout]);

    const updateSettings = useCallback(
        (patch) => {
            console.log('updateSettings', patch);
            /*let merged = merge({}, layout, patch);
            merged = cleanObject(merged, true);
            merged = normalizeBreakpoints(merged);

            setLayout(merged);*/
            updateStyleSettings(patch);
        },
        [layout, updateStyleSettings]
    );


    const baseLayoutSuppress = [
        "padding",
        "margin",
        "gap",
        "border",
    ];

    const baseRenderer = ({entry, update}) => {
        const current = entry || {};

        const handleLayoutUpdate = (patch, reset = false) => {
            const next = mergeEntry(current, {props: patch}, reset);
            update({...next});       // ALWAYS object
        };

        const handleHoverUpdate = (patch, reset = false) => {
            const next = mergeEntry(current, {hover: patch}, reset);
            update({...next});
        };

        return (
            <Fragment>
                <LayoutFields
                    label="Settings"
                    settings={current.props || {}}
                    suppress={baseLayoutSuppress}
                    updateFn={handleLayoutUpdate}
                />

                <HoverFields
                    settings={current.hover || {}}
                    updateFn={handleHoverUpdate}
                />
            </Fragment>
        );
    };

    const breakpointRenderer = ({entry, update}) => {
        const current = entry || {};

        const handleLayoutUpdate = (patch, reset = false) => {
            const next = mergeEntry(current, {props: patch}, reset);
            update({...next});
        };

        const handleHoverUpdate = (patch, reset = false) => {
            const next = mergeEntry(current, {hover: patch}, reset);
            update({...next});
        };

        return (
            <Fragment>
                <LayoutFields
                    label="Settings"
                    settings={current.props || {}}
                    updateFn={handleLayoutUpdate}
                />

                <HoverFields
                    settings={current.hover || {}}
                    updateFn={handleHoverUpdate}
                />
            </Fragment>
        );
    };


    const normalizedLayout = {
        ...(settings || {}),
        breakpoints: (settings && settings.breakpoints) || {},
    };

    return (
        <PanelBody title={"Styles"} initialOpen={false} className={'is-style-unstyled'}>
            <BreakpointPanels
                value={normalizedLayout}
                onChange={(obj) => updateSettings(obj)} // object-only
                label="Layout"
                render={{
                    base: baseRenderer,
                    breakpoints: breakpointRenderer,
                }}
            />
        </PanelBody>
    );
};
