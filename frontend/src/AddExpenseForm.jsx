import { useState, useEffect } from "react";
import "./AddExpenseForm.css";

// Backend API URL
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function AddExpenseForm() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [expenses, setExpenses] = useState([]);
  const [filterCategory, setFilterCategory] = useState("All");

  // Edit state
  const [editingId, setEditingId] = useState(null);

  // ==============================
  // Get Expenses
  // ==============================

  const fetchExpenses = async () => {
    try {
      let url = `${API_URL}/api/expenses`;

      if (filterCategory !== "All") {
        url += `?category=${filterCategory}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to fetch expenses");
        return;
      }

      setExpenses(data);

    } catch (error) {
      setError("Could not connect to the server");
    }
  };

  // Load expenses when page loads
  // and whenever category filter changes
  useEffect(() => {
    fetchExpenses();
  }, [filterCategory]);

  // ==============================
  // Add / Update Expense
  // ==============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate title
    if (title.trim() === "") {
      setError("Expense name cannot be empty");
      setSuccess("");
      return;
    }

    // Validate amount
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      setSuccess("");
      return;
    }

    // Validate date
    if (!date) {
      setError("Please select a date");
      setSuccess("");
      return;
    }

    setError("");
    setSuccess("");

    try {
      let url = `${API_URL}/api/expenses`;
      let method = "POST";

      // If editing
      if (editingId) {
        url = `${API_URL}/api/expenses/${editingId}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method: method,

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          title: title,
          amount: Number(amount),
          category: category,
          date: date
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to save expense"
        );
        return;
      }

      // ==============================
      // Update existing expense
      // ==============================

      if (editingId) {
        setExpenses((previousExpenses) =>
          previousExpenses.map((expense) =>
            expense._id === editingId
              ? data
              : expense
          )
        );

        setSuccess(
          "Expense updated successfully!"
        );

        setEditingId(null);

      }

      // ==============================
      // Add new expense
      // ==============================

      else {
        setExpenses((previousExpenses) => [
          data,
          ...previousExpenses
        ]);

        setSuccess(
          "Expense added successfully!"
        );
      }

      // Clear form
      setTitle("");
      setAmount("");
      setCategory("Food");
      setDate("");

    } catch (error) {
      setError("Could not connect to the server");
    }
  };

  // ==============================
  // Edit Expense
  // ==============================

  const handleEdit = (expense) => {

    setEditingId(expense._id);

    setTitle(expense.title);

    setAmount(expense.amount);

    setCategory(expense.category);

    setDate(
      new Date(expense.date)
        .toISOString()
        .split("T")[0]
    );

    setError("");

    setSuccess("");

    // Scroll to form
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // ==============================
  // Cancel Edit
  // ==============================

  const handleCancelEdit = () => {

    setEditingId(null);

    setTitle("");
    setAmount("");
    setCategory("Food");
    setDate("");

    setError("");
    setSuccess("");
  };

  // ==============================
  // Delete Expense
  // ==============================

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmDelete) {
      return;
    }

    try {

      const response = await fetch(
        `${API_URL}/api/expenses/${id}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to delete expense"
        );
        return;
      }

      // Remove expense from screen
      setExpenses((previousExpenses) =>
        previousExpenses.filter(
          (expense) => expense._id !== id
        )
      );

      setSuccess(
        "Expense deleted successfully!"
      );

      setError("");

    } catch (error) {

      setError(
        "Could not connect to the server"
      );

    }
  };

  // ==============================
  // Calculate Total
  // ==============================

  const totalExpenses = expenses.reduce(
    (total, expense) =>
      total + Number(expense.amount),
    0
  );

  // ==============================
  // JSX
  // ==============================

  return (
    <div className="page">

      <div className="container">

        {/* ==========================
            Header
        =========================== */}

        <header className="header">

          <div>

            <h1>
              💰 Expense Tracker
            </h1>

            <p>
              Track your spending and manage
              your expenses easily.
            </p>

          </div>

          <div className="balance-card">

            <span>
              Total Expenses
            </span>

            <strong>
              ₹{totalExpenses.toFixed(2)}
            </strong>

          </div>

        </header>


        {/* ==========================
            Main Content
        =========================== */}

        <main className="main-content">


          {/* ==========================
              Add / Edit Expense
          =========================== */}

          <section className="card">

            <div className="card-header">

              <div>

                <h2>
                  {editingId
                    ? "Edit Expense"
                    : "Add Expense"}
                </h2>

                <p>
                  {editingId
                    ? "Update the expense details below."
                    : "Enter the details of your expense below."}
                </p>

              </div>

            </div>


            <form onSubmit={handleSubmit}>

              {/* Expense Name */}

              <div className="form-group">

                <label>
                  Expense Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Lunch, Bus ticket, Books"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                />

              </div>


              {/* Amount / Category / Date */}

              <div className="form-row">


                {/* Amount */}

                <div className="form-group">

                  <label>
                    Amount
                  </label>

                  <div className="amount-input">

                    <span>
                      ₹
                    </span>

                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={amount}
                      onChange={(e) =>
                        setAmount(e.target.value)
                      }
                    />

                  </div>

                </div>


                {/* Category */}

                <div className="form-group">

                  <label>
                    Category
                  </label>

                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value)
                    }
                  >

                    <option value="Food">
                      🍔 Food
                    </option>

                    <option value="Transport">
                      🚌 Transport
                    </option>

                    <option value="Education">
                      📚 Education
                    </option>

                    <option value="Entertainment">
                      🎬 Entertainment
                    </option>

                    <option value="Shopping">
                      🛍️ Shopping
                    </option>

                    <option value="Other">
                      📦 Other
                    </option>

                  </select>

                </div>


                {/* Date */}

                <div className="form-group">

                  <label>
                    Date
                  </label>

                  <input
                    type="date"
                    value={date}
                    onChange={(e) =>
                      setDate(e.target.value)
                    }
                  />

                </div>

              </div>


              {/* Error */}

              {error && (

                <div className="message error">
                  ❌ {error}
                </div>

              )}


              {/* Success */}

              {success && (

                <div className="message success">
                  ✅ {success}
                </div>

              )}


              {/* Buttons */}

              <div className="form-buttons">

                <button
                  type="submit"
                  className="add-button"
                >

                  {editingId
                    ? "✓ Update Expense"
                    : "+ Add Expense"}

                </button>


                {editingId && (

                  <button
                    type="button"
                    className="cancel-button"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>

                )}

              </div>

            </form>

          </section>


          {/* ==========================
              Recent Expenses
          =========================== */}

          <section className="card">

            <div className="card-header">

              <div>

                <h2>
                  Recent Expenses
                </h2>

                <p>
                  Your latest spending activity
                </p>

              </div>


              {/* Filter */}

              <select
                className="filter-select"
                value={filterCategory}
                onChange={(e) =>
                  setFilterCategory(e.target.value)
                }
              >

                <option value="All">
                  All Categories
                </option>

                <option value="Food">
                  🍔 Food
                </option>

                <option value="Transport">
                  🚌 Transport
                </option>

                <option value="Education">
                  📚 Education
                </option>

                <option value="Entertainment">
                  🎬 Entertainment
                </option>

                <option value="Shopping">
                  🛍️ Shopping
                </option>

                <option value="Other">
                  📦 Other
                </option>

              </select>

            </div>


            {/* Expense List */}

            <div className="expense-list">

              {expenses.length === 0 ? (

                <div className="empty-state">

                  <div className="empty-icon">
                    🧾
                  </div>

                  <h3>
                    No expenses found
                  </h3>

                  <p>
                    Add an expense or change
                    the category filter.
                  </p>

                </div>

              ) : (

                expenses.map((expense) => (

                  <div
                    className="expense-item"
                    key={expense._id}
                  >

                    {/* Expense information */}

                    <div>

                      <h3>
                        {expense.title}
                      </h3>

                      <p>
                        {expense.category}
                        {" • "}
                        {new Date(
                          expense.date
                        ).toLocaleDateString()}
                      </p>

                    </div>


                    {/* Amount + Actions */}

                    <div className="expense-actions">

                      <strong>
                        ₹
                        {Number(
                          expense.amount
                        ).toFixed(2)}
                      </strong>


                      <button
                        type="button"
                        className="edit-button"
                        onClick={() =>
                          handleEdit(expense)
                        }
                      >
                        Edit
                      </button>


                      <button
                        type="button"
                        className="delete-button"
                        onClick={() =>
                          handleDelete(
                            expense._id
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                ))

              )}

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default AddExpenseForm;