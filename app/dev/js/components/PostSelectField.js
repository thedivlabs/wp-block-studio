import { useMemo } from "@wordpress/element";
import { useSelect } from "@wordpress/data";
import { store as coreStore } from "@wordpress/core-data";
import { ComboboxControl, Spinner } from "@wordpress/components";

/**
 * Extract only valid REST query args from the full Loop settings object.
 * Anything irrelevant (columns, divider, breakpoints, etc.) is ignored.
 */
function normalizeQuerySettings(raw = {}) {
    if (!raw || typeof raw !== "object") return {};

    const {
        post_type,
        taxonomy,
        term,
        order,
        orderby,
        per_page,
    } = raw;

    const out = {};

    if (post_type) out.post_type = post_type;
    if (taxonomy) out.taxonomy = taxonomy;
    if (term) out.term = term;
    //if (order) out.order = order;
    //if (orderby) out.orderby = orderby;

    // default per_page
    out.per_page = Number.isInteger(per_page) ? per_page : -1;

    return out;
}

/**
 * PostSelectField
 *
 * A single-post combobox with searchable suggestions.
 * Accepts the *entire* Loop settings object through querySettings,
 * then automatically extracts only valid parameters via normalizeQuerySettings().
 *
 * Props:
 * - value: number|null  (selected post ID)
 * - onChange: (postId) => void
 * - label: string
 * - querySettings: full Loop settings object (auto-sanitized)
 */
export function PostSelectField({
                                    value = null,
                                    onChange,
                                    label = "Select Post",
                                    querySettings = {},
                                }) {
    // Normalized query params (stable + memoized)
    const normalizedQuery = useMemo(
        () => normalizeQuerySettings(querySettings),
        [querySettings]
    );

    // Normalized combobox selected value
    const normalizedValue = value ? String(value) : "";

    /**
     * MAIN SELECTOR — fetch posts based on normalized query
     */
    const { options, isResolving } = useSelect(
        (select) => {
            const core = select(coreStore);

            /**
             * STEP 1 — fetch all public post types (posts, pages, CPTs)
             */
            const types = core.getPostTypes({ per_page: -1 });
            if (!types) return { options: [], isResolving: true };

            const publicTypes = Object.values(types).filter(
                (t) => t.viewable && t.slug !== "attachment"
            );

            /**
             * STEP 2 — choose which types to query
             */
            let targetTypes = publicTypes;

            if (normalizedQuery.post_type) {
                const wanted = Array.isArray(normalizedQuery.post_type)
                    ? normalizedQuery.post_type
                    : [normalizedQuery.post_type];

                targetTypes = publicTypes.filter((pt) =>
                    wanted.includes(pt.slug)
                );
            }

            /**
             * STEP 3 — Build REST args for core-data
             */
            const baseArgs = {
                per_page: normalizedQuery.per_page ?? -1,
                status: "publish",
                order: normalizedQuery.order ?? "asc",
                orderby: normalizedQuery.orderby ?? "title",
            };

            const taxArgs = {};

            if (normalizedQuery.taxonomy && normalizedQuery.term) {
                // Some taxonomies require mapping to their REST base
                const taxBase =
                    {
                        category: "categories",
                        post_tag: "tags",
                    }[normalizedQuery.taxonomy] ?? normalizedQuery.taxonomy;

                taxArgs[taxBase] = normalizedQuery.term;
            }

            /**
             * STEP 4 — Perform entity queries for each post type
             */
            let resolving = false;
            const posts = [];

            for (const type of targetTypes) {
                const args = { ...baseArgs, ...taxArgs };

                const records =
                    core.getEntityRecords("postType", type.slug, args) || [];

                const typeIsResolving =
                    typeof core.isResolving === "function"
                        ? core.isResolving(
                            "getEntityRecords",
                            "postType",
                            type.slug,
                            args
                        )
                        : false;

                if (typeIsResolving) resolving = true;

                records.forEach((post) => {
                    posts.push({
                        value: String(post.id),
                        label:
                            post.title?.rendered ||
                            "(No title)",
                        typeLabel: type.name || type.slug,
                    });
                });
            }

            /**
             * STEP 5 — Final options list
             */
            const options = posts.map((item) => ({
                value: item.value,
                label: `${item.label} (${item.typeLabel})`,
            }));

            return { options, isResolving: resolving };
        },
        [JSON.stringify(normalizedQuery)]
    );

    /**
     * Render
     */
    return (
        <div className="wpbs-post-select-field" style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
                <ComboboxControl
                    label={label}
                    value={normalizedValue}
                    onChange={(nextValue) => {
                        const id = nextValue ? parseInt(nextValue, 10) : null;
                        onChange?.(Number.isNaN(id) ? null : id);
                    }}
                    options={[
                        { value: "", label: "— Select —" },
                        ...(options || []),
                    ]}
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                    help={
                        isResolving ? "Loading…" : undefined
                    }
                />
            </div>

            {isResolving && <Spinner />}
        </div>
    );
}