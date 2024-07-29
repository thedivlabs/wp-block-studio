function Picture({mobile = {}, large = {}, settings = {}}) {

    const {medium: mobileMedium = {}, large: mobileLarge = {}} = mobile.sizes || {};
    const {medium: largeMedium = {}, large: largeLarge = {}} = large.sizes || {};

    if (!mobileMedium && !mobileLarge && !largeMedium && !largeLarge) {
        return false;
    }

    const className = [
        'wpbs-picture',
        settings.className || false
    ].filter(x => x).join(' ');


    const urlLarge = largeLarge.url || mobileLarge.url || '#';
    const urlMedium = largeMedium.url || mobileMedium.url || '#';
    const urlMobile = mobileMedium.url || largeLarge.url || '#';

    return <picture className={className}>
        <source src={urlLarge} media={'@media screen and (min-width: 1140px)'}/>
        <source src={urlMedium} media={'@media screen and (min-width: 960px)'}/>
        <source src={urlMobile} media={'@media screen and (min-width: 0px)'}/>
        <img src={urlLarge} alt={large.alt || mobile.alt || ''} aria-hidden={'true'}
             loading={settings.eager ? 'eager' : 'lazy'}/>
    </picture>;
}

export default Picture;