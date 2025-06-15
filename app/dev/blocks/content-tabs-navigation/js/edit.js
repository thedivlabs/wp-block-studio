import '../scss/block.scss'


import {
    useBlockProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"

import {Style, STYLE_ATTRIBUTES} from "Components/Style.js";
import {LayoutControls, LAYOUT_ATTRIBUTES} from "Components/Layout"

import {useCallback, useEffect} from '@wordpress/element';
import {useInstanceId} from "@wordpress/compose";


function classNames(attributes = {}) {
    return [
        'wpbs-content-tabs-navigation flex items-stretch',
        'relative',
        attributes.uniqueId,
    ].filter(x => x).join(' ');
}

function buttonClassNames(isActive, attributes) {

    const {options = {}} = attributes['wpbs-content-tabs-navigation'];

    return [
        'wpbs-content-tabs-navigation__button h-auto',
        options?.buttonGrow ? 'grow' : null,
        !!isActive ? 'active' : null,
    ].filter(x => x).join(' ');
}


registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-content-tabs-navigation': {
            type: 'object',
            default: {
                tabs: undefined,
            }
        },
        tabPanels: {
            type: 'array',
            default: []
        }
    },
    edit: ({attributes, setAttributes, clientId, context}) => {

        const {tabPanels = [], tabActive = null, setTabActive} = context;

        const {tabOptions} = context;

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-content-tabs-navigation');

        useEffect(() => {
            setAttributes({
                'uniqueId': uniqueId
            });
        }, []);

        useEffect(() => {
            const prevClientIds = (attributes.tabPanels || []).map(panel => panel.clientId);
            const nextClientIds = tabPanels.map(panel => panel.clientId);

            const isEqual = prevClientIds.length === nextClientIds.length &&
                prevClientIds.every((id, index) => id === nextClientIds[index]);

            if (!isEqual) {
                setAttributes({tabPanels});
            }
        }, [tabPanels]);

        useEffect(() => {
            let result = {
                ...attributes['wpbs-content-tabs-navigation'],
                'options': {
                    ...attributes['wpbs-content-tabs-navigation']?.options,
                    ...tabOptions
                }
            };

            setAttributes({'wpbs-content-tabs-navigation': result});

        }, [tabOptions])

        const handleClick = useCallback((clientId) => {
            setTabActive(clientId);
        }, []);

        const blockProps = useBlockProps({
            className: classNames(attributes),
        });

        return <>

            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes}
                   deps={['wpbs-content-tabs-navigation']}
            />
            <nav {...blockProps} >
                {tabPanels.map((panel) => {
                    const isActive = panel.clientId === tabActive;

                    return (
                        <button
                            key={panel.clientId}
                            onClick={() => handleClick(panel.clientId)}
                            className={buttonClassNames(!!isActive, attributes)}
                            type="button"
                        >
                            {panel.title}
                        </button>
                    );
                })}
            </nav>
        </>;
    },
    save: (props) => {

        const {tabPanels} = props.attributes;

        const blockProps = useBlockProps.save({
            className: classNames(props.attributes),
        });

        return <nav {...blockProps} role={'tablist'}>
            {tabPanels.map((panel, index) => {

                return (
                    <button
                        key={panel.clientId}
                        className={buttonClassNames(index === 0, props.attributes)}
                        type="button"
                        role={'tab'}
                    >
                        {panel.title}
                    </button>
                );
            })}
        </nav>;
    }
})


