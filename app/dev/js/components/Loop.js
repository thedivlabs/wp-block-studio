import {FormTokenField, SelectControl, Spinner} from "@wordpress/components";
import React, {useEffect, useState} from "react";
import {useSelect} from "@wordpress/data";
import {store as coreStore} from "@wordpress/core-data";


function Loop({defaultValue, callback}) {

    const [loopPostType, setLoopPostType] = useState(attributes['wpbs-loop-type']);
    const [loopTerm, setLoopTerm] = useState(attributes['wpbs-loop-term']);
    const [loopTaxonomy, setLoopTaxonomy] = useState(attributes['wpbs-loop-taxonomy']);
    const [loopPageSize, setLoopPageSize] = useState(attributes['wpbs-loop-page-size']);
    const [loopOrderBy, setLoopOrderBy] = useState(attributes['wpbs-loop-orderby']);
    const [loopOrder, setLoopOrder] = useState(attributes['wpbs-loop-order']);
    const [pagination, setPagination] = useState(attributes['wpbs-pagination']);
    const [paginationLabel, setPaginationLabel] = useState(attributes['wpbs-pagination-label']);

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

}

export default Loop;
