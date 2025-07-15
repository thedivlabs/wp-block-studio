import {
    useBlockProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {useEffect} from "react";
import {useInstanceId} from "@wordpress/compose";

function blockClassNames(attributes = {}, editor = false) {
    return [
        'wpbs-pagination-button w-fit relative z-20',
        !!attributes?.['wpbs-pagination-button']?.enabled ? 'inline-block' : 'hidden',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        'wpbs-pagination-button': {
            type: 'object'
        }
    },
    edit: ({attributes, setAttributes, context}) => {

        const {label = 'View More', enabled = true} = context?.['settings'] ?? {};

        useEffect(() => {
            setAttributes({
                'wpbs-pagination-button': {
                    label: label,
                    enabled: enabled,
                }
            });
        }, [label, enabled]);

        const blockProps = useBlockProps({
            className: blockClassNames(attributes, true),
        });

        return <div {...blockProps}>
            <a href={'#'} className={'cursor-pointer no-underline block'}>
                {label}
            </a>
        </div>
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClassNames(props.attributes)
        });

        const label = props.attributes?.['wpbs-pagination-button']?.label ?? 'View More';

        return <div {...blockProps}>
            <a href={'#'}
               data-wp-on-async--click={'actions.pagination'}
               className={'loop-button cursor-pointer no-underline block'}
               role={"button"}
               tabIndex={0}
               aria-label={label}
            >
                {label}
            </a>
        </div>;

    }

})


