const ResponsivePicture = ({mobile = {}, large = {}, settings = {}, editor = false}) => {

    const {
        resolutionMobile: sizeMobile = 'medium',
        resolutionLarge: sizeLarge = 'large',
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

    if (!urlLarge && !urlMobile) {
        return false;
    }

    const webpExtLarge = typeof urlLarge === 'string' && !urlLarge.includes('.svg') ? '.webp' : '';
    const webpExtMobile = typeof urlMobile === 'string' && !urlMobile.includes('.svg') ? '.webp' : '';

    return <picture className={className} style={{
        ...settings.style || {},
        ['object-fit']: 'inherit'
    }}>
        <source {...{
            [srcsetAttr]: urlLarge ? urlLarge + webpExtLarge : '#',
            media: '(width >= ' + breakpoint + ')',
        }}/>
        <source {...{
            [srcsetAttr]: urlLarge || '#',
            media: '(width >= ' + breakpoint + ')',
        }}/>
        <source {...{
            [srcsetAttr]: urlMobile ? urlMobile + webpExtMobile : '#',
            media: '(width >= 32px)',
        }}/>
        <source {...{
            [srcsetAttr]: urlMobile || '#',
            media: '(width >= 32px)',
        }}/>
        <img {...{
            [srcAttr]: urlMobile + webpExtMobile || '#',
            alt: large.alt || mobile.alt || '',
            ariaHidden: true,
            loading: settings.eager ? 'eager' : 'lazy'
        }}
        />
    </picture>;
}

export default ResponsivePicture;