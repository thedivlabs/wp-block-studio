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

function normalizePreloadItem(item) {
    if (!item || !item.id) return null;

    const out = {
        id: item.id,
        type: item.type || "image"
    };

    if (item.media) out.media = item.media;
    if (item.resolution) out.resolution = item.resolution;

    return out;
}

export const withStyle = (Component) => (props) => {
    const blockCssRef = useRef({});
    const blockPreloadRef = useRef([]);

    const { clientId, attributes, setAttributes } = props;

    const {
        uniqueId,
        'wpbs-style': settings = {
            props: {},
            breakpoints: {},
            advanced: {},
            hover: {},
            background: {},
        }
    } = attributes;

    const blockGap = attributes?.style?.spacing?.blockGap;
    const blockGapDeps =
        typeof blockGap === 'object' ? JSON.stringify(blockGap) : blockGap;

    const StyleEditorPanel = memo(({ settings, updateStyleSettings }) => (
        <StyleEditorUI settings={settings} updateStyleSettings={updateStyleSettings} />
    ));

    // ------------------------------------------------------------
    // STYLE / CSS SAVE
    // ------------------------------------------------------------
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

            // Preloads from layout itself
            const preloads = extractPreloadsFromLayout(cleanedNext);
            commitPreload(preloads);

            // --- Default block gap
            const gap = attributes?.style?.spacing?.blockGap;
            if (gap) {
                const rowGapVal =
                    gap?.top ?? (typeof gap === 'string' ? gap : undefined);
                const columnGapVal =
                    gap?.left ?? (typeof gap === 'string' ? gap : undefined);

                if (rowGapVal) {
                    const g = getCSSFromStyle(rowGapVal);
                    cssObj.props['--row-gap'] = g;
                    cssObj.props['row-gap'] = g;
                }
                if (columnGapVal) {
                    const g = getCSSFromStyle(columnGapVal);
                    cssObj.props['--column-gap'] = g;
                    cssObj.props['column-gap'] = g;
                }
            }

            // --- Breakpoints
            for (const [bpKey, bpProps] of Object.entries(
                cleanedNext.breakpoints || {}
            )) {
                cssObj.breakpoints[bpKey] = {
                    props: parseSpecialProps(bpProps.props || {}, attributes),
                    background: parseBackgroundProps(bpProps.background || {}),
                };
            }

            // --- Hover
            if (cleanedNext.hover) {
                cssObj.hover = parseSpecialProps(cleanedNext.hover, attributes);
            }

            // --- Compare + write
            const cleanedCss = cleanObject(cssObj, true);
            const prevCss = cleanObject(attributes['wpbs-css'] ?? {}, true);

            if (!_.isEqual(cleanedCss, prevCss) || !_.isEqual(cleanedNext, cleanedCurrent)) {
                setAttributes({
                    'wpbs-style': nextLayout,
                    'wpbs-css': cleanedCss,
                });
            }
        },
        [settings, setAttributes, blockGapDeps]
    );

    // ------------------------------------------------------------
    // PRELOAD SAVE
    // ------------------------------------------------------------
    const commitPreload = useCallback((newItems = []) => {
        const blockItems = Array.isArray(blockPreloadRef.current)
            ? blockPreloadRef.current
            : [];

        const incoming = Array.isArray(newItems) ? newItems : [];

        // Normalize + remove nulls
        const cleanIncoming = incoming
            .map(normalizePreloadItem)
            .filter(Boolean);

        const cleanBlock = blockItems
            .map(normalizePreloadItem)
            .filter(Boolean);

        const combined = [...cleanBlock, ...cleanIncoming];

        // Dedupe
        const seen = new Set();
        const deduped = [];

        const buildKey = (x) =>
            `${x.id}|${x.resolution || ''}|${x.media || ''}|${x.type || ''}`;

        for (const item of combined) {
            const key = buildKey(item);
            if (!seen.has(key)) {
                seen.add(key);
                deduped.push(item);
            }
        }

        const currentAttr = attributes['wpbs-preload'] ?? [];

        if (!_.isEqual(currentAttr, deduped)) {
            setAttributes({ 'wpbs-preload': deduped });
        }

    }, [attributes['wpbs-preload'], setAttributes]);

    // ------------------------------------------------------------
    // BLOCK → REFS SETTERS
    // ------------------------------------------------------------
    const updateBlockCssRef = useCallback(
        (newCss = {}) => {
            blockCssRef.current = newCss || {};

            // --- FIXED ---
            // We ONLY rebuild CSS using the *existing layout* (settings),
            // not passing blockCssRef into nextLayout.
            updateStyleSettings(settings);
        },
        [updateStyleSettings, settings]
    );

    const updatePreloadRef = useCallback(
        (newItems = []) => {
            blockPreloadRef.current = Array.isArray(newItems) ? newItems : [];

            // Only commit what came from the block.
            commitPreload(blockPreloadRef.current);
        },
        [commitPreload]
    );

    // ------------------------------------------------------------
    // MAIN RENDER
    // ------------------------------------------------------------
    const StyledComponent = useMemo(
        () => (
            <Component
                {...getDataProps(props)}
                BlockWrapper={(wrapperProps) => (
                    <BlockWrapper
                        {...wrapperProps}
                        props={props}
                        clientId={clientId}
                    />
                )}
                setCss={updateBlockCssRef}
                setPreload={updatePreloadRef}
            />
        ),
        [clientId, settings, blockGapDeps, updateBlockCssRef]
    );

    // ------------------------------------------------------------
    // BLOCK GAP TRIGGER
    // ------------------------------------------------------------
    useEffect(() => {
        updateStyleSettings(settings);
    }, [blockGapDeps]);

    return (
        <>
            {StyledComponent}
            <StyleEditorPanel settings={settings} updateStyleSettings={updateStyleSettings} />
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