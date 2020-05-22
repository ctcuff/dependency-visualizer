// Returns a function, that, as long as it continues to be invoked,
// will not be triggered. The function will be called after it
//stops being called for "wait" milliseconds
const debounce = (func, wait) => {
    let timeout
    return function () {
        const context = this
        const args = arguments

        const later = function () {
            timeout = null
            func.apply(context, args)
        }

        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

export default debounce
