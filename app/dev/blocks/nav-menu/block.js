import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from "Components/Style";
import {InspectorControls} from "@wordpress/block-editor";
import {
    PanelBody,
    SelectControl,
    __experimentalGrid as Grid
} from "@wordpress/components";
import {useSelect} from "@wordpress/data";
import {useCallback, useEffect} from "@wordpress/element";
import {isEqual} from "lodash";
import {BreakpointPanels} from "Components/BreakpointPanels";
import {Field} from "Components/Field";
import {cleanObject} from "Includes/helper";

const COLORS_FIELD = {
    type: "color",
    slug: "colors",
    label: "Colors",
    full: true,
    colors: [
        // ─────────────────────────
        // Top-level (normal / hover)
        // ─────────────────────────
        {slug: "color-background", label: "Background"},
        {slug: "color-background-hover", label: "Background Hover"},
        {slug: "color-icon", label: "Icon"},
        {slug: "color-text-decoration", label: "Text Decoration"},

        // ─────────────────────────
        // Sub-menu (normal / hover)
        // ─────────────────────────
        {slug: "color-submenu-background", label: "Sub Menu Background"},
        {slug: "color-submenu-background-hover", label: "Sub Menu Background Hover"},
        {slug: "color-submenu-text", label: "Sub Menu Text"},
        {slug: "color-submenu-text-hover", label: "Sub Menu Text Hover"},
        {slug: "color-submenu-icon", label: "Sub Menu Icon"},

        // ─────────────────────────
        // Active state (top + sub)
        // ─────────────────────────
        {slug: "color-background-active", label: "Active Background"},
        {slug: "color-text-active", label: "Active Text"},
        {slug: "color-text-decoration-active", label: "Active Text Decoration"},
        {slug: "color-submenu-background-active", label: "Active Sub Menu Background"},
        {slug: "color-submenu-text-active", label: "Active Sub Menu Text"},
    ],
};

const FIELDS_BASE = [
    // Menu & behavior
    {
        type: "select",
        slug: "menu",
        label: "Select Menu",
        full: true,
    },
    {
        type: "select",
        slug: "style",
        label: "Menu Style",
        options: [
            {label: "Dropdown", value: "dropdown"},
            {label: "Accordion", value: "accordion"},
            {label: "Inline", value: "inline"},
        ],
        full: true,
    },

    // Icons
    {type: "icon", slug: "icon", label: "Icon", full: true},
    {type: "icon", slug: "submenu-icon", label: "Sub-Menu Icon", full: true},

    // Divider (border only)
    {type: "border", slug: "divider", label: "Divider", full: true},

    // Layout / structure
    {type: "number", slug: "columns", label: "Columns", min: 1, max: 6},
    {type: "unit", slug: "link-padding", label: "Link Padding"},
    {
        type: "select",
        slug: "text-decoration",
        label: "Text Decoration",
        options: [
            {label: "None", value: ""},
            {label: "Underline", value: "underline"},
            {label: "Overline", value: "overline"},
            {label: "Line Through", value: "line-through"},
        ],
    },

    {type: "border", slug: "link-border", label: "Link Border", full: true},
    {type: "border", slug: "link-border-active", label: "Active Link Border", full: true},

    {type: "divider", label: "Submenu", full: true},
    // Sub-menu layout
    {type: "unit", slug: "submenu-space", label: "Sub-Menu Space"},
    {type: "unit", slug: "submenu-rounded", label: "Sub-Menu Rounded"},
    {type: "unit", slug: "submenu-padding", label: "Sub-Menu Padding"},
    {type: "unit", slug: "submenu-gap", label: "Sub-Menu Gap"},
    {type: "unit", slug: "submenu-icon-space", label: "Sub-Menu Icon Space"},
    {type: "unit", slug: "submenu-link-padding", label: "Sub-Menu Link Padding"},
    {type: "border", slug: "submenu-border", label: "Sub-Menu Border", full: true},
    {type: "border", slug: "submenu-divider", label: "Sub-Menu Divider", full: true},
    {type: "toggle", slug: "icon-below", label: "Icon Below"},

    COLORS_FIELD
];


