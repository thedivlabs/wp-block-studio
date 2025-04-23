import {
    useBlockProps,
    InspectorControls,
    useInnerBlocksProps, useSetting,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {LayoutClasses, LayoutSettings} from "Components/Layout"
import {Background, BackgroundSettings} from "Components/Background";
import {ElementTagSettings, ElementTag, ElementTagAttributes} from "Components/ElementTag";
import {
    __experimentalGrid as Grid,
} from "@wordpress/components";
import {useInstanceId} from "@wordpress/compose";
import React, {useEffect} from "react";
import {Style, styleAttributesFull} from "Components/Style.js";


function sectionClassNames(attributes = {}) {

    return [
        'wpbs-layout-element w-full block relative',
        LayoutClasses(attributes),
        attributes.uniqueId,
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...styleAttributesFull,
        ...ElementTagAttributes,
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

                const innerBlocksProps = useInnerBlocksProps({
                    className: 'wpbs-layout-wrapper w-full h-full'
                });

                return <ElementTagName {...blockProps} >
                    <div {...innerBlocksProps} />
                    <Background attributes={attributes} editor={true}/>
                </ElementTagName>;
            } else {
                const {children, ...innerBlocksProps} = useInnerBlocksProps(blockProps);

                return <ElementTagName {...blockProps} >
                    {children}
                </ElementTagName>;
            }
        }

        return (
            <>
                <InspectorControls group="styles">
                    <BackgroundSettings attributes={attributes || {}}
                                        pushSettings={setAttributes}></BackgroundSettings>
                </InspectorControls>
                <LayoutSettings attributes={attributes} setAttributes={setAttributes}/>
                <InspectorControls group="advanced">
                    <Grid columns={1} columnGap={15} rowGap={20} style={{paddingTop: '20px'}}>
                        <ElementTagSettings attributes={attributes} callback={setAttributes}></ElementTagSettings>
                    </Grid>
                </InspectorControls>
                <Content/>
                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId} selector={'wpbs-layout-element'} />
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


