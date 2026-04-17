// Import the Express framework so we can create routes
const express = require('express');

// Import Axios so Tasks 10-13 can call existing endpoints asynchronously
const axios = require('axios');

// Import the books database object
let books = require("./booksdb.js");

// Import helper function to check whether a username already exists
let isValid = require("./auth_users.js").isValid;

// Import shared users array so new registrations are stored correctly
let users = require("./auth_users.js").users;

// Create a router object for all public/general user routes
const public_users = express.Router();


// ---------------------------
// Task 6: Register a new user
// ---------------------------
// This route allows a new user to register by sending username and password
// in the request body.
//
// Example request body:
// {
//   "username": "mike",
//   "password": "pass123"
// }
public_users.post("/register", (req, res) => {
  // Extract username and password from the incoming request body
  const username = req.body.username;
  const password = req.body.password;

  // Validate that both username and password were provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check whether the username is already taken
  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }

  // Add the new user to the shared users array
  users.push({ username: username, password: password });

  // Return success response
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});


// ---------------------------------------------
// Task 1: Get the full list of books in the shop
// ---------------------------------------------
// This route returns the entire books object.
// JSON.stringify is used to format the response neatly.
public_users.get('/', function (req, res) {
  return res.send(JSON.stringify(books, null, 4));
});


// --------------------------------------------------------------------
// Task 10: Get the full list of books using async-await and Axios
// --------------------------------------------------------------------
// This route demonstrates async retrieval by calling the existing
// Task 1 endpoint through Axios instead of directly returning books.
public_users.get('/async', async function (req, res) {
  try {
    // Call the existing root endpoint to retrieve all books
    const response = await axios.get('http://localhost:5000/');

    // Forward the successful response back to the client
    return res.status(200).send(response.data);
  } catch (error) {
    // If the called route returned an HTTP error (for example 404),
    // pass that error response through
    if (error.response) {
      return res.status(error.response.status).send(error.response.data);
    }

    // Otherwise return a generic server error
    return res.status(500).json({ message: "Error fetching books" });
  }
});


// -----------------------------------------
// Task 2: Get book details based on ISBN
// -----------------------------------------
// This route extracts the ISBN from the URL parameters and uses it
// as a key to look up the matching book in the books object.
public_users.get('/isbn/:isbn', function (req, res) {
  // Extract ISBN from request parameters
  const isbn = req.params.isbn;

  // Check whether a book with this ISBN exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Return the matching book as formatted JSON
  return res.send(JSON.stringify(books[isbn], null, 4));
});


// ----------------------------------------------------------------
// Task 11: Get book details based on ISBN using Axios + async-await
// ----------------------------------------------------------------
// This route calls the Task 2 endpoint through Axios instead of
// reading from the books object directly.
public_users.get('/async/isbn/:isbn', async function (req, res) {
  try {
    // Extract ISBN from the request URL
    const isbn = req.params.isbn;

    // Call the existing ISBN route
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);

    // Return the response from the internal API call
    return res.status(200).send(response.data);
  } catch (error) {
    // Preserve known HTTP errors from the called route
    if (error.response) {
      return res.status(error.response.status).send(error.response.data);
    }

    // Fallback for unexpected failures
    return res.status(500).json({ message: "Error fetching book by ISBN" });
  }
});


// -------------------------------------------
// Task 3: Get book details based on author
// -------------------------------------------
// This route finds all books whose author exactly matches the
// author name provided in the URL parameter.
public_users.get('/author/:author', function (req, res) {
  // Extract author from URL parameters
  const author = req.params.author;

  // Initialize an empty object to store matching books
  let filteredBooks = {};

  // Loop through all book keys in the books object
  Object.keys(books).forEach((key) => {
    // If the author matches exactly, store the book in filteredBooks
    if (books[key].author === author) {
      filteredBooks[key] = books[key];
    }
  });

  // If no books matched the given author, return a not found message
  if (Object.keys(filteredBooks).length === 0) {
    return res.status(404).json({ message: "No books found for this author" });
  }

  // Return matching books as formatted JSON
  return res.send(JSON.stringify(filteredBooks, null, 4));
});


// ------------------------------------------------------------------
// Task 12: Get book details based on author using Axios + async-await
// ------------------------------------------------------------------
// This route demonstrates asynchronous retrieval by calling the
// existing author endpoint through Axios.
public_users.get('/async/author/:author', async function (req, res) {
  try {
    // Extract author from URL parameters
    const author = req.params.author;

    // Call the existing author route
    const response = await axios.get(`http://localhost:5000/author/${author}`);

    // Return the response from the internal API call
    return res.status(200).send(response.data);
  } catch (error) {
    // Preserve route-specific HTTP error responses
    if (error.response) {
      return res.status(error.response.status).send(error.response.data);
    }

    // Fallback for unexpected errors
    return res.status(500).json({ message: "Error fetching books by author" });
  }
});


// ------------------------------------------
// Task 4: Get all books based on title
// ------------------------------------------
// This route finds all books whose title exactly matches the title
// provided in the URL parameter.
public_users.get('/title/:title', function (req, res) {
  // Extract title from request parameters
  const title = req.params.title;

  // Create an empty object to hold matching books
  let filteredBooks = {};

  // Loop through every book and compare titles
  Object.keys(books).forEach((key) => {
    if (books[key].title === title) {
      filteredBooks[key] = books[key];
    }
  });

  // If there are no matches, return an informative message
  if (Object.keys(filteredBooks).length === 0) {
    return res.status(404).json({ message: "No books found for this title" });
  }

  // Return matching books as formatted JSON
  return res.send(JSON.stringify(filteredBooks, null, 4));
});


// -----------------------------------------------------------------
// Task 13: Get book details based on title using Axios + async-await
// -----------------------------------------------------------------
// This route calls the existing title-based route using Axios.
public_users.get('/async/title/:title', async function (req, res) {
  try {
    // Extract title from request parameters
    const title = req.params.title;

    // Call the existing title route
    const response = await axios.get(`http://localhost:5000/title/${title}`);

    // Return the called route's response
    return res.status(200).send(response.data);
  } catch (error) {
    // Preserve errors from the underlying route
    if (error.response) {
      return res.status(error.response.status).send(error.response.data);
    }

    // Generic fallback if the failure is unexpected
    return res.status(500).json({ message: "Error fetching books by title" });
  }
});


// --------------------------
// Task 5: Get book reviews
// --------------------------
// This route returns the reviews object for the book with the
// requested ISBN.
public_users.get('/review/:isbn', function (req, res) {
  // Extract ISBN from request parameters
  const isbn = req.params.isbn;

  // Verify the book exists before trying to read its reviews
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // If the reviews object is empty, return an informational message
  if (Object.keys(books[isbn].reviews).length === 0) {
    return res.status(200).json({ message: "No reviews found for this book." });
  }

  // Return the reviews object in formatted JSON form
  return res.send(JSON.stringify(books[isbn].reviews, null, 4));
});


// Export the router so it can be used in index.js
module.exports.general = public_users;