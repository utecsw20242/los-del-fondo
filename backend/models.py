from sqlalchemy import Column, String, Integer, DateTime
from database import Base
import uuid

class Usuario(Base):
    __tablename__ = "usuario"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    contraseña = Column(String(20), nullable=False)  
    nombre = Column(String(50), nullable=False)
    apellidoM = Column(String(25), nullable=False) 
    apellidoP = Column(String(25), nullable=False)  
    telefono = Column(String(10))  
    correo = Column(String(50), unique=True, index=True)
    edad = Column(Integer)  


class Tracking(Base):
    __tablename__ = "Tracking"

    TraceId = Column(String(50), primary_key=True)
    UserId = Column(Integer)
    Route = Column(String(50))
    HttpStatusCode = Column(Integer)
    StartDate = Column(DateTime)
    EndDate = Column(DateTime)
    Latency = Column(Integer)