const FIELDS_BREAKPOINTS = [
    // Divider (border only)
    {type: "border", slug: "divider", label: "Divider", full: true},

    // Layout / structure
    {type: "number", slug: "columns", label: "Columns", min: 1, max: 6},
    {type: "unit", slug: "link-padding", label: "Link Padding"},
    {type: "select", slug: "text-decoration", label: "Text Decoration"},
    {type: "border", slug: "link-border", label: "Link Border", full: true},
    {type: "border", slug: "link-border-active", label: "Active Link Border", full: true},

    // Sub-menu layout
    {type: "unit", slug: "submenu-space", label: "Sub-Menu Space"},
    {type: "unit", slug: "submenu-rounded", label: "Sub-Menu Rounded"},
    {type: "unit", slug: "submenu-padding", label: "Sub-Menu Padding"},
    {type: "unit", slug: "submenu-gap", label: "Sub-Menu Gap"},
    {type: "unit", slug: "submenu-icon-space", label: "Sub-Menu Icon Space"},
    {type: "unit", slug: "submenu-link-padding", label: "Sub-Menu Link Padding"},
    {type: "border", slug: "submenu-border", label: "Sub-Menu Border", full: true},
    {type: "border", slug: "submenu-divider", label: "Sub-Menu Divider", full: true},

    COLORS_FIELD

];

const selector = "wpbs-nav-menu";

const getClassNames = (attributes = {}) => {
    const settings = attributes["wpbs-nav-menu"] ?? {};

    return [
        selector,
        'flex flex-wrap',

        // style modes (replaces implicit block styles)
        settings.style && `is-style-${settings.style}`,

        // feature flags (ported from old block)
        settings.divider && "--divider",
        settings["submenu-divider"] && "--submenu-divider",
        settings.icon && "--has-icon",
        settings["submenu-icon"] && "--has-submenu-icon",
        Number(settings.columns) > 1 && "--has-columns",

        // unique id (old block behavior)
        attributes?.uniqueId ?? null,
    ]
        .filter(Boolean)
        .join(" ");
};


function normalizeSettings(raw = {}) {
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

const BaseControls = ({entry, update, blockProps, menus = []}) => {
    const bpSettings = entry?.props || {};

    return (
        <Grid columns={2} columnGap={15} rowGap={20} style={{padding: "12px"}}>
            {FIELDS_BASE.map((field) => {
                const resolvedField =
                    field.slug === "menu"
                        ? {
                            ...field,
                            options: [
                                {label: "Select", value: ""},
                                ...menus,
                            ],
                        }
                        : field;

                return (
                    <Field
                        key={resolvedField.slug}
                        field={resolvedField}
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
                );
            })}
        </Grid>
    );
};

const BreakpointControls = ({entry, update, blockProps}) => {
    const bpSettings = entry?.props || {};

    return (
        <Grid columns={2} columnGap={15} rowGap={20} style={{padding: "12px"}}>
            {FIELDS_BREAKPOINTS.map((field) => (
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


registerBlockType(metadata.name, {
    apiVersion: 3,

    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        "wpbs-nav-menu": {
            type: "object",
            default: {},
        },
    },

    edit: withStyle(
        (props) => {
            const {attributes, setAttributes, BlockWrapper, setCss} = props;
            const settings = attributes["wpbs-nav-menu"] ?? {};

            const menus = useSelect((select) => {
                const core = select("core");
                const data = core.getMenus?.();

                if (!core.hasFinishedResolution("getMenus")) {
                    return [];
                }

                return (data || [])
                    .filter((menu) => Array.isArray(menu.locations) && menu.locations.length)
                    .map((menu) => ({
                        label: menu.name,
                        value: menu.id,
                    }));
            }, []);


            const updateSettings = useCallback(
                (nextValue) => {
                    const normalized = normalizeSettings(nextValue);

                    if (!isEqual(settings, normalized)) {
                        setAttributes({
                            "wpbs-nav-menu": normalized,
                        });
                    }
                },
                [settings, setAttributes]
            );

            useEffect(() => {
                setCss(getCssProps(settings));
            }, [settings, setCss]);

            // leave this here for debugging purposes
            useEffect(() => {
                console.log(menus);
            }, [menus])


            const classNames = getClassNames(attributes);

            return (
                <>

                    <InspectorControls group="styles">
                        <PanelBody
                            initialOpen
                            title="Navigation Menu"
                            className="wpbs-block-controls is-style-unstyled"
                        >
                            <BreakpointPanels
                                value={settings}
                                onChange={updateSettings}
                                render={{
                                    base: (args) => (
                                        <BaseControls
                                            {...args}
                                            blockProps={props}
                                            menus={menus}
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

                    <BlockWrapper
                        props={props}
                        className={classNames}
                    />
                </>
            );
        },
        {
            hasChildren: false,
            hasBackground: false,
        }
    ),

    save: withStyleSave(
        (props) => {
            const {attributes, BlockWrapper} = props;
            const classNames = getClassNames(attributes);

            return (
                <BlockWrapper
                    props={props}
                    className={classNames}
                />
            );
        },
        {
            hasChildren: false,
            hasBackground: false,
        }
    ),
});
