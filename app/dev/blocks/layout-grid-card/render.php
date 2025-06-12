<?php

global $wp_query;


WPBS_Blocks::render_block_styles( $attributes ?? false );


?>


<?php echo str_replace(
	[ '%__PERMALINK__%' ],
	[
		get_the_permalink(),
	],
	$content ?? ''
); ?>
