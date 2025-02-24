function Picture({mobile = {}, large = {}, settings = {}}) {

    //console.log(wp.data.select( 'core').getMedia( large.id ));

    const {medium: mobileLarge = {}} = mobile.sizes || {};
    const {large: largeLarge = {}} = large.sizes || {};

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
        <source srcSet={urlLarge || '#'} media={'(min-width: 960px)'}/>
        <source srcSet={urlMobile || '#'} media={'(min-width: 32px)'}/>
        <img src={urlLarge} alt={large.alt || mobile.alt || ''} aria-hidden={'true'}
             loading={settings.eager ? 'eager' : 'lazy'}/>
    </picture>;
}

export default Picture;