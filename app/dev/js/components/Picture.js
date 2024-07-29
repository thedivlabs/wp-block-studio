function Picture({mobile, large}) {

    if (!mobile.url && !large.url) {
        return false;
    }

    const className = [
        'wpbs-picture'
    ].filter(x => x).join(' ');

    console.log(mobile);

    return <picture className={className}>

    </picture>;
}

export default Picture;