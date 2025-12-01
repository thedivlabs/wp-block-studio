import {Fragment, useCallback, useEffect, useRef} from "@wordpress/element";
import {StyleEditorUI} from "Includes/style";
import {BlockWrapper} from "Components/BlockWrapper";
import {useInstanceId} from "@wordpress/compose";
import {InspectorControls} from "@wordpress/block-editor";
import {BackgroundControls} from "Components/Background";
import {AdvancedControls} from "Components/AdvancedControls";
import {isEqual, merge} from 'lodash';
import {normalizeBreakpoints} from "Includes/helper";

export const STYLE_ATTRIBUTES = {
    uniqueId: {type: "string"},
    "wpbs-css": {type: "object", default: {}},

    "wpbs-style": {type: "object", default: {props: {}, breakpoints: {}, hover: {}}},
    "wpbs-background": {type: "object", default: {props: {}, breakpoints: {}}},
    "wpbs-advanced": {type: "object", default: {}},

    "wpbs-preload": {type: "array", default: []},
    "wpbs-icons": {type: "array", default: []},
};

function sortBreakpointsDescending(raw, breakpointsDef) {
    if (!raw || typeof raw !== "object") return raw;

    const bpObj = raw.breakpoints || {};
    const ordered = {};

    // turn into sortable array
    const entries = Object.entries(bpObj);

    entries.sort((a, b) => {
        const sizeA = breakpointsDef[a[0]]?.size ?? 0;
        const sizeB = breakpointsDef[b[0]]?.size ?? 0;

        // sort DESCENDING: bigger max-width first
        return sizeB - sizeA;
    });

    for (const [bp, val] of entries) {
        ordered[bp] = val;
    }

    return {
        ...raw,
        breakpoints: ordered,
    };
}


