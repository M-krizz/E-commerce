import unittest
from orders.order_service import create_order, update_order_status, get_order_history, get_order_by_id

class OrderServiceTestCase(unittest.TestCase):
    def test_create_order(self):
        order = create_order(1, "encrypted_data")
        self.assertIsNotNone(order)

    def test_update_order_status(self):
        order = create_order(1, "encrypted_data")
        updated = update_order_status(order.order_id, "COMPLETED")
        self.assertIsNotNone(updated)
        self.assertEqual(updated.order_status, "COMPLETED")

    def test_get_order_history(self):
        orders = get_order_history(1)
        self.assertIsInstance(orders, list)

    def test_get_order_by_id(self):
        order = create_order(1, "encrypted_data")
        fetched = get_order_by_id(order.order_id)
        self.assertEqual(order.order_id, fetched.order_id)

if __name__ == "__main__":
    unittest.main()
