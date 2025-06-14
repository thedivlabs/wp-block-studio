import {
    useBlockProps,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"

import {useEffect} from '@wordpress/element';

import {useInstanceId} from "@wordpress/compose";

import React from "react";

function classNames(attributes = {}, editor = false) {

    return [
        'wpbs-accordion-group-content',
        !!editor ? '.editor' : null,
        attributes.uniqueId,
    ].filter(x => x).join(' ');
}

function wrapperClassNames() {

    return 'wpbs-accordion-group-content__wrapper';
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        'wpbs-accordion-group-content': {
            type: 'object',
            default: {}
        }
    },
    edit: ({attributes, setAttributes, clientId, context}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-accordion-group-content');

        useEffect(() => {
            setAttributes({
                'uniqueId': uniqueId
            });
        }, []);

        const blockProps = useBlockProps({
            className: classNames(attributes, true),
        });

        const innerBlocksProps = useInnerBlocksProps({
            className: wrapperClassNames()
        }, {
            template: [
                ['core/paragraph']
            ],
            templateLock: false
        });

        return <div {...blockProps}>
            <div {...innerBlocksProps}></div>
        </div>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: classNames(props.attributes),
            'data-wp-interactive': 'wpbs/accordion-group-item',
            'data-wp-init': 'actions.init',
        });

        const innerBlocksProps = useInnerBlocksProps.save({
            className: wrapperClassNames(),
        });

        return <div {...blockProps}>
            <div {...innerBlocksProps}></div>
        </div>;
    }
})


