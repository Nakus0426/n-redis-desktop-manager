interface CellProps {
	title: string
	direction?: 'horizontal' | 'vertical'
}

export default function Cell(props: CellProps, { slots }) {
	const contentDirectionClass = props.direction === 'horizontal' ? 'cell_content-horizontal' : 'cell_content-vertical'
	return (
		<div class="cell">
			<div class="cell_title">{props.title}</div>
			<div class={['cell_content', contentDirectionClass]}>{slots?.default?.()}</div>
		</div>
	)
}

Cell.props = {
	title: {
		type: String,
		required: true,
	},
	direction: {
		type: String,
		default: 'horizontal',
	},
}
