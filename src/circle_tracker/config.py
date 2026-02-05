from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        populate_by_name=True,
    )

    db_host: str = Field("localhost", alias="DB_HOST")
    db_port: int = Field(5433, alias="DB_PORT")
    db_user: str = Field("postgres", alias="DB_USER")
    db_password: str = Field("password", alias="DB_PASSWORD")
    db_name: str = Field("postgres", alias="DB_NAME")

    jwt_secret: str = Field(..., alias="JWT_SECRET")
    jwt_access_token_expire_minutes: int = Field(
        30, alias="JWT_ACCESS_TOKEN_EXPIRE_MINUTES"
    )
    jwt_refresh_token_expire_days: int = Field(7, alias="JWT_REFRESH_TOKEN_EXPIRE_DAYS")

    debug: bool = Field(False, alias="DEBUG")

    @property
    def db_url(self) -> str:
        return f"postgresql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"


settings = Settings()  # type: ignore[call-arg]  # ty:ignore[unused-ignore-comment]