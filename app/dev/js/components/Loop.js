import {useEffect, useState} from "react";
import {select, subscribe, useSelect, getEntityRecords} from "@wordpress/data";
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


function Loop({attributes, setAttributes}) {

    //currentTab = currentTab || 'loop'

    const [loop, setLoop] = useState({
        postTypes: [],
        taxonomies: [],
        terms: [],
        posts: [],
    });

    const [queryArgs, setQueryArgs] = useState(attributes['queryArgs'] || {});

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


    useEffect(() => {

        select(coreStore).getPostTypes();
        select(coreStore).getTaxonomies();
        select(coreStore).getEntityRecords('taxonomy', queryArgs.taxonomy, termsQuery);
        select(coreStore).getEntityRecords('postType', queryArgs?.post_type ?? 'post', mainQuery);

        console.log('starting queries');

        const unsubscribe = subscribe(() => {

            const core = select(coreStore);

            const isPostTypesReady = core.hasFinishedResolution('getPostTypes');
            const isTaxonomiesReady = core.hasFinishedResolution('getTaxonomies');
            const isTermsReady = core.hasFinishedResolution(
                'getEntityRecords',
                ['taxonomy', queryArgs.taxonomy, termsQuery]
            );
            const isSuppressReady = core.hasFinishedResolution(
                'getEntityRecords',
                ['postType', queryArgs?.post_type ?? 'post', mainQuery]
            );


            if (isPostTypesReady && isTaxonomiesReady && isTermsReady && isSuppressReady) {
                const postTypes = core.getPostTypes();
                const taxonomies = core.getTaxonomies();
                const terms = core.getEntityRecords('taxonomy', queryArgs.taxonomy, termsQuery);
                const posts = core.getEntityRecords('postType', queryArgs?.post_type ?? 'post', mainQuery);

                setLoop((prev) => ({
                    ...prev,
                    postTypes: postTypes?.filter((type) => type.viewable && type.slug !== 'attachment') || [],
                    taxonomies: taxonomies?.filter((tax) => tax.visibility?.public) || [],
                    terms: terms || [],
                    posts: posts || [],
                }));

                console.log(loop);

                unsubscribe(); // cleanup
            }
        });
    }, [queryArgs]);


    function updateSettings(newValue) {

        const result = {
            ...queryArgs,
            ...newValue
        };

        setAttributes({queryArgs: result});
        setQueryArgs(result);

    }

    const SuppressPostsField = () => {

        let posts = loop?.posts ?? [];

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

            updateSettings({post__not_in: post_ids});

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

    const SelectPostsField = () => {

        let posts = loop?.posts ?? [];

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

            updateSettings({post__in: post_ids});

        };

        // Convert stored IDs to titles for display in the field
        const selectedTitles = (queryArgs?.post__in ?? []).map((id) => {
            const post = posts.find((post) => post.id === id);
            return post?.title.rendered;
        }).filter(Boolean);

        return (
            <FormTokenField
                __experimentalExpandOnFocus={true}
                label="Select posts"
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
                    min={1}
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
        </Grid>
    </Grid>;
}

export default Loop;
