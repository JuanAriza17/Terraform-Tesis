import pandas as pd
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import Course, UserCourse
from recommendation.recommendation import hybrid_recommendations_filtered, load_models, decode_onehot
from routes import users
from typing import Annotated

router = APIRouter()

db_dependency = Annotated[Session, Depends(get_db)]
token_dependency = Annotated[dict, Depends(users.verify_token)]

@router.get("/recommendations/{user_id}")
def get_recommendations(user_id: int, token: token_dependency, db: db_dependency):
    # Obtener datos de cursos y relaciones usuario-curso
    knn, svd, encoder = load_models()
    courses = db.query(Course).all()
    user_courses = db.query(UserCourse).filter(UserCourse.user_id == user_id).all()
    

    courses_df = pd.DataFrame([{
        "course_id": course.id,
        "title": course.title,
        "description":course.description,
        "team": course.team.value,
        "type": course.type,
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
        user_courses_df=user_courses_df,
        encoder=encoder
    )

    if not recommended_courses.empty:
        # Decodificar 'type' y 'team' antes de devolver las recomendaciones
        decoded_courses = decode_onehot(recommended_courses, encoder)
        recommended_courses = pd.concat([recommended_courses, decoded_courses], axis=1)

        # Eliminar columnas codificadas
        recommended_courses = recommended_courses.drop(columns=encoder.get_feature_names_out(['type', 'team']))
        
    return recommended_courses.to_dict(orient="records")[:4]
