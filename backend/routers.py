# software-back/routers.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import crud
import schemas 
import database

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/usuarios/", response_model=schemas.UsuarioInDB)
def create_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    return crud.create_usuario(db=db, usuario=usuario)

@router.get("/usuarios/{usuario_id}", response_model=schemas.UsuarioInDB)
def read_usuario(usuario_id: str, db: Session = Depends(get_db)):
    db_usuario = crud.get_usuario(db, usuario_id=usuario_id)
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuario not found")
    return db_usuario

@router.get("/usuarios/", response_model=list[schemas.UsuarioInDB])
def read_usuarios(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_usuarios(db, skip=skip, limit=limit)

@router.put("/usuarios/{usuario_id}", response_model=schemas.UsuarioInDB)
def update_usuario(usuario_id: str, usuario: schemas.UsuarioUpdate, db: Session = Depends(get_db)):
    db_usuario = crud.update_usuario(db, usuario_id=usuario_id, usuario=usuario)
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuario not found")
    return db_usuario

@router.delete("/usuarios/{usuario_id}", response_model=schemas.UsuarioInDB)
def delete_usuario(usuario_id: str, db: Session = Depends(get_db)):
    db_usuario = crud.delete_usuario(db, usuario_id=usuario_id)
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuario not found")
    return db_usuario
