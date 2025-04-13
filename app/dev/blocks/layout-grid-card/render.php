<?php

global $wp_query;


$css = WPBS_Style::block_styles( $attributes ?? false, $block ?? false );

?>


<div <?php echo get_block_wrapper_attributes( [] ); ?>>

	<?php echo $content ?? false; ?>
</div>
