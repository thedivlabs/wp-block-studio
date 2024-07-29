function Picture({mobile = {}, large = {}, settings = {}}) {

    if (!mobile.url && !large.url) {
        return false;
    }

    const className = [
        'wpbs-picture',
        settings.className || false
    ].filter(x => x).join(' ');

    const urlLarge = large.sizes.large.url || mobile.sizes.large.url || '#';
    const urlMedium = large.sizes.medium.url || mobile.sizes.medium.url || '#';
    const urlMobile = mobile.sizes.medium.url || large.sizes.large.url || '#';

    return <picture className={className}>
        <source src={urlLarge} media={'@media screen and (min-width: 1140px)'}/>
        <source src={urlMedium} media={'@media screen and (min-width: 960px)'}/>
        <source src={urlMobile} media={'@media screen and (min-width: 0px)'}/>
        <img src={urlLarge} alt={large.alt || mobile.alt || ''} aria-hidden={'true'}/>
    </picture>;
}

export default Picture;