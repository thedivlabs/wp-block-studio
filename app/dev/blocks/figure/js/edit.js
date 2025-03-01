import {
    useBlockProps,
    InspectorControls,
    BlockEdit,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {Layout, LayoutAttributes, LayoutClasses} from "Components/Layout"
import {
    __experimentalGrid as Grid,
} from "@wordpress/components";


function classNames(attributes = {}) {

    return [
        'wpbs-figure',
        LayoutClasses(attributes)
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...LayoutAttributes,
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const blockProps = useBlockProps({
            className: classNames(attributes),
        });

        return (
            <>
                <BlockEdit key="edit" {...blockProps} />
                <InspectorControls group="styles"></InspectorControls>

                <Layout blockProps={blockProps} attributes={attributes} setAttributes={setAttributes}
                        clientId={clientId}></Layout>
                <figure {...blockProps} data-wp-interactive='wpbs/wpbs-figure'>

                </figure>
            </>
        )
    },
    save: (props) => {


        const blockProps = useBlockProps.save({
            className: classNames(props.attributes),
        });

        return (
            <figure {...blockProps}
                    data-wp-interactive='wpbs/wpbs-layout-element'
            >

            </figure>
        );
    }
})


