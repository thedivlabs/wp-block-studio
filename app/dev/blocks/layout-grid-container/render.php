<?php
declare( strict_types=1 );

$is_loop        = ! empty( $block->context['wpbs/isLoop'] );
$query_settings = $block->context['wpbs/query'] ?? [];
$is_current     = ( $query_settings['post_type'] ?? false ) === 'current' && $is_loop;


if(!$is_loop){
	echo $content ?? null;
	return;
}

/**
 * Merge block query attributes with defaults
 */
$default_query = [
	'post_type'      => 'post',
	'taxonomy'       => '',
	'term'           => '',
	'posts_per_page' => 12,
	'orderby'        => 'date',
	'order'          => 'DESC',
];

$merged_query = array_merge( $default_query, $query_settings );

/**
 * Initialize loop instance and render cards
 */
$loop_instance = WPBS_Loop::init();

$loop_data = $loop_instance->render_from_php(
	$block->parsed_block['innerBlocks'][0] ?? [],                       // full block AST
	$merged_query,                 // merged query
	max( 1, get_query_var( 'paged', 1 ) ) // current page
);

WPBS::console_log($loop_data);

/**
 * Output the grid wrapper and loop cards
 */
$open_tag  = substr($content ?? '', 0, strpos($content, '>') + 1);
$close_tag = preg_match('/<\/([a-z0-9\-]+)>$/i', $content, $matches) ? $matches[0] : '';

echo $open_tag;
echo $loop_data['html'] ?? '';
echo $close_tag;

if ( $is_loop ) {
	echo '<script type="application/json" data-wpbs-loop-template>';
	echo wp_json_encode(
		$block->parsed_block['innerBlocks'][0] ?? [],
		JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
	);
	echo '</script>';

	return;
}
