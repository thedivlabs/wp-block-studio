import React, {useState, useEffect} from "react"
import updateSettings from '../inc/helper'
import Helper from '../inc/helper'
import {
    __experimentalGrid as Grid,
    BaseControl,
    PanelBody,
    SelectControl,
    ToggleControl,
    Button,
    RangeControl,
    GradientPicker,
} from "@wordpress/components";

function Flex({settings = {}, pushSettings}) {

    settings = Object.assign({}, {
        direction: null,
        align: null,
        justify: null,
        wrap: null,
        basis: null,
        grow: null,
        shrink: null,
    }, settings)

    const [direction, setDirection] = useState(settings.direction);
    const [align, setAlign] = useState(settings.align);
    const [justify, setJustify] = useState(settings.justify);
    const [wrap, setWrap] = useState(settings.wrap);
    const [basis, setBasis] = useState(settings.basis);
    const [grow, setGrow] = useState(settings.grow);
    const [shrink, setShrink] = useState(settings.shrink);


    return (

        <PanelBody title={'Flex'} initialOpen={false}>

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
                                allowedTypes={['video']}
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
                                allowedTypes={['video']}
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
                </Grid>
                <Grid columns={2} columnGap={20} rowGap={30}>
                    <SelectControl
                        label="Repeat"
                        value={repeat}
                        disabled={type !== 'pattern'}
                        options={[
                            {label: 'Default', value: null},
                            {label: 'None', value: 'none'},
                            {label: 'Horizontal', value: 'horizontal'},
                            {label: 'Vertical', value: 'vertical'},
                        ]}
                        onChange={(value) => {
                            updateSettings('repeat', value, setRepeat);
                        }}
                        __nextHasNoMarginBottom
                    />
                    <SelectControl
                        label="Blend"
                        value={blend}
                        options={[
                            {label: 'Default', value: null},
                            {label: 'Multiply', value: 'multiply'},
                            {label: 'Screen', value: 'screen'},
                            {label: 'Overlay', value: 'overlay'},
                            {label: 'Soft Light', value: 'soft-light'},
                        ]}
                        onChange={(value) => {
                            updateSettings('blend', value, setBlend);
                        }}
                        __nextHasNoMarginBottom
                    />
                </Grid>
                <Grid columns={1} columnGap={20} rowGap={20}>
                    <RangeControl
                        __nextHasNoMarginBottom
                        label="Scale"
                        disabled={type !== 'pattern'}
                        value={scale}
                        onChange={(value) => {
                            updateSettings('scale', value, setScale);
                        }}
                        min={0}
                        max={200}
                        resetFallbackValue={100}
                        allowReset={true}
                    />
                    <RangeControl
                        __nextHasNoMarginBottom
                        label="Opacity"
                        value={opacity}
                        onChange={(value) => {
                            updateSettings('opacity', value, setOpacity);
                        }}
                        min={0}
                        max={100}
                        resetFallbackValue={100}
                        allowReset={true}
                    />
                </Grid>
                <Grid columns={2} columnGap={20} rowGap={30}>
                    <ToggleControl
                        label="Eager"
                        checked={eager}
                        onChange={(value) => {
                            updateSettings('eager', value, setEager);
                        }}
                        className={'flex items-center'}
                        __nextHasNoMarginBottom
                    />
                    <ToggleControl
                        label="Force"
                        checked={force}
                        onChange={(value) => {
                            updateSettings('force', value, setForce);
                        }}
                        className={'flex items-center'}
                        __nextHasNoMarginBottom
                    />
                </Grid>
                <BaseControl label={'Overlay'} __nextHasNoMarginBottom={true}>
                    <GradientPicker
                        gradients={[
                            {
                                name: 'Transparent',
                                gradient:
                                    'linear-gradient(rgba(0,0,0,0),rgba(0,0,0,0))',
                                slug: 'transparent',
                            },
                            {
                                name: 'Light',
                                gradient:
                                    'linear-gradient(rgba(0,0,0,.3),rgba(0,0,0,.3))',
                                slug: 'light',
                            },
                            {
                                name: 'Strong',
                                gradient:
                                    'linear-gradient(rgba(0,0,0,.7),rgba(0,0,0,.7))',
                                slug: 'Strong',
                            }
                        ]}
                        clearable={false}
                        value={overlay}
                        onChange={(value) => {
                            updateSettings('overlay', value, setOverlay);
                        }}
                    />
                </BaseControl>
            </Grid>

        </PanelBody>
    )
}

export default Background;