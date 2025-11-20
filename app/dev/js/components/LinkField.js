import { useState, useEffect } from "@wordpress/element";
import {
    TextControl,
    Spinner,
    __experimentalItemGroup as ItemGroup,
    __experimentalItem as Item,
} from "@wordpress/components";

/**
 * LinkField
 * A custom link picker styled to match WordPress LinkControl.
 */
export default function LinkField({ value = {}, onChange }) {
    const [query, setQuery] = useState(value.url || "");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fake search — replace with real REST API later if needed
    useEffect(() => {
        if (!query || query.startsWith("http")) {
            setResults([]);
            return;
        }

        setLoading(true);

        const timeout = setTimeout(() => {
            setResults([
                { id: 1, title: "Example Page", url: "/example" },
                { id: 2, title: "Another Page", url: "/another" },
            ]);
            setLoading(false);
        }, 200);

        return () => clearTimeout(timeout);
    }, [query]);

    function apply(url) {
        onChange?.({
            ...value,
            url,
        });
        setQuery(url);
        setResults([]);
    }

    return (
        <div className="block-editor-link-control wpbs-link-field">

            <div className="block-editor-link-control__search">
                <TextControl
                    className="block-editor-link-control__search-input"
                    placeholder="Search or type URL…"
                    value={query}
                    onChange={(v) => {
                        setQuery(v);
                        onChange?.({ ...value, url: v });
                    }}
                />
                {loading && <Spinner />}
            </div>

            {/* Suggestions */}
            {results.length > 0 && (
                <ItemGroup className="block-editor-link-control__search-results">
                    {results.map((item) => (
                        <Item
                            key={item.id}
                            className="block-editor-link-control__search-item"
                            onClick={() => apply(item.url)}
                        >
                            <span className="block-editor-link-control__search-item-title">
                                {item.title}
                            </span>
                            <span className="block-editor-link-control__search-item-info">
                                {item.url}
                            </span>
                        </Item>
                    ))}
                </ItemGroup>
            )}
        </div>
    );
}