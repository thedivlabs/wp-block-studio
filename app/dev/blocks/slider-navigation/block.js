// wpbs-slider-navigation block

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from "Components/Style";
import {IconControl, MaterialIcon} from "Components/IconControl";
import {useCallback, useEffect, useMemo} from "@wordpress/element";
import {getCSSFromStyle} from "Includes/helper";
import {__experimentalGrid as Grid, PanelBody, TextControl} from "@wordpress/components";
import {InspectorControls} from "@wordpress/block-editor";
import {merge, isEqual} from "lodash";

const selector = "wpbs-slider-navigation";

const getClassNames = (attributes = {}) => {
    return [
        selector,
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
                "--swiper-navigation-icon-prev": settings?.['icon-prev']?.name,
                "--swiper-navigation-icon-next": settings?.['icon-next']?.name,
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
                <MaterialIcon
                    className="wpbs-slider-nav__icon"
                    name={options?.["icon-prev"] ?? "arrow_back"}
                    size={24}
                />
                <span className="screen-reader-text">Previous Slide</span>
            </button>

            <div className={paginationClass}></div>

            <button type="button" className={nextClass}>
                <MaterialIcon
                    className="wpbs-slider-nav__icon"
                    name={options?.["icon-next"] ?? "arrow_forward"}
                    size={24}
                />
                <span className="screen-reader-text">Next Slide</span>
            </button>
        </>
    );
};

const GroupedNavigation = ({options = {}, context = {}}) => (
    <div className="wpbs-slider-navigation__group">
        <NavigationContent options={options} context={context}/>
    </div>
);


registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        [selector]: {
            type: "object",
            default: {},
        },
    },

    edit: withStyle(
        (props) => {
            const {attributes, BlockWrapper, context, setCss, setAttributes} = props;
            const classNames = getClassNames(attributes);
            const {'wpbs-slider-navigation': settings = {}} = attributes;
            const isGroup = classNames.includes("is-style-group");

            const styles = useMemo(
                () => getStyles(attributes),
                [
                    attributes.backgroundColor,
                    attributes.fontSize,
                    attributes.style?.typography?.letterSpacing,
                    attributes.style?.elements?.link?.color?.text,
                    attributes.style?.elements?.link?.[':hover']?.color?.text
                ]
            );

            useEffect(() => {
                console.log(styles);
                console.log(attributes);

                setCss(styles);
            }, [styles]);

            const updateSettings = useCallback(
                (newValues = {}) => {
                    const merged = merge({}, settings, newValues);

                    if (!isEqual(settings, merged)) {
                        setAttributes({'wpbs-slider-navigation': merged});
                    }
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
                            <Grid
                                columns={1}
                                columnGap={15}
                                rowGap={20}
                            >
                                <IconControl
                                    fieldKey={'icon-next'}
                                    label={'Icon Next'}
                                    props={props}
                                    value={settings?.['icon-next']}
                                    onChange={(val) => updateSettings({['icon-next']: val})}
                                />
                                <IconControl
                                    fieldKey={'icon-prev'}
                                    label={'Icon Prev'}
                                    props={props}
                                    value={settings?.['icon-prev']}
                                    onChange={(val) => updateSettings({['icon-prev']: val})}
                                />
                            </Grid>
                        </PanelBody>
                    </InspectorControls>
                    <BlockWrapper props={props} className={classNames}>
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