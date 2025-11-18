import './scss/block.scss'

import {
    InspectorControls,
    PanelColorSettings,
} from "@wordpress/block-editor";

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {
    __experimentalGrid as Grid,
    PanelBody,
    TabPanel,
    ToggleControl
} from "@wordpress/components";

import {useMemo, useCallback, useEffect} from '@wordpress/element';

import Link from "Components/Link.js";
import {IconControl, MaterialIcon, iconProps} from "Components/IconControl";
import PopupSelector from "Components/PopupSelector";

import {
    withStyle,
    withStyleSave,
    STYLE_ATTRIBUTES
} from 'Components/Style';

function classNames(attributes = {}) {
    const {'wpbs-cta': settings = {}} = attributes;

    return [
        'relative',
        !settings?.['is-link'] ? 'wp-element-button' : null,
        settings?.['icon'] && '--icon',
        settings?.['icon-hide'] && '--icon-hide',
        settings?.['icon-bold'] && '--icon-bold',
        settings?.['icon-only'] && '--icon-only',
        settings?.['icon-first'] && '--icon-first',
    ].filter(Boolean).join(' ');
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

    edit: withStyle((props) => {

        const {attributes, BlockWrapper, setAttributes, setCss} = props;
        const {'wpbs-cta': settings = {}} = attributes;

        const updateSettings = useCallback((newValue) => {

            const result = {
                ...settings,
                ...newValue,
            };

            setAttributes({
                'wpbs-cta': result
            });
        }, [setAttributes, settings]);

        const computedClassName = classNames(attributes);

        // ----------------------------------------
        // TAB: OPTIONS
        // ----------------------------------------
        const tabOptions = useMemo(() => (<Grid columns={1} columnGap={15} rowGap={20}>
            <PopupSelector
                value={settings?.popup}
                onChange={(popup) => updateSettings({popup})}
                label="Popup"
            />

            <Grid columns={2} columnGap={15} rowGap={20} style={{padding: '1rem 0'}}>
                <ToggleControl
                    label="Loop"
                    __nextHasNoMarginBottom
                    checked={!!settings?.loop}
                    onChange={(loop) => updateSettings({loop: !!loop})}
                />
                <ToggleControl
                    label="Link"
                    __nextHasNoMarginBottom
                    checked={!!settings?.['is-link']}
                    onChange={(val) => updateSettings({'is-link': val})}
                />
            </Grid>
        </Grid>), []);

        // ----------------------------------------
        // TAB: ICON
        // ----------------------------------------
        const tabIcon = useMemo(() => (
            <Grid columns={1} columnGap={15} rowGap={20}>
                <IconControl
                    label="Icon"
                    fieldKey="cta-icon"
                    value={settings?.icon}
                    onChange={(icon) => updateSettings({'icon': icon})}
                    props={props}
                />

                <Grid
                    columns={2}
                    columnGap={15}
                    rowGap={20}
                    style={{padding: '1rem 0'}}
                >
                    <ToggleControl
                        label="Icon Only"
                        __nextHasNoMarginBottom
                        checked={!!settings?.['icon-only']}
                        onChange={(val) => updateSettings({'icon-only': val})}
                    />
                    <ToggleControl
                        label="Hide Icon"
                        __nextHasNoMarginBottom
                        checked={!!settings?.['icon-hide']}
                        onChange={(val) => updateSettings({'icon-hide': val})}
                    />
                    <ToggleControl
                        label="Icon First"
                        __nextHasNoMarginBottom
                        checked={!!settings?.['icon-first']}
                        onChange={(val) => updateSettings({'icon-first': val})}
                    />
                    <ToggleControl
                        label="Bold Icon"
                        __nextHasNoMarginBottom
                        checked={!!settings?.['icon-bold']}
                        onChange={(val) => updateSettings({'icon-bold': val})}
                    />
                </Grid>

                <PanelColorSettings
                    enableAlpha
                    className="!p-0 !border-0 [&_.components-tools-panel-item]:!m-0"
                    colorSettings={[
                        {
                            slug: 'icon',
                            label: 'Icon Color',
                            value: settings?.['icon-color'],
                            onChange: (val) => updateSettings({'icon-color': val}),
                            isShownByDefault: true,
                        }
                    ]}
                />
            </Grid>
        ), [attributes?.['wpbs-cta']]);

        // ----------------------------------------
        // LINK SETTINGS
        // ----------------------------------------
        const {title = 'Learn more', openInNewTab = false} = settings?.link ?? {};
        const anchorProps = {
            title,
            href: settings?.popup ? '#' : '%%URL%%',
            target: openInNewTab ? '_blank' : '_self',
            ...(settings?.popup && {role: 'button'}),
            onClick: (e) => e.preventDefault(),
        };

        // ----------------------------------------
        // CSS OUTPUT
        // ----------------------------------------
        const cssObj = useMemo(() => ({
            props: {
                '--testing': '60px',
                '--icon-color': settings?.['icon-color'] || null,
                ...iconProps(settings?.icon),
            },
            breakpoints: {
                xs: {'--testing': '20px'}
            }
        }), [settings]);

        useEffect(() => setCss(cssObj), [cssObj]);

        return (
            <>
                <Link
                    defaultValue={settings?.link}
                    callback={(val) => updateSettings({link: val})}
                />

                <InspectorControls group="styles">
                    <PanelBody initialOpen={true}>
                        <TabPanel
                            className="wpbs-editor-tabs"
                            activeClass="active"
                            initialTabName="options"
                            tabs={[
                                {name: 'options', title: 'Options'},
                                {name: 'icon', title: 'Icon'}
                            ]}
                        >
                            {(tab) => {
                                switch (tab.name) {
                                    case 'options':
                                        return tabOptions;
                                    case 'icon':
                                        return tabIcon;
                                    default:
                                        return null; // safe catch-all
                                }
                            }}
                        </TabPanel>
                    </PanelBody>
                </InspectorControls>

                <BlockWrapper
                    tagName="a"
                    props={props}
                    className={computedClassName}
                    {...anchorProps}
                >
                    <span className="wpbs-cta-button__title relative">{title}</span>
                    {/* <MaterialIcon
                        className="wpbs-cta-button__icon"
                        {...(settings?.icon ?? {})}
                    />*/}
                </BlockWrapper>
            </>
        );
    }),

    save: withStyleSave((props) => {
        const {attributes, BlockWrapper} = props;
        const {'wpbs-cta': settings = {}} = attributes;

        const {title = 'Learn more', openInNewTab = false} = settings?.link ?? {};

        const anchorProps = {
            title,
            href: settings?.popup ? '#' : '%%URL%%',
            target: openInNewTab ? '_blank' : '_self',
            ...(settings?.popup && {role: 'button'}),
            ...(settings?.popup && {onClick: (e) => e.preventDefault()}),
            'data-popup': settings?.popup ?? null,
        };

        return (
            <BlockWrapper
                props={props}
                className={classNames(attributes)}
                tagName="a"
                {...anchorProps}
            >
                <span className="wpbs-cta-button__title">{title}</span>
                {/*<MaterialIcon
                    className="wpbs-cta-button__icon"
                    {...(settings?.icon ?? {})}
                />*/}
            </BlockWrapper>
        );
    }),
});