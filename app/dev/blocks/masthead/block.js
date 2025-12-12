import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {InspectorControls} from "@wordpress/block-editor";
import {PanelBody, ToggleControl, __experimentalGrid as Grid} from "@wordpress/components";

import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from "Components/Style";

import {useCallback, useMemo} from "@wordpress/element";
import {isEqual} from "lodash";

const selector = "wpbs-masthead";

const getClassNames = (attributes = {}) => {
    const {"wpbs-masthead": settings = {}} = attributes;

    return [
        selector,
        "wpbs-site-header",
        attributes?.uniqueId,
        "w-full",
        "relative",
        "flex",
        "wpbs-has-container",
        settings?.float && "--float",
        settings?.sticky && "--sticky",
        settings?.hidden && "--hidden"
    ]
        .filter(Boolean)
        .join(" ");
};

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        "wpbs-masthead": {
            type: "object",
            default: {},
        },
    },

    edit: withStyle(
        (props) => {
            const {
                attributes,
                setAttributes,
                styleData,
                BlockWrapper,
                setCss,
            } = props;

            const {"wpbs-masthead": settings = {}} = attributes;

            const updateSettings = useCallback(
                (nextValue) => {

                    const next = {
                        ...settings,
                        ...nextValue,
                    }

                    if (!isEqual(settings, next)) {
                        setAttributes({
                            "wpbs-masthead": next,
                        });
                    }
                },
                [settings, setAttributes]
            );

            const classNames = getClassNames(attributes, styleData);

            return (
                <>
                    <InspectorControls group="styles">
                        <PanelBody title="Options">
                            <Grid columns={2} columnGap={20} rowGap={20}>
                                <ToggleControl
                                    label="Float"
                                    checked={!!settings?.float}
                                    onChange={(v) => updateSettings({float: v})}
                                />
                                <ToggleControl
                                    label="Sticky"
                                    checked={!!settings?.sticky}
                                    onChange={(v) => updateSettings({sticky: v})}
                                />
                            </Grid>
                        </PanelBody>
                    </InspectorControls>
                    <BlockWrapper
                        props={props}
                        className={classNames}
                    >
                        <div className="wpbs-masthead__container wpbs-container wpbs-layout-wrapper w-full">
                            {props.children}
                        </div>
                    </BlockWrapper>
                </>
            );
        },
        {
            hasChildren: true,
            hasBackground: false,
            tagName: 'header'
        }
    ),

    save: withStyleSave(
        (props) => {
            const {attributes, BlockWrapper} = props;
            const classNames = getClassNames(attributes, styleData);

            return (
                <BlockWrapper
                    props={props}
                    className={classNames}
                >
                    <div className="wpbs-masthead__container wpbs-container wpbs-layout-wrapper w-full">
                        {props.children}
                    </div>
                </BlockWrapper>
            );
        },
        {
            hasChildren: true,
            hasBackground: false,
            tagName: 'header'
        }
    ),
});
