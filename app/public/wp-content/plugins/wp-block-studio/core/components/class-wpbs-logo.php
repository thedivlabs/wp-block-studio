<?php


class WPBS_Logo {

	public int|bool $color;
	public int|bool $reverse;
	public int|bool $vector;
	public int|bool $vector_reverse;
	public string|bool $type;
	public int|bool $id;

	public function __construct( $fields ) {

		$this->color          = $fields['image']['color'] ?? false;
		$this->reverse        = $fields['image']['reverse'] ?? false;
		$this->vector         = $fields['vector']['color'] ?? false;
		$this->vector_reverse = $fields['vector']['reverse'] ?? false;
		$this->type           = $fields['options']['default'] ?? false;
		$this->id             = $this->get_id();

	}

	private function is_vector( $args = [] ): bool {
		return $this->type != 'vector' ? ! empty( $args['vector'] ) : empty( $args['vector'] );
	}

	private function get_id( $args = [] ): int|string {
		$vector = $this->is_vector( $args );

		return match ( $args['reverse'] ?? false ) {
			true => $vector ? $this->vector_reverse : $this->reverse,
			false => $vector ? $this->vector : $this->color,
			default => $this->color
		};
	}


	public function render( $args = [] ): void {

		$vector  = $this->is_vector( $args );
		$logo_id = $this->get_id( $args );

		if ( ! $vector ) {
			echo wp_get_attachment_image(
				$logo_id,
				$args['size'] ?? 'small',
				false,
				array_filter( [
					'loading' => ! empty( $args['lazy'] ) && empty( $args['header'] ) ? 'lazy' : 'eager',
					'class'   => $args['class'] ?? ( $args['reverse'] ?? false ? 'wpbs-logo wpbs-logo--reverse' : 'wpbs-logo' )
				] )
			);
		} else {
			$file = get_attached_file( $logo_id );

			$file_content        = file_exists( $file ) ? file_get_contents( $file ) : false;
			$start_tag_open_pos  = strpos( $file_content, '<svg' );
			$start_tag_close_pos = strpos( $file_content, '>', $start_tag_open_pos );
			$class_start_pos     = strpos( $file_content, 'class="', $start_tag_open_pos ) + 7;
			$class_end_pos       = strpos( $file_content, '"', $class_start_pos );
			$class_attribute     = substr( $file_content, $class_start_pos, $class_end_pos - $class_start_pos );
			$viewbox_start_pos   = strpos( $file_content, 'viewBox="', $start_tag_open_pos ) + 9;
			$viewbox_end_pos     = strpos( $file_content, '"', $viewbox_start_pos );
			$viewbox_attribute   = array_map( function ( $val ) {
				return round( $val );
			}, explode( ' ', substr( $file_content, $viewbox_start_pos, $viewbox_end_pos - $viewbox_start_pos ) ) ?? [] );
			$svg_tag             = '<svg xmlns="http://www.w3.org/2000/svg" class="' . implode( ' ', array_filter( [
					$args['class'] ?? null,
					$class_attribute ?? null
				] ) ) . '" viewBox="' . implode( ' ', $viewbox_attribute ) . '" preserveAspectRatio="xMinYMin">';


			echo $svg_tag . "\r\n" . substr( $file_content, $start_tag_close_pos + 1 );
		}

	}

}