import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from "Components/Style";
import {IconControl, getIconCssProps, MaterialIcon} from "Components/IconControl";
import {useCallback, useEffect, useMemo} from "@wordpress/element";
import {cleanObject, getCSSFromStyle} from "Includes/helper";
import {
    __experimentalGrid as Grid,
    BaseControl,
    PanelBody,
    SelectControl,
    TextControl,
    ToggleControl
} from "@wordpress/components";
import {InspectorControls} from "@wordpress/block-editor";
import {isEqual, merge} from "lodash";

const selector = "wpbs-slider-navigation";

const getClassNames = (attributes = {}) => {

    const {'wpbs-slider-navigation': settings = {}} = attributes;

    const isGroup = attributes?.className.includes("is-style-group");

    return [
        selector,
        isGroup && settings?.compact ? 'w-fit --compact' : 'w-full',
        isGroup && settings?.justify ? `justify-${settings.justify}` : null,
    ]
        .filter(Boolean)
        .join(" ");
};


const getStyles = (attributes = {}) => {

    const {'wpbs-slider-navigation': settings = {}} = attributes;

    const style = attributes.style || {};
    const elements = style.elements || {};
    const link = elements.link || {};

    const linkColor = link.color?.text;
    const linkHoverColor = link[':hover']?.color?.text;
    const backgroundColor = attributes.backgroundColor;
    const fontSize = attributes.fontSize;
    const letterSpacing = style.typography?.letterSpacing;

    return {
        props: Object.fromEntries(
            Object.entries({

                // Navigation arrows
                "--swiper-navigation-color": getCSSFromStyle(linkColor, 'color'),
                "--swiper-navigation-hover-color": getCSSFromStyle(linkHoverColor, 'color'),
                "--swiper-navigation-size": getCSSFromStyle(fontSize, 'font-size'),

                // Pagination bullets
                "--swiper-pagination-color": getCSSFromStyle(linkColor, 'color'),
                "--swiper-pagination-hover-color": getCSSFromStyle(linkHoverColor, 'color'),
                "--swiper-pagination-bullet-inactive-color": getCSSFromStyle(backgroundColor, 'color'),
                "--swiper-pagination-bullet-horizontal-gap": getCSSFromStyle(letterSpacing, 'spacing'),
                "--swiper-pagination-bullet-vertical-gap": getCSSFromStyle(letterSpacing, 'spacing'),
                "--swiper-pagination-bullet-size": getCSSFromStyle(fontSize, 'font-size'),

                // Fraction
                "--swiper-pagination-fraction-color": getCSSFromStyle(linkColor, 'color'),
                "--swiper-pagination-fraction-font-size": getCSSFromStyle(fontSize, 'font-size'),

                // Progressbar background
                "--swiper-pagination-progressbar-bg-color": getCSSFromStyle(backgroundColor, 'color')
            }).filter(([_, value]) => value !== undefined && value !== null)
        )
    };
};

const NavigationContent = ({options = {}, context = {}}) => {
    const buttonClass = "wpbs-slider-button";

    const prevClass = [buttonClass, "wpbs-slider-button--prev", 'swiper-button-prev'].join(" ");

    const nextClass = [buttonClass, "wpbs-slider-button--next", 'swiper-button-next'].join(" ");

    const paginationClass = "wpbs-slider-pagination swiper-pagination";

    return (
        <>
            <button type="button" className={prevClass}>
                <span className="screen-reader-text">Previous Slide</span>
                <MaterialIcon {...options?.['icon-prev']} defaultName={'arrow_back'}/>
            </button>

            {!!options?.['pagination'] && (<div className={paginationClass}></div>)}

            <button type="button" className={nextClass}>
                <span className="screen-reader-text">Next Slide</span>
                <MaterialIcon {...options?.['icon-next']} defaultName={'arrow_forward'}/>
            </button>
        </>
    );
};

const GroupedNavigation = ({options = {}, context = {}}) => (
    <NavigationContent options={options} context={context}/>
);


registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        "wpbs-slider-navigation": {
            type: "object",
            default: {},
        },
    },

    edit: withStyle(
        (props) => {
            const {attributes, BlockWrapper, context, setCss, setAttributes} = props;
            const classNames = getClassNames(attributes);
            const {'wpbs-slider-navigation': settings = {}} = attributes;
            const isGroup = attributes?.className.includes("is-style-group");

            const styles = useMemo(
                () => getStyles(attributes),
                [
                    settings,
                    attributes.backgroundColor,
                    attributes.fontSize,
                    attributes.style?.typography?.letterSpacing,
                    attributes.style?.elements?.link?.color?.text,
                    attributes.style?.elements?.link?.[':hover']?.color?.text
                ]
            );

            useEffect(() => {
                setCss(styles);
            }, [styles]);

            const updateSettings = useCallback(
                (newValues) => {

                    const newSettings = merge({}, settings, newValues);

                    setAttributes({
                        "wpbs-slider-navigation": newSettings,
                    });
                },
                [settings, setAttributes]
            );

            return (
                <>
                    <InspectorControls group="styles">
                        <PanelBody
                            initialOpen={false}
                            className="wpbs-block-controls"
                            title={"Slider Navigation"}
                        >
                            <Grid columns={1} columnGap={15} rowGap={20}>
                                <IconControl
                                    fieldKey={'icon-next'}
                                    label={'Icon Next'}
                                    props={props}
                                    defaultName={'arrow_forward'}
                                    value={settings?.['icon-next']}
                                    onChange={(val) => updateSettings({['icon-next']: val})}
                                />
                                <IconControl
                                    fieldKey={'icon-prev'}
                                    label={'Icon Prev'}
                                    props={props}
                                    defaultName={'arrow_back'}
                                    value={settings?.['icon-prev']}
                                    onChange={(val) => updateSettings({['icon-prev']: val})}
                                />
                                {isGroup && (<BaseControl label={'Group Options'}>
                                    <Grid columns={2} columnGap={15} rowGap={20}>
                                        <SelectControl
                                            __nextHasNoMarginBottom
                                            __next40pxDefaultSize
                                            label={'Justify'}
                                            value={settings?.align}
                                            options={[
                                                {label: 'Select', value: ''},
                                                {label: 'Center', value: 'center'},
                                                {label: 'Start', value: 'start'},
                                                {label: 'End', value: 'end'},
                                                {label: 'Between', value: 'between'},
                                            ]}
                                            onChange={(val) => updateSettings({style: val})}
                                        />
                                    </Grid>
                                    <Grid columns={2} columnGap={15} rowGap={20} style={{paddingTop: '25px'}}>
                                        <ToggleControl
                                            label={'Compact'}
                                            checked={!!settings?.['compact']}
                                            onChange={(val) => updateSettings({['compact']: !!val})}
                                            __nextHasNoMarginBottom
                                        />
                                        <ToggleControl
                                            label={'Pagination'}
                                            checked={!!settings?.['pagination']}
                                            onChange={(val) => updateSettings({['pagination']: !!val})}
                                            __nextHasNoMarginBottom
                                        />
                                    </Grid>
                                </BaseControl>)}

                            </Grid>
                        </PanelBody>
                    </InspectorControls>
                    <BlockWrapper props={props} className={classNames} style={{backgroundColor: 'transparent'}}>
                        {isGroup ? (
                            <GroupedNavigation options={attributes[selector]} context={context}/>
                        ) : (
                            <NavigationContent options={attributes[selector]} context={context}/>
                        )}
                    </BlockWrapper>
                </>
            );
        },
        {
            hasChildren: false,
            hasBackground: false,
        }
    ),

    save: withStyleSave(
        (props) => {
            const {attributes, BlockWrapper} = props;
            const classNames = getClassNames(attributes);

            const isGroup = classNames.includes("is-style-group");

            return (
                <BlockWrapper props={props} className={classNames}>
                    {isGroup ? (
                        <GroupedNavigation options={attributes[selector]}/>
                    ) : (
                        <NavigationContent options={attributes[selector]}/>
                    )}
                </BlockWrapper>
            );
        },
        {
            hasChildren: false,
            hasBackground: false,
        }
    ),
});