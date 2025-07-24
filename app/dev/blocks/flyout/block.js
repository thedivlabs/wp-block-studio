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

    const {'wpbs-flyout': settings = {}} = attributes;

    return [
        'wpbs-flyout',
        'flex flex-col w-full relative overflow-y-scroll',
        attributes?.uniqueId ?? null
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-flyout': {
            type: 'object'
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-flyout');

        const {'wpbs-flyout': settings = {}} = attributes;

        const cssProps = useMemo(() => {
            return {};
        }, [settings]);

        const blockProps = useBlockProps({className: blockClassnames(attributes)});

        const innerBlocksProps = useInnerBlocksProps({
            className: 'wpbs-flyout__container'
        });

        const updateSettings = useCallback((newValue) => {

            const result = {
                ...settings,
                ...newValue
            }

            setAttributes({'wpbs-flyout': result});

        }, [setAttributes, settings])


        return (
            <>

                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                       deps={['wpbs-flyout']}
                       props={cssProps}
                />


                <nav {...blockProps}>
                    <div {...innerBlocksProps} />
                </nav>

            </>
        )
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClassnames(props.attributes)
        });

        const innerBlocksProps = useInnerBlocksProps.save({
            className: 'wpbs-flyout__container'
        });

        return <nav {...blockProps}>
            <div {...innerBlocksProps} />
        </nav>;
    }
})


