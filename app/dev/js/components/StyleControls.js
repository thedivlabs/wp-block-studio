import {useState, useEffect, useMemo, useRef, Fragment, useCallback} from '@wordpress/element';
import {Button, PanelBody} from '@wordpress/components';

export const StyleControls = ({attributes, setAttributes, clientId}) => {
    const [isOpen, setIsOpen] = useState(false);
    const mountRef = useRef(null);

    useEffect(() => {
        if (
            isOpen &&
            mountRef.current &&
            openStyleEditor
        ) {
            window.WPBS_Style.openStyleEditor({
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