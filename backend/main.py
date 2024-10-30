# software-back/main.py
from database import engine  # Si está usando un objeto engine en main
import models
import crud
import schemas
import routers
from fastapi import FastAPI
import models
import database
from routers import router as usuario_router

app = FastAPI()

# Crear las tablas en la base de datos
database.Base.metadata.create_all(bind=database.engine)

# Incluir las rutas
app.include_router(usuario_router, prefix="/api")
