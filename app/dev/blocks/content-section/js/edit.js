import {
    useBlockProps,
    InspectorControls,
    InnerBlocks,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {Layout, LayoutAttributes} from "Components/Layout"
import {
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem,
    ToggleControl
} from "@wordpress/components";

function sectionClassNames(attributes = {}) {

    return [
        'wpbs-content-section w-full flex relative'
    ].filter(x => x).join(' ');
}

function containerClassNames(attributes = {}) {

    return [
        'wpbs-container container gap-inherit relative z-20',
        attributes.offsetHeader ? 'offset-header' : false,
    ].filter(x => x).join(' ');

}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...LayoutAttributes(),
        offsetHeader: {
            type: 'boolean'
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {


        const blockProps = useBlockProps({
            className: sectionClassNames(attributes),
        });

        const resetAll_options = () => {
            setAttributes({'offsetHeader': false});
        };

        return (
            <>
                <Layout blockProps={blockProps} attributes={attributes} setAttributes={setAttributes}></Layout>
                <InspectorControls group="styles">
                    <ToolsPanel label={'Options'} resetAll={resetAll_options} cols={1} style={{gap: '20px'}}>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 2'}}
                            hasValue={() => !!attributes.offsetHeader}
                            label={'Offset Header'}
                            onDeselect={() => setAttributes({offsetHeader: false})}
                        >
                            <ToggleControl
                                __nextHasNoMarginBottom
                                checked={attributes.offsetHeader}
                                label="Offset Header"
                                onChange={(newValue) => {
                                    setAttributes({offsetHeader: newValue})
                                }}
                            />
                        </ToolsPanelItem>
                    </ToolsPanel>
                </InspectorControls>
                <section {...blockProps}
                         data-wp-interactive='wpbs/content-section'
                >
                    <div className={containerClassNames(attributes)}>
                        <InnerBlocks/>
                    </div>
                </section>
            </>
        )
    },
    save: (props) => {


        const blockProps = useBlockProps.save({
            className: sectionClassNames(props.attributes),
        });

        return (
            <section {...blockProps}
                     data-wp-interactive='wpbs/content-section'
            >
                <div className={containerClassNames(props.attributes)}>
                    <InnerBlocks.Content/>
                </div>
            </section>
        );
    }
})


