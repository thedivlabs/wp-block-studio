import React, {useState} from "react"
import {
    __experimentalGrid as Grid,
    BaseControl,
    useBaseControlProps,
    PanelBody,
    SelectControl,
    ToggleControl,
    Button,
} from "@wordpress/components";
import {InspectorControls, MediaUpload,MediaUploadCheck} from "@wordpress/block-editor";
import PreviewThumbnail from '../../js/components/PreviewThumbnail';

function Background({settings = {}, pushSettings}) {


    /*{
        type: '',
        pattern_image: '',
        image_mobile: '',
        image_large: '',
        video_mobile: '',
        video_large: '',
        loading: '',
        opacity: '',
        repeat: '',
        blend: '',
        width_mobile: '',
        width_large: '',
        overlay_mobile: '',
        overlay_large: '',
        mask_mobile: '',
        mask_large: '',
    }*/

    const [type, setType] = useState(settings.type || false);
    const [mobileImage, setMobileImage] = useState(settings.mobileImage || null);
    const [largeImage, setLargeImage] = useState(settings.largeImage || null);
    const [video, setVideo] = useState(settings.video || false);

    function updateSettings(attr, val, callback) {
        callback(val);
        pushSettings(Object.assign({}, settings, {[attr]: val}));
    }

    return (
        <InspectorControls group={'styles'}>
            <PanelBody title={'Background'} initialOpen={false}>
                <Grid columns={1} columnGap={20} rowGap={20}>
                    <SelectControl
                        label="Type"
                        value={type}
                        options={[
                            {label: 'Default', value: null},
                            {label: 'Image', value: 'image'},
                            {label: 'Video', value: 'video'},
                            {label: 'Pattern', value: 'pattern'},
                        ]}
                        onChange={(value) => {
                            updateSettings('type', value, setType);
                        }}
                        __nextHasNoMarginBottom
                    />
                    <Grid columns={2} columnGap={20} rowGap={20}>
                        <BaseControl label={'Mobile Image'} __nextHasNoMarginBottom={ true }>
                            <MediaUploadCheck>
                                <MediaUpload
                                    title={'Mobile Image'}
                                    onSelect={(value) => {
                                        updateSettings('mobileImage', value, setMobileImage);
                                    }}
                                    allowedTypes={['image']}
                                    value={mobileImage}
                                    render={({open}) => {
                                        if (mobileImage) {
                                            return <>
                                                <PreviewThumbnail
                                                    image={mobileImage || {}}
                                                    callback={() => {
                                                        updateSettings('mobileImage', null, setMobileImage)
                                                    }}
                                                /></>;
                                        } else {
                                            return <Button onClick={open} style={{border: '1px dashed lightgray'}}>
                                                Choose Image
                                            </Button>
                                        }
                                    }}
                                />
                            </MediaUploadCheck>
                        </BaseControl>
                        <BaseControl label={'Large Image'} __nextHasNoMarginBottom={ true }>
                            <MediaUploadCheck>
                                <MediaUpload
                                    title={'Large Image'}
                                    onSelect={(value) => {
                                        updateSettings('largeImage', value, setLargeImage);
                                    }}
                                    allowedTypes={['image']}
                                    value={largeImage}
                                    render={({open}) => {
                                        if (largeImage) {
                                            return <>
                                                <PreviewThumbnail
                                                    image={largeImage || {}}
                                                    callback={() => {
                                                        updateSettings('largeImage', null, setLargeImage)
                                                    }}
                                                /></>;
                                        } else {
                                            return <Button onClick={open} style={{border: '1px dashed lightgray'}}>
                                                Choose Image
                                            </Button>
                                        }
                                    }}
                                />
                            </MediaUploadCheck>
                        </BaseControl>
                    </Grid>
                </Grid>
            </PanelBody>
        </InspectorControls>
    )
}

export default Background