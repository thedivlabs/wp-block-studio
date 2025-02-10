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
import OffsetHeader from "Components/OffsetHeader";

function sectionClassNames(attributes = {}) {

    return [
        'wpbs-content-section w-full flex relative',
        attributes['offset-header'] ? 'offset-header' : false,
    ].filter(x => x).join(' ');
}

function containerClassNames(attributes = {}) {

    return [
        'wpbs-container container gap-inherit relative z-20',
    ].filter(x => x).join(' ');

}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...LayoutAttributes(),
        'offset-header': {
            type: 'string'
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {


        const blockProps = useBlockProps({
            className: sectionClassNames(attributes),
            style: {
                '--offset-header': attributes['offset-header'] ? attributes['offset-header'] : '0px'
            }
        });

        const resetAll_options = () => {
            setAttributes({'offsetHeader': false});
        };

        return (
            <>
                <Layout blockProps={blockProps} attributes={attributes} setAttributes={setAttributes}></Layout>
                <InspectorControls group="styles">
                    <ToolsPanel label={'Options'} resetAll={resetAll_options} style={{gap: '20px'}}>
                        <ToolsPanelItem
                            hasValue={() => !!attributes['offset-header']}
                            label={'Offset Header'}
                            onDeselect={() => setAttributes({['offset-header']: false})}
                        >
                            <OffsetHeader defaultValue={attributes['offset-header'] || undefined}
                                          callback={(newValue) => {
                                              setAttributes({['offset-header']: newValue});
                                          }}/>
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


