function Picture({mobile = {}, large = {}, settings = {}}) {

    const {medium: mobileMedium = {}, large: mobileLarge = {}} = mobile.sizes || {};
    const {medium: largeMedium = {}, large: largeLarge = {}} = large.sizes || {};

    let urlLarge;
    let urlMedium;
    let urlMobile;

    if(!settings.force){
        urlLarge = largeLarge.url || mobileLarge.url || false;
        urlMedium = largeMedium.url || mobileMedium.url || false;
        urlMobile = mobileMedium.url || largeLarge.url || false;
    } else {
        urlLarge = largeLarge.url || false;
        urlMedium = largeMedium.url || false;
        urlMobile = mobileMedium.url || false;
    }

    if (!urlLarge && !urlMobile) {
        return false;
    }

    const className = [
        'wpbs-picture',
        settings.className || false,
        !urlLarge ? 'lg:hidden' : false,
        !urlMedium ? 'md:hidden' : false,
        !urlMobile ? 'max-md:hidden' : false,
    ].filter(x => x).join(' ');


    return <picture className={className}>
        <source src={urlLarge || '#'} media={'@media screen and (min-width: 1140px)'}/>
        <source src={urlMedium || '#'} media={'@media screen and (min-width: 960px)'}/>
        <source src={urlMobile || '#'} media={'@media screen and (min-width: 0px)'}/>
        <img src={urlLarge} alt={large.alt || mobile.alt || ''} aria-hidden={'true'}
             loading={settings.eager ? 'eager' : 'lazy'}/>
    </picture>;
}

export default Picture;