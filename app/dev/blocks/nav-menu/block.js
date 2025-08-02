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

        console.log(menus);

        const cssProps = useMemo(() => {
            return {};
        }, [settings]);

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

            <ServerSideRender
                block={metadata.name}
            />
        </>

    },
    save: () => {
        return null;
    }
})


