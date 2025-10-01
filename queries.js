// Task 1 - Setup

const { MongoClient } = require("mongodb");

// Connection URI
const uri = "mongodb://localhost:27017";

// Database and collection
const dbName = "plp_bookstore";
const collectionName = "books";

// Function to connect to DB
async function connectDB() {
  const client = new MongoClient(uri);
  await client.connect();
  console.log("Connected to MongoDB");
  return client;
}

// Task 2 - Basic Queries
async function runQueries() {
  const client = await connectDB();

  try {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // 1. Find all books in a specific genre
    console.log("\nBooks in Fiction genre:");
    const fictionBooks = await collection.find({ genre: "Fiction" }).toArray();
    console.log(fictionBooks);

    // 2. Find books published after a certain year
    console.log("\nBooks published after 1950:");
    const recentBooks = await collection
      .find({ published_year: { $gt: 1950 } })
      .toArray();
    console.log(recentBooks);

    // 3. Find books by a specific author
    console.log("\nBooks by George Orwell:");
    const orwellBooks = await collection
      .find({ author: "George Orwell" })
      .toArray();
    console.log(orwellBooks);

    // 4. Update the price of a specific book
    console.log("\nUpdating price of 'The Great Gatsby'...");
    const updateResult = await collection.updateOne(
      { title: "The Great Gatsby" },
      { $set: { price: 15.99 } }
    );
    console.log(
      `Matched: ${updateResult.matchedCount}, Modified: ${updateResult.modifiedCount}`
    );
/*
    // 5. Delete a book by its title (optional)
    console.log("\nDeleting 'Moby Dick'...");
    const deleteResult = await collection.deleteOne({ title: "Moby Dick" });
    console.log(`Deleted: ${deleteResult.deletedCount}`);
*/
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
    console.log("\nConnection closed");
  }
}

// Task 3 - Advanced Queries
async function runAdvancedQueries() {
  const client = await connectDB();

  try {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // 1. Find books that are both in stock and published after 2010
    const recentInStockBooks = await collection
      .find({
        in_stock: true,
        published_year: { $gt: 2010 },
      })
      .toArray();
    console.log("\nBooks in stock and published after 2010:");
    console.log(recentInStockBooks);

    // 2. Use projection to return only title, author, and price
    const projectedBooks = await collection
      .find({}, { projection: { _id: 0, title: 1, author: 1, price: 1 } })
      .toArray();
    console.log("\nBooks with projection (title, author, price):");
    console.log(projectedBooks);

    // 3. Sorting by price ascending
    const sortedAsc = await collection
      .find({}, { projection: { _id: 0, title: 1, price: 1 } })
      .sort({ price: 1 })
      .toArray();
    console.log("\nBooks sorted by price ascending:");
    console.log(sortedAsc);

    // 3b. Sorting by price descending
    const sortedDesc = await collection
      .find({}, { projection: { _id: 0, title: 1, price: 1 } })
      .sort({ price: -1 })
      .toArray();
    console.log("\nBooks sorted by price descending:");
    console.log(sortedDesc);

    // 4. Pagination with limit and skip (5 books per page)
    const page = 1; // change for other pages
    const perPage = 5;
    const paginatedBooks = await collection
      .find({}, { projection: { _id: 0, title: 1, author: 1, price: 1 } })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .toArray();
    console.log(`\nPage ${page} (5 books per page):`);
    console.log(paginatedBooks);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
    console.log("Connection closed");
  }
}

// Task 4 - Aggregation Pipeline
async function runAggregationQueries() {
  const client = await connectDB();

  try {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // 1. Average price of books by genre
    const avgPriceByGenre = await collection
      .aggregate([
        { $group: { _id: "$genre", avgPrice: { $avg: "$price" } } },
        { $sort: { avgPrice: -1 } }, // optional: sort by average price descending
      ])
      .toArray();

    console.log("\nAverage price of books by genre:");
    console.log(avgPriceByGenre);

    // 2. Author with the most books
    const mostBooksAuthor = await collection
      .aggregate([
        { $group: { _id: "$author", bookCount: { $sum: 1 } } },
        { $sort: { bookCount: -1 } },
        { $limit: 1 },
      ])
      .toArray();

    console.log("\nAuthor with the most books:");
    console.log(mostBooksAuthor);

    // 3. Group books by publication decade and count them
    const booksByDecade = await collection
      .aggregate([
        {
          $project: {
            decade: {
              $concat: [
                {
                  $substr: [
                    {
                      $subtract: [
                        "$published_year",
                        { $mod: ["$published_year", 10] },
                      ],
                    },
                    0,
                    4,
                  ],
                },
                "s",
              ],
            },
          },
        },
        { $group: { _id: "$decade", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    console.log("\nBooks grouped by publication decade:");
    console.log(booksByDecade);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
    console.log("Connection closed");
  }
}

// Task 5 - Indexing
async function runIndexingQueries() {
  const client = await connectDB();

  try {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // 1. Create an index on the `title` field
    await collection.createIndex({ title: 1 });
    console.log("\nIndex created on 'title' field");

    // 2. Create a compound index on `author` and `published_year`
    await collection.createIndex({ author: 1, published_year: -1 });
    console.log("Compound index created on 'author' and 'published_year'");

    // 3. Use explain() to demonstrate performance improvement
    console.log("\nQuery without using index explicitly:");
    const noIndexExplain = await collection.find({ title: "Book A" })
      .explain("executionStats");
    console.log(noIndexExplain.executionStats);

    console.log("\nQuery using index (should be more efficient):");
    const withIndexExplain = await collection.find({ title: "Book A" })
      .hint({ title: 1 }) // force MongoDB to use the index
      .explain("executionStats");
    console.log(withIndexExplain.executionStats);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
    console.log("Connection closed");
  }
}


// Run queries in sequence
(async () => {
  await runQueries();              // Task 2
  await runAdvancedQueries();      // Task 3
  await runAggregationQueries();   // Task 4
  await runIndexingQueries();      // Task 5
})();
