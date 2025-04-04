import {
    useBlockProps,
    InspectorControls,
    InnerBlocks, useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {Layout, LayoutAttributes, LayoutClasses} from "Components/Layout"
import {Background, BackgroundSettings, BackgroundAttributes} from "Components/Background";

import {
    __experimentalGrid as Grid,
} from "@wordpress/components";
import {useInstanceId} from "@wordpress/compose";
import React, {useEffect, useRef} from "react";
import {useSelect} from "@wordpress/data";


function sectionClassNames(attributes = {}) {

    return [
        'wpbs-layout-grid-card w-full block relative',
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
    },
    edit: ({attributes, setAttributes, context, clientId}) => {


        /*        const curBlock = useSelect((select) =>
                    select('core/block-editor').getBlock(clientId)
                )*/

        //console.log(curBlock);


        const uniqueId = useInstanceId(registerBlockType, 'wpbs-layout-grid-card');

        useEffect(() => {
            setAttributes({uniqueId: uniqueId});

        }, []);

        const blockProps = useBlockProps({
            className: sectionClassNames(attributes),
        });

        function Content() {
            if (!!attributes['wpbs-background']) {
                return <div {...blockProps}>
                    <div {...useInnerBlocksProps({
                        className: 'wpbs-layout-grid-card__container wpbs-layout-wrapper relative z-20',
                    })} />
                    <Background attributes={attributes} editor={true}/>
                </div>;
            } else {
                return <div {...useInnerBlocksProps(blockProps)} />;
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

                <Content/>

            </>
        )
    },
    save: (props) => {


        const blockProps = useBlockProps.save({
            className: sectionClassNames(props.attributes),
        });

        function Content() {
            if (!!props.attributes['wpbs-background']) {
                return <div {...blockProps}>
                    <div {...useInnerBlocksProps.save({
                        className: 'wpbs-layout-grid-card__container wpbs-layout-wrapper relative z-20',
                    })} />
                    <Background attributes={props.attributes} editor={false}/>
                </div>;
            } else {
                return <div {...useInnerBlocksProps.save(blockProps)} />;
            }
        }

        return (
            <Content/>
        );
    }
})


