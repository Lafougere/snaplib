import { ActionType, StateType } from 'typesafe-actions'
import { ImageFile, Tag, Folder } from '../types'
import * as actions from './actions'
import { toggleCollection } from '../lib/utils'
import tinycolor from 'tinycolor2'

export type AppAction = ActionType<typeof actions>

export interface AppStateType {
    files: ImageFile[]
    folders: Folder[]
	tags: Tag[]
	resolutions: string[]
	selection: string[]
	focusedFile: ImageFile
	filters: {
		activeResolutions: string[]
		activeTags: string[]
		activeDates: string[]
		activeFolders: string[]
		activeLabels: string[]
	}
}

const INITIAL_STATE: AppStateType = {
	files: [],
	folders: [],
	tags: [],
	resolutions: [],
	selection: [],
	focusedFile: null,
	filters: {
		activeResolutions: JSON.parse(localStorage.getItem('activeResolutions') || '[]'),
		activeTags: JSON.parse(localStorage.getItem('activeTags') || '[]'),
		activeDates: JSON.parse(localStorage.getItem('activeDates') || '[]'),
		activeFolders: JSON.parse(localStorage.getItem('activeFolders') || '[]'),
		activeLabels: JSON.parse(localStorage.getItem('activeLabels') || '[]')
	}
}

const convert = (color: any) => {
	const {h: hue, s: saturation, l: lightness, a: alpha} = tinycolor(color).toHsl()

	return {
		hue,
		saturation,
		lightness,
		alpha,
		authored: color
	}
}

const sortFn = (a: ImageFile, b: ImageFile) => {
	if (!a.dominant && b.dominant) return -1
	if (a.dominant && !b.dominant) return 1
	if (!a.dominant && !b.dominant) {
		return 0
	}
	const colorA = convert({r: a.dominant[0], g: a.dominant[1], b:a.dominant[2]})
	const colorB = convert({r: b.dominant[0], g: b.dominant[1], b:b.dominant[2]})
	// Move fully transparent colors to the back and
	// sort by A-Z if both colors are fully transparent
	if (colorA.alpha === 0 || colorB.alpha === 0) {
		if (colorA.alpha === colorB.alpha) {
			return colorA.authored.toLowerCase().localeCompare(colorB.authored.toLowerCase())
		}

		return colorB.alpha - colorA.alpha
	}

	// Move grey-ish values to the back
	if (
		(colorA.saturation === 0 || colorB.saturation === 0) &&
		colorA.saturation !== colorB.saturation
	) {
		return colorB.saturation - colorA.saturation
	}
	const ha = Math.round(colorA.hue / 64)
	const hb = Math.round(colorB.hue  / 64)
	// Sort by hue (lowest first)
	if (ha !== hb) {
		return ha - hb
	}

	// Sort by saturation (highest first)
	if (colorA.saturation !== colorB.saturation) {
		return colorA.saturation - colorB.saturation
	}

	// Comparing gray values, light before dark
	if (colorA.saturation === 0 && colorB.saturation === 0) {
		if (colorA.lightness !== colorB.lightness) {
			return colorB.lightness - colorA.lightness
		}
	}

	// Sort by transparency, least transparent first
	if (colorA.alpha !== colorB.alpha) {
		return colorB.alpha - colorA.alpha
	}
}

