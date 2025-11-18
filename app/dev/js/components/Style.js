import {Fragment, memo, useCallback, useEffect, useMemo, useRef, useState} from '@wordpress/element';
import {StyleEditorUI} from "Includes/style";
import _ from 'lodash';
import {BlockWrapper} from 'Components/BlockWrapper';
import {useInstanceId} from "@wordpress/compose";


export const STYLE_ATTRIBUTES = {
    'uniqueId': {type: 'string'},
    'wpbs-css': {type: 'object', default: {}},
    'wpbs-preload': {type: 'array', default: [{test: 'test'}]},
    'wpbs-icons': {
        type: 'array',
        default: []
    },
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
    const {onStyleChange, cleanObject, registerBlock, unregisterBlock} = API;
    const {clientId, attributes, setAttributes, name} = props;

    const instanceId = useInstanceId(withStyle, name.replace('/', '-'));

    const blockGap = attributes?.style?.spacing?.blockGap;
    const blockGapDeps = typeof blockGap === 'object' ? JSON.stringify(blockGap) : blockGap;
    const blockCssRef = useRef({});
    const blockPreloadRef = useRef([]);
    const styleRef = useRef(null);


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
        const oldId = uniqueId;
        const status = registerBlock(oldId, clientId);

        if (status === "fresh" || status === "clone") {
            const newId = instanceId;

            setAttributes({uniqueId: newId});
            registerBlock(newId, clientId);

            if (oldId && oldId !== newId) {
                unregisterBlock(oldId, clientId);
            }
        }
    }, []);

    useEffect(() => {
        return () => {
            unregisterBlock(attributes.uniqueId, clientId);
        };
    }, []);


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
                setAttributes({
                    'wpbs-style': cleanedNext,
                    //uniqueId: instanceId
                });
            }

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
    }, [settings, blockGapDeps, uniqueId]);


    props.BlockWrapper = useCallback((wrapperProps) => {
        return <BlockWrapper {...wrapperProps} props={props} clientId={clientId}/>
    }, [clientId, settings]);

    props.setCss = updateBlockCssRef;
    props.setPreload = updatePreloadRef;


    /*
    ----------------------------------------------------------------------
    OUTPUT
    ----------------------------------------------------------------------
    */
    return (
        <>
            <Component {...props} />
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
            {...props} // ← this is the important part
            BlockWrapper={(wrapperProps) => (
                <BlockWrapper
                    props={props}
                    clientId={clientId}
                    isSave={true}
                    {...wrapperProps}
                />
            )}
            styleData={styleData}
        />
    );
};