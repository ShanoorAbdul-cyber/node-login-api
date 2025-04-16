const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const OrdersList = require("../models/PlaceOrder");

// Place Order
router.post("/placeOrder", async (req, res) => {
  const { selectedItems, tableId, tableName } = req.body;

  try {
    if (!selectedItems || !Array.isArray(selectedItems) || selectedItems.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }

    const totalAmount = selectedItems.reduce((acc, item) => acc + Number(item.total), 0);
    const orderId = uuidv4(); // currently unused

    // Save the order in MongoDB with status as 'Booked'
    const newOrder = new OrdersList({
      tableId,
      tableName,
      items: selectedItems.map(item => ({
        _id: item._id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        total: Number(item.total)
      })),
      totalAmount,
      status: 'Booked'
    });

    const savedOrder = await newOrder.save();

    const summary = selectedItems.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: Number(item.price),
      total: Number(item.total)
    }));

    return res.status(201).json({
      message: "Order placed successfully",
      orderId: savedOrder._id,
      table: {
        tableId,
        tableName
      },
      totalPrice: totalAmount.toFixed(2),
      summary
    });
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ message: "Error placing order", error: err.message });
  }
});

  // Update Order
  router.put('/updateOrder/:id', async (req, res) => {
    try {
      const { selectedItems, tableId, tableName } = req.body;
  
      if (!selectedItems || !Array.isArray(selectedItems)) {
        return res.status(400).json({
          message: "Invalid or missing selectedItems in request body"
        });
      }
  
      let totalAmount = 0;
  
      const updatedItems = selectedItems.map(item => {
        totalAmount += Number(item.total);
        return {
          _id: item._id,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
          total: Number(item.total)
        };
      });
  
      const updatedOrder = await OrdersList.findByIdAndUpdate(
        req.params.id,
        {
          tableId,
          tableName,
          items: updatedItems,
          totalAmount: Number(totalAmount.toFixed(2)),
          status: 'Booked'  // Ensure status remains 'Booked' when updating
        },
        { new: true }
      );
  
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      res.status(200).json({
        message: 'Order updated successfully',
        orderId: updatedOrder._id,
        table: {
          tableId: updatedOrder.tableId,
          tableName: updatedOrder.tableName
        },
        summary: updatedOrder.items,
        totalPrice: updatedOrder.totalAmount.toFixed(2)
      });
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({
        message: "Error updating order",
        error: error.message
      });
    }
  });
  

// Get Existing Orders and their Status
router.get('/getOrders', async (req, res) => {
    try {
      const { tableId } = req.query;
      let query = {};
      if (tableId) {
        query = { tableId };
      }
  
      const orders = await OrdersList.find(query);
  
      // Even if empty, return 200 with empty array
      const ordersWithStatus = orders.map(order => ({
        orderId: order._id,
        tableId: order.tableId,
        tableName: order.tableName,
        status: order.status || 'Booked',
        totalAmount: order.totalAmount.toFixed(2),
        items: order.items
      }));
  
      return res.status(200).json({ orders: ordersWithStatus }); // Empty array is okay
    } catch (err) {
      console.error("Error fetching orders:", err);
      res.status(500).json({ message: "Error fetching orders", error: err.message });
    }
  });

router.delete('/deleteOrder/:id', async (req, res) => {
try {
    await OrdersList.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Order deleted successfully" });
} catch (err) {
    res.status(500).json({ message: "Error deleting order" });
}
});
  
  
  
  

module.exports = router;
