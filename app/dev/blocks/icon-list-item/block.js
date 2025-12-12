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


const selector = "wpbs-icon-list-item";


registerBlockType(metadata.name, {
    apiVersion: 3,

    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,

        "wpbs-icon-list-item": {
            type: "object",
            default: {},
        },
    },

    edit: withStyle(
        (props) => {
            const {attributes, setAttributes, BlockWrapper, styleData, setCss} = props;

            const raw = attributes["wpbs-icon-list-item"] || {};

            const classNames = [
                selector,
                "w-full block relative"
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
                        setAttributes({"wpbs-icon-list-item": next});
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
