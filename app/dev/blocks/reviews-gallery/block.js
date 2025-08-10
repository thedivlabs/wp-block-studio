import {
    BlockContextProvider,
    InspectorControls,
    useBlockProps,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {GRID_ATTRIBUTES, GridControls, gridProps} from "Components/Grid"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import {useInstanceId} from "@wordpress/compose";
import React, {useEffect, useMemo, useRef} from "react";
import {
    PanelBody, TabPanel
} from "@wordpress/components";
import {MediaGalleryControls, MEDIA_GALLERY_ATTRIBUTES} from "Components/MediaGallery.js";
import {SLIDER_ATTRIBUTES, SliderControls, sliderProps, SliderComponent} from "Components/Slider"
import {cleanObject, useUniqueId} from "Includes/helper"
import {isEqual} from 'lodash';


function blockClassnames(attributes = {}) {

    const isSlider = attributes?.className?.includes('is-style-slider');

    return [
        'wpbs-media-gallery h-max',
        'flex flex-col w-full relative overflow-hidden',
        isSlider ? 'swiper wpbs-slider' : '--grid',
        !!attributes?.['wpbs-grid']?.masonry ? '--masonry' : null,
        !!attributes?.['wpbs-media-gallery']?.lightbox ? '--lightbox' : null,
        !attributes?.['wpbs-media-gallery']?.page_size ? '--last-page' : null,
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        ...GRID_ATTRIBUTES,
        ...MEDIA_GALLERY_ATTRIBUTES,
        ...SLIDER_ATTRIBUTES
    },
    edit: ({attributes, setAttributes, clientId}) => {


        //const uniqueId = useInstanceId(registerBlockType, 'wpbs-media-gallery');

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const styleType = useMemo(() => {
            return (attributes?.className?.match(/is-style-(\S+)/) || [])[1] || 'default';
        }, [attributes?.className]);

        const isSlider = styleType === 'slider';

        const swiperRef = useRef(null);


        const newSettings = useMemo(() => cleanObject({
            uniqueId,
            type: styleType,
            grid: !isSlider ? attributes?.['wpbs-grid'] : {},
            slider: isSlider ? attributes?.['wpbs-swiper-args'] : {},
            gallery: attributes?.['wpbs-media-gallery'],
            button: {
                label: attributes?.['wpbs-media-gallery']?.button_label,
                enabled: !!attributes?.['wpbs-media-gallery']?.page_size,
            }
        }), [
            uniqueId,
            styleType,
            attributes?.['wpbs-grid'],
            attributes?.['wpbs-swiper-args'],
            attributes?.['wpbs-media-gallery'],
        ]);

        useEffect(() => {

            if (!isEqual(attributes?.['wpbs-media-gallery-settings'], newSettings)) {
                setAttributes({'wpbs-media-gallery-settings': newSettings});
            }

        }, [newSettings]);

        const tabGrid = <GridControls attributes={attributes} setAttributes={setAttributes}/>;

        const tabSlider = <SliderControls attributes={attributes} setAttributes={setAttributes}/>;

        const tabGallery = <MediaGalleryControls attributes={attributes} setAttributes={setAttributes}/>;

        const tabsContent = {
            gallery: tabGallery,
            grid: tabGrid,
            slider: tabSlider,
        }

        const visibleTabs = [
            {
                name: 'gallery',
                title: 'Gallery',
                className: 'tab-gallery',
            },
            !isSlider && {
                name: 'grid',
                title: 'Grid',
                className: 'tab-grid',
            },
            !!isSlider && {
                name: 'slider',
                title: 'Slider',
                className: 'tab-slider',
            }
        ].filter(Boolean); // removes false entries

        const cssPropsGrid = useMemo(() => {
            return gridProps(attributes);
        }, [attributes?.['wpbs-grid']]);

        const cssPropsSlider = useMemo(() => {
            return sliderProps(attributes);
        }, [attributes?.['wpbs-slider']]);

        const cssProps = !isSlider ? cssPropsGrid : cssPropsSlider;

        const blockProps = useBlockProps({className: blockClassnames(attributes)});

        const innerBlocksProps = useInnerBlocksProps(blockProps, {
            /*  template: [
                  ['wpbs/media-gallery-container'],
              ],*/
        });

        return (
            <>
                <InspectorControls group="styles">

                    <PanelBody>
                        <TabPanel
                            className="wpbs-editor-tabs"
                            activeClass="active"
                            orientation="horizontal"
                            initialTabName={visibleTabs[0]?.name}
                            tabs={visibleTabs}
                        >
                            {(tab) => <>{tabsContent[tab.name]}</>}
                        </TabPanel>
                    </PanelBody>


                </InspectorControls>
                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                {isSlider ? <SliderComponent
                    attributes={attributes}
                    blockProps={blockProps}
                    innerBlocksProps={innerBlocksProps}
                    ref={swiperRef}
                /> : <div {...innerBlocksProps} />}

                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                       deps={['wpbs-grid', 'wpbs-slider']} clientId={clientId}
                       props={cssProps} selector={'wpbs-media-gallery'}
                />
            </>
        )
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClassnames(props.attributes),
            'data-wp-interactive': 'wpbs/media-gallery',
            'data-wp-init': 'actions.init',
            ...(props.attributes?.['wpbs-props'] ?? {})
        });

        const innerBlocksProps = useInnerBlocksProps.save(blockProps);

        return <div {...innerBlocksProps} />;
    }
})


