const Payment = require("../models/paymentsModel");

class PaymentController {
  // Lấy tất cả thanh toán
  async getAllPayments(req, res) {
    try {
      const payments = await Payment.getAll();
      res.status(200).json(payments);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving payments!" });
    }
  }

  // Lấy thanh toán theo ID
  async getPaymentById(req, res) {
    try {
      const { id } = req.params;
      const payment = await Payment.getById(id);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found!" });
      }
      res.status(200).json(payment);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving payment!" });
    }
  }

  // Tạo mới thanh toán
  async createPayment(req, res) {
    try {
      const { BookingID, PaymentMethod, PaymentStatus, Amount } = req.body;

      if (!BookingID || !PaymentMethod || !Amount) {
        return res
          .status(400)
          .json({
            message: "BookingID, PaymentMethod, and Amount are required!",
          });
      }

      const newPaymentId = await Payment.create({
        BookingID,
        PaymentMethod,
        PaymentStatus,
        Amount,
      });

      res.status(201).json({
        message: "Payment created successfully!",
        PaymentID: newPaymentId,
      });
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Error creating payment!" });
    }
  }

  // Cập nhật thanh toán
  async updatePayment(req, res) {
    try {
      const { id } = req.params;
      const { BookingID, PaymentMethod, PaymentStatus, Amount } = req.body;

      const existingPayment = await Payment.getById(id);
      if (!existingPayment) {
        return res.status(404).json({ message: "Payment not found!" });
      }

      await Payment.update(id, {
        BookingID,
        PaymentMethod,
        PaymentStatus,
        Amount,
      });
      res.status(200).json({ message: "Payment updated successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Error updating payment!" });
    }
  }

  // Xóa thanh toán
  async deletePayment(req, res) {
    try {
      const { id } = req.params;

      const existingPayment = await Payment.getById(id);
      if (!existingPayment) {
        return res.status(404).json({ message: "Payment not found!" });
      }

      await Payment.remove(id);
      res.status(200).json({ message: "Payment deleted successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting payment!" });
    }
  }
}

module.exports = new PaymentController();
