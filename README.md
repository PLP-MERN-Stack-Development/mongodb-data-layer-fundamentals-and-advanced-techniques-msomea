# PLP Bookstore MongoDB - Quick Start

This guide shows how to run MongoDB queries and tasks using Node.js.

---

## Prerequisites

- Node.js installed
- MongoDB installed and running locally
- MongoDB Node.js driver installed

## Install the driver:

```bash
npm install mongodb
```
## Start MongoDB:

```bash
mongod
```

## Step 1: Insert Sample Books
* Run this script to populate the database:

```bash
node insert_books.js
```
* Check that books are inserted in the plp_bookstore database.

## Step 2: Run Queries (Tasks 1–5)

* Run all queries and tasks:

```bash
node queries.js
```

## Tasks included:

### Basic Queries

* Find books by genre, year, or author

* Update book price

* Delete a book

### Advanced Queries

* Find books in stock after 2010

* Return only title, author, price

* Sort books by price (asc/desc)

* Pagination (5 books per page)

### Aggregation Pipelines

* Average price by genre

* Author with most books

* Books grouped by publication decade

### Indexing

* Create index on title

* Create compound index on author and published_year

* Use explain() to check performance

## Step 3: Optional

* Run specific tasks individually:
```bash
await runQueries();             // Task 2
await runAdvancedQueries();     // Task 3
await runAggregationQueries();  // Task 4
await runIndexingQueries();     // Task 5
```

## Notes

* The scripts use mongodb://localhost:27017 by default. Change URI if needed.

* Database connections are automatically closed after each task.

