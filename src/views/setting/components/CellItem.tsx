interface CellItemProps {
	label?: string
	desc?: string
}

export default function CellItem(props: CellItemProps, { slots }) {
	const label = slots?.label ? slots.label() : props.label
	const desc = slots?.desc ? slots.desc() : props.desc
	return (
		<div class="cell_content_item">
			<div class="cell_content_item_label">
				<div class="cell_content_item_label_title">{label}</div>
				{desc ? <div class="cell_content_item_label_desc">{desc}</div> : null}
			</div>
			<div class="cell_content_item_value">{slots?.default?.()}</div>
		</div>
	)
}
