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
import {IconControl, MaterialIcon} from "Components/IconControl";


const selector = "wpbs-material-icon";


/* --------------------------------------------------------------
 * CLASSNAMES
 * -------------------------------------------------------------- */
const getClassNames = (attributes) => {

    const {'wpbs-material-icon': settings = {}} = attributes;

    return [
        selector,
        "wpbs-material-icon",
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

        "wpbs-material-icon": {
            type: "object",
            default: {},
        },
    },

    edit: withStyle(
        (props) => {
            const {attributes, BlockWrapper, setAttributes, setCss} = props;

            const {'wpbs-material-icon': settings = {}} = attributes;

            const classNames = getClassNames(attributes, settings);


            const updateSettings = useCallback(
                (nextValue) => {
                    const next = {
                        ...settings,
                        ...nextValue,
                    }

                    if (!isEqual(settings, next)) {
                        setAttributes({
                            "wpbs-material-icon": next,
                        });
                    }
                },
                [settings, setAttributes]
            );

            return (
                <>
                    <InspectorControls group="styles">
                        <PanelBody
                            initialOpen
                            className="wpbs-block-controls"
                        >
                            <IconControl fieldKey={'icon'} label={'Icon'} props={props} value={settings?.icon}
                                         onChange={(val) => updateSettings({icon: val})}/>
                        </PanelBody>
                    </InspectorControls>

                    <BlockWrapper props={props} className={classNames}>

                        <MaterialIcon {...settings?.icon}/>
                    </BlockWrapper>
                </>
            );
        },
        {hasChildren: false, hasBackground: false}
    ),

    save: withStyleSave(
        (props) => {
            const {attributes, BlockWrapper} = props;
            const {'wpbs-material-icon': settings = {}} = attributes;
            const classNames = getClassNames(attributes);

            return <BlockWrapper props={props} className={classNames}>

                <MaterialIcon {...settings?.icon}/>
            </BlockWrapper>;
        },
        {hasChildren: false, hasBackground: false}
    ),
});
