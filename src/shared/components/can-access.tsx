"use client"

import React from "react"

import type { Roles } from "@/server/db/schema"

import { useUser } from "../providers/user-provider"

type CanRoles = Roles | Roles[]

interface CanProps {
	role: CanRoles
	children: React.ReactNode
}

interface CanContext {
	can: boolean | null
}

const CanContext = React.createContext<CanContext | null>(null)

const check = (userRoles: CanRoles, requiredRoles: CanRoles) => {
	if (Array.isArray(requiredRoles)) {
		return requiredRoles.some((role) => userRoles.includes(role))
	}

	return userRoles.includes(requiredRoles)
}

export const CanAccess = ({ role, children }: CanProps) => {
	const { user } = useUser()

	const can = user ? check(user.role, role) : null

	return <CanContext.Provider value={{ can }}>{children}</CanContext.Provider>
}

const useCanContext = () => {
	const context = React.useContext(CanContext)

	if (context === null) {
		throw new Error("useCan must be used within a Can component")
	}

	return context
}

export const Yes = ({ children }: { children: React.ReactNode }) => {
	const { can } = useCanContext()
	return can ? <>{children}</> : null
}

export const No = ({ children }: { children: React.ReactNode }) => {
	const { can } = useCanContext()
	return can === false ? <>{children}</> : null
}
