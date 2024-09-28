import React from "react"

import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Link,
	Preview,
	Tailwind,
	Text
} from "@react-email/components"

interface PasswordResetEmailProps {
	verificationLink: string
	username: string
}

export const PasswordResetEmail = ({
	verificationLink = "https://example.com",
	username = "John Doe"
}: PasswordResetEmailProps) => {
	return (
		<Html>
			<Head />
			<Preview>Reset your password</Preview>
			<Tailwind>
				<Body className="font-sans">
					<Container className="mx-auto my-8 max-w-md rounded-lg p-8 shadow-lg">
						<Heading className="mb-4 text-center text-2xl font-bold">
							Password Reset
						</Heading>
						<Text className="mb-4">Hello {username},</Text>
						<Text className="mb-4">
							We received a request to reset your password. If you didn&apos;t make this
							request, you can safely ignore this email.
						</Text>
						<Link
							href={verificationLink}
							className="block rounded-md bg-black/80 px-3 py-2 text-center text-white">
							Reset Your Password
						</Link>
						<Text className="mt-4 text-sm">
							If the button doesn&apos;t work, you can also copy and paste this link into
							your browser:
						</Text>
						<Text className="break-all text-sm">{verificationLink}</Text>
						<Text className="mt-4 text-sm">
							This password reset link will expire in 2 hours for security reasons.
						</Text>
						<Text className="mt-4 text-sm">
							Best regards,
							<br />
							Acme Inc
						</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}

export default PasswordResetEmail
