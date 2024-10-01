"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { ChevronRight } from "lucide-react"

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator
} from "@/shared/ui/breadcrumb"

interface AutoBreadcrumbProps {
	path?: string
	homeLabel?: string
}

export const AutoBreadcrumb = ({ path, homeLabel = "Home" }: AutoBreadcrumbProps) => {
	const pathname = usePathname()

	const getSegments = () => {
		if (path) return path.split("/").filter(Boolean)
		return pathname.split("/").filter(Boolean)
	}

	const segments = getSegments()
	const breadcrumbs = [
		{ label: homeLabel, href: "/" },
		...segments.map((segment, index) => ({
			label: segment.charAt(0).toUpperCase() + segment.slice(1),
			href: `/${segments.slice(0, index + 1).join("/")}`
		}))
	]

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{breadcrumbs.map((crumb, index) => (
					<React.Fragment key={crumb.href}>
						<BreadcrumbItem>
							{index === breadcrumbs.length - 1 ? (
								<BreadcrumbPage>{crumb.label}</BreadcrumbPage>
							) : (
								<BreadcrumbLink asChild>
									<Link href={crumb.href}>{crumb.label}</Link>
								</BreadcrumbLink>
							)}
						</BreadcrumbItem>
						{index < breadcrumbs.length - 1 && (
							<BreadcrumbSeparator>
								<ChevronRight className="h-4 w-4" />
							</BreadcrumbSeparator>
						)}
					</React.Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	)
}
