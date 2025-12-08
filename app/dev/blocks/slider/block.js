// block

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {SliderInspector} from "./controls";
import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from "Components/Style";
import {useCallback, useEffect, useMemo} from "@wordpress/element";
import {isEqual} from "lodash";
import {cleanObject} from "Includes/helper";
import {InspectorControls} from "@wordpress/block-editor";
import {PanelBody} from "@wordpress/components";
import {Loop} from "Components/Loop";
import {MediaGalleryControls} from "Components/MediaGallery";

const selector = "wpbs-slider";

// --- NEW/MOVED CONSTANTS ---
// These are used for normalization and are moved from the Slider class.
const SPECIAL_PROP_MAP = {enabled: (val) => !val};
const PROPS_TO_SUPPRESS = ['enabled'];
const PAGINATION_PROPS = ['enabled', 'el', 'type', 'clickable', 'dynamicBullets', 'renderBullet', 'renderFraction', 'renderProgressbar', 'renderCustom'];

const getClassNames = (attributes = {}, settings = {}) => {
    const baseProps = settings?.props ?? {};
    return [
        selector,
        "h-auto w-full max-h-full flex flex-col swiper",
        !!baseProps?.vertical ? '--vertical' : null,
        !!baseProps?.enabled ? '--collapse' : null,
        !!baseProps?.master ? '--master' : null,
        !!baseProps?.controller && !baseProps?.master ? '--slave' : null,
    ].filter(Boolean).join(" ");
};

// --- NEW/MOVED HELPER FUNCTION ---
/**
 * Normalizes a single property value: coerces types (string -> boolean/number),
 * and applies special transformations (like inverting 'enabled').
 */
function normalizeProp(key, value) {
    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    else if (typeof value === 'string' && value !== '' && !isNaN(Number(value))) value = Number(value);

    // Treat the empty string as null/undefined for proper cleaning
    if (value === "" || value === "null" || value === null) return undefined;

    return SPECIAL_PROP_MAP[key] ? SPECIAL_PROP_MAP[key](value) : value;
}

/**
 * Creates a fully compliant Swiper args object from block settings.
 */
function normalizeSliderSettings(settings = {}) {
    const breakpointsConfig = window.WPBS?.settings?.breakpoints ?? {};
    const {props: rawProps = {}, breakpoints: rawBreakpoints = {}} = settings;

    // Helper to normalize, clean, and convert props to Swiper format
    const normalizeAndCleanProps = (obj = {}) => {
        const swiperProps = {};
        const paginationProps = {};

        for (const key in obj) {
            let value = obj[key];

            // 1. Handle Pagination (extract into its own object)
            if (key === 'pagination') {
                // If pagination is a string (e.g., 'bullets', 'progressbar'), set type
                paginationProps.type = value;
                paginationProps.enabled = !!value;
                // Add default elements if enabled
                if (!!value) {
                    paginationProps.el = paginationProps.el ?? '.swiper-pagination';
                }
                continue;
            } else if (PAGINATION_PROPS.includes(key)) {
                // If an explicit pagination sub-prop is set (e.g., 'clickable': true)
                paginationProps[key] = normalizeProp(key, value);
                continue;
            }

            // 2. Handle slidesOffset translation
            if (key === "slidesOffset") {
                // Apply Swiper-compliant property split
                const normalizedValue = normalizeProp(key, value);
                if (normalizedValue !== undefined) {
                    swiperProps.slidesOffsetAfter = normalizedValue;
                    swiperProps.slidesOffsetBefore = normalizedValue;
                }
                continue;
            }

            if (key === "vertical") {

                swiperProps.direction = 'vertical';

                continue;
            }

            // 3. Normalize all other props
            value = normalizeProp(key, value);

            if (value !== undefined) {
                swiperProps[key] = value;
            }
        }

        // Finalize Pagination: merge explicit props, and add to swiperProps if enabled
        const cleanedPagination = cleanObject(paginationProps);
        if (Object.keys(cleanedPagination).length > 0) {
            swiperProps.pagination = cleanedPagination;
        }

        return swiperProps;
    };

    // --- 1. Base Props ---
    const baseProps = normalizeAndCleanProps(rawProps);
    // Remove temporary flags that should not be in the final args object
    delete baseProps.controller;
    delete baseProps.master;

    const swiperArgs = {...baseProps, breakpoints: {}};

    // --- 2. Breakpoints ---
    for (const [customKey, entry] of Object.entries(rawBreakpoints)) {
        const bpProps = normalizeAndCleanProps(entry?.props || {});

        // Skip if no props are defined for this breakpoint
        if (Object.keys(bpProps).length === 0) continue;

        // 🌟 Map custom breakpoint key ('sm', 'md') to Swiper's required pixel size
        const bpMap = breakpointsConfig[customKey];
        if (!bpMap?.size) continue;

        const normalizedBp = {};

        // Apply Inheritance/Suppression Logic (Moved from Slider class)

        // Inherit base props (the base props of the block, not the base props of the Swiper args)
        // We iterate over the *raw* props to ensure we only inherit what was explicitly set.
        for (const key in rawProps) {
            if (PROPS_TO_SUPPRESS.includes(key) || key === 'slidesOffset') continue;

            // Inherit only if the breakpoint doesn't override it and it's not a pagination sub-prop
            if (bpProps[key] === undefined && !PAGINATION_PROPS.includes(key)) {
                normalizedBp[key] = baseProps[key]; // Use the already normalized value from baseProps
            }
        }

        // Override and add with breakpoint-specific normalized props
        Object.assign(normalizedBp, bpProps);


        if (Object.keys(normalizedBp).length > 0) {
            // Use the pixel size as the key
            swiperArgs.breakpoints[bpMap.size] = cleanObject(normalizedBp);
        }
    }

    return cleanObject(swiperArgs); // Remove any empty top-level properties
}

