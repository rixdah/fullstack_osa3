require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

morgan.token('ret', (request) => {
    if (request.method === 'POST') {
        return JSON.stringify(request.body)
    }
    return
})

app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :ret'))
app.use(cors())

app.get("/api/persons", (request, response, next) => {
    Person.find({}).then(result => {
        response.json(result)
    })
    .catch(error => next(error))
})

app.get("/info", (request, response, next) => {
    Person.find({}).then(result => {
        response.send(`<p>Phonebook has info for ${result.length} people.</p><p>${new Date()}</p>`)
    })
    .catch(error => next(error))

})

app.get("/api/persons/:id", (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }

    })
    .catch(error => next(error))
})

app.delete("/api/persons/:id", (request, response, next) => {
    Person.findByIdAndRemove(request.params.id).then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))
})

app.post("/api/persons", (request, response, next) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({error: "Name or number missing"})
    }
    /*Person.find({name: body.name}).then(result => {
        if (result.length !== 0) {
            return response.status(400).json({error: `${body.name} is already in the phonebook (name must be unique)`})
        }
    })
    .catch(error => next(error)) */

    const person = new Person ({
        name: body.name,
        number: body.number
    })

    person.save().then(newPerson => {
        response.json(newPerson.toJSON())
    })
    .catch(error => next(error))
})

app.put("/api/persons/:id", (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, {new: true})
    .then(updatedPerson => {
        response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'Unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.log(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({error: 'Malformatted id'})
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({error: error.message})
    }
    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})