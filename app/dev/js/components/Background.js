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
                        {isBreakpoint && <ToggleControl
                            label="Force"
                            checked={!!settings?.['force']}
                            onChange={(v) => callback({force: v})}
                        />}
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

    // Editor never renders video
    if (!isSave) return null;

    const {background = {}, breakpoints = {}} = settings;
    const bpDefs = WPBS?.settings?.breakpoints ?? {};
    const entries = [];

    // ----------------------------------------
    // 1. BASE VIDEO (always real, never "#")
    // ----------------------------------------
    const baseVideo = background?.video;
    if (baseVideo?.source) {
        entries.push({size: Infinity, video: baseVideo});
    }

    // ----------------------------------------
    // 2. BREAKPOINT VIDEO OVERRIDES
    // ----------------------------------------
    Object.entries(breakpoints).forEach(([bpKey, bpData]) => {
        const bpVideo = bpData?.background?.video;
        const bpForce = !!bpData?.background?.force;
        const size = bpDefs?.[bpKey]?.size ?? 0;

        if (bpVideo?.source) {
            entries.push({size, video: bpVideo});
        } else if (bpForce) {
            entries.push({
                size,
                video: {source: "#", mime: "video/mp4", isPlaceholder: true},
            });
        }
    });

    // No video at all? bail.
    if (!entries.length) return null;

    // ----------------------------------------
    // Sort largest → smallest (base first)
    // ----------------------------------------
    entries.sort((a, b) => b.size - a.size);

    const baseEntry = entries[0]; // always real
    const baseVideoObj = baseEntry.video;

    // ----------------------------------------
    // Prepare ordered output lists:
    // breakpoints first, base last
    // ----------------------------------------
    const bpEntries = entries.filter(e => e.size !== Infinity);
    const finalBaseEntry = baseEntry; // placed last

    return (
        <video
            muted
            loop
            autoPlay
            playsInline
            className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
        >
            {/* -----------------------------
               BREAKPOINT SOURCES (always data-src)
               ----------------------------- */}
            {bpEntries.map(({size, video}, i) => {
                if (video.source == null) return null;

                const hasValidSize =
                    Number.isFinite(size) &&
                    size > 0 &&
                    size !== Infinity;

                return (
                    <source
                        key={`bp-${i}`}
                        data-src={video.source}              // <-- ALWAYS data-src
                        data-media={
                            hasValidSize ? `(max-width:${size - 1}px)` : null
                        }
                        type={video.mime || "video/mp4"}
                    />
                );
            })}

            {/* -----------------------------
               BASE SOURCE (always last)
               Respects eager / non-eager.
               ----------------------------- */}
            <source
                {...{
                    [background?.eager && isSave ? "src" : "data-src"]:
                    baseVideoObj.source
                }}
                type={baseVideoObj.mime || "video/mp4"}
            />
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