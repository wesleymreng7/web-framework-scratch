const Router = () => {
  const routes = new Map()
  const middlewaresForAll = []

  const getRoutes = () => {
    return routes
  }

  const getMiddlewaresForAll = () => {
    return middlewaresForAll
  }

  const useAll = (...middlewares) => {
    middlewaresForAll.push(...middlewares)
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

  const get = (path, ...handlers) => {
    const middlewaresAndControllers = routes.get(`${path}/GET`) || []
    routes.set(`${path}/GET`, [...middlewaresAndControllers, ...handlers])
  }

  const post = (path, ...handlers) => {
    const middlewaresAndControllers = routes.get(`${path}/POST`) || []
    routes.set(`${path}/POST`, [...middlewaresAndControllers, ...handlers])
  }

  const put = (path, ...handlers) => {
    const middlewaresAndControllers = routes.get(`${path}/PUT`) || []
    routes.set(`${path}/PUT`, [...middlewaresAndControllers, ...handlers])
  }

  const patch = (path, ...handlers) => {
    const middlewaresAndControllers = routes.get(`${path}/PATCH`) || []
    routes.set(`${path}/PATCH`, [...middlewaresAndControllers, ...handlers])
  }

  const del = (path, ...handlers) => {
    const middlewaresAndControllers = routes.get(`${path}/DELETE`) || []
    routes.set(`${path}/DELETE`, [...middlewaresAndControllers, ...handlers])
  }

  return {
    get,
    post,
    put,
    patch,
    del,
    use,
    useAll,
    getRoutes,
    getMiddlewaresForAll
  }

}

module.exports = Router