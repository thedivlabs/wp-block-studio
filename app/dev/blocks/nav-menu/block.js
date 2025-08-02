import "./scss/block.scss";

import {
    useBlockProps,
    useInnerBlocksProps, InspectorControls, PanelColorSettings
} from "@wordpress/block-editor"
import ServerSideRender from '@wordpress/server-side-render';
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import {useInstanceId} from '@wordpress/compose';
import {useCallback, useEffect, useMemo} from "react";
import {useSelect} from "@wordpress/data";
import {PanelBody, SelectControl} from "@wordpress/components";

function blockClassNames(attributes = {}) {
    return [
        'wpbs-nav-menu wpbs-has-container flex flex-wrap',
        attributes?.uniqueId ?? null
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        ...metadata.attributes
    },
    edit: ({attributes, setAttributes}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-nav-menu');

        const {'wpbs-nav-menu': settings = {}} = attributes;

        const menus = useSelect((select) => {
            const core = select('core');

            // Always call the selector to trigger resolution
            const data = core.getMenus?.();

            if (!core.hasFinishedResolution('getMenus')) {
                return []; // Use undefined instead of null
            }

            return data?.map(menu => ({
                id: menu.id,
                name: menu.name,
                slug: menu.slug,
                locations: menu.locations,
            }));
        }, []);

        const updateSettings = useCallback((newValue) => {

            const result = {
                ...settings,
                ...newValue,
            }

            setAttributes({'wpbs-nav-menu': result});

        }, [settings, setAttributes]);

        const cssProps = useMemo(() => {
            return {};
        }, [settings]);

        const blockProps = useBlockProps({
            classname: blockClassNames(attributes),
        });

        const selectedMenu = useMemo(() => {

            return menus.find(menu => menu.id === parseInt(settings?.menu ?? '0'));
        }, [menus, settings?.menu]);

        const Content = ()=>{


            return !selectedMenu ? 'Loading Menu...' : <a href={'#'}
                                                          className={'uppercase'}>{selectedMenu?.name ?? 'NAVIGATION MENU'}</a>;
        };

        return <>

            <InspectorControls group={'styles'}>

                <PanelBody name={'Options'}>
                    <SelectControl
                        label="Menu"
                        value={settings?.menu}
                        options={menus.map((menu) => ({
                            label: menu.name,
                            value: menu.id,
                        }))}
                        onChange={(newValue) => updateSettings({menu: newValue})}
                    />
                </PanelBody>


            </InspectorControls>

            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes} props={cssProps} uniqueId={uniqueId}/>

            <nav {...blockProps}>

            </nav>
        </>

    },
    save: () => {
        return null;
    }
})


