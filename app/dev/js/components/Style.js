import {Fragment, memo, useCallback, useEffect, useMemo, useRef, useState} from '@wordpress/element';
import {StyleEditorUI} from "Includes/style";
import _, {isEqual} from 'lodash';
import {BlockWrapper} from 'Components/BlockWrapper';


export const STYLE_ATTRIBUTES = {
    'uniqueId': {type: 'string'},
    'wpbs-css': {type: 'object', default: {}},
    'wpbs-preload': {type: 'array', default: [{test: 'test'}]},
    'wpbs-style': {type: 'object', default: {}},
};

const API = window?.WPBS_StyleEditor ?? {};
const {getCSSFromStyle, cleanObject, parseSpecialProps, parseBackgroundProps} = API;

const getDataProps = (props) => {
    const {attributes} = props;
    const style = attributes['wpbs-style'] || {};
    const background = style.background || {};
    const layout = style.layout || {};

    const data = Object.fromEntries(Object.entries({
        ElementTagName: 'div',
        hasBackground: !!background.type,
        hasContainer: !!layout.container || !!background.type,
        background,
    }).filter(Boolean));

    return {...props, styleData: data};
};

function extractPreloadsFromLayout(layout) {
    const bpDefs = WPBS?.settings?.breakpoints ?? {};
    const result = [];

    if (!layout) return result;

    // 1. Base
    if (layout.background?.eager) {
        const bg = layout.background;
        if (bg.type === 'image' && bg.image?.id) {
            result.push({
                id: bg.image.id,
                media: null,
                resolution: bg.image?.size || null,
                type: 'image',
            });
        }
        if (bg.type === 'video' && bg.video?.id) {
            result.push({
                id: bg.video.id,
                media: null,
                resolution: null,
                type: 'video',
            });
        }
    }

    // 2. Breakpoints
    Object.entries(layout.breakpoints || {}).forEach(([bpKey, bp]) => {
        const bg = bp.background;
        if (!bg?.eager) return;

        if (bg.type === 'image' && bg.image?.id) {
            result.push({
                id: bg.image.id,
                media: bpKey,
                resolution: bg.image?.size || null,
                type: 'image',
            });
        }

        if (bg.type === 'video' && bg.video?.id) {
            result.push({
                id: bg.video.id,
                media: bpKey,
                resolution: null,
                type: 'video',
            });
        }
    });

    return result;
}

