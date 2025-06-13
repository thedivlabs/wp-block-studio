import '../scss/block.scss'


import {
    useBlockProps,
    useInnerBlocksProps, InspectorControls, PanelColorSettings, BlockContextProvider
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"

import {Style, STYLE_ATTRIBUTES} from "Components/Style.js";
import {LayoutControls, LAYOUT_ATTRIBUTES} from "Components/Layout"

import {useState, useEffect} from '@wordpress/element';
import {select, subscribe} from '@wordpress/data';
import {store as blockEditorStore} from '@wordpress/block-editor';
import {useInstanceId} from "@wordpress/compose";


function classNames(attributes = {}) {

    return [
        'wpbs-content-tabs',
        'w-full relative',
        (attributes.className || '').split(' ').includes('is-style-fade') ? 'wpbs-content-tabs--fade' : null,
        attributes.uniqueId,
    ].filter(x => x).join(' ');
}

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

        const [tabActive, setTabActive] = useState(0);
        const [tabPanels, setTabPanels] = useState([]);

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-content-tabs');

        useEffect(() => {
            setAttributes({
                'uniqueId': uniqueId
            });
        }, []);

        useEffect(() => {

            let unsubscribed = false;

            const update = () => {
                const {getBlock} = select(blockEditorStore);
                const thisBlock = getBlock(clientId);
                if (!thisBlock) {
                    return
                }

                const container = thisBlock.innerBlocks?.find(
                    (child) => child.name === 'wpbs/content-tabs-container'
                );

                if (!container) {
                    return
                }

                const nextPanels = container.innerBlocks
                    .filter((block) => block.name === 'wpbs/content-tabs-panel')
                    .map((panel, i) => ({
                        title: panel.attributes?.title || `Tab ${i + 1}`,
                        clientId: panel.clientId,
                    }));

                // Only update if different
                setTabPanels((prev) => {
                    const isEqual = prev.length === nextPanels.length &&
                        prev.every((p, i) =>
                            p.title === nextPanels[i].title &&
                            p.clientId === nextPanels[i].clientId
                        );
                    return isEqual ? prev : nextPanels;
                });
            };

            update();

            const unsubscribe = subscribe(() => {
                if (!unsubscribed) {
                    update();
                }
            });

            return () => {
                unsubscribed = true;
                unsubscribe();
            };
        }, [clientId]);

        useEffect(() => {
            if (!tabActive && tabPanels?.length > 0) {
                setTabActive(tabPanels[0].clientId);
            }
        }, [tabPanels, tabActive]);


        const blockProps = useBlockProps({
            className: classNames(attributes),
        });

        const innerBlocksProps = useInnerBlocksProps(blockProps, {
            template: [
                ['wpbs/content-tabs-nav'],
                ['wpbs/content-tabs-container'],
            ],
            allowedBlocks: [
                'wpbs/content-tabs-nav',
                'wpbs/content-tabs-container',
                'wpbs/layout-element',
            ],
        });

        return <>

            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes}
                   deps={['wpbs-content-tabs']}
            />
            <BlockContextProvider
                value={{
                    tabPanels,
                    tabActive,
                    setTabActive,
                }}
            >
                <div {...innerBlocksProps}></div>
            </BlockContextProvider>

        </>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: classNames(props.attributes),
            'data-wp-interactive': 'wpbs/content-tabs',
            'data-wp-init': 'actions.init',
        });

        const innerBlocksProps = useInnerBlocksProps.save(blockProps);

        return <div {...innerBlocksProps}></div>;
    }
})


