# software-back/schemas.py
from pydantic import BaseModel, EmailStr, constr


class UsuarioBase(BaseModel):
    nombre: constr(max_length=50)
    apellidoM: constr(max_length=25)  
    apellidoP: constr(max_length=25)  
    telefono: constr(max_length=10)  
    correo: EmailStr
    contraseña: constr(max_length=20)  
    edad: int  

class UsuarioCreate(UsuarioBase):
    pass


class UsuarioUpdate(UsuarioBase):
    pass


class UsuarioInDB(UsuarioBase):
    id: str

    class Config:
        from_atributes = True


class PlanoBase(BaseModel):
    # We are assuming the image is in base 64
    coded_image: str


class PlanoCreate(BaseModel):
    pass


class PlanoUpdate(BaseModel):
    pass


class PlanoInDB(BaseModel):
    windows: int
    doors: int
    texts: int
    pass
