import {
    useBlockProps,
    InspectorControls,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {Layout, LayoutAttributes, LayoutClasses} from "Components/Layout"

import {
    __experimentalGrid as Grid,
} from "@wordpress/components";
import {useInstanceId} from "@wordpress/compose";
import React, {useEffect, useRef} from "react";
import {useSelect} from "@wordpress/data";


function sectionClassNames(attributes = {}) {

    return [
        'layout-grid-pagination w-full block relative',
        attributes.uniqueId,
        LayoutClasses(attributes)
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LayoutAttributes,
    },
    edit: ({attributes, setAttributes, context, clientId}) => {
        
        const uniqueId = useInstanceId(registerBlockType, 'layout-grid-pagination');

        useEffect(() => {
            setAttributes({uniqueId: uniqueId});

        }, []);

        const blockProps = useBlockProps({
            className: sectionClassNames(attributes),
        });


        return (
            <>
                <Layout blockProps={blockProps} attributes={attributes} setAttributes={setAttributes}
                        clientId={clientId}></Layout>

                <nav {...blockProps} />

            </>
        )
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: sectionClassNames(props.attributes),
        });

        return <nav {...blockProps} />;


    }
})


