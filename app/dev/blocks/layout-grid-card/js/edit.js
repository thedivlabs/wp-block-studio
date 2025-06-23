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
import {
    __experimentalGrid as Grid,
    ToggleControl, SelectControl, TextControl
} from "@wordpress/components";
import {REL_OPTIONS} from "Includes/config.js";

function sectionClassNames(attributes = {}) {

    return [
        'wpbs-layout-grid-card loop-card',
        'w-full block relative',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
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
            default: {
                linkNewTab: undefined,
                linkRel: undefined,
                linkPost: undefined,
                linkTitle: undefined,
            }
        }
    },
    edit: (props) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-layout-grid-card');

        useEffect(() => {
            setAttributes({uniqueId: uniqueId})
        }, [uniqueId]);

        const {attributes, setAttributes, context} = props;

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...attributes['wpbs-layout-grid-card'],
                ...newValue
            };

            setAttributes({
                'wpbs-layout-grid-card': result,
            });
        }, [setAttributes, attributes['wpbs-layout-grid-card']]);

        const blockProps = useBlockProps({
            className: sectionClassNames(attributes),
        });

        return (
            <>
                <InspectorControls group="advanced">
                    <Grid columns={2} rowGap={20} style={{'margin-top': '25px'}}>
                        <ToggleControl
                            style={{marginTop: '20px'}}
                            label="Link Post"
                            checked={!!attributes['wpbs-layout-grid-card'].linkPost}
                            onChange={(value) => updateSettings({linkPost: value})}
                        />
                        <ToggleControl
                            label="New tab"
                            checked={!!attributes['wpbs-layout-grid-card']?.linkNewTab}
                            onChange={(isChecked) => updateSettings({linkNewTab: !!isChecked})}
                        />
                        <Grid columns={2} columnGap={15} rowGap={20} style={{'grid-column': '1/-1'}}>
                            <SelectControl
                                label="Rel"
                                value={attributes['wpbs-layout-grid-card']?.linkRel ?? ''}
                                options={REL_OPTIONS}
                                onChange={(value) => updateSettings({linkRel: value})}
                            />
                            <TextControl
                                label="Title"
                                value={attributes['wpbs-layout-grid-card']?.linkTitle ?? ''}
                                onChange={(value) => updateSettings({linkTitle: value})}
                            />
                        </Grid>
                    </Grid>
                </InspectorControls>
                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <BackgroundControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes} selector={'wpbs-layout-grid-card'}/>

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
                target={!!props.attributes['wpbs-layout-grid-card']?.linkNewTab ? '_blank' : '_self'}
                rel={props.attributes['wpbs-layout-grid-card'].linkRel || undefined}
            ><span
                className={'screen-reader-text'}>{props.attributes['wpbs-layout-grid-card']?.linkTitle ?? 'View post'}</span></a>;
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


