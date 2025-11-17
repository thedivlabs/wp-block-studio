import {Fragment, memo, useCallback, useEffect, useMemo, useRef, useState} from '@wordpress/element';
import {StyleEditorUI} from "Includes/style";
import _, {isEqual} from 'lodash';
import {BlockWrapper} from 'Components/BlockWrapper';
import {
    normalizePreloadItem,
    extractPreloadsFromLayout,
    getDataProps
} from 'Includes/helper';
import {useInstanceId} from "@wordpress/compose";


export const STYLE_ATTRIBUTES = {
    'uniqueId': {type: 'string'},
    'wpbs-css': {type: 'object', default: {}},
    'wpbs-preload': {type: 'array', default: [{test: 'test'}]},
    'wpbs-style': {type: 'object', default: {}},
};


const StyleEditorPanel = memo(
    ({settings, updateStyleSettings}) => (
        <StyleEditorUI
            settings={settings}
            updateStyleSettings={updateStyleSettings}
        />
    ),
    (prev, next) => _.isEqual(prev.settings, next.settings)
);


export const withStyle = (Component) => (props) => {
    const API = window?.WPBS_StyleEditor ?? {};
    const {onStyleChange, cleanObject, removeBlockCss} = API;

    const blockCssRef = useRef({});
    const blockPreloadRef = useRef([]);
    const styleRef = useRef(null);
    const initialClientIdRef = useRef(null);


    const {clientId, attributes, setAttributes, name} = props;

    const instanceId = useInstanceId(withStyle, name.replace('/', '-'));

    useEffect(() => {
        console.log(instanceId);
    }, [])

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

    useEffect(() => {
        if (!initialClientIdRef.current) {


            if (!attributes.uniqueId) {
                //setAttributes({uniqueId: instanceId});
                //console.log('BLOCK CREATED');
            }
        }

        if (attributes.uniqueId !== instanceId && !initialClientIdRef.current) {
            // BLOCK WAS CLONED
            //setAttributes({uniqueId: instanceId});
            console.log('BLOCK WAS CLONED');
        } else {
            console.log('BLOCK CREATED');
            initialClientIdRef.current = clientId;
        }
    }, []);


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
                console.log('updateStyleSettings', nextLayout);
                setAttributes({
                    'wpbs-style': cleanedNext,
                    uniqueId: instanceId
                });
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
        if (typeof onStyleChange !== "function") return;
        if (!styleRef.current) return;


        onStyleChange({
            css: blockCssRef.current,
            preload: blockPreloadRef.current,
            props,
            styleRef
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
        [clientId, uniqueId]
    );

    /*
    ----------------------------------------------------------------------
    OUTPUT
    ----------------------------------------------------------------------
    */
    return (
        <>
            {StyledComponent}
            {attributes?.['wpbs-css'] && (
                <style ref={styleRef}/>
            )}
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