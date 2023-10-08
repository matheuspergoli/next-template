import { HttpHandler } from '@libs/network'

export interface User {
	id: number
	name: string
	email: string
}

export class UserManagementApi {
	private static http = new HttpHandler('https://jsonplaceholder.typicode.com')

	public static async getUsers() {
		const url = '/users'

		const result = await this.http.get<User[]>(url)

		if (result.success) {
			return result.data
		} else {
			throw result.error
		}
	}

	public static async getUser() {
		const url = '/users/1'

		const result = await this.http.get<User>(url)

		if (result.success) {
			return result.data
		} else {
			throw result.error
		}
	}
}
