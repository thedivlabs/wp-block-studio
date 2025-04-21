import "../scss/block.scss";

import {
    useBlockProps,
    useSettings,
    InspectorControls,
    useInnerBlocksProps,
    PanelColorSettings,
    DefaultBlockAppender,
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
    QueryControls, BaseControl, FormTokenField, Spinner, TextControl
} from "@wordpress/components";
import {useInstanceId} from "@wordpress/compose";
import React, {useEffect, useState} from "react";
import {select, useSelect} from "@wordpress/data";
import {store as coreStore} from '@wordpress/core-data';
import Breakpoint from 'Components/Breakpoint';

function sectionClassNames(attributes = {}) {
    return [
        'wpbs-layout-grid',
        !!attributes['wpbs-masonry'] ? 'wpbs-layout-grid--masonry masonry !block' : null,
        'w-full flex relative',
        attributes.uniqueId,
        LayoutClasses(attributes)
    ].filter(x => x).join(' ');
}

function sectionProps(attributes = {}) {

    const {['wpbs-divider']: divider = {}} = attributes;

    const {width, color} = divider;

    return Object.fromEntries(
        Object.entries({
            '--divider-width': width,
            '--divider-color': color,
            '--divider-icon': attributes['wpbs-divider-icon'],
            '--divider-icon-size': attributes['wpbs-divider-icon-size'],
            '--divider-icon-color': attributes['wpbs-divider-icon-color'],
        }).filter(([key, value]) => value)
    );
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
        ['wpbs-columns-small']: {
            type: 'string'
        },
        ['wpbs-columns-large']: {
            type: 'string'
        },
        ['wpbs-breakpoint-small']: {
            type: 'string'
        },
        ['wpbs-breakpoint-large']: {
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
        ['wpbs-pagination']: {
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
        ['wpbs-loop-suppress']: {
            type: 'array'
        },
        ['wpbs-gallery']: {
            type: 'string'
        }
    },
    edit: (props) => {

        const {attributes, setAttributes, clientId} = props;

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-layout-grid');

        const colors = useSelect((select) => {
            return select('core/block-editor').getSettings().colors;
        }, []);

        const [{breakpoints}] = useSettings(['custom']);

        const [divider, setDivider] = useState(attributes['wpbs-divider']);
        const [columnsMobile, setColumnsMobile] = useState(attributes['wpbs-columns-mobile']);
        const [columnsSmall, setColumnsSmall] = useState(attributes['wpbs-columns-small']);
        const [columnsLarge, setColumnsLarge] = useState(attributes['wpbs-columns-large']);
        const [breakpointLarge, setBreakpointLarge] = useState(attributes['wpbs-breakpoint-large']);
        const [breakpointSmall, setBreakpointSmall] = useState(attributes['wpbs-breakpoint-small']);
        const [masonry, setMasonry] = useState(attributes['wpbs-masonry']);
        const [dividerIcon, setDividerIcon] = useState(attributes['wpbs-divider-icon']);
        const [dividerIconSize, setDividerIconSize] = useState(attributes['wpbs-divider-icon-size']);
        const [dividerIconColor, setDividerIconColor] = useState(attributes['wpbs-divider-icon-color']);
        const [loopPostType, setLoopPostType] = useState(attributes['wpbs-loop-type']);
        const [loopTerm, setLoopTerm] = useState(attributes['wpbs-loop-term']);
        const [loopTaxonomy, setLoopTaxonomy] = useState(attributes['wpbs-loop-taxonomy']);
        const [loopPageSize, setLoopPageSize] = useState(attributes['wpbs-loop-page-size']);
        const [loopOrderBy, setLoopOrderBy] = useState(attributes['wpbs-loop-orderby']);
        const [loopOrder, setLoopOrder] = useState(attributes['wpbs-loop-order']);
        const [pagination, setPagination] = useState(attributes['wpbs-pagination']);
        const [paginationLabel, setPaginationLabel] = useState(attributes['wpbs-pagination-label']);
        const [gallery, setGallery] = useState(attributes['wpbs-gallery']);

        let postTypeOptions = [];
        let taxonomiesOptions = [];
        let termsOptions = [];

        const {postTypes, taxonomies} = useSelect((select) => {
            const {getPostTypes} = select(coreStore);
            const {getTaxonomies} = select(coreStore);

            return {
                postTypes: getPostTypes(),
                taxonomies: getTaxonomies()?.filter(tax => tax.visibility.public),
            }
        }, [])

        const {terms} = useSelect((select) => {
            let termsArray = [];

            if (taxonomiesOptions && taxonomies) {

                const {getEntityRecords} = select(coreStore);

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

        const SuppressPostsField = () => {

            // Fetch posts
            const posts = useSelect(
                (select) =>
                    select(coreStore).getEntityRecords('postType', attributes['wpbs-loop-type'] || 'post', {
                        per_page: 100,
                    }),
                [attributes['wpbs-loop-type']]
            );

            if (posts === null || posts === undefined) return <Spinner/>;

            // Suggestions (post titles)
            const suggestions = posts?.map((post) => post.title.rendered);

            // Map selected post titles back to their IDs
            const handleChange = (selectedTitles) => {
                const newIds = selectedTitles
                    .map((title) => {
                        const match = posts.find((post) => post.title.rendered === title);
                        return match?.id;
                    })
                    .filter(Boolean);

                setAttributes({['wpbs-loop-suppress']: newIds});
            };

            // Convert stored IDs to titles for display in the field
            const selectedTitles = (attributes['wpbs-loop-suppress'] || [])
                .map((id) => {
                    const post = posts.find((post) => post.id === id);
                    return post?.title.rendered;
                })
                .filter(Boolean);

            return (
                <FormTokenField
                    __experimentalExpandOnFocus={true}
                    label="Suppress posts from loop"
                    value={selectedTitles}
                    suggestions={suggestions}
                    onChange={handleChange}
                    placeholder="Type post titles…"
                />
            );
        }

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
                    'post_type': attributes['wpbs-loop-type'],
                    'term': attributes['wpbs-loop-term'],
                    'taxonomy': attributes['wpbs-loop-taxonomy'],
                    'posts_per_page': attributes['wpbs-loop-page-size'],
                    'orderby': attributes['wpbs-loop-orderby'],
                    'order': attributes['wpbs-loop-order'],
                    'post__not_in': attributes['wpbs-loop-suppress'],
                }
            });

        }, [attributes['wpbs-loop-suppress'], attributes['wpbs-loop-type'], attributes['wpbs-loop-term'], attributes['wpbs-loop-taxonomy'], attributes['wpbs-loop-page-size'], attributes['wpbs-loop-orderby'], attributes['wpbs-loop-order']]);

        useEffect(() => {
            setAttributes({
                ['wpbs-breakpoints']: {
                    mobile: breakpoints[attributes['wpbs-breakpoint-mobile'] || 'xs'],
                    small: breakpoints[attributes['wpbs-breakpoint-small'] || 'sm'],
                    large: breakpoints[attributes['wpbs-breakpoint-large'] || 'normal'],
                }
            });
        }, [attributes['wpbs-breakpoint-small'], attributes['wpbs-breakpoint-large']]);


        const tabOptions = <Grid columns={1} columnGap={15} rowGap={20}>
            <BaseControl label={'Grid Columns'} __nextHasNoMarginBottom={true}>
                <Grid columns={3} columnGap={15} rowGap={20}>
                    <NumberControl
                        label={'Mobile'}
                        __next40pxDefaultSize
                        isShiftStepEnabled={false}
                        onChange={(newValue) => {
                            setAttributes({['wpbs-columns-mobile']: newValue});
                            setColumnsMobile(newValue);
                        }}
                        value={columnsMobile}
                    />
                    <NumberControl
                        label={'Small'}
                        __next40pxDefaultSize
                        isShiftStepEnabled={false}
                        onChange={(newValue) => {
                            setAttributes({['wpbs-columns-small']: newValue});
                            setColumnsSmall(newValue);
                        }}
                        value={columnsSmall}
                    />
                    <NumberControl
                        label={'Large'}
                        __next40pxDefaultSize
                        isShiftStepEnabled={false}
                        onChange={(newValue) => {
                            setAttributes({['wpbs-columns-large']: newValue});
                            setColumnsLarge(newValue);
                        }}
                        value={columnsLarge}
                    />
                </Grid>
            </BaseControl>

            <Grid columns={2} columnGap={15} rowGap={20}>
                <Breakpoint label={'Breakpoint Small'} defaultValue={breakpointSmall} callback={(newValue) => {
                    setAttributes({
                        ['wpbs-breakpoint-small']: newValue
                    });
                    setBreakpointSmall(newValue);
                }}/>
                <Breakpoint label={'Breakpoint Large'} defaultValue={breakpointLarge} callback={(newValue) => {
                    setAttributes({
                        ['wpbs-breakpoint-large']: newValue,
                        ['wpbs-breakpoint-large-value']: breakpoints[newValue || 'normal'],
                    });
                    setBreakpointLarge(newValue);
                }}/>
            </Grid>
            <Grid columns={2} columnGap={15} rowGap={20} style={{padding: '10px 0'}}>
                <ToggleControl
                    __nextHasNoMarginBottom
                    label="Masonry"
                    checked={!!masonry}
                    onChange={(newValue) => {
                        setAttributes({['wpbs-masonry']: newValue});
                        setMasonry(newValue);
                    }}
                />
            </Grid>
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
            <Grid columns={2} columnGap={15} rowGap={20}>


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
                        label: 'Divider Icon Color',
                        value: dividerIconColor,
                        onChange: (newValue) => {
                            setAttributes({['wpbs-divider-icon-color']: newValue});
                            setDividerIconColor(newValue);
                        },
                        isShownByDefault: true
                    }
                ]}
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
            <Grid columns={1} columnGap={15} rowGap={20}
                  style={(attributes['wpbs-loop-type'] || '') === 'current' ? {
                      opacity: .4,
                      pointerEvents: 'none'
                  } : {}}>

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

                <SuppressPostsField/>

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

                    <TextControl
                        label={'Pagination Label'}
                        __next40pxDefaultSize
                        onChange={(newValue) => {
                            setAttributes({['wpbs-pagination-label']: newValue});
                            setPaginationLabel(newValue);
                        }}
                        value={paginationLabel}
                    />


                </Grid>


            </Grid>
            <Grid columns={2} columnGap={15} rowGap={20} style={{padding: '10px 0'}}>
                <ToggleControl
                    __nextHasNoMarginBottom
                    label="Pagination"
                    checked={!!pagination}
                    onChange={(newValue) => {
                        setAttributes({['wpbs-pagination']: newValue});
                        setPagination(newValue);
                    }}
                />
            </Grid>
        </Grid>;

        const tabGallery = <Grid columns={1} columnGap={15} rowGap={20}>
            <></>
        </Grid>;

        const tabs = {
            options: tabOptions,
            loop: tabLoop,
            gallery: tabGallery
        }

        useEffect(() => {
            setAttributes({
                uniqueId: uniqueId,
            });

        }, []);

        const blockProps = useBlockProps({
            className: [sectionClassNames(attributes), 'empty:min-h-8'].join(' '),
            style: {
                ...props.style,
                ...sectionProps(attributes)
            }
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


                    <BackgroundSettings attributes={attributes || {}}
                                        pushSettings={setAttributes}></BackgroundSettings>


                </InspectorControls>

                <Layout blockProps={blockProps} attributes={attributes} setAttributes={setAttributes}
                        clientId={clientId}></Layout>

                <div {...blockProps}>
                    <div {...useInnerBlocksProps({
                        className: 'wpbs-layout-grid__container relative z-20',
                    }, {})} />
                    <Background attributes={attributes} editor={true}/>
                    <DefaultBlockAppender rootClientId={clientId}/>
                </div>
            </>
        )
    },
    save: (props) => {

        const {'wpbs-pagination': pagination, 'wpbs-loop-type': loopType} = props.attributes;

        const blockProps = useBlockProps.save({
            className: sectionClassNames(props.attributes),
            'data-wp-interactive': 'wpbs/grid',
            'data-wp-init': 'actions.init',
            'data-wp-context': JSON.stringify({
                uniqueId: props.attributes.uniqueId,
                divider: !!props.attributes['wpbs-divider'],
                breakpoints: props.attributes['wpbs-breakpoints'],
                columns: {
                    mobile: props.attributes['wpbs-columns-mobile'] || 1,
                    small: props.attributes['wpbs-columns-small'] || 2,
                    large: props.attributes['wpbs-columns-large'] || 3,
                }
            }),
            style: {
                ...props.style,
                ...sectionProps(props.attributes)
            }
        });

        const innerBlockProps = useInnerBlocksProps.save({
            className: 'wpbs-layout-grid__container relative z-20',
        }, {});

        const GutterSizer = () => {
            if (!!props.attributes['wpbs-masonry']) {
                return <span class="gutter-sizer"
                             style="width:var(--row-gap, var(--column-gap, 0px))"></span>;
            } else {
                return <></>;
            }
        }

        const PaginationButton = () => {
            if (!!pagination && loopType !== 'current') {
                return <button type="button" class="w-full h-10 relative"
                               data-wp-on-async--click="actions.pagination">
                    {props.attributes['wpbs-pagination-label'] || 'Show More'}
                </button>;
            } else {
                return <></>;
            }
        }

        return (
            <div {...blockProps}>
                <div {...innerBlockProps} >
                    {innerBlockProps.children}
                    <GutterSizer/>
                </div>
                <PaginationButton/>
                <Background attributes={props.attributes} editor={false}/>
            </div>
        );
    }
})


