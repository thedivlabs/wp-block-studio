import {
    useBlockProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {useEffect} from "react";
import {useInstanceId} from "@wordpress/compose";

function blockClassNames(attributes = {}, editor = false) {
    return [
        'wpbs-loop-pagination-button inline-block w-fit min-h-10 py-1 px-4 relative z-20 cursor-pointer',
        !editor ? 'loop-button' : null,
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        'wpbs-loop-pagination-button': {
            type: 'object'
        }
    },
    edit: ({attributes, setAttributes, context}) => {

        const {button_label = 'View More'} = context?.settings ?? {};

        console.log(context);

        useEffect(() => {
            setAttributes({
                'wpbs-loop-pagination-button': {
                    label: button_label
                }
            });
        }, [button_label]);

        const blockProps = useBlockProps({
            className: blockClassNames(attributes, true),
        });

        return <button {...blockProps}>{button_label}</button>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClassNames(props.attributes),
            'data-wp-on-async--click': 'actions.pagination'
        });

        return <button {...blockProps}>{props.attributes?.['wpbs-loop-pagination-button']?.label ?? 'View More'}</button>;

    }

})


