import {
    __experimentalGrid as Grid,
    SelectControl,
    ToggleControl,
    __experimentalNumberControl as NumberControl,
    QueryControls, FormTokenField, Spinner, TextControl
} from "@wordpress/components";
import React, {useEffect, useState} from "react";
import {useSelect} from "@wordpress/data";
import {store as coreStore} from "@wordpress/core-data";


function populateFields() {


    return <></>;
}

export function Loop({attributes, setAttributes}) {

    const {'wpbs-loop': settings = {}} = attrs;

    const [loopPostType, setLoopPostType] = useState(settings['type']);
    const [loopTerm, setLoopTerm] = useState(settings['term']);
    const [loopTaxonomy, setLoopTaxonomy] = useState(settings['taxonomy']);
    const [loopPageSize, setLoopPageSize] = useState(settings['page-size']);
    const [loopOrderBy, setLoopOrderBy] = useState(settings['orderby']);
    const [loopOrder, setLoopOrder] = useState(settings['order']);
    const [pagination, setPagination] = useState(settings['pagination']);
    const [paginationLabel, setPaginationLabel] = useState(settings['pagination-label']);

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
    }, []);

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
                select(coreStore).getEntityRecords('postType', settings['type'] || 'post', {
                    per_page: 100,
                }),
            [settings['type']]
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

            setAttributes({['loop-suppress']: newIds});
        };

        // Convert stored IDs to titles for display in the field
        const selectedTitles = (settings['suppress'] || [])
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
                'post_type': settings['type'],
                'term': settings['term'],
                'taxonomy': settings['taxonomy'],
                'posts_per_page': settings['page-size'],
                'orderby': settings['orderby'],
                'order': settings['order'],
                'post__not_in': settings['suppress'],
            }
        });

    }, [settings['loop']]);

    return <Grid columns={1} columnGap={15} rowGap={20}>
        <SelectControl
            label={'Post Type'}
            value={loopPostType}
            options={postTypeOptions}
            onChange={(newValue) => {
                setLoopPostType(newValue);
            }}
            __next40pxDefaultSize
            __nextHasNoMarginBottom
        />
        <Grid columns={1} columnGap={15} rowGap={20}
              style={(settings['type'] || '') === 'current' ? {
                  opacity: .4,
                  pointerEvents: 'none'
              } : {}}>

            <SelectControl
                label={'Taxonomy'}
                value={loopTaxonomy}
                options={taxonomiesOptions}
                onChange={(newValue) => {
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
                    setLoopTerm(newValue);
                }}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />

            <SuppressPostsField/>

            <QueryControls
                onOrderByChange={(newValue) => {
                    setLoopOrderBy(newValue);
                }}
                onOrderChange={(newValue) => {
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
                        setLoopPageSize(newValue);
                    }}
                    value={loopPageSize}
                />

                <TextControl
                    label={'Pagination Label'}
                    __next40pxDefaultSize
                    onChange={(newValue) => {
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
                    setPagination(newValue);
                }}
            />
        </Grid>
    </Grid>;

}

export default Loop;
