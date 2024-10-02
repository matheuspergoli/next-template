"use client"

import Link from "next/link"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { routes, useSafeSearchParams } from "@/shared/navigation/routes"
import { Button } from "@/shared/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from "@/shared/ui/card"
import { Label } from "@/shared/ui/label"
import { PasswordInput } from "@/shared/ui/password-input"

import { useResetPassword } from "../hooks/use-reset-password"
import {
	ResetPasswordSchema,
	type ResetPasswordSchemaData
} from "../schemas/reset-password-schema"

export const ResetPasswordCard = () => {
	const { token } = useSafeSearchParams("resetPassword")
	const { resetUserPassword, isPending } = useResetPassword()

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm<ResetPasswordSchemaData>({
		resolver: zodResolver(ResetPasswordSchema)
	})

	const onSubmit = async (data: ResetPasswordSchemaData) => {
		await resetUserPassword({
			verificationToken: token,
			password: data.newPassword
		})
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle className="text-2xl">Reset your password</CardTitle>
				<CardDescription>
					Enter your new password and confirm it to reset your password
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-5">
				<form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
					<div>
						<Label className="font-bold" htmlFor="new-password">
							New password
						</Label>
						<PasswordInput id="new-password" {...register("newPassword")} />
						{errors.newPassword ? (
							<span className="text-red-500">{errors.newPassword.message}</span>
						) : null}
					</div>
					<div>
						<Label className="font-bold" htmlFor="confirm-new-password">
							Confirm new password
						</Label>
						<PasswordInput
							id="confirm-new-password"
							{...register("confirmNewPassword")}
						/>
						{errors.confirmNewPassword ? (
							<span className="text-red-500">{errors.confirmNewPassword.message}</span>
						) : null}
					</div>
					<Button className="w-full font-semibold" disabled={isPending}>
						{isPending ? "Resetting..." : "Reset password"}
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
