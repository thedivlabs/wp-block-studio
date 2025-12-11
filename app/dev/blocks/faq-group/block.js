import "./scss/block.css";

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {
    InspectorControls,
} from "@wordpress/block-editor";

import {
    PanelBody,
    SelectControl,
    Spinner,
    __experimentalGrid as Grid,
} from "@wordpress/components";

import {useSelect} from "@wordpress/data";

import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from "Components/Style";
import {useCallback, useEffect} from "@wordpress/element";
import {isEqual} from "lodash";
import {Field} from "Components/Field";
import {cleanObject} from "Includes/helper";
import {getIconCssProps, MaterialIcon} from "Components/IconControl";

const selector = "wpbs-faq-group";

const getClassNames = (attributes = {}, styleData) => {
    const {"wpbs-faq-group": settings} = attributes;

    return [
        selector,
        "w-full",
        "flex flex-col",
        "relative",
    ]
        .filter(Boolean)
        .join(" ");
};

function getCssProps(settings) {

    const divider = settings.divider ?? null;

    const css = {
        props: {
            "--divider": divider
        },
        breakpoints: {},
    };

    return cleanObject(css);
}


registerBlockType(metadata.name, {
    apiVersion: 3,

    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,

        "wpbs-faq-group": {
            type: "object",
            default: {},
        },
    },

    edit: withStyle(
        (props) => {
            const {attributes, setAttributes, BlockWrapper, styleData, setCss} = props;

            const {"wpbs-faq-group": settings = {}} = attributes;

            const isAccordion = (attributes?.className ?? '').includes('is-style-accordion') ? 'is-style-accordion' : false;
            const styleClass = isAccordion || null;

            const classNames = getClassNames(attributes, styleData);


            // ------------------------------------------
            // Fetch faq-group posts
            // ------------------------------------------
            const faqGroups = useSelect(
                (select) => {
                    return select("core").getEntityRecords(
                        "postType",
                        "faq",
                        {per_page: -1}
                    );
                },
                []
            );

            const isLoading = faqGroups === undefined;

            // Safe list for SelectControl
            const options = [
                {label: "Select a FAQ Group", value: ""},
                ...(Array.isArray(faqGroups)
                    ? faqGroups.map((post) => ({
                        label: post.title?.rendered || `#${post.id}`,
                        value: post.id,
                    }))
                    : []),
            ];

            useEffect(() => {
                setCss(getCssProps(settings));
            }, [settings]);

            const updateSettings = useCallback(
                (nextValue) => {
                    const next = {
                        ...settings,
                        ...nextValue,
                        styleClass, // always overwrite with live state
                    };

                    if (!isEqual(settings, next)) {
                        setAttributes({
                            "wpbs-faq-group": next,
                            "faqGroup": next.group ?? ""
                        });
                    }
                },
                [settings, styleClass, setAttributes]
            );


            return (
                <>
                    <InspectorControls group={"styles"}>
                        <PanelBody title="FAQ Settings" initialOpen={true}>
                            <Grid columns={1} columnGap={15} rowGap={20}>
                                {isLoading && <Spinner/>}

                                {!isLoading && (
                                    <SelectControl
                                        label="Select FAQ Group"
                                        value={settings.group ?? ""}
                                        options={options}
                                        onChange={(value) => updateSettings({group: value})}
                                        __next40pxDefaultSize
                                        __nextHasNoMarginBottom
                                    />
                                )}
                                <Field
                                    key={'divider'}
                                    field={{type: 'border', slug: 'divider', label: 'Divider', full: true}}
                                    settings={settings}
                                    callback={updateSettings}
                                    isToolsPanel={false}
                                    __next40pxDefaultSize
                                    __nextHasNoMarginBottom
                                />
                                <Field
                                    key={'icon'}
                                    field={{type: 'icon', slug: 'icon', label: 'Icon', full: true}}
                                    settings={settings}
                                    callback={updateSettings}
                                    isToolsPanel={false}
                                    props={props}
                                    __next40pxDefaultSize
                                    __nextHasNoMarginBottom
                                />

                                <Grid columns={1} columnGap={15} rowGap={20} style={{paddingTop: '15px'}}>
                                    <></>
                                </Grid>
                            </Grid>
                        </PanelBody>
                    </InspectorControls>

                    <BlockWrapper
                        props={props}
                        className={classNames}
                    >
                        <div className={'wpbs-faq-item w-full flex flex-col'}>
                            <div className={'wpbs-faq-header w-full flex items-center justify-between'}>
                                <span>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Et, repudiandae?</span>
                                <button className={'wpbs-faq-header__button'}>
                                    <MaterialIcon {...settings?.icon}/>
                                </button>
                            </div>
                            <div className={'wpbs-faq-content w-full'}>
                                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias architecto aspernatur
                                consequuntur deleniti deserunt dolore doloribus ducimus eos ex fugit in labore molestiae
                                numquam perferendis quos, recusandae repudiandae sit tempora.
                            </div>
                        </div>
                        <div className={'wpbs-faq-item'}>
                            <div className={'wpbs-faq-header w-full flex items-center justify-between'}>
                                <span>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Et, repudiandae?</span>
                                <button className={'wpbs-faq-header__button'}>
                                    <MaterialIcon {...settings?.icon}/>
                                </button>
                            </div>
                            <div className={'wpbs-faq-content'}>
                                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias architecto aspernatur
                                consequuntur deleniti deserunt dolore doloribus ducimus eos ex fugit in labore molestiae
                                numquam perferendis quos, recusandae repudiandae sit tempora.
                            </div>
                        </div>
                        <div className={'wpbs-faq-item'}>
                            <div className={'wpbs-faq-header w-full flex items-center justify-between'}>
                                <span>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Et, repudiandae?</span>
                                <button className={'wpbs-faq-header__button'}>
                                    <MaterialIcon {...settings?.icon}/>
                                </button>
                            </div>
                            <div className={'wpbs-faq-content'}>
                                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias architecto aspernatur
                                consequuntur deleniti deserunt dolore doloribus ducimus eos ex fugit in labore molestiae
                                numquam perferendis quos, recusandae repudiandae sit tempora.
                            </div>
                        </div>
                    </BlockWrapper>
                </>
            );
        },
        {hasChildren: false}
    ),

    save: withStyleSave(
        (props) => {
            const {attributes, styleData, BlockWrapper} = props;
            const classNames = getClassNames(attributes, styleData);

            return (
                <BlockWrapper
                    props={props}
                    className={classNames}
                >
                    {'%%__FAQ_CONTENT__%%'}
                </BlockWrapper>
            );
        },
        {hasChildren: false}
    ),
});
