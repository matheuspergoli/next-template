"use client"

import React from "react"
import Link, { type LinkProps } from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/libs/utils"
import { buttonVariants, type ButtonProps } from "@/shared/ui/button"

interface ActiveLinkProps extends LinkProps {
	children: React.ReactNode
	className?: string
}

export const ActiveLink = React.forwardRef<HTMLAnchorElement, ActiveLinkProps>(
	({ href, className, ...rest }, ref) => {
		const pathname = usePathname()
		const isActive = pathname === (typeof href === "string" ? href : href.pathname)
		const variant: ButtonProps["variant"] = isActive ? "default" : "ghost"

		return (
			<Link
				{...rest}
				ref={ref}
				href={href}
				className={cn(buttonVariants({ variant }), className)}
			/>
		)
	}
)
ActiveLink.displayName = "ActiveLink"
