import "../scss/block.scss";

import {
    useBlockProps,
    InspectorControls,
    InnerBlocks, useInnerBlocksProps, MediaUploadCheck, MediaUpload, PanelColorSettings,
} from "@wordpress/block-editor"
import {registerBlockType, cloneBlock, createBlock} from "@wordpress/blocks"
import metadata from "../block.json"
import {Layout, LayoutAttributes, LayoutClasses} from "Components/Layout"
import {Background, BackgroundSettings, BackgroundAttributes} from "Components/Background";
import ServerSideRender from "@wordpress/server-side-render";
import {
    __experimentalInputControl as InputControl,
    __experimentalGrid as Grid,
    __experimentalBorderControl as BorderControl,
    SelectControl,
    BaseControl,
    ToggleControl,
    TabPanel,
    PanelBody,
    __experimentalNumberControl as NumberControl,
    __experimentalUnitControl as UnitControl,
    RangeControl,
    GradientPicker,
    QueryControls, FormTokenField, ComboboxControl
} from "@wordpress/components";
import {useInstanceId} from "@wordpress/compose";
import React, {useEffect, useState} from "react";
import {dispatch, useSelect} from "@wordpress/data";
import {ElementTagSettings} from "Components/ElementTag.js";
import PreviewThumbnail from "Components/PreviewThumbnail.js";


