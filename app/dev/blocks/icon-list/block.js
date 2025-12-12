import "./scss/block.css";

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {InspectorControls} from "@wordpress/block-editor";
import {__experimentalGrid as Grid, PanelBody} from "@wordpress/components";

import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from "Components/Style";
import {useCallback, useEffect, useMemo} from "@wordpress/element";
import {isEmpty, isEqual} from "lodash";
import {Field} from "Components/Field";
import {cleanObject} from "Includes/helper";
import {BreakpointPanels} from "Components/BreakpointPanels";

/* --------------------------------------------------------------
 * FIELD MAP
 * -------------------------------------------------------------- */
const FIELDS = [
    {type: "icon", slug: "icon", label: "Icon", full: true},
    {type: "border", slug: "divider", label: "Divider", full: true},
    {type: "number", slug: "columns", label: "Columns", min: 1, max: 6},
    {type: "unit", slug: "icon-space", label: "Space"},
];

/* --------------------------------------------------------------
 * NORMALIZER — SAME PATTERN AS GRID BLOCK
 * -------------------------------------------------------------- */
function normalizeIconListSettings(raw = {}) {
    if (raw && (raw.props || raw.breakpoints)) {
        return {
            props: raw.props || {},
            breakpoints: raw.breakpoints || {},
        };
    }

    // legacy / flat shape
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
        "--icon-space": props?.['icon-space'] ?? null,
    };
}

function getCssProps(settings = {props: {}, breakpoints: {}}) {
    const baseVars = cssVarsFromProps(settings.props || {});
    const breakpoints = {};

    Object.entries(settings?.breakpoints ?? {}).forEach(([bp, entry]) => {
        breakpoints[bp] = {
            props: {
                ...baseVars,
                ...cssVarsFromProps(entry.props || {}),
            },
        };
    });

    return cleanObject({
        props: baseVars,
        breakpoints,
    });
}


const BreakpointControls = ({entry, update, blockProps}) => {
    const bpSettings = entry?.props || {};

    return (
        <Grid columns={2} columnGap={15} rowGap={20} style={{padding: "12px"}}>
            {FIELDS.map((field) => (
                <Field
                    key={field.slug}
                    field={field}
                    settings={bpSettings}
                    props={blockProps}
                    isToolsPanel={false}
                    callback={(patch) =>
                        update({
                            props: {
                                ...bpSettings,
                                ...patch,
                            },
                        })
                    }
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
            ))}
        </Grid>
    );
};

/* --------------------------------------------------------------
 * CLASSNAMES
 * -------------------------------------------------------------- */
const getClassNames = (attributes, settings) => {
    const effectiveSettings =
        settings || normalizeIconListSettings(attributes["wpbs-icon-list"] || {});

    return [
        selector,
        "w-full",
        "flex flex-col",
        "relative",
        !isEmpty(cleanObject(effectiveSettings?.props?.divider ?? {}, true))
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
            const {attributes, BlockWrapper, setAttributes, setCss} = props;

            const rawSettings = attributes["wpbs-icon-list"] || {};

            // Normalize like grid block
            const settings = useMemo(
                () => normalizeIconListSettings(rawSettings),
                [rawSettings]
            );

            // Apply CSS vars
            useEffect(() => {
                setCss(getCssProps(settings));
            }, [settings, setCss]);

            const classNames = getClassNames(attributes, settings);

            /* ----------------------------------------------------------
             * UPDATE SETTINGS — GRID-BLOCK MODEL (full replace)
             * BreakpointPanels will always send { props, breakpoints }
             * ---------------------------------------------------------- */
            const updateSettings = useCallback(
                (nextValue) => {
                    const normalized = normalizeIconListSettings(nextValue);

                    if (!isEqual(settings, normalized)) {
                        setAttributes({
                            "wpbs-icon-list": normalized,
                        });
                    }
                },
                [settings, setAttributes]
            );

            useEffect(() => {
                console.log(attributes);
            }, [settings]);

            return (
                <>
                    <InspectorControls group="styles">
                        <PanelBody
                            initialOpen
                            className="wpbs-block-controls is-style-unstyled"
                        >
                            <BreakpointPanels
                                value={settings}
                                onChange={updateSettings}
                                label="Icon List"
                                render={{
                                    base: (args) => (
                                        <BreakpointControls
                                            {...args}
                                            blockProps={props}
                                        />
                                    ),
                                    breakpoints: (args) => (
                                        <BreakpointControls
                                            {...args}
                                            blockProps={props}
                                        />
                                    ),
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
            const normalized = normalizeIconListSettings(
                attributes["wpbs-icon-list"] || {}
            );
            const classNames = getClassNames(attributes, normalized);

            return <BlockWrapper props={props} className={classNames}/>;
        },
        {hasChildren: true, tagName: "ul"}
    ),
});
