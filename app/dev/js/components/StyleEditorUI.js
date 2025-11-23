// StyleEditorUI.js
import {
    useState,
    useEffect,
    useCallback,
} from "@wordpress/element";
import { InspectorControls } from "@wordpress/block-editor";

import { BreakpointPanels } from "./BreakpointPanels";
import { LayoutFields } from "./LayoutFields";
import { cleanObject } from "Includes/helper";
import { isEqual } from "lodash";

export const StyleEditorUI = ({ settings = {}, updateStyleSettings }) => {
    /**
     * LOCAL STATE
     * `layout` is the working copy for the UI:
     * {
     *   props: { ... },
     *   breakpoints: { xs: {...}, md: {...} }
     * }
     */
    const [layout, setLayout] = useState(() => settings || {});

    /**
     * EXTERNAL → LOCAL SYNC
     *
     * When the block attributes (`settings`) change from outside
     * (e.g. reset, undo, paste, block transform), we hydrate local
     * state *only if* the cleaned versions differ.
     *
     * This avoids a feedback loop:
     *  - User edits → we push new layout upstream
     *  - Gutenberg re-renders with new `settings`
     *  - If `settings` === `layout`, we do nothing
     */
    useEffect(() => {
        const cleanedIncoming = cleanObject(settings || {}, true);
        const cleanedLocal = cleanObject(layout || {}, true);

        if (!isEqual(cleanedIncoming, cleanedLocal)) {
            setLayout(settings || {});
        }
        // We intentionally do NOT depend on `layout` here.
        // We only react to external `settings` changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settings]);

    /**
     * LOCAL → EXTERNAL SYNC
     *
     * Called by BreakpointPanels when the user changes something.
     * We update local state immediately for a responsive UI and
     * push the same layout up to block attributes.
     */
    const handleLayoutChange = useCallback(
        (nextLayout) => {
            setLayout(nextLayout);
            updateStyleSettings(nextLayout);
        },
        [updateStyleSettings]
    );

    return (
        <InspectorControls group="styles">
            <BreakpointPanels
                value={layout}
                onChange={handleLayoutChange}
                label="Layout"
                render={{
                    base: ({ entry, update }) => (
                        <LayoutFields
                            label="Settings"
                            settings={entry ?? {}}
                            updateFn={update}
                        />
                    ),
                    breakpoints: ({ entry, update }) => (
                        <LayoutFields
                            label="Settings"
                            settings={entry ?? {}}
                            updateFn={update}
                        />
                    ),
                }}
            />
        </InspectorControls>
    );
};
