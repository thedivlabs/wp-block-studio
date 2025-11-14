import {memo, useMemo} from "@wordpress/element";
import {
    __experimentalGrid as Grid, __experimentalToolsPanel as ToolsPanel,
    BaseControl,
    GradientPicker,
    PanelBody,
    SelectControl,
    ToggleControl
} from "@wordpress/components";
import {PanelColorSettings} from "@wordpress/block-editor";
import {Field} from "Components/Field";


export const BackgroundControls = ({settings = {}, callback, isBreakpoint = false}) => {
    const isPanelOpen = Object.keys(settings).length > 0;

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

    return (
        <PanelBody title="Background" initialOpen={isPanelOpen} className={'wpbs-background-controls'}>
            <Grid columns={1} columnGap={15} rowGap={20}>
                <SelectControl
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                    label="Type"
                    value={settings?.type}
                    onChange={(newValue) => {
                        // Skip if user re-selects the same value
                        if (newValue === settings?.type) return;

                        // Always reset image and video when type changes
                        callback({
                            type: newValue,
                            image: {},
                            video: {},
                        });
                    }}
                    options={[
                        {label: 'Select', value: ''},
                        {label: 'Image', value: 'image'},
                        {label: 'Featured Image', value: 'featured-image'},
                        {label: 'Video', value: 'video'},
                    ]}
                />

                {!isPanelOpen ? null : <>

                    {(settings.type === "image" || settings.type === "featured-image") && (
                        <Field
                            field={{
                                type: "image",
                                slug: "image",
                                label: "Image",
                                full: true
                            }}
                            settings={settings}
                            callback={(val) => callback({image: val})}
                            isToolsPanel={false}
                        />
                    )}

                    {settings.type === "video" && (
                        <Field
                            field={{
                                type: "video",
                                slug: "video",
                                label: "Video",
                                full: true
                            }}
                            settings={settings}
                            callback={(val) => callback({video: val})}
                            isToolsPanel={false}
                        />
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

                    <PanelColorSettings
                        className={'wpbs-controls__color'}
                        enableAlpha
                        colorSettings={[
                            {
                                slug: 'color',
                                label: 'Color',
                                value: settings?.['color'] ?? undefined,
                                onChange: (newValue) => callback({'color': newValue}),
                                isShownByDefault: true,
                            },
                        ]}
                        __nextHasNoMarginBottom
                    />

                    <Grid columns={2} columnGap={15} rowGap={20}>
                        {!isBreakpoint && <ToggleControl
                            label="Eager"
                            checked={!!settings?.['eager']}
                            onChange={(v) => callback({eager: v})}
                        />}
                        {settings.type !== 'video' && <ToggleControl
                            label="Fixed"
                            checked={!!settings?.['fixed']}
                            onChange={(v) => callback({fixed: v})}
                        />}
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

function BackgroundVideo({settings = {}, isSave = false}) {

    if (!isSave) return null;

    const { background = {}, breakpoints = {} } = settings;
    const bpDefs = WPBS?.settings?.breakpoints ?? {};
    const entries = [];

    // ----------------------------------------
    // 1. BASE VIDEO (real source only)
    // ----------------------------------------
    const baseVideo = background?.video;
    if (baseVideo?.source) {
        entries.push({
            size: Infinity,
            video: baseVideo
        });
    }

    // ----------------------------------------
    // 2. BREAKPOINT VIDEO OVERRIDES
    // ----------------------------------------
    Object.entries(breakpoints).forEach(([bpKey, bpData]) => {
        const size = bpDefs?.[bpKey]?.size ?? 0;
        const bpVideo = bpData?.background?.video;

        // CASE A — breakpoint has a video object
        if (bpVideo) {
            if (bpVideo.source) {
                // real video
                entries.push({ size, video: bpVideo });
            } else {
                // empty object → treat as implicit disable
                entries.push({
                    size,
                    video: { source: "#", mime: "video/mp4" }
                });
            }
            return;
        }

        // CASE B — breakpoint has NO video key at all
        entries.push({
            size,
            video: { source: "#", mime: "video/mp4" }
        });
    });

    // If no entries at all, bail
    if (!entries.length) return null;

    // ----------------------------------------
    // Sort: base first (Infinity)
    // ----------------------------------------
    entries.sort((a, b) => b.size - a.size);

    const baseEntry = entries.find(e => e.size === Infinity);
    const baseVideoObj = baseEntry?.video ?? null;

    const bpEntries = entries.filter(e => e.size !== Infinity);

    // ----------------------------------------
    // Render
    // ----------------------------------------
    return (
        <video
            muted
            loop
            autoPlay
            playsInline
            className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
        >

            {/* BREAKPOINT SOURCES */}
            {bpEntries.map(({ size, video }, i) => {

                const mq =
                    Number.isFinite(size) && size > 0 && size !== Infinity
                        ? `(max-width:${size - 1}px)`
                        : null;

                return (
                    <source
                        key={`bp-${i}`}
                        data-src={video.source || "#"}
                        data-media={mq}
                        type={video.mime || "video/mp4"}
                    />
                );
            })}

            {/* BASE SOURCE (real source only) */}
            {baseVideoObj?.source && (
                <source
                    data-src={baseVideoObj.source}
                    type={baseVideoObj.mime || "video/mp4"}
                />
            )}

        </video>
    );
}

export function BackgroundElement({attributes = {}, isSave = false}) {

    const baseBg = attributes?.['wpbs-style']?.background;
    const breakpoints = attributes?.['wpbs-style']?.breakpoints ?? {};

    const hasAnyBackground = (() => {
        // Base background
        if (baseBg?.type) return true;

        // Any breakpoint with a defined background type
        for (const bp of Object.values(breakpoints)) {
            if (bp?.background?.type) return true;
        }

        return false;
    })();

    if (!hasAnyBackground) return null;

    const bgClass = [
        'wpbs-background',
        //!settings.eager ? '--lazy' : null,
        'absolute top-0 left-0 w-full h-full z-0 pointer-events-none',
    ].filter(x => x).join(' ');


    return <div className={bgClass}><BackgroundVideo settings={attributes?.['wpbs-style']} isSave={!!isSave}/></div>;
}