export const withStyle = (Component, config) => (props) => {
    const API = window?.WPBS_StyleEditor ?? {};
    const {onStyleChange, cleanObject, registerBlock, unregisterBlock} = API;

    const {clientId, attributes, setAttributes, name} = props;
    const instanceId = useInstanceId(withStyle, name.replace("/", "-"));

    const blockCssRef = useRef({});
    const blockPreloadRef = useRef([]);
    const styleRef = useRef(null);

    const {hasBackground = true, hasAdvanced = true, hasChildren, tagName} = config || {};

    const blockGap = attributes?.style?.spacing?.blockGap;
    const blockGapDeps = typeof blockGap === 'object' ? JSON.stringify(blockGap) : blockGap;

    const {
        uniqueId,
        "wpbs-style": styleData = {props: {}, breakpoints: {}, hover: {}},
        "wpbs-background": bgData = {props: {}, breakpoints: {}},
        "wpbs-advanced": advData = {},
    } = attributes;

    /* ----------------------------------------------
       BLOCK REGISTRATION / UNIQUE ID SYNC
    ---------------------------------------------- */
    useEffect(() => {
        const status = registerBlock(uniqueId, clientId);

        if (status === "fresh" || status === "clone") {
            // assign the correct new ID
            setAttributes({uniqueId: instanceId});

            // register new ownership
            registerBlock(instanceId, clientId);

            // unregister old ID if it existed
            if (uniqueId && uniqueId !== instanceId) {
                unregisterBlock(uniqueId, clientId);
            }
        }

        return () => {
            unregisterBlock(uniqueId, clientId);
        };
    }, [clientId, uniqueId]);


    const updateStyleSettings = useCallback(
        (patch) => {

            let next = {
                ...styleData,
                ...patch,
            };

            if (patch.breakpoints !== undefined) {
                next.breakpoints = patch.breakpoints;
            }

            next = normalizeBreakpoints(next);

            const result = {
                "wpbs-style": next,
            }

            if (uniqueId !== instanceId) result["uniqueId"] = instanceId;

            setAttributes(result);
        },
        [setAttributes]
    );


    const updateBgSettings = useCallback(
        (patch) => {

            let next = {
                ...bgData,
                ...patch,
            };

            // Explicitly replace breakpoints, do NOT deep merge them
            if (patch.breakpoints !== undefined) {
                next.breakpoints = patch.breakpoints;
            }

            next = normalizeBreakpoints(next);

            const result = {
                "wpbs-background": next,
            }

            if (uniqueId !== instanceId) result["uniqueId"] = instanceId;

            setAttributes(result);

        },
        [setAttributes]
    );


    const updateAdvancedSettings = useCallback(
        (patch = {}) => {
            const next = {
                ...advData,
                ...patch,
            };
            setAttributes({"wpbs-advanced": next});
        },
        [setAttributes]
    );


    const applyCss = useCallback(
        (raw) => {
            if (!raw || typeof raw !== "object") return;

            // <-- NEW
            const sorted = sortBreakpointsDescending(
                raw,
                WPBS?.settings?.breakpoints || {}
            );

            const cleaned = cleanObject(sorted, true);
            const cleanedCurrent = cleanObject(blockCssRef.current, true);

            if (!cleaned || isEqual(cleaned, cleanedCurrent)) return;

            blockCssRef.current = cleaned;

            if (typeof onStyleChange === "function" && styleRef.current) {
                onStyleChange({
                    css: blockCssRef.current,
                    preload: blockPreloadRef.current,
                    group: uniqueId,
                    props,
                    styleRef,
                });
            }
        },
        [cleanObject, onStyleChange, uniqueId]
    );


    useEffect(() => {
        if (typeof onStyleChange !== "function") return;
        if (!styleRef.current) return;

        onStyleChange({
            css: blockCssRef.current,
            preload: blockPreloadRef.current,
            group: uniqueId,
            props,
            styleRef,
        });
    }, [styleData, blockGapDeps, uniqueId, bgData]);


    const applyPreload = useCallback(
        (items) => {
            const arr = Array.isArray(items) ? items : [];

            if (isEqual(blockPreloadRef.current, arr)) return;

            blockPreloadRef.current = arr;

            if (typeof onStyleChange === "function" && styleRef.current) {
                onStyleChange({
                    css: blockCssRef.current,
                    preload: blockPreloadRef.current,
                    group: uniqueId,
                    props,
                    styleRef,
                });
            }
        },
        [onStyleChange, uniqueId]
    );

    const wrappedBlockWrapperCallback = useCallback(
        ({children, props: blockProps, ...wrapperProps}) => {
            return (
                <BlockWrapper
                    props={blockProps}
                    wrapperProps={wrapperProps}
                    config={config}
                >
                    {children}
                </BlockWrapper>
            );
        },
        []
    );


    /* ----------------------------------------------
       RENDER
    ---------------------------------------------- */
    return (
        <>
            <Component
                {...props}
                BlockWrapper={wrappedBlockWrapperCallback}
                setCss={applyCss}
                setPreload={applyPreload}
            />

            {attributes?.["wpbs-css"] && <style ref={styleRef}/>}

            {hasAdvanced && (
                <InspectorControls group="advanced">
                    <AdvancedControls
                        settings={advData}
                        callback={updateAdvancedSettings}
                    />
                </InspectorControls>
            )}

            <InspectorControls group="styles">
                <StyleEditorUI
                    settings={styleData}
                    updateStyleSettings={updateStyleSettings}
                />
                {hasBackground && (
                    <BackgroundControls
                        settings={bgData}
                        callback={updateBgSettings}
                    />
                )}
            </InspectorControls>
        </>
    );
};

export const withStyleSave = (Component, config) => (props) => {
    const {attributes} = props;
    const {"wpbs-style": styleData = {}} = attributes;

    return (
        <Component
            {...props}
            BlockWrapper={({children, props: blockProps, ...wrapperProps}) => (
                <BlockWrapper
                    props={props}
                    wrapperProps={wrapperProps}
                    config={config}
                    isSave={true}
                >
                    {children}
                </BlockWrapper>
            )}
            styleData={styleData}
        />
    );
};
