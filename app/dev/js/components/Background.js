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

export const BackgroundControls = ({settings = {}, callback}) => {
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

                    <Grid columns={2} columnGap={15} rowGap={20}>
                        <ToggleControl
                            label="Eager"
                            checked={!!settings?.['eager']}
                            onChange={(v) => callback({eager: v})}
                        />
                        <ToggleControl
                            label="Fixed"
                            checked={!!settings?.['fixed']}
                            onChange={(v) => callback({fixed: v})}
                        />
                    </Grid>
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


const Video = memo(({settings = {}}) => {
    const breakpoints = settings?.breakpoints || {};
    const bpMap = window?.WPBS_StyleEditor?.breakpoints || {};
    const srcAttr = 'data-src';
    const sources = [];

    // Loop through defined breakpoints and extract video URLs
    for (const [bpKey, bpData] of Object.entries(breakpoints)) {
        const videoUrl = bpData?.background?.video?.url;
        if (!videoUrl) continue;

        const bpWidth = bpMap[bpKey];
        if (!bpWidth) continue;

        // mobile-first logic: smaller breakpoints use max-width
        const isSmall = /xs|sm|mobile/i.test(bpKey);
        const mediaQuery = isSmall
            ? `(max-width:${bpWidth})`
            : `(min-width:${bpWidth})`;

        sources.push(
            <source
                key={bpKey}
                {...{
                    [srcAttr]: videoUrl,
                    type: 'video/mp4',
                    'data-media': mediaQuery,
                }}
            />
        );
    }

    return  sources.length > 0 && (
            <video muted loop autoPlay playsInline
                   className="wpbs-background__media absolute inset-0 z-0 overflow-hidden w-full h-full"
                   fetchpriority={settings.eager ? 'high' : undefined}
            >
                {sources}
            </video>
        );
});
export function BackgroundElement({settings = {}, editor = false}) {

    if (!settings.type) {
        return false;
    }

    const bgClass = [
        'wpbs-background',
        settings.mask ? '--mask' : null,
        !settings.eager ? '--lazy' : null,
        'absolute top-0 left-0 w-full h-full z-0 pointer-events-none',
    ].filter(x => x).join(' ');


    return <div className={bgClass}>
        <Media attributes={settings}/>
    </div>;
}