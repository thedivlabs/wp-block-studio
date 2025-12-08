import {useSelect} from "@wordpress/data";
import {store as coreStore} from "@wordpress/core-data";
import {
    SelectControl,
    __experimentalGrid as Grid,
    __experimentalToolsPanel as ToolsPanel,
    ToggleControl
} from "@wordpress/components";
import {useCallback, useState} from "@wordpress/element";
import {loopFieldsMap} from "Includes/config";
import {Field} from "Components/Field";
import {PostSelectField} from "Components/PostSelectField";
import {isEqual} from "lodash";


export const LoopBasicSettings = ({value = {}, onChange}) => {

    const update = (patch, reset = false) => {
        if (reset) {
            onChange({});
            return;
        }
        onChange({...value, ...patch});
    };

    return (
        <ToolsPanel
            label="Advanced Settings"
            className="wpbs-loop-tools is-style-unstyled"
            resetAll={() => update({}, true)}
            style={{marginTop: '15px'}}
        >
            {loopFieldsMap.map((field) => (
                <Field
                    key={field.slug}
                    field={field}
                    settings={value}
                    callback={(obj) => update(obj)}
                    isToolsPanel={true}
                />
            ))}
        </ToolsPanel>
    );
};

// Loop component
export const Loop = ({ value = {}, onChange, setAttributes }) => {
    const { post_type, taxonomy, term, exclude, include, loopTerms } = value;

    // Selectors
    const postTypes = useSelect((select) => {
        const types = select(coreStore).getPostTypes({ per_page: -1 });
        if (!types) return null;
        return Object.values(types).filter((type) => type?.viewable && type.slug !== "attachment");
    }, []);

    const taxonomies = useSelect((select) => {
        const items = select(coreStore).getTaxonomies();
        if (!items) return null;
        return items.filter((t) => t.visibility?.public);
    }, []);

    const terms = useSelect(
        (select) => {
            if (!taxonomy) return [];
            const args = { per_page: -1, hide_empty: false };
            const records = select(coreStore).getEntityRecords("taxonomy", taxonomy, args);
            return records || [];
        },
        [taxonomy]
    );

    // Unified update handler
    const update = useCallback(
        (patch) => {
            const nextValue = { ...value, ...patch };

            // Only update if the new value actually differs
            if (!isEqual(value, nextValue)) {
                onChange(nextValue); // update the loop object in wpbs-slider
                setAttributes({ 'wpbs-query': nextValue }); // directly update wpbs-query
            }
        },
        [value, onChange, setAttributes]
    );

    return (
        <Grid columns={1} rowGap={16}>
            <SelectControl
                label="Post Type"
                value={post_type || ""}
                options={[
                    { value: "", label: "Select a post type" },
                    { value: "current", label: "Archive" },
                    { label: "— Registered Post Types", value: "", disabled: true },
                    ...(postTypes || []).map((pt) => ({ value: pt.slug, label: pt.name })),
                ]}
                onChange={(newValue) => update({ post_type: newValue, taxonomy: "", term: "" })}
            />

            <SelectControl
                label="Taxonomy"
                value={taxonomy || ""}
                options={[
                    { value: "", label: "Select a taxonomy" },
                    ...(taxonomies || []).map((tax) => ({ value: tax.slug, label: tax.name })),
                ]}
                onChange={(newValue) => update({ taxonomy: newValue, term: "" })}
            />

            <SelectControl
                label="Term"
                value={term || ""}
                options={[
                    { value: "", label: "Select a term" },
                    { value: "current", label: "Archive" },
                    { label: "— Registered Terms", value: "", disabled: true },
                    ...(terms || []).map((t) => ({ value: t.id, label: t.name })),
                ]}
                onChange={(newValue) => update({ term: newValue })}
                disabled={!taxonomy}
            />

            <PostSelectField
                value={include}
                onChange={(newValue) => update({ include: newValue })}
                label="Select Posts"
                querySettings={value}
            />

            <PostSelectField
                value={exclude}
                onChange={(newValue) => update({ exclude: newValue })}
                label="Exclude Posts"
                querySettings={value}
            />

            <ToggleControl
                checked={!!loopTerms}
                onChange={(newValue) => update({ loopTerms: !!newValue })}
                label="Loop Terms"
            />

            <LoopBasicSettings value={value} onChange={update} />
        </Grid>
    );
};