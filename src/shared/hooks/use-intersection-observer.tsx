import React from "react"

type IntersectionObserverConfig = IntersectionObserverInit

interface IntersectionObserverReturn<T extends HTMLElement> {
	visible: boolean
	ref: React.MutableRefObject<T | null>
}

export const useIntersectionObserver = <T extends HTMLElement>(
	config: IntersectionObserverConfig = {}
): IntersectionObserverReturn<T> => {
	const { threshold, root, rootMargin } = config

	const ref = React.useRef<T>(null)
	const [visible, setVisible] = React.useState(false)

	React.useEffect(() => {
		const isClient = typeof window !== "undefined"
		if (!isClient) return

		const isSupported = "IntersectionObserver" in window
		if (!isSupported) {
			console.error("IntersectionObserver is not supported. Try to use polyfill.")
			return
		}

		const listen: IntersectionObserverCallback = ([entry]) => {
			setVisible(entry?.isIntersecting ?? false)
		}

		const currentRef = ref.current
		const observer = new IntersectionObserver(listen, {
			threshold,
			root,
			rootMargin
		})

		currentRef && observer.observe(currentRef)
		return () => {
			currentRef && observer.unobserve(currentRef)
		}
	}, [threshold, root, rootMargin])

	return { ref, visible }
}
