'use client'

import Link, { LinkProps } from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/libs/utils'
import { ButtonProps, buttonVariants } from '@/shared/ui/button'

type ActiveLinkProps = LinkProps & {
	children: React.ReactNode
	className?: string
}

export const ActiveLink = ({ href, children, className, ...rest }: ActiveLinkProps) => {
	const pathname = usePathname()
	const isActive = pathname === href.toString()
	const variant: ButtonProps['variant'] = isActive ? 'default' : 'ghost'

	return (
		<Link href={href} className={cn(buttonVariants({ variant }), className)} {...rest}>
			{children}
		</Link>
	)
}
