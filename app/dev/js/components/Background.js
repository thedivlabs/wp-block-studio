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

const MediaControl = memo(({label, allowedTypes, value, callback, clear}) => (
    <BaseControl
        label={label}
        __nextHasNoMarginBottom={true}
    >
        <MediaUploadCheck>
            <MediaUpload
                title={label}
                onSelect={callback}
                allowedTypes={allowedTypes || ['image']}
                value={value}
                render={({open}) => {
                    return <PreviewThumbnail
                        image={value}
                        callback={clear}
                        style={{
                            objectFit: 'contain'
                        }}
                        onClick={open}
                    />;
                }}
            />
        </MediaUploadCheck>
    </BaseControl>
));


export const Background = () => <div className="background"></div>;

const BackgroundFields = useMemo(() => {
    const {backgroundFieldsMap: map = []} = window?.WPBS_StyleEditor ?? {};
    return ({settings, updateFn}) =>
        map.map((field) => {
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
}, []);


export const BackgroundControls = ({settings = {}, callback}) => {
    const isPanelOpen = Object.keys(settings).length > 0;
    return (
        <PanelBody title="Background" initialOpen={isPanelOpen}>
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

                <div style={{display: !settings?.type ? 'none' : null}}>
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
                </div>

                <Grid columns={2} columnGap={15} rowGap={20} style={{display: !settings?.type ? 'none' : null}}>
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
                <BaseControl label="Overlay" __nextHasNoMarginBottom={true}>
                    <div style={{padding: '12px', backgroundColor: '#efefef', borderRadius: '6px'}}>
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
                <div style={{display: !settings?.type ? 'none' : null}}>
                    <ToolsPanel
                        label="Advanced Background"
                        resetAll={() => callback({})}
                    >
                        <BackgroundFields
                            settings={settings}
                            updateFn={(newProps) => callback(newProps)}
                        />
                    </ToolsPanel>
                </div>
            </Grid>
        </PanelBody>

    );
};