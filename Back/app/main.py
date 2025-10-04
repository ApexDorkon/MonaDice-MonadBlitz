from fastapi import FastAPI

from app.routes.users import router as users_router
from app.routes.campaigns import router as campaigns_router
from app.routes.tickets import router as tickets_router


def create_app() -> FastAPI:
    app = FastAPI(title="Admon API", version="1.0.0")

    @app.get("/")
    def root():
        return {"status": "ok"}

    app.include_router(users_router)
    app.include_router(campaigns_router)
    app.include_router(tickets_router)
    return app


app = create_app()


