# routes/user_course.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.models import UserCourse, User, Course
from database.database import get_db
from pydantic import BaseModel
from typing import Annotated
from routes import users
from sqlalchemy.orm import joinedload


router = APIRouter(
    prefix="/user-courses",
    tags=["User Courses"]
)

db_dependency = Annotated[Session, Depends(get_db)]
token_dependency = Annotated[dict, Depends(users.verify_token)]

class UserCourseCreate(BaseModel):
    user_id: int
    course_id: int
    time_spent: float
    completed: bool


@router.post("/", status_code=status.HTTP_201_CREATED)
def post_user_course(
    enrollment: UserCourseCreate,
    db: db_dependency,
    token: token_dependency
):
    # Verificar si el usuario y el curso existen
    user = db.query(User).filter(User.id == enrollment.user_id).first()
    course = db.query(Course).filter(Course.id == enrollment.course_id).first()
    
    if not user or not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User or Course not found"
        )

    # Crear la relación de inscripción
    new_enrollment = UserCourse(user_id=enrollment.user_id, course_id=enrollment.course_id, time_spent=enrollment.time_spent, completed=enrollment.completed, user=user, course=course)
    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)

    return new_enrollment

@router.get("/{user_id}/courses", status_code=status.HTTP_200_OK)
def get_user_courses(user_id: int, token:token_dependency, db: db_dependency):    
    # Consulta con limitación de los primeros 10 registros y orden invertido en la base de datos
    user_courses = (
        db.query(UserCourse)
        .filter(UserCourse.user_id == user_id)
        .join(UserCourse.course)
        .order_by(UserCourse.id.desc())
        .limit(9)
        .all()
    )

    courses = [
        {
            "title": uc.course.title,
            "difficulty": uc.course.difficulty,
            "team": uc.course.team,
            "type": uc.course.type,
            "time_spent": uc.time_spent,
            "completed": uc.completed
        }
        for uc in user_courses
    ]

    return courses


# Función para eliminar todos los cursos
def delete_all_courses(db: Session):
    courses = db.query(UserCourse).all()
    for course in courses:
        db.delete(course)
    db.commit()

# Ruta para eliminar todos los cursos
@router.delete("/drop", status_code=204)
def remove_all_courses(db: Session = Depends(get_db)):
    delete_all_courses(db)
    return {"message": "All courses deleted successfully"}
