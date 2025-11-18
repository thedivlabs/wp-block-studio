import {memo, useCallback, useEffect, useRef} from '@wordpress/element';
import {StyleEditorUI} from "Includes/style";
import _ from 'lodash';
import {BlockWrapper} from 'Components/BlockWrapper';
import {useInstanceId} from "@wordpress/compose";

export const STYLE_ATTRIBUTES = {
    uniqueId: {type: 'string'},
    'wpbs-css': {type: 'object', default: {}},
    'wpbs-preload': {type: 'array', default: []},
    'wpbs-icons': {type: 'array', default: []},
    'wpbs-style': {type: 'object', default: {}},
};

const StyleEditorPanel = memo(
    ({settings, updateStyleSettings}) => (
        <StyleEditorUI settings={settings} updateStyleSettings={updateStyleSettings}/>
    ),
    (prev, next) => _.isEqual(prev.settings, next.settings)
);

export const withStyle = (Component) => (props) => {
    const API = window?.WPBS_StyleEditor ?? {};
    const {onStyleChange, cleanObject, registerBlock, unregisterBlock} = API;
    const {clientId, attributes, setAttributes, name} = props;

    // capture original props identity
    const realProps = props;

    const instanceId = useInstanceId(withStyle, name.replace('/', '-'));

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

    /* --------------------------------------------
       Block Registration (first mount only)
    -------------------------------------------- */
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
        return () => unregisterBlock(attributes.uniqueId, clientId);
    }, []);


    /* --------------------------------------------
       STYLE SETTER (only wpbs-style)
    -------------------------------------------- */
    const updateStyleSettings = useCallback(
        (nextLayout = {}) => {
            const cleanedNext = cleanObject(nextLayout, true);
            const cleanedCurrent = cleanObject(settings, true);

            if (!_.isEqual(cleanedNext, cleanedCurrent)) {
                setAttributes({'wpbs-style': cleanedNext});
            }
        },
        [settings]
    );

    /* --------------------------------------------
       CSS + Preload setters
    -------------------------------------------- */
    const updateBlockCssRef = useCallback((newCss = {}) => {
        blockCssRef.current = newCss || {};
    }, []);

    const updatePreloadRef = useCallback((newItems = []) => {
        blockPreloadRef.current = Array.isArray(newItems) ? newItems : [];
    }, []);


    /* --------------------------------------------
       Notify parser when style changes
    -------------------------------------------- */
    useEffect(() => {
        if (typeof onStyleChange !== "function") return;
        if (!styleRef.current) return;

        onStyleChange({
            css: blockCssRef.current,
            preload: blockPreloadRef.current,
            props: realProps,  // stable
            styleRef,
        });

    }, [settings, uniqueId]);  // minimal deps


    /* --------------------------------------------
       Stable BlockWrapper (never captures changing props)
    -------------------------------------------- */
    props.BlockWrapper = useCallback(
        (wrapperProps) => {
            return (
                <BlockWrapper
                    props={realProps}      // stable canonical props
                    {...wrapperProps}
                />
            );
        },
        [clientId]     // does NOT depend on settings
    );


    props.setCss = updateBlockCssRef;
    props.setPreload = updatePreloadRef;


    /* --------------------------------------------
       OUTPUT
    -------------------------------------------- */
    return (
        <>
            <Component {...props} />

            {attributes?.['wpbs-css'] && <style ref={styleRef}/>}

            <StyleEditorPanel
                settings={settings}
                updateStyleSettings={updateStyleSettings}
            />
        </>
    );
};


/* --------------------------------------------
   SAVE VERSION
-------------------------------------------- */
export const withStyleSave = (Component) => (props) => {
    const {attributes, clientId} = props;
    const {'wpbs-style': styleData = {}} = attributes;

    return (
        <Component
            {...props}
            BlockWrapper={(wrapperProps) => (
                <BlockWrapper
                    props={props}
                    isSave={true}
                    {...wrapperProps}
                />
            )}
            styleData={styleData}
        />
    );
};
