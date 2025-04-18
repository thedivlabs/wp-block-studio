<?php

global $wp_query;


$css = WPBS_Style::block_styles( $attributes ?? [], $block ?? false );

//WPBS::console_log( $css );
//WPBS::console_log( $block ?? false );

?>


<?php echo $content ?? false; ?>
