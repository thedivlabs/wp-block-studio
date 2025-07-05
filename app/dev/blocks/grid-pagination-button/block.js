import {
    useBlockProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {useEffect} from "react";
import {useInstanceId} from "@wordpress/compose";


registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        'wpbs-grid-pagination-button': {
            type: 'object'
        }
    },
    edit: ({attributes, setAttributes, context}) => {

        const {label = 'View More'} = context;

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-grid-pagination-button');

        useEffect(() => {
            setAttributes({
                'wpbs-grid-pagination-button': {
                    label: label
                },
                uniqueId: uniqueId
            });
        }, [label, uniqueId]);

        const blockProps = useBlockProps({
            className: 'wpbs-grid-pagination-button loop-button min-h-10 px-4 relative z-20 hidden cursor-pointer',
        });

        return <button {...blockProps}>{label}</button>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: 'wpbs-grid-pagination-button loop-button min-h-10 px-4 relative z-20 hidden cursor-pointer',
        });

        return <button {...blockProps}>{props.attributes?.['wpbs-grid-pagination-button']?.label ?? 'View More'}</button>;

    }

})


