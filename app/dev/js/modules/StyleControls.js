import {createRoot} from '@wordpress/element';
import {Button, PanelBody} from '@wordpress/components';

const openStyleEditor = ({
                             mountNode,
                             clientId,
                             attributes,
                             setAttributes,
                         }) => {
    if (!mountNode || !mountNode.classList.contains('wpbs-style-placeholder')) return;

    // Close any existing editor
    if (window.WPBS_StyleControls?.activeRoot) {
        window.WPBS_StyleControls.activeRoot.unmount();
        window.WPBS_StyleControls.activeRoot = null;
    }

    const root = createRoot(mountNode);

    const close = () => {
        if (window.WPBS_StyleControls.activeRoot) {
            root.unmount();
            window.WPBS_StyleControls.activeRoot = null;
        }
        mountNode.innerHTML = '';
        unsubscribeSelection();
        document.removeEventListener('keydown', escListener);
    };

    root.render(
        wp.element.createElement(StyleEditorUI, {
            clientId,
            attributes,
            setAttributes,
            onClose: close,
        })
    );

    window.WPBS_StyleControls.activeRoot = root;

    const unsubscribeSelection = wp.data.subscribe(() => {
        const selectedId = wp.data.select('core/block-editor').getSelectedBlockClientId();
        const block = wp.data.select('core/block-editor').getBlock(clientId);
        if (selectedId !== clientId || !block) close();
    });

    const escListener = (e) => e.key === 'Escape' && close();
    document.addEventListener('keydown', escListener);
};

const StyleEditorUI = ({clientId, attributes, setAttributes, onClose}) => {
    const [local, setLocal] = wp.element.useState(attributes['wpbs-style'] || {});

    wp.element.useEffect(() => {
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
};

/**
 * This method is called by the HOC whenever block attributes change.
 * It receives a <style> element ref and writes the parsed CSS directly into it.
 */
const parseBlockStyles = ({clientId, attributes, styleRef}) => {
    if (!styleRef?.current) return;

    const {'wpbs-style': style = {}} = attributes;
    const {backgroundColor, padding} = style;

    // Basic parser example — replace with your full CSS parser later
    let css = '';
    const selector = `[data-block="${clientId}"]`;

    if (backgroundColor) css += `${selector} { background-color: ${backgroundColor}; }`;
    if (padding) css += `${selector} { padding: ${padding}; }`;

    styleRef.current.textContent = css.trim();
};

export default class WPBS_StyleControls {
    constructor() {
        this.openStyleEditor = openStyleEditor;
        this.parseBlockStyles = parseBlockStyles;

        if (window.WPBS_StyleControls) {
            console.warn('WPBS.StyleControls already defined, skipping reinit.');
            return window.WPBS_StyleControls;
        }

        this.init();
    }

    init() {
        if (!window.WPBS_StyleControls) {
            window.WPBS_StyleControls = {};
        }

        window.WPBS_StyleControls = this;
        return window.WPBS_StyleControls;
    }
}
