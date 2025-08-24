import './scss/block.scss';

import {
    BlockContextProvider, InnerBlocks,
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


function blockClassnames(attributes = {}, editor = false) {

    return [
        'wpbs-review-gallery h-max wpbs-container',
        !!editor ? 'editor' : null,
        'flex flex-col w-full justify-center items-center relative overflow-hidden',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        ...SLIDER_ATTRIBUTES
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const {'wpbs-review-gallery': settings = {}} = attributes;

        const companies = useSelect((select) => {
            return select('core').getEntityRecords('postType', 'company', {per_page: -1});
        }, []);

        const updateSettings = useCallback((newValue) => {

            const result = {
                ...attributes['wpbs-review-gallery'],
                ...newValue,
            }

            setAttributes({
                'wpbs-review-gallery': result,
            });

        }, [setAttributes, attributes['wpbs-media-gallery']]);


        const cssProps = useMemo(() => {
            return sliderProps(attributes);
        }, [attributes?.['wpbs-slider']]);

        const blockProps = useBlockProps({className: blockClassnames(attributes, true)});

        const innerBlocksProps = useInnerBlocksProps(blockProps, {
            template: [
                ['wpbs/review-card'],
                ['wpbs/slider-navigation'],
            ],
        });

        const sliderSettings = attributes?.['wpbs-swiper-args'];
        
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
                                    {label: 'Current', value: 'current'},
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
                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                       deps={['wpbs-slider', 'wpbs-review-gallery']} clientId={clientId}
                       props={cssProps} selector={'wpbs-review-gallery'}
                />

                <BlockContextProvider value={{'wpbs/settings': sliderSettings}}>
                    <div {...innerBlocksProps}/>
                </BlockContextProvider>


            </>
        )
    },
    save: () => {

        return <InnerBlocks.Content/>;
    }
})


