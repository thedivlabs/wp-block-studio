import { createRoot } from '@wordpress/element';
import { PanelBody, Button } from '@wordpress/components';
import { subscribe, select } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';

function StyleEditorUI({ clientId, attributes, setAttributes, onClose }) {
    const [local, setLocal] = useState(attributes['wpbs-style'] || {});

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
            <Button variant="secondary" onClick={onClose}>
                Done
            </Button>
        </PanelBody>
    );
}

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

    // Tear down any previous editor
    if (activeRoots.has(mountNode)) {
        activeRoots.get(mountNode).unmount();
        activeRoots.delete(mountNode);
    }

    // Create new root for this mount node
    const root = createRoot(mountNode);

    const close = () => {
        if (activeRoots.has(mountNode)) {
            root.unmount();
            activeRoots.delete(mountNode);
            mountNode.innerHTML = `
				<button type="button" class="components-button is-secondary wpbs-style-launcher">
					Edit Styles
				</button>
			`;
            unsubscribeSelection();
        }
    };

    root.render(
        <StyleEditorUI
            clientId={clientId}
            attributes={attributes}
            setAttributes={setAttributes}
            onClose={close}
        />
    );

    activeRoots.set(mountNode, root);

    // Auto-close when block deselected
    const unsubscribeSelection = subscribe(() => {
        const selected = select('core/block-editor').getSelectedBlockClientId();
        if (selected !== clientId && activeRoots.has(mountNode)) {
            close();
        }
    });
};