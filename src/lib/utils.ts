export function toggleCollection(collection: any[], item: any) {
	const idx = collection.indexOf(item)
	if (idx !== -1) {
		collection.splice(idx, 1)
	}
	else {
		collection.push(item)
	}
}

export function formatBytes(bytes: number, decimals = 2) {
	if (bytes === 0) return '0 Bytes'
	
	const k = 1024
	const dm = decimals < 0 ? 0 : decimals
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

	const i = Math.floor(Math.log(bytes) / Math.log(k))

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
export function rgbToHsv(r: number, g: number, b: number) {
	r /= 255, g /= 255, b /= 255
  
	var max = Math.max(r, g, b), min = Math.min(r, g, b)
	var h, s, v = max
  
	var d = max - min
	s = max == 0 ? 0 : d / max
  
	if (max == min) {
		h = 0 // achromatic
	} else {
		switch (max) {
		case r: h = (g - b) / d + (g < b ? 6 : 0); break
		case g: h = (b - r) / d + 2; break
		case b: h = (r - g) / d + 4; break
		}
  
		h /= 6
	}
  
	return [ h, s, v ]
}