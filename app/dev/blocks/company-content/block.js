import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {InspectorControls} from "@wordpress/block-editor";
import {
    PanelBody,
    SelectControl,
    TextControl,
    ToggleControl,
    __experimentalGrid as Grid,
} from "@wordpress/components";

import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from "Components/Style";
import {IconControl, MaterialIcon} from "Components/IconControl";

import {useCallback, useMemo} from "@wordpress/element";
import {useSelect} from "@wordpress/data";
import {isEqual} from "lodash";

const selector = "wpbs-company-content";

const CONTENT_OPTIONS = [
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
];

const getClassNames = (attributes = {}) => {
    const {"wpbs-company-content": settings = {}} = attributes;

    return [
        selector,
        attributes?.uniqueId,
        settings?.icon && "--icon",
        settings?.["label-position"] && `--label-${settings["label-position"]}`,
    ]
        .filter(Boolean)
        .join(" ");
};

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
            const {attributes, setAttributes, BlockWrapper} = props;
            const {"wpbs-company-content": settings = {}} = attributes;

            const companies = useSelect(
                (select) =>
                    select("core").getEntityRecords("postType", "company", {
                        per_page: -1,
                    }),
                []
            );

            const updateSettings = useCallback(
                (nextValue) => {
                    const next = {...settings, ...nextValue};

                    if (!isEqual(settings, next)) {
                        setAttributes({
                            "wpbs-company-content": next,
                        });
                    }
                },
                [settings, setAttributes]
            );

            const label = useMemo(() => {
                return (
                    CONTENT_OPTIONS.find(
                        (opt) => opt.value === settings?.type
                    )?.label || "Company Content"
                );
            }, [settings?.type]);

            const classNames = getClassNames(attributes);

            return (
                <>
                    <InspectorControls group="styles">
                        <PanelBody title="Settings" initialOpen>
                            <Grid columns={1} rowGap={20}>
                                <SelectControl
                                    label="Company"
                                    value={settings?.["company-id"] ?? ""}
                                    options={[
                                        {label: "Select a company", value: ""},
                                        ...(companies || []).map((post) => ({
                                            label: post.title.rendered,
                                            value: String(post.id),
                                        })),
                                    ]}
                                    onChange={(v) =>
                                        updateSettings({"company-id": v})
                                    }
                                />

                                <SelectControl
                                    label="Content Type"
                                    value={settings?.type ?? ""}
                                    options={CONTENT_OPTIONS}
                                    onChange={(v) =>
                                        updateSettings({type: v})
                                    }
                                />

                                <TextControl
                                    label="Label"
                                    value={settings?.label ?? ""}
                                    onChange={(v) =>
                                        updateSettings({label: v})
                                    }
                                />

                                <SelectControl
                                    label="Label Position"
                                    value={settings?.["label-position"] ?? ""}
                                    options={[
                                        {label: "Select", value: ""},
                                        {label: "Top", value: "top"},
                                        {label: "Left", value: "left"},
                                        {label: "Bottom", value: "bottom"},
                                    ]}
                                    onChange={(v) =>
                                        updateSettings({"label-position": v})
                                    }
                                />

                                <IconControl
                                    label="Icon"
                                    value={settings?.icon}
                                    onChange={(v) =>
                                        updateSettings({icon: v})
                                    }
                                />

                                <ToggleControl
                                    label="Split Address"
                                    checked={!!settings?.["split-address"]}
                                    onChange={(v) =>
                                        updateSettings({
                                            "split-address": v,
                                        })
                                    }
                                />
                            </Grid>
                        </PanelBody>
                    </InspectorControls>

                    <BlockWrapper
                        props={props}
                        className={classNames}
                    >
                        <MaterialIcon {...settings?.icon} className="wpbs-icon"/>
                        {label}
                    </BlockWrapper>
                </>
            );
        },
        {
            hasChildren: false,
            hasBackground: false,
            tagName: "div",
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
            tagName: "div",
        }
    ),
});
