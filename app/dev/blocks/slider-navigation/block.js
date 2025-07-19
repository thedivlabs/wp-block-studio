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
import React, {useCallback} from "react";
import {Style, STYLE_ATTRIBUTES} from "Components/Style.js";
import {LayoutControls, LAYOUT_ATTRIBUTES} from "Components/Layout"


function blockClasses(attributes = {}) {

    return [
        'wpbs-slider-nav',
        attributes?.uniqueId ?? '',
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

function BlockContent({props, options}) {

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
            <span className="screen-reader-text">Previous Slide</span>
        </button>
        {!!options?.pagination?.enabled ? <div className={paginationClass}></div> : null}
        <button type="button" className={nextClass}>
            <span className="screen-reader-text">Next Slide</span>
        </button>
    </div>;
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-slider-navigation': {
            type: 'object'
        }
    },
    edit: ({attributes, setAttributes, clientId, context}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-slider-nav');

        const blockProps = useBlockProps({
            className: blockClasses(attributes),
            style: blockStyles(attributes)
        });

        const {slider = {}} = context?.['wpbs/settings'] ?? {};
        
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

            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes}
                   uniqueId={uniqueId}
                   deps={['wpbs-slider-navigation']}
            />

            <BlockContent props={blockProps} options={slider}/>
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


