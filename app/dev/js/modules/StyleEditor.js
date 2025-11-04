import {
    CONTAINER_OPTIONS, REVEAL_ANIMATION_OPTIONS, REVEAL_EASING_OPTIONS,
    DISPLAY_OPTIONS, DIRECTION_OPTIONS, WRAP_OPTIONS, ALIGN_OPTIONS, JUSTIFY_OPTIONS,
    SHAPE_OPTIONS, WIDTH_OPTIONS, HEIGHT_OPTIONS, POSITION_OPTIONS, OVERFLOW_OPTIONS,
    CONTENT_VISIBILITY_OPTIONS, TEXT_ALIGN_OPTIONS, DIMENSION_UNITS
} from "Includes/config";
import {StyleEditorUI} from "Components/StyleEditorUI";
import {updateStyleString} from "Includes/style";

const layoutFieldsMap = [
    {type: 'heading', label: 'Flex Settings FPO'},
    {type: 'select', slug: 'align-items', label: 'Align', options: ALIGN_OPTIONS},
    {type: 'unit', slug: 'basis', label: 'Basis'},
    {type: 'box', slug: 'border-radius', label: 'Radius', full: true},
    {
        type: 'box',
        slug: 'box-position',
        label: 'Box Position',
        full: true,
        options: {
            sides: ['top', 'right', 'bottom', 'left'],
            inputProps: {units: DIMENSION_UNITS},
        },
    },
    {type: 'select', slug: 'container', label: 'Container', options: CONTAINER_OPTIONS},
    {type: 'select', slug: 'content-visibility', label: 'Visibility', options: CONTENT_VISIBILITY_OPTIONS},
    {type: 'select', slug: 'display', label: 'Display', options: DISPLAY_OPTIONS},
    {type: 'select', slug: 'flex-direction', label: 'Direction', options: DIRECTION_OPTIONS},
    {type: 'number', slug: 'flex-grow', label: 'Grow'},
    {type: 'box', slug: 'gap', label: 'Gap', options: {sides: ['top', 'left']}},
    {type: 'select', slug: 'height', label: 'Height', options: HEIGHT_OPTIONS},
    {type: 'unit', slug: 'height-custom', label: 'Height Custom'},
    {type: 'select', slug: 'justify-content', label: 'Justify', options: JUSTIFY_OPTIONS},
    {type: 'unit', slug: 'line-height', label: 'Line Height'},
    {
        type: 'box',
        slug: 'margin',
        label: 'Margin',
        full: true,
        options: {
            sides: ['top', 'right', 'bottom', 'left'],
            inputProps: {units: DIMENSION_UNITS},
        },
    },
    {type: 'unit', slug: 'max-height', label: 'Max Height'},
    {type: 'unit', slug: 'max-height-custom', label: 'Max-Height Custom'},
    {type: 'unit', slug: 'max-width', label: 'Max Width'},
    {type: 'unit', slug: 'min-height', label: 'Min Height'},
    {type: 'unit', slug: 'min-height-custom', label: 'Min-Height Custom'},
    {type: 'number', slug: 'opacity', label: 'Opacity'},
    {type: 'unit', slug: 'offset-header', label: 'Offset Header'},
    {type: 'unit', slug: 'order', label: 'Order'},
    {
        type: 'box',
        slug: 'padding',
        label: 'Padding',
        full: true,
        options: {
            sides: ['top', 'right', 'bottom', 'left'],
            inputProps: {units: DIMENSION_UNITS},
        },
    },
    {type: 'select', slug: 'position', label: 'Position', options: POSITION_OPTIONS},
    {type: 'select', slug: 'aspect-ratio', label: 'Shape', options: SHAPE_OPTIONS},
    {type: 'shadow', slug: 'shadow', label: 'Shadow'},
    {type: 'border', slug: 'outline', label: 'Outline'},
    {type: 'unit', slug: 'font-size', label: 'Font Size'},
    {type: 'unit', slug: 'flex-shrink', label: 'Shrink'},
    {type: 'select', slug: 'flex-wrap', label: 'Flex Wrap', options: WRAP_OPTIONS},
    {type: 'select', slug: 'text-align', label: 'Text Align', options: TEXT_ALIGN_OPTIONS},
    {
        type: 'box',
        slug: 'translate',
        label: 'Translate',
        options: {
            sides: ['top', 'left'],
            inputProps: {units: DIMENSION_UNITS},
        },
        full: true,
    },
    {type: 'select', slug: 'overflow', label: 'Overflow', options: OVERFLOW_OPTIONS},
    {type: 'number', slug: 'reveal-duration', label: 'Reveal Duration'},
    {type: 'select', slug: 'reveal-easing', label: 'Reveal Easing', options: REVEAL_EASING_OPTIONS},
    //{type: 'toggle', slug: 'reveal-mirror', label: 'Reveal Mirror'},
    {type: 'unit', slug: 'reveal-offset', label: 'Reveal Offset'},
    //{type: 'toggle', slug: 'reveal-repeat', label: 'Reveal Repeat'},
    {type: 'unit', slug: 'reveal-distance', label: 'Reveal Distance'},
    {type: 'select', slug: 'reveal-anim', label: 'Reveal Animation', options: REVEAL_ANIMATION_OPTIONS},
    {type: 'number', slug: 'z-index', label: 'Z Index'},
    {type: 'select', slug: 'width', label: 'Width', options: WIDTH_OPTIONS},
    {type: 'unit', slug: 'width-custom', label: 'Width Custom'},
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

export function hasDuplicateId(uniqueId, clientId) {
    if (!uniqueId) return false;

    const {select} = window.wp.data;
    const store = "core/block-editor";

    try {
        const blocks = select(store).getBlocks();

        const flatten = (arr, acc = []) => {
            for (const b of arr) {
                if (b.name?.startsWith("wpbs/")) acc.push(b);
                if (b.innerBlocks?.length) flatten(b.innerBlocks, acc);
            }
            return acc;
        };

        const wpbsBlocks = flatten(blocks);
        let count = 0;

        for (const block of wpbsBlocks) {
            if (block.attributes?.uniqueId === uniqueId && block.clientId !== clientId) {
                count++;
                if (count > 0) return true; // bail early
            }
        }

        return false;
    } catch (err) {
        console.warn("WPBS: hasDuplicateId failed", err);
        return false;
    }
}

/**
 * Initializes the Style Editor API, connecting to the WP data store.
 * No persistent subscription is kept — it's all on-demand.
 */
export function initStyleEditor() {
    if (window.WPBS_StyleEditor) return window.WPBS_StyleEditor;

    const api = {
        updateStyleString,
        hasDuplicateId,
        StyleEditorUI,
        layoutFieldsMap,
        hoverFieldsMap,
    };

    window.WPBS_StyleEditor = api;
    return api;
}