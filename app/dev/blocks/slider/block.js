import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {SliderInspector} from "./controls";
import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from "Components/Style";
import {useCallback, useEffect, useMemo} from "@wordpress/element";
import {isEqual} from "lodash";
import {cleanObject} from "Includes/helper";
import {InspectorControls} from "@wordpress/block-editor";
import {PanelBody} from "@wordpress/components";
import {Loop} from "Components/Loop"; // ← import Loop component

const selector = "wpbs-slider";

const getClassNames = (attributes = {}, settings = {}) => {
    const baseProps = settings?.props ?? {};

    return [
        selector,
        "h-auto w-full max-h-full flex flex-col swiper",
        !!baseProps?.enabled ? '--collapse' : null,
        !!baseProps?.master ? '--master' : null,
        !!baseProps?.controller && !baseProps?.master ? '--slave' : null,
    ]
        .filter(Boolean)
        .join(" ");
};

function normalizeSliderSettings(settings = {}) {
    const {props = {}, breakpoints = {}} = settings;

    const normalizeProps = (obj = {}) => {
        const out = {...obj};

        for (const key in out) {
            const value = out[key];

            switch (key) {
                case "slidesOffset":

                    out.slidesOffsetAfter = value;
                    out.slidesOffsetBefore = value;

                    break;
                default:
                    break;
            }

            // Cleanup for empty values
            const isEmpty =
                value === "" ||
                value == null ||
                (typeof value === "object" &&
                    !Array.isArray(value) &&
                    Object.keys(value).length === 0);

            if (isEmpty) delete out[key];
        }

        return out;
    };

    const normalized = {
        props: normalizeProps(props),
        breakpoints: {},
    };

    // Normalize breakpoints exactly the same way
    for (const [bp, entry] of Object.entries(breakpoints)) {
        const bpProps = normalizeProps(entry?.props || {});
        if (Object.keys(bpProps).length > 0) {
            normalized.breakpoints[bp] = {props: bpProps};
        }
    }

    return normalized;
}


function getCssProps(settings) {
    const baseProps = settings?.props || {};
    const breakpoints = settings?.breakpoints || {};

    const slides = baseProps.slidesPerView ?? null;
    const space = `${baseProps.spaceBetween ?? 0}px`;

    const css = {
        props: {
            "--space": space,
            "--slides": slides,
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
        "wpbs-slider": {
            type: "object",
            default: {props: {}, breakpoints: {}}, // query stored here
        },
    },

    edit: withStyle((props) => {
        const {attributes, BlockWrapper, setAttributes, setCss} = props;

        const settings = attributes["wpbs-slider"];
        const querySettings = attributes["wpbs-query"];
        const classNames = getClassNames(attributes, settings);

        const isLoop = (attributes?.className ?? '').includes('is-style-loop');

        useEffect(() => {
            console.log(settings);
            setCss(getCssProps(settings));
        }, [JSON.stringify(settings), setCss]);

        // Update wpbs-slider attribute
        const updateSettings = useCallback(
            (nextValue) => {
                if (!isEqual(settings, nextValue)) {
                    setAttributes({"wpbs-slider": nextValue});
                }
            },
            [settings, setAttributes]
        );

        const handleLoopChange = useCallback(
            (nextQuery) => {
                const newQuerySettings = {
                    ...querySettings,
                    ...nextQuery,
                };

                if (!isEqual(querySettings, newQuerySettings)) {
                    setAttributes({
                        "wpbs-query": newQuerySettings,
                    });
                }
            },
            [querySettings, setAttributes]
        );

        useEffect(() => {
            if (attributes?.isLoop !== isLoop) {
                setAttributes({isLoop: !!isLoop});
            }
        }, [isLoop, setAttributes]);

        const inspectorPanel = useMemo(() => (
            <>
                {isLoop && (
                    <PanelBody title="Loop" initialOpen={false} className="wpbs-block-controls">
                        <Loop value={querySettings || {}} onChange={handleLoopChange}/>
                    </PanelBody>
                )}
                <SliderInspector attributes={attributes} updateSettings={updateSettings}/>
            </>
        ), [updateSettings, settings, handleLoopChange, isLoop, querySettings]);

        return (
            <>
                <InspectorControls group="styles">
                    {inspectorPanel}
                </InspectorControls>
                <BlockWrapper props={props} className={classNames}/>
            </>
        );
    }, {
        hasChildren: true,
        hasBackground: false,
        bpMin: true,
    }),

    save: withStyleSave((props) => {
        const {attributes, BlockWrapper} = props;
        const settings = attributes["wpbs-slider"];
        const classNames = getClassNames(attributes, settings);

        const controllerProps = Object.fromEntries(Object.entries({'data-slider-controller': settings?.props?.controller}).filter(([key, val]) => !!val));

        return (
            <BlockWrapper
                className={classNames}
                data-wp-interactive="wpbs/slider"
                data-wp-init="actions.observe"
                data-wp-context={JSON.stringify(normalizeSliderSettings(settings || {}))}
                {...controllerProps}
            />
        );
    }, {
        hasChildren: true,
        hasBackground: false,
        bpMin: true,
    }),
});