import {
    useBlockProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {useEffect} from "react";
import {useInstanceId} from "@wordpress/compose";
import {isEqual} from "lodash";


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
    edit: ({attributes, setAttributes, context, clientId}) => {

        const {
            label = 'View More',
            enabled = true
        } = context?.['wpbs/settings']?.button ?? context?.['wpbs/settings'] ?? {};

        useEffect(() => {


            const newSettings = {
                label: label,
                enabled: enabled,
            };

            if (!isEqual(attributes['wpbs-pagination-button'], newSettings)) {
                setAttributes({
                    'wpbs-pagination-button': newSettings
                });
            }

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
            className: blockClassNames(props.attributes),
            ...(props.attributes?.['wpbs-props'] ?? {})
        });

        const label = props.attributes?.['wpbs-pagination-button']?.label ?? 'View More';

        return <div {...blockProps}>
            <a href={'#'}
               data-wp-on--click={'actions.pagination'}
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


