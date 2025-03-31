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
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-layout-grid');

        const queryArgs = {
            per_page: 8
        };

        const context = {
            'wpbs/queryArgs': queryArgs,
        };

        const posts = useSelect((select) =>
            select('core').getEntityRecords('postType', 'post', queryArgs));

        useEffect(() => {
            setAttributes({uniqueId: uniqueId});
        }, []);


        const hasInnerBlocks = useSelect((select) =>
            select('core/editor').getBlock(clientId)?.innerBlocks.length > 0
        );

        const havePosts = posts && posts.length > 0;

        useEffect(() => {
            if (!posts) {
                return;
            }

            const cardBlocks = posts.map((post) => {
                return createBlock('wpbs/layout-grid-card', {
                    postId: post.id,
                    postType: post.type,
                }, [
                    createBlock('core/post-title',{
                        postId: post.id,
                        postType: post.type,
                    })
                ]);
            });

            dispatch('core/block-editor').replaceInnerBlocks(clientId, cardBlocks);

        }, [havePosts]);


        const blockProps = useBlockProps({
            className: [sectionClassNames(attributes), 'empty:min-h-8'].join(' '),
        });


        /*const appenderToUse = () => {
            if (innerBlocks.length < 2) {
                return (
                    <InnerBlocks.DefaultBlockAppender/>
                );
            } else {
                return false;
            }
        }*/

        /*  innerBlocks = [...innerBlocks].map((block) => {
              //console.log(block);
              //const wrapperBlock =

          });*/


        //console.log(innerBlocks);


        if (!posts) return <p>Loading...</p>;
        if (posts.length === 0) return <p>No posts found.</p>;

        return (
            <>
                <InspectorControls group="styles">
                    <BackgroundSettings attributes={attributes || {}}
                                        pushSettings={setAttributes}></BackgroundSettings>
                </InspectorControls>
                <Layout blockProps={blockProps} attributes={attributes} setAttributes={setAttributes}
                        clientId={clientId}></Layout>

                <div {...blockProps}>

                    <InnerBlocks/>

                    <Background attributes={attributes} editor={true}/>

                </div>
            </>
        )
    },
    save: (props) => {


        const blockProps = useBlockProps.save({
            className: sectionClassNames(props.attributes),
        });

        return (
            <div {...blockProps}>

                <InnerBlocks.Content/>

                <Background attributes={props.attributes} editor={false}/>
            </div>
        );
    }
})


