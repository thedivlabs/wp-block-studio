import "./scss/block.scss";

import {
    BlockContextProvider, InnerBlocks,
    InspectorControls,
    useBlockProps,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType,} from "@wordpress/blocks"
import metadata from "./block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {BACKGROUND_ATTRIBUTES, BackgroundControls, BackgroundElement} from "Components/Background"
import {Style, STYLE_ATTRIBUTES, styleClasses} from "Components/Style"
import {LOOP_ATTRIBUTES, LoopControls} from "Components/Loop"
import {GRID_ATTRIBUTES, GridControls, gridProps} from "Components/Grid"
import {
    PanelBody,
    TabPanel,
} from "@wordpress/components";
import {useInstanceId} from "@wordpress/compose";
import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";


function classNames(attributes = {}) {

    return [
        'wpbs-layout-grid',
        !!attributes?.['wpbs-grid']?.masonry ? '--masonry masonry !block' : null,
        'w-full flex relative',
        !!attributes['wpbs-query']?.pagination ? 'wpbs-layout-grid--pagination' : null,
        'wpbs-container',
        (attributes?.className ?? '').includes('is-style-gallery') ? 'lightbox-gallery' : null,
        attributes?.uniqueId,
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...BACKGROUND_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        ...LOOP_ATTRIBUTES,
        ...GRID_ATTRIBUTES,

    },
    edit: (props) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-layout-grid');

        const {attributes, setAttributes, clientId} = props;

        const cssProps = useMemo(() => {
            return gridProps(attributes);
        }, [attributes]);

        const tabOptions = <GridControls attributes={attributes} setAttributes={setAttributes}/>;

        const tabLoop = <LoopControls attributes={attributes} setAttributes={setAttributes}/>;

        const tabs = {
            options: tabOptions,
            loop: tabLoop,
        }

        const blockProps = useBlockProps({
            className: classNames(attributes)
        });

        const innerBlocksProps = useInnerBlocksProps({
            className: 'wpbs-layout-grid__container relative z-20'
        }, {
            allowedBlocks: [
                "wpbs/layout-grid-card",
                "core/query-pagination"
            ]
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
                                    name: 'loop',
                                    title: 'Loop',
                                    className: 'tab-loop'
                                },
                            ]}>
                            {
                                (tab) => (<>{tabs[tab.name]}</>)
                            }
                        </TabPanel>

                    </PanelBody>


                </InspectorControls>
                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <BackgroundControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                       deps={['wpbs-grid']}
                       props={cssProps}
                />

                <div {...blockProps}>
                    <div {...innerBlocksProps} />
                    <BackgroundElement attributes={attributes} editor={true}/>
                </div>


            </>
        )
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: classNames(props.attributes),
            'data-wp-interactive': 'wpbs/layout-grid',
            'data-wp-init': 'actions.init',
            'data-wp-context': JSON.stringify({
                uniqueId: props.attributes?.uniqueId,
                ...props.attributes?.['wpbs-grid'],
            })
        });

        const innerBlocksProps = useInnerBlocksProps.save(blockProps);

        return <div {...innerBlocksProps} />;
    }
})


