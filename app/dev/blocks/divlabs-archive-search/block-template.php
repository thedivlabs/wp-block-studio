<?php

global $wp_query;

$class = implode( ' ', array_filter( [
	'divlabs-archive-search w-auto flex flex-col text-left relative'
] ) );

$post_type = DIVLABS::get_post_type( true );


?>

<div <?= DIVLABS::block_attributes( [
	'class' => $class,
], $block ?? false ) ?>>

	<?php if ( ! empty( $fields['label'] ) ) { ?>
        <label for="divlabs-archive-search-field">
			<?= $fields['label'] ?>
        </label>
	<?php } ?>
    <div class="divlabs-archive-search__field w-full flex relative overflow-hidden">
        <div class="divlabs-archive-search__input w-full flex !border-r-0">
            <input class="w-full h-full !font-normal outline-none border-none appearance-none"
                   type="text" name="s"
                   placeholder="<?= $fields['placeholder'] ?? 'Search' ?>"
                   aria-label="<?= $fields['placeholder'] ?? $fields['label'] ?? 'Search' ?>"
                   id="divlabs-archive-search-field" value="<?= get_search_query() ?? null ?>">
        </div>

        <input type="hidden" name="post_type" value="<?= $post_type ?>"/>


        <button class="divlabs-archive-search__btn px-4 py-1 !border-l-0 flex overflow-hidden text-center justify-center items-center text-xl leading-none"
                type="submit"><?= $fields['button_icon'] ?? '<i class="fa-light fa-magnifying-glass"></i>' ?>
        </button>
    </div>
</div>