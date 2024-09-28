"use client"

import Link from "next/link"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { FaGithub as GithubIcon, FaGoogle as GoogleIcon } from "react-icons/fa"

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
import { PasswordInput } from "@/shared/ui/password-input"

import { useLogin } from "../hooks/use-login"
import { LoginSchema, type LoginSchemaData } from "../schemas/login-schema"

export const LoginCard = () => {
	const { isPending, login } = useLogin()

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm<LoginSchemaData>({
		resolver: zodResolver(LoginSchema)
	})

	const onSubmit = async (data: LoginSchemaData) => {
		await login(data)
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle className="text-2xl">Login</CardTitle>
				<CardDescription>Enter your credentials below to get started</CardDescription>
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
							placeholder="m@example.com"
							{...register("email")}
						/>
						{errors.email ? (
							<span className="text-red-500">{errors.email.message}</span>
						) : null}
					</div>
					<div>
						<div className="flex items-center justify-between">
							<Label className="font-bold" htmlFor="password">
								Password
							</Label>
							<Link
								href={routes.forgotPassword()}
								className="text-sm font-bold underline">
								Forgot your password?
							</Link>
						</div>
						<PasswordInput id="password" {...register("password")} />
						{errors.password ? (
							<span className="text-red-500">{errors.password.message}</span>
						) : null}
					</div>
					<Button className="w-full font-semibold" disabled={isPending}>
						{isPending ? "Logging in..." : "Login"}
					</Button>
				</form>
			</CardContent>
			<CardFooter className="flex flex-col gap-3">
				<div className="flex w-full items-center justify-center gap-3">
					<div className="flex-1 border-t border-muted" />
					<p className="text-xs font-semibold uppercase text-foreground">
						Or continue with
					</p>
					<div className="flex-1 border-t border-muted" />
				</div>

				<Button asChild className="w-full gap-2" variant="outline" disabled={isPending}>
					<Link href={routes.loginWithGithub()}>
						<GithubIcon className="h-5 w-5" />
						Github
					</Link>
				</Button>
				<Button asChild className="w-full gap-2" variant="outline" disabled={isPending}>
					<Link href={routes.loginWithGoogle()}>
						<GoogleIcon className="h-5 w-5" />
						Google
					</Link>
				</Button>

				<Button variant="link" className="underline" disabled={isPending}>
					<Link href={routes.register()}>Don&apos;t have an account? Sign Up</Link>
				</Button>
			</CardFooter>
		</Card>
	)
}
