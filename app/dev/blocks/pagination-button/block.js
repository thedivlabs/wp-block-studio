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
        !attributes?.['wpbs-pagination-button']?.page_size ? 'hidden' : 'inline-block',
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

        const {gallery: gallery_settings = {}} = context?.['wpbs/settings'] ?? {};
        const {button_label = 'View More', page_size} = gallery_settings;

        useEffect(() => {
            setAttributes({
                'wpbs-pagination-button': {
                    label: button_label,
                    page_size: page_size,
                }
            });
        }, [button_label, page_size]);

        const blockProps = useBlockProps({
            className: blockClassNames(attributes, true),
        });

        return <div {...blockProps}>
            <a href={'#'} className={'cursor-pointer no-underline block'}>
                {button_label}
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


