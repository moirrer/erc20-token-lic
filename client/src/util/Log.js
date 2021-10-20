// const log = (component, color, ...parameter) => {
// 	console.log('%c{{ ' + component + ' }}', 'color: #' + color, ...parameter)
// }

class Log {
	
	component = ''
	color = ''
	enable = true

  constructor(component, color, enable = true) {
    this.component = component;
    this.color = color;
    this.enable = enable;
  }

	info = (...parameter) => {
		if (this.enable) {
			console.log('%c{{ ' + this.component + ' }}', 'color: ' + this.color, ...parameter)
		}
	}
}

export default Log;