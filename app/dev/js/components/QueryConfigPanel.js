/**
 * QueryConfigPanel
 *
 * A standalone, “quiet” query configuration panel for grid/loop-style blocks.
 * - No useSelect / data subscriptions.
 * - No automatic fetching.
 * - Purely edits a structured query configuration object.
 */

import {useCallback, useMemo} from '@wordpress/element';
import {
    PanelBody,
    BaseControl,
    SelectControl,
    TextControl,
    ToggleControl,
    __experimentalNumberControl as NumberControl,
    __experimentalGrid as Grid,
} from '@wordpress/components';

/**
 * @typedef {Object} TaxFilter
 * @property {string} taxonomy
 * @property {(number|string)[]} terms
 * @property {'term_id'|'slug'} [field]
 * @property {'IN'|'NOT IN'|'AND'} [operator]
 */

/**
 * @typedef {Object} MetaFilter
 * @property {string} key
 * @property {string|number|(string|number)[]} value
 * @property {'='|'!='|'>'|'>='|'<'|'<='|'IN'|'NOT IN'|'LIKE'} [compare]
 * @property {'CHAR'|'NUMERIC'|'DATE'} [type]
 */

/**
 * @typedef {Object} DateRange
 * @property {'none'|'after'|'before'|'between'|'relative'} mode
 * @property {string|null} [after]
 * @property {string|null} [before]
 * @property {'days'|'weeks'|'months'|'years'} [relativeUnit]
 * @property {number|null} [relativeAmount]
 */

/**
 * @typedef {Object} QueryConfig
 * @property {'posts'|'manual'|'taxonomy'} mode
 * @property {string} [postType]
 * @property {string[]} [postStatus]
 * @property {number[]} [includeIds]
 * @property {number[]} [excludeIds]
 * @property {TaxFilter[]} [taxFilters]
 * @property {number[]} [authors]
 * @property {'any'|'current'} [authorMode]
 * @property {string} [search]
 * @property {'ignore'|'only'|'exclude'} [stickyMode]
 * @property {string} [orderby]
 * @property {'ASC'|'DESC'} [order]
 * @property {string|null} [metaKey]
 * @property {number} [postsPerPage]
 * @property {number|null} [maxItems]
 * @property {number|null} [offset]
 * @property {DateRange} [dateRange]
 * @property {MetaFilter[]} [metaFilters]
 * @property {'AND'|'OR'} [metaRelation]
 * @property {string|null} [dateFormat]
 * @property {string|number|null} [imageSize]
 */

/**
 * Default query config. This is merged with the incoming value so the consumer
 * only needs to provide fields they care about.
 *
 * @type {QueryConfig}
 */
export const DEFAULT_QUERY_CONFIG = {
    mode: 'posts',
    postType: 'post',
    postStatus: ['publish'],
    includeIds: [],
    excludeIds: [],
    taxFilters: [],
    authors: [],
    authorMode: 'any',
    search: '',
    stickyMode: 'ignore',
    orderby: 'date',
    order: 'DESC',
    metaKey: null,
    postsPerPage: 6,
    maxItems: null,
    offset: null,
    dateRange: {
        mode: 'none',
        after: null,
        before: null,
        relativeUnit: 'days',
        relativeAmount: null,
    },
    metaFilters: [],
    metaRelation: 'AND',
    dateFormat: null,
    imageSize: null,
};

/**
 * Merge an incoming partial config with defaults.
 *
 * @param {Partial<QueryConfig>|undefined|null} value
 * @returns {QueryConfig}
 */
const normalizeConfig = (value) => {
    const base = {...DEFAULT_QUERY_CONFIG};
    if (!value || typeof value !== 'object') {
        return base;
    }

    const merged = {
        ...base,
        ...value,
        dateRange: {
            ...base.dateRange,
            ...(value.dateRange || {}),
        },
    };

    if (!Array.isArray(merged.postStatus)) {
        merged.postStatus = base.postStatus.slice();
    }
    if (!Array.isArray(merged.includeIds)) {
        merged.includeIds = [];
    }
    if (!Array.isArray(merged.excludeIds)) {
        merged.excludeIds = [];
    }
    if (!Array.isArray(merged.taxFilters)) {
        merged.taxFilters = [];
    }
    if (!Array.isArray(merged.authors)) {
        merged.authors = [];
    }
    if (!Array.isArray(merged.metaFilters)) {
        merged.metaFilters = [];
    }

    return merged;
};

