const { match } = require('path-to-regexp')

const RequestDecorator = (routes, request, response, next) => {

    const getParams = () => {
        const urlParams = request.url.split('/').slice(1)

        // remove querystrings from the last parameter
        const [lastParam] = urlParams[urlParams.length - 1].split('?')
        urlParams.splice(urlParams.length - 1, 1)

        // joining all params without querystrings
        const allParams = [...urlParams, lastParam].join('/')

        // matching url pattern to get the params
        for (const path of routes) {
            const urlMatch = match(path, {
                decode: decodeURIComponent,
            });
            const url = `/${allParams}/${request.method.toUpperCase()}`
            const found = urlMatch(url)
            if (found) {
                Object.keys(found.params).forEach(key => {
                    request.params = {
                        ...request.params,
                        [key]: found.params[key]
                    }
                })
                break
            }
        }
    }

    const getQuery = () => {
        const urlParams = request.url.split('/').slice(1)

        // Isolating query strings
        const [lastParam, queryString] = urlParams[urlParams.length - 1].split('?')
        let params = new URLSearchParams(queryString);
        let entries = params.entries();

        request.query = {
            ...request.query,
            ...Object.fromEntries(entries)
        }
    }

    getParams()
    getQuery()
    next()
}

module.exports = RequestDecorator