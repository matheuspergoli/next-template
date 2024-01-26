import React from "react"

interface UseClickOutsideConfig {
	onOutside: () => void
}

interface UseClickOutsideReturn<T extends HTMLElement> {
	ref: React.MutableRefObject<T | null>
}

export type { UseClickOutsideConfig, UseClickOutsideReturn }

const assertIsNode = (target: EventTarget | Node | null): target is Node => {
	return !!target && "nodeType" in target
}

export const useClickOutside = <T extends HTMLElement>({
	onOutside
}: UseClickOutsideConfig) => {
	const ref = React.useRef<T>(null)

	React.useEffect(() => {
		const handleClickOutside = ({ target }: MouseEvent) => {
			if (assertIsNode(target) && ref.current?.contains(target)) return

			onOutside()
		}

		document.addEventListener("mousedown", handleClickOutside)

		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [onOutside])

	return { ref }
}
