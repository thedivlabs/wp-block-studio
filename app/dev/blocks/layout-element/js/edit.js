import {
    useBlockProps,
    InspectorControls,
    useInnerBlocksProps, InnerBlocks,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {Layout, LayoutAttributes, LayoutClasses} from "Components/Layout"
import {Background, BackgroundSettings, BackgroundAttributes} from "Components/Background";
import {ElementTagSettings, ElementTag, ElementTagAttributes} from "Components/ElementTag";
import {
    __experimentalGrid as Grid,
} from "@wordpress/components";
import {useInstanceId} from "@wordpress/compose";
import {useEffect} from "react";


function sectionClassNames(attributes = {}) {

    return [
        'wpbs-layout-element w-full block relative',
        attributes.uniqueId,
        LayoutClasses(attributes)
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LayoutAttributes,
        ...BackgroundAttributes,
        ...ElementTagAttributes
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-layout-element');

        useEffect(() => {
            setAttributes({uniqueId: uniqueId});
        }, []);

        const blockProps = useBlockProps({
            className: [sectionClassNames(attributes), 'empty:min-h-8'].join(' '),
        });

        const ElementTagName = ElementTag(attributes);

        function Content() {
            if (!!attributes['wpbs-background']) {
                return <div className={'wpbs-layout-wrapper w-full h-full'}>
                    <InnerBlocks/>
                </div>;
            } else {
                return <InnerBlocks/>;
            }
        }

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
                    <Content/>

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

        function Content() {
            if (!!props.attributes['wpbs-background']) {
                return <div className={'wpbs-layout-wrapper w-full h-full'}>
                    <InnerBlocks.Content/>
                </div>;
            } else {
                return <InnerBlocks.Content/>;
            }
        }

        return (
            <ElementTagName {...blockProps}
            >

                <Content/>

                <Background attributes={props.attributes} editor={false}/>
            </ElementTagName>
        );
    }
})


