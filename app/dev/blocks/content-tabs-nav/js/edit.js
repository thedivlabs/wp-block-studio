import {
    useBlockProps,
    useInnerBlocksProps, InspectorControls, PanelColorSettings, BlockContextProvider
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"

import {Style, STYLE_ATTRIBUTES} from "Components/Style.js";
import {LayoutControls, LAYOUT_ATTRIBUTES} from "Components/Layout"

import {useState, useEffect} from '@wordpress/element';
import { useBlockContext } from '@wordpress/block-editor';
import { useSelect, useDispatch } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import {useInstanceId} from "@wordpress/compose";


function classNames(attributes = {}) {
    return [
        'wpbs-content-tabs-nav',
        'relative',
        attributes.uniqueId,
    ].filter(x => x).join(' ');
}


registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-content-tabs-nav': {
            type: 'object',
            default: {}
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-content-tabs-nav');

        useEffect(() => {
            setAttributes({
                'uniqueId': uniqueId
            });
        }, []);

        const { tabPanels = [], tabActive = null } = useBlockContext();

        const { setTabActive } = useDispatch('wpbs/content-tabs');

        const handleClick = useCallback((clientId) => {
            setTabActive(clientId);
        }, []);

        const blockProps = useBlockProps({
            className: classNames(attributes),
        });


        return <>

            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes}
                   deps={['wpbs-content-tabs-nav']}
            />
            <div {...blockProps} >
                {tabPanels.map((panel) => {
                    const isActive = panel.clientId === tabActive;

                    return (
                        <button
                            key={panel.clientId}
                            onClick={() => handleClick(panel.clientId)}
                            className={classnames('wpbs-tab-button', {
                                'is-active': isActive,
                            })}
                            type="button"
                        >
                            {panel.title}
                        </button>
                    );
                })}
            </div>
        </>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: classNames(props.attributes),
        });

        return <nav {...blockProps}>NAVIGATION</nav>;
    }
})


