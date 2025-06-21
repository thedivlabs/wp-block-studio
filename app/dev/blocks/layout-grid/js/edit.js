import "../scss/block.scss";

import {
    BlockContextProvider, InnerBlocks,
    InspectorControls,
    useBlockProps,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType,} from "@wordpress/blocks"
import metadata from "../block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {BACKGROUND_ATTRIBUTES, BackgroundControls, BackgroundElement} from "Components/Background"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import {GridControls} from "Includes/helper"
import Loop from "Components/Loop"
import {
    PanelBody,
    TabPanel,
} from "@wordpress/components";
import {useInstanceId} from "@wordpress/compose";
import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";


function classNames(attributes = {}) {

    return [
        'wpbs-layout-grid',
        !!attributes?.['wpbs-grid']?.masonry ? 'wpbs-layout-grid--masonry masonry !block' : null,
        'w-full flex relative',
        !!attributes['wpbs-query']?.pagination ? 'wpbs-layout-grid--pagination' : null,
        'wpbs-container',
        (attributes?.className ?? []).includes('is-style-gallery') ? 'lightbox-gallery' : null,
        attributes.uniqueId,
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...BACKGROUND_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-grid': {
            type: 'object',
            default: {
                'columns-mobile': undefined,
                'columns-small': undefined,
                'columns-large': undefined,
                'breakpoint-small': undefined,
                'masonry': undefined,
                'gallery': {},
                'divider': {},
                'divider-icon': undefined,
                'divider-icon-size': undefined,
                'divider-icon-color': undefined,
                'pagination': undefined,
                'pagination-size': undefined,
                'pagination-label': undefined,
            }
        }
    },
    edit: (props) => {

        const {attributes, setAttributes, clientId} = props;
        const [grid, setGrid] = useState(attributes['wpbs-grid'] || {});

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-layout-grid');

        const cardClass = 'layout-grid-card';

        useEffect(() => {
            setAttributes({
                'uniqueId': uniqueId,
                cardClass: cardClass
            });
        }, [uniqueId]);

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...grid,
                ...newValue
            };

            setAttributes({
                'wpbs-grid': result,
                cardClass: cardClass
            });
            setGrid(result);

        }, [setAttributes, setGrid, grid])

        const cssProps = useMemo(() => {
            const grid = attributes['wpbs-grid'] ?? {};
            const layout = attributes['wpbs-layout'] ?? {};
            const spacing = attributes?.style?.spacing?.blockGap ?? {};

            return {
                '--grid-row-gap': spacing.top,
                '--grid-col-gap': spacing.left,
                '--columns': grid['columns-mobile'],
                '--divider-width': grid.divider?.width,
                '--divider-color': grid.divider?.color,
                '--divider-icon': grid?.['divider-icon'],
                '--divider-icon-size': grid?.['divider-icon-size'],
                '--divider-icon-color': grid?.['divider-icon-color'],
                breakpoints: {
                    [[grid?.['breakpoint-small'] ?? 'sm']]: {
                        '--columns': grid['columns-small']
                    },
                    [[grid?.['breakpoint-large'] ?? layout.breakpoint ?? 'normal']]: {
                        '--columns': grid['columns-large'],
                        '--grid-row-gap': layout?.['gap-mobile']?.top,
                        '--grid-col-gap': layout?.['gap-mobile']?.left,
                    }
                }
            };
        }, [attributes['wpbs-grid']]);

        const tabOptions = useMemo(() => {
            return <GridControls grid={grid} callback={updateSettings}/>;
        }, [grid, updateSettings]);

        const tabLoop = useMemo(() => {
            return <Loop attributes={attributes} setAttributes={setAttributes}/>
        }, [grid])

        const tabs = {
            options: tabOptions,
            loop: tabLoop,
        }

        const blockProps = useBlockProps({
            className: [classNames(attributes), 'empty:min-h-8'].join(' ')
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
                <Style attributes={attributes} setAttributes={setAttributes}
                       deps={['wpbs-grid']}
                       props={cssProps}
                />

                <BlockContextProvider
                    value={{
                        cardClass,
                    }}
                >
                    <div {...blockProps}>
                        <div {...innerBlocksProps} />
                        <BackgroundElement attributes={props.attributes} editor={true}/>
                    </div>
                </BlockContextProvider>


            </>
        )
    },
    save: (props) => {

        return <><InnerBlocks.Content/><BackgroundElement attributes={props.attributes} editor={false}/></>
    }
})


