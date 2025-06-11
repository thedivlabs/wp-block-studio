function ResponsivePicture({mobile = {}, large = {}, settings = {}, editor = false}) {

    const {
        resolution: sizeMobile = 'medium',
        resolution: sizeLarge = 'large',
    } = settings;

    const breakpoints = WPBS.settings.breakpoints;
    const breakpoint = breakpoints[settings?.breakpoint ?? 'normal'];

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

    let srcAttr;
    let srcsetAttr;

    if (editor === true) {
        srcAttr = 'src';
        srcsetAttr = 'srcset';
    } else {
        srcAttr = !!settings.eager ? 'src' : 'data-src';
        srcsetAttr = !!settings.eager ? 'srcset' : 'data-srcset';
    }

    return <picture className={className} style={{
        ...settings.style || {},
        ['object-fit']: 'inherit'
    }}>
        <source {...{
            [srcsetAttr]: urlLarge ? urlLarge + '.webp' : '#',
            media: '(width >= ' + breakpoint + ')',
        }}/>
        <source {...{
            [srcsetAttr]: urlLarge || '#',
            media: '(width >= ' + breakpoint + ')',
        }}/>
        <source {...{
            [srcsetAttr]: urlMobile ? urlMobile + '.webp' : '#',
            media: '(width >= 32px)',
        }}/>
        <source {...{
            [srcsetAttr]: urlMobile || '#',
            media: '(width >= 32px)',
        }}/>
        <img {...{
            [srcAttr]: urlMobile + '.webp' || '#',
            alt: large.alt || mobile.alt || '',
            ariaHidden: true,
            loading: settings.eager ? 'eager' : 'lazy'
        }}
        />
    </picture>;
}

export default ResponsivePicture;