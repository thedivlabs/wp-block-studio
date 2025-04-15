<?php

global $wp_query;


$css = WPBS_Style::block_styles( $attributes ?? [], $block ?? false );

?>


<?php echo $content ?? false; ?>
