import {Fragment, memo, useCallback, useEffect, useMemo, useRef, useState} from '@wordpress/element';
import {StyleEditorUI} from "Includes/style";
import _, {isEqual} from 'lodash';
import {BlockWrapper} from 'Components/BlockWrapper';


export const STYLE_ATTRIBUTES = {
    'uniqueId': {type: 'string'},
    'wpbs-css': {type: 'object', default: {}},
    'wpbs-preload': {type: 'array'},
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

export const withStyle = (Component) => (props) => {
    const cssPropsRef = useRef({});
    const {clientId, attributes, setAttributes, tagName, isSelected} = props;
    const {uniqueId} = attributes;
    const blockGap = attributes?.style?.spacing?.blockGap;

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

    const blockCss = useCallback((newProps = {}) => {
        cssPropsRef.current = newProps || {};
    }, []);

    const blockGapDeps = typeof blockGap === 'object' ? JSON.stringify(blockGap) : blockGap;

    const StyledComponent = useMemo(() => {
        return (
            <Component
                {...getDataProps(props)}
                BlockWrapper={(wrapperProps) => (
                    <BlockWrapper {...wrapperProps} props={props} clientId={clientId}/>
                )}
            />
        );
    }, [clientId, settings, blockGapDeps]);

    const updateStyleSettings = useCallback(
        (nextLayout = {}) => {


            const cleanedNext = cleanObject(nextLayout, true);
            const cleanedCurrent = cleanObject(settings, true);

            // --- Base CSS object
            const cssObj = {
                props: parseSpecialProps(cleanedNext.props || {}),
                background: parseBackgroundProps(cleanedNext.background || {}),
                hover: {},
                breakpoints: {},
                custom: cleanObject(cssPropsRef.current || {}, true),
            };

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
                    props: parseSpecialProps(bpProps.props || {}),
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