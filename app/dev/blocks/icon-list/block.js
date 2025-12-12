import "./scss/block.css";

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {InspectorControls} from "@wordpress/block-editor";

import {
    PanelBody,
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl,
} from "@wordpress/components";

import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from "Components/Style";
import {useCallback, useEffect, useMemo} from "@wordpress/element";
import {isEmpty, isEqual} from "lodash";
import {Field} from "Components/Field";
import {cleanObject} from "Includes/helper";
import {BreakpointPanels} from "Components/BreakpointPanels";

/* --------------------------------------------------------------
 * Normalizer — ALL settings must live inside:
 *   settings.props
 *   settings.breakpoints[bp].props
 * -------------------------------------------------------------- */
function normalizeIconListSettings(raw = {}) {
    // Already normalized
    if (raw && (raw.props || raw.breakpoints)) {
        return {
            props: raw.props || {},
            breakpoints: raw.breakpoints || {},
        };
    }

    // Legacy / flat shape → move everything into props
    return {
        props: raw || {},
        breakpoints: {},
    };
}

const selector = "wpbs-icon-list";

/* --------------------------------------------------------------
 * CSS Builder
 * -------------------------------------------------------------- */
function cssVarsFromProps(props = {}) {
    const divider = props.divider ?? {};
    const icon = props.icon ?? {};

    return {
        "--columns": props.columns ?? null,
        "--divider": Object.values(divider).join(" "),
        "--icon": icon?.name ? `"${icon.name}"` : null,
        "--icon-color": icon?.color ?? null,
        "--icon-size": icon?.size ? `${icon.size}px` : "1em",
        "--icon-css": icon?.css ?? null,
    };
}


function getCssProps(settings) {
    const baseProps = settings?.props || {};
    const breakpoints = settings?.breakpoints || {};

    const baseVars = cssVarsFromProps(baseProps);

    const css = {
        props: baseVars,
        breakpoints: {},
    };

    Object.entries(breakpoints).forEach(([bpKey, bpEntry]) => {
        const bpProps = bpEntry?.props || {};

        css.breakpoints[bpKey] = {
            props: {
                ...baseVars,                 // fallback to base
                ...cssVarsFromProps(bpProps) // override with breakpoint values
            }
        };
    });

    return cleanObject(css);
}


/* --------------------------------------------------------------
 * Breakpoint Controls
 * -------------------------------------------------------------- */
const BreakpointControls = ({entry, update}) => {
    const props = entry?.props || {};

    return (
        <Grid columns={2} columnGap={10} rowGap={10} style={{padding: "14px"}}>

            <Field
                key="icon"
                field={{type: "icon", slug: "icon", label: "Icon", full: true}}
                props={props}
                callback={(val) =>
                    update({
                        props: {
                            ...props,
                            icon: val
                        }
                    })
                }
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />

            <Field
                key="divider"
                field={{type: "border", slug: "divider", label: "Divider", full: true}}
                props={props}
                callback={(val) =>
                    update({
                        props: {
                            ...props,
                            divider: val
                        }
                    })
                }
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />

            <NumberControl
                label="Columns"
                value={props.columns ?? ""}
                onChange={(val) => {
                    if (val === "") {
                        update({});
                        return;
                    }
                    update({
                        props: {
                            ...props,
                            columns: parseInt(val, 10) || 1,
                        },
                    });
                }}
                min={1}
                max={6}
                __next40pxDefaultSize
            />

        </Grid>
    );
};

/* --------------------------------------------------------------
 * Block Registration
 * -------------------------------------------------------------- */
registerBlockType(metadata.name, {
    apiVersion: 3,

    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,

        "wpbs-icon-list": {
            type: "object",
            default: {},
        },
    },

    edit: withStyle(
        (props) => {
            const {attributes, setAttributes, BlockWrapper, styleData, setCss} = props;

            const {'wpbs-icon-list': settings} = attributes;

            const classNames = [
                selector,
                "w-full",
                "flex flex-col",
                "relative",
                !isEmpty(cleanObject(settings.props.divider, true)) ? "--divider" : null,
            ]
                .filter(Boolean)
                .join(" ");

            useEffect(() => {
                setCss(getCssProps(settings));
            }, [settings]);

            /* ----------------------------------------------
             * Settings updater — deep merge props + breakpoints
             * ---------------------------------------------- */
            const updateSettings = useCallback(
                (nextValue) => {
                    const next = normalizeIconListSettings({
                        ...settings,
                        ...nextValue,
                        props: {
                            ...settings.props,
                            ...(nextValue.props || {}),
                        },
                        breakpoints: {
                            ...settings.breakpoints,
                            ...(nextValue.breakpoints || {}),
                        },
                    });

                    if (!isEqual(settings, next)) {
                        setAttributes({"wpbs-icon-list": next});
                    }
                },
                [settings, setAttributes]
            );

            return (
                <>
                    <InspectorControls group="styles">
                        <PanelBody initialOpen className="wpbs-controls is-style-unstyled">

                            <BreakpointPanels
                                value={settings}
                                onChange={updateSettings}
                                label="Icon List"
                                render={{
                                    base: BreakpointControls,
                                    breakpoints: BreakpointControls,
                                }}
                            />

                        </PanelBody>
                    </InspectorControls>

                    <BlockWrapper props={props} className={classNames}/>
                </>
            );
        },
        {hasChildren: true}
    ),

    save: withStyleSave((props) => {
        const {attributes, styleData, BlockWrapper} = props;

        const classNames = [
            selector,
            "w-full",
            "flex flex-col",
            "relative",
        ]
            .filter(Boolean)
            .join(" ");

        return <BlockWrapper props={props} className={classNames}/>;
    }, {hasChildren: true}),
});
