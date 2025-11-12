import {Fragment, memo, useCallback, useEffect, useMemo, useRef, useState} from '@wordpress/element';
import {
    InspectorControls,
} from '@wordpress/block-editor';
import {StyleEditorUI} from "Includes/style";
import _, {isEqual} from 'lodash';
import {BlockWrapper} from 'Components/BlockWrapper';
import {AdvancedControls} from 'Components/AdvancedControls';


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


const StyleEditorPanel = memo(({settings, updateStyleSettings}) => (
    <StyleEditorUI
        settings={settings}
        updateStyleSettings={updateStyleSettings}
    />
));

const StyledAdvancedControls = memo(({settings, callback}) => (
    <AdvancedControls settings={settings} callback={callback}/>
));

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

    // --- Reactive version of updateStyleSettings
    const updateStyleSettings = useCallback((nextStyle) => {
        const cleanedNext = cleanObject(nextStyle, true);
        const cleanedCurrent = cleanObject(settings, true);

        const cssObj = {
            props: parseSpecialProps(cleanedNext.props || {}),
            background: parseBackgroundProps(cleanedNext.background || {}),
            hover: parseSpecialProps(cleanedNext.hover || {}),
            breakpoints: {},
            custom: cleanObject(cssPropsRef.current || {}, true),
        };

        for (const [bpKey, bpProps] of Object.entries(cleanedNext.breakpoints || {})) {
            cssObj.breakpoints[bpKey] = {
                props: parseSpecialProps(bpProps.props || {}),
                background: parseBackgroundProps(bpProps.background || {}),
            };
        }

        setAttributes({
            'wpbs-style': cleanedNext,
            'wpbs-css': cleanObject(cssObj, true),
        });
    }, [settings, setAttributes]);

    // Create a debounced version that survives re-renders
    const debouncedUpdateStyleSettings = useMemo(
        () => _.debounce(updateStyleSettings, 150),
        [updateStyleSettings]
    );

    // Watch for changes in Gutenberg's native gap control
    useEffect(() => {
        debouncedUpdateStyleSettings(settings);
        // Cleanup to cancel pending debounce when unmounting or deps change
        return () => debouncedUpdateStyleSettings.cancel();
    }, [blockGapDeps]);


    return (
        <>
            {StyledComponent}
            <InspectorControls group="styles">
                {isSelected && (
                    <StyleEditorPanel
                        settings={settings}
                        updateStyleSettings={debouncedUpdateStyleSettings}
                    />
                )}
            </InspectorControls>
            <InspectorControls group="advanced">
                <StyledAdvancedControls
                    settings={settings ?? {}}
                    callback={debouncedUpdateStyleSettings}
                />
            </InspectorControls>

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