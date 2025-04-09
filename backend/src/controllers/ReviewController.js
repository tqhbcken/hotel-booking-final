const Review = require("../models/reviewsModel");

class ReviewController {
  // Lấy tất cả đánh giá
  async getAllReviews(req, res) {
    try {
      const reviews = await Review.getAll();
      res.status(200).json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving reviews!" });
    }
  }

  // Lấy đánh giá theo ID
  async getReviewById(req, res) {
    try {
      const { id } = req.params;
      const review = await Review.getById(id);
      if (!review) {
        return res.status(404).json({ message: "Review not found!" });
      }
      res.status(200).json(review);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving review!" });
    }
  }

  // Lấy đánh giá theo RoomID
  async getReviewsByRoomId(req, res) {
    try {
      const { roomId } = req.params;
      const reviews = await Review.getByRoomId(roomId);
      res.status(200).json(reviews);
    } catch (error) {
      console.error("Error retrieving room reviews:", error);
      res.status(500).json({ message: "Error retrieving room reviews!" });
    }
  }

  // Tạo mới đánh giá
  async createReview(req, res) {
    try {
      const { AccountID, RoomID, Rating, Comment } = req.body;

      if (!AccountID || !RoomID || !Rating || Rating < 1 || Rating > 5) {
        return res.status(400).json({ message: "Invalid input data!" });
      }

      const newReviewId = await Review.create({
        AccountID,
        RoomID,
        Rating,
        Comment,
      });

      res.status(201).json({
        message: "Review created successfully!",
        ReviewID: newReviewId,
      });
    } catch (error) {
      res.status(500).json({ message: "Error creating review!" });
    }
  }

  // Cập nhật đánh giá
  async updateReview(req, res) {
    try {
      const { id } = req.params;
      const { Rating, Comment } = req.body;

      const existingReview = await Review.getById(id);
      if (!existingReview) {
        return res.status(404).json({ message: "Review not found!" });
      }

      await Review.update(id, { Rating, Comment });
      res.status(200).json({ message: "Review updated successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Error updating review!" });
    }
  }

  // Xóa đánh giá
  async deleteReview(req, res) {
    try {
      const { id } = req.params;

      const existingReview = await Review.getById(id);
      if (!existingReview) {
        return res.status(404).json({ message: "Review not found!" });
      }

      await Review.remove(id);
      res.status(200).json({ message: "Review deleted successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting review!" });
    }
  }
}

module.exports = new ReviewController();
