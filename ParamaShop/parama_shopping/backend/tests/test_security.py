import unittest
from security.hashing import sha256_hash, bcrypt_hash, bcrypt_verify
from security.encoding import base64_encode, base64_decode, hex_encode, hex_decode
from security.digital_signature import sign_order, verify_order_signature

class SecurityUtilsTestCase(unittest.TestCase):
    def test_sha256_hash(self):
        hashed = sha256_hash("test")
        self.assertIsInstance(hashed, str)

    def test_bcrypt_hash_and_verify(self):
        password = "securepass"
        hashed = bcrypt_hash(password)
        self.assertTrue(bcrypt_verify(password, hashed))

    def test_base64_encode_decode(self):
        data = "hello"
        encoded = base64_encode(data)
        decoded = base64_decode(encoded)
        self.assertEqual(data, decoded)

    def test_hex_encode_decode(self):
        data = "hello"
        encoded = hex_encode(data)
        decoded = hex_decode(encoded)
        self.assertEqual(data, decoded)

    def test_digital_signature(self):
        data = "order123"
        signature = sign_order(data)
        self.assertTrue(verify_order_signature(data, signature))

if __name__ == "__main__":
    unittest.main()
