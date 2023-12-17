import React from 'react'

type ProviderType = ({ children }: { children: React.ReactNode }) => React.JSX.Element

interface Props {
	children: React.ReactNode
	providers: Array<ProviderType>
}

const CombineProviders = ({ children, providers }: Props) => {
	return (
		<>
			{providers.reduceRight((acc, Provider) => {
				return <Provider>{acc}</Provider>
			}, children)}
		</>
	)
}

export const Provider = ({ children, providers }: Props) => {
	return <CombineProviders providers={providers}>{children}</CombineProviders>
}
