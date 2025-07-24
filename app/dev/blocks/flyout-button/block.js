import {
    useBlockProps,
    InspectorControls
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"

import {Style, STYLE_ATTRIBUTES} from "Components/Style";
import {LayoutControls, LAYOUT_ATTRIBUTES} from "Components/Layout"
import {useInstanceId} from "@wordpress/compose";
import {
    __experimentalGrid as Grid, PanelBody,
    TextControl
} from "@wordpress/components";
import {useCallback} from "react";

function classNames(attributes = {}) {

    return [
        'wpbs-flyout-button wpbs-flyout-toggle',
        'relative flex items-center justify-center h-[1.2em] text-center cursor-pointer aspect-square overflow-hidden leading-none before:font-fa before:content-[var(--icon)] before:block',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-flyout-button': {
            type: 'object',
            default: {}
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-flyout-button');

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...attributes['wpbs-flyout-button'],
                ...newValue
            };

            setAttributes({
                'wpbs-flyout-button': result
            });

        }, [setAttributes, attributes?.['wpbs-flyout-button']])

        const blockProps = useBlockProps({
            className: classNames(attributes),
        });

        return <>

            <InspectorControls group={'styles'}>
                <PanelBody initialOpen={true}>
                    <Grid columns={1} columnGap={20} rowGap={20}>
                        <TextControl
                            label="Icon"
                            value={attributes?.['wpbs-flyout-button']?.icon ?? ''}
                            onChange={(newValue) => updateSettings({icon: newValue})}
                        />

                    </Grid>
                </PanelBody>
            </InspectorControls>

            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                   props={{
                       '--icon': '\"' + '\\' + (attributes?.['wpbs-flyout-button']?.icon ?? 'f0c9') + '\"',
                   }}
                   deps={['wpbs-flyout-button']}
            />

            <div {...blockProps} ></div>

        </>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: classNames(props.attributes),
            'data-wp-interactive': 'wpbs/flyout',
            'data-wp-on--click': 'actions.toggle',
        });


        return <button {...blockProps} type={'button'}>
            <span className={'screen-reader-text'}>Toggle navigation menu</span>
        </button>;
    }
})


