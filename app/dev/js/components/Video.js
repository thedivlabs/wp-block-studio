function Video({mobile = {}, large = {}, settings = {}}) {

    const {
        resolution: sizeMobile = 'medium',
        resolution: sizeLarge = 'large',
    } = settings;

    const {[sizeMobile]: mobileLarge = {}} = mobile.sizes || {};
    const {[sizeLarge]: largeLarge = {}} = large.sizes || {};

    let urlLarge;
    let urlMobile;

    if (!settings.force) {
        urlLarge = largeLarge.url || mobileLarge.url || false;
        urlMobile = mobileLarge.url || largeLarge.url || false;
    } else {
        urlLarge = largeLarge.url || false;
        urlMobile = mobileLarge.url || false;
    }

    if (!urlLarge && !urlMobile) {
        return false;
    }

    const className = [
        'wpbs-picture',
        settings.className || false,
    ].filter(x => x).join(' ');

    if (!urlLarge && !urlMobile) {
        return false;
    }

    const srcAttr = settings.eager ? 'src' : 'src'; // data-src
    const srcsetAttr = settings.eager ? 'srcset' : 'srcset'; // data-srcset

    return <picture className={className} style={settings.style || {}}>
        <source {...{
            [srcsetAttr]: urlLarge ? urlLarge + '.webp' : '#',
            media: '(min-width: ' + settings.breakpoint + ')',
        }}/>
        <source {...{
            [srcsetAttr]: urlLarge || '#',
            media: '(min-width: ' + settings.breakpoint + ')',
        }}/>
        <source {...{
            [srcsetAttr]: urlMobile ? urlMobile + '.webp' : '#',
            media: '(min-width: 32px)',
        }}/>
        <source {...{
            [srcsetAttr]: urlMobile || '#',
            media: '(min-width: 32px)',
        }}/>
        <img {...{
            [srcAttr]: urlMobile || '#',
            alt: large.alt || mobile.alt || '',
            ariaHidden: true,
            loading: settings.eager ? 'eager' : 'lazy'
        }}
        />
    </picture>;
}

export default Picture;