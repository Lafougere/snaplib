// taken from npm bind-decorator
export function bound<T extends Function>(target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> | void {
   
	if (!descriptor || (typeof descriptor.value !== 'function')) {
		throw new TypeError(`Only methods can be decorated with @bind. <${propertyKey}> is not a method!`)
	}
    
	return {
		configurable: true,
		get(this: T): T {
			const bound: T = descriptor.value!.bind(this)
			// Credits to https://github.com/andreypopp/autobind-decorator for memoizing the result of bind against a symbol on the instance.
			Object.defineProperty(this, propertyKey, {
				value: bound,
				configurable: true,
				writable: true
			})
			return bound
		}
	}
}



export function webComponent(tagname: string) {
	return (clazz: any) => {
		clazz.is = tagname
		// window[clazz.name] = clazz; // Register class in windows se that is can be use without IMD module loading.
		// Useful for import in pure JS project.
		customElements.define(tagname, clazz)
	}
}

// export function observe(prop: any){
// 	return function(target: any, key: string, descriptor: any){
// 		const oldUpdated = target.updated
// 		const newUpdated = function(props: any){
// 			if (props.has(prop)){
// 				descriptor.value()
// 			}
// 			if (oldUpdated) oldUpdated(props)
// 		}
// 		target.updated = newUpdated.bind(target)
// 	}
    
// }
// export function observe(prop: any){
// 	return function(target: any, key: string, descriptor: any){
// 		console.log('obs', target, key, descriptor, prop, this)
// 		let _val = target[prop]
// 		console.log('_val', _val)
// 		const getter = function () {
// 			console.log(`Get: ${key} => ${_val}`)
// 			return _val
// 		}
// 		const setter = function (newVal: any) {
// 			console.log(`Set: ${prop} => ${newVal}`, target, key, this)
// 			if (newVal !== _val) target[key](newVal)//descriptor.value(newVal, _val)
// 			_val = newVal
// 		}
// 		delete target[prop]
// 		Object.defineProperty(target, prop, {
// 			get: getter,
// 			set: setter,
// 			enumerable: true,
// 			configurable: true
// 		})
// 	}
    
// }