# Proyecto FastAPI con MySQL

Este proyecto utiliza FastAPI junto con MySQL para crear una API. A continuación, se muestran los pasos necesarios para configurar el entorno y las dependencias.

## Requisitos Previos

- Python 3.7 o superior
- `pip` para gestionar paquetes de Python

## Asegurar tener instalado 'python3'
- python --version

## Ingresar al entorno virtual
- python -m venv env
- source env/bin/activate  # En macOS/Linux
- .\env\Scripts\activate      # En Windows

## Instalacion de dependencias 
- pip3 install 'pydantic[email]'
- pip3 install -r requirements.txt

## Ejecución de API
- uvicorn main:app --reload
