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


const BackgroundControls = ({settings = {}, callback}) => {

    return <PanelBody title={'Background'} initialOpen={!!settings.type}>
        <Grid columns={1} columnGap={15} rowGap={20}>
            <SelectControl
                __next40pxDefaultSize
                label="Type"
                value={settings?.['bgType']}
                onChange={(newValue) => callback({'bgType': newValue})}
                options={[
                    {label: 'Select', value: ''},
                    {label: 'Image', value: 'image'},
                    {label: 'Featured Image', value: 'featured-image'},
                    {label: 'Video', value: 'video'},
                ]}
                __nextHasNoMarginBottom
            />
            <Grid columns={1} columnGap={15} rowGap={20} style={{display: !settings.type ? 'none' : null}}>

                <div style={{display: settings.type !== 'image' && settings.type !== 'featured-image' ? 'none' : null}}>
                    <MediaControl
                        label={'Image'}
                        value={settings?.['bgImage']}
                        callback={(newValue) => callback({'bgImage': newValue})}
                        clear={() => callback({'bgImage': {}})}
                        allowedTypes={['image']}
                    />

                </div>
                <div style={{display: settings.type !== 'video' ? 'none' : null}}>
                    <MediaControl
                        label={'Video'}
                        value={settings?.['bgVideo']}
                        callback={(newValue) => callback({'bgVideo': newValue})}
                        clear={() => callback({'bgVideo': {}})}
                        allowedTypes={['video']}
                    />

                </div>

                <Grid columns={2} columnGap={15} rowGap={20} style={{padding: '1rem 0'}}>
                    <ToggleControl
                        label="Eager"
                        checked={!!settings?.['bgEager']}
                        onChange={(newValue) => callback({'bgEager': newValue})}
                    />
                    <ToggleControl
                        label="Force"
                        checked={!!settings?.['bgForce']}
                        onChange={(newValue) => callback({'bgForce': newValue})}
                    />
                    <ToggleControl
                        label="Fixed"
                        checked={!!settings?.['bgFixed']}
                        onChange={(newValue) => callback({'bgFixed': newValue})}
                    />
                </Grid>
                <Grid columns={2} columnGap={15} rowGap={20} style={{padding: '1rem 0'}}>
                    <SelectControl
                        __next40pxDefaultSize
                        label="Resolution"
                        value={settings?.['bgResolution']}
                        onChange={(newValue) => callback({'bgResolution': newValue})}
                        options={RESOLUTION_OPTIONS}
                        __nextHasNoMarginBottom
                    />
                    <SelectControl
                        __next40pxDefaultSize
                        label="Size"
                        value={settings?.['background-size']}
                        onChange={(newValue) => callback({'background-size': newValue})}
                        options={IMAGE_SIZE_OPTIONS}
                        __nextHasNoMarginBottom
                    />
                    <SelectControl
                        __next40pxDefaultSize
                        label="Blend"
                        value={settings?.['background-blend-mode']}
                        onChange={(newValue) => callback({'background-blend-mode': newValue})}
                        options={BLEND_OPTIONS}
                        __nextHasNoMarginBottom
                    />
                    <SelectControl
                        __next40pxDefaultSize
                        label="Position"
                        value={settings?.['background-position']}
                        onChange={(newValue) => callback({'background-position': newValue})}
                        options={POSITION_OPTIONS}
                        __nextHasNoMarginBottom
                    />
                    <SelectControl
                        __next40pxDefaultSize
                        label="Origin"
                        value={settings?.['background-origin']}
                        onChange={(newValue) => callback({'background-origin': newValue})}
                        options={ORIGIN_OPTIONS}
                        __nextHasNoMarginBottom
                    />
                    <UnitControl
                        label={'Max Height'}
                        value={settings?.['bgMaxHeight']}
                        onChange={(newValue) => callback({'bgMaxHeight': newValue})}
                        units={[
                            {value: 'vh', label: 'vh', default: 0},
                        ]}
                        __nextHasNoMarginBottom
                        __next40pxDefaultSize
                    />
                    <SelectControl
                        __next40pxDefaultSize
                        label="Repeat"
                        value={settings?.['background-repeat']}
                        onChange={(newValue) => callback({'background-repeat': newValue})}
                        options={REPEAT_OPTIONS}
                        __nextHasNoMarginBottom
                    />


                </Grid>

                <PanelColorSettings
                    enableAlpha
                    className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                    colorSettings={[
                        {
                            slug: 'color',
                            label: 'Color',
                            value: settings?.['background-color'] ?? '',
                            onChange: (newValue) => callback({'background-color': newValue}),
                            isShownByDefault: true
                        }
                    ]}
                />
                <RangeControl
                    label="Scale"
                    value={settings?.['bgScale']}
                    onChange={(newValue) => callback({'bgScale': newValue})}
                    min={0}
                    max={200}
                />
                <RangeControl
                    label="Opacity"
                    value={settings?.['bgOpacity']}
                    onChange={(newValue) => callback({'bgOpacity': newValue})}
                    min={0}
                    max={100}
                />
                <RangeControl
                    label="Width"
                    value={settings?.['bgWidth']}
                    onChange={(newValue) => callback({'bgWidth': newValue})}
                    min={0}
                    max={100}
                />
                <RangeControl
                    label="Height"
                    value={settings?.['bgHeight']}
                    onChange={(newValue) => callback({'bgHeight': newValue})}
                    min={0}
                    max={100}
                />
                <RangeControl
                    label="Fade"
                    value={settings?.['bgFade']}
                    onChange={(newValue) => callback({'bgFade': newValue})}
                    min={0}
                    max={100}
                />


                <MediaControl
                    label={'Mask Image'}
                    prop={'bgMaskImage'}
                    allowedTypes={['image']}
                    value={settings?.['bgMaskImage']}
                    callback={(newValue) => callback({
                        maskImageLarge: {
                            type: newValue.type,
                            id: newValue.id,
                            url: newValue.url,
                            alt: newValue?.alt,
                            sizes: newValue?.sizes,
                        }
                    })}
                    clear={() => callback({
                        maskImageLarge: {}
                    })}
                />

                <Grid columns={2} columnGap={15} rowGap={20} style={{display: !settings.mask ? 'none' : null}}>

                    <SelectControl
                        __next40pxDefaultSize
                        label="Mask Origin"
                        value={settings?.['bgMaskOrigin']}
                        onChange={(newValue) => callback({'bgMaskOrigin': newValue})}
                        options={ORIGIN_OPTIONS}
                        __nextHasNoMarginBottom
                    />

                    <SelectControl
                        __next40pxDefaultSize
                        label="Mask Size"
                        value={settings?.['bgMaskSize']}
                        onChange={(newValue) => callback({'bgMaskSize': newValue})}
                        options={IMAGE_SIZE_OPTIONS}
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
                        clearable={true}
                        value={settings?.['bgOverlay'] ?? undefined}
                        onChange={(newValue) => callback({'bgOverlay': newValue})}
                    />
                </BaseControl>

            </Grid>
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
            const current = prev.breakpoints?.[bpKey] || { props: {}, background: {} };

            // Normalize structure
            const next = {
                props: { ...current.props },
                background: { ...current.background },
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
                    updateFn={(newProps) => updateBreakpointItem({ props: newProps }, bpKey)}
                />
            </ToolsPanel>
            {/* Background Section */}
            <BackgroundControls
                bpKey={bpKey}
                settings={localLayout.breakpoints[bpKey]?.background || {}}
                callback={(newProps) =>
                    updateBreakpointItem({ background: newProps }, bpKey)
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
