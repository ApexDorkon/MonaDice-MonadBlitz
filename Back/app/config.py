from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    WEB3_PROVIDER_URL: str
    FACTORY_CONTRACT_ADDRESS: str
    USDC_CONTRACT_ADDRESS: str
    ORACLE_PRIVATE_KEY: str
    SECRET_KEY: str
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


def get_settings():
    return Settings()


