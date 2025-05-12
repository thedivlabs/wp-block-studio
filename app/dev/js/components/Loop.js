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
        suppressPosts: [],
    });

    const [queryArgs, setQueryArgs] = useState(attributes['queryArgs'] || {});

    useEffect(() => {

        if (loop.postTypes.length && loop.taxonomies.length && loop.terms.length) {
            return;
        }

        const unsubscribe = subscribe(() => {

            const termsQuery = {
                hide_empty: true,
                per_page: -1
            };
            const suppressQuery = {
                per_page: -1,
                status: 'publish',
                order:'asc',
                orderby:'title'
            };

            const postTypes = !loop?.postTypes?.length ? select(coreStore).getPostTypes() : loop.postTypes;
            const taxonomies = !loop?.taxonomies?.length ? select(coreStore).getTaxonomies() : loop.taxonomies;
            const terms = !loop?.terms?.length ? select(coreStore).getEntityRecords('taxonomy', queryArgs.taxonomy, termsQuery) : loop.terms;
            const suppressPosts = !loop?.suppressPosts?.length ? select(coreStore).getEntityRecords('postType', queryArgs.post_type, suppressQuery) : loop.suppressPosts;

            if (
                (!!loop?.postTypes?.length || select(coreStore).hasFinishedResolution('getPostTypes')) &&
                (!!loop?.taxonomies?.length || select(coreStore).hasFinishedResolution('getTaxonomies')) &&
                (!!loop?.terms?.length || select(coreStore).hasFinishedResolution('getEntityRecords', ['taxonomy', queryArgs.taxonomy, termsQuery])) &&
                (!!loop?.suppressPosts?.length || select(coreStore).hasFinishedResolution('getEntityRecords', ['postType', queryArgs.post_type, suppressQuery]))
            ) {

                setLoop(prevLoop => ({
                    ...prevLoop,
                    postTypes: postTypes.filter((type) => {
                        return !!type.viewable && !['attachment'].includes(type.slug);
                    }),
                    taxonomies: taxonomies.filter(tax => tax.visibility.public),
                    terms: terms,
                    suppressPosts: suppressPosts,
                }));

            }
        });

        console.log(loop);

        return () => unsubscribe();

    }, [queryArgs?.taxonomy]);


    function updateSettings(newValue) {

        const result = {
            ...queryArgs,
            ...newValue
        };

        setAttributes({queryArgs: result});
        setQueryArgs(result);

    }

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
                    updateSettings({
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
                    updateSettings({
                        term: newValue,
                    });
                }}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />

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
        </Grid>
    </Grid>;
}

export default Loop;
