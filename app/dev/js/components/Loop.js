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


export const Loop = ({value = {}, onChange}) => {
    const {post_type, taxonomy, term, exclude, include, loopTerms} = value;

    const postTypes = useSelect((select) => {
        const types = select(coreStore).getPostTypes({per_page: -1});
        if (!types) return null;
        return Object.values(types).filter(
            (type) => type?.viewable && type.slug !== "attachment"
        );
    }, []);

    const taxonomies = useSelect((select) => {
        const items = select(coreStore).getTaxonomies();
        if (!items) return null;
        return items.filter((t) => t.visibility?.public);
    }, []);

    const terms = useSelect(
        (select) => {
            if (!taxonomy && !loopTerms) return [];
            const args = {per_page: -1, hide_empty: false};
            const records = select(coreStore).getEntityRecords("taxonomy", taxonomy, args);
            return records || [];
        },
        [taxonomy]
    );

    const update = useCallback(
        (patch) => onChange({...value, ...patch}),
        [value, onChange]
    );

    const postTypeOptions = [
        {value: "", label: "Select a post type"},
        {value: "current", label: "Current Post"},
        {label: "— Registered Post Types", value: "", disabled: true},
        ...(postTypes || []).map((pt) => ({
            value: pt.slug,
            label: pt.name,
        })),
    ];

    const taxonomyOptions = [
        {value: "", label: "Select a taxonomy"},
        ...(taxonomies || []).map((tax) => ({
            value: tax.slug,
            label: tax.name,
        })),
    ];

    const termOptions = [
        {value: "", label: "Select a term"},
        {value: "current", label: "Current Term"},
        {label: "— Registered Terms", value: "", disabled: true},
        ...(terms || []).map((t) => ({
            value: t.id,
            label: t.name,
        })),
    ];

    return (
        <Grid columns={1} rowGap={16}>
            <SelectControl
                label="Post Type"
                value={post_type || ""}
                options={postTypeOptions}
                onChange={(newValue) => {
                    update({
                        post_type: newValue,
                        taxonomy: "",
                        term: "",
                    });
                }}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />

            <SelectControl
                label="Taxonomy"
                value={taxonomy || ""}
                options={taxonomyOptions}
                onChange={(newValue) => {
                    update({
                        taxonomy: newValue,
                        term: "",
                    });
                }}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />

            <SelectControl
                label="Term"
                value={term || ""}
                options={termOptions}
                onChange={(newValue) => {
                    update({term: newValue});
                }}
                disabled={(!taxonomy && !loopTerms)}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />

            <PostSelectField
                value={include}
                onChange={(newValue) => {
                    update({include: newValue});
                }}
                label={'Select Posts'}
                querySettings={value}
            />

            <PostSelectField
                value={exclude}
                onChange={(newValue) => {
                    update({exclude: newValue});
                }}
                label={'Exclude Posts'}
                querySettings={value}
            />

            <Grid columns={2} rowGap={16} columnGap={10}>
                <ToggleControl
                    checked={!!loopTerms}
                    onChange={(newValue) => {
                        update({loopTerms: !!newValue});
                    }}
                    label={'Loop Terms'}
                />
            </Grid>


            {/* ⭐ NEW: Basic Query Settings (collapsible) */}
            <LoopBasicSettings
                value={value}
                onChange={onChange}
            />
        </Grid>
    );
};