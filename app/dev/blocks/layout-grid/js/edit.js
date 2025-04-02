import "../scss/block.scss";

import {
    useBlockProps,
    InspectorControls,
    InnerBlocks, useInnerBlocksProps, MediaUploadCheck, MediaUpload,
} from "@wordpress/block-editor"
import {registerBlockType, cloneBlock, createBlock} from "@wordpress/blocks"
import metadata from "../block.json"
import {Layout, LayoutAttributes, LayoutClasses} from "Components/Layout"
import {Background, BackgroundSettings, BackgroundAttributes} from "Components/Background";
import ServerSideRender from "@wordpress/server-side-render";
import {
    __experimentalGrid as Grid,
    __experimentalBorderControl as BorderControl, SelectControl, BaseControl, ToggleControl, TabPanel, PanelBody,
} from "@wordpress/components";
import {useInstanceId} from "@wordpress/compose";
import React, {useEffect, useState} from "react";
import {dispatch, useSelect} from "@wordpress/data";
import {ElementTagSettings} from "Components/ElementTag.js";
import PreviewThumbnail from "Components/PreviewThumbnail.js";


function sectionClassNames(attributes = {}) {

    return [
        'wpbs-layout-grid w-full flex relative',
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
        ['wpbs-prop-columns']: {
            type: 'string'
        },
        ['wpbs-prop-columns-mobile']: {
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
        ['wpbs-divider-mobile']: {
            type: 'boolean'
        },
        ['wpbs-pagination-size']: {
            type: 'string'
        },
        ['wpbs-pagination-label']: {
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
    edit: (props) => {

        const {attributes, setAttributes, clientId} = props;

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-layout-grid');

        const queryArgs = {
            per_page: 8,
        };

        const colors = useSelect('core/block-editor',[]).getSettings().colors;

        const [divider, setDivider] = useState(attributes['wpbs-divider']);

        /*const posts = useSelect((select) =>
            select('core').getEntityRecords('postType', 'post', queryArgs));*/

        useEffect(() => {
            setAttributes({
                uniqueId: uniqueId,
                queryArgs: queryArgs,
                ['wpbs-prop-columns']: attributes['wpbs-columns-large'] || 3,
                ['wpbs-prop-columns-mobile']: attributes['wpbs-columns-mobile'] || 1
            });
        }, []);


        /*const hasInnerBlocks = useSelect((select) =>
            select('core/block-editor').getBlock(clientId)?.innerBlocks.length > 0
        );*/

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

        const innerBlocksProps = useInnerBlocksProps({
            className: 'wpbs-layout-grid__container'
        }, {});


        /* const appenderToUse = () => {
             if (!hasInnerBlocks) {
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


        /*if (!posts) return <p>Loading...</p>;
        if (posts.length === 0) return <p>No posts found.</p>;*/
console.log(colors);
        return (
            <>
                <InspectorControls group="styles">
                    <BackgroundSettings attributes={attributes || {}}
                                        pushSettings={setAttributes}></BackgroundSettings>


                    <PanelBody title={'Background'} initialOpen={false}>
                        <Grid columns={1} columnGap={15} rowGap={20} >
                            <BorderControl
                                __next40pxDefaultSize
                                enableAlpha
                                enableStyle
                                disableUnits
                                value={divider}
                                colors={colors}
                                __experimentalIsRenderedInSidebar={true}
                                label="Divider"
                                onChange={(newValue) => {
                                    setAttributes({['wpbs-divider']: newValue});
                                    setDivider(newValue);
                                }}
                                shouldSanitizeBorder
                            />
                        </Grid>

                    </PanelBody>



                </InspectorControls>

                <Layout blockProps={blockProps} attributes={attributes} setAttributes={setAttributes}
                        clientId={clientId}></Layout>

                <div {...blockProps}>


                    <div {...innerBlocksProps}/>

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

        const innerBlocksProps = useInnerBlocksProps.save({
            className: 'wpbs-layout-grid__container',
        }, {});

        return (
            <div {...blockProps}>

                <div {...innerBlocksProps}/>

                <Background attributes={props.attributes} editor={false}/>
            </div>
        );
    }
})


