import { Icon } from '@iconify/vue'
import { useClipboard } from '@vueuse/core'
import { Tooltip, Button, SizeEnum, type ButtonProps } from 'tdesign-vue-next'
import { SetupContext } from 'vue'
import { useLoading } from './useLoading'

interface Option {
	buttonProps: {
		size?: SizeEnum
		disabled?: boolean
		theme?: ButtonProps['theme']
		variant?: ButtonProps['variant']
		shape?: ButtonProps['shape']
		tooltip?: string
		onClick?: ButtonProps['onClick']
	}
	autoCopy?: boolean
	source?: any
}

const iconSizeMap = { small: '16', medium: '20', large: '24' }

export function useCopyButton(option?: Option) {
	const { copy, copied } = useClipboard()
	const autoCopy = [undefined, null].includes(option?.autoCopy) ? true : option.autoCopy
	const { isLoading, enter: enterLoading, exit: exitLoading } = useLoading()

	function CopyButton(props?: Option['buttonProps'], context?: SetupContext) {
		const size = props?.size || option?.buttonProps?.size || 'medium'
		const theme = props?.theme || option?.buttonProps?.theme || 'primary'
		const variant = props?.variant || option?.buttonProps?.variant || 'text'
		const shape = props?.shape || option?.buttonProps?.shape || 'square'
		const tooltip = props?.tooltip || option?.buttonProps?.tooltip || '复制'
		const iconSize = iconSizeMap[size]
		const icon = computed(() => {
			if (isLoading.value) return 'line-md:loading-loop'
			if (!isLoading.value && copied.value) return 'fluent:checkmark-16-regular'
			return 'fluent:copy-select-20-regular'
		})

		async function handleButtonClick() {
			context.emit('click')
			if (autoCopy && option?.source) {
				try {
					enterLoading()
					await copy(option.source)
				} finally {
					exitLoading()
				}
			}
		}

		return (
			<Tooltip content={tooltip} showArrow={false}>
				<Button size={size} theme={theme} variant={variant} shape={shape} onClick={() => handleButtonClick()}>
					<Icon height={iconSize} width={iconSize} icon={icon.value} />
				</Button>
			</Tooltip>
		)
	}

	return {
		CopyButton,
		copy,
		enterLoading,
		exitLoading,
	}
}
