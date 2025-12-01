import { useSelect } from "@wordpress/data";
import { store as coreStore } from "@wordpress/core-data";
import { SelectControl, __experimentalGrid as Grid } from "@wordpress/components";
import { useCallback } from "@wordpress/element";

export const Loop = ({ value = {}, onChange }) => {
    const { post_type, taxonomy, term } = value;

    // Get every public post type (excluding attachments)
    const postTypes = useSelect((select) => {
        const types = select(coreStore).getPostTypes({ per_page: -1 });
        if (!types) return null;
        return Object.values(types).filter(
            (type) => type?.viewable && type.slug !== "attachment"
        );
    }, []);

    // Get every public taxonomy
    const taxonomies = useSelect((select) => {
        const items = select(coreStore).getTaxonomies();
        if (!items) return null;
        return items.filter((t) => t.visibility?.public);
    }, []);

    // Terms depend on taxonomy (this is OK!)
    const terms = useSelect(
        (select) => {
            if (!taxonomy) return [];
            const args = { per_page: -1, hide_empty: false };
            const records = select(coreStore).getEntityRecords("taxonomy", taxonomy, args);
            return records || [];
        },
        [taxonomy]
    );

    const update = useCallback(
        (patch) => onChange({ ...value, ...patch }),
        [value, onChange]
    );

    const postTypeOptions = [
        { value: "", label: "Select a post type" },
        ...(postTypes || []).map((pt) => ({
            value: pt.slug,
            label: pt.name,
        })),
    ];

    const taxonomyOptions = [
        { value: "", label: "Select a taxonomy" },
        ...(taxonomies || []).map((tax) => ({
            value: tax.slug,
            label: tax.name,
        })),
    ];

    const termOptions = [
        { value: "", label: "Select a term" },
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
                    update({ term: newValue });
                }}
                disabled={!taxonomy}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />
        </Grid>
    );
};