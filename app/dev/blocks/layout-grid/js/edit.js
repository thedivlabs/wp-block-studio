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
        'wpbs-layout-grid w-full block relative',
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

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-layout-grid');

        useEffect(() => {
            setAttributes({uniqueId: uniqueId});
        }, []);

        const blockProps = useBlockProps({
            className: [sectionClassNames(attributes), 'empty:min-h-8'].join(' '),
        });


        function Content() {
            if (!!attributes['wpbs-background']) {
                return <div className={'wpbs-layout-wrapper w-full h-full'}>
                    <InnerBlocks.Content/>
                </div>;
            } else {
                return <InnerBlocks.Content/>;
            }
        }

        return (
            <>
                <InspectorControls group="styles">
                    <BackgroundSettings attributes={attributes || {}}
                                        pushSettings={setAttributes}></BackgroundSettings>
                </InspectorControls>
                <Layout blockProps={blockProps} attributes={attributes} setAttributes={setAttributes}
                        clientId={clientId}></Layout>
                <div {...blockProps} data-wp-interactive='wpbs-layout-grid'>

                    <Content/>

                    <Background attributes={attributes} editor={true}/>

                </div>
            </>
        )
    },
    save: (props) => {


        const blockProps = useBlockProps.save({
            className: sectionClassNames(props.attributes),
        });

        function Content() {
            if (!!props.attributes['wpbs-background']) {
                return <div className={'wpbs-layout-wrapper'}>
                    <InnerBlocks.Content/>
                </div>;
            } else {
                return <InnerBlocks.Content/>;
            }
        }

        return (
            <div {...blockProps}>

                <Content/>

                <Background attributes={props.attributes} editor={false}/>
            </div>
        );
    }
})


