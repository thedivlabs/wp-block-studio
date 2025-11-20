import {useState, useEffect, useRef} from "@wordpress/element";
import {
    TextControl,
    Spinner,
    __experimentalItemGroup as ItemGroup,
    __experimentalItem as Item,
} from "@wordpress/components";

export default function LinkField({ value = {}, onChange }) {
    const [query, setQuery] = useState(value.url || "");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const inputRef = useRef(null);

    useEffect(() => {
        if (!query || query.startsWith("http")) {
            setResults([]);
            setOpen(false);
            return;
        }

        const controller = new AbortController();
        const { signal } = controller;

        setLoading(true);

        const timeout = setTimeout(async () => {
            try {
                const urls = [
                    `/wp-json/wp/v2/search?search=${encodeURIComponent(query)}&type=post&subtype=any`,
                    `/wp-json/wp/v2/search?search=${encodeURIComponent(query)}&type=term&subtype=any`,
                    `/wp-json/wp/v2/search?search=${encodeURIComponent(query)}&type=user`,
                ];

                const responses = await Promise.all(
                    urls.map((u) =>
                        fetch(u, { signal }).then((r) => r.json()).catch(() => [])
                    )
                );

                const merged = responses.flat().map((item) => ({
                    id: `${item.type}-${item.id}`,
                    title: item.title || item.url,
                    url: item.url,
                    type: item.type,
                }));

                setResults(merged);
                setOpen(true);
            } catch (err) {
                if (!signal.aborted) {
                    console.error(err);
                }
            } finally {
                if (!signal.aborted) {
                    setLoading(false);
                }
            }
        }, 180);

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [query]);

    function apply(url) {
        onChange?.({ ...value, url });
        setQuery(url);
        setResults([]);
        setOpen(false);

        // blur the input immediately
        if (inputRef.current) {
            inputRef.current.blur();
        }
    }


    function handleBlur() {
        // Small delay so clicking outside or navigation works
        setTimeout(() => {
            setOpen(false);
        }, 80);
    }

    const itemGroupStyle = {
        width:'100%',
        display:'flex',
        flexDirection:'column',
        gap:'16px',
        padding:'35px 0px 25px'
    };
    const itemStyle = {
        width:'100%',
        display:'flex',
        flexDirection:'column',
        gap:'4px',
        padding:'0px'
    };


    return (
        <div className="block-editor-link-control wpbs-link-field">

            <div className="block-editor-link-control__search" style={{backgroundColor:'white'}}>
                <TextControl
                    className="block-editor-link-control__search-input"
                    placeholder="Search or type URL…"
                    value={query}
                    onFocus={() => {
                        if (results.length > 0) setOpen(true);
                    }}
                    onBlur={handleBlur}
                    onChange={(v) => {
                        setQuery(v);
                        onChange?.({ ...value, url: v });
                    }}
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize

                    // ⭐ important
                    inputRef={inputRef}
                />

                {loading && <Spinner />}
            </div>


            {open && results.length > 0 && (
                <ItemGroup className="block-editor-link-control__search-results" style={itemGroupStyle}>
                    {results.map((item) => (
                        <Item
                            key={item.id}
                            className="block-editor-link-control__search-item"
style={itemStyle}
                            // ⭐ the magic: use onMouseDown, not onClick
                            onMouseDown={(e) => {
                                e.preventDefault();   // stop input blur from winning
                                apply(item.url);
                            }}
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