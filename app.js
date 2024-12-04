const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

const app = express();
const port = 3000;
const dataFilePath = path.join(__dirname, 'books.json');

// Middleware
app.use(bodyParser.json());
app.use(express.static('pages'));
app.use(morgan('dev'));

// Helper functions to read and write the JSON file
const readData = () => {
    const jsonData = fs.readFileSync(dataFilePath);
    return JSON.parse(jsonData);
};

const writeData = (data) => {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

// Routes
app.post('/books', (req, res) => {
    const books = readData();
    const newBook = { ...req.body, date: new Date().toISOString() };
    books.push(newBook);
    writeData(books);
    res.status(201).send(newBook);
});

app.get('/books', (req, res) => {
    const books = readData();
    res.status(200).send(books);
});

app.get('/books/:id', (req, res) => {
    const books = readData();
    const book = books.find(b => b.id === req.params.id);
    if (!book) {
        return res.status(404).send();
    }
    res.status(200).send(book);
});

app.patch('/books/:id/status', (req, res) => {
    const books = readData();
    const book = books.find(b => b.id === req.params.id);
    if (!book) {
        return res.status(404).send();
    }
    book.status = req.body.status;
    writeData(books);
    res.status(200).send(book);
});

app.delete('/books/:id', (req, res) => {
    const books = readData();
    const bookIndex = books.findIndex(b => b.id === req.params.id);
    if (bookIndex === -1) {
        return res.status(404).send();
    }
    const deletedBook = books.splice(bookIndex, 1);
    writeData(books);
    res.status(200).send(deletedBook);
});

app.get('/books/filter/:status', (req, res) => {
    const books = readData();
    const filteredBooks = books.filter(b => b.status === req.params.status);
    res.status(200).send(filteredBooks);
});

// Start Server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
