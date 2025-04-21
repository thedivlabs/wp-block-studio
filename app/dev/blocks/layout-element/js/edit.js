import {
    useBlockProps,
    InspectorControls,
    useInnerBlocksProps, InnerBlocks,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {Layout, LayoutAttributes, LayoutClasses, LayoutStyles} from "Components/Layout"
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

        let styleTag = <style>{attributes['wpbs-css']}</style>;

        useEffect(() => {
            styleTag = LayoutStyles(attributes, clientId, (css) => {
                setAttributes({'wpbs-css': css});
            });

        }, [Object.keys(LayoutAttributes).filter(x => x !== 'wpbs-css')]);

        const blockProps = useBlockProps({
            className: [sectionClassNames(attributes), 'empty:min-h-8'].join(' '),
        });

        const ElementTagName = ElementTag(attributes);

        function Content() {
            if (!!attributes['wpbs-background']) {

                const innerBlocksProps = useInnerBlocksProps({
                    className: 'wpbs-layout-wrapper w-full h-full'
                });

                return <ElementTagName {...blockProps} >
                    <div {...innerBlocksProps} />
                    <Background attributes={attributes} editor={true}/>
                    <styleTag/>
                </ElementTagName>;
            } else {
                const {children, ...innerBlocksProps} = useInnerBlocksProps(blockProps);

                return <ElementTagName {...blockProps} >
                    {children}
                    <styleTag/>
                </ElementTagName>;
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
                <Content/>
                <style id={'wpbs-layout-styles'}>{attributes['wpbs-css'] || ''}</style>
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

                const innerBlocksProps = useInnerBlocksProps.save({
                    className: 'wpbs-layout-wrapper w-full h-full'
                });

                return <ElementTagName {...blockProps} >
                    <div {...innerBlocksProps} />
                    <Background attributes={props.attributes} editor={false}/>
                </ElementTagName>;
            } else {
                const {children, ...innerBlocksProps} = useInnerBlocksProps.save(blockProps);

                return <ElementTagName {...blockProps} >
                    {children}
                </ElementTagName>;
            }
        }

        return <Content/>;
    }
})


