import {
    useState,
    useEffect,
    useCallback,
    Fragment,
} from "@wordpress/element";

import {BreakpointPanels} from "./BreakpointPanels";
import {LayoutFields} from "./LayoutFields";
import {HoverFields} from "Components/HoverFields";

import {cleanObject, mergeEntry} from "Includes/helper";
import {isEqual, merge} from "lodash";
import {PanelBody} from "@wordpress/components";


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
            setLayout(patch);
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
        return (
            <>
                <LayoutFields
                    label="Settings"
                    settings={entry.props || {}}
                    updateFn={(patch) => update({props: patch})}
                />

                <HoverFields
                    settings={entry.hover || {}}
                    updateFn={(patch) => update({hover: patch})}
                />
            </>
        );
    };


    const breakpointRenderer = ({entry, update}) => {
        const current = entry || {};

        const handleLayoutUpdate = (patch) => {
            update({props: patch});
        };

        const handleHoverUpdate = (patch) => {
            update({hover: patch});
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
