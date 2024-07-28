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
import {InspectorControls, MediaUpload, MediaUploadCheck} from "@wordpress/block-editor";
import PreviewThumbnail from '../../js/components/PreviewThumbnail';

function Background({settings = {}, pushSettings}) {


    /*{

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
    const [mobileVideo, setMobileVideo] = useState(settings.mobileVideo || false);
    const [largeVideo, setLargeVideo] = useState(settings.largeVideo || false);
    const [largeMask, setLargeMask] = useState(settings.largeMask || false);
    const [mobileMask, setMobileMask] = useState(settings.mobileMask || false);

    function updateSettings(attr, val, callback) {
        callback(val);
        pushSettings(Object.assign({}, settings, {[attr]: val}));
    }

    const buttonStyle = {
        border: '1px dashed lightgray',
        width: '100%',
        height: 'auto',
        aspectRatio: '16/9',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    };

    function bgImage() {

        return <img src={'#'}
                    className={[
                        'wpbs-background__image',
                        'absolute top-0 left-0 w-full h-full z-0'
                    ].filter(x => x).join(' ')}
        />;
    }

    return (
        <div className={'wpbs-background'}>
            {bgImage}
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
                            <BaseControl label={'Mobile Image'} __nextHasNoMarginBottom={true}>
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
                                                return <Button onClick={open} style={buttonStyle}>Choose Image</Button>
                                            }
                                        }}
                                    />
                                </MediaUploadCheck>
                            </BaseControl>
                            <BaseControl label={'Large Image'} __nextHasNoMarginBottom={true}>
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
                                                return <Button onClick={open} style={buttonStyle}>Choose Image</Button>
                                            }
                                        }}
                                    />
                                </MediaUploadCheck>
                            </BaseControl>
                            <BaseControl label={'Mobile Video'} __nextHasNoMarginBottom={true}>
                                <MediaUploadCheck>
                                    <MediaUpload
                                        title={'Mobile Video'}
                                        onSelect={(value) => {
                                            updateSettings('mobileVideo', value, setMobileVideo);
                                        }}
                                        allowedTypes={['mp4']}
                                        value={mobileVideo}
                                        render={({open}) => {
                                            if (mobileVideo) {
                                                return <>
                                                    <PreviewThumbnail
                                                        image={mobileVideo || {}}
                                                        callback={() => {
                                                            updateSettings('mobileVideo', null, setMobileVideo)
                                                        }}
                                                    /></>;
                                            } else {
                                                return <Button onClick={open} style={buttonStyle}>Choose Image</Button>
                                            }
                                        }}
                                    />
                                </MediaUploadCheck>
                            </BaseControl>
                            <BaseControl label={'Large Video'} __nextHasNoMarginBottom={true}>
                                <MediaUploadCheck>
                                    <MediaUpload
                                        title={'Large Video'}
                                        onSelect={(value) => {
                                            updateSettings('largeVideo', value, setLargeVideo);
                                        }}
                                        allowedTypes={['mp4']}
                                        value={largeVideo}
                                        render={({open}) => {
                                            if (largeVideo) {
                                                return <>
                                                    <PreviewThumbnail
                                                        image={largeVideo || {}}
                                                        callback={() => {
                                                            updateSettings('largeVideo', null, setLargeVideo)
                                                        }}
                                                    /></>;
                                            } else {
                                                return <Button onClick={open} style={buttonStyle}>Choose Image</Button>
                                            }
                                        }}
                                    />
                                </MediaUploadCheck>
                            </BaseControl>
                            <BaseControl label={'Mobile Mask'} __nextHasNoMarginBottom={true}>
                                <MediaUploadCheck>
                                    <MediaUpload
                                        title={'Mobile Mask'}
                                        onSelect={(value) => {
                                            updateSettings('mobileMask', value, setMobileMask);
                                        }}
                                        allowedTypes={['svg', 'image']}
                                        value={mobileMask}
                                        render={({open}) => {
                                            if (mobileMask) {
                                                return <>
                                                    <PreviewThumbnail
                                                        image={mobileMask || {}}
                                                        callback={() => {
                                                            updateSettings('mobileMask', null, setMobileMask)
                                                        }}
                                                    /></>;
                                            } else {
                                                return <Button onClick={open} style={buttonStyle}>Choose Image</Button>
                                            }
                                        }}
                                    />
                                </MediaUploadCheck>
                            </BaseControl>
                            <BaseControl label={'Large Mask'} __nextHasNoMarginBottom={true}>
                                <MediaUploadCheck>
                                    <MediaUpload
                                        title={'Large Mask'}
                                        onSelect={(value) => {
                                            updateSettings('largeMask', value, setLargeMask);
                                        }}
                                        allowedTypes={['svg', 'image']}
                                        value={largeMask}
                                        render={({open}) => {
                                            if (largeMask) {
                                                return <>
                                                    <PreviewThumbnail
                                                        image={largeMask || {}}
                                                        callback={() => {
                                                            updateSettings('largeMask', null, setLargeMask)
                                                        }}
                                                    /></>;
                                            } else {
                                                return <Button onClick={open} style={buttonStyle}>Choose Image</Button>
                                            }
                                        }}
                                    />
                                </MediaUploadCheck>
                            </BaseControl>
                        </Grid>
                    </Grid>
                </PanelBody>
            </InspectorControls>
        </div>
    )
}

export default Background