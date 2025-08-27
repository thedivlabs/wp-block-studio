<?php

$search_value = isset( $_GET['s'] ) ? esc_attr( $_GET['s'] ) : '';
$sort_value   = isset( $_GET['sort'] ) ? esc_attr( $_GET['sort'] ) : '';


$search  = [ '#--WPBS-SEARCH--#', '#--WPBS-SORT--#' ];
$replace = [ $search_value, $sort_value ];

$block_content = str_replace( $search, $replace, $content ?? '' );
