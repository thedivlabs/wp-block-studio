import {useBlockProps,InspectorControls,RichText,InnerBlocks} from "@wordpress/block-editor"
import {SelectControl,ToggleControl,PanelBody} from "@wordpress/components"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"

registerBlockType(metadata.name, {
    attributes: {
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
            toggleField,
            selectField,
        } = attributes;

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

                <section { ...blockProps } className={'wpbs-content-section'}>
                    <div className={'container wpbs-container'}>
                        <InnerBlocks />
                    </div>
                </section>
            </>
        )
    },
    save: () =>{
        const blockProps = useBlockProps.save();

        return (
            <section { ...blockProps } className={'wpbs-content-section'}>
                <div className={'container wpbs-container'}>
                    <InnerBlocks.Content />
                </div>
            </section>
        );
    }
})


