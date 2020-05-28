export interface ImageFile {
    _id: string
    path: string
    folder_id: string
    dateModified: Date
    w: number
    h: number
    size: number
    tags?: string[]
    res?: string
    dominant?: [number,number,number]
    palette?: [number, number, number][]
    hue?: number
    saturation?: number
    faces?: any[]
}

export interface Tag {
    _id: string
    name: string
}

export interface Folder {
    _id: string
    path: string
    isExpanded?: boolean
}

export interface OpenDialogResult {
    canceled: boolean
    filePaths: string[]
    bookmarks?: any
}

export interface ColorData {
    dominant: [number, number, number]
    palette: [number, number, number][]
}