/* eslint no-shadow: off, no-underscore-dangle: off */
const express = require('express')
const upload = require('./multerConfig')
const Note = require('../model/note')
const Photo = require('../model/photo')
const url = require('url')
const _ = require('lodash')

const router = express.Router()

/**
 * @param {*} req
 * @param {*} res
 * @returns {note | err}
 */
const saveNoteText = (req, res) => {
  const note = req.body.note
  if (note._id) {
    Note.findById({ _id: note._id }, (err, existingNote) => {
      if (err) {
        res.send({ err })
      } else {
        _.extend(existingNote, note)
        existingNote.save((err) => {
          if (err) {
            res.send({
              err: new Error('update note\'s photo reference failed')
            })
          } else {
            res.send({ note: existingNote })
          }
        })
      }
    })
  } else {
    const newNote = new Note(note)
    // console.log('newNote: ')
    // console.log(newNote)
    newNote.save((err, note) => {
      if (err) {
        res.send({
          err: new Error('update note\'s photo reference failed')
        })
      } else {
        res.send({ note })
      }
    })
  }
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @requires noteId
 * @returns {savedPhoto | err}
 */
const savePhoto = (req, res) => {
  const noteId = req.body.noteId
  if (!req.file) {
    res.send({
      err: new Error('photo not saved!')
    })
    return
  }
  const filepath = url.resolve('/static/', req.file.filename)
  const newPhoto = new Photo({
    url: filepath,
    naturalHeight: req.body.naturalHeight,
    naturalWidth: req.body.naturalWidth,
  })

  newPhoto.save((err, savedPhoto) => {
    if (err) {
      res.send({ err })
      return
    }
    if (noteId) {
      Note.findById({ _id: noteId }, (err, note) => {
        if (err) {
          res.send({ err })
        } else {
          note.photos.push(savedPhoto._id)
          note.save((err) => {
            if (err) {
              res.send({
                err: new Error('update note\'s photo reference failed')
              })
            } else {
              res.send({ savedPhoto })
            }
          })
        }
      })
    }
  })
}

/**
 * @param {*} req
 * @param {*} res
 * @returns {notes | err}
 */
const fetchNotes = (req, res) => {
  const userId = req.body.userId
  if (userId) {
    // to do
  } else {
    Note.fetch((err, notes) => {
      if (err) {
        res.send({ err })
      } else {
        res.send({ notes })
      }
    })
  }
}

/**
 * @param {*} req
 * @param {*} res
 * @returns {note | err}
 */
const fetchNoteById = (req, res) => {
  Note.fetchById({ noteId: req.body.noteId }, (err, note) => {
    if (err) {
      res.send({ err })
    } else {
      res.send({ note })
    }
  })
}

router.post('/saveNoteText', saveNoteText)
router.post('/fetchNotes', fetchNotes)
router.post('/fetchNoteById', fetchNoteById)
router.post('/savePhoto', upload.single('newPhoto'), savePhoto)

module.exports = router

// console.log(req.headers)
// const buffers = []
// req.on('data', (chunk) => {
//   buffers.push(chunk)
// })
// .on('end', () => {
//   const buffer = Buffer.concat(buffers)
//   console.log(buffer.toString('utf-8'))
// })
