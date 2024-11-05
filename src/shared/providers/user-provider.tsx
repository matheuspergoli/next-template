"use client"

import React from "react"

import type { User } from "@/libs/auth"

type UserContextType = {
	user: User | undefined
	setUser: (user: User | undefined) => void
}

const UserContext = React.createContext<UserContextType | undefined>(undefined)

export const useUser = (): UserContextType => {
	const context = React.useContext(UserContext)

	if (!context) {
		throw new Error("useUser must be used within a UserProvider")
	}

	return context
}

export const UserProvider = ({
	children,
	userPromise
}: {
	children: React.ReactNode
	userPromise: Promise<User | undefined>
}) => {
	const initialUser = React.use(userPromise)
	const [user, setUser] = React.useState<User | undefined>(initialUser)

	React.useEffect(() => {
		setUser(initialUser)
	}, [initialUser])

	return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>
}
