import {useBlockProps,InspectorControls,RichText,InnerBlocks,withColors,
    __experimentalColorGradientSettingsDropdown as ColorGradientSettingsDropdown,
    __experimentalUseMultipleOriginColorsAndGradients as useMultipleOriginColorsAndGradients
} from "@wordpress/block-editor"
import {SelectControl,ToggleControl,PanelBody} from "@wordpress/components"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"

registerBlockType(metadata.name, {
    apiVersion: 3,
    supports:{
        innerBlocks:true,
        color:{
            background: true,
            text: true,
            link: true,
            gradients: true,
        },
        spacing:{
            blockGap: true,
            padding: true,
            margin: true,
        },
    },
    styles:[
        {
            name: 'split',
            label: 'Split'
        },
        {
            name: 'card',
            label: 'Card'
        },
        {
            name: 'card-reverse',
            label: 'Card Reverse'
        },
        {
            name: 'sidebar',
            label: 'Sidebar'
        },
        {
            name: 'sidebar-reverse',
            label: 'Sidebar Reverse'
        },
        {
            name: 'block',
            label: 'Block'
        }
    ],
    attributes: {
        custom_color:{
            type: 'string'
        },
        toggleField: {
            type: 'boolean'
        },
        selectField: {
            type: 'string'
        }
    },
    edit: ({attributes, setAttributes,style,clientId}) => {
        const {
            custom_color,
            toggleField,
            selectField,
        } = attributes;

        const blockProps = useBlockProps({
            className: 'wpbs-content-section w-full',
            style:{

            }
        });

        const colorGradientSettings = useMultipleOriginColorsAndGradients();

        function onChangeToggleField( newValue ) {
            setAttributes( { toggleField: newValue } );
        }

        function onChangeSelectField( newValue ) {
            setAttributes( { selectField: newValue } );
        }

        return (
            <>
                <InspectorControls group="color">
                    <ColorGradientSettingsDropdown
                        settings={ [ {
                            label: 'Custom Color',
                            colorValue: custom_color,
                            onColorChange: ( value ) => {
                                setAttributes( {
                                    custom_color: value
                                } );
                            }
                        } ] }
                        panelId={ clientId }
                        hasColorsOrGradients={ true }
                        disableCustomColors={ false }
                        __experimentalIsRenderedInSidebar
                        { ...colorGradientSettings }
                    />
                </InspectorControls>
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

                <section { ...blockProps }>
                    <div className={'container wpbs-container'}>
                        <InnerBlocks />
                    </div>
                </section>
            </>
        )
    },
    save: () =>{
        const blockProps = useBlockProps.save({
            className: 'wpbs-content-section w-full',
        });

        return (
            <section { ...blockProps }>
                <div className={'container wpbs-container'}>
                    <InnerBlocks.Content />
                </div>
            </section>
        );
    }
})


