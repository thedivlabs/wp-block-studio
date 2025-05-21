<?php

global $wp_query;


WPBS_Blocks::render_block_styles( $attributes ?? false );


?>


<?php echo $content ?? false; ?>
