"use client"

import { Laptop, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/shared/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from "@/shared/ui/dropdown-menu"

export function ThemeMode() {
	const { setTheme } = useTheme()

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" className="h-10 w-10 px-0">
					<Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					<span className="sr-only">Toggle theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => setTheme("light")}>
					<Sun className="mr-2 h-4 w-4" />
					<span>Light</span>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("dark")}>
					<Moon className="mr-2 h-4 w-4" />
					<span>Dark</span>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("system")}>
					<Laptop className="mr-2 h-4 w-4" />
					<span>System</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
