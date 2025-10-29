import './scss/block.scss'

import {
    InspectorControls, PanelColorSettings,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {
    __experimentalGrid as Grid,
    PanelBody,
    SelectControl, TabPanel,
    ToggleControl
} from "@wordpress/components";
import {useMemo, useCallback, useEffect} from '@wordpress/element';
import Link from "Components/Link.js";
import {useSelect} from "@wordpress/data";
import {store as coreStore} from "@wordpress/core-data";
import {IconControl, MaterialIcon, iconProps} from "Components/IconControl";
import {withStyle, withStyleSave, STYLE_ATTRIBUTES} from 'Components/Style';

function classNames(attributes = {}) {

    const {'wpbs-cta': settings = {}} = attributes;

    return [
        'relative',
        !settings?.['is-link'] ? 'wp-element-button' : null,
        !!settings?.['icon'] ? '--icon' : null,
        !!settings?.['icon-hide'] ? '--icon-hide' : null,
        !!settings?.['icon-bold'] ? '--icon-bold' : null,
        !!settings?.['icon-only'] ? '--icon-only' : false,
        !!settings?.['icon-first'] ? '--icon-first' : false,
    ].filter(x => x).join(' ');
}


registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        'wpbs-cta': {
            type: 'object',
            default: {}
        }
    },
    edit: withStyle(
        (props) => {

            const {attributes, BlockWrapper, styleData, setAttributes, setCss} = props;

            const {'wpbs-cta': settings = {}} = attributes;

            const updateSettings = useCallback((newValue) => {

                const result = {
                    ...settings,
                    ...newValue,
                }

                setAttributes({
                    'wpbs-cta': result
                });

            }, [settings]);

            const POPUP_QUERY = useMemo(() => ({per_page: -1}), []);

            const popups = useSelect(
                (select) => select(coreStore).getEntityRecords('postType', 'popup', POPUP_QUERY),
                [POPUP_QUERY]
            ) || [];

            const popupOptions = useMemo(() => {
                return [
                    {label: 'Select', value: ''},
                    ...popups.map((popup) => ({
                        label: popup.title?.raw || '(Untitled)',
                        value: popup?.id,
                    })),
                ];
            }, [popups]);

            const tabOptions = useMemo(() => (
                <Grid columns={1} columnGap={15} rowGap={20}>
                    <SelectControl
                        label="Popup"
                        __nextHasNoMarginBottom
                        value={settings?.popup}
                        options={popupOptions}
                        onChange={(newValue) => updateSettings({popup: newValue})}
                    />
                    <Grid columns={2} columnGap={15} rowGap={20} style={{padding: '1rem 0'}}>
                        <ToggleControl
                            label="Loop"
                            __nextHasNoMarginBottom
                            checked={!!settings?.loop}
                            onChange={(newValue) => updateSettings({loop: newValue})}
                        />
                        <ToggleControl
                            label="Link"
                            __nextHasNoMarginBottom
                            checked={!!settings?.['is-link']}
                            onChange={(newValue) => updateSettings({['is-link']: newValue})}
                        />
                    </Grid>
                </Grid>
            ), [settings, popups]);

            const tabIcon = useMemo(() => (
                <Grid columns={1} columnGap={15} rowGap={20}>
                    <IconControl label={'Icon'} value={settings?.icon}
                                 onChange={(newValue) => updateSettings({'icon': newValue})}/>

                    <Grid columns={2} columnGap={15} rowGap={20} style={{padding: '1rem 0'}}>
                        <ToggleControl
                            label="Icon Only"
                            __nextHasNoMarginBottom
                            checked={!!settings?.['icon-only']}
                            onChange={(newValue) => updateSettings({'icon-only': newValue})}
                        />
                        <ToggleControl
                            label="Hide Icon"
                            __nextHasNoMarginBottom
                            checked={!!settings?.['icon-hide']}
                            onChange={(newValue) => updateSettings({'icon-hide': newValue})}
                        />
                        <ToggleControl
                            label="Icon First"
                            __nextHasNoMarginBottom
                            checked={!!settings?.['icon-first']}
                            onChange={(newValue) => updateSettings({'icon-first': newValue})}
                        />
                        <ToggleControl
                            label="Bold Icon"
                            __nextHasNoMarginBottom
                            checked={!!settings?.['icon-bold']}
                            onChange={(newValue) => updateSettings({'icon-bold': newValue})}
                        />
                    </Grid>
                    <PanelColorSettings
                        enableAlpha
                        className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                        colorSettings={[
                            {
                                slug: 'icon',
                                label: 'Icon Color',
                                value: settings?.['icon-color'],
                                onChange: (newValue) => updateSettings({'icon-color': newValue}),
                                isShownByDefault: true
                            }
                        ]}
                    />
                </Grid>
            ), [settings]);

            const {title = 'Learn more', openInNewTab = false} = settings?.link ?? {};

            const anchorProps = {
                title: title,
                href: settings?.popup ? '#' : '%%URL%%',
                target: openInNewTab ? '_blank' : '_self',
                ...(settings?.popup && {role: 'button'}),
                onClick: (e) => e.preventDefault()
            };

            const cssProps = Object.fromEntries(
                Object.entries({
                    props: {
                        '--testing': "50px",
                        '--icon-color': settings?.['icon-color'] || null,
                        ...iconProps(settings?.['icon']),
                    },
                    breakpoints: {
                        xs: {
                            '--testing': '20px',
                        }
                    }
                }).filter(([_, v]) => v != null)
            );

            useEffect(() => {
                setCss(cssProps)
            }, [cssProps]);

            return (
                <>
                    <Link defaultValue={settings?.link}
                          callback={(newValue) => updateSettings({link: newValue})}/>
                    <InspectorControls group="styles">

                        <PanelBody initialOpen={true}>

                            <TabPanel
                                className="wpbs-editor-tabs"
                                activeClass="active"
                                orientation="horizontal"
                                initialTabName="options"
                                tabs={[
                                    {
                                        name: 'options',
                                        title: 'Options',
                                        className: 'tab-options',
                                    },
                                    {
                                        name: 'icon',
                                        title: 'Icon',
                                        className: 'tab-icon',
                                    }
                                ]}>
                                {
                                    (tab) => (<>{{
                                        options: tabOptions,
                                        icon: tabIcon
                                    }[tab.name]}</>)
                                }
                            </TabPanel>
                        </PanelBody>

                    </InspectorControls>

                    <BlockWrapper
                        tagName={'a'}
                        props={props}
                        className={classNames}
                        {...anchorProps}
                    >
                        <span className={'wpbs-cta-button__title relative'}>{title}</span>
                        <MaterialIcon className={'wpbs-cta-button__icon'} {...(settings?.icon ?? {})} />
                    </BlockWrapper>

                </>
            );
        }),

    save: withStyleSave((props) => {
        const {attributes, BlockWrapper, styleData} = props;

        const {'wpbs-cta': settings = {}} = attributes ?? {};

        const {title = 'Learn more', openInNewTab = false} = settings?.link ?? {};

        const anchorProps = {
            title: title,
            href: settings?.popup ? '#' : '%%URL%%',
            target: openInNewTab ? '_blank' : '_self',
            ...(settings?.popup && {role: 'button'}),
            ...(settings?.popup && {
                onClick: (e) => e.preventDefault()
            }),
            'data-popup': settings?.popup ?? null
        };

        return (
            <BlockWrapper
                props={props}
                className={classNames(attributes)}
                tagName={'a'}
                {...anchorProps}
            >
                <span className={'wpbs-cta-button__title'}>{title}</span>
                <MaterialIcon className={'wpbs-cta-button__icon'} {...(settings?.icon ?? {})} />
            </BlockWrapper>
        );
    }, true),
})

