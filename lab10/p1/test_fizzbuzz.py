import unittest
from fizzbuzz import fizzbuzz

class TestFizzBuzz(unittest.TestCase):
    
    def test_fizzbuzz_divisible_by_3_and_5(self):
        # Arrange
        n = 15
        expected = "FizzBuzz"
        # Act
        result = fizzbuzz(n)
        # Assert
        self.assertEqual(result, expected)
    
    def test_fizzbuzz_divisible_by_3(self):
        # Arrange
        n = 3
        expected = "Fizz"
        # Act
        result = fizzbuzz(n)
        # Assert
        self.assertEqual(result, expected)
    
    def test_fizzbuzz_divisible_by_5(self):
        # Arrange
        n = 5
        expected = "Buzz"
        # Act
        result = fizzbuzz(n)
        # Assert
        self.assertEqual(result, expected)
    
    def test_fizzbuzz_not_divisible_by_3_or_5(self):
        # Arrange
        n = 2
        expected = "2"
        # Act
        result = fizzbuzz(n)
        # Assert
        self.assertEqual(result, expected)
    
    def test_fizzbuzz_negative_divisible_by_3_and_5(self):
        # Arrange
        n = -15
        expected = "FizzBuzz"
        # Act
        result = fizzbuzz(n)
        # Assert
        self.assertEqual(result, expected)
    
    def test_fizzbuzz_negative_divisible_by_3(self):
        # Arrange
        n = -3
        expected = "Fizz"
        # Act
        result = fizzbuzz(n)
        # Assert
        self.assertEqual(result, expected)
    
    def test_fizzbuzz_negative_divisible_by_5(self):
        # Arrange
        n = -5
        expected = "Buzz"
        # Act
        result = fizzbuzz(n)
        # Assert
        self.assertEqual(result, expected)
    
    # Edge cases encontrados: cero, float, str
    def test_fizzbuzz_zero(self):
        # Arrange
        n = 0
        expected = "FizzBuzz"
        # Act
        result = fizzbuzz(n)
        # Assert
        self.assertEqual(result, expected)

    def test_fizzbuzz_float_input(self):
        # Arrange
        n = 3.5
        # Act & Assert
        with self.assertRaises(TypeError):
            fizzbuzz(n)
    
    def test_fizzbuzz_string_input(self):
        # Arrange
        n = "Hola"
        # Act & Assert
        with self.assertRaises(TypeError):
            fizzbuzz(n)

    def test_fizzbuzz_none_input(self):
        # Arrange
        n = None
        # Act & Assert
        with self.assertRaises(TypeError):
            fizzbuzz(n)

    def test_fizzbuzz_list_input(self):
        # Arrange
        n = [1, 2, 3]
        # Act & Assert
        with self.assertRaises(TypeError):
            fizzbuzz(n)

    def test_fizzbuzz_dict_input(self):
        # Arrange
        n = {"key": "value"}
        # Act & Assert
        with self.assertRaises(TypeError):
            fizzbuzz(n)

if __name__ == "__main__":
    unittest.main()
