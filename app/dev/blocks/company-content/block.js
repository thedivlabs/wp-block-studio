import "./scss/block.scss";

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {InspectorControls} from "@wordpress/block-editor";
import {__experimentalGrid as Grid, PanelBody} from "@wordpress/components";

import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from "Components/Style";
import {useCallback, useEffect, useMemo} from "@wordpress/element";
import {isEmpty, isEqual} from "lodash";

import {Field} from "Components/Field";
import {cleanObject} from "Includes/helper";
import {MaterialIcon} from "Components/IconControl";

/* --------------------------------------------------------------
 * FIELD MAP (from original block)
 * -------------------------------------------------------------- */
const FIELDS = [
    {type: "select", slug: "company-id", label: "Company", full: true},
    {
        type: "select",
        slug: "type",
        label: "Type",
        options: [
            {label: "Select", value: ""},
            {label: "Title", value: "title"},
            {label: "Phone", value: "phone"},
            {label: "Phone Additional", value: "phone-additional"},
            {label: "Email", value: "email"},
            {label: "Email Additional", value: "email-additional"},
            {label: "Address", value: "address"},
            {label: "Address Inline", value: "address-inline"},
            {label: "Social", value: "social"},
            {label: "Hours", value: "hours"},
            {label: "Hours Inline", value: "hours-inline"},
            {label: "Description", value: "description"},
            {label: "Map Link", value: "map-link"},
            {label: "Reviews Link", value: "reviews-link"},
            {label: "New Review Link", value: "new-review-link"},
        ],
        full: true,
    },
    {type: "text", slug: "label", label: "Label", full: true},
    {
        type: "select",
        slug: "label-position",
        label: "Label Position",
        options: [
            {label: "Select", value: ""},
            {label: "Top", value: "top"},
            {label: "Left", value: "left"},
            {label: "Bottom", value: "bottom"},
        ],
    },
    {type: "icon", slug: "icon", label: "Icon", full: true},
    {type: "number", slug: "line-clamp", label: "Line Clamp", min: 1},
    {type: "divider", label: "Options", full: true},
    {type: "toggle", slug: "split-address", label: "Split Address"},
];

const selector = "wpbs-company-content";

/* --------------------------------------------------------------
 * NORMALIZER — FLAT, BASE PROPS ONLY
 * -------------------------------------------------------------- */
function normalizeCompanyContentSettings(raw = {}) {
    return raw || {};
}

/* --------------------------------------------------------------
 * CSS VAR BUILDER (BASE ONLY)
 * -------------------------------------------------------------- */
function cssVarsFromProps(props = {}) {
    const icon = props.icon ?? {};

    return {
        "--line-clamp": props["line-clamp"] ?? null,
        "--icon": icon?.name ? `"${icon.name}"` : null,
        "--icon-color": icon?.color ?? null,
        "--icon-size": icon?.size ? `${icon.size}px` : null,
        "--icon-css": icon?.css ?? null,
    };
}

function getCssProps(props = {}) {
    return cleanObject({
        props: cssVarsFromProps(props),
    });
}

/* --------------------------------------------------------------
 * CLASSNAMES
 * -------------------------------------------------------------- */
const getClassNames = (attributes, settings) => {
    const effective =
        settings ||
        normalizeCompanyContentSettings(
            attributes["wpbs-company-content"] || {}
        );

    return [
        selector,
        "inline-flex",
        "relative",
        !isEmpty(effective?.icon) ? "--icon material-icon-before" : null,
        !isEmpty(effective?.["label-position"])
            ? `--label-${effective["label-position"]}`
            : null,
        attributes?.uniqueId ?? null,
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

        "wpbs-company-content": {
            type: "object",
            default: {},
        },
    },

    edit: withStyle(
        (props) => {
            const {attributes, BlockWrapper, setAttributes, setCss} = props;

            const rawSettings = attributes["wpbs-company-content"] || {};

            const settings = useMemo(
                () => normalizeCompanyContentSettings(rawSettings),
                [rawSettings]
            );

            useEffect(() => {
                setCss(getCssProps(settings));
            }, [settings, setCss]);

            const updateSettings = useCallback(
                (patch) => {
                    const next = {
                        ...settings,
                        ...patch,
                    };

                    if (!isEqual(settings, next)) {
                        setAttributes({
                            "wpbs-company-content": next,
                        });
                    }
                },
                [settings, setAttributes]
            );

            const classNames = getClassNames(attributes, settings);

            return (
                <>
                    <InspectorControls group="styles">
                        <PanelBody
                            title={'Company Content'}
                            initialOpen={false}
                            className="wpbs-block-controls"
                        >
                            <Grid columns={2} columnGap={15} rowGap={20}>
                                {FIELDS.map((field) => (
                                    <Field
                                        key={field.slug}
                                        field={field}
                                        settings={settings}
                                        props={props}
                                        isToolsPanel={false}
                                        callback={updateSettings}
                                        __next40pxDefaultSize
                                        __nextHasNoMarginBottom
                                    />
                                ))}
                            </Grid>
                        </PanelBody>
                    </InspectorControls>

                    <BlockWrapper props={props} className={classNames}>
                        <MaterialIcon {...(settings?.icon ?? {})} className={'wpbs-icon'}/>
                        {<span className={'wpbs-company-content__label'}>{settings?.type ?? 'Company Content'}</span>}
                    </BlockWrapper>
                </>
            );
        },
        {hasChildren: false, tagName: "div"}
    ),

    save: withStyleSave(
        (props) => {
            const {attributes, BlockWrapper} = props;

            const settings = normalizeCompanyContentSettings(
                attributes["wpbs-company-content"] || {}
            );

            const classNames = getClassNames(attributes, settings);

            return <BlockWrapper props={props} className={classNames}>
                <MaterialIcon {...(settings?.icon ?? {})} className={'wpbs-icon'}/>
                {settings?.label && <span className={'wpbs-company-content__label'}>{settings?.label}</span>}
                {'%%__COMPANY_CONTENT__%%'}
            </BlockWrapper>;
        },
        {hasChildren: false, tagName: "div"}
    ),
});
