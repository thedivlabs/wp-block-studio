import {
    useBlockProps,
    InspectorControls,
    InnerBlocks,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {Layout, LayoutAttributes, LayoutClasses} from "Components/Layout"
import {Background, BackgroundElement} from "Components/Background";

function sectionClassNames(attributes = {}) {

    return [
        'wpbs-layout-element w-full flex relative has-container',
        LayoutClasses(attributes)
    ].filter(x => x).join(' ');
}

function containerClassNames(attributes = {}) {

    return [
        'container relative z-20',
    ].filter(x => x).join(' ');

}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...LayoutAttributes(),
        'background': {
            type: 'object'
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const blockProps = useBlockProps({
            className: sectionClassNames(attributes),
        });

        const resetAll_options = () => {

        };

        return (
            <>
                <InspectorControls group="styles">
                    <Background settings={attributes.background || {}} pushSettings={setAttributes}></Background>
                </InspectorControls>
                <Layout blockProps={blockProps} attributes={attributes} setAttributes={setAttributes}></Layout>
                <section {...blockProps}
                         data-wp-interactive='wpbs/wpbs-layout-element'
                >
                    <div className={containerClassNames(attributes)}>
                        <InnerBlocks/>
                    </div>

                    <BackgroundElement settings={attributes.background} blockProps={blockProps}/>
                </section>
            </>
        )
    },
    save: (props) => {


        const blockProps = useBlockProps.save({
            className: sectionClassNames(props.attributes),
            style: {
                '--offset-header': props.attributes['offset-header']
            }
        });

        return (
            <section {...blockProps}
                     data-wp-interactive='wpbs/wpbs-layout-element'
            >
                <div className={containerClassNames(props.attributes)}>
                    <InnerBlocks.Content/>
                </div>
                <BackgroundElement settings={props.attributes.background} blockProps={blockProps}/>
            </section>
        );
    }
})


