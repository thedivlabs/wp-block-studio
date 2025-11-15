import {Fragment, memo, useCallback, useEffect, useMemo, useRef, useState} from '@wordpress/element';
import {StyleEditorUI} from "Includes/style";
import _, {isEqual} from 'lodash';
import {BlockWrapper} from 'Components/BlockWrapper';
import {
    normalizePreloadItem,
    extractPreloadsFromLayout,
    getDataProps
} from 'Includes/helper';


export const STYLE_ATTRIBUTES = {
    'uniqueId': {type: 'string'},
    'wpbs-css': {type: 'object', default: {}},
    'wpbs-preload': {type: 'array', default: [{test: 'test'}]},
    'wpbs-style': {type: 'object', default: {}},
};

const API = window?.WPBS_StyleEditor ?? {};
const {getCSSFromStyle, cleanObject, parseSpecialProps, parseBackgroundProps} = API;


const StyleEditorPanel = memo(({settings, updateStyleSettings}) => (
    <StyleEditorUI settings={settings} updateStyleSettings={updateStyleSettings}/>
));

export const withStyle = (Component) => (props) => {
    const blockCssRef = useRef({});
    const blockPreloadRef = useRef([]);

    const {clientId, attributes, setAttributes} = props;

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

    const updateStyleSettings = useCallback(
        (nextLayout = {}) => {
            const cleanedNext = cleanObject(nextLayout, true);
            const cleanedCurrent = cleanObject(settings, true);

            // 1. Base CSS object from layout
            let cssObj = {
                props: parseSpecialProps(cleanedNext.props || {}, attributes),
                background: parseBackgroundProps(cleanedNext.background || {}),
                hover: {},
                breakpoints: {}
            };

            // 2. Gaps
            const gap = attributes?.style?.spacing?.blockGap;
            if (gap) {
                const rowGapVal = gap?.top ?? (typeof gap === 'string' ? gap : undefined);
                const columnGapVal = gap?.left ?? (typeof gap === 'string' ? gap : undefined);

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

            // 3. Breakpoints from layout
            for (const [bpKey, bpProps] of Object.entries(cleanedNext.breakpoints || {})) {
                cssObj.breakpoints[bpKey] = {
                    props: parseSpecialProps(bpProps.props || {}, attributes),
                    background: parseBackgroundProps(bpProps.background || {})
                };
            }

            // 4. Hover
            if (cleanedNext.hover) {
                cssObj.hover = parseSpecialProps(cleanedNext.hover, attributes);
            }

            // 5. MERGE block CSS (deep)
            cssObj = _.merge({}, cssObj, blockCssRef.current || {});

            // 6. Clean for minimal output
            const cleanedCss = cleanObject(cssObj, true);
            const prevCss = cleanObject(attributes['wpbs-css'] ?? {}, true);

            // 7. Preloads from layout
            const preloads = extractPreloadsFromLayout(cleanedNext);
            commitPreload(preloads);

            console.log('finished parsing');

            // 8. Commit if changed
            if (!_.isEqual(cleanedCss, prevCss) || !_.isEqual(cleanedNext, cleanedCurrent)) {
                setAttributes({
                    'wpbs-style': nextLayout,
                    'wpbs-css': cleanedCss
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
            setAttributes({'wpbs-preload': deduped});
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
        [clientId]
    );

    // ------------------------------------------------------------
    // BLOCK GAP TRIGGER
    // ------------------------------------------------------------
    useEffect(() => {
        if (!blockGap) return;

        const cssProps = attributes?.['wpbs-css']?.props || {};

        const parsedRow = blockGap.top ? getCSSFromStyle(blockGap.top) : null;
        const parsedCol = blockGap.left ? getCSSFromStyle(blockGap.left) : null;

        const cssRow = cssProps['row-gap'] || null;
        const cssCol = cssProps['column-gap'] || null;

        const rowGapMatch = parsedRow === cssRow;
        const colGapMatch = parsedCol === cssCol;

        if (rowGapMatch && colGapMatch) return;

        updateStyleSettings(settings);
    }, [blockGapDeps]);

    return (
        <>
            {StyledComponent}
            <StyleEditorPanel settings={settings} updateStyleSettings={updateStyleSettings}/>
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