import {
    useBlockProps, InspectorControls, RichText, InnerBlocks, withColors,
    __experimentalColorGradientSettingsDropdown as ColorGradientSettingsDropdown,
    __experimentalUseMultipleOriginColorsAndGradients as useMultipleOriginColorsAndGradients
} from "@wordpress/block-editor"
import {SelectControl, ToggleControl, PanelBody, Button} from "@wordpress/components"
import {MediaUpload} from "@wordpress/media-utils"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import AttachmentImage from '../../../js/components/AttachmentImage'

registerBlockType(metadata.name, {
    apiVersion: 3,
    supports: {
        innerBlocks: true,
        color: {
            background: true,
            text: true,
            link: true,
            gradients: true,
        },
        spacing: {
            blockGap: true,
            padding: true,
            margin: true,
        },
    },
    styles: [
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
        custom_color: {
            type: 'string'
        },
        background_image: {
            type: 'object'
        },
        toggleField: {
            type: 'boolean'
        },
        selectField: {
            type: 'string'
        }
    },
    edit: ({attributes, setAttributes, style, clientId}) => {
        const {
            custom_color,
            background_image,
            toggleField,
            selectField,
        } = attributes;

        const replaceMediaUpload = () => MediaUpload;

        const blockProps = useBlockProps({
            className: 'wpbs-content-section w-full',
            style: {}
        });

        const colorGradientSettings = useMultipleOriginColorsAndGradients();

        function onChangeToggleField(newValue) {
            setAttributes({toggleField: newValue});
        }

        function onChangeSelectField(newValue) {
            setAttributes({selectField: newValue});
        }

        function toggle_image_field() {
            setAttributes({background_image: {}});
        }

        return (
            <>
                <InspectorControls group="color">
                    <ColorGradientSettingsDropdown
                        settings={[{
                            label: 'Custom Color',
                            colorValue: custom_color,
                            onColorChange: (color_value => setAttributes({custom_color: color_value}))
                        }]}
                        panelId={clientId}
                        hasColorsOrGradients={true}
                        disableCustomColors={false}
                        __experimentalIsRenderedInSidebar
                        {...colorGradientSettings}
                    />
                </InspectorControls>
                <InspectorControls>
                    <PanelBody title={'Settings Test'}>
                        <MediaUpload
                            onSelect={(media) =>
                                setAttributes({
                                    background_image: {
                                        id: media.id,
                                        url: media.url
                                    }
                                })
                            }
                            allowedTypes={['image']}
                            value={background_image}
                            render={({open}) => {
                                if(background_image && 'url' in background_image) {
                                    return <img src={background_image.url}
                                                onClick={toggle_image_field}
                                                style={{
                                                    cursor:'pointer',
                                                    width: '60px',
                                                    objectFit: 'cover',
                                                    height: '60px'
                                                }}/>;
                                } else {
                                    return <Button onClick={open}>
                                        Choose Image
                                    </Button>
                                }


                            }}
                        />

                        <ToggleControl
                            label="Toggle Field"
                            checked={toggleField}
                            onChange={onChangeToggleField}
                        />

                        <SelectControl
                            label="Select Control"
                            value={selectField}
                            options={[
                                {value: 'a', label: 'Option A'},
                                {value: 'b', label: 'Option B'},
                                {value: 'c', label: 'Option C'},
                            ]}
                            onChange={onChangeSelectField}
                        />
                    </PanelBody>
                </InspectorControls>

                <section {...blockProps}>
                    <div className={'container wpbs-container'}>
                        <InnerBlocks/>
                    </div>
                </section>
            </>
        )
    },
    save: (props) => {
        const blockProps = useBlockProps.save({
            className: 'wpbs-content-section w-full',
        });

        return (
            <section {...blockProps}>
                <div className={'container wpbs-container'}>
                    <InnerBlocks.Content/>
                </div>
            </section>
        );
    }
})


