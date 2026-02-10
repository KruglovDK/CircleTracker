class GroupError(Exception):
    """Базовый класс для ошибок групп."""


class GroupNotFoundError(GroupError):
    pass


class GroupAccessDeniedError(GroupError):
    pass


class InviteError(Exception):
    """Базовый класс для ошибок приглашений."""


class InviteNotFoundError(InviteError):
    pass


class InviteAlreadyExistsError(InviteError):
    pass


class UserAlreadyInGroupError(InviteError):
    pass


class InviteAccessDeniedError(InviteError):
    pass