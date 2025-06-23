import "../scss/block.scss";


import {
    InspectorControls, PanelColorSettings,
    useBlockProps,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import {useInstanceId} from "@wordpress/compose";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {
    __experimentalGrid as Grid,
    ToggleControl,
    SelectControl,
    TextControl,
    BaseControl,
    __experimentalNumberControl as NumberControl,
    __experimentalBorderControl as BorderControl,
    __experimentalInputControl as InputControl,
    __experimentalUnitControl as UnitControl, PanelBody, TabPanel
} from "@wordpress/components";
import Breakpoint from "Components/Breakpoint.js";
import {MediaGalleryControls} from "Components/MediaGallery.js";
import {GridControls} from "Components/Grid.js";

function blockClassnames(attributes = {}) {
    return [
        'wpbs-media-gallery',
        attributes?.cardClass ?? null,
        'w-full block relative',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-media-gallery': {
            type: 'object',
            default: {}
        }
    },
    edit: (props) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-media-gallery');

        const {attributes, setAttributes, context} = props;

        const [mediaGallery, setMediaGallery] = useState(attributes['wpbs-media-gallery'] || {});

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...mediaGallery,
                ...newValue
            };

            setAttributes({
                'wpbs-media-gallery': result,
            });
            setMediaGallery(result);

        }, [setAttributes, setMediaGallery])

        const tabOptions = useMemo(() => {
            return <GridControls grid={mediaGallery} callback={updateSettings}/>;
        }, [mediaGallery, updateSettings]);

        const tabGallery = useMemo(() => {
            return <MediaGalleryControls attributes={attributes} setAttributes={setAttributes}
                                         cardClass={'layout-grid-card'}/>
        }, [attributes['wpbs-media-gallery']])
        const tabs = {
            options: tabOptions,
            gallery: tabGallery,
        }

        const blockProps = useBlockProps({
            className: blockClassnames(attributes),
        });

        return (
            <>
                <InspectorControls group="styles">

                    <PanelBody>

                        <TabPanel
                            className="wpbs-editor-tabs"
                            activeClass="active"
                            orientation="horizontal"
                            initialTabName="options"
                            tabs={[
                                {
                                    name: 'options',
                                    title: 'Options',
                                    className: 'tab-options',
                                },
                                {
                                    name: 'gallery',
                                    title: 'Gallery',
                                    className: 'tab-gallery',
                                },
                            ]}>
                            {
                                (tab) => (<>{tabs[tab.name]}</>)
                            }
                        </TabPanel>

                    </PanelBody>


                </InspectorControls>
                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>

                <div {...blockProps}></div>

                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}/>
            </>
        )
    },
    save: (props) => null
})


