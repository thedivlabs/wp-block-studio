// StyleEditor.js (external shared script)

import {
    CONTAINER_OPTIONS, REVEAL_ANIMATION_OPTIONS, REVEAL_EASING_OPTIONS,
    DISPLAY_OPTIONS, DIRECTION_OPTIONS, WRAP_OPTIONS, ALIGN_OPTIONS, JUSTIFY_OPTIONS,
    SHAPE_OPTIONS, WIDTH_OPTIONS, HEIGHT_OPTIONS, POSITION_OPTIONS, OVERFLOW_OPTIONS,
    CONTENT_VISIBILITY_OPTIONS, TEXT_ALIGN_OPTIONS, DIMENSION_UNITS
} from "Includes/config";
import {StyleEditorUI} from "Components/StyleEditorUI";
import {updateStyleString, Field} from "Includes/style";
import _, {debounce} from "lodash";

const layoutFieldsMap = [

    {type: 'select', slug: 'container', label: 'Container', options: CONTAINER_OPTIONS},


    // Reveal / animation
    {
        type: 'composite',
        slug: 'reveal-group',
        label: 'Reveal',
        fields: [
            {type: 'select', slug: 'reveal-anim', label: 'Animation', large: true, options: REVEAL_ANIMATION_OPTIONS},
            {type: 'select', slug: 'reveal-easing', label: 'Easing', options: REVEAL_EASING_OPTIONS},
            {type: 'number', slug: 'reveal-duration', label: 'Duration'},
            {type: 'unit', slug: 'reveal-offset', label: 'Offset'},
            {type: 'unit', slug: 'reveal-distance', label: 'Distance'},
            {type: 'toggle', slug: 'reveal-repeat', label: 'Repeat'},
            {type: 'toggle', slug: 'reveal-mirror', label: 'Mirror'},
        ],
        large: true
    },


    // Header alignment
    {type: 'unit', slug: 'offset-header', label: 'Offset Header'},
    {type: 'toggle', slug: 'align-header', label: 'Align Header'},

    // Display / flex
    {type: 'select', slug: 'display', label: 'Display', options: DISPLAY_OPTIONS},
    {type: 'select', slug: 'flex-direction', label: 'Flex Direction', options: DIRECTION_OPTIONS},
    {type: 'select', slug: 'flex-wrap', label: 'Flex Wrap', options: WRAP_OPTIONS},
    {type: 'select', slug: 'align-items', label: 'Align Items', options: ALIGN_OPTIONS},
    {type: 'select', slug: 'justify-content', label: 'Justify Content', options: JUSTIFY_OPTIONS},

    // Sizing
    {type: 'select', slug: 'aspect-ratio', label: 'Aspect Ratio', options: SHAPE_OPTIONS},
    {type: 'number', slug: 'opacity', label: 'Opacity'},
    {type: 'unit', slug: 'basis', label: 'Flex Basis'},
    {type: 'select', slug: 'width', label: 'Width', options: WIDTH_OPTIONS},
    {type: 'unit', slug: 'width-custom', label: 'Custom Width'},
    {type: 'unit', slug: 'max-width', label: 'Max Width'},
    {type: 'select', slug: 'height', label: 'Height', options: HEIGHT_OPTIONS},
    {type: 'unit', slug: 'height-custom', label: 'Custom Height'},
    {type: 'unit', slug: 'min-height', label: 'Min Height'},
    {type: 'unit', slug: 'min-height-custom', label: 'Custom Min Height'},
    {type: 'unit', slug: 'max-height', label: 'Max Height'},
    {type: 'unit', slug: 'max-height-custom', label: 'Custom Max Height'},
    {type: 'unit', slug: 'offset-height', label: 'Offset Height'},

    {type: 'unit', slug: 'flex-grow', label: 'Flex Grow'},
    {type: 'unit', slug: 'flex-shrink', label: 'Flex Shrink'},

    // Positioning
    {type: 'select', slug: 'position', label: 'Position', options: POSITION_OPTIONS},
    {type: 'number', slug: 'z-index', label: 'Z Index'},
    {
        type: 'composite',
        slug: 'box-position',
        label: 'Box Position',
        fields: [
            {type: 'unit', slug: 'top', label: 'Top'},
            {type: 'unit', slug: 'right', label: 'Right'},
            {type: 'unit', slug: 'bottom', label: 'Bottom'},
            {type: 'unit', slug: 'left', label: 'Left'},
        ],
        large: true
    },

    // Overflow
    {type: 'select', slug: 'overflow', label: 'Overflow', options: OVERFLOW_OPTIONS},
    {type: 'unit', slug: 'aspect-ratio', label: 'Aspect Ratio'},
    {type: 'unit', slug: 'order', label: 'Order'},
    {
        type: 'box',
        slug: 'translate',
        label: 'Translate',
        options: {sides: ['top', 'left'], inputProps: {units: DIMENSION_UNITS}}
    },

    // Misc toggles
    {type: 'toggle', slug: 'outline', label: 'Outline'},
    {type: 'toggle', slug: 'mark-empty', label: 'Mark Empty'},

    // Colors / visibility
    {type: 'color', slug: 'text-decoration-color', label: 'Text Decoration Color'},
    {type: 'select', slug: 'content-visibility', label: 'Content Visibility', options: CONTENT_VISIBILITY_OPTIONS},

    {
        type: 'box', slug: 'padding', label: 'Padding', large: true,
        options: {sides: ['top', 'right', 'bottom', 'left'], inputProps: {units: DIMENSION_UNITS}}
    },
    {
        type: 'box', slug: 'margin', label: 'Margin', large: true,
        options: {sides: ['top', 'right', 'bottom', 'left'], inputProps: {units: DIMENSION_UNITS}}
    },

    {type: 'unit', slug: 'gap', label: 'Gap'},
    {type: 'unit', slug: 'border-radius', label: 'Border Radius'},
    {type: 'unit', slug: 'font-size', label: 'Font Size'},
    {type: 'unit', slug: 'line-height', label: 'Line Height'},
    {type: 'select', slug: 'text-align', label: 'Text Align', options: TEXT_ALIGN_OPTIONS},

    {type: 'color', slug: 'text-color', label: 'Text Color'},
    {type: 'color', slug: 'background-color', label: 'Background Color'},
    {type: 'text', slug: 'box-shadow', label: 'Shadow'},
];

const hoverFieldsMap = [
    {
        type: 'text',
        slug: 'background-color',
        label: 'Background Color'
    },
    {
        type: 'text',
        slug: 'text-color',
        label: 'Text Color'
    },
];

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
        StyleEditorUI,
        layoutFieldsMap,   // NEW
        hoverFieldsMap,    // NEW
    };

    window.WPBS_StyleEditor = api;
    watchDuplicateIds();
    return api;
}
