function Picture({mobile = {}, large = {}, settings = {},}) {

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
        !urlLarge ? 'lg:hidden' : false,
        !urlMobile ? 'max-md:hidden' : false,
    ].filter(x => x).join(' ');

    if (!urlLarge && !urlMobile) {
        return false;
    }

    return <picture className={className} style={settings.style || {}}>
        <source srcSet={urlLarge || '#'} media={'(min-width: ' + settings.breakpoint + ')'}/>
        <source srcSet={urlMobile || '#'} media={'(min-width: 32px)'}/>
        <img src={urlLarge} alt={large.alt || mobile.alt || ''} aria-hidden={'true'}
             loading={settings.eager ? 'eager' : 'lazy'}/>
    </picture>;
}

export default Picture;