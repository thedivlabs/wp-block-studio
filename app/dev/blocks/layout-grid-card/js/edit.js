import {
    useBlockProps,
    InspectorControls,
    InnerBlocks,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {Layout, LayoutAttributes, LayoutClasses} from "Components/Layout"
import {Background, BackgroundSettings, BackgroundAttributes} from "Components/Background";

import {
    __experimentalGrid as Grid,
} from "@wordpress/components";
import {useInstanceId} from "@wordpress/compose";
import {useEffect, useRef} from "react";
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

        return (
            <>
                <InspectorControls group="styles">
                    <BackgroundSettings attributes={attributes || {}}
                                        pushSettings={setAttributes}></BackgroundSettings>
                </InspectorControls>
                <Layout blockProps={blockProps} attributes={attributes} setAttributes={setAttributes}
                        clientId={clientId}></Layout>

                <div {...blockProps}>

                    <InnerBlocks/>

                    <Background attributes={attributes} editor={true}/>

                </div>
            </>
        )
    },
    save: (props) => {


        const blockProps = useBlockProps.save({
            className: sectionClassNames(props.attributes),
        });

        return (
            <div {...blockProps}>

                <InnerBlocks.Content/>

                <Background attributes={props.attributes} editor={false}/>
            </div>
        );
    }
})


