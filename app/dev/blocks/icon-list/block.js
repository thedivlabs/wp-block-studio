import "./scss/block.css";

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {InspectorControls} from "@wordpress/block-editor";

import {
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl,
    PanelBody,
} from "@wordpress/components";

import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from "Components/Style";
import {useCallback, useEffect, useMemo} from "@wordpress/element";
import {isEmpty, isEqual} from "lodash";
import {Field} from "Components/Field";
import {cleanObject} from "Includes/helper";
import {BreakpointPanels} from "Components/BreakpointPanels";

/* --------------------------------------------------------------
 * NORMALIZER — identical to GRID block pattern
 * -------------------------------------------------------------- */
function normalizeIconListSettings(raw = {}) {
    if (raw && (raw.props || raw.breakpoints)) {
        return {
            props: raw.props || {},
            breakpoints: raw.breakpoints || {},
        };
    }

    // legacy shape
    return {
        props: raw || {},
        breakpoints: {},
    };
}

const selector = "wpbs-icon-list";

/* --------------------------------------------------------------
 * CSS VAR BUILDER
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
    const baseVars = cssVarsFromProps(settings.props);

    const breakpoints = {};
    Object.entries(settings.breakpoints).forEach(([bp, entry]) => {
        breakpoints[bp] = {
            props: {
                ...baseVars,
                ...cssVarsFromProps(entry.props || {}),
            },
        };
    });

    return {
        props: baseVars,
        breakpoints,
    };
}

/* --------------------------------------------------------------
 * BREAKPOINT CONTROL PANEL
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
                            icon: val,
                        },
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
                            divider: val,
                        },
                    })
                }
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />

            <NumberControl
                label="Columns"
                value={props.columns ?? ""}
                onChange={(val) => {
                    update({
                        props:
                            val === ""
                                ? {}
                                : {
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
 * CLASSNAMES
 * -------------------------------------------------------------- */
const getClassNames = (attributes) => {
    const settings = attributes["wpbs-icon-list"];

    return [
        selector,
        "w-full",
        "flex flex-col",
        "relative",
        !isEmpty(cleanObject(settings?.props?.divider ?? {}, true))
            ? "--divider"
            : null,
    ]
        .filter(Boolean)
        .join(" ");
};

/* --------------------------------------------------------------
 * BLOCK REGISTRATION
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
            const {
                attributes,
                BlockWrapper,
                setAttributes,
                setCss,
            } = props;

            const {'wpbs-icon-lis': settings = {}} = attributes ?? {};

            /* Apply CSS vars */
            useEffect(() => {
                setCss(getCssProps(settings));
            }, [settings]);

            const classNames = getClassNames(attributes);

            /* --------------------------------------------------------------
             * UPDATE SETTINGS — identical to GRID block approach
             * -------------------------------------------------------------- */
            const updateSettings = useCallback(
                (nextValue) => {
                    const normalized = normalizeIconListSettings(nextValue);

                    if (!isEqual(settings, normalized)) {
                        setAttributes({"wpbs-icon-list": normalized});
                    }
                },
                [settings, setAttributes]
            );

            return (
                <>
                    <InspectorControls group="styles">
                        <PanelBody
                            initialOpen
                            className="wpbs-controls is-style-unstyled"
                        >
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
        {hasChildren: true, tagName: "ul"}
    ),

    save: withStyleSave(
        (props) => {
            const {attributes, BlockWrapper} = props;
            const classNames = getClassNames(attributes);

            return <BlockWrapper props={props} className={classNames}/>;
        },
        {hasChildren: true, tagName: "ul"}
    ),
});
