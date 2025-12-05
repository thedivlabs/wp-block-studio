import "./scss/block.scss";

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from "Components/Style";
import {useMemo, useCallback} from "@wordpress/element";
import {InnerBlocks, InspectorControls} from "@wordpress/block-editor";
import {PanelBody, __experimentalGrid as Grid} from "@wordpress/components";
import {BreakpointPanels} from "Components/BreakpointPanels";
import {Field} from "Components/Field";
import Link from "Components/Link";

// ------------------------
// Slide control fields
// ------------------------
import {ORIGIN_OPTIONS, RESOLUTION_OPTIONS} from "Includes/config";

const IMAGE_FIELDS = [
    {slug: "image", type: "image", label: "Image", full: true},
    {slug: "resolution", type: "select", label: "Size", options: RESOLUTION_OPTIONS},
];

const BASE_STYLE_FIELDS = [
    {slug: "contain", type: "toggle", label: "Contain"},
    {slug: "origin", type: "select", label: "Origin", options: ORIGIN_OPTIONS},
    {slug: "eager", type: "toggle", label: "Eager"},
];

const BREAKPOINT_STYLE_FIELDS = [
    {slug: "contain", type: "toggle", label: "Contain"},
    {slug: "origin", type: "select", label: "Origin", options: ORIGIN_OPTIONS},
];

// ------------------------
// Normalize settings
// ------------------------
const normalizeSettings = (raw) => {
    if (raw && (raw.props || raw.breakpoints)) {
        return {props: raw.props || {}, breakpoints: raw.breakpoints || {}};
    }
    return {props: raw || {}, breakpoints: {}};
};

// ------------------------
// Slide Inspector
// ------------------------
function SlideInspector({attributes, updateSettings}) {
    const rawSettings = attributes["wpbs-slide"] || {};
    const value = useMemo(() => normalizeSettings(rawSettings), [rawSettings]);

    const sharedConfig = useMemo(() => ({isToolsPanel: false}), []);

    const LinkControls = useMemo(() => (
        <Link
            defaultValue={value?.props?.link}
            callback={(val) =>
                updateSettings({...value, props: {...(value.props || {}), link: val}})
            }
        />
    ), [value, updateSettings]);

    const handlePanelsChange = useCallback(
        (nextValue) => updateSettings(normalizeSettings(nextValue)),
        [updateSettings]
    );

    const renderFields = useCallback(
        (entry, updateEntry, bpKey) => {
            const settings = entry?.props || {};
            const applyPatch = (patch) => updateEntry({...entry, props: {...entry.props, ...patch}});

            return (
                <Grid columns={2} columnGap={15} rowGap={20} style={{padding: 12}}>
                    {/* IMAGE FIELDS */}
                    {!bpKey && IMAGE_FIELDS.map(field => (
                        <Field key={field.slug} field={field} settings={settings} callback={applyPatch} {...sharedConfig} />
                    ))}

                    {/* STYLE FIELDS */}
                    {(bpKey ? BREAKPOINT_STYLE_FIELDS : BASE_STYLE_FIELDS).map(field => (
                        <Field key={field.slug} field={field} settings={settings} callback={applyPatch} {...sharedConfig} />
                    ))}
                </Grid>
            );
        },
        [sharedConfig]
    );

    const renderBase = useCallback(({entry, update}) => renderFields(entry, update, false), [renderFields]);
    const renderBreakpoints = useCallback(({entry, update, bpKey}) => renderFields(entry, update, bpKey), [renderFields]);

    return (
        <>
            {LinkControls}

            <InspectorControls group="styles">
                <PanelBody initialOpen={false} className="wpbs-block-controls is-style-unstyled" title="Slide">
                    <BreakpointPanels value={value} onChange={handlePanelsChange} render={{base: renderBase, breakpoints: renderBreakpoints}} />
                </PanelBody>
            </InspectorControls>
        </>
    );
}

// ------------------------
// Get classes
// ------------------------
const getClassNames = (attributes = {}) => ["wpbs-slide", "w-full", "flex", "swiper-slide"].join(" ");

// ------------------------
// Register Slide block
// ------------------------
registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        "wpbs-slide": {type: "object", default: {}},
    },

    edit: withStyle((props) => {
        const {attributes, BlockWrapper, setAttributes} = props;
        const classNames = getClassNames(attributes);

        const updateSettings = useCallback((nextValue) => setAttributes({"wpbs-slide": nextValue}), [setAttributes]);

        return (
            <>
                <SlideInspector attributes={attributes} updateSettings={updateSettings} />
                <BlockWrapper props={props} className={classNames} />
            </>
        );
    }, {hasChildren: true, hasBackground: true}),

    save: withStyleSave((props) => {
        const {attributes, BlockWrapper} = props;
        const classNames = getClassNames(attributes);

        return (
            <BlockWrapper props={props} className={classNames}>
                <InnerBlocks.Content />
            </BlockWrapper>
        );
    }, {hasChildren: true, hasBackground: true}),
});