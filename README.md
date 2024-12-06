
# CyberLearn Platform

CyberLearn es una plataforma educativa diseñada para enseñar ciberseguridad mediante un enfoque práctico y experiencial. Esta plataforma incluye un frontend desarrollado en **React** y un backend implementado con **FastAPI**.

## Estructura del Proyecto

- **Frontend:** Construido con React. Maneja la interfaz gráfica y las interacciones con el usuario.
- **Backend:** Implementado en FastAPI. Proporciona la lógica del negocio, manejo de usuarios, autenticación y comunicación con la base de datos.

---

## Configuración Inicial

### Backend

1. **Instalar dependencias**
   ```bash
   pip install -r requirements.txt
   ```

2. **Variables de entorno**
   En la raíz del proyecto, crea un archivo `.env` con las siguientes claves:

   ```env
   SECRET_KEY=<tu-clave-secreta>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   GITHUB_TOKEN=<tu-token-github>
   GITHUB_REPO=<tu-repo-github>
   ```

3. **Requisitos adicionales**
   - **AWS Keys**: Configura tus credenciales de AWS para desplegar máquinas virtuales.
   - **Terraform**: Asegúrate de que Terraform esté instalado en tu máquina.

4. **Ejecutar el servidor**
   ```bash
   uvicorn main:app --reload
   ```

---

### Frontend

1. **Instalar dependencias**
   Navega a la carpeta del frontend y ejecuta:
   ```bash
   npm install
   ```

2. **Iniciar el servidor de desarrollo**
   ```bash
   npm start
   ```

---

## Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).
