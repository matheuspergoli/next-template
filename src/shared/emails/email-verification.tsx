import React from "react"

import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Tailwind,
	Text
} from "@react-email/components"

interface PasswordResetEmailProps {
	username: string
	verificationCode: string
}

export const EmailVerification = ({
	verificationCode = "123456",
	username = "John Doe"
}: PasswordResetEmailProps) => {
	return (
		<Html>
			<Head />
			<Preview>Email Verification</Preview>
			<Tailwind>
				<Body className="font-sans">
					<Container className="mx-auto my-8 max-w-md rounded-lg p-8 shadow-lg">
						<Heading className="mb-4 text-center text-2xl font-bold">
							Email Verification
						</Heading>
						<Text className="mb-4">Hello {username},</Text>
						<Text className="mb-4">
							We received a request to verify your email. If you didn&apos;t make this
							request, you can safely ignore this email.
						</Text>
						<Button className="block rounded-md bg-black/80 px-3 py-2 text-center text-white">
							{verificationCode}
						</Button>
						<Text className="mt-4 text-sm">
							This email verification code will expire in 15 minutes for security reasons.
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

export default EmailVerification
