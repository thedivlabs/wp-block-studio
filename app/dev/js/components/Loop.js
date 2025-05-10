import {useEffect, useState} from "react";
import {select, subscribe, useSelect,getEntityRecords} from "@wordpress/data";
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

        const unsubscribe = subscribe(() => {
            if (
                select(coreStore).hasFinishedResolution('getPostTypes') &&
                select(coreStore).hasFinishedResolution('getTaxonomies')
            ) {

                const postTypes = select(coreStore).getPostTypes().filter((type) => {
                    return !!type.viewable && !['attachment'].includes(type.slug);
                });
                const taxonomies = select(coreStore).getTaxonomies()?.filter(tax => tax.visibility.public);

                setLoop({
                    ...loop,
                    postTypes: postTypes,
                    taxonomies:taxonomies
                })
                console.log('finished loading');
                console.log(loop);
                unsubscribe(); // Prevent future updates
            }
        });

        select(coreStore).getPostTypes();
        select(coreStore).getTaxonomies();
    }, []);

    useEffect(() => {

        const unsubscribe = subscribe(() => {
            console.log('starting terms');

            const hasResolved = select(coreStore).hasFinishedResolution(
                'getEntityRecords',
                ['taxonomy', queryArgs.taxonomy, {
                    hide_empty: true,
                    per_page: -1
                }]
            );

            if (hasResolved) {
                const terms = getEntityRecords('taxonomy', queryArgs.taxonomy, {
                    hide_empty: true,
                    per_page: -1
                });

                setLoop({
                    ...loop,
                    terms: terms,
                })
                console.log('finished terms');
                console.log(loop);
                unsubscribe();
            }
        });
    }, [queryArgs]);


    useSelect((select) => {
return false;
        let result = {};

        const {getEntityRecords} = select(coreStore);

        if (!loop.terms?.length && !!queryArgs?.taxonomy) {

            result.terms = getEntityRecords('taxonomy', queryArgs.taxonomy, {
                hide_empty: true,
                per_page: -1
            });

            console.log('setting terms');
        }

        if (!!queryArgs.post_type && !loop.suppressPosts?.length) {

            result.suppressPosts = getEntityRecords('postType', queryArgs.post_type, {
                per_page: -1,
                order: 'asc',
                orderby: 'title',
            });

            console.log('setting suppressPosts');
        }

        console.log(result);


        setLoop({
            ...loop,
            ...result
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
