import "./scss/block.scss";

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {STYLE_ATTRIBUTES, withStyle} from 'Components/Style';
import {InspectorControls} from "@wordpress/block-editor";
import {useCallback} from "@wordpress/element";
import {isEqual} from "lodash";
import {cleanObject} from "Includes/helper";
import {__experimentalGrid as Grid, TextControl} from "@wordpress/components";
import {IconControl} from "Components/IconControl";

const selector = "wpbs-layout-grid-pagination";

const getClassNames = (attributes = {}, styleData) => {
    const {"wpbs-layout-grid-pagination": settings} = attributes;

    return [
        selector
    ]
        .filter(Boolean)
        .join(' ');
};

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        "wpbs-layout-grid-pagination": {
            type: "object",
            default: {},
        },
    },

    edit: withStyle(
        (props) => {

            const {attributes, styleData, BlockWrapper, setAttributes} = props;
            const {'wpbs-layout-grid-pagination': settings = {}} = attributes;
            const classNames = getClassNames(attributes, styleData);

            const updateSettings = useCallback(
                (nextValue) => {

                    const cleaned = cleanObject({
                        ...settings,
                        ...nextValue
                    });

                    if (!isEqual(cleanObject(settings), cleaned)) {
                        setAttributes({"wpbs-layout-grid-pagination": cleaned});
                    }
                },
                [settings, setAttributes]
            );

            return (
                <>
                    <InspectorControls group="styles">
                        <Grid
                            columns={1}
                            columnGap={15}
                            rowGap={20}
                        >
                            <TextControl
                                label="Button Label"
                                value={settings.buttonLabel || ""}
                                onChange={(val) => updateSettings({buttonLabel: val})}
                                __next40pxDefaultSize
                            />
                            <IconControl
                                fieldKey={'iconNext'}
                                label={'Icon Next'}
                                props={props}
                                value={settings?.iconNext}
                                onChange={(val) => updateSettings({iconNext: val})}
                            />
                            <IconControl
                                fieldKey={'iconPrev'}
                                label={'Icon Prev'}
                                props={props}
                                value={settings?.iconPrev}
                                onChange={(val) => updateSettings({iconPrev: val})}
                            />
                        </Grid>
                    </InspectorControls>
                    <BlockWrapper
                        props={props}
                        className={classNames}
                    >
                        PAGINATION FPO
                    </BlockWrapper>
                </>
            );
        }, {
            hasChildren: false,
            hasBackground: false,
        }),

    save: () => null,
});
