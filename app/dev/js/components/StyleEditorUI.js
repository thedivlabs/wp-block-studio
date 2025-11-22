import {useState, useMemo, useCallback} from "@wordpress/element";
import {InspectorControls} from "@wordpress/block-editor";
import {BreakpointPanels} from "./BreakpointPanels";
import {LayoutFields} from "./LayoutFields";

export const StyleEditorUI = ({settings = {}, updateStyleSettings}) => {
    // -------------------------
    // LOCAL STATE (source of truth)
    // -------------------------
    const [baseProps, setBaseProps] = useState(settings.props || {});
    const [bps, setBps]             = useState(settings.breakpoints || {});

    // If you want to re-sync when settings change externally,
    // you can add a guarded useEffect here, but for now we
    // treat local as the live source of truth (like the old code).

    // -------------------------
    // PUSH FULL LAYOUT UP
    // -------------------------
    const commitLayout = useCallback(
        (nextProps, nextBps) => {
            updateStyleSettings({
                props: nextProps,
                breakpoints: nextBps,
            });
        },
        [updateStyleSettings]
    );

    // -------------------------
    // UPDATE BASE PROPS (LayoutFields)
    // -------------------------
    const updateBaseProps = useCallback(
        (next) => {
            setBaseProps((prev) => {
                const nextProps =
                    next && Object.keys(next).length === 0
                        ? {}
                        : { ...prev, ...next };

                // use current bps from state (NOT settings)
                commitLayout(nextProps, bps);
                return nextProps;
            });
        },
        [bps, commitLayout]
    );

    // -------------------------
    // UPDATE BREAKPOINTS (BreakpointPanels)
    // -------------------------
    const updateBreakpoints = useCallback(
        (nextBps) => {
            setBps(() => {
                // use current baseProps from state (NOT settings)
                commitLayout(baseProps, nextBps);
                return nextBps;
            });
        },
        [baseProps, commitLayout]
    );

    // -------------------------
    // RENDER PANELS
    // -------------------------
    const LayoutFieldsPanel = useCallback(
        ({bpKey, entry, update}) => (
            <LayoutFields
                settings={baseProps}
                updateFn={updateBaseProps}
            />
        ),
        [baseProps, updateBaseProps]
    );

    const BreakpointFieldsPanel = useCallback(
        ({bpKey, entry, update}) => (
            <LayoutFields
                settings={entry.props ?? {}}
                updateFn={(nextProps) => update({props: nextProps})}
            />
        ),
        [] // stable; "update" is provided fresh by BreakpointPanels per row
    );

    const BreakpointPanelsUI = useMemo(
        () => (
            <BreakpointPanels
                value={bps}
                onChange={updateBreakpoints}
                label="Layout"
                render={{
                    base: LayoutFieldsPanel,
                    breakpoints: BreakpointFieldsPanel,
                }}
            />
        ),
        [bps, LayoutFieldsPanel, BreakpointFieldsPanel, updateBreakpoints]
    );

    return (
        <InspectorControls group="styles">
            {BreakpointPanelsUI}
        </InspectorControls>
    );
};
