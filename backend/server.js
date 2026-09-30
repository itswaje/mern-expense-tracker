const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// ==============================
// Expense Schema
// ==============================

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  category: {
    type: String,
    required: true
  },

  date: {
    type: Date,
    required: true
  }
});


// Expense Model
const Expense = mongoose.model("Expense", expenseSchema);


// Valid categories
const validCategories = [
  "Food",
  "Transport",
  "Education",
  "Entertainment",
  "Shopping",
  "Other"
];


// ==============================
// POST - Add Expense
// ==============================

app.post("/api/expenses", async (req, res) => {
  try {
    const {
      title,
      amount,
      category,
      date
    } = req.body;


    // Validate title
    if (!title || title.trim() === "") {
      return res.status(400).json({
        message: "Expense title cannot be empty"
      });
    }


    // Validate amount
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0"
      });
    }


    // Validate category
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        message: "Invalid category"
      });
    }


    // Validate date
    if (!date) {
      return res.status(400).json({
        message: "Date is required"
      });
    }


    // Create expense
    const expense = new Expense({
      title: title.trim(),
      amount: Number(amount),
      category: category,
      date: date
    });


    // Save to MongoDB
    const savedExpense = await expense.save();


    res.status(201).json(savedExpense);

  } catch (error) {

    res.status(500).json({
      message: "Failed to save expense"
    });

  }
});


// ==============================
// GET - All Expenses
// ==============================

app.get("/api/expenses", async (req, res) => {
  try {

    const { category } = req.query;

    let expenses;


    // Filter by category
    if (category) {

      if (!validCategories.includes(category)) {
        return res.status(400).json({
          message: "Invalid category"
        });
      }

      expenses = await Expense.find({
        category: category
      }).sort({
        date: -1
      });

    } else {

      // Get all expenses
      expenses = await Expense.find().sort({
        date: -1
      });

    }


    res.status(200).json(expenses);

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch expenses"
    });

  }
});


// ==============================
// PUT - Update Expense
// ==============================

app.put("/api/expenses/:id", async (req, res) => {
  try {

    const {
      title,
      amount,
      category,
      date
    } = req.body;


    // Validate title
    if (!title || title.trim() === "") {
      return res.status(400).json({
        message: "Expense title cannot be empty"
      });
    }


    // Validate amount
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0"
      });
    }


    // Validate category
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        message: "Invalid category"
      });
    }


    // Validate date
    if (!date) {
      return res.status(400).json({
        message: "Date is required"
      });
    }


    // Update expense
    const updatedExpense =
      await Expense.findByIdAndUpdate(
        req.params.id,
        {
          title: title.trim(),
          amount: Number(amount),
          category: category,
          date: date
        },
        {
          new: true,
          runValidators: true
        }
      );


    // Expense not found
    if (!updatedExpense) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }


    res.status(200).json(updatedExpense);

  } catch (error) {

    res.status(500).json({
      message: "Failed to update expense"
    });

  }
});


// ==============================
// DELETE - Delete Expense
// ==============================

app.delete("/api/expenses/:id", async (req, res) => {
  try {

    const deletedExpense =
      await Expense.findByIdAndDelete(
        req.params.id
      );


    // Expense not found
    if (!deletedExpense) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }


    res.status(200).json({
      message: "Expense deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to delete expense"
    });

  }
});


// ==============================
// MongoDB Connection
// ==============================

mongoose
  .connect(process.env.MONGO_URI)

  .then(() => {

    console.log("Connected to MongoDB");


    app.listen(
      process.env.PORT || 5000,
      () => {

        console.log(
          `Server running on port ${
            process.env.PORT || 5000
          }`
        );

      }
    );

  })

  .catch((error) => {

    console.error(
      "MongoDB connection failed:",
      error.message
    );

  });