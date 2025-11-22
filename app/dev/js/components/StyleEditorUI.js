// StyleEditorUI.js
import {
    useState,
    useEffect,
    useMemo,
    useCallback,
} from "@wordpress/element";
import { InspectorControls } from "@wordpress/block-editor";

import { BreakpointPanels } from "./BreakpointPanels";
import { LayoutFields } from "./LayoutFields";
import { cleanObject } from "Includes/helper";
import isEqual from "lodash/isEqual";

export const StyleEditorUI = ({ settings = {}, updateStyleSettings }) => {
    // ----------------------------------------
    // LOCAL STATE (flat-entry layout)
    // layout = { base:{...}, xs:{...}, md:{...} }
    // ----------------------------------------
    const [layout, setLayout] = useState(() => {
        const { props = {}, breakpoints = {} } = settings;
        return {
            base: props,
            ...breakpoints,
        };
    });

    // ----------------------------------------
    // BUILT LAYOUT FOR ATTRIBUTES
    // Convert flat layout → wpbs-style structure
    // ----------------------------------------
    const externalLayout = useMemo(() => {
        const { base = {}, ...bps } = layout;
        return {
            props: base,
            breakpoints: bps,
        };
    }, [layout]);

    // ----------------------------------------
    // EFFECT: LOCAL STATE → ATTRIBUTES
    // ----------------------------------------
    useEffect(() => {
        const cleanedLocal = cleanObject(externalLayout, true);
        const cleanedExternal = cleanObject(settings, true);

        if (!isEqual(cleanedLocal, cleanedExternal)) {
            updateStyleSettings(cleanedLocal);
        }
    }, [externalLayout, settings, updateStyleSettings]);

    // ----------------------------------------
    // EFFECT: ATTRIBUTES → LOCAL STATE
    // (sync on external change only)
    // ----------------------------------------
    useEffect(() => {
        const cleanedLocal = cleanObject(externalLayout, true);
        const cleanedExternal = cleanObject(settings, true);

        if (isEqual(cleanedLocal, cleanedExternal)) return;

        const { props = {}, breakpoints = {} } = settings;
        setLayout({
            base: props,
            ...breakpoints,
        });
    }, [settings]); // do NOT include externalLayout

    // ----------------------------------------
    // UPDATE HANDLER FOR REPEATER
    // nextPanels = { base:{...}, xs:{...}, md:{...} }
    // ----------------------------------------
    const updateLayout = useCallback((nextPanels) => {
        setLayout(nextPanels);
    }, []);

    // ----------------------------------------
    // PANEL RENDERERS
    // ----------------------------------------
    const LayoutFieldsPanel = useCallback(
        ({ entry, update }) => (
            <LayoutFields
                label="Settings"
                settings={entry ?? {}}
                updateFn={(nextProps) => update(nextProps)}
            />
        ),
        []
    );

    const BreakpointFieldsPanel = LayoutFieldsPanel; // identical behavior

    // ----------------------------------------
    // BREAKPOINT PANELS UI
    // ----------------------------------------
    const BreakpointPanelsUI = useMemo(
        () => (
            <BreakpointPanels
                value={layout}
                onChange={updateLayout}
                label="Layout"
                render={{
                    base: LayoutFieldsPanel,
                    breakpoints: BreakpointFieldsPanel,
                }}
            />
        ),
        [layout, updateLayout, LayoutFieldsPanel, BreakpointFieldsPanel]
    );

    return (
        <InspectorControls group="styles">
            {BreakpointPanelsUI}
        </InspectorControls>
    );
};
