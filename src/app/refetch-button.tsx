"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/shared/ui/button"

export const RefetchButton = () => {
	const router = useRouter()

	return <Button onClick={() => router.refresh()}>Refetch</Button>
}
