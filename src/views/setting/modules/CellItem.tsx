interface CellItemProps {
	label?: string
}

export default function CellItem(props: CellItemProps, { slots }) {
	const label = slots?.label ? slots.label() : props.label
	return (
		<div class="cell_content_item">
			<div class="cell_content_item_label">{label}</div>
			<div class="cell_content_item_value">{slots?.default?.()}</div>
		</div>
	)
}
