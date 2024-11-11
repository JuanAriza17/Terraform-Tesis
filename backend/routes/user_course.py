# routes/user_course.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.models import UserCourse, User, Course
from database.database import get_db
from pydantic import BaseModel

router = APIRouter(
    prefix="/user-courses",
    tags=["User Courses"]
)

class UserCourseCreate(BaseModel):
    user_id: int
    course_id: int
    time_spent: float
    completed: bool


@router.post("/", status_code=status.HTTP_201_CREATED)
def post_user_course(
    enrollment: UserCourseCreate,
    db: Session = Depends(get_db)
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
    new_enrollment = UserCourse(user_id=enrollment.user_id, course_id=enrollment.course_id)
    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)

    return new_enrollment

@router.get("/{user_id}/courses", status_code=status.HTTP_200_OK)
def get_user_courses(user_id: int, db: Session = Depends(get_db)):
    user_courses = db.query(UserCourse).filter(UserCourse.user_id == user_id).all()
    print(user_courses[0].course.title)
    return user_courses
