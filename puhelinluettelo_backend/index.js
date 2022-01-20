const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

morgan.token('ret', (request) => {
    if (JSON.stringify(request.body).length != 2) {
        return JSON.stringify(request.body)
    }
    return
})

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :ret'))
app.use(cors())

let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: 4,
        name: "Mary Poppendick",
        number: "39-23-6423122"
    }
]

app.get("/api/persons", (request, response) => {
    response.json(persons)
})

app.get("/info", (request, response) => {
    response.send(`<p>Phonebook has info for ${persons.length} people.</p><p>${new Date()}</p>`)
})

app.get("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(p => p.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(p => p.id !== id)
    response.status(204).end()
})

const generateId = () => {
    return (
        Math.floor(Math.random() * 1000000)
    )
}

app.post("/api/persons", (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({error: "Name or number missing"})
    }
    if (persons.find(p => p.name === body.name)) {
        return response.status(400).json({error: `${body.name} is already in the phonebook (name must be unique)`})
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }
    persons = persons.concat(person)
    response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})