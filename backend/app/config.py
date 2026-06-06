from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    host: str = "0.0.0.0"
    port: int = 5000
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    cencori_api_url: str = ""
    cencori_api_key: str = ""
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-20250514"
    claude_reasoning: bool = True
    telemetry_interval_seconds: int = 5
    auto_agent_cycles: bool = True
    api_base_url: str = "http://localhost:5000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