function getCssProps(settings, totalSlides = 0) {
    const baseProps = settings?.props || {};
    const breakpoints = settings?.breakpoints || {};

    const slides = baseProps.slidesPerView ?? null;
    const space = `${baseProps.spaceBetween ?? 0}px`;

    const css = {
        props: {
            "--space": space,
            "--slides": slides,
            "--total-slides": totalSlides,
        },
        breakpoints: {},
    };

    Object.entries(breakpoints).forEach(([bpKey, bpEntry = {}]) => {
        const bpProps = bpEntry?.props || {};
        const slides = bpProps.slidesPerView ?? null;
        const space = `${bpProps.spaceBetween ?? 0}px`;

        css.breakpoints[bpKey] = {
            props: {
                "--space": space,
                "--slides": slides,
                "--total-slides": totalSlides,
            },
        };
    });

    return cleanObject(css);
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        "wpbs-slider": {type: "object", default: {props: {}, breakpoints: {}}},
    },

    edit: withStyle((props) => {
        const {attributes, BlockWrapper, setAttributes, setCss, clientId} = props;

        const settings = attributes["wpbs-slider"];
        const loopSettings = settings?.loop;
        const gallerySettings = settings?.gallery;
        const classNames = getClassNames(attributes, settings);

        const isLoop = (attributes?.className ?? '').includes('is-style-loop');
        const isGallery = (attributes?.className ?? '').includes('is-style-gallery');

        // Count slides inside wpbs/slider-wrapper
        const totalSlides = useMemo(() => {
            const wrapperBlock = wp.data.select('core/block-editor').getBlocks(clientId)
                ?.find(block => block.name === 'wpbs/slider-wrapper');
            return wrapperBlock?.innerBlocks?.length || 0;
        }, [clientId]);

        // Set CSS including --total-slides
        useEffect(() => {
            setCss(getCssProps(settings, totalSlides));
        }, [JSON.stringify(settings), totalSlides, setCss]);

        // Centralized settings update
        const updateSettings = useCallback(
            (nextValue) => {
                if (!isEqual(settings, nextValue)) {
                    setAttributes({"wpbs-slider": nextValue});
                }
            },
            [settings, setAttributes]
        );

        // Track block style flags
        useEffect(() => {
            if (attributes?.isLoop !== isLoop || attributes?.isGallery !== isGallery) {
                setAttributes({isLoop, isGallery});
            }
        }, [isLoop, isGallery, setAttributes, attributes]);

        const inspectorPanel = useMemo(() => (
            <>
                {isLoop && (
                    <PanelBody title="Loop" initialOpen={false} className="wpbs-block-controls">
                        <Loop
                            settings={loopSettings}
                            setAttributes={setAttributes}
                            callback={(newValue) => updateSettings({loop: newValue})} // passes changes back through updateSettings
                        />
                    </PanelBody>
                )}

                {isGallery && (
                    <PanelBody title="Gallery" initialOpen={false} className="wpbs-block-controls">
                        <MediaGalleryControls
                            settings={gallerySettings}
                            setAttributes={setAttributes}
                            callback={(newValue) => updateSettings({gallery: newValue})} // passes changes back through updateSettings
                        />
                    </PanelBody>
                )}

                <SliderInspector attributes={attributes} updateSettings={updateSettings}/>
            </>
        ), [updateSettings, settings, isLoop, isGallery, loopSettings, gallerySettings]);

        return (
            <>
                <InspectorControls group="styles">{inspectorPanel}</InspectorControls>
                <BlockWrapper props={props} className={classNames}/>
            </>
        );
    }, {hasChildren: true, hasBackground: false, bpMin: true}),

    save: withStyleSave((props) => {
        const {attributes, BlockWrapper} = props;
        const settings = attributes["wpbs-slider"];
        const classNames = getClassNames(attributes, settings);

        // 🌟 Fully normalized Swiper args object
        const swiperArgs = normalizeSliderSettings(settings || {});

        const controllerProp = settings?.props?.controller;

        const controllerProps = Object.fromEntries(
            Object.entries({'data-slider-controller': controllerProp}).filter(([key, val]) => !!val)
        );

        return (
            <BlockWrapper
                className={classNames}
                // 🌟 Output the fully compliant Swiper args
                data-context={JSON.stringify(swiperArgs)}
                {...controllerProps}
            />
        );
    }, {hasChildren: true, hasBackground: false, bpMin: true}),
});