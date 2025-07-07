import {
    useBlockProps,
    BlockEdit, PanelColorSettings, InspectorControls,
} from "@wordpress/block-editor"

import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {useInstanceId} from "@wordpress/compose";
import {
    __experimentalGrid as Grid,
    PanelBody,
} from "@wordpress/components";
import {useCallback, useEffect, useState} from "react";


function blockClasses(attributes = {}) {

    const isGroupStyle = (attributes?.className ?? '').includes('is-style-group');

    return [
        'wpbs-slider-nav',
        isGroupStyle ? '--group' : null,
    ].filter(x => x).join(' ');
}

function blockStyles(attributes = {}) {
    return Object.fromEntries(
        Object.entries({
            '--swiper-pagination-color': attributes['wpbs-slider-navigation']?.['pagination-color'] || null,
            '--swiper-pagination-bullet-inactive-color': attributes['wpbs-slider-navigation']?.['pagination-track-color'] || null,
        }).filter(([key, value]) => value)
    );
}

function BlockContent({props, attributes}) {

    const buttonClass = 'wpbs-slider-nav__btn';

    const prevClass = [
        buttonClass,
        'wpbs-slider-nav__btn--prev wpbs-slider-btn--prev',
    ].filter(x => x).join(' ');
    const nextClass = [
        buttonClass,
        'wpbs-slider-nav__btn--next wpbs-slider-btn--next',
    ].filter(x => x).join(' ');
    const paginationClass = 'wpbs-slider-nav__pagination swiper-pagination ';

    return <div {...props}>
        <button type="button" className={prevClass}>
            <i className="fa-light fa-arrow-left"></i>
            <span className="screen-reader-text">Previous Slide</span>
        </button>
        <div className={paginationClass}></div>
        <button type="button" className={nextClass}>
            <i className="fa-light fa-arrow-right"></i>
            <span className="screen-reader-text">Next Slide</span>
        </button>
    </div>;
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        'wpbs-slider-navigation': {
            type: 'object'
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const blockProps = useBlockProps({
            className: blockClasses(attributes),
            style: blockStyles(attributes)
        });

        const updateSettings = useCallback((newValue) => {

            const result = {
                ...attributes['wpbs-slider-navigation'],
                ...newValue
            }

            setAttributes({'wpbs-slider-navigation': result});

        }, [setAttributes, attributes['wpbs-slider-navigation']]);

        return <>
            <BlockEdit key="edit" {...blockProps} />

            <InspectorControls group="styles">
                <PanelBody initialOpen={true}>
                    <Grid columns={1} columnGap={15} rowGap={0}>
                        <PanelColorSettings
                            enableAlpha
                            className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                            colorSettings={[
                                {
                                    slug: 'pagination-color',
                                    label: 'Pagination',
                                    value: attributes['wpbs-slider-navigation']?.['pagination-color'] ?? '',
                                    onChange: (newValue) => updateSettings({'pagination-color': newValue}),
                                    isShownByDefault: true
                                }
                            ]}
                        />
                        <PanelColorSettings
                            enableAlpha
                            className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                            colorSettings={[
                                {
                                    slug: 'pagination-track-color',
                                    label: 'Pagination Track',
                                    value: attributes['wpbs-slider-navigation']?.['pagination-track-color'] ?? '',
                                    onChange: (newValue) => updateSettings({'pagination-track-color': newValue}),
                                    isShownByDefault: true
                                }
                            ]}
                        />
                    </Grid>
                </PanelBody>
            </InspectorControls>


            <BlockContent props={blockProps} attributes={attributes}/>
        </>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClasses(props.attributes),
            style: blockStyles(props.attributes)
        });

        return (
            <BlockContent props={blockProps} attributes={props.attributes}/>
        );
    }
})


