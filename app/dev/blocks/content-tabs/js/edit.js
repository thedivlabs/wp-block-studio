import {
    useBlockProps,
    useInnerBlocksProps, InspectorControls, PanelColorSettings, BlockContextProvider
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"

import {Style, STYLE_ATTRIBUTES} from "Components/Style.js";
import {LayoutControls, LAYOUT_ATTRIBUTES} from "Components/Layout"

import {useState, useEffect} from '@wordpress/element';
import {InnerBlocks} from '@wordpress/block-editor';
import {useSelect} from '@wordpress/data';
import {store as blockEditorStore} from '@wordpress/block-editor';

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-content-tabs': {
            type: 'object',
            default: {}

        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const tabPanels = useSelect((select) => {
            const {getBlock} = select(blockEditorStore);
            const thisBlock = getBlock(clientId);
            const container = thisBlock?.innerBlocks?.find(
                (child) => child.name === 'wpbs/content-tabs-container'
            );
            if (!container) return [];

            // Extract panel data from container's children
            return container.innerBlocks
                .filter((block) => block.name === 'wpbs/content-tabs-panel')
                .map((panel, i) => ({
                    title: panel.attributes?.title || `Tab ${i + 1}`,
                    clientId: panel.clientId,
                }));
        }, [clientId]);

        const blockProps = useBlockProps({
            className: 'wpbs-content-tabs',
        });

        return <>

            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes}
                   deps={['wpbs-content-tabs']}
            />
            <BlockContextProvider
                value={{
                    tabPanels,
                    activeTabIndex,
                }}
            >
                <div {...useInnerBlocksProps(blockProps, {
                    template: [
                        ['wpbs/content-tabs-nav'],
                        ['wpbs/content-tabs-container'],
                    ]
                })}></div>
            </BlockContextProvider>

        </>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: 'wpbs-content-tabs',
        });

        return <div {...useInnerBlocksProps.save(blockProps)}></div>;
    }
})


