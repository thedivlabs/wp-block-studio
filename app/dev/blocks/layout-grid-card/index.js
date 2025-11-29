import {registerBlockType} from '@wordpress/blocks';
import {useBlockProps, useInnerBlocksProps} from '@wordpress/block-editor';

import './style.scss';

const blockClassNames = (attributes, editor = false) => {

    return [
        'af-xml-grid-card af-loop-card',
        editor ? '--editor' : null,
    ].filter(Boolean).join(' ');
};

const blockStyles = (attributes) => {

    return Object.fromEntries(Object.entries({
        rowGap: resolvePresetVar(attributes?.style?.spacing?.blockGap?.top ?? null),
    }).filter(Boolean));
};

const resolvePresetVar = (value) => {
    if (typeof value === 'string' && value.startsWith('var:preset|')) {
        // turn "var:preset|spacing|50" → "var(--wp--preset--spacing--50)"
        const parts = value.replace('var:preset|', '').split('|');
        return `var(--wp--preset--${parts.join('--')})`;
    }
    return value;
};


registerBlockType('af/xml-grid-card', {
    edit: ({attributes}) => {

        const blockProps = useBlockProps({
            className: blockClassNames(attributes, true),
            style: blockStyles(attributes),
        });

        const innerBlocksProps = useInnerBlocksProps(blockProps, {});

        return (
            <>
                <article {...innerBlocksProps} />
            </>
        );
    },
    save: ({attributes}) => {
        const blockProps = useBlockProps.save({
            className: blockClassNames(attributes, false),
            style: blockStyles(attributes),
        });

        const innerBlocksProps = useInnerBlocksProps.save(blockProps);

        return <article {...innerBlocksProps}  />;
    }

});
