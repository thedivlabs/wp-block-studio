import { useMemo } from "@wordpress/element";
import { useSelect } from "@wordpress/data";
import { store as coreStore } from "@wordpress/core-data";
import { FormTokenField, Spinner } from "@wordpress/components";

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

    // order/orderby optional
    if (order) out.order = order;
    if (orderby) out.orderby = orderby;

    // default per_page
    out.per_page = Number.isInteger(per_page) ? per_page : -1;

    return out;
}

/**
 * PostSelectField
 *
 * Multi-select token field with suggestions (typeahead).
 * Accepts the *entire* Loop settings object through querySettings,
 * then extracts only valid query parameters internally.
 *
 * Props:
 * - value: number|array|null
 * - onChange: (idsArray) => void
 * - label: string
 * - querySettings: full Loop settings object
 * - multiple: boolean (default true)
 */
export function PostSelectField({
                                    value = [],
                                    onChange,
                                    label = "Select Posts",
                                    querySettings = {},
                                    multiple = true,
                                }) {
    /**
     * Normalize incoming value.
     *
     * We ALWAYS treat it as an array of numeric IDs internally.
     * Even if the caller wants single-select, we still store as array
     * and unwrap back to single value in onChange.
     */
    const selectedIds = useMemo(() => {
        if (value == null) return [];
        if (Array.isArray(value)) return value.map((v) => parseInt(v, 10)).filter(Boolean);
        return [parseInt(value, 10)].filter(Boolean);
    }, [value]);

    // Normalize query params (stable + memoized)
    const normalizedQuery = useMemo(
        () => normalizeQuerySettings(querySettings),
        [querySettings]
    );

    /**
     * MAIN SELECTOR — fetch posts based on normalized query
     */
    const { options, suggestionsMap, isResolving } = useSelect(
        (select) => {
            const core = select(coreStore);

            /**
             * STEP 1 — Fetch public post types
             */
            const types = core.getPostTypes({ per_page: -1 });
            if (!types) return { options: [], suggestionsMap: {}, isResolving: true };

            const publicTypes = Object.values(types).filter(
                (t) => t.viewable && t.slug !== "attachment"
            );

            /**
             * STEP 2 — Filter to target post types if post_type is given
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
             * STEP 3 — core-data REST args
             */
            const baseArgs = {
                per_page: normalizedQuery.per_page ?? -1,
                status: "publish",
                order: normalizedQuery.order ?? "asc",
                orderby: normalizedQuery.orderby ?? "title",
            };

            const taxArgs = {};
            if (normalizedQuery.taxonomy && normalizedQuery.term) {
                const taxBase =
                    {
                        category: "categories",
                        post_tag: "tags",
                    }[normalizedQuery.taxonomy] ?? normalizedQuery.taxonomy;

                taxArgs[taxBase] = normalizedQuery.term;
            }

            /**
             * STEP 4 — Query all target post types
             */
            const posts = [];
            let resolving = false;

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
                        id: post.id,
                        label: post.title?.rendered || "(No title)",
                        typeLabel: type.name || type.slug,
                    });
                });
            }

            /**
             * Build suggestions + reverse lookup map
             */
            const suggestions = posts.map((p) => `${p.label} (${p.typeLabel})`);
            const suggestionsMap = {};

            posts.forEach((p) => {
                suggestionsMap[`${p.label} (${p.typeLabel})`] = p.id;
            });

            return {
                options: suggestions,
                suggestionsMap,
                isResolving: resolving,
            };
        },
        [JSON.stringify(normalizedQuery)]
    );

    /**
     * Convert selected IDs → tokens (labels)
     */
    const selectedTokens = useMemo(() => {
        return selectedIds
            .map((id) => {
                const entry = Object.entries(suggestionsMap).find(
                    ([label, mappedId]) => mappedId === id
                );
                return entry ? entry[0] : null;
            })
            .filter(Boolean);
    }, [selectedIds, suggestionsMap]);

    /**
     * Handle onChange from the token field
     */
    const handleTokenChange = (tokens) => {
        const ids = tokens
            .map((token) => suggestionsMap[token])
            .filter(Boolean);

        if (multiple) {
            onChange?.(ids);
        } else {
            onChange?.(ids[0] ?? null);
        }
    };

    /**
     * RENDER
     */
    return (
        <div className="wpbs-post-select-field" style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
                <FormTokenField
                    label={label}
                    value={selectedTokens}
                    suggestions={options}
                    onChange={handleTokenChange}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
            </div>

            {isResolving && <Spinner />}
        </div>
    );
}