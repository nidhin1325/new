import * as express from 'express'      // importing express
const router = express.Router()         // assigning Router function from express to router variable
const multer = require('multer')        //import multer
const path = require('path')            //import path
const fs = require('fs')                //import fs
const Book = require('../models/book')  
const Author = require('../models/author')
const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']
const upload = multer({                   //using multer function for uploading
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype))
  }
})

// All Books Route
router.get('/', async (req, res) => {                 //get route authors

  let query = Book.find()
  if (req.query.title != null && req.query.title != '') {
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
    query = query.lte('publishDate', req.query.publishedBefore)
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
    query = query.gte('publishDate', req.query.publishedAfter)
  }
  try {
    const books = await query.exec()                     
    res.render('books/index', {
      books: books,                          
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

// New Book Route
router.get('/new', async (req, res) => {         // get new authors route
  renderNewPage(res, new Book())                 
})

// Create Book Route
router.post('/', upload.single('cover'), async (req, res) => {   //upload file in create book route
  // const fileName = req.files != null ? req.files.filename : null
  const book = new Book({                           // create new  book
  title: req.body.title,                             //title
  author: req.body.author,                           //author
  publishDate: new Date(req.body.publishDate),       //publish date
  pageCount: req.body.pageCount,                     //pagecount
  coverImageName: req['file'].filename,              //cover image name
  description: req.body.description                  //description
  })
  try {
  const newBook = await book.save()                 //save book
  // res.redirect(`books/${newBook.id}`)
  res.redirect(`books`)                         //redirect to books route
  } catch {
  if (book.coverImageName != null) {              
  removeBookCover(book.coverImageName)
  }
  renderNewPage(res, book, true)
  }
  })
  
  function removeBookCover(fileName) {                  
    fs.unlink(path.join(uploadPath, fileName), err => {
    if (err) console.error(err)
    })
    }
    

// Show Book Route
router.get('/:id', async (req, res) => {           
  try {
    const book = await Book.findById(req.params.id).populate('author').exec()
    res.render('books/show', { book: book })
  } catch {
    res.redirect('/')
  }
})

// Edit Book Route
router.get('/:id/edit', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    renderEditPage(res, book)
  } catch {
    res.redirect('/')
  }
})

// Update Book Route
router.put('/:id', async (req, res) => {
  let book

  try {
    book = await Book.findById(req.params.id)
    book.title = req.body.title
    book.author = req.body.author
    book.publishDate = new Date(req.body.publishDate)
    book.pageCount = req.body.pageCount
    book.description = req.body.description
    if (req.body.cover != null && req.body.cover !== '') {
      saveCover(book, req.body.cover)
    }
    await book.save()
    res.redirect(`/books/${book.id}`)
  } catch {
    if (book != null) {
      renderEditPage(res, book, true)
    } else {
      res.redirect('/')
    }
  }
})

// Delete Book Page
router.delete('/:id', async (req, res) => {
  let book
  try {
    book = await Book.findById(req.params.id)
    await book.remove()
    res.redirect('/books')
  } catch {
    if (book != null) {
      res.render('books/show', {
        book: book,
        errorMessage: 'Could not remove book'
      })
    } else {
      res.redirect('/')
    }
  }
}) 

async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, 'new', hasError)
}

async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, 'edit', hasError)
}

async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({})
    const params = {
      authors: authors,
      book: book
    }
    // if (hasError) {
    //   if (form === 'edit') {
    //     params.errorMessage = 'Error Updating Book'
    //   } else {
    //     params.errorMessage = 'Error Creating Book'
    //   }
    // }
    res.render(`books/${form}`, params)
  } catch {
    res.redirect('/books')
  }
}

function saveCover(book, coverEncoded) {
  if (coverEncoded == null) 

  return
  const cover = JSON.parse(coverEncoded)
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage  =  Buffer.from(cover.data, 'base64')
    book.coverImageType = cover.type
  }
}

module.exports = router
