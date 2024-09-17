interface AppConfig {
	afterLoginUrl: string
}

export const APP_CONFIG = {
	afterLoginUrl: "/"
} satisfies AppConfig

export const MAX_UPLOAD_IMAGE_SIZE_IN_MB = 5
export const MAX_UPLOAD_IMAGE_SIZE = 1024 * 1024 * MAX_UPLOAD_IMAGE_SIZE_IN_MB
