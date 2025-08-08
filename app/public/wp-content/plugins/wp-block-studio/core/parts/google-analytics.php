<?php

if ( empty( $args['id'] ) ) {
	return false;
} else {
	$id = &$args['id'];
}

if ( str_contains( $id, 'GTM' ) ) {

	if ( ! empty( $args['head'] ) ) { ?>
        <!-- Google Tag Manager -->
        <script>(function (w, d, s, l, i) {
                w[l] = w[l] || [];
                w[l].push({
                    'gtm.start':
                        new Date().getTime(), event: 'gtm.js'
                });
                var f = d.getElementsByTagName(s)[0],
                    j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
                j.defer = true;
                j.async = true;
                j.src =
                    'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
                f.parentNode.insertBefore(j, f);
            })(window, document, 'script', 'dataLayer', '<?= $id ?>');</script>
        <!-- End Google Tag Manager -->
	<?php } else { ?>
        <!-- Google Tag Manager (noscript) -->
        <noscript>
            <iframe src="https://www.googletagmanager.com/ns.html?id=<?= $id ?>"
                    height="0" width="0" style="display:none;visibility:hidden"></iframe>
        </noscript>
        <!-- End Google Tag Manager (noscript) -->
	<?php }

} else { ?>

    <!-- Google tag (gtag.js) -->
    <script async defer src="https://www.googletagmanager.com/gtag/js?id=<?= $id ?>"></script>
    <script>
        window.dataLayer = window.dataLayer || [];

        function gtag() {
            dataLayer.push(arguments);
        }

        gtag('js', new Date());

        gtag('config', '<?= $id ?>');
    </script>

<?php }



