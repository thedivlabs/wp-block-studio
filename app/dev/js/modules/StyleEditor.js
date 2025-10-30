// StyleEditor.js (external shared script)
import {StyleEditorUI} from "Components/StyleEditorUI";
import {updateStyleString, saveStyle} from "Includes/style";
import {debounce} from "lodash";

function watchDuplicateIds() {
    const {select, dispatch, subscribe} = window.wp.data;
    const store = "core/block-editor";
    let lastSig = "";

    const checkBlocks = debounce(() => {
        const flatten = (blocks, acc = []) => {
            for (const b of blocks) {
                if (b.name?.startsWith("wpbs/")) acc.push(b);
                if (b.innerBlocks?.length) flatten(b.innerBlocks, acc);
            }
            return acc;
        };

        const blocks = flatten(select(store).getBlocks());
        if (!blocks.length) return;

        const sig = blocks
            .map(b => `${b.clientId}:${b.attributes?.uniqueId ?? ""}`)
            .join("|");
        if (sig === lastSig) return;
        lastSig = sig;

        const seen = new Map();
        for (const b of blocks) {
            const {clientId, name, attributes} = b;
            const {uniqueId} = attributes || {};
            if (!uniqueId) continue;
            if (seen.has(uniqueId)) {
                const base = name.split("/").pop();
                const newId = `${base}-${Math.random().toString(36).slice(2, 6)}`;
                dispatch(store).updateBlockAttributes(clientId, {uniqueId: newId});
            } else {
                seen.set(uniqueId, true);
            }
        }
    }, 300);

    subscribe(checkBlocks);
}

export function initStyleEditor() {
    if (window.WPBS_StyleEditor) return window.WPBS_StyleEditor;

    const api = {
        updateStyleString,
        saveStyle,
        StyleEditorUI,
    };

    window.WPBS_StyleEditor = api;

    // Kick off duplicate ID watcher once
    watchDuplicateIds();

    return api;
}

// Initialize immediately when script loads
initStyleEditor();
