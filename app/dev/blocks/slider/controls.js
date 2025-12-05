import {InspectorControls} from "@wordpress/block-editor";
import {useMemo, useCallback} from "@wordpress/element";
import {PanelBody, __experimentalGrid as Grid} from "@wordpress/components";
import {Field} from "Components/Field";
import {BreakpointPanels} from "Components/BreakpointPanels";

// Base slider fields
const BASE_SLIDER_FIELDS = [
    {slug: "slidesPerView", type: "number", label: "Slides per view"},
    {slug: "spaceBetween", type: "number", label: "Space between slides"},
    {slug: "loop", type: "toggle", label: "Loop"},
    {slug: "autoplay", type: "number", label: "Autoplay", min: 0, step: 0.5},
    {
        slug: "effect",
        type: "select",
        label: "Effect",
        options: [
            {label: "Select", value: ""},
            {label: "Slide", value: "slide"},
            {label: "Fade", value: "fade"},
        ],
    },
    {slug: "freeMode", type: "toggle", label: "Free mode"},
    {slug: "duration", type: "number", label: "Duration", min: 0, step: 100},
];

// Breakpoint slider fields
const BREAKPOINT_SLIDER_FIELDS = [
    {slug: "slidesPerView", type: "number", label: "Slides per view"},
    {slug: "spaceBetween", type: "number", label: "Space between slides"},
    {slug: "autoplay", type: "number", label: "Autoplay", min: 0, step: 0.5},
];

export function SliderInspector({attributes, updateSettings}) {
    const rawSettings = attributes["wpbs-slider"] || {};

    const value = useMemo(() => {
        if (rawSettings && (rawSettings.props || rawSettings.breakpoints)) {
            return {
                props: rawSettings.props || {},
                breakpoints: rawSettings.breakpoints || {},
            };
        }
        return {props: rawSettings, breakpoints: {}};
    }, [rawSettings]);

    const sharedConfig = useMemo(() => ({isToolsPanel: false}), []);

    const handlePanelsChange = useCallback(
        (nextValue) => {
            updateSettings({
                props: nextValue?.props || {},
                breakpoints: nextValue?.breakpoints || {},
            });
        },
        [updateSettings]
    );

    const renderFields = useCallback(
        (entry, updateEntry, isBreakpoint) => {
            const settings = entry?.props || {};

            const applyPatch = (patch) => {
                updateEntry({props: {...(entry.props || {}), ...patch}});
            };

            const fields = isBreakpoint ? BREAKPOINT_SLIDER_FIELDS : BASE_SLIDER_FIELDS;

            return (
                <Grid columns={2} columnGap={15} rowGap={20} style={{padding: "12px"}}>
                    {fields.map((field) => (
                        <Field
                            key={field.slug}
                            field={field}
                            settings={settings}
                            callback={applyPatch}
                            {...sharedConfig}
                        />
                    ))}
                </Grid>
            );
        },
        [sharedConfig]
    );

    const renderBase = useCallback(({entry, update}) => renderFields(entry, update, false), [renderFields]);
    const renderBreakpoints = useCallback(({
                                               bpKey,
                                               entry,
                                               update
                                           }) => renderFields(entry, update, true), [renderFields]);

    return (
        <>

            <InspectorControls group="styles">
                <PanelBody
                    initialOpen={false}
                    className="wpbs-block-controls is-style-unstyled"
                    title={"Slider"}
                >
                    <BreakpointPanels
                        value={value}
                        onChange={handlePanelsChange}
                        render={{base: renderBase, breakpoints: renderBreakpoints}}
                    />
                </PanelBody>
            </InspectorControls>
        </>
    );
}
