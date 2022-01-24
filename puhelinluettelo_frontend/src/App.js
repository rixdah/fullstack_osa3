import React, { useState, useEffect } from 'react'
import personService from './services/persons'

const Persons = ({names, filter, deletePerson}) => {
  const filteredNames = names.filter(person => person.name.toLowerCase().includes(filter.toLowerCase()))
  return (
    <div>
      {filteredNames.map(person =>
      <Part key={person.name} name={person.name} number={person.number} id={person.id} deletePerson={deletePerson} />)}
    </div>
  )
}

const Part = ({name, number, id, deletePerson}) => {

  const handleClick = () => {
    if (window.confirm(`Delete ${name}?`)) {
      deletePerson(id, name)
    }
  }

  return (
    <div>
      {name} {number} <button onClick={handleClick}>Delete</button>
    </div>
  )
}

const Notification = ({message, notificationSeverity}) => {
  if (message === null) {
    return null
  }
  const notificationStyle = {
    color: notificationSeverity,
    background: 'lightgrey',
    fontSize: 20,
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10
  }
  return (
    <div style={notificationStyle}>
      {message}
    </div>
  )
}

const Filter = ({newFilter, handleFormFilterChange}) =>
  <div>Filter shown with <input value={newFilter} onChange={handleFormFilterChange} /></div>

const PersonForm = ({addPerson, newName, newNumber, handleFormNameChange, handleFormNumberChange}) => (
  <form onSubmit={addPerson}>
    <div>Name: <input value={newName} onChange={handleFormNameChange} /></div>
    <div>Number: <input value={newNumber} onChange={handleFormNumberChange} /></div>
    <div><button type="submit">Add</button></div>
  </form>
)

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [newFilter, setFilter] = useState('')
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [notificationSeverity, setNotificationSeverity] = useState('green')

  useEffect(() => {
    personService.getAll()
    .then(response => {
      setPersons(response.data)
    })
  }, [])

  const handleFormNameChange = (event) => setNewName(event.target.value)
  const handleFormNumberChange = (event) => setNewNumber(event.target.value)
  const handleFormFilterChange = (event) => setFilter(event.target.value)

  const addPerson = (event) => {
    event.preventDefault()
    if (!persons.some(person => person.name === newName)) {
      const personObject = {
        name: newName,
        number: newNumber,
      }
      personService.addPerson(personObject)
      .then(response => {
        personService.getAll()
        .then(response => {
          setPersons(response.data)
        })
        setNotificationSeverity('green')
        setNotificationMessage(`Added ${newName}`)
        setTimeout(() => {
          setNotificationMessage(null)
        }, 3000)
      })
      .catch(error => {
        setNotificationSeverity('red')
        setNotificationMessage(error.response.data.error)
        setTimeout(() => {
          setNotificationMessage(null)
        }, 10000)
      })
    } else {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        const res = persons.filter(person => person.name === newName)
        const personObject = {
          name: newName,
          number: newNumber,
        }
        personService.updatePerson(res[0].id, personObject)
        .then(response => {
          setPersons(persons.map(person => person.id !== res[0].id ? person : response.data))
          setNotificationSeverity('green')
          setNotificationMessage(`Number of ${newName} changed successfully`)
          setTimeout(() => {
            setNotificationMessage(null)
        }, 3000)
        })
        .catch(error => {
          setNotificationSeverity('red')
          setNotificationMessage(`Information of ${newName} has already been removed from server`)
          setTimeout(() => {
            setNotificationMessage(null)
          }, 4000)
        })
      }
    }
    setNewName('')
    setNewNumber('')
  }

  const deletePerson = (id, name) => {
    personService.deletePerson(id)
    .then(response => {
      setPersons(persons.filter(person => person.id !== id))
      setNotificationMessage(`${name} removed successfully`)
      setTimeout(() => {
        setNotificationMessage(null)
      }, 3000)
    })
    
  }
  return (
    <div>
      <h2>Phonebook</h2>
      <Filter newFilter={newFilter} handleFormFilterChange={handleFormFilterChange} />
      <div><Notification message={notificationMessage} notificationSeverity={notificationSeverity} /></div>
      <h2>Add a new</h2>
      <PersonForm addPerson={addPerson} newName={newName} newNumber={newNumber}
      handleFormNameChange={handleFormNameChange} handleFormNumberChange={handleFormNumberChange} />

      <h2>Numbers</h2>
      <Persons names={persons} filter={newFilter} deletePerson={deletePerson} />
    </div>
  )
}

export default App