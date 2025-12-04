// wpbs-slider-navigation block

import { registerBlockType } from "@wordpress/blocks";
import metadata from "./block.json";

import { STYLE_ATTRIBUTES, withStyle, withStyleSave } from "Components/Style";
import { MaterialIcon } from "Components/IconControl";

const selector = "wpbs-slider-navigation";

const getClassNames = (attributes = {}) => {
    return [
        selector,
        attributes?.uniqueId ?? "",
    ]
        .filter(Boolean)
        .join(" ");
};

const getStyles = (attributes = {}) => {
    return Object.fromEntries(
        Object.entries({
            "--swiper-pagination-color":
                attributes?.[selector]?.["pagination-color"] || null,
            "--swiper-pagination-bullet-inactive-color":
                attributes?.[selector]?.["pagination-track-color"] || null,
        }).filter(([key, value]) => value)
    );
};

const NavigationContent = ({ props, options = {} }) => {
    const buttonClass = "wpbs-slider-nav__btn";

    const prevClass = [buttonClass, "wpbs-slider-nav__btn--prev wpbs-slider-btn--prev"]
        .filter(Boolean)
        .join(" ");

    const nextClass = [buttonClass, "wpbs-slider-nav__btn--next wpbs-slider-btn--next"]
        .filter(Boolean)
        .join(" ");

    const paginationClass = "wpbs-slider-nav__pagination swiper-pagination";

    return (
        <div {...props}>
            <button type="button" className={prevClass}>
                <MaterialIcon
                    className="wpbs-slider-nav__icon"
                    name={options?.["icon-prev"] ?? "chevron_left"}
                    size={24}
                    style={0}
                />
                <span className="screen-reader-text">Previous Slide</span>
            </button>

            {!!options?.pagination && <div className={paginationClass}></div>}

            <button type="button" className={nextClass}>
                <MaterialIcon
                    className="wpbs-slider-nav__icon"
                    name={options?.["icon-next"] ?? "chevron_right"}
                    size={24}
                    style={0}
                />
                <span className="screen-reader-text">Next Slide</span>
            </button>
        </div>
    );
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
            const { attributes, BlockWrapper } = props;
            const classNames = getClassNames(attributes);
            const styles = getStyles(attributes);

            return (
                <BlockWrapper props={props} className={classNames} style={styles}>
                    <NavigationContent props={{}} options={attributes[selector]} />
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
            const { attributes, BlockWrapper } = props;
            const classNames = getClassNames(attributes);
            const styles = getStyles(attributes);

            return (
                <BlockWrapper props={props} className={classNames} style={styles}>
                    <NavigationContent props={{}} options={attributes[selector]} />
                </BlockWrapper>
            );
        },
        {
            hasChildren: false,
            hasBackground: false,
        }
    ),
});