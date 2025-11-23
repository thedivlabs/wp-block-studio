import {Fragment, useCallback, useEffect, useRef} from '@wordpress/element';
import {StyleEditorUI} from "Includes/style";
import {BlockWrapper} from 'Components/BlockWrapper';
import {useInstanceId} from "@wordpress/compose";
import {InspectorControls} from "@wordpress/block-editor";
import {PanelBody} from "@wordpress/components";


export const STYLE_ATTRIBUTES = {
    'uniqueId': {type: 'string'},
    'wpbs-css': {type: 'object', default: {}},
    'wpbs-background': {type: 'object', default: {}},
    'wpbs-preload': {type: 'array', default: [{test: 'test'}]},
    'wpbs-icons': {
        type: 'array',
        default: []
    },
    'wpbs-style': {type: 'object', default: {}},
};


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
            setAttributes({
                'wpbs-style': cleanObject(nextLayout),
                //uniqueId: instanceId
            });
        },
        [settings, setAttributes]
    );

    /*
    ----------------------------------------------------------------------
    BLOCK → RAW CSS REF
    ----------------------------------------------------------------------
    */
    const updateBlockCssRef = useCallback((newCss = {}) => {
        blockCssRef.current = newCss || {};

        // Immediate update for responsiveness
        if (typeof onStyleChange === "function" && styleRef.current) {
            onStyleChange({
                css: blockCssRef.current,
                preload: blockPreloadRef.current,
                props,
                styleRef
            });
        }

        // The effect will still fire when settings change
    }, [onStyleChange, props]);


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


    const wrappedBlockWrapperCallback = useCallback(({children, props, ...wrapperProps}) => {
        return <BlockWrapper props={props} wrapperProps={wrapperProps}>{children}</BlockWrapper>;
    }, []);

    return (
        <>
            <Component
                {...props}
                BlockWrapper={wrappedBlockWrapperCallback}
                setCss={updateBlockCssRef}
                setPreload={updatePreloadRef}
            />
            {attributes?.['wpbs-css'] && (
                <style ref={styleRef}/>
            )}


            <InspectorControls group={'styles'}>
                <StyleEditorUI
                    settings={settings}
                    updateStyleSettings={updateStyleSettings}
                />
                <PanelBody title={'Background'} initialOpen={false} >
                    <div>BACKGROUND</div>
                </PanelBody>
            </InspectorControls>
        </>
    );
};

export const withStyleSave = (Component) => (props) => {
    const {attributes} = props;
    const {'wpbs-style': styleData = {}} = attributes;

    return (
        <Component
            {...props}
            BlockWrapper={({children, props: blockProps, ...wrapperProps}) => {

                return <BlockWrapper

                    props={blockProps}
                    isSave={true}
                    wrapperProps={wrapperProps}
                >{children}</BlockWrapper>;
            }}
            styleData={styleData}
        />
    );
};