"use client"

import React from "react"

import type { User } from "lucia"

type UserContextType = {
	user: User | null
	setUser: (user: User | null) => void
}

const UserContext = React.createContext<UserContextType | null>(null)

export const useUser = (): UserContextType => {
	const context = React.useContext(UserContext)

	if (context === null) {
		throw new Error("useUser must be used within a UserProvider")
	}
	return context
}

export const UserProvider = ({
	children,
	userPromise
}: {
	children: React.ReactNode
	userPromise: Promise<User | null>
}) => {
	const initialUser = React.use(userPromise)
	const [user, setUser] = React.useState<User | null>(initialUser)

	React.useEffect(() => {
		setUser(initialUser)
	}, [initialUser])

	return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>
}
