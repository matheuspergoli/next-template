"use client"

import React from "react"

import { EyeIcon, EyeOffIcon } from "lucide-react"

import { cn } from "@/libs/utils"

import { Button } from "./button"
import { Input } from "./input"

const PasswordInput = React.forwardRef<
	HTMLInputElement,
	React.InputHTMLAttributes<HTMLInputElement>
>(({ className, disabled, ...props }, ref) => {
	const [showPassword, setShowPassword] = React.useState(false)

	return (
		<div className="relative">
			<Input
				type={showPassword ? "text" : "password"}
				className={cn("hide-password-toggle pr-10", className)}
				ref={ref}
				{...props}
			/>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
				onClick={() => setShowPassword((prev) => !prev)}
				disabled={disabled}>
				{showPassword && !disabled ? (
					<EyeIcon className="h-4 w-4" aria-hidden="true" />
				) : (
					<EyeOffIcon className="h-4 w-4" aria-hidden="true" />
				)}
				<span className="sr-only">
					{showPassword ? "Hide password" : "Show password"}
				</span>
			</Button>

			<style>{`
					.hide-password-toggle::-ms-reveal,
					.hide-password-toggle::-ms-clear {
						visibility: hidden;
						pointer-events: none;
						display: none;
					}
				`}</style>
		</div>
	)
})
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
