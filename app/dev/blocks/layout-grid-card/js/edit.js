import {
    InspectorControls,
    useBlockProps,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {BACKGROUND_ATTRIBUTES, BackgroundControls, BackgroundElement} from "Components/Background"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import {useInstanceId} from "@wordpress/compose";
import React, {useCallback, useEffect} from "react";
import {PanelBody, ToggleControl} from "@wordpress/components";


function sectionClassNames(attributes = {}) {

    return 'wpbs-layout-grid-card w-full block relative ' + (attributes?.uniqueId ?? '')
}

const containerClassNames = 'wpbs-layout-grid-card__container wpbs-layout-wrapper relative z-20'

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...BACKGROUND_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-layout-grid-card': {
            type: 'object',
            default: {}
        }
    },
    edit: (props) => {


        const {attributes, setAttributes} = props;

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-layout-grid-card');

        useEffect(() => {
            setAttributes({uniqueId: uniqueId});
        }, []);

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...attributes['wpbs-layout-grid-card'],
                ...newValue
            };

            setAttributes({
                'wpbs-layout-grid-card': result
            });
        }, [setAttributes, attributes['wpbs-layout-grid-card']]);

        const blockProps = useBlockProps({
            className: sectionClassNames(attributes),
        });

        return (
            <>
                <InspectorControls group="advanced">
                    <ToggleControl
                        label="Link Post"
                        checked={!!attributes['wpbs-layout-grid-card'].linkPost}
                        onChange={(value) => updateSettings({linkPost: value})}
                    />
                </InspectorControls>
                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <BackgroundControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes}/>

                <div {...blockProps}>
                    <div {...useInnerBlocksProps({
                        className: containerClassNames,
                    })} />
                    <BackgroundElement attributes={attributes} editor={true}/>
                </div>
            </>
        )
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: sectionClassNames(props.attributes),
        });

        const Anchor = () => {

            if (!props.attributes['wpbs-layout-grid-card']?.linkPost) {
                return <></>;
            }

            return <a
                className="wpbs-layout-grid-card__anchor absolute top-0 left-0 z-50 w-full h-full"
                href={'%__PERMALINK__%'}
                target={'_self'}
            ><span className={'screen-reader-text'}>View Post</span></a>;
        }


        return <div {...blockProps}>
            <div {...useInnerBlocksProps.save({
                className: containerClassNames,
            })} />
            <BackgroundElement attributes={props.attributes} editor={false}/>
            <Anchor/>
        </div>;


    }
})


