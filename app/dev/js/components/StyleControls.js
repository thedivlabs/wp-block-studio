import {useState, useEffect, useMemo, useRef, Fragment, useCallback} from '@wordpress/element';
import {Button, PanelBody} from '@wordpress/components';

export const StyleControls = ({attributes, setAttributes, clientId}) => {
    const [isOpen, setIsOpen] = useState(false);
    const mountRef = useRef(null);

    useEffect(() => {
        if (
            isOpen &&
            mountRef.current &&
            openStyleEditorInline
        ) {
            window.WPBS.Style.openStyleEditorInline({
                mountNode: mountRef.current,
                clientId,
                attributes,
                setAttributes,
            });
        }
    }, [isOpen, attributes, setAttributes, clientId]);

    return (
        <PanelBody
            title="Layout"
            initialOpen={false}
            className="wpbs-layout-tools"
            onToggle={(nextOpen) => setIsOpen(nextOpen)}
        >
            <div
                ref={mountRef}
                className="wpbs-style-placeholder"
                data-client-id={clientId}
                style={{padding: '4px 0'}}
            >
                TESTING
            </div>
        </PanelBody>
    );
};

/**
 * The actual style editor UI.
 * You can replace this with your full @wordpress/components controls later.
 */
export const StyleEditorUI = ({clientId, attributes, setAttributes, onClose}) => {
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

const activeRoots = new Map();
export const openStyleEditorInline = ({
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