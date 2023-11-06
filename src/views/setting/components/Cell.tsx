interface CellProps {
	title: string
}

export default function Cell(props: CellProps, { slots }) {
	return (
		<div class="cell">
			<div class="cell_title">{props.title}</div>
			<div class="cell_content">{slots?.default?.()}</div>
		</div>
	)
}
