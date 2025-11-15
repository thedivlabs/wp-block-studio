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


const StyleEditorPanel = memo(({settings, updateStyleSettings}) => (
    <StyleEditorUI settings={settings} updateStyleSettings={updateStyleSettings}/>
));

export const withStyle = (Component) => (props) => {
    const API = window?.WPBS_StyleEditor ?? {};
    const {onStyleChange, cleanObject, removeBlockCss} = API;

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

    // ------------------------------------------------------------
    // CLEANUP EFFECT — remove CSS on unmount
    // ------------------------------------------------------------
    useEffect(() => {
        return () => {
            if (removeBlockCss && clientId) {
                removeBlockCss(clientId);
            }
        };
    }, []); // clientId is stable

    /*
    ----------------------------------------------------------------------
    UPDATE SETTINGS (only saves wpbs-style)
    ----------------------------------------------------------------------
    */
    const updateStyleSettings = useCallback(
        (nextLayout = {}) => {
            const cleanedNext = cleanObject(nextLayout, true);
            const cleanedCurrent = cleanObject(settings, true);

            if (!_.isEqual(cleanedNext, cleanedCurrent)) {
                setAttributes({'wpbs-style': nextLayout});
            }
            // no onStyleChange here anymore
        },
        [settings, setAttributes]
    );

    /*
    ----------------------------------------------------------------------
    BLOCK → RAW CSS REF
    ----------------------------------------------------------------------
    */
    const updateBlockCssRef = useCallback(
        (newCss = {}) => {
            blockCssRef.current = newCss || {};
            // parsing is driven by the wpbs-style watcher effect
        },
        []
    );

    /*
    ----------------------------------------------------------------------
    BLOCK → RAW PRELOAD REF
    ----------------------------------------------------------------------
    */
    const updatePreloadRef = useCallback(
        (newItems = []) => {
            blockPreloadRef.current = Array.isArray(newItems)
                ? newItems
                : [];
            // parsing is driven by the wpbs-style watcher effect
        },
        []
    );

    /*
    ----------------------------------------------------------------------
    STYLE CHANGE EFFECT
    Watches wpbs-style (settings) and kicks the external parser.
    ----------------------------------------------------------------------
    */
    useEffect(() => {
        if (typeof onStyleChange !== 'function') return;

        onStyleChange({
            clientId,
            css: blockCssRef.current,
            preload: blockPreloadRef.current,
            attributes,
        });
    }, [settings, blockGapDeps]);

    /*
    ----------------------------------------------------------------------
    MAIN RENDER
    ----------------------------------------------------------------------
    */
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

    /*
    ----------------------------------------------------------------------
    BLOCK GAP TRIGGER
    ----------------------------------------------------------------------
    */
    useEffect(() => {
        if (!blockGap) return;

        // Block gap no longer compares CSS — simply triggers a layout update
        updateStyleSettings(settings);
    }, [blockGapDeps]);

    /*
    ----------------------------------------------------------------------
    OUTPUT
    ----------------------------------------------------------------------
    */
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