// wpbs-slider-navigation block

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from "Components/Style";
import {MaterialIcon} from "Components/IconControl";
import {useEffect} from "@wordpress/element";

const selector = "wpbs-slider-navigation";

const getClassNames = (attributes = {}) => {
    return [
        selector,
    ]
        .filter(Boolean)
        .join(" ");
};

const getStyles = (attributes = {}) => {
    const opts = attributes[selector] || DEFAULT_SETTINGS;

    return Object.fromEntries(
        Object.entries({
            "--swiper-navigation-color": opts.linkColor,
            "--swiper-navigation-size": opts.fontSize,
            "--swiper-pagination-color": opts.linkColor,
            "--swiper-pagination-bullet-inactive-color": opts.backgroundColor,
            "--swiper-pagination-bullet-horizontal-gap": opts.letterSpacing,
            "--swiper-pagination-bullet-vertical-gap": opts.letterSpacing,
            "--swiper-pagination-bullet-size": opts.fontSize,
            "--swiper-pagination-fraction-color": opts.linkColor,
            "--swiper-pagination-fraction-font-size": opts.fontSize
        }).filter(([_, value]) => value !== undefined && value !== null)
    );
};


const NavigationContent = ({options = {}, context = {}}) => {
    const buttonClass = "wpbs-slider-button";

    const prevClass = [buttonClass, "wpbs-slider-button--prev"].join(" ");

    const nextClass = [buttonClass, "wpbs-slider-button--next"].join(" ");

    const paginationClass = "wpbs-slider-nav__pagination swiper-pagination";

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

// wpbs-slider-navigation default settings (flat)
export const DEFAULT_SETTINGS = {
    backgroundColor: "",                  // color.background
    fontSize: "",                         // typography.fontSize
    linkColor: "",                        // color.link
    linkHoverColor: "",                   // link hover color
    blockGap: "",                         // spacing.blockGap
    letterSpacing: ""                     // typography.letterSpacing (for bullets)
};


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
            const {attributes, BlockWrapper, context} = props;
            const classNames = getClassNames(attributes);
            const styles = getStyles(attributes);


            useEffect(() => {
                console.log(context);
                console.log(attributes);
            }, [attributes?.style]);

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