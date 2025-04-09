const Customer = require("../models/customersModel");

class CustomerController {
  // Get all customers
  async getAllCustomers(req, res) {
    try {
      const customers = await Customer.getAll();
      res.status(200).json(customers);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving customers!" });
    }
  }

  // Get customer by ID
  async getCustomerById(req, res) {
    try {
      const { id } = req.params;
      const customer = await Customer.getById(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found!" });
      }
      res.status(200).json(customer);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving customer!" });
    }
  }

  // Create a new customer
  async createCustomer(req, res) {
    try {
      console.log("Received data:", req.body); // In dữ liệu nhận được

      const {
        AccountID,
        FullName,
        Email,
        PhoneNumber,
        DateOfBirth,
        Nation,
        Gender,
      } = req.body;

      if (
        !AccountID ||
        !FullName ||
        !Email ||
        !PhoneNumber ||
        !DateOfBirth ||
        !Nation ||
        !Gender
      ) {
        return res.status(400).json({ message: "All fields are required!" });
      }

      const newCustomerId = await Customer.create({
        AccountID,
        FullName,
        Email,
        PhoneNumber,
        DateOfBirth,
        Nation,
        Gender,
      });

      res.status(201).json({
        message: "Customer created successfully!",
        CustomerID: newCustomerId,
      });
    } catch (error) {
      console.error("Error creating customer:", error);
      res
        .status(500)
        .json({ message: "Error creating customer!", error: error.message });
    }
  }

  // Update an existing customer
  async updateCustomer(req, res) {
    try {
      const { id } = req.params;
      const existingCustomer = await Customer.getById(id);
      if (!existingCustomer) {
        return res.status(404).json({ message: "Customer not found!" });
      }

      const updated = await Customer.update(id, req.body);
      if (!updated) {
        return res.status(400).json({ message: "Failed to update customer!" });
      }

      res.status(200).json({ message: "Customer updated successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Error updating customer!" });
    }
  }

  // Delete a customer
  async deleteCustomer(req, res) {
    try {
      const { id } = req.params;
      const existingCustomer = await Customer.getById(id);
      if (!existingCustomer) {
        return res.status(404).json({ message: "Customer not found!" });
      }

      await Customer.remove(id);
      res.status(200).json({ message: "Customer deleted successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting customer!" });
    }
  }
}

module.exports = new CustomerController();
