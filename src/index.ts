import 'dotenv/config'
import express from 'express'
import identifyRouter from './routes/identify.route'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use('/', identifyRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
