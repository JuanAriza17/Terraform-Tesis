import pandas as pd
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import Course, UserCourse
from recommendation.recommendation import hybrid_recommendations_filtered, load_models
from routes import users
from typing import Annotated
import joblib

router = APIRouter()

db_dependency = Annotated[Session, Depends(get_db)]
token_dependency = Annotated[dict, Depends(users.verify_token)]

@router.get("/recommendations/{user_id}")
def get_recommendations(user_id: int, token: token_dependency, db: db_dependency):
    # Obtener datos de cursos y relaciones usuario-curso
    knn, svd = load_models()
    courses = db.query(Course).all()
    user_courses = db.query(UserCourse).filter(UserCourse.user_id == user_id).all()

    courses_df = pd.DataFrame([{
        "course_id": course.id,
        "title": course.title,
        "difficulty": course.difficulty,
        "estimated_time": course.estimated_time
    } for course in courses])

    user_courses_df = pd.DataFrame([{
        "user_id": uc.user_id,
        "course_id": uc.course_id,
        "time_spent": uc.time_spent,
        "completed": uc.completed
    } for uc in user_courses])

    # Generar recomendaciones híbridas filtradas
    recommended_courses = hybrid_recommendations_filtered(
        user_id=user_id,
        knn_model=knn,
        svd_model=svd,
        courses_df=courses_df,
        user_courses_df=user_courses_df
    )
    return recommended_courses.to_dict(orient="records")
