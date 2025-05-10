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
        'wpbs-grid': {
            type: 'object',
            default: {
                'columns-mobile': undefined,
                'columns-small': undefined,
                'columns-large': undefined,
                'breakpoint-small': undefined,
                'masonry': undefined,
                'gallery': undefined,
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
        const uniqueId = useInstanceId(registerBlockType, 'wpbs-layout-grid');
        const [queryArgs, setQueryArgs] = useState(attributes['queryArgs'] || {});
        const [grid, setGrid] = useState(attributes['wpbs-grid'] || {});
        const [currentTab, setCurrentTab] = useState('options');
        const [gallery, setGallery] = useState(attributes['wpbs-gallery']);
        const [loop, setLoop] = useState({
            postTypes: [],
            taxonomies: [],
            terms: [],
            suppressPosts: [],
        });

        useSelect((select) => {

            if (currentTab !== 'loop') {
                return;
            }

            let result = {};

            const {getPostTypes} = select(coreStore);
            const {getTaxonomies} = select(coreStore);
            const {getEntityRecords} = select(coreStore);

            if (!loop.postTypes.length) {

                result.postTypes = getPostTypes()?.filter((type) => {
                    return !!type.viewable && !['attachment'].includes(type.slug);
                });
                result.taxonomies = getTaxonomies()?.filter(tax => tax.visibility.public);

            }

            if (!loop.terms?.length && !!queryArgs?.taxonomy) {

                result.terms = getEntityRecords('taxonomy', queryArgs.taxonomy, {
                    hide_empty: true,
                    per_page: -1
                });

            }


            if (!!queryArgs.post_type && !loop.suppressPosts?.length) {

                result.suppressPosts = getEntityRecords('postType', queryArgs.post_type, {
                    per_page: -1,
                    order: 'asc',
                    orderby: 'title',
                });

                console.log(result);
            }


            setLoop({
                ...loop,
                ...result
            });

        }, [currentTab, queryArgs]);

        useEffect(() => {
            setAttributes({
                'uniqueId': uniqueId
            });
        }, []);


        function updateGridSettings(newValue) {

            const result = {
                ...grid,
                ...newValue
            };

            setAttributes({'wpbs-grid': result});
            setGrid(result);

        }

        function updateLoopSettings(newValue) {

            const result = {
                ...queryArgs,
                ...newValue
            };

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
                            updateGridSettings({'columns-mobile': newValue});
                            setAttributes({
                                ...attributes.props,
                                'columns-mobile': newValue
                            });
                        }}
                        value={props['columns-mobile']}
                    />
                    <NumberControl
                        label={'Small'}
                        __next40pxDefaultSize
                        isShiftStepEnabled={false}
                        onChange={(newValue) => {
                            updateGridSettings({'columns-small': newValue});
                            setAttributes({
                                ...attributes.props,
                                'columns-small': newValue
                            });
                        }}
                        value={props['columns-small']}
                    />
                    <NumberControl
                        label={'Large'}
                        __next40pxDefaultSize
                        isShiftStepEnabled={false}
                        onChange={(newValue) => {
                            updateGridSettings({'columns-large': newValue});
                            setAttributes({
                                ...attributes.props,
                                'columns-large': newValue
                            });
                        }}
                        value={props['columns-large']}
                    />
                </Grid>
            </BaseControl>
            <Breakpoint defaultValue={attributes['wpbs-grid']['breakpoint-small']}
                        callback={(newValue) => {
                            updateGridSettings({'breakpoint-small': newValue});
                        }}/>
            <Grid columns={2} columnGap={15} rowGap={20} style={{padding: '10px 0'}}>
                <ToggleControl
                    __nextHasNoMarginBottom
                    label="Masonry"
                    checked={!!grid['masonry']}
                    onChange={(newValue) => {
                        updateGridSettings({'masonry': newValue});
                    }}
                />
            </Grid>
            <BorderControl
                __next40pxDefaultSize
                enableAlpha
                enableStyle
                disableUnits
                value={grid['divider'] || {}}
                colors={WPBS?.settings?.colors ?? []}
                __experimentalIsRenderedInSidebar={true}
                label="Divider"
                onChange={(newValue) => {
                    updateGridSettings({'divider': newValue})
                }}
                shouldSanitizeBorder
            />
            <Grid columns={2} columnGap={15} rowGap={20}>

                <InputControl
                    label={'Divider Icon'}
                    __next40pxDefaultSize
                    value={grid['divider-icon']}
                    onChange={(newValue) => {
                        updateGridSettings({'divider-icon': newValue})
                    }}
                />
                <UnitControl
                    label={'Icon Size'}
                    value={grid['divider-icon-size']}
                    isResetValueOnUnitChange={true}
                    onChange={(newValue) => {
                        updateGridSettings({'divider-icon-size': newValue})
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
                        value: grid['divider-icon-color'],
                        onChange: (newValue) => {
                            updateGridSettings({'divider-icon-color': newValue})
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

                let posts = loop?.suppressPosts ?? [];

                // Suggestions (post titles)
                const suggestions = !posts.length ? [] : posts.map((post) => post.title.rendered);

                // Map selected post titles back to their IDs
                const handleChange = (selectedTitles) => {

                    const post_ids = selectedTitles
                        .map((title) => {
                            const match = posts.find((post) => post.title.rendered === title);
                            return match?.id;
                        })
                        .filter(Boolean);

                    updateLoopSettings({post__not_in: post_ids});

                };

                // Convert stored IDs to titles for display in the field
                const selectedTitles = (queryArgs?.post__not_in ?? []).map((id) => {
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
                        updateLoopSettings({
                            post_type: newValue,
                            post__not_in: [],
                            term: undefined,
                        });

                        setLoop({
                            ...loop,
                            terms: [],
                            suppressPosts: [],
                        });
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
                                term: undefined,
                            });

                            setLoop({
                                ...loop,
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
                            updateLoopSettings({
                                term: newValue,
                            });
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

        const blockProps = useBlockProps.save({
            className: sectionClassNames(props.attributes),
            'data-wp-interactive': 'wpbs/grid',
            'data-wp-init': 'actions.init',
            'data-wp-context': JSON.stringify({
                uniqueId: props.attributes.uniqueId,
                divider: !!props.attributes['wpbs-grid']?.['divider'],
                breakpoints: props.attributes['wpbs-grid']?.['breakpoints'],
                columns: {
                    mobile: props.attributes['wpbs-props']?.['columns-mobile'] ?? 1,
                    small: props.attributes['wpbs-props']?.['columns-small'] ?? 2,
                    large: props.attributes['wpbs-props']?.['columns-large'] ?? 3,
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
            if (!!props.attributes['wpbs-grid']?.pagination && props.attributes.queryArgs?.['post_type'] !== 'current') {
                return <button type="button" class="w-full h-10 relative"
                               data-wp-on-async--click="actions.pagination">
                    {props.attributes['wpbs-grid']?.['pagination-label'] || 'Show More'}
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