function sectionClassNames(attributes = {}) {

    return [
        'wpbs-layout-grid w-full flex relative',
        attributes.uniqueId,
        LayoutClasses(attributes)
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LayoutAttributes,
        ...BackgroundAttributes,
        ['wpbs-columns-mobile']: {
            type: 'string'
        },
        ['wpbs-columns-large']: {
            type: 'string'
        },
        ['wpbs-prop-columns']: {
            type: 'string'
        },
        ['wpbs-prop-columns-mobile']: {
            type: 'string'
        },
        ['wpbs-masonry']: {
            type: 'boolean'
        },
        ['wpbs-divider']: {
            type: 'object'
        },
        ['wpbs-divider-icon']: {
            type: 'string'
        },
        ['wpbs-divider-icon-size']: {
            type: 'string'
        },
        ['wpbs-divider-icon-color']: {
            type: 'string'
        },
        ['wpbs-mobile']: {
            type: 'boolean'
        },
        ['wpbs-pagination-size']: {
            type: 'string'
        },
        ['wpbs-pagination-label']: {
            type: 'string'
        },
        ['wpbs-loop-type']: {
            type: 'string'
        },
        ['wpbs-loop-term']: {
            type: 'string'
        },
        ['wpbs-loop-taxonomy']: {
            type: 'string'
        },
        ['wpbs-loop-current']: {
            type: 'boolean'
        },
        ['wpbs-loop-suppress']: {
            type: 'string'
        }
    },
    edit: (props) => {

        const {attributes, setAttributes, clientId} = props;

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-layout-grid');

        const queryArgs = {
            per_page: 8,
        };

        let loopOptions = {
            type: []
        }

        const colors = useSelect('core/block-editor', []).getSettings().colors;

        const [divider, setDivider] = useState(attributes['wpbs-divider']);
        const [columnsMobile, setColumnsMobile] = useState(attributes['wpbs-columns-mobile']);
        const [columnsLarge, setColumnsLarge] = useState(attributes['wpbs-columns-large']);
        const [masonry, setMasonry] = useState(attributes['wpbs-masonry']);
        const [mobile, setMobile] = useState(attributes['wpbs-mobile']);
        const [dividerIcon, setDividerIcon] = useState(attributes['wpbs-divider-icon']);
        const [dividerIconSize, setDividerIconSize] = useState(attributes['wpbs-divider-icon-size']);
        const [dividerIconColor, setDividerIconColor] = useState(attributes['wpbs-divider-icon-color']);
        const [loopType, setLoopType] = useState(attributes['wpbs-loop-type']);
        const [term, setTerm] = useState(attributes['wpbs-loop-term']);
        const [taxonomy, setTaxonomy] = useState(attributes['wpbs-loop-taxonomy']);
        const [suppress, setSuppress] = useState(attributes['wpbs-loop-suppress']);

        const tabOptions = <Grid columns={1} columnGap={15} rowGap={20}>
            <Grid columns={2} columnGap={15} rowGap={20}>
                <NumberControl
                    label={'Columns Mobile'}
                    __next40pxDefaultSize
                    isShiftStepEnabled={false}
                    onChange={(newValue) => {
                        setAttributes({['wpbs-columns-mobile']: newValue});
                        setColumnsMobile(newValue);
                    }}
                    value={columnsMobile}
                />
                <NumberControl
                    label={'Columns Large'}
                    __next40pxDefaultSize
                    isShiftStepEnabled={false}
                    onChange={(newValue) => {
                        setAttributes({['wpbs-columns-large']: newValue});
                        setColumnsLarge(newValue);
                    }}
                    value={columnsLarge}
                />
            </Grid>
            <Grid columns={2} columnGap={15} rowGap={20} style={{paddingTop: '15px'}}>
                <ToggleControl
                    __nextHasNoMarginBottom
                    label="Masonry"
                    checked={!!masonry}
                    onChange={(newValue) => {
                        setAttributes({['wpbs-masonry']: newValue});
                        setMasonry(newValue);
                    }}
                />
                <ToggleControl
                    __nextHasNoMarginBottom
                    label="Mobile"
                    checked={!!mobile}
                    onChange={(newValue) => {
                        setAttributes({['wpbs-mobile']: newValue});
                        setMobile(newValue);
                    }}
                />
                <InputControl
                    label={'Divider Icon'}
                    __next40pxDefaultSize
                    value={dividerIcon}
                    onChange={(newValue) => {
                        setAttributes({['wpbs-divider-icon']: newValue});
                        setDividerIcon(newValue);
                    }}
                />
                <UnitControl
                    label={'Icon Size'}
                    value={dividerIconSize}
                    isResetValueOnUnitChange={true}
                    onChange={(newValue) => {
                        setAttributes({['wpbs-divider-icon-size']: newValue});
                        setDividerIconSize(newValue);
                    }}
                    units={[
                        {value: 'px', label: 'px', default: 0},
                        {value: 'em', label: 'em', default: 0},
                        {value: 'rem', label: 'rem', default: 0},
                        {value: 'vw', label: 'vw', default: 0},
                    ]}
                    __next40pxDefaultSize
                />
            </Grid>
            <PanelColorSettings
                enableAlpha
                className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                colorSettings={[
                    {
                        slug: 'icon-color',
                        label: 'Icon Color',
                        value: dividerIconColor,
                        onChange: (newValue) => {
                            setAttributes({['wpbs-divider-icon-color']: newValue});
                            setDividerIconColor(newValue);
                        },
                        isShownByDefault: true
                    }
                ]}
            />
            <BorderControl
                __next40pxDefaultSize
                enableAlpha
                enableStyle
                disableUnits
                value={divider}
                colors={colors}
                __experimentalIsRenderedInSidebar={true}
                label="Divider"
                onChange={(newValue) => {
                    setAttributes({['wpbs-divider']: newValue});
                    setDivider(newValue);
                }}
                shouldSanitizeBorder
            />
        </Grid>;
        const tabLoop = <Grid columns={1} columnGap={15} rowGap={20}>
            <QueryControls
                onNumberOfItemsChange={() => {
                }}
                onOrderByChange={() => {
                }}
                onOrderChange={() => {
                }}
                order="desc"
                orderBy="date"
                numberOfItems={8}
                maxItems={100}
                minItems={-1}
            />
            {/*<ComboboxControl
                __next40pxDefaultSize
                __nextHasNoMarginBottom
                label="Select a country"
                onChange={() => {
                }}
                onFilterValueChange={() => {
                }}
                options={loopOptions.type}
                value={loopType}
            />*/}
            <SelectControl
                label={'Term'}
                value={term}
                options={[
                    {label: 'Default', value: ''},
                ]}
                onChange={(newValue) => {
                    setAttributes({['wpbs-loop-term']: newValue});
                    setTerm(newValue);
                }}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />
            <SelectControl
                label={'Taxonomy'}
                value={taxonomy}
                options={[
                    {label: 'Default', value: ''},
                ]}
                onChange={(newValue) => {
                    setAttributes({['wpbs-loop-taxonomy']: newValue});
                    setTaxonomy(newValue);
                }}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />
            <SelectControl
                label={'Suppress'}
                value={suppress}
                options={[
                    {label: 'Default', value: ''},
                ]}
                onChange={(newValue) => {
                    setAttributes({['wpbs-loop-suppress']: newValue});
                    setSuppress(newValue);
                }}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />


        </Grid>;

        const tabs = {
            options: tabOptions,
            loop: tabLoop,
        }

        loopOptions.type = useSelect((select) => select('core').getEntityRecords('postType').map((postTypeObject) => {
            return {
                value: postTypeObject.name,
                label: postTypeObject.label
            }
        }),[]);


        /*const posts = useSelect((select) =>
            select('core').getEntityRecords('postType', 'post', queryArgs));*/

        useEffect(() => {
            setAttributes({
                uniqueId: uniqueId,
                queryArgs: queryArgs,
                ['wpbs-prop-columns']: attributes['wpbs-columns-large'] || 3,
                ['wpbs-prop-columns-mobile']: attributes['wpbs-columns-mobile'] || 1
            });
        }, []);


        /*const hasInnerBlocks = useSelect((select) =>
            select('core/block-editor').getBlock(clientId)?.innerBlocks.length > 0
        );*/

        //const havePosts = posts && posts.length > 0;

        /*useEffect(() => {
            if (!posts) {
                return;
            }

            const cardBlocks = posts.map((post) => {
                return createBlock('wpbs/layout-grid-card', {
                    postId: post.id,
                    postType: post.type,
                }, [
                    createBlock('core/post-title', {}),
                ]);
            });

            dispatch('core/block-editor').replaceInnerBlocks(clientId, cardBlocks);

        }, [havePosts]);*/


        const blockProps = useBlockProps({
            className: [sectionClassNames(attributes), 'empty:min-h-8'].join(' '),
        });

        const innerBlocksProps = useInnerBlocksProps({
            className: 'wpbs-layout-grid__container'
        }, {});


        /* const appenderToUse = () => {
             if (!hasInnerBlocks) {
                 return (
                     <InnerBlocks.DefaultBlockAppender/>
                 );
             } else {
                 return false;
             }
         }*/

        /*  innerBlocks = [...innerBlocks].map((block) => {
              //console.log(block);
              //const wrapperBlock =

          });*/


        //console.log(innerBlocks);


        /*if (!posts) return <p>Loading...</p>;
        if (posts.length === 0) return <p>No posts found.</p>;*/
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
                                    className: 'tab-loop',
                                },
                            ]}>
                            {
                                (tab) => (<>{tabs[tab.name]}</>)
                            }
                        </TabPanel>

                    </PanelBody>


                    <BackgroundSettings attributes={attributes || {}}
                                        pushSettings={setAttributes}></BackgroundSettings>


                </InspectorControls>

                <Layout blockProps={blockProps} attributes={attributes} setAttributes={setAttributes}
                        clientId={clientId}></Layout>

                <div {...blockProps}>


                    <div {...innerBlocksProps}/>

                    <Background attributes={attributes} editor={true}/>

                </div>
            </>
        )
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: sectionClassNames(props.attributes),
            'data-wp-interactive': 'wpbs/grid',
            'data-wp-init': 'callbacks.runQuery',
            'data-wp-context': JSON.stringify({queryArgs: props.attributes.queryArgs || {}}),
        });

        const innerBlocksProps = useInnerBlocksProps.save({
            className: 'wpbs-layout-grid__container',
        }, {});

        return (
            <div {...blockProps}>

                <div {...innerBlocksProps}/>

                <Background attributes={props.attributes} editor={false}/>
            </div>
        );
    }
})


