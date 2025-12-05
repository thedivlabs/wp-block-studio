import {InspectorControls} from "@wordpress/block-editor";
import {useMemo, useCallback} from "@wordpress/element";
import {PanelBody, __experimentalGrid as Grid} from "@wordpress/components";
import {Field} from "Components/Field";
import {BreakpointPanels} from "Components/BreakpointPanels";

// Base slider fields
const BASE_SLIDER_NUMERIC_FIELDS = [
    {slug: "slidesPerView", type: "number", label: "Slides"},
    {slug: "slidesPerGroup", type: "number", label: "Group", min: 0, step: 0.5},
    {slug: "spaceBetween", type: "number", label: "Space"},
    {slug: "autoplay", type: "number", label: "Autoplay", min: 0, step: 0.5},
    {slug: "speed", type: "number", label: "Speed", min: 0, step: 100},
    {slug: "zoom", type: "number", label: "Zoom", min: 0, step: 1},
    {
        slug: "effect",
        type: "select",
        label: "Effect",
        options: [
            {label: "Select", value: ""},
            {label: "Slide", value: "slide"},
            {label: "Fade", value: "fade"},
            {label: "Cube", value: "cube"},
            {label: "Coverflow", value: "coverflow"},
            {label: "Flip", value: "flip"},
            {label: "Creative", value: "creative"},
            {label: "Cards", value: "cards"},
        ],
    },
    {slug: "slidesOffsetBefore", type: "number", label: "Offset Before", step: 10},
    {slug: "slidesOffsetAfter", type: "number", label: "Offset After", step: 10},
];

const BASE_SLIDER_TOGGLE_FIELDS = [
    {slug: "loop", type: "toggle", label: "Loop"},
    {slug: "freeMode", type: "toggle", label: "Free Mode"},
    {slug: "centeredSlides", type: "toggle", label: "Centered"},
    {slug: "centerInsufficientSlides", type: "toggle", label: "Center"},
    {slug: "keyboard", type: "toggle", label: "Keyboard"},
    {slug: "mousewheel", type: "toggle", label: "Mousewheel"},
    {slug: "preventClicks", type: "toggle", label: "Clicks"},
    {slug: "rewind", type: "toggle", label: "Rewind"},
];

// Breakpoint slider fields
const BREAKPOINT_SLIDER_FIELDS = [
    {slug: "slidesPerView", type: "number", label: "Slides"},
    {slug: "slidesPerGroup", type: "number", label: "Group", min: 0, step: 0.5},
    {slug: "spaceBetween", type: "number", label: "Space"},
    {slug: "autoplay", type: "number", label: "Autoplay", min: 0, step: 0.5},
    {slug: "speed", type: "number", label: "Speed", min: 0, step: 100},
    {slug: "slidesOffsetBefore", type: "number", label: "Offset Before", step: 10},
    {slug: "slidesOffsetAfter", type: "number", label: "Offset After", step: 10},
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

            if (isBreakpoint) {
                // Breakpoint grid
                return (
                    <Grid columns={2} columnGap={15} rowGap={20} style={{padding: "12px"}}>
                        {BREAKPOINT_SLIDER_FIELDS.map((field) => (
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
            }

            // Base fields split: numeric/select top, toggles bottom
            return (
                <Grid columns={1} columnGap={15} rowGap={20} style={{padding: "12px"}}>
                    <Grid columns={2} columnGap={15} rowGap={20}>
                        {BASE_SLIDER_NUMERIC_FIELDS.map((field) => (
                            <Field
                                key={field.slug}
                                field={field}
                                settings={settings}
                                callback={applyPatch}
                                {...sharedConfig}
                            />
                        ))}
                    </Grid>
                    <Grid columns={2} columnGap={15} rowGap={20}>
                        {BASE_SLIDER_TOGGLE_FIELDS.map((field) => (
                            <Field
                                key={field.slug}
                                field={field}
                                settings={settings}
                                callback={applyPatch}
                                {...sharedConfig}
                            />
                        ))}
                    </Grid>
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
    );
}
