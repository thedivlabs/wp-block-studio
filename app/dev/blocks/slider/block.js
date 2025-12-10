// block

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {SliderInspector, normalizeSliderSettings} from "./controls";
import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from "Components/Style";
import {useEffect, useMemo} from "@wordpress/element";
import {cleanObject} from "Includes/helper";
import {InspectorControls} from "@wordpress/block-editor";
import {PanelBody} from "@wordpress/components";
import {Loop, LOOP_ATTRIBUTES} from "Components/Loop";
import {GALLERY_ATTRIBUTES, MediaGalleryControls} from "Components/MediaGallery";

const selector = "wpbs-slider";

const getClassNames = (attributes = {}, settings = {}) => {
    const baseProps = settings?.props ?? {};
    return [
        selector,
        "h-auto w-full max-h-full flex flex-col swiper",
        !!baseProps?.vertical ? "--vertical" : null,
        !!baseProps?.enabled ? "--collapse" : null,
        !!baseProps?.master ? "--master" : null,
        !!baseProps?.controller && !baseProps?.master ? "--slave" : null,
    ]
        .filter(Boolean)
        .join(" ");
};

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
        const slidesBp = bpProps.slidesPerView ?? null;
        const spaceBp = `${bpProps.spaceBetween ?? 0}px`;

        css.breakpoints[bpKey] = {
            props: {
                "--space": spaceBp,
                "--slides": slidesBp,
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
        ...GALLERY_ATTRIBUTES,
        ...LOOP_ATTRIBUTES,
        "wpbs-slider": {type: "object", default: {props: {}, breakpoints: {}}},
    },

    edit: withStyle((props) => {
        const {attributes, BlockWrapper, setAttributes, setCss, clientId} = props;

        const settings = attributes["wpbs-slider"] || {};
        const classNames = getClassNames(attributes, settings);

        const isLoop = (attributes?.className ?? "").includes("is-style-loop");
        const isGallery = (attributes?.className ?? "").includes("is-style-gallery");

        useEffect(() => {
            const next = {
                isLoop,
                isGallery
            };

            if (
                next.isLoop !== attributes.isLoop ||
                next.isGallery !== attributes.isGallery
            ) {
                setAttributes(next);
            }
        }, [isLoop, isGallery]);


        const totalSlides = useMemo(() => {
            const wrapperBlock = wp.data
                .select("core/block-editor")
                .getBlocks(clientId)
                ?.find((block) => block.name === "wpbs/slider-wrapper");
            return wrapperBlock?.innerBlocks?.length || 0;
        }, [clientId]);

        useEffect(() => {
            setCss(getCssProps(settings, totalSlides));
        }, [JSON.stringify(settings), totalSlides, setCss]);


        const inspectorPanel = useMemo(
            () => (
                <>
                    {isLoop && (
                        <PanelBody
                            title="Loop"
                            initialOpen={false}
                            className="wpbs-block-controls"
                        >
                            <Loop
                                attributes={attributes}
                                setAttributes={setAttributes}
                                enabled={isLoop}
                            />
                        </PanelBody>
                    )}

                    {isGallery && (
                        <PanelBody
                            title="Gallery"
                            initialOpen={false}
                            className="wpbs-block-controls"
                        >
                            <MediaGalleryControls
                                attributes={attributes}
                                setAttributes={setAttributes}
                                enabled={isGallery}
                            />
                        </PanelBody>
                    )}

                    <SliderInspector
                        attributes={attributes}
                        setAttributes={setAttributes}
                    />
                </>
            ),
            [
                attributes,
                setAttributes,
                settings,
                isLoop,
                isGallery,
            ]
        );

        return (
            <>
                <InspectorControls group="styles">{inspectorPanel}</InspectorControls>
                <BlockWrapper props={props} className={classNames}/>
            </>
        );
    }, {hasChildren: true, hasBackground: false, bpMin: true}),

    save: withStyleSave((props) => {
        const {attributes, BlockWrapper} = props;
        const settings = attributes["wpbs-slider"] || {};
        const classNames = getClassNames(attributes, settings);

        // Use normalizeSliderSettings exported from controls.js
        const swiperArgs = normalizeSliderSettings(settings || {});

        const controllerProp = settings?.props?.controller;

        const controllerProps = Object.fromEntries(
            Object.entries({"data-slider-controller": controllerProp}).filter(
                ([, val]) => !!val
            )
        );

        return (
            <BlockWrapper
                className={classNames}
                data-context={JSON.stringify(swiperArgs)}
                {...controllerProps}
            />
        );
    }, {hasChildren: true, hasBackground: false, bpMin: true}),
});
