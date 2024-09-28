"use client"

import Link from "next/link"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { routes } from "@/shared/navigation/routes"
import { Button } from "@/shared/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from "@/shared/ui/card"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"

import { useForgotPassword } from "../hooks/use-forgot-password"
import {
	ForgotPasswordSchema,
	type ForgotPasswordSchemaData
} from "../schemas/forgot-password-schema"

export const ForgotPasswordCard = () => {
	const { forgotPassword, isPending } = useForgotPassword()

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm<ForgotPasswordSchemaData>({
		resolver: zodResolver(ForgotPasswordSchema)
	})

	const onSubmit = async (data: ForgotPasswordSchemaData) => {
		await forgotPassword(data)
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle className="text-2xl">Forgot password</CardTitle>
				<CardDescription>
					Enter your email address and we&apos;ll send you a link to reset your password.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-5">
				<form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
					<div>
						<Label className="font-bold" htmlFor="email">
							Email
						</Label>
						<Input
							type="email"
							id="email"
							placeholder="Enter your email"
							{...register("email")}
						/>
						{errors.email ? (
							<span className="text-red-500">{errors.email.message}</span>
						) : null}
					</div>
					<Button className="w-full font-semibold" disabled={isPending}>
						Send link
					</Button>
				</form>
			</CardContent>
			<CardFooter>
				<Button
					variant="link"
					className="mx-auto text-center underline"
					disabled={isPending}>
					<Link href={routes.login()}>Back to login</Link>
				</Button>
			</CardFooter>
		</Card>
	)
}
