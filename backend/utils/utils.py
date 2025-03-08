import random

from .fruits import fruits
from .names import names


def generateFruitname():
    fruit_name = f"{random.choice(names)} {random.choice(fruits)}"
    return fruit_name