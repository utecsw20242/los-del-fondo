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