/**
 * Utility: convert array of numeric IDs to a comma-separated string.
 *
 * @param {number[]|undefined|null} ids
 * @returns {string}
 */
const idsToString = (ids) => {
    if (!Array.isArray(ids) || !ids.length) {
        return '';
    }

    return ids.join(', ');
};

/**
 * Utility: parse comma-separated string into array of numbers.
 *
 * @param {string} value
 * @returns {number[]}
 */
const stringToIds = (value) => {
    if (!value) {
        return [];
    }

    return value
        .split(',')
        .map((part) => parseInt(part.trim(), 10))
        .filter((num) => !Number.isNaN(num));
};

/**
 * Utility: ensure an array, used for filters, authors, etc.
 *
 * @param {any} maybeArray
 * @returns {any[]}
 */
const ensureArray = (maybeArray) => {
    if (Array.isArray(maybeArray)) {
        return maybeArray;
    }
    if (maybeArray == null) {
        return [];
    }
    return [maybeArray];
};

/**
 * @typedef {Object} QueryOptions
 * @property {{label: string, value: string}[]} [postTypes]
 * @property {{label: string, value: string}[]} [statuses]
 * @property {{label: string, value: string}[]} [orderBy]
 * @property {{label: string, value: string}[]} [authors]
 * @property {{label: string, value: string}[]} [dateFormats]
 * @property {{label: string, value: string|number}[]} [imageSizes]
 * @property {{
 *    slug: string,
 *    label: string
 * }[]} [taxonomies]
 * @property {Record<string, {label: string, value: string|number}[]>} [termsByTaxonomy]
 */

/**
 * Query configuration panel component.
 *
 * @param {Object} props
 * @param {QueryConfig|Partial<QueryConfig>|undefined|null} props.value
 * @param {(next: QueryConfig) => void} props.onChange
 * @param {QueryOptions} [props.options]
 * @param {string} [props.title]
 * @constructor
 */
