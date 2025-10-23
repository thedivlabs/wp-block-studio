/**
 * editor.js – runs once in the editor.
 */
import { createElement, useState, useEffect } from '@wordpress/element';
import { PanelBody, Button } from '@wordpress/components';
import { subscribe, select } from '@wordpress/data';

// --- your StyleEditorUI component here (the actual panel/modal) ---
function StyleEditorUI({ clientId, attributes, setAttributes, onClose }) {
    const [local, setLocal] = useState(attributes['wpbs-style'] || {});
    useEffect(() => setLocal(attributes['wpbs-style'] || {}), [attributes, clientId]);

    const handleChange = (newSettings) => {
        setLocal(newSettings);
        setAttributes({ 'wpbs-style': newSettings });
    };

    return (
        <PanelBody title="Style Editor" initialOpen>
            <div style={{ padding: '12px' }}>
                <label>Background</label>
                <input
                    type="color"
                    value={local.backgroundColor || '#ffffff'}
                    onChange={(e) => handleChange({ ...local, backgroundColor: e.target.value })}
                />
            </div>
            <Button variant="secondary" onClick={onClose}>Done</Button>
        </PanelBody>
    );
}

// --- global helper that mounts the editor inline ---
window.WPBSFramework = window.WPBSFramework || {};
window.WPBSFramework.openStyleEditorInline = ({ mountSelector, clientId, attributes, setAttributes }) => {
    const mountNode = document.querySelector(mountSelector);
    if (!mountNode) return;

    // Clean up existing editor if any
    if (window.WPBSFramework.activeEditorNode) {
        unmountComponentAtNode(window.WPBSFramework.activeEditorNode);
        window.WPBSFramework.activeEditorNode = null;
    }

    const close = () => {
        unmountComponentAtNode(mountNode);
        mountNode.innerHTML = `
      <button type="button" class="components-button is-secondary wpbs-style-launcher">
        Edit Styles
      </button>
    `;
        window.WPBSFramework.activeEditorNode = null;
        unsubscribeSelection();
    };

    render(
        createElement(StyleEditorUI, { clientId, attributes, setAttributes, onClose: close }),
        mountNode
    );

    window.WPBSFramework.activeEditorNode = mountNode;

    // Auto-close when block deselected
    const unsubscribeSelection = subscribe(() => {
        const selected = select('core/block-editor').getSelectedBlockClientId();
        if (selected !== clientId && window.WPBSFramework.activeEditorNode === mountNode) {
            close();
        }
    });
};