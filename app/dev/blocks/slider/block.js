import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {SliderInspector} from "./controls";
import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from "Components/Style";
import {Loop} from "Components/Loop";
import {BreakpointPanels} from "Components/BreakpointPanels";
import {useCallback, useEffect, useMemo} from "@wordpress/element";
import {isEqual} from "lodash";
import {cleanObject} from "Includes/helper";
import {InspectorControls} from "@wordpress/block-editor";

const selector = "wpbs-slider";

const getClassNames = (attributes = {}, settings = {}) => {
    const baseProps = settings?.props ?? {};
    return [
        selector,
        "h-auto w-full max-h-full flex flex-col swiper",
        !!baseProps?.collapse ? '--collapse' : null,
    ].filter(Boolean).join(" ");
};

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
            default: {props: {}, breakpoints: {}, query: {}},
        },
    },

    edit: withStyle((props) => {
        const {attributes, BlockWrapper, setAttributes, setCss} = props;
        const settings = attributes["wpbs-slider"];
        const classNames = getClassNames(attributes, settings);

        useEffect(() => {
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

        // Loop updater
        const updateQuerySettings = useCallback(
            (nextQuery) => {
                const current = settings.query || {};
                if (!isEqual(current, nextQuery)) {
                    updateSettings({...settings, query: nextQuery});
                }
            },
            [settings, updateSettings]
        );

        const loopControls = useMemo(() => {
            return settings.style === "loop" ? (
                <Loop value={settings.query || {}} onChange={updateQuerySettings}/>
            ) : null;
        }, [settings.style, settings.query, updateQuerySettings]);

        return (
            <>
                <InspectorControls group={'styles'}>
                    {loopControls}
                    <BreakpointPanels
                        value={settings}
                        onChange={updateSettings}
                        label="Slider Breakpoints"
                        render={{
                            base: (props) => <SliderInspector {...props} attributes={attributes}
                                                              updateSettings={updateSettings}/>,
                            breakpoints: (props) => <SliderInspector {...props} attributes={attributes}
                                                                     updateSettings={updateSettings}/>,
                        }}
                    />
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

        return (
            <BlockWrapper
                className={classNames}
                data-wp-interactive="wpbs/slider"
                data-wp-init="actions.observe"
                data-wp-context={JSON.stringify(settings || {})}
            />
        );
    }, {
        hasChildren: true,
        hasBackground: false,
        bpMin: true,
    }),
});