import {
    useBlockProps,
    InspectorControls,
    InnerBlocks,
} from "@wordpress/block-editor"
import {registerBlockType, cloneBlock, createBlock} from "@wordpress/blocks"
import metadata from "../block.json"
import {Layout, LayoutAttributes, LayoutClasses} from "Components/Layout"
import {Background, BackgroundSettings, BackgroundAttributes} from "Components/Background";

import {
    __experimentalGrid as Grid,
} from "@wordpress/components";
import {useInstanceId} from "@wordpress/compose";
import {useEffect} from "react";
import {dispatch, useSelect} from "@wordpress/data";


function sectionClassNames(attributes = {}) {

    return [
        'wpbs-layout-grid w-full block relative',
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
        ['wpbs-masonry']: {
            type: 'boolean'
        },
        ['wpbs-divider-style']: {
            type: 'string'
        },
        ['wpbs-divider-color']: {
            type: 'string'
        },
        ['wpbs-divider-size']: {
            type: 'string'
        },
        ['wpbs-divider-icon']: {
            type: 'string'
        },
        ['wpbs-divider-mobile']: {
            type: 'boolean'
        },
        ['wpbs-pagination-size']: {
            type: 'string'
        },
        ['wpbs-pagination-label']: {
            type: 'string'
        },
        ['wpbs-pagination-rounded']: {
            type: 'string'
        },
        ['wpbs-pagination-bg-color']: {
            type: 'string'
        },
        ['wpbs-pagination-text-color']: {
            type: 'string'
        },
        ['wpbs-pagination-border-color']: {
            type: 'string'
        },
        ['wpbs-pagination-hover-bg-color']: {
            type: 'string'
        },
        ['wpbs-pagination-hover-text-color']: {
            type: 'string'
        },
        ['wpbs-pagination-hover-border-color']: {
            type: 'string'
        },
        ['wpbs-pagination-current-bg-color']: {
            type: 'string'
        },
        ['wpbs-pagination-current-border-color']: {
            type: 'string'
        },
        ['wpbs-pagination-current-text-color']: {
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
        ['wpbs-loop-modifier']: {
            type: 'string'
        },
        ['wpbs-loop-sort']: {
            type: 'string'
        },
        ['wpbs-loop-current']: {
            type: 'boolean'
        },
        ['wpbs-loop-suppress']: {
            type: 'array'
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-layout-grid');

        const queryArgs = {
            per_page: 8,
        };

        /*const posts = useSelect((select) =>
            select('core').getEntityRecords('postType', 'post', queryArgs));*/


        useEffect(() => {
            setAttributes({
                uniqueId: uniqueId,
                queryArgs: queryArgs
            });
        }, []);


        const hasInnerBlocks = useSelect((select) =>
            select('core/block-editor').getBlock(clientId)?.innerBlocks.length > 0
        );

        //const havePosts = posts && posts.length > 0;

        /*useEffect(() => {
            if (!posts) {
                return;
            }

            const cardBlocks = posts.map((post) => {
                return createBlock('wpbs/layout-grid-card', {
                    postId: post.id,
                    postType: post.type,
                }, [
                    createBlock('core/post-title', {}),
                ]);
            });

            dispatch('core/block-editor').replaceInnerBlocks(clientId, cardBlocks);

        }, [havePosts]);*/


        const blockProps = useBlockProps({
            className: [sectionClassNames(attributes), 'empty:min-h-8'].join(' '),
        });


        const appenderToUse = () => {
            if (!hasInnerBlocks) {
                return (
                    <InnerBlocks.DefaultBlockAppender/>
                );
            } else {
                return false;
            }
        }

        /*  innerBlocks = [...innerBlocks].map((block) => {
              //console.log(block);
              //const wrapperBlock =

          });*/


        //console.log(innerBlocks);


        /*if (!posts) return <p>Loading...</p>;
        if (posts.length === 0) return <p>No posts found.</p>;*/

        return (
            <>
                <InspectorControls group="styles">
                    <BackgroundSettings attributes={attributes || {}}
                                        pushSettings={setAttributes}></BackgroundSettings>
                </InspectorControls>
                <Layout blockProps={blockProps} attributes={attributes} setAttributes={setAttributes}
                        clientId={clientId}></Layout>

                <div {...blockProps}>

                    <InnerBlocks
                        renderAppender={ () => appenderToUse() }
                    />

                    <Background attributes={attributes} editor={true}/>

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

        return (
            <div {...blockProps}
            >

                <InnerBlocks.Content/>

                <Background attributes={props.attributes} editor={false}/>
            </div>
        );
    }
})


