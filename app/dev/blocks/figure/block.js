import './scss/block.scss';
import {
    useBlockProps,
    InspectorControls,
    MediaUploadCheck, MediaUpload
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {LayoutControls, LAYOUT_ATTRIBUTES} from "Components/Layout"
import {
    __experimentalGrid as Grid,
    BaseControl,
    GradientPicker,
    PanelBody,
    SelectControl,
    ToggleControl,
} from "@wordpress/components";
import PreviewThumbnail from "Components/PreviewThumbnail";
import ResponsivePicture from "Components/ResponsivePicture.js";
import React, {useCallback, useEffect, useMemo} from "react";
import Link from "Components/Link";
import {useInstanceId} from '@wordpress/compose';
import {Style, STYLE_ATTRIBUTES} from "Components/Style.js";
import {
    BLEND_OPTIONS,
    ORIGIN_OPTIONS,
    RESOLUTION_OPTIONS,
} from "Includes/config"
import {LinkPost} from "Components/LinkPost";
import {useUniqueId} from "Includes/helper";


function blockClasses(attributes = {}) {

    return [
        'wpbs-figure h-full',
        attributes?.uniqueId ?? ''
    ].filter(x => x).join(' ');
}

const Media = React.memo(({settings, breakpoint}) => {

    const classNames = 'wpbs-figure__media';

    let mediaStyle = {
        ['mix-blend-mode']: settings.blend || null,
        ['object-fit']: !!settings.contain ? 'contain' : 'cover',
    };

    const config = Object.fromEntries(Object.entries({
        force: !!settings?.['force'],
        eager: !!settings?.['eager'],
        resolutionLarge: settings?.['resolutionLarge'] ?? null,
        resolutionMobile: settings?.['resolutionMobile'] ?? settings?.['resolutionLarge'] ?? null,
        breakpoint: breakpoint || 'normal',
    }).filter(([_, v]) => v));

    const Content = () => {

        switch (settings?.type ?? false) {
            case 'image':

                return <ResponsivePicture mobile={settings?.['imageMobile']}
                                          large={settings?.['imageLarge']}
                                          settings={config}
                                          editor={true}
                />;
            case 'featured-image':
                return <div
                    className={'w-full h-full bg-black opacity-50 leading-normal text-center flex justify-center items-center text-white/30 text-6xl overflow-hidden'}>
                    <i class="fa-solid fa-image"></i>
                </div>;
            default:
                return <></>
        }
    }

    return <div className={classNames} style={mediaStyle}>
        <Content/>
    </div>;


});


const MemoSelectControl = React.memo(({label, options, value, callback}) => (
    <SelectControl
        label={label}
        options={options}
        value={value}
        onChange={callback}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />
));

function getPreloadMedia(attributes) {

    if (!attributes['wpbs-figure']?.['eager']) {
        return []
    }

    const imageLarge = !!attributes['wpbs-figure'].force ? attributes['wpbs-figure']?.imageLarge ?? false : attributes['wpbs-figure']?.imageLarge ?? attributes['wpbs-figure']?.imageMobile ?? false;
    const imageMobile = !!attributes['wpbs-figure'].force ? attributes['wpbs-figure']?.imageMobile ?? false : attributes['wpbs-figure']?.imageMobile ?? attributes['wpbs-figure']?.imageLarge ?? false;
    const resolutionLarge = attributes['wpbs-figure'].resolutionLarge || 'large';
    const resolutionMobile = attributes['wpbs-figure'].resolutionMobile || attributes['wpbs-figure'].resolutionLarge || 'large';
    const breakpoint = attributes?.['wpbs-breakpoint'] ?? {};

    return [
        {
            media: imageLarge,
            resolution: resolutionLarge,
            breakpoint: breakpoint?.large ?? 'normal',
            mobile: false
        },
        {
            media: imageMobile,
            resolution: resolutionMobile,
            breakpoint: breakpoint.mobile ?? 'normal',
            mobile: true
        }
    ].filter(obj => !!obj?.media?.id);


}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-figure': {
            type: 'object',
            default: {
                'imageMobile': undefined,
                'imageLarge': undefined,
                'eager': undefined,
                'force': undefined,
                'resolutionLarge': undefined,
                'resolutionMobile': undefined,
                'contain': undefined,
                'linkPost': undefined,
                'blend': undefined,
                'origin': undefined,
                'overlay': undefined,
                'link': undefined,
            }

        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        //const uniqueId = useInstanceId(registerBlockType, 'wpbs-figure');

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const preloadMedia = useMemo(() => getPreloadMedia(attributes), [attributes['wpbs-figure']]);

        const updateSettings = useCallback((newValue) => {

            const result = {
                ...attributes['wpbs-figure'],
                ...newValue
            };

            setAttributes({
                'wpbs-figure': result
            });

        }, [setAttributes, attributes['wpbs-figure']])

        const blockProps = useBlockProps({
            className: blockClasses(attributes),
            ...attributes?.['wpbs-props']
        });

        return <>
            <InspectorControls group="styles">
                <PanelBody initialOpen={true}>
                    <Grid columns={1} columnGap={15} rowGap={20}>
                        <SelectControl
                            __next40pxDefaultSize
                            label="Type"
                            value={attributes['wpbs-figure']?.type}
                            options={[
                                {label: 'Select', value: ''},
                                {label: 'Image', value: 'image'},
                                {label: 'Featured Image', value: 'featured-image'},
                                {label: 'Lottie', value: 'lottie'},
                                {label: 'Icon', value: 'icon'},
                            ]}
                            onChange={(newValue) => updateSettings({'type': newValue})}
                            __nextHasNoMarginBottom
                        />
                        <Grid columns={1} columnGap={15} rowGap={20}
                              style={{display: !attributes['wpbs-figure']?.type ? 'none' : null}}>

                            <Grid columns={2} columnGap={15} rowGap={20}
                                  style={{display: attributes['wpbs-figure']?.type !== 'image' && attributes['wpbs-figure']?.type !== 'featured-image' ? 'none' : null}}>
                                <BaseControl label={'Mobile Image'} __nextHasNoMarginBottom={true}>
                                    <MediaUploadCheck>
                                        <MediaUpload
                                            title={'Mobile Image'}
                                            onSelect={(newValue) => updateSettings({
                                                'imageMobile': {
                                                    type: newValue.type,
                                                    id: newValue.id,
                                                    url: newValue.url,
                                                    alt: newValue.alt,
                                                    sizes: newValue.sizes,
                                                }
                                            })}
                                            allowedTypes={['image']}
                                            value={attributes['wpbs-figure']?.imageMobile}
                                            render={({open}) => {
                                                return <PreviewThumbnail
                                                    image={attributes['wpbs-figure']?.imageMobile || {}}
                                                    callback={() => updateSettings({'imageMobile': undefined})}
                                                    onClick={open}
                                                />;
                                            }}
                                        />
                                    </MediaUploadCheck>
                                </BaseControl>
                                <BaseControl label={'Large Image'} __nextHasNoMarginBottom={true}>
                                    <MediaUploadCheck>
                                        <MediaUpload
                                            title={'Large Image'}
                                            onSelect={(newValue) => updateSettings({
                                                'imageLarge': {
                                                    type: newValue.type,
                                                    id: newValue.id,
                                                    url: newValue.url,
                                                    alt: newValue.alt,
                                                    sizes: newValue.sizes,
                                                }
                                            })}
                                            allowedTypes={['image']}
                                            value={attributes['wpbs-figure']?.imageLarge}
                                            render={({open}) => {
                                                return <PreviewThumbnail
                                                    image={attributes['wpbs-figure']?.imageLarge || {}}
                                                    callback={() => updateSettings({'imageLarge': undefined})}
                                                    onClick={open}
                                                />;
                                            }}
                                        />
                                    </MediaUploadCheck>
                                </BaseControl>


                                <MemoSelectControl
                                    value={attributes['wpbs-figure']?.blend}
                                    label={'Blend'}
                                    options={BLEND_OPTIONS}
                                    callback={(newValue) => updateSettings({blend: newValue})}
                                />

                                <MemoSelectControl
                                    value={attributes['wpbs-figure']?.origin}
                                    label={'Origin'}
                                    options={ORIGIN_OPTIONS}
                                    callback={(newValue) => updateSettings({origin: newValue})}
                                />

                                <MemoSelectControl
                                    value={attributes['wpbs-figure']?.resolutionLarge}
                                    label={'Size Large'}
                                    options={RESOLUTION_OPTIONS}
                                    callback={(newValue) => updateSettings({resolutionLarge: newValue})}
                                />

                                <MemoSelectControl
                                    value={attributes['wpbs-figure']?.resolutionMobile}
                                    label={'Size Mobile'}
                                    options={RESOLUTION_OPTIONS}
                                    callback={(newValue) => updateSettings({resolutionMobile: newValue})}
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
                                    clearable={true}
                                    value={attributes['wpbs-figure']?.overlay ?? undefined}
                                    onChange={(newValue) => updateSettings({'overlay': newValue})}
                                />
                            </BaseControl>


                            <Grid columns={2} columnGap={15} rowGap={20}
                                  style={{display: attributes['wpbs-figure']?.type !== 'video' ? 'none' : null}}>

                                <BaseControl label={'Video'} __nextHasNoMarginBottom={true}>
                                    <MediaUploadCheck>
                                        <MediaUpload
                                            title={'Video'}
                                            onSelect={(newValue) => updateSettings({'video': newValue})}
                                            allowedTypes={['video']}
                                            value={attributes['wpbs-figure']?.video}
                                            render={({open}) => {
                                                return <PreviewThumbnail
                                                    image={attributes['wpbs-figure']?.video || {}}
                                                    callback={() => updateSettings({video: undefined})}
                                                    onClick={open}
                                                />;
                                            }}
                                        />
                                    </MediaUploadCheck>
                                </BaseControl>


                            </Grid>


                            <Grid columns={2} columnGap={15} rowGap={20}
                                  style={{padding: '1rem 0'}}>
                                <ToggleControl
                                    label="Eager"
                                    checked={!!attributes['wpbs-figure']?.eager}
                                    onChange={(value) => {
                                        updateSettings({'eager': value});
                                    }}
                                    className={'flex items-center'}
                                    __nextHasNoMarginBottom
                                />
                                <ToggleControl
                                    label="Force"
                                    checked={!!attributes['wpbs-figure']?.force}
                                    onChange={(value) => updateSettings({force: value})}
                                    className={'flex items-center'}
                                    __nextHasNoMarginBottom
                                />
                                <ToggleControl
                                    label="Contain"
                                    checked={!!attributes['wpbs-figure']?.contain}
                                    onChange={(value) => updateSettings({contain: value})}
                                    className={'flex items-center'}
                                    __nextHasNoMarginBottom
                                />

                            </Grid>
                        </Grid>
                    </Grid>
                </PanelBody>
            </InspectorControls>
            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                   deps={['wpbs-figure']} selector={'wpbs-figure'}
                   props={{
                       '--figure-type': attributes['wpbs-figure']?.type ?? null,
                       '--overlay': attributes['wpbs-figure']?.overlay ?? null,
                       '--origin': attributes['wpbs-figure']?.origin ?? null,
                   }}
                   preload={preloadMedia}
            />
            <Link defaultValue={attributes['wpbs-figure']?.link}
                  callback={(newValue) => updateSettings({'link': newValue})}/>
            <LinkPost defaultValue={attributes['wpbs-figure']?.linkPost}
                      callback={(newValue) => updateSettings({linkPost: newValue})}/>


            <div {...blockProps}>
                <Media settings={attributes['wpbs-figure']} breakpoint={attributes?.['wpbs-breakpoint']?.large}/>
            </div>

        </>;
    },
    save: (props) => {
        return <></>;
    }

})


