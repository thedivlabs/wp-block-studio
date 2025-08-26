import {useEffect, useState} from "react";
import {select, subscribe, useSelect} from "@wordpress/data";
import {store as coreStore} from "@wordpress/core-data";
import {
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl,
    FormTokenField,
    QueryControls,
    SelectControl,
    TextControl,
    ToggleControl
} from "@wordpress/components";

export const LOOP_ATTRIBUTES = {
    'wpbs-query': {
        type: 'object'
    }
}


export const LoopControls = ({attributes, setAttributes}) => {

    const [loop, setLoop] = useState({
        postTypes: [],
        taxonomies: [],
        terms: [],
        posts: [],
    });

    const [queryArgs, setQueryArgs] = useState(attributes['wpbs-query'] || {});

    const postTypes = useSelect(
        (select) => {
            const types = select(coreStore).getPostTypes({per_page: -1});
            if (!types) return null; // still loading
            return Object.values(types).filter(
                (type) => !!type?.viewable && type.slug !== 'attachment'
            );
        },
        [] // dependencies
    );


    useEffect(() => {

        if (!postTypes) {
            return;
        }

        if (queryArgs.post_type === 'current') {
            //return;
        }

        const termsQuery = {
            hide_empty: true,
            per_page: -1
        };

        const mainQuery = {
            per_page: -1,
            status: 'publish',
            order: 'asc',
            orderby: 'title'
        };

        if (!!queryArgs.taxonomy && !!queryArgs.term) {

            const tax_base = {
                category: 'categories',
                post_tag: 'tags',
            }[queryArgs.taxonomy] ?? queryArgs.taxonomy;

            mainQuery[tax_base] = queryArgs.term;
        }

        select(coreStore).getTaxonomies();
        select(coreStore).getEntityRecords('taxonomy', queryArgs.taxonomy, termsQuery);
        select(coreStore).getEntityRecords('postType', queryArgs.post_type, mainQuery);


        const unsubscribe = subscribe(() => {

            const core = select(coreStore);

            const isTaxonomiesReady = core.hasFinishedResolution('getTaxonomies');
            const isTermsReady = core.hasFinishedResolution(
                'getEntityRecords',
                ['taxonomy', queryArgs.taxonomy, termsQuery]
            );
            const isSuppressReady = core.hasFinishedResolution(
                'getEntityRecords',
                ['postType', queryArgs.post_type, mainQuery]
            );

            if (isTaxonomiesReady && isTermsReady && isSuppressReady) {
                const taxonomies = core.getTaxonomies();
                const terms = core.getEntityRecords('taxonomy', queryArgs.taxonomy, termsQuery);
                const posts = core.getEntityRecords('postType', queryArgs.post_type, mainQuery);

                setLoop((prev) => ({
                    ...prev,
                    postTypes: postTypes,
                    taxonomies: taxonomies?.filter((tax) => tax.visibility?.public) || [],
                    terms: terms || [],
                    posts: posts || [],
                }));

                unsubscribe();
            }
        });
    }, [queryArgs, postTypes]);

    function updateSettings(newValue) {

        const result = {
            ...queryArgs,
            ...newValue
        };

        setAttributes({'wpbs-query': result});
        setQueryArgs(result);

    }

    const SuppressPostsField = () => {

        const handleChange = (selectedTitles) => {

            const post_ids = selectedTitles
                .map((title) => {
                    const match = loop?.posts.find((post) => post.title.rendered === title);
                    return match?.id;
                })
                .filter(Boolean);

            updateSettings({post__not_in: post_ids});

        };

        const selectedTitles = (queryArgs?.post__not_in ?? []).map((id) => {
            const post = loop?.posts.find((post) => post.id === id);
            return post?.title.rendered;
        }).filter(Boolean);

        return (
            <FormTokenField
                __experimentalExpandOnFocus={true}
                label="Suppress posts"
                value={selectedTitles}
                suggestions={!loop?.posts.length ? [] : loop?.posts.map((post) => post.title.rendered)}
                onChange={handleChange}
                placeholder="Type post titles…"
                __experimentalShowHowTo={false}
            />
        );
    }

    const SelectPostsField = () => {

        const handleChange = (selectedTitles) => {

            const post_ids = selectedTitles
                .map((title) => {
                    const match = loop?.posts.find((post) => post.title.rendered === title);
                    return match?.id;
                })
                .filter(Boolean);

            updateSettings({post__in: post_ids});

        };

        const selectedTitles = (queryArgs?.post__in ?? []).map((id) => {
            const post = loop?.posts.find((post) => post.id === id);
            return post?.title.rendered;
        }).filter(Boolean);

        return (
            <FormTokenField
                __experimentalExpandOnFocus={true}
                label="Select posts"
                value={selectedTitles}
                suggestions={!loop?.posts.length ? [] : loop?.posts.map((post) => post.title.rendered)}
                onChange={handleChange}
                placeholder="Type post titles…"
                __experimentalShowHowTo={false}
            />
        );
    }

    const postTypeOptions = (suppress = []) => {
        return [
            {value: 0, label: 'Select a post type'},
            {value: 'current', label: 'Current'},
            {value: 'related', label: 'Related'},
            ...(loop?.postTypes ?? []).map((postType) => ({
                value: postType.slug,
                label: postType.name,
            })),
        ].filter(option => !suppress.includes(option.value));
    };


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
                updateSettings({
                    post_type: newValue,
                    post__not_in: [],
                    term: undefined,
                });

                setLoop({
                    ...loop,
                    posts: [],
                });

            }}
            __next40pxDefaultSize
            __nextHasNoMarginBottom
        />
        <Grid columns={1} columnGap={15} rowGap={20}
              style={queryArgs?.post_type !== 'related' ? {
                  display: 'none'
              } : {}}>
            <SelectControl
                label={'Filter'}
                value={queryArgs?.post_type_filter}
                options={postTypeOptions(['current', 'related'])}
                onChange={(newValue) => {
                    updateSettings({
                        post_type_filter: newValue
                    });

                }}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />
        </Grid>
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
                    updateSettings({
                        taxonomy: newValue,
                        term: undefined,
                        posts: [],
                    });

                    setLoop({
                        ...loop,
                        terms: [],
                        posts: [],
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
                    updateSettings({
                        term: newValue,
                        posts: [],
                    });
                }}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />

            <SelectPostsField/>

            <SuppressPostsField/>

            <QueryControls
                onOrderByChange={(newValue) => {
                    updateSettings({orderby: newValue});
                }}
                onOrderChange={(newValue) => {
                    updateSettings({order: newValue});
                }}
                order={queryArgs?.order}
                orderBy={queryArgs?.orderby}
            />

            <Grid columns={2} columnGap={15} rowGap={20}>

                <NumberControl
                    label={'Page Size'}
                    __next40pxDefaultSize
                    min={-1}
                    isShiftStepEnabled={false}
                    onChange={(newValue) => {
                        updateSettings({posts_per_page: newValue});
                    }}
                    value={queryArgs?.posts_per_page}
                />

                <TextControl
                    label={'Pagination Label'}
                    __next40pxDefaultSize
                    onChange={(newValue) => {
                        updateSettings({pagination_label: newValue});
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
                    updateSettings({pagination: newValue});
                }}
            />
            <ToggleControl
                __nextHasNoMarginBottom
                label="Loop Terms"
                checked={!!queryArgs?.loop_terms}
                onChange={(newValue) => {
                    updateSettings({loop_terms: newValue});
                }}
            />
            <ToggleControl
                __nextHasNoMarginBottom
                label="Menu Order"
                checked={!!queryArgs?.menu_order}
                onChange={(newValue) => {
                    updateSettings({menu_order: newValue});
                }}
            />
        </Grid>
    </Grid>;
}

