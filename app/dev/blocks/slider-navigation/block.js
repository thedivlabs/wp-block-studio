// wpbs-slider-navigation block

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from "Components/Style";
import {MaterialIcon} from "Components/IconControl";
import {useEffect, useMemo} from "@wordpress/element";

const selector = "wpbs-slider-navigation";

const getClassNames = (attributes = {}) => {
    return [
        selector,
    ]
        .filter(Boolean)
        .join(" ");
};

const getStyles = (attributes = {}) => {
    const style = attributes.style || {};
    const elements = style.elements || {};
    const link = elements.link || {};
    const linkColor = link.color?.text;
    const linkHoverColor = link[':hover']?.color?.text;
    const backgroundColor = attributes.backgroundColor;
    const fontSize = attributes.fontSize;
    const letterSpacing = style.typography?.letterSpacing;

    return Object.fromEntries(
        Object.entries({
            // Navigation arrows
            "--swiper-navigation-color": linkColor,
            "--swiper-navigation-hover-color": linkHoverColor,
            "--swiper-navigation-size": fontSize,

            // Pagination bullets
            "--swiper-pagination-color": linkColor,
            "--swiper-pagination-hover-color": linkHoverColor,
            "--swiper-pagination-bullet-inactive-color": backgroundColor,
            "--swiper-pagination-bullet-horizontal-gap": letterSpacing,
            "--swiper-pagination-bullet-vertical-gap": letterSpacing,
            "--swiper-pagination-bullet-size": fontSize,

            // Fraction
            "--swiper-pagination-fraction-color": linkColor,
            "--swiper-pagination-fraction-font-size": fontSize
        }).filter(([_, value]) => value !== undefined && value !== null)
    );
};


const NavigationContent = ({options = {}, context = {}}) => {
    const buttonClass = "wpbs-slider-button";

    const prevClass = [buttonClass, "wpbs-slider-button--prev"].join(" ");

    const nextClass = [buttonClass, "wpbs-slider-button--next"].join(" ");

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
            const {attributes, BlockWrapper, context, setCss} = props;
            const classNames = getClassNames(attributes);
            const styles = useMemo(() => getStyles(attributes), [
                attributes.style?.elements?.link?.color?.text,
                attributes.style?.elements?.link?.[':hover']?.color?.text,
                attributes.style?.typography?.letterSpacing,
                attributes.backgroundColor,
                attributes.fontSize
            ]);


            useEffect(() => {
                console.log(context);
                console.log(attributes);

                setCss(styles);
            }, [styles]);

            const isGroup = classNames.includes("is-style-group");

            return (
                <BlockWrapper props={props} className={classNames} style={styles}>
                    {isGroup ? (
                        <GroupedNavigation options={attributes[selector]} context={context}/>
                    ) : (
                        <NavigationContent options={attributes[selector]} context={context}/>
                    )}
                </BlockWrapper>
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
            const styles = getStyles(attributes);

            const isGroup = classNames.includes("is-style-group");

            return (
                <BlockWrapper props={props} className={classNames} style={styles}>
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