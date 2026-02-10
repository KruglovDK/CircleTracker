class TransactionError(Exception):
    """Базовый класс для ошибок транзакций."""


class TransactionNotFoundError(TransactionError):
    pass


class TransactionAccessDeniedError(TransactionError):
    pass