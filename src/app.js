const { createServer } = require('http')
const { match } = require('path-to-regexp')
const requestDecorator = require('./request')
const responseDecorator = require('./response')
const { readdir } = require('fs/promises')
const { statSync, createReadStream } = require('fs')
const path = require('path')
const { pipeline } = require('stream/promises')

const App = () => {
    const routes = new Map()
    const createMyServer = () => createServer(serverHandler.bind(this))
    const middlewaresForAll = []


    async function* getAllStaticFiles(folder) {

        const files = await readdir(folder)
        for (const file of files) {
            const absolutePath = path.join(folder, file)
            if (statSync(absolutePath).isDirectory()) {
                yield* getAllStaticFiles(absolutePath)
            }
            else {
                yield absolutePath
            }
        }
    }

    const static = async (folderPath) => {
        let folderRelative = folderPath.replace('./', '')
        for await (const file of getAllStaticFiles(folderPath)) {
            const pathWithoutBase = file.replace(folderRelative, '')
            get(pathWithoutBase, async (req, res) => {
                const relativePath = path.join(__dirname, '..', file)
                const fileStream = createReadStream(relativePath)
                res.setHeader('Content-Type', file.split('.').filter(Boolean).slice(1).join('.'))
                return await pipeline(fileStream, res)
            })
        }
    }

    const use = (path, ...middlewares) => {
        const possiblePaths = [path + '/GET', path + '/POST', path + '/PUT', path + '/PATCH', path + '/DELETE']
        possiblePaths.forEach(route => {
            const middlewaresAndControllers = routes.get(route) || []

            if (middlewaresAndControllers.length) {
                routes.set(route, [...middlewares, ...middlewaresAndControllers])
            }
        })
    }

    const useAll = (...middlewares) => {
        middlewaresForAll.push(...middlewares)
    }

    const useRouter = (path, router) => {
        const routerRoutes = router.getRoutes()
        const middlewaresFromRouter = router.getMiddlewaresForAll()
        const existentHandlers = routes.get(path) || []
        routerRoutes.forEach((middlewares, key) => {
            routes.set(`${path + key}`, [...existentHandlers, ...middlewaresFromRouter, ...middlewares])
        })
    }

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
            await dispatchChain(request, response,
                [requestDecorator.bind(null, routes.keys()), responseDecorator, ...middlewaresForAll, ...middlewaresAndControllers])
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
        del,
        use,
        useAll,
        useRouter,
        static
    }
}

module.exports = App