import React from "react"

import { DashboardLayout } from "@/shared/layouts/dashboard-layout"

export default function Layout({ children }: { children: React.ReactNode }) {
	return <DashboardLayout>{children}</DashboardLayout>
}
