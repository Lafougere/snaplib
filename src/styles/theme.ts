import { html, TemplateResult } from 'lit-element'

export const listStyles: TemplateResult = html `
<style>
ul {
	list-style: none;
	padding: 0;
	margin: 0;
	user-select: none;
}
ul li {
	list-style: none;
	padding: 2px 4px;
	display: flex;
	align-items: center;
	font-size: 13px;
	border-bottom: 1px solid #110e1f;
	padding-left: 8px;
	cursor: pointer;
	height: 30px;
	line-height: 30px;
	color: #999;
}

</style>
`
export const scrollbarStyles: TemplateResult = html `
<style>
::-webkit-scrollbar {
	width: 8px;
	height: 8px;
	background: #151127;
}

::-webkit-scrollbar-track {
	background: #151127;
}

::-webkit-scrollbar-thumb {
	background: #211d3a;
}
</style>
`

export const buttonStyles: TemplateResult = html `
<style>
button {
	height: 32px;
	background: #125ea5;
	border: 2px solid #0969b8;
	border-radius: 4px;
	outline: 0;
	padding: 1px 6px;
	color: #ccc;
	cursor: pointer;
	font-size: 14px;
}
button:active {
	padding-top: 4px;
}
button[disabled]{
    opacity: 0.3;
    pointer-events: none;
}
button app-icon {
    margin-right: 4px;
    width: 16px;
    height: 16px;
}
button.delete {
	background: #ac0f31;
}
</style>
`