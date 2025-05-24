from utils import generateFruitname, fruits, names


def test_fruitname_is_string():
    result = generateFruitname()
    assert isinstance(
        result, str
    ), f"Expected result to be a string, but got {type(result)}"


def test_fruitname_contains_space():
    result = generateFruitname()
    assert " " in result, f"Expected ' ' to be in the result, but got {result}"


def test_fruitname_contains_fruit():
    result = generateFruitname()
    name, fruit = result.split(" ")
    assert fruit in [
        item for item in fruits
    ], f"Expected substring to be fruit, but got {fruit}"


def test_fruitname_contains_name():
    result = generateFruitname()
    name, fruit = result.split(" ")
    assert name in [
        item for item in names
    ], f"Expected substring to be name, but got {name}"