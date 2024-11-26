import os
import httpx
import base64
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from database.models import Course, User, CourseTeam
from database.database import get_db
from routes.users import verify_teacher_or_admin
from recommendation.recommendation import train_models


router = APIRouter(
    prefix="/courses",
    tags=["courses"]
)

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_REPO = os.getenv("GITHUB_REPO")


# Modelo para recibir datos del curso
class CourseCreate(BaseModel):
    title: str
    alias: str
    description: str
    type: str
    team: CourseTeam
    difficulty: int
    estimated_time: float

# Función para agregar un curso a GitHub
async def add_course_to_github(files: List[UploadFile], title: str, difficulty: int):
    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    for file in files:
        content = await file.read()
        content_base64 = base64.b64encode(content).decode()
        
        # Sube cada archivo al repositorio en una carpeta específica para el curso
        url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{title}_{difficulty}/{file.filename}"
        data = {
            "message": f"Add {file.filename} for course {title}",
            "content": content_base64
        }

        async with httpx.AsyncClient() as client:
            response = await client.put(url, headers=headers, json=data)
            if response.status_code != 201:
                raise HTTPException(status_code=500, detail="Failed to add course to GitHub")

# Ruta para crear un curso
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_course(
    title: str = Form(...),
    alias: str = Form(...),
    description: str = Form(...),
    type: str = Form(...),
    team: CourseTeam = Form(...),
    difficulty: int = Form(...),
    estimated_time: float = Form(...),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_teacher_or_admin)  # Solo profesores y admins
):
    try:
        # Llamar a la función para agregar el curso a GitHub
        await add_course_to_github(files, title, difficulty)

        # Si el curso fue agregado a GitHub, procedemos a agregarlo a la base de datos
        db_course = Course(
            title=title,
            alias=alias,
            description=description,
            type=type,
            team=team,
            difficulty=difficulty,
            estimated_time=estimated_time
        )

        db.add(db_course)
        db.commit()  # Confirmamos la transacción en la base de datos
        db.refresh(db_course)  # Refrescamos el objeto con los datos de la base de datos
        train_models(next(get_db()))  # Llama a tu función de entrenamiento
        
        return db_course  # Retornamos el curso creado

    except HTTPException as e:
        raise e  # Re-lanzamos la excepción si la solicitud a GitHub falla
    except SQLAlchemyError as e:
        db.rollback()  # Hacemos rollback si algo sale mal en la base de datos
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

# Función para obtener todos los cursos
def get_all_courses(db: Session):
    return db.query(Course).all()

# Ruta para obtener todos los cursos
@router.get("/all")  # Usamos response_model para definir el formato de los datos
def read_courses(db: Session = Depends(get_db)):
    courses = get_all_courses(db)
    return courses

@router.post("/xd", status_code=status.HTTP_201_CREATED)
async def create_course(
    course: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_teacher_or_admin)  # Solo profesores y admins
):
    # Llamar a la función para agregar el curso a GitHub

    # Si el curso fue agregado a GitHub, procedemos a agregarlo a la base de datos
    db_course = Course(
        title=course.title,
        alias=course.alias,
        description=course.description,
        type=course.type,
        team = course.team,
        difficulty=course.difficulty,
        estimated_time=course.estimated_time
    )

    db.add(db_course)
    db.commit()  # Confirmamos la transacción en la base de datos
    db.refresh(db_course)  # Refrescamos el objeto con los datos de la base de datos
    
    train_models(next(get_db()))  # Llama a tu función de entrenamiento


    return db_course  # Retornamos el curso creado

@router.put("/{course_id}/description", status_code=status.HTTP_200_OK)
async def update_course_description(
    course_id: int,
    new_description: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_teacher_or_admin)  # Solo profesores y admins
):
    # Buscar el curso por ID
    db_course = db.query(Course).filter(Course.id == course_id).first()

    if not db_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with id {course_id} not found"
        )

    # Actualizar la descripción
    db_course.description = new_description

    # Confirmar cambios en la base de datos
    db.commit()
    db.refresh(db_course)  # Actualizar el objeto con la base de datos
    
    return {"message": "Description updated successfully", "course": db_course}