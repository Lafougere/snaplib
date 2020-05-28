import { action } from 'typesafe-actions'
import { ImageFile, Tag, Folder } from '../types'

export const SET_FILES = 'SET_FILES'
export const SET_FOLDERS = 'SET_FOLDERS'
export const SET_TAGS = 'SET_TAGS'
export const SET_SELECTION = 'SET_SELECTION'
export const TOGGLE_SELECTION_INDEX = 'TOGGLE_SELECTION_INDEX'
export const TOGGLE_SELECTED = 'TOGGLE_SELECTED'
export const SET_ACTIVE_RESOLUTIONS = 'SET_ACTIVE_RESOLUTIONS'
export const TOGGLE_ACTIVE_RESOLUTION = 'TOGGLE_ACTIVE_RESOLUTION'
export const SET_ACTIVE_TAGS = 'SET_ACTIVE_TAGS'
export const TOGGLE_ACTIVE_TAG = 'TOGGLE_ACTIVE_TAG'
export const FOCUS_FILE = 'FOCUS_FILE'
export const SORT_FILES = 'SORT_FILES'
export const SET_ACTIVE_DATES = 'SET_ACTIVE_DATES'
export const TOGGLE_ACTIVE_DATE = 'TOGGLE_ACTIVE_DATE'
export const SET_ACTIVE_FOLDERS = 'SET_ACTIVE_FOLDERS'
export const TOGGLE_ACTIVE_FOLDER = 'TOGGLE_ACTIVE_FOLDER'
export const SET_ACTIVE_LABELS = 'SET_ACTIVE_LABELS'
export const TOGGLE_ACTIVE_LABEL = 'TOGGLE_ACTIVE_LABEL'


export const setFiles = (files: ImageFile[]) => action(SET_FILES, {files})
export const setFolders = (folders: Folder[]) => action(SET_FOLDERS, {folders})
export const setTags = (tags: Tag[]) => action(SET_TAGS, {tags})
export const setSelection = (selection: string[]) => action(SET_SELECTION, {selection})
export const toggleSelectionIndex = (index: number) => action(TOGGLE_SELECTION_INDEX, {index})
export const toggleSelected = (id: string) => action(TOGGLE_SELECTED, {id})
export const setActiveResolutions = (resolutions: string[]) => action(SET_ACTIVE_RESOLUTIONS, {resolutions})
export const toggleActiveResolution = (resolution: string) => action(TOGGLE_ACTIVE_RESOLUTION, {resolution})
export const setActiveTags = (tags: string[]) => action(SET_ACTIVE_TAGS, {tags})
export const toggleActiveTag = (tag: string) => action(TOGGLE_ACTIVE_TAG, {tag})
export const setActiveDates = (monthStrs: string[]) => action(SET_ACTIVE_DATES, {monthStrs})
export const toggleActiveDate = (monthStr: string) => action(TOGGLE_ACTIVE_DATE, {monthStr})
export const setActiveFolders = (paths: string[]) => action(SET_ACTIVE_FOLDERS, {paths})
export const toggleActiveFolder = (path: string) => action(TOGGLE_ACTIVE_FOLDER, {path})
export const focusFile = (file: ImageFile) => action(FOCUS_FILE, {file})
export const sortFiles = (field: string, direction: 'asc' | 'desc') => action(SORT_FILES, {field, direction})
export const setActiveLabels = (labels: string[]) => action(SET_ACTIVE_LABELS, {labels})
export const toggleActiveLabel = (label: string) => action(TOGGLE_ACTIVE_LABEL, {label})