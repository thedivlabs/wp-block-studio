import "../scss/block.scss";

import {
    DefaultBlockAppender,
    InspectorControls,
    PanelColorSettings,
    useBlockProps,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType,} from "@wordpress/blocks"
import metadata from "../block.json"
import {layoutAttributes, LayoutControls} from "Components/Layout"
import {backgroundAttributes, BackgroundControls, BackgroundElement} from "Components/Background"
import {Style} from "Components/Style"
import {
    __experimentalBorderControl as BorderControl,
    __experimentalGrid as Grid,
    __experimentalInputControl as InputControl,
    __experimentalNumberControl as NumberControl,
    __experimentalUnitControl as UnitControl,
    BaseControl,
    FormTokenField,
    PanelBody,
    QueryControls,
    SelectControl,
    Spinner,
    TabPanel,
    TextControl,
    ToggleControl
} from "@wordpress/components";
import {useInstanceId} from "@wordpress/compose";
import React, {useEffect, useState} from "react";
import Breakpoint from 'Components/Breakpoint';
import {useSelect} from "@wordpress/data";
import {store as coreStore} from "@wordpress/core-data";

function sectionClassNames(attributes = {}) {
    return [
        'wpbs-layout-grid',
        !!attributes['wpbs-masonry'] ? 'wpbs-layout-grid--masonry masonry !block' : null,
        'w-full flex relative',
        attributes.uniqueId,
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
        ...layoutAttributes,
        ...backgroundAttributes,
        ['wpbs-prop-columns-mobile']: {
            type: 'string'
        },
        ['wpbs-prop-columns-small']: {
            type: 'string'
        },
        ['wpbs-prop-columns-large']: {
            type: 'string'
        },
        ['wpbs-breakpoint-small']: {
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
    },
    edit: (props) => {

        const {attributes, setAttributes, clientId} = props;

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-layout-grid');

        const [divider, setDivider] = useState(attributes['wpbs-divider']);
        const [columnsMobile, setColumnsMobile] = useState(attributes['wpbs-prop-columns-mobile']);
        const [columnsSmall, setColumnsSmall] = useState(attributes['wpbs-prop-columns-small']);
        const [columnsLarge, setColumnsLarge] = useState(attributes['wpbs-prop-columns-large']);
        const [masonry, setMasonry] = useState(attributes['wpbs-masonry']);
        const [dividerIcon, setDividerIcon] = useState(attributes['wpbs-divider-icon']);
        const [dividerIconSize, setDividerIconSize] = useState(attributes['wpbs-divider-icon-size']);
        const [dividerIconColor, setDividerIconColor] = useState(attributes['wpbs-divider-icon-color']);
        const [breakpointSmall, setBreakpointSmall] = useState(attributes['wpbs-breakpoint-small']);
        const [queryArgs, setQueryArgs] = useState(attributes['queryArgs'] || {});

        const [currentTab, setCurrentTab] = useState('options');

        const [gallery, setGallery] = useState(attributes['wpbs-gallery']);

        const [loop, setLoop] = useState({
            postTypes: [],
            taxonomies: [],
            terms: [],
        });

        useSelect((select) => {

            if (currentTab !== 'loop') {
                return;
            }

            let result = {};

            if (!loop.postTypes.length) {

                console.log(!loop.postTypes.length);

                const {getPostTypes} = select(coreStore);
                const {getTaxonomies} = select(coreStore);

                result.postTypes = getPostTypes();
                result.taxonomies = getTaxonomies()?.filter(tax => tax.visibility.public);

            }

            if (!loop.terms.length && !!queryArgs?.taxonomy) {

                const {getEntityRecords} = select(coreStore);

                result.terms = getEntityRecords('taxonomy', queryArgs.taxonomy, {
                    hide_empty: true,
                    per_page: -1
                });

            } else {
                result.terms = [];
            }

            setLoop({
                ...loop,
                ...result
            });

        }, [currentTab, queryArgs]);

        /* useSelect((select) => {

                 if (currentTab !== 'loop' || !queryArgs?.length) {
                     return {suppressPosts: []};
                 }

                 return {
                     suppressPosts: select(coreStore).getEntityRecords('postType', queryArgs?.post_type ?? 'post', {
                         ...queryArgs,
                         per_page: 100,
                     })
                 }

             },
             [queryArgs]
         );*/

        useEffect(() => {
            setAttributes({
                'uniqueId': uniqueId
            });
        }, []);

        useEffect(() => {
            setAttributes({
                'wpbs-prop-row-gap': attributes?.style?.spacing?.blockGap?.top ?? null,
                'wpbs-prop-row-gap-mobile': attributes['wpbs-layout']['gap-mobile']?.top ?? null,
                'wpbs-prop-column-gap': attributes?.style?.spacing?.blockGap?.left ?? null,
                'wpbs-prop-column-gap-mobile': attributes['wpbs-layout']['gap-mobile']?.left ?? null,
            });
        }, [
            attributes?.style?.spacing,
            attributes?.['wpbs-layout']?.['gap-mobile']
        ]);

        function updateLoopSettings(newValue) {

            const result = Object.fromEntries(
                Object.entries({
                    ...queryArgs,
                    ...newValue
                }).filter(([_, value]) => ![null, 0, '0', false, undefined].includes(value))
            );

            setAttributes({queryArgs: result});
            setQueryArgs(result);

        }

        const tabOptions = <Grid columns={1} columnGap={15} rowGap={20}>
            <BaseControl label={'Grid Columns'} __nextHasNoMarginBottom={true}>
                <Grid columns={3} columnGap={15} rowGap={20}>
                    <NumberControl
                        label={'Mobile'}
                        __next40pxDefaultSize
                        isShiftStepEnabled={false}
                        onChange={(newValue) => {
                            setAttributes({['wpbs-prop-columns-mobile']: newValue});
                            setColumnsMobile(newValue);
                        }}
                        value={columnsMobile}
                    />
                    <NumberControl
                        label={'Small'}
                        __next40pxDefaultSize
                        isShiftStepEnabled={false}
                        onChange={(newValue) => {
                            setAttributes({['wpbs-prop-columns-small']: newValue});
                            setColumnsSmall(newValue);
                        }}
                        value={columnsSmall}
                    />
                    <NumberControl
                        label={'Large'}
                        __next40pxDefaultSize
                        isShiftStepEnabled={false}
                        onChange={(newValue) => {
                            setAttributes({['wpbs-prop-columns-large']: newValue});
                            setColumnsLarge(newValue);
                        }}
                        value={columnsLarge}
                    />
                </Grid>
            </BaseControl>
            <Breakpoint defaultValue={breakpointSmall}
                        callback={(newValue) => {
                            setAttributes({['wpbs-breakpoint-small']: newValue});
                            setBreakpointSmall(newValue);
                        }}/>
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
                colors={WPBS?.settings?.colors ?? []}
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

        const tabLoop = () => {

            const SuppressPostsField = () => {


                /*   if (!suppressPosts?.length) {
                       return <Spinner/>;
                   }*/

                let posts = [];

                // Suggestions (post titles)
                const suggestions = !posts.length ? [] : posts.map((post) => post.title.rendered);

                // Map selected post titles back to their IDs
                const handleChange = (selectedTitles) => {
                    posts = selectedTitles
                        .map((title) => {
                            const match = posts.find((post) => post.title.rendered === title);
                            return match?.id;
                        })
                        .filter(Boolean);
                };

                // Convert stored IDs to titles for display in the field
                const selectedTitles = posts.map((id) => {
                    const post = posts.find((post) => post.id === id);
                    return post?.title.rendered;
                }).filter(Boolean);

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

            const postTypeOptions = () => {
                return [
                    {value: 0, label: 'Select a post type'},
                    {value: 'current', label: 'Current'},
                    ...(loop?.postTypes ?? []).map((postType) => {
                        return {value: postType.slug, label: postType.name};
                    })
                ];
            }

            const taxonomyOptions = () => {
                return [
                    {value: 0, label: 'Select a taxonomy'},
                    ...(loop?.taxonomies ?? []).map((tax) => {
                        return {value: tax.slug, label: tax.name};
                    })
                ];
            }

            const termOptions = () => {
                return [
                    {value: '', label: 'Select a term'},
                    ...(loop?.terms ?? []).map((term) => {
                        return {value: term.id, label: term.name};
                    })
                ];
            }

            return <Grid columns={1} columnGap={15} rowGap={20}>
                <SelectControl
                    label={'Post Type'}
                    value={queryArgs?.post_type}
                    options={postTypeOptions()}
                    onChange={(newValue) => {
                        updateLoopSettings({post_type: newValue});
                    }}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
                <Grid columns={1} columnGap={15} rowGap={20}
                      style={queryArgs?.post_type === 'current' ? {
                          opacity: .4,
                          pointerEvents: 'none'
                      } : {}}>

                    <SelectControl
                        label={'Taxonomy'}
                        value={queryArgs?.taxonomy}
                        options={taxonomyOptions()}
                        onChange={(newValue) => {
                            updateLoopSettings({
                                taxonomy: newValue,
                                terms: []
                            });
                        }}
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                    <SelectControl
                        label={'Term'}
                        value={queryArgs?.term}
                        options={termOptions()}
                        onChange={(newValue) => {
                            updateLoopSettings({term: newValue});
                        }}
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />

                    <SuppressPostsField/>

                    <QueryControls
                        onOrderByChange={(newValue) => {
                            updateLoopSettings({orderby: newValue});
                        }}
                        onOrderChange={(newValue) => {
                            updateLoopSettings({order: newValue});
                        }}
                        order={queryArgs?.order}
                        orderBy={queryArgs?.orderby}
                    />

                    <Grid columns={2} columnGap={15} rowGap={20}>

                        <NumberControl
                            label={'Page Size'}
                            __next40pxDefaultSize
                            min={1}
                            isShiftStepEnabled={false}
                            onChange={(newValue) => {
                                updateLoopSettings({posts_per_page: newValue});
                            }}
                            value={queryArgs?.posts_per_page}
                        />

                        <TextControl
                            label={'Pagination Label'}
                            __next40pxDefaultSize
                            onChange={(newValue) => {
                                updateLoopSettings({pagination_label: newValue});
                            }}
                            value={queryArgs?.pagination_label}
                        />


                    </Grid>


                </Grid>
                <Grid columns={2} columnGap={15} rowGap={20} style={{padding: '10px 0'}}>
                    <ToggleControl
                        __nextHasNoMarginBottom
                        label="Pagination"
                        checked={!!queryArgs?.pagination}
                        onChange={(newValue) => {
                            updateLoopSettings({pagination: newValue});
                        }}
                    />
                </Grid>
            </Grid>;
        };

        const tabGallery = <Grid columns={1} columnGap={15} rowGap={20}>
            <></>
        </Grid>;

        const tabs = {
            options: tabOptions,
            loop: tabLoop(),
            gallery: tabGallery
        }

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
                            onSelect={(tabName) => {
                                if (tabName === 'loop') {
                                    setCurrentTab(tabName);
                                }
                            }}
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
                <BackgroundControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}/>


                <div {...blockProps}>
                    <div {...useInnerBlocksProps({
                        className: 'wpbs-layout-grid__container relative z-20',
                    }, {})} />
                    <DefaultBlockAppender rootClientId={clientId}/>
                    <BackgroundElement attributes={props.attributes} editor={false}/>
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
                    mobile: props.attributes['wpbs-prop-columns-mobile'] || 1,
                    small: props.attributes['wpbs-prop-columns-small'] || 2,
                    large: props.attributes['wpbs-prop-columns-large'] || 3,
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
                <BackgroundElement attributes={props.attributes} editor={false}/>
            </div>
        );
    }
})


