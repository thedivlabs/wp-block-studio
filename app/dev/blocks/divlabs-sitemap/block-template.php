<?php

if ( empty( $fields['content'] ) ) {
	return false;
}

?>

<section <?= DIVLABS::block_attributes( [
	'class' => 'divlabs-sitemap divlabs-section'
], $block ?? false ) ?>>

    <div class="container mx-auto">

        <ul class="w-full flex flex-col gap-12 !list-none !p-0">
			<?php foreach ( $fields['content'] as $k => $row ) {

				switch ( $row['acf_fc_layout'] ?? false ) {
					case 'post_type':
						DIVLABS::component( 'parts/section', 'cpt', $row, 'sitemap' );
						break;
					case 'taxonomy':
						DIVLABS::component( 'parts/section', 'tax', $row, 'sitemap' );
						break;
				}

			} ?>
        </ul>

    </div>

</section>
