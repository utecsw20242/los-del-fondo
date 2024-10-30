from sqlalchemy import Column, String
from database import Base
import uuid

class Usuario(Base):
    __tablename__ = "usuario"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nombre = Column(String(50), nullable=False)
    apellido = Column(String(50), nullable=False)
    telefono = Column(String(20))
    correo = Column(String(50), unique=True, index=True)
