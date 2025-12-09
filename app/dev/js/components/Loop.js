import {useSelect} from "@wordpress/data";
import {store as coreStore} from "@wordpress/core-data";
import {
    SelectControl,
    __experimentalGrid as Grid,
    __experimentalToolsPanel as ToolsPanel,
    ToggleControl,
} from "@wordpress/components";
import {useCallback, useEffect, useState} from "@wordpress/element";
import {loopFieldsMap} from "Includes/config";
import {Field} from "Components/Field";
import {PostSelectField} from "Components/PostSelectField";
import {isEqual} from "lodash";

export const LOOP_ATTRIBUTES = {
    "wpbs-loop": {type: "object", default: {}},
    "wpbs-query": {type: "object", default: {}},
};

// -------------------------------------------------------
// LoopAdvancedSettings — ToolsPanel
// -------------------------------------------------------
export const LoopAdvancedSettings = ({settings = {}, update}) => {
    return (
        <ToolsPanel
            label="Advanced Settings"
            className="wpbs-loop-tools is-style-unstyled"
            resetAll={() => update({}, true)}
            style={{marginTop: "15px"}}
        >
            {loopFieldsMap.map((field) => (
                <Field
                    key={field.slug}
                    field={field}
                    settings={settings}
                    callback={update}
                    isToolsPanel={true}
                />
            ))}
        </ToolsPanel>
    );
};

// -------------------------------------------------------
// Loop component
// -------------------------------------------------------
export const Loop = ({attributes = {}, setAttributes}) => {
    const settings = attributes?.["wpbs-loop"] || {};
    const [localSettings, setLocalSettings] = useState({...settings});

    const {post_type, taxonomy, term, exclude, include, loopTerms} = localSettings;

    // ------------------------
    // WordPress selectors
    // ------------------------
    const postTypes = useSelect((select) => {
        const types = select(coreStore).getPostTypes({per_page: -1});
        if (!types) return [];
        return Object.values(types).filter((type) => type?.viewable && type.slug !== "attachment");
    }, []);

    const taxonomies = useSelect((select) => {
        const items = select(coreStore).getTaxonomies();
        if (!items) return [];
        return items.filter((t) => t.visibility?.public);
    }, []);

    const terms = useSelect(
        (select) => {
            if (!taxonomy) return [];
            const args = {per_page: -1, hide_empty: false};
            const records = select(coreStore).getEntityRecords("taxonomy", taxonomy, args);
            return records || [];
        },
        [taxonomy]
    );

    // ------------------------
    // Unified update handler
    // ------------------------
    const update = useCallback(
        (patch = {}, reset = false) => {
            const next = reset ? {} : {...localSettings, ...patch};
            if (isEqual(localSettings, next)) return;

            setLocalSettings(next);

            setAttributes({
                "wpbs-loop": next,
                "wpbs-query": next,
            });
        },
        [localSettings, setAttributes]
    );

    // ------------------------
    // Render
    // ------------------------
    return (
        <Grid columns={1} rowGap={16}>
            <SelectControl
                label="Post Type"
                value={post_type || ""}
                options={[
                    {value: "", label: "Select a post type"},
                    {value: "current", label: "Archive"},
                    {label: "— Registered Post Types", value: "", disabled: true},
                    ...(postTypes || []).map((pt) => ({value: pt.slug, label: pt.name})),
                ]}
                onChange={(newValue) => update({post_type: newValue, taxonomy: "", term: ""})}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />

            <SelectControl
                label="Taxonomy"
                value={taxonomy || ""}
                options={[
                    {value: "", label: "Select a taxonomy"},
                    ...(taxonomies || []).map((tax) => ({value: tax.slug, label: tax.name})),
                ]}
                onChange={(newValue) => update({taxonomy: newValue, term: ""})}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />

            <SelectControl
                label="Term"
                value={term || ""}
                options={[
                    {value: "", label: "Select a term"},
                    {value: "current", label: "Archive"},
                    {label: "— Registered Terms", value: "", disabled: true},
                    ...(terms || []).map((t) => ({value: t.id, label: t.name})),
                ]}
                onChange={(newValue) => update({term: newValue})}
                disabled={!taxonomy}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />

            <PostSelectField
                value={include}
                onChange={(newValue) => update({include: newValue})}
                label="Select Posts"
                querySettings={localSettings}
            />

            <PostSelectField
                value={exclude}
                onChange={(newValue) => update({exclude: newValue})}
                label="Exclude Posts"
                querySettings={localSettings}
            />

            <ToggleControl
                checked={!!loopTerms}
                onChange={(newValue) => update({loopTerms: !!newValue})}
                label="Loop Terms"
            />

            <LoopAdvancedSettings settings={localSettings} update={update}/>
        </Grid>
    );
};
