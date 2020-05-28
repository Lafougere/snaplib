import { store } from '../store'
import { setFiles, setTags, setFolders } from '../store/actions'
import { Tag, ImageFile } from '../types'
import { Folder } from '../types/index'


declare const window: any
const ipc: any = window['ipc'] as any


class Api {

	on(msg: string, cb: Function){
		return ipc.on(msg, (evt: any, ...restOfArgs: any[]) => {
			cb(...restOfArgs)
		})
	}
	
	request(msg: string, ...restOfArgs: any[]){
		return ipc.invoke(msg, ...restOfArgs)
	}
	
	send(msg: string, ...restOfArgs: any[]){
		return ipc.send(msg, ...restOfArgs)
	}

	listFiles(){
		return this.request('list files').then((files: ImageFile[]) => {
			store.dispatch(setFiles(files))
			const test= files.filter(f => !f.dateModified)
			console.log('miss date', test)
			return files
		})
	}

	saveFile(file: ImageFile){
		return api.request('update file', file)
	}

	getFolderTree(path: string){
		return api.request('folder tree', path)
	}

	listFolders(){
		return api.request('list folders').then((folders: Folder[]) => {
			store.dispatch(setFolders(folders))
			return folders
		})
	}
	
	listTags(){
		return api.request('list tags').then((tags: Tag[]) => {
			store.dispatch(setTags(tags))
			return tags
		})
	}
	
	addTag(tag: string){
		return api.request('add tag', tag).then(() => {
			return this.listTags()
		})
	}

	removeTag(id: string){
		return api.request('delete tag', id).then(() => {
			return this.listTags()
		})
	}

	addFolder(path: string){
		return api.request('add folder', path).then(() => {
			this.listFolders()
			return this.listFiles()
		})
	}

	removeFolder(id: string){
		return api.request('remove folder', id).then(() => {
			this.listFolders()
			return this.listFiles()
		})
	}

	getMeta(path: string){
		return api.request('get meta', path)
	}

	copyFiles(fromPaths: string[], toPath: string){
		return api.request('copy files', fromPaths, toPath)
	}
	
	moveFiles(fromPaths: string[], toPath: string){
		return api.request('move files', fromPaths, toPath)
	}
	
}
const api = new Api()
export { Api, api }