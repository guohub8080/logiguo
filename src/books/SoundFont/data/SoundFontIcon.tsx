import React from 'react'

interface Props {
	className?: string
}

/**
 * SoundFont 书图标（扬声器）
 */
export default function SoundFontIcon({ className }: Props) {
	return (
		<svg className={className} viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M682.666667 341.333333l102.4 0 0 341.333334-102.4 0 0-341.333334Z" fill="#F3ADBA" />
			<path d="M204.8 682.666667H0V341.333333h204.8L580.266667 0v1024z" fill="#E13455" />
			<path d="M921.6 136.533333l102.4 0 0 750.933334-102.4 0 0-750.933334Z" fill="#F3ADBA" />
		</svg>
	)
}
