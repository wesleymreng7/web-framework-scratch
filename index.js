const App = require('./src/app')

const app = App()


app.get('/test/test2', function test() { }, function test2() { })
app.post('/test', (req, res) => console.log('test'))
app.patch('/test', (req, res) => console.log('test'))
app.put('/test', (req, res) => console.log('test'))
app.del('/test', (req, res) => console.log('test'))



const start = async () => {
    app.run(3000)
}

start()