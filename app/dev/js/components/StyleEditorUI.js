import {useCallback, useEffect, useMemo, useState} from "@wordpress/element";
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

const API = window?.WPBS_StyleEditor ?? {};
const {getCSSFromStyle, cleanObject, hasDuplicateId, updateStyleString, parseSpecialProps} = API;

const BackgroundControls = ({settings = {}, callback}) => {
    return <PanelBody title="Background" initialOpen={!!settings.type}>
        <Grid columns={1} columnGap={15} rowGap={20}>
            <SelectControl
                __next40pxDefaultSize
                label="Type"
                value={settings?.type}
                onChange={(newValue) => callback({type: newValue})}
                options={[
                    {label: 'Select', value: ''},
                    {label: 'Image', value: 'image'},
                    {label: 'Featured Image', value: 'featured-image'},
                    {label: 'Video', value: 'video'},
                ]}
                __nextHasNoMarginBottom
            />

            {/* Only show once a type is selected */}
            {settings.type && (
                <Grid columns={1} columnGap={15} rowGap={20}>
                    {/* IMAGE / FEATURED IMAGE */}
                    {(settings.type === 'image' || settings.type === 'featured-image') && (
                        <Grid columns={2} columnGap={15} rowGap={20}>
                            <MediaUploadCheck>
                                <MediaUpload
                                    onSelect={(newValue) =>
                                        callback({
                                            mobileImage: newValue,
                                        })
                                    }
                                    onClose={() => {
                                    }}
                                    allowedTypes={['image']}
                                    render={({open}) => (
                                        <Button
                                            onClick={open}
                                            variant="secondary"
                                            className="!w-full"
                                        >
                                            {settings.mobileImage?.url
                                                ? 'Change Mobile Image'
                                                : 'Select Mobile Image'}
                                        </Button>
                                    )}
                                />
                            </MediaUploadCheck>

                            <MediaUploadCheck>
                                <MediaUpload
                                    onSelect={(newValue) =>
                                        callback({
                                            largeImage: newValue,
                                        })
                                    }
                                    allowedTypes={['image']}
                                    render={({open}) => (
                                        <Button
                                            onClick={open}
                                            variant="secondary"
                                            className="!w-full"
                                        >
                                            {settings.largeImage?.url
                                                ? 'Change Large Image'
                                                : 'Select Large Image'}
                                        </Button>
                                    )}
                                />
                            </MediaUploadCheck>
                        </Grid>
                    )}

                    {/* VIDEO */}
                    {settings.type === 'video' && (
                        <Grid columns={2} columnGap={15} rowGap={20}>
                            <MediaUploadCheck>
                                <MediaUpload
                                    onSelect={(newValue) =>
                                        callback({
                                            mobileVideo: newValue,
                                        })
                                    }
                                    allowedTypes={['video']}
                                    render={({open}) => (
                                        <Button
                                            onClick={open}
                                            variant="secondary"
                                            className="!w-full"
                                        >
                                            {settings.mobileVideo?.url
                                                ? 'Change Mobile Video'
                                                : 'Select Mobile Video'}
                                        </Button>
                                    )}
                                />
                            </MediaUploadCheck>

                            <MediaUploadCheck>
                                <MediaUpload
                                    onSelect={(newValue) =>
                                        callback({
                                            largeVideo: newValue,
                                        })
                                    }
                                    allowedTypes={['video']}
                                    render={({open}) => (
                                        <Button
                                            onClick={open}
                                            variant="secondary"
                                            className="!w-full"
                                        >
                                            {settings.largeVideo?.url
                                                ? 'Change Large Video'
                                                : 'Select Large Video'}
                                        </Button>
                                    )}
                                />
                            </MediaUploadCheck>
                        </Grid>
                    )}

                    {/* TOGGLES */}
                    <Grid columns={3} columnGap={15} rowGap={20} style={{padding: '1rem 0'}}>
                        <ToggleControl
                            label="Eager"
                            checked={!!settings?.eager}
                            onChange={(newValue) => callback({eager: newValue})}
                        />
                        <ToggleControl
                            label="Force"
                            checked={!!settings?.force}
                            onChange={(newValue) => callback({force: newValue})}
                        />
                        <ToggleControl
                            label="Fixed"
                            checked={!!settings?.fixed}
                            onChange={(newValue) => callback({fixed: newValue})}
                        />
                    </Grid>

                    <Grid columns={1} columnGap={15} rowGap={20}>
                        <Grid columns={2} columnGap={15} rowGap={20}>
                            <SelectControl
                                __next40pxDefaultSize
                                label="Resolution"
                                value={settings?.resolution}
                                onChange={(newValue) => callback({resolution: newValue})}
                                options={RESOLUTION_OPTIONS}
                                __nextHasNoMarginBottom
                            />
                            <SelectControl
                                __next40pxDefaultSize
                                label="Size"
                                value={settings?.size}
                                onChange={(newValue) => callback({size: newValue})}
                                options={IMAGE_SIZE_OPTIONS}
                                __nextHasNoMarginBottom
                            />
                            <SelectControl
                                __next40pxDefaultSize
                                label="Blend"
                                value={settings?.blend}
                                onChange={(newValue) => callback({blend: newValue})}
                                options={BLEND_OPTIONS}
                                __nextHasNoMarginBottom
                            />
                            <SelectControl
                                __next40pxDefaultSize
                                label="Position"
                                value={settings?.position}
                                onChange={(newValue) => callback({position: newValue})}
                                options={POSITION_OPTIONS}
                                __nextHasNoMarginBottom
                            />
                            <SelectControl
                                __next40pxDefaultSize
                                label="Origin"
                                value={settings?.origin}
                                onChange={(newValue) => callback({origin: newValue})}
                                options={ORIGIN_OPTIONS}
                                __nextHasNoMarginBottom
                            />
                            <UnitControl
                                label="Max Height"
                                value={settings?.maxHeight}
                                onChange={(newValue) => callback({maxHeight: newValue})}
                                units={[{value: 'vh', label: 'vh', default: 0}]}
                            />
                            <SelectControl
                                __next40pxDefaultSize
                                label="Repeat"
                                value={settings?.repeat}
                                onChange={(newValue) => callback({repeat: newValue})}
                                options={REPEAT_OPTIONS}
                                __nextHasNoMarginBottom
                            />
                        </Grid>

                        <Grid columns={1} columnGap={15} rowGap={20}>
                            <PanelColorSettings
                                enableAlpha
                                className="!p-0 !border-0 [&_.components-tools-panel-item]:!m-0"
                                colorSettings={[
                                    {
                                        slug: 'color',
                                        label: 'Color',
                                        value: settings?.color ?? '',
                                        onChange: (newValue) => callback({color: newValue}),
                                        isShownByDefault: true,
                                    },
                                ]}
                            />
                            <RangeControl
                                label="Scale"
                                value={settings?.scale}
                                onChange={(newValue) => callback({scale: newValue})}
                                min={0}
                                max={200}
                            />
                            <RangeControl
                                label="Opacity"
                                value={settings?.opacity}
                                onChange={(newValue) => callback({opacity: newValue})}
                                min={0}
                                max={100}
                            />
                            <RangeControl
                                label="Width"
                                value={settings?.width}
                                onChange={(newValue) => callback({width: newValue})}
                                min={0}
                                max={100}
                            />
                            <RangeControl
                                label="Height"
                                value={settings?.height}
                                onChange={(newValue) => callback({height: newValue})}
                                min={0}
                                max={100}
                            />
                            <RangeControl
                                label="Fade"
                                value={settings?.fade}
                                onChange={(newValue) => callback({fade: newValue})}
                                min={0}
                                max={100}
                            />
                        </Grid>

                        <Grid columns={2} columnGap={15} rowGap={20} style={{padding: '1rem 0'}}>
                            <ToggleControl
                                label="Mask"
                                checked={!!settings?.mask}
                                onChange={(newValue) => callback({mask: newValue})}
                            />
                        </Grid>

                        {settings.mask && (
                            <Grid columns={1} columnGap={15} rowGap={20}>
                                <MediaUploadCheck>
                                    <MediaUpload
                                        onSelect={(newValue) =>
                                            callback({
                                                maskImageLarge: {
                                                    type: newValue.type,
                                                    id: newValue.id,
                                                    url: newValue.url,
                                                    alt: newValue.alt,
                                                    sizes: newValue.sizes,
                                                },
                                            })
                                        }
                                        allowedTypes={['image']}
                                        render={({open}) => (
                                            <Button onClick={open} variant="secondary">
                                                {settings.maskImageLarge?.url
                                                    ? 'Change Mask Image'
                                                    : 'Select Mask Image'}
                                            </Button>
                                        )}
                                    />
                                </MediaUploadCheck>

                                <Grid columns={2} columnGap={15} rowGap={20}>
                                    <SelectControl
                                        __next40pxDefaultSize
                                        label="Mask Origin"
                                        value={settings?.maskOrigin}
                                        onChange={(newValue) => callback({maskOrigin: newValue})}
                                        options={ORIGIN_OPTIONS}
                                        __nextHasNoMarginBottom
                                    />
                                    <SelectControl
                                        __next40pxDefaultSize
                                        label="Mask Size"
                                        value={settings?.maskSize}
                                        onChange={(newValue) => callback({maskSize: newValue})}
                                        options={IMAGE_SIZE_OPTIONS}
                                        __nextHasNoMarginBottom
                                    />
                                </Grid>
                            </Grid>
                        )}

                        <BaseControl label="Overlay" __nextHasNoMarginBottom={true}>
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
                                clearable
                                value={settings?.overlay ?? undefined}
                                onChange={(newValue) => callback({overlay: newValue})}
                            />
                        </BaseControl>
                    </Grid>
                </Grid>
            )}
        </Grid>
    </PanelBody>
}


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

    // --- Push local layout back up to attributes (replaces old setLayoutNow)
    useEffect(() => {

        const debouncedCommit = _.debounce((nextLayout) => {
            if (_.isEqual(cleanObject(nextLayout, true), cleanObject(settings, true))) {
                return
            }
            updateStyleSettings(nextLayout);
        }, 700); // adjust delay as needed

        debouncedCommit(localLayout);

        return () => debouncedCommit.cancel();
    }, [localLayout, settings]);


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

    const updateBreakpointItem = useCallback((newProps, bpKey) => {
        setLocalLayout((prev) => ({
            ...prev,
            breakpoints: {
                ...prev.breakpoints,
                [bpKey]: {
                    ...prev.breakpoints[bpKey],
                    ...newProps,
                },
            },
        }));
    }, [setLocalLayout]);

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

    // --- Background fields
    const BackgroundFields = useMemo(() => (
        <BackgroundControls settings={localLayout.background} callback={updateBackgroundItem}/>), []);

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
                    settings={localLayout.breakpoints[bpKey]}
                    updateFn={updateBreakpointItem}
                />
            </ToolsPanel>
            {/* Background Section */}
            <ToolsPanel
                label={__("Background")}
                resetAll={() =>
                    updateBreakpointItem({background: {}}, bpKey)
                }
            >
                <BackgroundControls
                    bpKey={bpKey}
                    settings={localLayout.breakpoints[bpKey]?.background || {}}
                    callback={(newProps) =>
                        updateBreakpointItem(
                            {background: {...(localLayout.breakpoints[bpKey]?.background || {}), ...newProps}},
                            bpKey
                        )
                    }
                />
            </ToolsPanel>
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
                    <Grid
                        columns={1}
                        columnGap={15}
                        rowGap={20}
                        className="wpbs-layout-tools__panel"
                    >
                        <HoverFields
                            settings={localLayout.hover}
                            suppress={["padding", "margin", "gap"]}
                        />
                    </Grid>
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