export const withStyle = (Component) => (props) => {
    const blockCssRef = useRef({});
    const blockPreloadRef = useRef([]);

    const {clientId, attributes, setAttributes, tagName, isSelected} = props;
    const {uniqueId} = attributes;
    const blockGap = attributes?.style?.spacing?.blockGap;
    const blockGapDeps = typeof blockGap === 'object' ? JSON.stringify(blockGap) : blockGap;

    const settings = attributes?.['wpbs-style'] ?? {
        props: {},
        breakpoints: {},
        advanced: {},
        hover: {},
        background: {},
    };

    const StyleEditorPanel = memo(({settings, updateStyleSettings}) => (
        <StyleEditorUI
            settings={settings}
            updateStyleSettings={updateStyleSettings}
        />
    ));

    const updateStyleSettings = useCallback(
        (nextLayout = {}) => {


            const cleanedNext = cleanObject(nextLayout, true);
            const cleanedCurrent = cleanObject(settings, true);

            // --- Base CSS object
            const cssObj = {
                props: parseSpecialProps(cleanedNext.props || {}, attributes),
                background: parseBackgroundProps(cleanedNext.background || {}),
                hover: {},
                breakpoints: {},
                custom: cleanObject(blockCssRef.current || {}, true),
            };

            // Generate preload list
            const preloads = extractPreloadsFromLayout(cleanedNext);

            // Write preload list (deduped)
            commitPreload(preloads);

            // --- Add default Gutenberg gap from attributes.style
            const blockGap = attributes?.style?.spacing?.blockGap;
            if (blockGap) {
                const rowGapVal =
                    blockGap?.top ?? (typeof blockGap === 'string' ? blockGap : undefined);
                const columnGapVal =
                    blockGap?.left ?? (typeof blockGap === 'string' ? blockGap : undefined);

                if (rowGapVal) {
                    const gap = getCSSFromStyle(rowGapVal);
                    cssObj.props['--row-gap'] = gap;
                    cssObj.props['row-gap'] = gap;
                }
                if (columnGapVal) {
                    const gap = getCSSFromStyle(columnGapVal);
                    cssObj.props['--column-gap'] = gap;
                    cssObj.props['column-gap'] = gap;
                }
            }

            // --- Breakpoints (responsive gaps handled separately)
            for (const [bpKey, bpProps] of Object.entries(cleanedNext.breakpoints || {})) {
                cssObj.breakpoints[bpKey] = {
                    props: parseSpecialProps(bpProps.props || {}, attributes),
                    background: parseBackgroundProps(bpProps.background || {}),
                };
            }

            // --- Hover styles
            if (cleanedNext.hover) {
                cssObj.hover = parseSpecialProps(cleanedNext.hover, attributes);
            }

            // --- Compare and apply only when meaningful changes occur
            const cleanedCss = cleanObject(cssObj, true);
            const prevCss = cleanObject(attributes?.['wpbs-css'] ?? {}, true);

            if (!_.isEqual(cleanedCss, prevCss) || !_.isEqual(cleanedNext, cleanedCurrent)) {
                setAttributes({
                    'wpbs-style': nextLayout,
                    'wpbs-css': cleanedCss,
                });
            }
        },
        [settings, setAttributes, blockGapDeps]
    );

    const commitPreload = useCallback((newItems = []) => {
        //console.log(newItems);
        // Preloads from block-side intent
        const blockItems = Array.isArray(blockPreloadRef.current)
            ? blockPreloadRef.current
            : [];

        // New items coming from HOC logic
        const incoming = Array.isArray(newItems) ? newItems : [];

        // Combine both
        const combined = [...blockItems, ...incoming];

        // Deduplicate on (id, resolution, media, type)
        const seen = new Set();
        const deduped = [];

        const buildKey = (x) =>
            `${x.id}|${x.resolution || ''}|${x.media || ''}|${x.type || ''}`;

        for (const item of combined) {
            if (!item?.id) continue;
            const key = buildKey(item);
            if (!seen.has(key)) {
                seen.add(key);
                deduped.push(item);
            }
        }

        // Compare to saved attributes before writing
        const currentAttr = attributes['wpbs-preload'] ?? [];

        if (!_.isEqual(currentAttr, deduped)) {
            setAttributes({'wpbs-preload': deduped});
        }

    }, [attributes['wpbs-preload'], setAttributes]);

    const updateBlockCssRef = useCallback((newProps = {}) => {
        // store custom css
        blockCssRef.current = newProps || {};

        // rebuild css using existing layout (settings)
        updateStyleSettings(settings);

    }, [updateStyleSettings, settings]);

    const updatePreloadRef = useCallback((newProps = []) => {
        // store block-side intent
        blockPreloadRef.current = Array.isArray(newProps) ? newProps : [];

        // dedupe + save the block’s list
        commitPreload(blockPreloadRef.current);

    }, [commitPreload]);

    const StyledComponent = useMemo(() => {
        return (
            <Component
                {...getDataProps(props)}
                BlockWrapper={(wrapperProps) => (
                    <BlockWrapper {...wrapperProps} props={props} clientId={clientId}/>
                )}
                setCss={updateBlockCssRef}
                setPreload={updatePreloadRef}
            />
        );
    }, [clientId, settings, blockGapDeps, updateBlockCssRef]);

    // Watch for changes in Gutenberg's native gap control
    useEffect(() => {
        updateStyleSettings(settings);

    }, [blockGapDeps]);

    return (
        <>
            {StyledComponent}
            <StyleEditorPanel
                settings={settings}
                updateStyleSettings={updateStyleSettings}
            />

        </>
    );
};

export const withStyleSave = (Component) => (props) => {

    const {attributes, clientId} = props;
    const {'wpbs-style': styleData = {}} = attributes;

    return (
        <Component
            {...getDataProps(props)}
            BlockWrapper={(wrapperProps) => (
                <BlockWrapper props={props} clientId={clientId} isSave={true} {...wrapperProps}/>
            )}
            styleData={styleData}
        />
    );
};