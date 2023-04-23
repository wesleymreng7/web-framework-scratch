const App = require('./src/app')
const Router = require('./src/router')

const app = App()
const router = Router()


app.get('/test/test2', function test() { }, function test2() { })
app.post('/test', (req, res) => console.log('test'))
app.patch('/test', (req, res) => console.log('test'))
app.put('/test', (req, res) => console.log('test'))
app.del('/test', (req, res) => console.log('test'))


const mid1 = (req, res, next) => {
    console.log('mid1')
    next()
}

const mid2 = (req, res, next) => {
    console.log('mid2')
    next()
}

const controller = (req, res) => {
    console.log('controller')
    res.end('controller')
}

app.get('/middleware', mid1, mid2, controller)


app.get('/params/:id/:name', (req, res) => {
    res.end(JSON.stringify({ params: req.params, query: req.query }, null, 2))
})

app.get('/response/:id', (req, res) => {
    if (req.params.id === '123') {
        res.status(200).json(req.params)
        return
    }

    res.status(400).json({ message: 'Invalid id' })
})

router.get('/users', (req, res) => res.end('User route from router instance'))
router.get('/admins', (req, res) => res.end('Admins route'))

router.useAll((req, res, next) => {
    console.log('middleware for router instance /admins and /users')
    next()
})

router.use('/users', (req, res, next) => {
    console.log('middleware for /users')
    next()
})

router.use('/admins', (req, res, next) => {
    console.log('middleware for /admins')
    next()
})


app.useRouter('', router)

app.use('/admins', (req, res, next) => {
    console.log('middleware for all admins routes')
    next()
})

app.useAll((req, res, next) => {
    console.log('middleware for all routes')
    next()
})

const start = async () => {
    app.run(3000)
}

start()