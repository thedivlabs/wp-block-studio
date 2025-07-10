import {
    BlockContextProvider,
    InnerBlocks,
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
import React, {useMemo, useRef} from "react";
import {
    PanelBody, TabPanel
} from "@wordpress/components";
import {MediaGalleryControls, MEDIA_GALLERY_ATTRIBUTES} from "Components/MediaGallery.js";
import {SLIDER_ATTRIBUTES, SliderControls, sliderProps, SliderComponent} from "Components/Slider"

function blockClassnames(attributes = {}) {

    const isSlider = (attributes?.className ?? '').includes('is-style-slider');

    return [
        'wpbs-media-gallery h-max',
        'flex flex-col w-full relative',
        isSlider ? 'swiper wpbs-slider' : null,
        !!attributes?.['wpbs-grid']?.masonry ? 'masonry --masonry' : null,
        !!attributes?.['wpbs-media-gallery']?.lightbox ? '--lightbox' : null,
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

        const isSlider = (attributes?.className ?? '').includes('is-style-slider');

        const swiperRef = useRef(null);

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-media-gallery');

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
            template: [
                ['wpbs/media-gallery-container'],
            ],
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

                <BlockContextProvider value={{isSlider}}>
                    {isSlider ? <SliderComponent
                        attributes={attributes}
                        blockProps={blockProps}
                        innerBlocksProps={innerBlocksProps}
                        ref={swiperRef}
                    /> : <div {...innerBlocksProps} />}
                </BlockContextProvider>


                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                       deps={['wpbs-grid', 'wpbs-slider']}
                       props={cssProps}
                />
            </>
        )
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClassnames(props.attributes),
            'data-wp-interactive': 'wpbs/media-gallery',
            'data-wp-init': 'callbacks.init',
            'data-wp-context': JSON.stringify({
                uniqueId: props.attributes?.uniqueId,
                ...props.attributes?.['wpbs-media-gallery-settings'] ?? {},
            })
        });

        const innerBlocksProps = useInnerBlocksProps.save(blockProps);

        return <div {...innerBlocksProps} />;
    }
})


