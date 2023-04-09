const { createServer } = require('http')
const { match } = require('path-to-regexp')

const App = () => {
    const routes = new Map()
    const createMyServer = () => createServer(serverHandler.bind(this))


    const get = (path, ...handlers) => {
        const currentHandlers = routes.get(`${path}/GET`) || []
        routes.set(`${path}/GET`, [...currentHandlers, ...handlers])
    }

    const post = (path, ...handlers) => {
        const currentHandlers = routes.get(`${path}/POST`) || []
        routes.set(`${path}/POST`, [...currentHandlers, ...handlers])
    }

    const put = (path, ...handlers) => {
        const currentHandlers = routes.get(`${path}/PUT`) || []
        routes.set(`${path}/PUT`, [...currentHandlers, ...handlers])
    }

    const patch = (path, ...handlers) => {
        const currentHandlers = routes.get(`${path}/PATCH`) || []
        routes.set(`${path}/PATCH`, [...currentHandlers, ...handlers])
    }

    const del = (path, ...handlers) => {
        const currentHandlers = routes.get(`${path}/DELETE`) || []
        routes.set(`${path}/DELETE`, [...currentHandlers, ...handlers])
    }

    const dispatchChain = (request, response, middlewares) => {
        return invokeMiddlewares(request, response, middlewares)
    }

    const invokeMiddlewares = async (request, response, middlewares) => {

        if (!middlewares.length) return;

        const currentMiddleware = middlewares[0];

        return currentMiddleware(request, response, async () => {
            await invokeMiddlewares(request, response, middlewares.slice(1));
        })
    }


    const sanitizeUrl = (url, method) => {
        const urlParams = url.split('/').slice(1)

        // remove querystrings from the last parameter
        const [lastParam] = urlParams[urlParams.length - 1].split('?')
        urlParams.splice(urlParams.length - 1, 1)

        // create the URL with our pattern
        const allParams = [...urlParams, lastParam].join('/')
        const sanitizedUrl = `/${allParams}/${method.toUpperCase()}`

        return sanitizedUrl
    }

    const matchUrl = (sanitizedUrl) => {
        for (const path of routes.keys()) {
            const urlMatch = match(path, {
                decode: decodeURIComponent,
            })

            const found = urlMatch(sanitizedUrl)

            if (found) {
                return path
            }
        }
        return false
    }


    const serverHandler = async (request, response) => {
        const sanitizedUrl = sanitizeUrl(request.url, request.method)

        const match = matchUrl(sanitizedUrl)

        if (match) {
            const middlewaresAndControllers = routes.get(match)
            await dispatchChain(request, response, [...middlewaresAndControllers])
        } else {
            response.statusCode = 404
            response.end('Not found')
        }
    }

    const run = (port) => {
        const server = createMyServer()
        server.listen(port)
    }


    return {
        run,
        get,
        post,
        patch,
        put,
        del
    }
}

module.exports = App