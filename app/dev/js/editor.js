/**
 * Shared style editor for all blocks (loaded once in the editor).
 */
import {createRoot, useState, useEffect, useRef} from '@wordpress/element';
import {PanelBody, Button} from '@wordpress/components';
import {subscribe, select} from '@wordpress/data';
import WPBS_Style from 'Components/Style';


new WPBS_Style().init();


/**
 * The actual style editor UI.
 * You can replace this with your full @wordpress/components controls later.
 */
function StyleEditorUI({clientId, attributes, setAttributes, onClose}) {
    const [local, setLocal] = useState(attributes['wpbs-style'] || {});

    // keep local state in sync if the block’s attributes change externally
    useEffect(() => {
        setLocal(attributes['wpbs-style'] || {});
    }, [attributes['wpbs-style'], clientId]);

    const handleChange = (newSettings) => {
        setLocal(newSettings);
        setAttributes({'wpbs-style': newSettings});
    };

    return (
        <PanelBody title="Style Editor" initialOpen>
            <div style={{padding: '8px 12px'}}>
                <label>Background Color</label>
                <input
                    type="color"
                    value={local.backgroundColor || '#ffffff'}
                    onChange={(e) =>
                        handleChange({...local, backgroundColor: e.target.value})
                    }
                />
            </div>

            <div style={{padding: '8px 12px'}}>
                <label>Padding</label>
                <input
                    type="text"
                    value={local.padding || ''}
                    onChange={(e) => handleChange({...local, padding: e.target.value})}
                />
            </div>

            <Button variant="secondary" onClick={onClose}>
                Done
            </Button>
        </PanelBody>
    );
}

// -----------------------------------------------------------------------------
// Global helper: opens the editor inline in the block’s Inspector placeholder.
// -----------------------------------------------------------------------------
window.WPBS = window.WPBS || {};
const activeRoots = new Map();


window.WPBS.openStyleEditorInline = ({
                                         mountNode,
                                         clientId,
                                         attributes,
                                         setAttributes,
                                     }) => {

    console.log(clientId, attributes, setAttributes, mountNode);

    if (!mountNode || !mountNode.classList.contains('wpbs-style-placeholder')) return;

    // Close any existing editor
    if (window.WPBS.activeRoot) {
        window.WPBS.activeRoot.unmount();
        window.WPBS.activeRoot = null;
    }

    const root = wp.element.createRoot(mountNode);

    const close = () => {
        if (window.WPBS.activeRoot) {
            root.unmount();
            window.WPBS.activeRoot = null;
        }
        // Restore placeholder
        mountNode.innerHTML = '';
        unsubscribeSelection();
        document.removeEventListener('keydown', escListener);
    };

    // Mount your editor
    root.render(
        wp.element.createElement(StyleEditorUI, {
            clientId,
            attributes,
            setAttributes,
            onClose: close,
        })
    );

    window.WPBS.activeRoot = root;

    // --- Auto-close when block deselected or deleted ---
    const unsubscribeSelection = wp.data.subscribe(() => {
        const selectedId = wp.data.select('core/block-editor').getSelectedBlockClientId();
        const block = wp.data.select('core/block-editor').getBlock(clientId);
        if (selectedId !== clientId || !block) close();
    });

    // --- Close on Escape key ---
    const escListener = (e) => e.key === 'Escape' && close();
    document.addEventListener('keydown', escListener);
};