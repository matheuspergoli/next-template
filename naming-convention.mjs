import fs from 'fs'
import path from 'path'

const SKIP_VALIDATION = process.env.SKIP_NAMING_VALIDATION

function checkNamingConventions(directory) {
	if (SKIP_VALIDATION === 'true') return

	const items = fs.readdirSync(directory)

	for (const item of items) {
		const fullPath = path.join(directory, item)
		const stats = fs.lstatSync(fullPath)

		if (stats.isDirectory()) {
			if (item.toLowerCase() !== item) {
				console.error(`Error: Folder "${fullPath}" should be all lowercase.`)
				process.exit(1)
			}
			checkNamingConventions(fullPath)
		} else if (stats.isFile()) {
			const fileName = item.split('.')[0]

			if (fileName !== fileName.toLowerCase() || /\s/.test(fileName)) {
				console.error(`Error: File "${fullPath}" should be all lowercase.`)
				process.exit(1)
			}
		}
	}
}

checkNamingConventions('./src')
