import {Fragment, useCallback, useEffect, useRef} from "@wordpress/element";
import {StyleEditorUI} from "Includes/style";
import {BlockWrapper} from "Components/BlockWrapper";
import {useInstanceId} from "@wordpress/compose";
import {InspectorControls} from "@wordpress/block-editor";
import {BackgroundControls} from "Components/Background";

export const STYLE_ATTRIBUTES = {
    uniqueId: {type: "string"},
    "wpbs-css": {type: "object", default: {}},

    // Clean separation of concerns:
    "wpbs-style": {type: "object", default: {props: {}, breakpoints: {}, hover: {}}},
    "wpbs-background": {type: "object", default: {props: {}, breakpoints: {}}},

    "wpbs-preload": {type: "array", default: []},
    "wpbs-icons": {type: "array", default: []},
};

export const withStyle = (Component) => (props) => {
    const API = window?.WPBS_StyleEditor ?? {};
    const {onStyleChange, cleanObject, registerBlock, unregisterBlock} = API;

    const {clientId, attributes, setAttributes, name} = props;
    const instanceId = useInstanceId(withStyle, name.replace("/", "-"));

    const blockCssRef = useRef({});
    const blockPreloadRef = useRef([]);
    const styleRef = useRef(null);

    const {
        uniqueId,
        "wpbs-style": styleData = {props: {}, breakpoints: {}, hover: {}},
        "wpbs-background": bgData = {props: {}, breakpoints: {}},
    } = attributes;

    useEffect(() => {
        console.log(attributes);
    }, []);

    useEffect(() => {
        const status = registerBlock(uniqueId, clientId);

        if (status === "fresh" || status === "clone") {
            setAttributes({ uniqueId: instanceId });

            registerBlock(instanceId, clientId);

            if (uniqueId && uniqueId !== instanceId) {
                unregisterBlock(uniqueId, clientId);
            }
        }

        return () => {
            unregisterBlock(attributes.uniqueId, clientId);
        };
    }, []);


    /* ------------------------------------------------------------------
       UPDATE: STYLE (wpbs-style)
    ------------------------------------------------------------------ */
    const updateStyleSettings = useCallback(
        (next) => {
            setAttributes({
                "wpbs-style": cleanObject(next),
                //uniqueId: instanceId
            });
        },
        [setAttributes]
    );

    /* ------------------------------------------------------------------
       UPDATE: BACKGROUND (wpbs-background)
    ------------------------------------------------------------------ */
    const updateBgSettings = useCallback(
        (next) => {
            setAttributes({
                "wpbs-background": next,
            });
        },
        [setAttributes]
    );

    /* ------------------------------------------------------------------
       UPDATE: RAW CSS REF
    ------------------------------------------------------------------ */
    const updateBlockCssRef = useCallback(
        (newCss = {}) => {
            blockCssRef.current = newCss || {};

            if (typeof onStyleChange === "function" && styleRef.current) {
                onStyleChange({
                    css: blockCssRef.current,
                    preload: blockPreloadRef.current,
                    props,
                    styleRef,
                });
            }
        },
        [onStyleChange, props]
    );

    /* ------------------------------------------------------------------
       UPDATE: RAW PRELOAD REF
    ------------------------------------------------------------------ */
    const updatePreloadRef = useCallback((items = []) => {
        blockPreloadRef.current = Array.isArray(items) ? items : [];
    }, []);

    /* ------------------------------------------------------------------
       TRIGGER CSS PARSER
    ------------------------------------------------------------------ */
    useEffect(() => {
        if (typeof onStyleChange !== "function") return;
        if (!styleRef.current) return;

        onStyleChange({
            css: blockCssRef.current,
            preload: blockPreloadRef.current,
            props,
            styleRef,
        });
    }, [styleData, bgData, uniqueId]);

    /* ------------------------------------------------------------------
       BLOCK WRAPPER CALLBACK
    ------------------------------------------------------------------ */
    const wrappedBlockWrapperCallback = useCallback(({children, props, ...wrapperProps}) => {
        return (
            <BlockWrapper props={props} wrapperProps={wrapperProps}>
                {children}
            </BlockWrapper>
        );
    }, []);

    /* ------------------------------------------------------------------
       RENDER
    ------------------------------------------------------------------ */
    return (
        <>
            <Component
                {...props}
                BlockWrapper={wrappedBlockWrapperCallback}
                setCss={updateBlockCssRef}
                setPreload={updatePreloadRef}
            />

            {attributes?.["wpbs-css"] && <style ref={styleRef}/>}

            <InspectorControls group="styles">
                <StyleEditorUI
                    settings={styleData}
                    updateStyleSettings={updateStyleSettings}
                />
                <BackgroundControls
                    settings={bgData}
                    callback={updateBgSettings}
                />
            </InspectorControls>
        </>
    );
};

export const withStyleSave = (Component) => (props) => {
    const {attributes} = props;
    const {"wpbs-style": styleData = {}} = attributes;

    return (
        <Component
            {...props}
            BlockWrapper={({children, props: blockProps, ...wrapperProps}) => (
                <BlockWrapper props={blockProps} wrapperProps={wrapperProps} isSave={true}>
                    {children}
                </BlockWrapper>
            )}
            styleData={styleData}
        />
    );
};