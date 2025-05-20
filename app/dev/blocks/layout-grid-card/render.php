<?php

global $wp_query;


WPBS_Blocks::render_block_styles($attributes ?? false);

//WPBS::console_log( $css );
//WPBS::console_log( $block ?? false );

?>


<?php echo $content ?? false; ?>
