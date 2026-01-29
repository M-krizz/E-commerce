import unittest
from products.product_service import create_product, update_product, delete_product, get_product_by_id, get_all_products

class ProductServiceTestCase(unittest.TestCase):
    def test_create_product(self):
        product = create_product(1, "Test Product", "Description", 10.0, 5)
        self.assertIsNotNone(product)

    def test_update_product(self):
        product = create_product(1, "Test Product", "Description", 10.0, 5)
        updated = update_product(product.product_id, {"name": "Updated Product"})
        self.assertIsNotNone(updated)
        self.assertEqual(updated.product_name, "Updated Product")

    def test_delete_product(self):
        product = create_product(1, "Test Product", "Description", 10.0, 5)
        deleted = delete_product(product.product_id)
        self.assertTrue(deleted)

    def test_get_product_by_id(self):
        product = create_product(1, "Test Product", "Description", 10.0, 5)
        fetched = get_product_by_id(product.product_id)
        self.assertEqual(product.product_id, fetched.product_id)

    def test_get_all_products(self):
        products = get_all_products()
        self.assertIsInstance(products, list)

if __name__ == "__main__":
    unittest.main()
