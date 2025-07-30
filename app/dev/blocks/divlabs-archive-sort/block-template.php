<?php

$class = implode( ' ', array_filter( [
	'divlabs-archive-sort w-auto flex flex-col text-left relative'
] ) );

?>

<div <?= DIVLABS::block_attributes( [
	'class' => $class,
], $block ?? false ) ?>>

	<?php if ( ! empty( $fields['label'] ) ) { ?>
        <label for="divlabs-archive-sort-field">
			<?= $fields['label'] ?>
        </label>
	<?php } ?>
    <div class="divlabs-archive-sort__field w-full flex relative overflow-hidden">
        <div class="divlabs-archive-sort__input w-full flex gap-3 items-center">
            <span class="whitespace-nowrap">Sort by:</span>
            <select class="grow h-full !font-normal outline-none border-none appearance-none"
                    name="order"
                    id="divlabs-archive-sort-field"
                    onchange="this.form.submit()"
            >
                <option value="DESC" <?= ( $_GET['order'] ?? false ) == 'DESC' ? 'selected' : null ?>>Latest</option>
                <option value="ASC" <?= ( $_GET['order'] ?? false ) == 'ASC' ? 'selected' : null ?>>Oldest</option>
            </select>

            <div class="divlabs-archive-sort__icon text-xl leading-normal">
				<?= $fields['button_icon'] ?? '<i class="fa-light fa-arrow-up-wide-short"></i>' ?>
            </div>
        </div>

        <input type="hidden" name="orderby" value="date"/>


    </div>
</div>