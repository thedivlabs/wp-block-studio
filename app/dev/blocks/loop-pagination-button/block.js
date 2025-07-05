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
        'wpbs-loop-pagination-button': {
            type: 'object'
        }
    },
    edit: ({attributes, setAttributes, context}) => {

        const {label = 'View More'} = context;

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-loop-pagination-button');

        useEffect(() => {
            setAttributes({
                'wpbs-loop-pagination-button': {
                    label: label
                },
                uniqueId: uniqueId
            });
        }, [label, uniqueId]);

        const blockProps = useBlockProps({
            className: 'wpbs-loop-pagination-button loop-button min-h-10 px-4 relative z-20 hidden cursor-pointer',
        });

        return <button {...blockProps}>{label}</button>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: 'wpbs-loop-pagination-button loop-button min-h-10 px-4 relative z-20 hidden cursor-pointer',
        });

        return <button {...blockProps}>{props.attributes?.['wpbs-loop-pagination-button']?.label ?? 'View More'}</button>;

    }

})