export const QueryConfigPanel = ({
                                     value,
                                     onChange,
                                     options = {},
                                     title = 'Query',
                                 }) => {
    const config = useMemo(() => normalizeConfig(value), [value]);

    const {
        postTypes = [],
        statuses = [],
        orderBy = [],
        authors: authorOptions = [],
        dateFormats = [],
        imageSizes = [],
        taxonomies = [],
        termsByTaxonomy = {},
    } = options || {};

    const postTypeOptions = useMemo(() => {
        if (postTypes.length) {
            return postTypes;
        }
        return [
            {label: 'Posts', value: 'post'},
            {label: 'Pages', value: 'page'},
        ];
    }, [postTypes]);

    const statusOptions = useMemo(() => {
        if (statuses.length) {
            return statuses;
        }
        return [
            {label: 'Published', value: 'publish'},
            {label: 'Draft', value: 'draft'},
            {label: 'Private', value: 'private'},
        ];
    }, [statuses]);

    const orderByOptions = useMemo(() => {
        if (orderBy.length) {
            return orderBy;
        }
        return [
            {label: 'Date', value: 'date'},
            {label: 'Title', value: 'title'},
            {label: 'Menu Order', value: 'menu_order'},
            {label: 'Random', value: 'rand'},
            {label: 'Meta Value', value: 'meta_value'},
            {label: 'Meta Value (Numeric)', value: 'meta_value_num'},
        ];
    }, [orderBy]);

    const authorSelectOptions = useMemo(() => {
        if (authorOptions.length) {
            return authorOptions;
        }
        return [];
    }, [authorOptions]);

    const dateFormatOptions = useMemo(() => {
        if (dateFormats.length) {
            return dateFormats;
        }
        return [];
    }, [dateFormats]);

    const imageSizeOptions = useMemo(() => {
        if (imageSizes.length) {
            return imageSizes;
        }
        return [];
    }, [imageSizes]);

    const taxonomyOptions = useMemo(() => {
        if (taxonomies.length) {
            return taxonomies.map((tax) => ({
                label: tax.label || tax.slug,
                value: tax.slug,
            }));
        }
        return [];
    }, [taxonomies]);

    const safeOnChange = useCallback(
        (patch) => {
            if (typeof onChange !== 'function') {
                return;
            }

            const next = {
                ...config,
                ...patch,
                dateRange: {
                    ...config.dateRange,
                    ...(patch.dateRange || {}),
                },
            };

            onChange(next);
        },
        [config, onChange]
    );

    const handlePostStatusToggle = useCallback(
        (statusSlug) => {
            const current = ensureArray(config.postStatus);
            let next;

            if (current.includes(statusSlug)) {
                next = current.filter((item) => item !== statusSlug);
            } else {
                next = [...current, statusSlug];
            }

            if (!next.length) {
                next = ['publish'];
            }

            safeOnChange({postStatus: next});
        },
        [config.postStatus, safeOnChange]
    );

    const handleAuthorsChange = useCallback(
        (newValue) => {
            const ids = stringToIds(newValue);
            safeOnChange({authors: ids});
        },
        [safeOnChange]
    );

    const handleIncludeIdsChange = useCallback(
        (newValue) => {
            safeOnChange({includeIds: stringToIds(newValue)});
        },
        [safeOnChange]
    );

    const handleExcludeIdsChange = useCallback(
        (newValue) => {
            safeOnChange({excludeIds: stringToIds(newValue)});
        },
        [safeOnChange]
    );

    const handleTaxFilterChange = useCallback(
        (index, patch) => {
            const current = Array.isArray(config.taxFilters)
                ? config.taxFilters
                : [];
            const next = [...current];
            const existing = current[index] || {};

            next[index] = {
                taxonomy: '',
                terms: [],
                field: 'term_id',
                operator: 'IN',
                ...existing,
                ...patch,
            };

            safeOnChange({taxFilters: next});
        },
        [config.taxFilters, safeOnChange]
    );

    const handleAddTaxFilter = useCallback(() => {
        const current = Array.isArray(config.taxFilters)
            ? config.taxFilters
            : [];
        const next = [
            ...current,
            {
                taxonomy: '',
                terms: [],
                field: 'term_id',
                operator: 'IN',
            },
        ];
        safeOnChange({taxFilters: next});
    }, [config.taxFilters, safeOnChange]);

    const handleRemoveTaxFilter = useCallback(
        (index) => {
            const current = Array.isArray(config.taxFilters)
                ? config.taxFilters
                : [];
            const next = current.filter((_, i) => i !== index);
            safeOnChange({taxFilters: next});
        },
        [config.taxFilters, safeOnChange]
    );

    const handleMetaFilterChange = useCallback(
        (index, patch) => {
            const current = Array.isArray(config.metaFilters)
                ? config.metaFilters
                : [];
            const next = [...current];
            const existing = current[index] || {};

            next[index] = {
                key: '',
                value: '',
                compare: '=',
                type: 'CHAR',
                ...existing,
                ...patch,
            };

            safeOnChange({metaFilters: next});
        },
        [config.metaFilters, safeOnChange]
    );

    const handleAddMetaFilter = useCallback(() => {
        const current = Array.isArray(config.metaFilters)
            ? config.metaFilters
            : [];
        const next = [
            ...current,
            {
                key: '',
                value: '',
                compare: '=',
                type: 'CHAR',
            },
        ];
        safeOnChange({metaFilters: next});
    }, [config.metaFilters, safeOnChange]);

    const handleRemoveMetaFilter = useCallback(
        (index) => {
            const current = Array.isArray(config.metaFilters)
                ? config.metaFilters
                : [];
            const next = current.filter((_, i) => i !== index);
            safeOnChange({metaFilters: next});
        },
        [config.metaFilters, safeOnChange]
    );

    const handleDateRangePatch = useCallback(
        (patch) => {
            safeOnChange({
                dateRange: {
                    ...config.dateRange,
                    ...patch,
                },
            });
        },
        [config.dateRange, safeOnChange]
    );

    const includeIdsString = useMemo(
        () => idsToString(config.includeIds),
        [config.includeIds]
    );
    const excludeIdsString = useMemo(
        () => idsToString(config.excludeIds),
        [config.excludeIds]
    );
    const authorsString = useMemo(
        () => idsToString(config.authors),
        [config.authors]
    );

    return (
        <PanelBody title={title} initialOpen={false}>
            {/* Source */}
            <Grid columns={1} columnGap={10} rowGap={16}>
                <SelectControl
                    label="Mode"
                    value={config.mode}
                    options={[
                        {label: 'Posts', value: 'posts'},
                        {label: 'Manual selection', value: 'manual'},
                        {label: 'Taxonomy archive', value: 'taxonomy'},
                    ]}
                    onChange={(newValue) =>
                        safeOnChange({mode: newValue})
                    }
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />

                {config.mode !== 'manual' && (
                    <SelectControl
                        label="Post type"
                        value={config.postType}
                        options={postTypeOptions}
                        onChange={(newValue) =>
                            safeOnChange({postType: newValue})
                        }
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                )}

                {config.mode === 'manual' && (
                    <TextControl
                        label="Include post IDs"
                        help="Comma separated list of IDs."
                        value={includeIdsString}
                        onChange={handleIncludeIdsChange}
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                )}

                {/* Status & sticky */}
                <BaseControl
                    label="Post status"
                    __nextHasNoMarginBottom={true}
                >
                    <Grid columns={2} columnGap={8} rowGap={8}>
                        {statusOptions.map((statusOption) => (
                            <ToggleControl
                                key={statusOption.value}
                                label={statusOption.label}
                                checked={config.postStatus.includes(
                                    statusOption.value
                                )}
                                onChange={() =>
                                    handlePostStatusToggle(
                                        statusOption.value
                                    )
                                }
                                __nextHasNoMarginBottom
                            />
                        ))}
                    </Grid>
                </BaseControl>

                <SelectControl
                    label="Sticky posts"
                    value={config.stickyMode}
                    options={[
                        {label: 'Ignore', value: 'ignore'},
                        {label: 'Only sticky', value: 'only'},
                        {label: 'Exclude sticky', value: 'exclude'},
                    ]}
                    onChange={(newValue) =>
                        safeOnChange({stickyMode: newValue})
                    }
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />

                {/* Authors */}
                <SelectControl
                    label="Author mode"
                    value={config.authorMode}
                    options={[
                        {label: 'Any author', value: 'any'},
                        {
                            label: 'Current post author',
                            value: 'current',
                        },
                    ]}
                    onChange={(newValue) =>
                        safeOnChange({authorMode: newValue})
                    }
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />

                {authorSelectOptions.length === 0 && (
                    <TextControl
                        label="Author IDs"
                        help="Comma separated list of author IDs."
                        value={authorsString}
                        onChange={handleAuthorsChange}
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                )}

                {authorSelectOptions.length > 0 && (
                    <SelectControl
                        multiple
                        label="Authors"
                        value={ensureArray(config.authors).map(
                            String
                        )}
                        options={authorSelectOptions}
                        onChange={(newValue) => {
                            const ids = ensureArray(newValue).map(
                                (v) => parseInt(v, 10)
                            );
                            safeOnChange({authors: ids});
                        }}
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                )}

                <TextControl
                    label="Search term"
                    value={config.search || ''}
                    onChange={(newValue) =>
                        safeOnChange({search: newValue})
                    }
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />

                <TextControl
                    label="Exclude post IDs"
                    help="Comma separated list of IDs."
                    value={excludeIdsString}
                    onChange={handleExcludeIdsChange}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
            </Grid>

            {/* Taxonomy filters */}
            {taxonomyOptions.length > 0 && (
                <>
                    <hr/>
                    <BaseControl
                        label="Taxonomy filters"
                        __nextHasNoMarginBottom={true}
                    >
                        {(config.taxFilters || []).map(
                            (filter, index) => {
                                const taxonomySlug =
                                    filter.taxonomy || '';
                                const termOptions =
                                    termsByTaxonomy[taxonomySlug] ||
                                    [];

                                return (
                                    <div
                                        key={index}
                                        className="wpbs-query-tax-filter"
                                        style={{
                                            border:
                                                '1px solid rgba(0,0,0,.08)',
                                            borderRadius: 4,
                                            padding: 8,
                                            marginBottom: 8,
                                        }}
                                    >
                                        <Grid
                                            columns={2}
                                            columnGap={8}
                                            rowGap={8}
                                        >
                                            <SelectControl
                                                label="Taxonomy"
                                                value={taxonomySlug}
                                                options={[
                                                    {
                                                        label: 'Select taxonomy',
                                                        value: '',
                                                    },
                                                    ...taxonomyOptions,
                                                ]}
                                                onChange={(newTax) =>
                                                    handleTaxFilterChange(
                                                        index,
                                                        {
                                                            taxonomy:
                                                            newTax,
                                                            terms: [],
                                                        }
                                                    )
                                                }
                                                __next40pxDefaultSize
                                                __nextHasNoMarginBottom
                                            />

                                            <SelectControl
                                                label="Operator"
                                                value={
                                                    filter.operator ||
                                                    'IN'
                                                }
                                                options={[
                                                    {
                                                        label: 'IN',
                                                        value: 'IN',
                                                    },
                                                    {
                                                        label:
                                                            'NOT IN',
                                                        value:
                                                            'NOT IN',
                                                    },
                                                    {
                                                        label:
                                                            'Require all terms (AND)',
                                                        value: 'AND',
                                                    },
                                                ]}
                                                onChange={(
                                                    newOperator
                                                ) =>
                                                    handleTaxFilterChange(
                                                        index,
                                                        {
                                                            operator:
                                                            newOperator,
                                                        }
                                                    )
                                                }
                                                __next40pxDefaultSize
                                                __nextHasNoMarginBottom
                                            />

                                            <SelectControl
                                                label="Field"
                                                value={
                                                    filter.field ||
                                                    'term_id'
                                                }
                                                options={[
                                                    {
                                                        label:
                                                            'Term ID',
                                                        value:
                                                            'term_id',
                                                    },
                                                    {
                                                        label: 'Slug',
                                                        value: 'slug',
                                                    },
                                                ]}
                                                onChange={(
                                                    newField
                                                ) =>
                                                    handleTaxFilterChange(
                                                        index,
                                                        {
                                                            field: newField,
                                                        }
                                                    )
                                                }
                                                __next40pxDefaultSize
                                                __nextHasNoMarginBottom
                                            />

                                            <SelectControl
                                                multiple
                                                label="Terms"
                                                value={ensureArray(
                                                    filter.terms
                                                ).map(String)}
                                                options={termOptions}
                                                onChange={(
                                                    newTerms
                                                ) => {
                                                    const nextTerms = ensureArray(
                                                        newTerms
                                                    );
                                                    handleTaxFilterChange(
                                                        index,
                                                        {
                                                            terms: nextTerms,
                                                        }
                                                    );
                                                }}
                                                __next40pxDefaultSize
                                                __nextHasNoMarginBottom
                                            />
                                        </Grid>

                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent:
                                                    'flex-end',
                                                marginTop: 8,
                                            }}
                                        >
                                            <button
                                                type="button"
                                                className="components-button is-secondary is-small"
                                                onClick={() =>
                                                    handleRemoveTaxFilter(
                                                        index
                                                    )
                                                }
                                            >
                                                Remove filter
                                            </button>
                                        </div>
                                    </div>
                                );
                            }
                        )}

                        <button
                            type="button"
                            className="components-button is-primary is-small"
                            onClick={handleAddTaxFilter}
                        >
                            Add taxonomy filter
                        </button>
                    </BaseControl>
                </>
            )}

            {/* Ordering & pagination */}
            <hr/>
            <Grid columns={2} columnGap={10} rowGap={16}>
                <SelectControl
                    label="Order by"
                    value={config.orderby}
                    options={orderByOptions}
                    onChange={(newValue) =>
                        safeOnChange({orderby: newValue})
                    }
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />

                <SelectControl
                    label="Order"
                    value={config.order}
                    options={[
                        {label: 'Descending', value: 'DESC'},
                        {label: 'Ascending', value: 'ASC'},
                    ]}
                    onChange={(newValue) =>
                        safeOnChange({order: newValue})
                    }
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />

                {config.orderby &&
                    config.orderby.startsWith('meta_value') && (
                        <TextControl
                            label="Meta key"
                            value={config.metaKey || ''}
                            onChange={(newValue) =>
                                safeOnChange({
                                    metaKey:
                                        newValue || null,
                                })
                            }
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        />
                    )}

                <NumberControl
                    label="Posts per page"
                    value={config.postsPerPage}
                    onChange={(newValue) =>
                        safeOnChange({
                            postsPerPage: parseInt(
                                newValue,
                                10
                            ) || 0,
                        })
                    }
                    min={1}
                    max={50}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />

                <NumberControl
                    label="Max items"
                    help="0 or empty = no hard cap."
                    value={config.maxItems ?? ''}
                    onChange={(newValue) => {
                        const num = parseInt(newValue, 10);
                        safeOnChange({
                            maxItems: Number.isNaN(
                                num
                            )
                                ? null
                                : num,
                        });
                    }}
                    min={0}
                    max={999}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />

                <NumberControl
                    label="Offset"
                    help="Skip this many posts from the start."
                    value={config.offset ?? ''}
                    onChange={(newValue) => {
                        const num = parseInt(newValue, 10);
                        safeOnChange({
                            offset: Number.isNaN(num)
                                ? null
                                : num,
                        });
                    }}
                    min={0}
                    max={9999}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
            </Grid>

            {/* Date range */}
            <hr/>
            <Grid columns={2} columnGap={10} rowGap={16}>
                <SelectControl
                    label="Date range"
                    value={config.dateRange.mode}
                    options={[
                        {label: 'None', value: 'none'},
                        {label: 'After', value: 'after'},
                        {label: 'Before', value: 'before'},
                        {label: 'Between', value: 'between'},
                        {label: 'Relative', value: 'relative'},
                    ]}
                    onChange={(newValue) =>
                        handleDateRangePatch({mode: newValue})
                    }
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />

                {['after', 'between'].includes(
                    config.dateRange.mode
                ) && (
                    <TextControl
                        label="After (YYYY-MM-DD)"
                        value={config.dateRange.after || ''}
                        onChange={(newValue) =>
                            handleDateRangePatch({
                                after: newValue || null,
                            })
                        }
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                )}

                {['before', 'between'].includes(
                    config.dateRange.mode
                ) && (
                    <TextControl
                        label="Before (YYYY-MM-DD)"
                        value={config.dateRange.before || ''}
                        onChange={(newValue) =>
                            handleDateRangePatch({
                                before: newValue || null,
                            })
                        }
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                )}

                {config.dateRange.mode === 'relative' && (
                    <>
                        <NumberControl
                            label="Amount"
                            value={
                                config.dateRange
                                    .relativeAmount ?? ''
                            }
                            onChange={(newValue) => {
                                const num = parseInt(
                                    newValue,
                                    10
                                );
                                handleDateRangePatch(
                                    {
                                        relativeAmount:
                                            Number.isNaN(
                                                num
                                            )
                                                ? null
                                                : num,
                                    }
                                );
                            }}
                            min={1}
                            max={3650}
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        />
                        <SelectControl
                            label="Unit"
                            value={
                                config.dateRange
                                    .relativeUnit || 'days'
                            }
                            options={[
                                {
                                    label: 'Days',
                                    value: 'days',
                                },
                                {
                                    label: 'Weeks',
                                    value: 'weeks',
                                },
                                {
                                    label: 'Months',
                                    value: 'months',
                                },
                                {
                                    label: 'Years',
                                    value: 'years',
                                },
                            ]}
                            onChange={(newValue) =>
                                handleDateRangePatch(
                                    {
                                        relativeUnit:
                                        newValue,
                                    }
                                )
                            }
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        />
                    </>
                )}
            </Grid>

            {/* Meta query */}
            <hr/>
            <BaseControl
                label="Meta query"
                __nextHasNoMarginBottom={true}
            >
                {(config.metaFilters || []).map(
                    (filter, index) => (
                        <div
                            key={index}
                            className="wpbs-query-meta-filter"
                            style={{
                                border:
                                    '1px solid rgba(0,0,0,.08)',
                                borderRadius: 4,
                                padding: 8,
                                marginBottom: 8,
                            }}
                        >
                            <Grid
                                columns={2}
                                columnGap={8}
                                rowGap={8}
                            >
                                <TextControl
                                    label="Meta key"
                                    value={filter.key || ''}
                                    onChange={(
                                        newValue
                                    ) =>
                                        handleMetaFilterChange(
                                            index,
                                            {
                                                key:
                                                newValue,
                                            }
                                        )
                                    }
                                    __next40pxDefaultSize
                                    __nextHasNoMarginBottom
                                />
                                <TextControl
                                    label="Value"
                                    value={
                                        filter.value ||
                                        ''
                                    }
                                    onChange={(
                                        newValue
                                    ) =>
                                        handleMetaFilterChange(
                                            index,
                                            {
                                                value:
                                                newValue,
                                            }
                                        )
                                    }
                                    __next40pxDefaultSize
                                    __nextHasNoMarginBottom
                                />
                                <SelectControl
                                    label="Compare"
                                    value={
                                        filter.compare ||
                                        '='
                                    }
                                    options={[
                                        {
                                            label: '=',
                                            value: '=',
                                        },
                                        {
                                            label: '!=',
                                            value: '!=',
                                        },
                                        {
                                            label: '>',
                                            value: '>',
                                        },
                                        {
                                            label: '>=',
                                            value: '>=',
                                        },
                                        {
                                            label: '<',
                                            value: '<',
                                        },
                                        {
                                            label: '<=',
                                            value: '<=',
                                        },
                                        {
                                            label: 'IN',
                                            value: 'IN',
                                        },
                                        {
                                            label: 'NOT IN',
                                            value: 'NOT IN',
                                        },
                                        {
                                            label: 'LIKE',
                                            value: 'LIKE',
                                        },
                                    ]}
                                    onChange={(
                                        newValue
                                    ) =>
                                        handleMetaFilterChange(
                                            index,
                                            {
                                                compare:
                                                newValue,
                                            }
                                        )
                                    }
                                    __next40pxDefaultSize
                                    __nextHasNoMarginBottom
                                />
                                <SelectControl
                                    label="Type"
                                    value={
                                        filter.type ||
                                        'CHAR'
                                    }
                                    options={[
                                        {
                                            label: 'Text',
                                            value: 'CHAR',
                                        },
                                        {
                                            label: 'Number',
                                            value:
                                                'NUMERIC',
                                        },
                                        {
                                            label: 'Date',
                                            value: 'DATE',
                                        },
                                    ]}
                                    onChange={(
                                        newValue
                                    ) =>
                                        handleMetaFilterChange(
                                            index,
                                            {
                                                type:
                                                newValue,
                                            }
                                        )
                                    }
                                    __next40pxDefaultSize
                                    __nextHasNoMarginBottom
                                />
                            </Grid>

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent:
                                        'flex-end',
                                    marginTop: 8,
                                }}
                            >
                                <button
                                    type="button"
                                    className="components-button is-secondary is-small"
                                    onClick={() =>
                                        handleRemoveMetaFilter(
                                            index
                                        )
                                    }
                                >
                                    Remove condition
                                </button>
                            </div>
                        </div>
                    )
                )}

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 8,
                        gap: 8,
                    }}
                >
                    <button
                        type="button"
                        className="components-button is-primary is-small"
                        onClick={handleAddMetaFilter}
                    >
                        Add meta condition
                    </button>

                    <SelectControl
                        label="Relation"
                        value={config.metaRelation}
                        options={[
                            {label: 'AND', value: 'AND'},
                            {label: 'OR', value: 'OR'},
                        ]}
                        onChange={(newValue) =>
                            safeOnChange({
                                metaRelation: newValue,
                            })
                        }
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                </div>
            </BaseControl>

            {/* Formatting */}
            <hr/>
            <Grid columns={2} columnGap={10} rowGap={16}>
                {dateFormatOptions.length > 0 && (
                    <SelectControl
                        label="Date format"
                        value={config.dateFormat || ''}
                        options={[
                            {label: 'Default', value: ''},
                            ...dateFormatOptions,
                        ]}
                        onChange={(newValue) =>
                            safeOnChange({
                                dateFormat:
                                    newValue || null,
                            })
                        }
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                )}

                {imageSizeOptions.length > 0 && (
                    <SelectControl
                        label="Image size"
                        value={
                            config.imageSize == null
                                ? ''
                                : String(
                                    config.imageSize
                                )
                        }
                        options={[
                            {label: 'Default', value: ''},
                            ...imageSizeOptions,
                        ]}
                        onChange={(newValue) => {
                            let valueToStore = null;

                            if (newValue !== '') {
                                const numeric =
                                    parseInt(
                                        newValue,
                                        10
                                    );
                                valueToStore =
                                    Number.isNaN(
                                        numeric
                                    )
                                        ? newValue
                                        : numeric;
                            }

                            safeOnChange({
                                imageSize:
                                valueToStore,
                            });
                        }}
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                )}
            </Grid>
        </PanelBody>
    );
};