import "../scss/block.scss";

import {
    useBlockProps,
    InspectorControls, useInnerBlocksProps, PanelColorSettings, DefaultBlockAppender,
} from "@wordpress/block-editor"
import {registerBlockType,} from "@wordpress/blocks"
import metadata from "../block.json"
import {Layout, LayoutAttributes, LayoutClasses} from "Components/Layout"
import {Background, BackgroundSettings, BackgroundAttributes} from "Components/Background";
import {
    __experimentalInputControl as InputControl,
    __experimentalGrid as Grid,
    __experimentalBorderControl as BorderControl,
    SelectControl,
    ToggleControl,
    TabPanel,
    PanelBody,
    __experimentalNumberControl as NumberControl,
    __experimentalUnitControl as UnitControl,
    QueryControls
} from "@wordpress/components";
import {useInstanceId} from "@wordpress/compose";
import React, {useEffect, useState} from "react";
import {useSelect} from "@wordpress/data";


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
        ['wpbs-loop-orderby']: {
            type: 'string'
        },
        ['wpbs-loop-order']: {
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
        ['wpbs-loop-page-size']: {
            type: 'string'
        },
        ['wpbs-loop-max-items']: {
            type: 'string'
        },
        ['wpbs-loop-suppress']: {
            type: 'array'
        }
    },
    edit: (props) => {

        const {attributes, setAttributes, clientId} = props;

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-layout-grid');

        const colors = useSelect('core/block-editor', []).getSettings().colors;

        const [divider, setDivider] = useState(attributes['wpbs-divider']);
        const [columnsMobile, setColumnsMobile] = useState(attributes['wpbs-columns-mobile']);
        const [columnsLarge, setColumnsLarge] = useState(attributes['wpbs-columns-large']);
        const [masonry, setMasonry] = useState(attributes['wpbs-masonry']);
        const [mobile, setMobile] = useState(attributes['wpbs-mobile']);
        const [dividerIcon, setDividerIcon] = useState(attributes['wpbs-divider-icon']);
        const [dividerIconSize, setDividerIconSize] = useState(attributes['wpbs-divider-icon-size']);
        const [dividerIconColor, setDividerIconColor] = useState(attributes['wpbs-divider-icon-color']);
        const [loopPostType, setLoopPostType] = useState(attributes['wpbs-loop-type']);
        const [loopTerm, setLoopTerm] = useState(attributes['wpbs-loop-term']);
        const [loopTaxonomy, setLoopTaxonomy] = useState(attributes['wpbs-loop-taxonomy']);
        const [suppress, setSuppress] = useState(attributes['wpbs-loop-suppress']);
        const [loopPageSize, setLoopPageSize] = useState(attributes['wpbs-loop-page-size']);
        const [loopMaxItems, setLoopMaxItems] = useState(attributes['wpbs-loop-max-items']);
        const [loopOrderBy, setLoopOrderBy] = useState(attributes['wpbs-loop-orderby']);
        const [loopOrder, setLoopOrder] = useState(attributes['wpbs-loop-order']);

        let postTypeOptions = [];
        let taxonomiesOptions = [];
        let termsOptions = [];

        const {postTypes, taxonomies} = useSelect((select) => {
            const {getPostTypes} = select('core');
            const {getTaxonomies} = select('core');

            return {
                postTypes: getPostTypes(),
                taxonomies: getTaxonomies()?.filter(tax => tax.visibility.public),
            }
        },[])

        const {terms} = useSelect((select) => {
            let termsArray = [];

            if (taxonomiesOptions && taxonomies) {

                const {getEntityRecords} = select('core');

                taxonomies.forEach((tax) => {
                    const terms = getEntityRecords('taxonomy', tax.slug, {hide_empty: true});

                    if (terms && terms.length > 0) {
                        termsArray.push({value: '', label: tax.name, disabled: true});

                        terms.forEach((term) => {

                            termsArray.push({value: term.id, label: term.name});
                        });
                    }

                })
            }

            return {
                terms: termsArray,
            }
        }, [taxonomies]);

        if (postTypes) {
            postTypeOptions.push({value: 0, label: 'Select a post type'})
            postTypeOptions.push({value: 'current', label: 'Current'})
            postTypes.forEach((postType) => {
                if (!postType.viewable || ['attachment'].includes(postType.slug)) {
                    return;
                }
                postTypeOptions.push({value: postType.slug, label: postType.name})
            })
        } else {
            postTypeOptions.push({value: 0, label: 'Loading...'})
        }

        if (taxonomies) {
            taxonomiesOptions.push({value: 0, label: 'Select a taxonomy'})
            taxonomies.forEach((tax) => {
                if (!tax.visibility.public) {
                    return;
                }
                taxonomiesOptions.push({value: tax.slug, label: tax.name})
            })
        } else {
            taxonomiesOptions.push({value: 0, label: 'Loading...'})
        }
        if (terms) {
            termsOptions = [
                {value: '', label: 'Select a term'},
                ...terms
            ];
        }

        useEffect(() => {

            setAttributes({
                queryArgs: {
                    'post_type': loopPostType,
                    'term': loopTerm,
                    'taxonomy': loopTaxonomy,
                    'posts_per_page': loopPageSize,
                    'page_size': loopPageSize,
                    'orderby': loopOrderBy,
                    'order': loopOrder
                }
            });

        }, [loopPostType, loopTerm, loopTaxonomy, loopPageSize, loopMaxItems, loopOrderBy, loopOrder]);


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
            <SelectControl
                label={'Post Type'}
                value={loopPostType}
                options={postTypeOptions}
                onChange={(newValue) => {
                    setAttributes({['wpbs-loop-type']: newValue});
                    setLoopPostType(newValue);
                }}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />
            <SelectControl
                label={'Taxonomy'}
                value={loopTaxonomy}
                options={taxonomiesOptions}
                onChange={(newValue) => {
                    setAttributes({['wpbs-loop-taxonomy']: newValue});
                    setLoopTaxonomy(newValue);
                }}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />
            <SelectControl
                label={'Term'}
                value={loopTerm}
                options={termsOptions}
                onChange={(newValue) => {
                    setAttributes({['wpbs-loop-term']: newValue});
                    setLoopTerm(newValue);
                }}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />

            <QueryControls
                onOrderByChange={(newValue) => {
                    setAttributes({['wpbs-loop-orderby']: newValue});
                    setLoopOrderBy(newValue);
                }}
                onOrderChange={(newValue) => {
                    setAttributes({['wpbs-loop-order']: newValue});
                    setLoopOrder(newValue);
                }}
                order={loopOrder}
                orderBy={loopOrderBy}
            />

            <Grid columns={2} columnGap={15} rowGap={20}>

                <NumberControl
                    label={'Max Results'}
                    min={-1}
                    __next40pxDefaultSize
                    isShiftStepEnabled={false}
                    onChange={(newValue) => {
                        setAttributes({['wpbs-loop-max-items']: newValue});
                        setLoopMaxItems(newValue);
                    }}
                    value={loopMaxItems}
                />

                <NumberControl
                    label={'Page Size'}
                    __next40pxDefaultSize
                    min={1}
                    isShiftStepEnabled={false}
                    onChange={(newValue) => {
                        setAttributes({['wpbs-loop-page-size']: newValue});
                        setLoopPageSize(newValue);
                    }}
                    value={loopPageSize}
                />

            </Grid>


        </Grid>;

        const tabs = {
            options: tabOptions,
            loop: tabLoop,
        }

        useEffect(() => {
            setAttributes({
                uniqueId: uniqueId
            });

        }, []);

        useEffect(() => {
            setAttributes({
                ['wpbs-prop-columns']: attributes['wpbs-columns-large'] || 3,
                ['wpbs-prop-columns-mobile']: attributes['wpbs-columns-mobile'] || 1
            });


        }, [columnsLarge, columnsMobile]);


        const blockProps = useBlockProps({
            className: [sectionClassNames(attributes), 'empty:min-h-8'].join(' '),
        });

        const innerBlocksProps = useInnerBlocksProps({
            className: 'wpbs-layout-grid__container',
        }, {
            renderAppender: false
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

                    <DefaultBlockAppender rootClientId={clientId}/>

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


