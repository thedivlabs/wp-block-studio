import {
    InspectorControls, PanelColorSettings,
    useBlockProps,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import {useInstanceId} from "@wordpress/compose";
import React, {useCallback, useMemo} from "react";

function blockClassnames(attributes = {}) {

    const {'wpbs-flyout-nav-content': settings = {}} = attributes;

    return [
        'wpbs-flyout-nav-content',
        'flex flex-col w-full relative',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-flyout-nav-content');

        const {'wpbs-flyout-nav-content': settings = {}} = attributes;

        const cssProps = useMemo(() => {
            return {};
        }, [settings]);

        const blockProps = useBlockProps({className: blockClassnames(attributes)});

        const innerBlocksProps = useInnerBlocksProps(blockProps, {
            template: [
                'wpbs/flyout-nav-content'
            ]
        });

        const updateSettings = useCallback((newValue) => {

            const result = {
                ...settings,
                ...newValue
            }

            setAttributes({'wpbs-flyout-nav-content': result});

        }, [setAttributes, settings])


        return (
            <>

                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                       deps={['wpbs-flyout-nav-content']}
                       props={cssProps}
                />


                <nav {...innerBlocksProps}/>

            </>
        )
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClassnames(props.attributes),
        });

        const innerBlocksProps = useInnerBlocksProps.save(blockProps);

        return <nav {...innerBlocksProps}/>;
    }
})


