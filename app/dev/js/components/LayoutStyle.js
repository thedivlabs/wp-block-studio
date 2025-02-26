import apiFetch from '@wordpress/api-fetch';


export function LayoutStyle({attributes, blockProps}) {

    const {id} = blockProps;

    if (!id) {
        return false;
    }

    apiFetch({
        path: '/wpbs/v1/layout-styles/',
        method: 'POST',
        data: {
            attributes: attributes,
            selector: '#' + id
        },
    }).then((response) => {
        document.querySelector('#wpbs-layout-styles').innerHTML = response;
    });

    return <style id={'wpbs-layout-styles'}/>;
}
