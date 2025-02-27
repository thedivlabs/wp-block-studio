import {
    useBlockProps,
    InspectorControls,
    InnerBlocks,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {Layout, LayoutAttributes, LayoutClasses} from "Components/Layout"
import {Background, BackgroundSettings, BackgroundAttributes} from "Components/Background";
import {ElementTagSettings, ElementTag, ElementTagAttributes} from "Components/ElementTag";
import {LayoutStyle} from "Components/LayoutStyle";
import {
    __experimentalGrid as Grid,
} from "@wordpress/components";
import ServerSideRender from '@wordpress/server-side-render';


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

        const innerBlocksProps = useInnerBlocksProps({
            className: containerClassNames(attributes)
        });

        return (
            <>
                <InspectorControls group="styles">
                    <BackgroundSettings attributes={attributes || {}}
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
                    <div {...innerBlocksProps}/>

                    <Background attributes={attributes} blockProps={blockProps}/>

                    <LayoutStyle attributes={attributes} clientId={clientId}/>

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
            className: containerClassNames(props.attributes)
        });

        return (
            <ElementTagName {...blockProps}
                            data-wp-interactive='wpbs/wpbs-layout-element'
            >
                <div {...innerBlocksProps}/>

                <Background settings={props.attributes} blockProps={blockProps}/>
            </ElementTagName>
        );
    }
})


