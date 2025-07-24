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
        'wpbs-flyout-nav-button',
        'relative',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-flyout-nav-button': {
            type: 'object',
            default: {}
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-flyout-nav-button');

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...attributes['wpbs-flyout-nav-button'],
                ...newValue
            };

            setAttributes({
                'wpbs-flyout-nav-button': result
            });

        }, [setAttributes, attributes?.['wpbs-flyout-nav-button']])

        const blockProps = useBlockProps({
            className: classNames(attributes),
        });

        return <>

            <InspectorControls group={'styles'}>
                <PanelBody initialOpen={true}>
                    <Grid columns={1} columnGap={20} rowGap={20}>
                        <TextControl
                            label="Icon"
                            value={attributes?.['wpbs-flyout-nav-button']?.icon ?? ''}
                            onChange={(newValue) => updateSettings({icon: newValue})}
                        />

                    </Grid>
                </PanelBody>
            </InspectorControls>

            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                   props={{
                       '--icon': attributes?.['wpbs-flyout-nav-button']?.icon ?? '',
                   }}
            />

            <div {...blockProps} >XXXX</div>

        </>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: classNames(props.attributes),
        });


        return <button {...blockProps} type={'button'}>
            <span className={'screen-reader-text'}>Toggle navigation menu</span>
        </button>;
    }
})


