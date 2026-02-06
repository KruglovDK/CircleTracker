class AuthError(Exception):
    """Базовый класс для ошибок аутентификации."""


class UserAlreadyExistsError(AuthError):
    pass


class UserNotFoundError(AuthError):
    pass


class InvalidPasswordError(AuthError):
    pass