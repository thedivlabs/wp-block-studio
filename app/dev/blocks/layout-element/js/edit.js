import {
    useBlockProps,
    InspectorControls,
    InnerBlocks,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {Layout, LayoutAttributes, LayoutClasses} from "Components/Layout"
import {Background, BackgroundSettings, BackgroundAttributes} from "Components/Background";
import {ElementTagSettings, ElementTag, ElementTagAttributes} from "Components/ElementTag";
import {
    __experimentalGrid as Grid,
} from "@wordpress/components";


function sectionClassNames(attributes = {}) {

    return [
        'wpbs-layout-element wpbs-layout-container wpbs-has-container w-full flex relative',
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
        ...LayoutAttributes,
        ...BackgroundAttributes,
        ...ElementTagAttributes
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const blockProps = useBlockProps({
            className: sectionClassNames(attributes),
        });

        const resetAll_options = () => {

        };

        const ElementTagName = ElementTag(attributes);

        return (
            <>
                <InspectorControls group="styles">
                    <BackgroundSettings settings={attributes['wpbs-background'] || {}}
                                        pushSettings={setAttributes}></BackgroundSettings>
                </InspectorControls>
                <InspectorControls group="advanced">
                    <Grid columns={1} columnGap={20} rowGap={20} style={{paddingTop: '20px'}}>
                        <ElementTagSettings attributes={attributes} callback={setAttributes}></ElementTagSettings>
                    </Grid>
                </InspectorControls>
                <Layout blockProps={blockProps} attributes={attributes} setAttributes={setAttributes}></Layout>
                <ElementTagName {...blockProps}
                                data-wp-interactive='wpbs/wpbs-layout-element'
                >
                    <div className={containerClassNames(attributes)}>
                        <InnerBlocks/>
                    </div>

                    <Background settings={attributes} blockProps={blockProps}/>
                </ElementTagName>
            </>
        )
    },
    save: (props) => {


        const blockProps = useBlockProps.save({
            className: sectionClassNames(props.attributes),
        });

        const ElementTagName = ElementTag(props.attributes);

        return (
            <ElementTagName {...blockProps}
                            data-wp-interactive='wpbs/wpbs-layout-element'
            >
                <div className={containerClassNames(props.attributes)}>
                    <InnerBlocks.Content/>
                </div>
                <Background settings={props.attributes} blockProps={blockProps}/>
            </ElementTagName>
        );
    }
})


