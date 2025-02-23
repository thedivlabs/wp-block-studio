import {
    useBlockProps,
    InspectorControls,
    InnerBlocks,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {Layout, LayoutAttributes, LayoutClasses} from "Components/Layout"
import {Background, BackgroundElement, backgroundAttributes} from "Components/Background";
import {TagName} from "Components/TagName";
import {
    __experimentalGrid as Grid,
} from "@wordpress/components";


function sectionClassNames(attributes = {}) {

    return [
        'wpbs-layout-element wpbs-has-container w-full flex relative',
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
        ...backgroundAttributes,
        tagName: {
            type: 'string',
            defaultValue: 'div',
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const blockProps = useBlockProps({
            className: sectionClassNames(attributes),
        });

        const resetAll_options = () => {

        };

        const ElementTag = attributes.tagName;

        return (
            <>
                <InspectorControls group="styles">
                    <Background settings={attributes.background || {}} pushSettings={setAttributes}></Background>
                </InspectorControls>
                <InspectorControls group="advanced">
                    <Grid columns={1} columnGap={20} rowGap={20} style={{paddingTop: '20px'}}>
                        <TagName defaultValue={attributes.tagName} callback={(newValue) => {
                            setAttributes({['tagName']: newValue});
                        }}></TagName>
                    </Grid>
                </InspectorControls>
                <Layout blockProps={blockProps} attributes={attributes} setAttributes={setAttributes}></Layout>
                <ElementTag {...blockProps}
                         data-wp-interactive='wpbs/wpbs-layout-element'
                >
                    <div className={containerClassNames(attributes)}>
                        <InnerBlocks/>
                    </div>

                    <BackgroundElement settings={attributes.background} blockProps={blockProps}/>
                </ElementTag>
            </>
        )
    },
    save: (props) => {


        const blockProps = useBlockProps.save({
            className: sectionClassNames(props.attributes),
        });

        const ElementTag = props.attributes.tagName;

        return (
            <ElementTag {...blockProps}
                     data-wp-interactive='wpbs/wpbs-layout-element'
            >
                <div className={containerClassNames(props.attributes)}>
                    <InnerBlocks.Content/>
                </div>
                <BackgroundElement settings={props.attributes.background} blockProps={blockProps}/>
            </ElementTag>
        );
    }
})


