import "./scss/block.scss";

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {SliderInspector} from "./controls";
import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from "Components/Style";
import {useCallback, useEffect, useMemo} from "@wordpress/element";
import {anyProp, getBreakpointPropsList,cleanObject} from "Includes/helper";
import {isEqual} from "lodash";

const selector = "wpbs-slider";

/**
 * Normalize wpbs-slider shape into { props, breakpoints }
 * Supports legacy flat format.
 */
const normalizeSettings = (raw) => {
    if (raw && (raw.props || raw.breakpoints)) {
        return {
            props: raw.props || {},
            breakpoints: raw.breakpoints || {},
        };
    }

    return {
        props: raw || {},
        breakpoints: {},
    };
};

const getClassNames = (attributes = {}, settings = {}) => {
    const base = settings.props || {};
    const bpPropsList = getBreakpointPropsList(settings);

    return [
        selector,
        "h-auto w-full max-h-full flex flex-col swiper",
    ]
        .filter(Boolean)
        .join(" ");
};

function getCssProps(settings) {
    const baseProps = settings?.props || {};
    const breakpoints = settings?.breakpoints || {};


    const css = {
        props: {},
        breakpoints: {},
    };

    Object.entries(breakpoints).forEach(([bpKey, bpEntry = {}]) => {
        const bpProps = bpEntry?.props || {};

        css.breakpoints[bpKey] = {
            props: {},
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
            default: {},
        },
    },

    edit: withStyle((props) => {
        const {
            attributes,
            BlockWrapper,
            setCss,
            setAttributes,
        } = props;

        const rawSettings = attributes["wpbs-slider"] || {};

        const settings = useMemo(
            () => normalizeSettings(rawSettings),
            [rawSettings]
        );

        const classNames = getClassNames(attributes, settings);

        // ---------------------------------------------------------
        // SEND CSS + PRELOAD TO HOC (mirrors video block)
        // ---------------------------------------------------------
        useEffect(() => {
            setCss(getCssProps(settings));
        }, [settings, setCss]);

        const updateSettings = useCallback(
            (nextValue) => {
                const normalized = normalizeSettings(nextValue);
                if (!isEqual(settings, normalized)) {
                    setAttributes({
                        "wpbs-slider": normalized,
                    });
                }
            },
            [settings, setAttributes]
        );

        const inspectorPanel = useMemo(
            () => (
                <SliderInspector
                    attributes={attributes}
                    updateSettings={updateSettings}
                />
            ),
            [attributes, updateSettings]
        );

        return (
            <>
                {inspectorPanel}

                <BlockWrapper
                    props={props}
                    className={classNames}
                />
            </>
        );
    }, {
        hasChildren: true,
        hasBackground: false
    }),

    save: withStyleSave((props) => {
        const {attributes, BlockWrapper} = props;

        const rawSettings = attributes["wpbs-slider"] || {};
        const settings = normalizeSettings(rawSettings);
        const classNames = getClassNames(attributes, settings);

        return (
            <BlockWrapper
                props={props}
                className={classNames}
            />
        );
    }, {
        hasChildren: true,
        hasBackground: false
    }),
});