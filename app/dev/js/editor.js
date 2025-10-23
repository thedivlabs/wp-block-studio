/**
 * Shared style editor for all blocks (loaded once in the editor).
 */
import { createRoot, useState, useEffect } from '@wordpress/element';
import { PanelBody, Button } from '@wordpress/components';
import { subscribe, select } from '@wordpress/data';

/**
 * The actual style editor UI.
 * You can replace this with your full @wordpress/components controls later.
 */
function StyleEditorUI({ clientId, attributes, setAttributes, onClose }) {
    const [local, setLocal] = useState(attributes['wpbs-style'] || {});

    // keep local state in sync if the block’s attributes change externally
    useEffect(() => {
        setLocal(attributes['wpbs-style'] || {});
    }, [attributes, clientId]);

    const handleChange = (newSettings) => {
        setLocal(newSettings);
        setAttributes({ 'wpbs-style': newSettings });
    };

    return (
        <PanelBody title="Style Editor" initialOpen>
            <div style={{ padding: '8px 12px' }}>
                <label>Background Color</label>
                <input
                    type="color"
                    value={local.backgroundColor || '#ffffff'}
                    onChange={(e) =>
                        handleChange({ ...local, backgroundColor: e.target.value })
                    }
                />
            </div>

            <div style={{ padding: '8px 12px' }}>
                <label>Padding</label>
                <input
                    type="text"
                    value={local.padding || ''}
                    onChange={(e) => handleChange({ ...local, padding: e.target.value })}
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
window.WPBSFramework = window.WPBSFramework || {};
const activeRoots = new Map();

window.WPBSFramework.openStyleEditorInline = ({
                                                  mountSelector,
                                                  clientId,
                                                  attributes,
                                                  setAttributes,
                                              }) => {
    const mountNode = document.querySelector(mountSelector);
    if (!mountNode) return;

    // Close any existing editor
    if (activeRoots.has(mountNode)) {
        activeRoots.get(mountNode).unmount();
        activeRoots.delete(mountNode);
    }

    const root = createRoot(mountNode);

    const close = () => {
        // Unmount React root
        if (activeRoots.has(mountNode)) {
            root.unmount();
            activeRoots.delete(mountNode);
        }
        // Restore the launcher button
        mountNode.innerHTML = `
			<button type="button"
				class="components-button is-secondary wpbs-style-launcher">
				Edit Styles
			</button>
		`;
        unsubscribeSelection();
        document.removeEventListener('keydown', escListener);
    };

    // Mount the editor UI
    root.render(
        <StyleEditorUI
            clientId={clientId}
            attributes={attributes}
            setAttributes={setAttributes}
            onClose={close}
        />
    );

    activeRoots.set(mountNode, root);

    // --- Auto-close when block deselected or deleted ---
    const unsubscribeSelection = subscribe(() => {
        const selectedId = select('core/block-editor').getSelectedBlockClientId();
        const block = select('core/block-editor').getBlock(clientId);
        if (selectedId !== clientId || !block) {
            close();
        }
    });

    // --- Allow manual close with Escape key ---
    const escListener = (e) => {
        if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', escListener);
};