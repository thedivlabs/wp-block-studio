import './scss/block.scss'


import {
    useBlockProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"

import {Style, STYLE_ATTRIBUTES} from "Components/Style.js";
import {LayoutControls, LAYOUT_ATTRIBUTES} from "Components/Layout"

import {useCallback, useEffect} from '@wordpress/element';
import {useInstanceId} from "@wordpress/compose";
import {useUniqueId} from "Includes/helper";
import {useMemo} from "react";
import {isEqual} from "lodash";


function classNames(attributes = {}) {
    return [
        'wpbs-content-tabs-navigation flex items-stretch',
        'relative',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

function buttonClassNames(attributes) {

    const {options = {}} = attributes?.['wpbs-content-tabs-navigation'] ?? {};

    return [
        'wpbs-content-tabs-navigation__button h-auto',
        !!options?.['buttonGrow'] ? 'grow' : null,
    ].filter(x => x).join(' ');
}


registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-content-tabs-navigation': {
            type: 'object'
        }
    },
    edit: ({attributes, setAttributes, clientId, context}) => {

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const {'wpbs-content-tabs-navigation': settings = {}} = attributes;

        const blockProps = useBlockProps({
            className: classNames(attributes),
        });

        const panels = context?.panelBlocks;

        useEffect(() => {


            if (panels && !isEqual(panels, settings?.panels)) {
                setAttributes({'wpbs-content-tabs-navigation': {panels: panels}});
            }

        }, [panels]);

        const Buttons = useMemo(() => {
            return (settings?.panels ?? []).map((panel) => {

                return (
                    <button
                        key={panel.clientId}
                        className={buttonClassNames(attributes)}
                        type="button"
                    >
                        {panel.title}
                    </button>
                );
            });
        }, [settings?.panels]);

        return <>

            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                   deps={['wpbs-content-tabs-navigation']} selector={'wpbs-content-tabs-navigation'}
            />
            <nav {...blockProps} >
                {Buttons}
            </nav>
        </>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: classNames(props.attributes),
            ...(props.attributes?.['wpbs-props'] ?? {})
        });

        const {'wpbs-content-tabs-navigation': settings = {}} = props?.attributes ?? {};

        const {panels = []} = settings;

        return <nav {...blockProps} role={'tablist'}>
            {(panels || []).map((panel) => {

                return (
                    <button
                        key={panel.clientId}
                        className={buttonClassNames(props.attributes)}
                        type={"button"}
                        role={'tab'}

                    >
                        {panel.title}
                    </button>
                );
            })}
        </nav>;
    }
})


