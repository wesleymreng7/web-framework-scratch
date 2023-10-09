const BodyParser = async (req, res, next) => {
  let body = []

  for await (const chunk of req) {
    body.push(chunk)
  }

  body = Buffer.concat(body).toString()
  if (req.headers['content-type'] === 'application/json') {
    req.body = JSON.parse(body)
  }
  else if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
    let params = new URLSearchParams(body)
    let entries = params.entries();
    req.body = Object.fromEntries(entries)
  }

  next()
}

module.exports = BodyParser