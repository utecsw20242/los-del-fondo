# software-back/schemas.py
from pydantic import BaseModel, EmailStr, constr

class UsuarioBase(BaseModel):
    nombre: constr(max_length=50)
    apellido: constr(max_length=50)
    telefono: constr(max_length=20)
    correo: EmailStr

class UsuarioCreate(UsuarioBase):
    pass

class UsuarioUpdate(UsuarioBase):
    pass

class UsuarioInDB(UsuarioBase):
    id: str

    class Config:
        orm_mode = True
