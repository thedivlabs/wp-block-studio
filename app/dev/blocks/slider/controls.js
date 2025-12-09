import {useMemo, useCallback} from "@wordpress/element";
import {PanelBody, __experimentalGrid as Grid} from "@wordpress/components";
import {Field} from "Components/Field";
import {BreakpointPanels} from "Components/BreakpointPanels";
import {cleanObject} from "Includes/helper";

// Base slider fields
const BASE_SLIDER_NUMERIC_FIELDS = [
    {slug: "slidesPerView", type: "number", label: "Slides"},
    {slug: "slidesPerGroup", type: "number", label: "Group", min: 0},
    {slug: "spaceBetween", type: "number", label: "Space", min: 0, step: 5, shiftStep: 10},
    {slug: "autoplay", type: "number", label: "Autoplay", min: 0, step: 0.5, shiftStep: 1},
    {slug: "speed", type: "number", label: "Speed", min: 0, step: 100},
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
    {
        slug: "pagination",
        type: "select",
        label: "Pagination",
        options: [
            {label: "Select", value: ""},
            {label: "Progress", value: "progressbar"},
            {label: "Bullets", value: "bullets"},
            {label: "Fraction", value: "fraction"},
        ],
    },
    {slug: "slidesOffset", type: "number", label: "Offset Slides", step: 10},
    {slug: "controller", type: "number", label: "Controller", step: 1, min: 1},
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
    {slug: "enabled", type: "toggle", label: "Collapse"},
    {slug: "master", type: "toggle", label: "Master"},
    {slug: "vertical", type: "toggle", label: "Vertical"},
];

// Breakpoint slider fields
const BREAKPOINT_SLIDER_FIELDS = [
    {slug: "slidesPerView", type: "number", label: "Slides"},
    {slug: "slidesPerGroup", type: "number", label: "Group", min: 0},
    {slug: "spaceBetween", type: "number", label: "Space", min: 0, step: 5, shiftStep: 10},
    {slug: "autoplay", type: "number", label: "Autoplay", min: 0, step: 0.5, shiftStep: 1},
    {slug: "speed", type: "number", label: "Speed", min: 0, step: 100},
    {slug: "slidesOffset", type: "number", label: "Offset Slides", step: 10},
];

const BREAKPOINT_SLIDER_TOGGLE_FIELDS = [
    {slug: "freeMode", type: "toggle", label: "Free Mode"},
    {slug: "keyboard", type: "toggle", label: "Keyboard"},
    {slug: "mousewheel", type: "toggle", label: "Mousewheel"},
    {slug: "rewind", type: "toggle", label: "Rewind"},
    {slug: "enabled", type: "toggle", label: "Collapse"},
];

// --- Parsing / normalization helpers moved from block.js ---

const SPECIAL_PROP_MAP = {enabled: (val) => !val};
const PROPS_TO_SUPPRESS = ["enabled"];
const PAGINATION_PROPS = [
    "enabled",
    "el",
    "type",
    "clickable",
    "dynamicBullets",
    "renderBullet",
    "renderFraction",
    "renderProgressbar",
    "renderCustom",
];

function normalizeProp(key, value) {
    if (value === "true") value = true;
    else if (value === "false") value = false;
    else if (typeof value === "string" && value !== "" && !isNaN(Number(value))) {
        value = Number(value);
    }

    if (value === "" || value === "null" || value === null) return undefined;

    return SPECIAL_PROP_MAP[key] ? SPECIAL_PROP_MAP[key](value) : value;
}

function normalizeAndCleanProps(obj = {}) {
    const swiperProps = {};
    const paginationProps = {};

    for (const key in obj) {
        let value = obj[key];

        if (key === "pagination") {
            paginationProps.type = value;
            paginationProps.enabled = !!value;
            if (!!value) {
                paginationProps.el = paginationProps.el ?? ".swiper-pagination";
            }
            continue;
        } else if (PAGINATION_PROPS.includes(key)) {
            paginationProps[key] = normalizeProp(key, value);
            continue;
        }

        if (key === "slidesOffset") {
            const normalizedValue = normalizeProp(key, value);
            if (normalizedValue !== undefined) {
                swiperProps.slidesOffsetAfter = normalizedValue;
                swiperProps.slidesOffsetBefore = normalizedValue;
            }
            continue;
        }

        if (key === "vertical") {
            swiperProps.direction = "vertical";
            continue;
        }

        value = normalizeProp(key, value);

        if (value !== undefined) {
            swiperProps[key] = value;
        }
    }

    const cleanedPagination = cleanObject(paginationProps);
    if (Object.keys(cleanedPagination).length > 0) {
        swiperProps.pagination = cleanedPagination;
    }

    return swiperProps;
}

// --- Exported Swiper args builder, used only in save() ---

export function normalizeSliderSettings(settings = {}) {
    const breakpointsConfig = window.WPBS?.settings?.breakpoints ?? {};
    const {props: rawProps = {}, breakpoints: rawBreakpoints = {}} = settings;

    const baseProps = normalizeAndCleanProps(rawProps);
    delete baseProps.controller;
    delete baseProps.master;

    const swiperArgs = {...baseProps, breakpoints: {}};

    for (const [customKey, entry] of Object.entries(rawBreakpoints)) {
        const bpProps = normalizeAndCleanProps(entry?.props || {});

        if (Object.keys(bpProps).length === 0) continue;

        const bpMap = breakpointsConfig[customKey];
        if (!bpMap?.size) continue;

        const normalizedBp = {};

        // Inherit base props (only explicitly set in rawProps)
        for (const key in rawProps) {
            if (PROPS_TO_SUPPRESS.includes(key) || key === "slidesOffset") continue;

            if (bpProps[key] === undefined && !PAGINATION_PROPS.includes(key)) {
                normalizedBp[key] = baseProps[key];
            }
        }

        Object.assign(normalizedBp, bpProps);

        if (Object.keys(normalizedBp).length > 0) {
            swiperArgs.breakpoints[bpMap.size] = cleanObject(normalizedBp);
        }
    }

    return cleanObject(swiperArgs);
}

// --- SliderInspector: now uses attributes + setAttributes ---

export function SliderInspector({attributes, setAttributes}) {
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
            const current = attributes["wpbs-slider"] || {};

            const merged = {
                ...current,
                ...nextValue,
                props: {
                    ...(current.props || {}),
                    ...(nextValue?.props || {}),
                },
                breakpoints: {
                    ...(current.breakpoints || {}),
                    ...(nextValue?.breakpoints || {}),
                },
            };

            setAttributes({
                "wpbs-slider": merged,
            });
        },
        [attributes, setAttributes]
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
                    <Grid columns={1} columnGap={15} rowGap={20} style={{padding: "12px"}}>
                        <Grid columns={2} columnGap={15} rowGap={20}>
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
                        <Grid columns={2} columnGap={15} rowGap={20}>
                            {BREAKPOINT_SLIDER_TOGGLE_FIELDS.map((field) => (
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

    const renderBase = useCallback(
        ({entry, update}) => renderFields(entry, update, false),
        [renderFields]
    );

    const renderBreakpoints = useCallback(
        ({bpKey, entry, update}) => renderFields(entry, update, true),
        [renderFields]
    );

    return (
        <PanelBody
            initialOpen={false}
            className="wpbs-block-controls is-style-unstyled"
            title="Slider"
        >
            <BreakpointPanels
                value={value}
                onChange={handlePanelsChange}
                render={{base: renderBase, breakpoints: renderBreakpoints}}
            />
        </PanelBody>
    );
}
