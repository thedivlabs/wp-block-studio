import './scss/block.scss'

import {
    InspectorControls,
    PanelColorSettings,
} from "@wordpress/block-editor";

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {
    __experimentalGrid as Grid,
    __experimentalUnitControl as UnitControl,
    PanelBody,
    TabPanel,
    ToggleControl
} from "@wordpress/components";

import {useMemo, useCallback, useEffect} from '@wordpress/element';

import Link from "Components/Link.js";
import {IconControl, FontAwesomeIcon} from "Components/IconControl";
import PopupSelector from "Components/PopupSelector";

import {
    withStyle,
    withStyleSave,
    STYLE_ATTRIBUTES
} from 'Components/Style';

function classNames(attributes = {}) {
    const {'wpbs-cta': settings = {}} = attributes;

    return [
        'wpbs-cta-button',
        'relative',
        //!settings?.['is-link'] ? 'wp-element-button' : null,
        settings?.['icon'] && '--icon',
        settings?.['icon-hide'] && '--icon-hide',
        settings?.['icon-bold'] && '--icon-bold',
        settings?.['icon-only'] && '--icon-only',
        settings?.['icon-first'] && '--icon-first',
        settings?.['offset'] && '--offset',
        settings?.['offset-icon'] && '--offset-icon',
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

                <Grid columns={2} columnGap={15} rowGap={20}>
                    <UnitControl
                        label="Offset"
                        value={settings?.offset}
                        units={[{value: "px", label: "px"}]}
                        onChange={(offset) => updateSettings({offset: offset})}
                        isResetValueOnUnitChange
                        __nextHasNoMarginBottom
                        __next40pxDefaultSize
                    />
                    <UnitControl
                        label="Offset Icon"
                        value={settings?.['offset-icon']}
                        units={[{value: "px", label: "px"}]}
                        onChange={(offset) => updateSettings({'offset-icon': offset})}
                        isResetValueOnUnitChange
                        __nextHasNoMarginBottom
                        __next40pxDefaultSize
                    />
                </Grid>

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
            </Grid>
        ), [attributes?.['wpbs-cta']]);

        // ----------------------------------------
        // TAB: ICON
        // ----------------------------------------
        const tabIcon = useMemo(() => (
            <Grid columns={1} columnGap={15} rowGap={20}>
                <IconControl
                    label="Icon"
                    fieldKey="cta-icon"
                    value={settings?.icon ?? {}}
                    onChange={(icon) => updateSettings({'icon': icon})}
                    props={props}
                />

                <Grid columns={2} columnGap={15} rowGap={20} style={{padding: '1rem 0'}}>
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

                {/* PanelColorSettings removed – color now lives on settings.icon */}
            </Grid>
        ), [attributes?.['wpbs-cta']]);

        // ----------------------------------------
        // LINK SETTINGS
        // ----------------------------------------
        const {title = 'Learn more', linkNewTab = false} = settings?.link ?? {};

        const anchorProps = {
            title,
            href: settings?.popup ? '#' : '%%URL%%',
            target: linkNewTab ? '_blank' : '_self',
            ...(settings?.popup && {role: 'button'}),
            onClick: (e) => e.preventDefault(),
        };

        // ----------------------------------------
        // CSS OUTPUT
        // ----------------------------------------
        const cssObj = useMemo(() => ({
            props: {
                '--icon-color': settings?.icon?.color || null,
                '--icon-gradient': settings?.icon?.gradient || null,
                '--offset': settings?.['offset'] || null,
                '--offset-icon': settings?.['offset-icon'] || null,
            },
            breakpoints: {
                xs: {'--testing': '20px'}
            }
        }), [settings]);

        // FINAL: send to HOC's applyCss
        useEffect(() => {
            setCss(cssObj);
        }, [cssObj]);

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
                                        return null;
                                }
                            }}
                        </TabPanel>
                    </PanelBody>
                </InspectorControls>

                <BlockWrapper
                    props={props}
                    className={computedClassName}
                    {...anchorProps}
                >
                    <span className="wpbs-cta-button__title relative">{title}</span>
                    <FontAwesomeIcon
                        className="wpbs-cta-button__icon"
                        {...(settings?.icon ?? {})}
                        isEditor={true}
                    />
                </BlockWrapper>
            </>
        );
    }, {
        tagName: "div",
    }),

    save: withStyleSave((props) => {
        const {attributes, BlockWrapper} = props;
        const {'wpbs-cta': settings = {}} = attributes;

        const {title = 'Learn more', linkNewTab = false} = settings?.link ?? {};

        const anchorProps = {
            title,
            href: settings?.popup ? '#' : '%%URL%%',
            target: linkNewTab ? '_blank' : '_self',
            ...(settings?.popup && {role: 'button'}),
            ...(settings?.popup && {onClick: (e) => e.preventDefault()}),
            'data-popup': settings?.popup ?? null,
        };

        return (
            <BlockWrapper
                props={props}
                className={classNames(attributes)}
                {...anchorProps}
            >
                <span className="wpbs-cta-button__title">{'Learn more'}</span>
                <FontAwesomeIcon
                    className="wpbs-cta-button__icon"
                    {...(settings?.icon ?? {})}
                />
            </BlockWrapper>
        );
    }, {
        tagName: "a",
    }),
});