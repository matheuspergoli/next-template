import { sha1 } from "oslo/crypto"
import { encodeHex } from "oslo/encoding"
import zxcvbn from "zxcvbn"

export const checkPasswordStrength = (password: string) => {
	const checkPasswordStrength = zxcvbn(password)

	return checkPasswordStrength
}

export const checkPasswordLeaks = async (password: string) => {
	const passwordHash = encodeHex(await sha1(new TextEncoder().encode(password)))
	const hashPrefix = passwordHash.slice(0, 5).toUpperCase()

	const response = await fetch(`https://api.pwnedpasswords.com/range/${hashPrefix}`)

	if (response.ok) {
		const body = await response.text()
		const lines = body.split("\n")
		const hashSuffix = passwordHash.slice(5).toUpperCase()

		for (const line of lines) {
			const [suffix] = line.split(":")
			if (suffix === hashSuffix) {
				return true
			}
		}

		return false
	}

	return false
}
