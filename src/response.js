const ResponseDecorator = (req, res, next) => {
    res.status = (status) => {
        res.statusCode = status
        return res
    }
    res.json = (data) => {
        res.setHeader('Content-type', 'application/json')
        res.end(JSON.stringify(data))
    }

    res.send = async (data) => {
        res.end(data)
    }

    res.render = async (templatePath, data) => {
        // We are going to implement it later
    }

    next()

}

module.exports = ResponseDecorator