class CategoryError(Exception):
    """Базовый класс для ошибок категорий."""


class CategoryNotFoundError(CategoryError):
    pass


class CategoryAccessDeniedError(CategoryError):
    pass
