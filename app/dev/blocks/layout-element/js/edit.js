import {
    useBlockProps,
    InspectorControls,
    useInnerBlocksProps,
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

function containerClassNames() {

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

        /*const resetAll_options = () => {

        };*/

        const ElementTagName = ElementTag(attributes);

        const innerBlocksProps = useInnerBlocksProps({
            className: containerClassNames()
        });

        return (
            <>
                <InspectorControls group="styles">
                    <BackgroundSettings attributes={attributes || {}}
                                        pushSettings={setAttributes}></BackgroundSettings>
                </InspectorControls>
                <InspectorControls group="advanced">
                    <Grid columns={1} columnGap={15} rowGap={20} style={{paddingTop: '20px'}}>
                        <ElementTagSettings attributes={attributes} callback={setAttributes}></ElementTagSettings>
                    </Grid>
                </InspectorControls>
                <Layout blockProps={blockProps} attributes={attributes} setAttributes={setAttributes}
                        clientId={clientId}></Layout>
                <ElementTagName {...blockProps}
                                data-wp-interactive='wpbs-layout-element'
                >
                    <div {...innerBlocksProps}/>

                    <Background attributes={attributes} editor={true}/>

                </ElementTagName>
            </>
        )
    },
    save: (props) => {


        const blockProps = useBlockProps.save({
            className: sectionClassNames(props.attributes),
        });

        const ElementTagName = ElementTag(props.attributes);

        const innerBlocksProps = useInnerBlocksProps.save({
            className: containerClassNames()
        });

        return (
            <ElementTagName {...blockProps}
            >
                <div {...innerBlocksProps}/>

                <Background attributes={props.attributes} editor={false}/>
            </ElementTagName>
        );
    }
})


