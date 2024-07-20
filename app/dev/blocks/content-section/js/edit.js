

import {useBlockProps,InspectorControls,RichText} from "@wordpress/block-editor"
import {SelectControl,ToggleControl,PanelBody} from "@wordpress/components"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"

registerBlockType(metadata.name, {
    attributes: {
        content: {
            type: 'string'
        },
        toggleField: {
            type: 'boolean'
        },
        selectField: {
            type: 'string'
        }
    },
    edit: ({attributes, setAttributes}) => {
        const blockProps = useBlockProps();
        const {
            content,
            toggleField,
            selectField,
        } = attributes;

        function onChangeContent( newContent ) {
            setAttributes( { content: newContent } );
        }

        function onChangeToggleField( newValue ) {
            setAttributes( { toggleField: newValue } );
        }

        function onChangeSelectField( newValue ) {
            setAttributes( { selectField: newValue } );
        }

        return (
            <>
                <InspectorControls>
                    <PanelBody title={ 'Settings Test' }>

                        <ToggleControl
                            label="Toggle Field"
                            checked={ toggleField }
                            onChange={ onChangeToggleField }
                        />

                        <SelectControl
                            label="Select Control"
                            value={ selectField }
                            options={ [
                                { value: 'a', label: 'Option A' },
                                { value: 'b', label: 'Option B' },
                                { value: 'c', label: 'Option C' },
                            ] }
                            onChange={ onChangeSelectField }
                        />
                    </PanelBody>
                </InspectorControls>

                <RichText
                    { ...blockProps }
                    key="editable"
                    tagName="p"
                    onChange={ onChangeContent }
                    value={ content }
                />
            </>
        )
    },
    save: ({attributes}) =>{
        const {
            content,
        } = attributes;
        const blockProps = useBlockProps.save();

        return (
            <section { ...blockProps } className={'wpbs-content-section'}>
                <RichText.Content value={ content } tagName={'div'} className={'container wpbs-container'} />
            </section>
        );
    }
})


