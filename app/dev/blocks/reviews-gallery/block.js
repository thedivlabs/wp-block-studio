import {
    BlockContextProvider,
    InspectorControls,
    useBlockProps,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import React, {useCallback, useEffect, useMemo, useRef} from "react";
import {
    PanelBody, TabPanel,
    __experimentalGrid as Grid, SelectControl
} from "@wordpress/components";
import {SLIDER_ATTRIBUTES, SliderControls, sliderProps, SliderComponent} from "Components/Slider"
import {cleanObject, useUniqueId} from "Includes/helper"
import {isEqual} from 'lodash';
import {useSelect} from "@wordpress/data";


function blockClassnames(attributes = {}) {

    return [
        'wpbs-reviews-gallery swiper wpbs-slider h-max',
        'flex flex-col w-full relative overflow-hidden',
        !!attributes?.['wpbs-reviews-gallery']?.lightbox ? '--lightbox' : null,
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        ...SLIDER_ATTRIBUTES,
        'wpbs-reviews-gallery': {
            type: 'object'
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const swiperRef = useRef(null);

        const {'wpbs-reviews-gallery': settings = {}} = attributes;

        const newSettings = useMemo(() => cleanObject({
            uniqueId,
            slider: attributes?.['wpbs-swiper-args'],
            settings: attributes?.['wpbs-reviews-gallery'],
        }), [
            uniqueId,
            attributes?.['wpbs-swiper-args'],
            attributes?.['wpbs-reviews-gallery'],
        ]);

        useEffect(() => {

            if (!isEqual(attributes?.['wpbs-reviews-gallery-settings'], newSettings)) {
                setAttributes({'wpbs-reviews-gallery-settings': newSettings});
            }

        }, [newSettings]);

        const companies = useSelect((select) => {
            return select('core').getEntityRecords('postType', 'company', {per_page: -1});
        }, []);


        const updateSettings = useCallback((newValue) => {

            const result = {
                ...attributes['wpbs-reviews-gallery'],
                ...newValue,
            }

            setAttributes({
                'wpbs-reviews-gallery': result,
            });

        }, [setAttributes, attributes['wpbs-media-gallery']]);


        const cssProps = useMemo(() => {
            return sliderProps(attributes);
        }, [attributes?.['wpbs-slider']]);

        const blockProps = useBlockProps({className: blockClassnames(attributes)});

        const innerBlocksProps = useInnerBlocksProps(blockProps, {});

        return (
            <>
                <InspectorControls group="styles">

                    <PanelBody>
                        <Grid columns={1} rowGap={20}>
                            <SelectControl
                                label="Select Company"
                                value={settings?.['company_id'] ?? ''}
                                options={[
                                    {label: 'Select a company', value: ''},
                                    ...(companies || []).map(post => ({
                                        label: post.title.rendered,
                                        value: String(post.id)
                                    }))
                                ]}
                                onChange={(newValue) => updateSettings({'company_id': newValue})}
                            />
                            <SliderControls attributes={attributes} setAttributes={setAttributes}/>
                        </Grid>

                    </PanelBody>


                </InspectorControls>
                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <SliderComponent
                    attributes={attributes}
                    blockProps={blockProps}
                    innerBlocksProps={innerBlocksProps}
                    ref={swiperRef}
                />

                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                       deps={['wpbs-slider', 'wpbs-reviews-gallery']} clientId={clientId}
                       props={cssProps} selector={'wpbs-reviews-gallery'}
                />
            </>
        )
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClassnames(props.attributes),
            'data-wp-interactive': 'wpbs/reviews-gallery',
            'data-wp-init': 'actions.init',
            ...(props.attributes?.['wpbs-props'] ?? {})
        });

        const innerBlocksProps = useInnerBlocksProps.save(blockProps);

        return <div {...innerBlocksProps} />;
    }
})