export const reducer = (state: AppStateType = INITIAL_STATE, action: AppAction) => {
	switch (action.type) {
	case actions.SET_FILES: {
		const files = action.payload.files.map(file => {
			const res = `${file.w}x${file.h}`
			file.res = res
			file.tags = file.tags || []
			file.faces = file.faces || []
			return file
		})
		// files.sort(sortFn)
		// console.log('storefiles', files)
		return {
			...state,
			files,
		}
	}
	case actions.SORT_FILES : {
		const files = [...state.files]
		if (action.payload.field === 'path'){
			files.sort((a: ImageFile, b: ImageFile) => {
				if (a.path < b.path) return -1
				if (a.path > b.path) return 1
				return 0
			})
		}
		if (action.payload.field === 'date'){
			files.sort((a: ImageFile, b: ImageFile) => a.dateModified.getTime() - b.dateModified.getTime())
		}
		if (action.payload.field === 'hue'){
			files.sort(sortFn)
		}
		if (action.payload.direction === 'desc'){
			files.reverse()
		}
		return {
			...state,
			files,
		}
	}
	case actions.SET_FOLDERS:
		return {
			...state,
			folders: action.payload.folders
		}
	case actions.SET_TAGS:
		return {
			...state,
			tags: action.payload.tags
		}
	case actions.SET_SELECTION:
		return {
			...state,
			selection: action.payload.selection
		}
	case actions.TOGGLE_SELECTION_INDEX: {
		const selection = [...state.selection]
		toggleCollection(selection, action.payload.index)
		return {
			...state,
			selection,
		}
	}
	case actions.TOGGLE_SELECTED: {
		const selection = [...state.selection]
		toggleCollection(selection, action.payload.id)
		return {
			...state,
			selection,
		}
	}
	case actions.SET_ACTIVE_RESOLUTIONS: {
		const s:AppStateType  = {...state}
		s.filters.activeResolutions = action.payload.resolutions
		localStorage.setItem('activeResolutions', JSON.stringify(s.filters.activeResolutions))
		return s
	}
	case actions.TOGGLE_ACTIVE_RESOLUTION: {
		const s:AppStateType  = {...state}
		const resolutions = [...s.filters.activeResolutions]
		toggleCollection(resolutions, action.payload.resolution)
		localStorage.setItem('activeResolutions', JSON.stringify(resolutions))
		s.filters.activeResolutions = resolutions
		return s
	}
	case actions.SET_ACTIVE_TAGS: {
		const s:AppStateType  = {...state}
		s.filters.activeTags = action.payload.tags
		localStorage.setItem('activeTags', JSON.stringify(s.filters.activeTags))
		return s
	}
	case actions.TOGGLE_ACTIVE_TAG: {
		const s:AppStateType  = {...state}
		const tags = [...s.filters.activeTags]
		toggleCollection(tags, action.payload.tag)
		localStorage.setItem('activeTags', JSON.stringify(tags))
		s.filters.activeTags = tags
		return s
	}
	case actions.SET_ACTIVE_DATES: {
		const s:AppStateType  = {...state}
		s.filters.activeDates = action.payload.monthStrs
		localStorage.setItem('activeDates', JSON.stringify(s.filters.activeDates))
		return s
	}
	case actions.TOGGLE_ACTIVE_DATE: {
		const s:AppStateType  = {...state}
		const dates = [...s.filters.activeDates]
		toggleCollection(dates, action.payload.monthStr)
		// console.log(dates)
		localStorage.setItem('activeDates', JSON.stringify(dates))
		s.filters.activeDates = dates
		return s
	}
	case actions.SET_ACTIVE_FOLDERS: {
		const s:AppStateType  = {...state}
		s.filters.activeFolders = action.payload.paths
		localStorage.setItem('activeFolders', JSON.stringify(s.filters.activeFolders))
		return s
	}
	case actions.TOGGLE_ACTIVE_FOLDER: {
		const s:AppStateType  = {...state}
		const folders = [...s.filters.activeFolders]
		toggleCollection(folders, action.payload.path)
		// console.log(dates)
		localStorage.setItem('activeFolders', JSON.stringify(folders))
		s.filters.activeFolders = folders
		return s
	}
	case actions.SET_ACTIVE_LABELS: {
		const s:AppStateType  = {...state}
		s.filters.activeLabels = action.payload.labels
		localStorage.setItem('activeLabels', JSON.stringify(s.filters.activeLabels))
		return s
	}
	case actions.TOGGLE_ACTIVE_LABEL: {
		const s:AppStateType  = {...state}
		const labels = [...s.filters.activeLabels]
		toggleCollection(labels, action.payload.label)
		// console.log(dates)
		localStorage.setItem('activeLabels', JSON.stringify(labels))
		s.filters.activeLabels = labels
		return s
	}
	case actions.FOCUS_FILE:
		return {
			...state,
			focusedFile: action.payload.file
		}
	default:
		return state
	}
}

export type AppState = StateType<typeof reducer>
export default reducer