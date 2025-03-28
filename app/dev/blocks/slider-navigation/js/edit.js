import {
    useBlockProps,
    BlockEdit,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import React from "react";
import {useInstanceId} from "@wordpress/compose";
import {useEffect} from "react";

function blockClasses(attributes = {}) {
    return [
        'wpbs-slider-nav pointer-events-none z-50',
    ].filter(x => x).join(' ');
}

function BlockContent({props, attributes}) {

    const isGroupStyle = (attributes.className || '').split(' ').includes('is-style-group');

    const buttonClass = 'wpbs-slider-nav__btn pointer-events-auto';

    const prevClass = [
        buttonClass,
        'wpbs-slider-nav__btn--prev',
        !isGroupStyle ? 'absolute top-1/2 left-2 -translate-y-1/2' : null
    ].filter(x => x).join(' ');
    const nextClass = [
        buttonClass,
        'wpbs-slider-nav__btn--next',
        !isGroupStyle ? 'absolute top-1/2 right-2 -translate-y-1/2' : null
    ].filter(x => x).join(' ');
    const paginationClass = [
        'wpbs-slider-nav__pagination swiper-pagination',
        !isGroupStyle ? 'absolute left-1/2 bottom-2 -translate-x-1/2' : null
    ].filter(x => x).join(' ');

    return <div {...props}>
        <button type="button" className={prevClass}>
            <i class="fa-light fa-arrow-left"></i>
            <span class="screen-reader-text">Previous Slide</span>
        </button>
        <div className={paginationClass}></div>
        <button type="button" className={nextClass}>
            <i class="fa-light fa-arrow-right"></i>
            <span class="screen-reader-text">Next Slide</span>
        </button>
    </div>;
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-wpbs-slider-nav');

        useEffect(() => {
            setAttributes({uniqueId: uniqueId});
        }, []);

        const blockProps = useBlockProps({
            className: blockClasses(attributes),
        });

        return <>
            <BlockEdit key="edit" {...blockProps} />
            <BlockContent props={blockProps} attributes={attributes}/>
        </>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClasses(props.attributes),
        });

        return (
            <BlockContent props={blockProps} attributes={props.attributes}/>
        );
    }
})


