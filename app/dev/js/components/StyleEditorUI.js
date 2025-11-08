import {memo, useCallback, useEffect, useMemo, useState} from "@wordpress/element";
import {Field} from "Components/Field";
import _ from "lodash";
import {
    Button,
    __experimentalToolsPanel as ToolsPanel,
    __experimentalGrid as Grid, PanelBody, SelectControl, ToggleControl, __experimentalUnitControl as UnitControl,
    RangeControl, BaseControl, GradientPicker,
} from "@wordpress/components";
import {__} from "@wordpress/i18n";
import {MediaUpload, MediaUploadCheck, PanelColorSettings} from "@wordpress/block-editor";
import {
    BLEND_OPTIONS,
    IMAGE_SIZE_OPTIONS,
    ORIGIN_OPTIONS,
    POSITION_OPTIONS,
    REPEAT_OPTIONS,
    RESOLUTION_OPTIONS
} from "Includes/config";
import PreviewThumbnail from "Components/PreviewThumbnail";

const API = window?.WPBS_StyleEditor ?? {};
const {cleanObject} = API;

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

export const StyleEditorUI = ({settings, updateStyleSettings}) => {

    // --- Load breakpoint definitions
    const breakpoints = useMemo(() => {
        const bps = WPBS?.settings?.breakpoints ?? {};
        return Object.entries(bps).map(([key, {label, size}]) => ({key, label, size}));
    }, []);

    // --- Initialize local style state
    const [localLayout, setLocalLayout] = useState(
        settings || {props: {}, breakpoints: {}, hover: {}, background: {}}
    );

    // --- Push local layout back up to attributes (optimized debounce)
    const debouncedCommit = useMemo(() =>
            _.debounce((nextLayout, currentSettings) => {
                if (_.isEqual(cleanObject(nextLayout, true), cleanObject(currentSettings, true))) {
                    return;
                }
                console.log(nextLayout);
                updateStyleSettings(nextLayout);
            }, 700)
        , [updateStyleSettings]); // only re-create if the updater changes

    useEffect(() => {
        // Call the *stable* debounced function
        debouncedCommit(localLayout, settings);

        // Cleanup cancels only the active timer
        return () => debouncedCommit.cancel();
    }, [localLayout, settings, debouncedCommit]);


    // --- Update helpers
    const updateLayoutItem = useCallback((newProps) => {
        setLocalLayout((prev) => ({
            ...prev,
            props: {
                ...prev.props,
                ...newProps,
            },
        }));
    }, [setLocalLayout]);

    const updateHoverItem = useCallback((newProps) => {
        setLocalLayout((prev) => ({
            ...prev,
            hover: {
                ...prev.hover,
                ...newProps,
            },
        }));
    }, [setLocalLayout]);

    // --- Ensure breakpoint structure always has { props, background }
    const updateBreakpointItem = useCallback((updates, bpKey) => {
        setLocalLayout(prev => {
            const current = prev.breakpoints?.[bpKey] || {props: {}, background: {}};

            // Normalize structure
            const next = {
                props: {...current.props},
                background: {...current.background},
            };

            // If updates already have props/background, merge them
            if (updates.props) Object.assign(next.props, updates.props);
            if (updates.background) Object.assign(next.background, updates.background);

            // Fallback: treat flat updates as props
            for (const [key, value] of Object.entries(updates)) {
                if (key !== "props" && key !== "background") {
                    next.props[key] = value;
                }
            }

            return {
                ...prev,
                breakpoints: {
                    ...prev.breakpoints,
                    [bpKey]: next,
                },
            };
        });
    }, []);

    const updateBackgroundItem = useCallback((newProps) => {
        setLocalLayout((prev) => ({
            ...prev,
            background: {
                ...prev.background,
                ...newProps,
            },
        }));
    }, []);

    // --- Breakpoint management
    const addBreakpointPanel = useCallback(() => {
        setLocalLayout((prev) => {
            const keys = Object.keys(prev.breakpoints || {});
            if (keys.length >= 3) return prev;

            const available = breakpoints.map((bp) => bp.key).filter((bp) => !keys.includes(bp));
            if (!available.length) return prev;

            const newKey = available[0];
            return {
                ...prev,
                breakpoints: {...prev.breakpoints, [newKey]: {}},
            };
        });
    }, [breakpoints, setLocalLayout]);

    const removeBreakpointPanel = useCallback((bpKey) => {
        setLocalLayout((prev) => {
            const {[bpKey]: _, ...rest} = prev.breakpoints;
            return {...prev, breakpoints: rest};
        });
    }, []);

    const breakpointKeys = useMemo(() => {
        const keys = Object.keys(localLayout?.breakpoints || {});
        return keys.sort((a, b) => {
            const bpA = breakpoints.find((bp) => bp.key === a);
            const bpB = breakpoints.find((bp) => bp.key === b);
            return (bpA?.size || 0) - (bpB?.size || 0);
        });
    }, [localLayout?.breakpoints]);

    // --- Layout fields (now properly scoped by bpKey)
    const LayoutFields = useMemo(() => {
        const {layoutFieldsMap: map = []} = window?.WPBS_StyleEditor ?? {};
        return ({bpKey, settings, suppress = [], updateFn}) =>
            map
                .filter((f) => !suppress.includes(f.slug))
                .map((field) => {
                    const callback = (v) =>
                        updateFn
                            ? updateFn({[field.slug]: v}, bpKey)
                            : updateLayoutItem({[field.slug]: v});
                    return (
                        <Field
                            key={`${bpKey || 'base'}-${field.slug}`}
                            field={field}
                            settings={settings}
                            callback={callback}
                        />
                    );
                });
    }, [updateLayoutItem, updateBreakpointItem]);

    // --- Hover fields
    const HoverFields = useMemo(() => {
        const {hoverFieldsMap: map = []} = window?.WPBS_StyleEditor ?? {};
        return ({settings, suppress = []}) =>
            map
                .filter((f) => !suppress.includes(f.slug))
                .map((field) => (
                    <Field
                        key={field.slug}
                        field={field}
                        settings={settings}
                        callback={(v) => updateHoverItem({[field.slug]: v})}
                    />
                ));
    }, [updateHoverItem]);

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

    const BackgroundControls = ({settings = {}, callback}) => {
        const isPanelOpen = Object.keys(settings).length > 0;
        return (
            <PanelBody title="Background" initialOpen={isPanelOpen}>
                <Grid columns={1} columnGap={15} rowGap={25}>
                    <SelectControl
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                        label="Type"
                        value={settings?.['bgType']}
                        onChange={(newValue) => callback({bgType: newValue})}
                        options={[
                            {label: 'Select', value: ''},
                            {label: 'Image', value: 'image'},
                            {label: 'Featured Image', value: 'featured-image'},
                            {label: 'Video', value: 'video'},
                        ]}
                    />

                    <div style={{display: !settings?.bgType ? 'none' : null}}>
                        {/* --- Media pickers under Type --- */}
                        {(settings.bgType === 'image' || settings.bgType === 'featured-image') && (
                            <BaseControl label="Image" __nextHasNoMarginBottom>
                                <MediaUploadCheck>
                                    <MediaUpload
                                        title="Select Image"
                                        allowedTypes={['image']}
                                        value={settings?.bgImage?.id}
                                        onSelect={(media) =>
                                            callback({
                                                bgImage: {
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
                                                image={settings?.bgImage}
                                                onClick={open}
                                                callback={() => callback({bgImage: {}})}
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

                        {settings.bgType === 'video' && (
                            <BaseControl label="Video" __nextHasNoMarginBottom>
                                <MediaUploadCheck>
                                    <MediaUpload
                                        title="Select Video"
                                        allowedTypes={['video']}
                                        value={settings?.bgVideo?.id}
                                        onSelect={(media) =>
                                            callback({
                                                bgVideo: {
                                                    id: media.id,
                                                    url: media.url,
                                                    type: media?.type,
                                                    mime: media?.mime,
                                                },
                                            })
                                        }
                                        render={({open}) => (
                                            <PreviewThumbnail
                                                image={settings?.bgVideo}
                                                onClick={open}
                                                callback={() => callback({bgVideo: {}})}
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

                    <Grid columns={2} columnGap={15} rowGap={20} style={{display: !settings?.bgType ? 'none' : null}}>
                        <ToggleControl
                            label="Eager"
                            checked={!!settings?.['bgEager']}
                            onChange={(v) => callback({bgEager: v})}
                        />
                        <ToggleControl
                            label="Fixed"
                            checked={!!settings?.['bgFixed']}
                            onChange={(v) => callback({bgFixed: v})}
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
                                value={settings?.['bgOverlay'] ?? undefined}
                                onChange={(newValue) => callback({bgOverlay: newValue})}
                            />
                        </div>
                    </BaseControl>
                    <div style={{display: !settings?.bgType ? 'none' : null}}>

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

    // --- Breakpoint panel
    const BreakpointPanel = useMemo(() => ({
                                               bpKey,
                                               localLayout,
                                               breakpoints,
                                               breakpointKeys,
                                               updateBreakpointItem,
                                               removeBreakpointPanel,
                                           }) => (
        <div className="wpbs-layout-tools__panel">
            <div className="wpbs-layout-tools__header">
                <Button
                    isSmall
                    size="small"
                    iconSize={20}
                    onClick={() => removeBreakpointPanel(bpKey)}
                    icon="no-alt"
                />
                <label className="wpbs-layout-tools__breakpoint">
                    <select
                        id={bpKey}
                        value={bpKey}
                        onChange={(e) => {
                            const newKey = e.target.value;
                            setLocalLayout((prev) => {
                                const nextBreakpoints = {...prev.breakpoints};
                                nextBreakpoints[newKey] = nextBreakpoints[bpKey];
                                delete nextBreakpoints[bpKey];
                                return {...prev, breakpoints: nextBreakpoints};
                            });
                        }}
                    >
                        {breakpoints.map((b) => {
                            const size = b?.size ? `(${b.size}px)` : "";
                            const label = [b?.label ?? bpKey, size]
                                .filter(Boolean)
                                .join(" ");
                            return (
                                <option
                                    key={b.key}
                                    value={b.key}
                                    disabled={b.key !== bpKey && breakpointKeys.includes(b.key)}
                                >
                                    {label}
                                </option>
                            );
                        })}
                    </select>
                </label>
            </div>
            <ToolsPanel
                label={__("Layout")}
                resetAll={() =>
                    updateLayoutItem({
                        ...localLayout,
                        breakpoints: {...localLayout.breakpoints, [bpKey]: {}},
                    })
                }
            >
                <LayoutFields
                    bpKey={bpKey}
                    settings={localLayout.breakpoints[bpKey]?.props || {}}
                    updateFn={(newProps) => updateBreakpointItem({props: newProps}, bpKey)}
                />
            </ToolsPanel>
            {/* Background Section */}
            <BackgroundControls
                bpKey={bpKey}
                settings={localLayout.breakpoints[bpKey]?.background || {}}
                callback={(newProps) =>
                    updateBreakpointItem({background: newProps}, bpKey)
                }
            />
        </div>
    ), []);

    // --- Render
    return (
        <div className="wpbs-layout-tools">
            {/* Default section */}
            <div className="wpbs-layout-tools__panel">
                <ToolsPanel
                    label={__("Layout")}
                    resetAll={() => setLocalLayout(prev => ({
                        ...prev,
                        props: {},
                    }))}>
                    <LayoutFields
                        bpKey="layout"
                        settings={localLayout.props}
                        suppress={["padding", "margin", "gap", "outline"]}
                    />
                </ToolsPanel>
            </div>

            {/* Hover section */}
            <div className="wpbs-layout-tools__panel">
                <ToolsPanel
                    label={__("Hover")}
                    resetAll={() => setLocalLayout(prev => ({...prev, hover: {}}))}

                >
                    <HoverFields
                        settings={localLayout.hover}
                        suppress={["padding", "margin", "gap"]}
                    />
                </ToolsPanel>
            </div>

            <div className="wpbs-layout-tools__panel">
                <BackgroundControls settings={localLayout.background} callback={updateBackgroundItem}/>
            </div>


            {/* Breakpoints */}
            {breakpointKeys.map((bpKey) => (
                <BreakpointPanel
                    key={bpKey}
                    bpKey={bpKey}
                    localLayout={localLayout}
                    breakpoints={breakpoints}
                    breakpointKeys={breakpointKeys}
                    updateBreakpointItem={updateBreakpointItem}
                    removeBreakpointPanel={removeBreakpointPanel}
                />
            ))}

            <Button
                variant="primary"
                onClick={addBreakpointPanel}
                style={{
                    borderRadius: "4px",
                    width: "100%",
                    textAlign: "center",
                    gridColumn: "1/-1",
                }}
                disabled={breakpointKeys.length >= 3}
            >
                {__("Add Breakpoint")}
            </Button>
        </div>
    );
};
