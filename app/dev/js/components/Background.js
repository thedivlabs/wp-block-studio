import {memo, useMemo} from "@wordpress/element";
import {
    __experimentalGrid as Grid, __experimentalToolsPanel as ToolsPanel,
    BaseControl,
    GradientPicker,
    PanelBody,
    SelectControl,
    ToggleControl
} from "@wordpress/components";
import {MediaUpload, MediaUploadCheck} from "@wordpress/block-editor";
import PreviewThumbnail from "Components/PreviewThumbnail";
import {Field} from "Components/Field";
import React from "react";

const BackgroundFields = memo(({settings, updateFn}) => {
    const {backgroundFieldsMap: map = []} = window?.WPBS_StyleEditor ?? {};

    return map.map((field) => {
        const callback = (v) => updateFn({[field.slug]: v});

        return (
            <Field
                key={field.slug}
                field={field}
                settings={settings}
                callback={callback}
            />
        );
    });
});

export const BackgroundControls = ({settings = {}, callback, isBreakpoint = false}) => {
    const isPanelOpen = Object.keys(settings).length > 0;

    return (
        <PanelBody title="Background" initialOpen={isPanelOpen} className={'wpbs-background-controls'}>
            <Grid columns={1} columnGap={15} rowGap={25}>
                <SelectControl
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                    label="Type"
                    value={settings?.['type']}
                    onChange={(newValue) => callback({type: newValue})}
                    options={[
                        {label: 'Select', value: ''},
                        {label: 'Image', value: 'image'},
                        {label: 'Featured Image', value: 'featured-image'},
                        {label: 'Video', value: 'video'},
                    ]}
                />
                {!isPanelOpen ? null : <>
                    {/* --- Media pickers under Type --- */}
                    {(settings.type === 'image' || settings.type === 'featured-image') && (
                        <BaseControl label="Image" __nextHasNoMarginBottom>
                            <MediaUploadCheck>
                                <MediaUpload
                                    title="Select Image"
                                    allowedTypes={['image']}
                                    value={settings?.image?.id}
                                    onSelect={(media) =>
                                        callback({
                                            image: {
                                                id: media.id,
                                                url: media.url,
                                                alt: media?.alt,
                                                type: media?.type,
                                                sizes: media?.sizes,
                                            },
                                        })
                                    }
                                    render={({open}) => (
                                        <PreviewThumbnail
                                            image={settings?.image}
                                            onClick={open}
                                            callback={() => callback({image: {}})}
                                            style={{
                                                objectFit: 'contain',
                                                borderRadius: '6px',
                                            }}
                                        />
                                    )}
                                />
                            </MediaUploadCheck>
                        </BaseControl>
                    )}

                    {settings.type === 'video' && (
                        <BaseControl label="Video" __nextHasNoMarginBottom>
                            <MediaUploadCheck>
                                <MediaUpload
                                    title="Select Video"
                                    allowedTypes={['video']}
                                    value={settings?.video?.id}
                                    onSelect={(media) =>
                                        callback({
                                            video: {
                                                id: media.id,
                                                url: media.url,
                                                type: media?.type,
                                                mime: media?.mime,
                                            },
                                        })
                                    }
                                    render={({open}) => (
                                        <PreviewThumbnail
                                            image={settings?.video}
                                            onClick={open}
                                            callback={() => callback({video: {}})}
                                            style={{
                                                objectFit: 'contain',
                                                borderRadius: '6px',
                                            }}
                                        />
                                    )}
                                />
                            </MediaUploadCheck>
                        </BaseControl>
                    )}

                    <BaseControl label={'Overlay'}>
                        <div className={'wpbs-background-controls__card'}>
                            <GradientPicker
                                gradients={[
                                    {
                                        name: 'Transparent',
                                        gradient: 'linear-gradient(rgba(0,0,0,0),rgba(0,0,0,0))',
                                        slug: 'transparent',
                                    },
                                    {
                                        name: 'Light',
                                        gradient: 'linear-gradient(rgba(0,0,0,.3),rgba(0,0,0,.3))',
                                        slug: 'light',
                                    },
                                    {
                                        name: 'Strong',
                                        gradient: 'linear-gradient(rgba(0,0,0,.7),rgba(0,0,0,.7))',
                                        slug: 'strong',
                                    },
                                ]}
                                clearable={false}
                                value={settings?.['overlay'] ?? undefined}
                                onChange={(newValue) => callback({overlay: newValue})}
                            />
                        </div>
                    </BaseControl>


                    <Grid columns={2} columnGap={15} rowGap={20}>
                        {!isBreakpoint && <ToggleControl
                            label="Eager"
                            checked={!!settings?.['eager']}
                            onChange={(v) => callback({eager: v})}
                        />}
                        <ToggleControl
                            label="Fixed"
                            checked={!!settings?.['fixed']}
                            onChange={(v) => callback({fixed: v})}
                        />
                    </Grid>

                    <div>
                        <ToolsPanel
                            label="Advanced Background"
                            resetAll={() => callback({}, true)}
                            className={'wpbs-advanced-background'}
                        >
                            <BackgroundFields
                                settings={settings}
                                updateFn={(newProps) => callback(newProps)}
                            />
                        </ToolsPanel>
                    </div>
                </>}


            </Grid>
        </PanelBody>

    );
};


function BackgroundVideo({settings = {}}) {

    const {background, breakpoints = {}} = settings;

    const bpDefs = WPBS?.settings?.breakpoints ?? {};
    const entries = [];

    // 1. base-level background video
    if (background?.video?.url) {
        entries.push({size: Infinity, video: background.video});
    }

    // 2. breakpoints
    Object.entries(breakpoints).forEach(([bpKey, bpData]) => {
        const video = bpData?.background?.video;
        const size = bpDefs[bpKey]?.size ?? 0;
        if (video?.url) entries.push({size, video});
    });

    entries.sort((a, b) => b.size - a.size);

    if (!entries.length) return null;

    return (
        <video muted loop autoPlay playsInline
               className={'absolute top-0 left-0 w-full h-full z-0 pointer-events-none'}>
            {entries.map(({size, video}, i) => (
                <source
                    key={i}
                    data-src={video.url}
                    data-media={Number.isFinite(size) && size !== Infinity ? `(max-width: ${size - 1}px)` : null}
                    //data-type={video.mime || 'video/mp4'}
                />
            ))}
        </video>
    );
}

export function BackgroundElement({attributes = {}, isSave = false}) {

    const {'wpbs-style': settings = {}} = attributes;

    const bgClass = [
        'wpbs-background',
        !settings.eager ? '--lazy' : null,
        'absolute top-0 left-0 w-full h-full z-0 pointer-events-none',
    ].filter(x => x).join(' ');


    return <div className={bgClass}><BackgroundVideo settings={settings} isSave={isSave}/></div>;
}