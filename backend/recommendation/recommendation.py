import pandas as pd
from sklearn.neighbors import NearestNeighbors
from surprise import SVD, Dataset, Reader
from database.models import Course, UserCourse
import numpy as np
import joblib

def train_models(db):
    # Extraer datos de la base de datos
    courses = db.query(Course).all()
    user_courses = db.query(UserCourse).all()

    # Crear DataFrame de cursos
    courses_df = pd.DataFrame([{
        "course_id": course.id,
        "difficulty": course.difficulty,
        "estimated_time": course.estimated_time
    } for course in courses])

    # Crear DataFrame de interacciones usuario-curso
    user_courses_df = pd.DataFrame([{
        "user_id": uc.user_id,
        "course_id": uc.course_id,
        "time_spent": uc.time_spent
    } for uc in user_courses])

    # --- Entrenamiento del modelo KNN ---
    # Usamos características de los cursos
    knn_features = courses_df[['difficulty', 'estimated_time']]
    knn_model = NearestNeighbors(n_neighbors=3, metric='euclidean')
    knn_model.fit(knn_features)

    # Guardar el modelo KNN
    print("hola")
    joblib.dump(knn_model, "./models/knn_model.pkl")

    # --- Entrenamiento del modelo SVD ---
    # Crear dataset para Surprise
    reader = Reader(rating_scale=(0, 100))
    data = Dataset.load_from_df(user_courses_df[['user_id', 'course_id', 'time_spent']], reader)
    trainset = data.build_full_trainset()

    svd_model = SVD()
    svd_model.fit(trainset)

    # Guardar el modelo SVD
    joblib.dump(svd_model, "./models/svd_model.pkl")

    print("Modelos entrenados y guardados exitosamente.")

def hybrid_recommendations_filtered(user_id, knn_model, svd_model, courses_df, user_courses_df, weight_knn=0.5, weight_svd=0.5):
    # Filtrar cursos no finalizados o problemáticos
    completed_courses = user_courses_df[(user_courses_df['user_id'] == user_id) & (user_courses_df['completed'] == True)]
    problematic_courses = completed_courses[
        completed_courses['time_spent'] > courses_df.set_index('course_id').loc[completed_courses['course_id']]['estimated_time']
    ]
    excluded_course_ids = set(completed_courses['course_id'])

    # Filtrar cursos que no deben recomendarse
    filtered_courses_df = courses_df[~courses_df['course_id'].isin(excluded_course_ids)].copy()

    # Obtener cursos similares con KNN
    course_features = filtered_courses_df[['difficulty', 'estimated_time']]
    _, knn_indices = knn_model.kneighbors(course_features)
    filtered_courses_df['knn_score'] = [
        1 / (1 + np.mean(distances)) for distances in knn_indices
    ]

    # Predecir con SVD para todos los cursos no completados
    svd_scores = []
    for _, row in filtered_courses_df.iterrows():
        pred = svd_model.predict(user_id, row['course_id'])
        svd_scores.append(pred.est)
    filtered_courses_df['svd_score'] = svd_scores

    # Aumentar peso a cursos problemáticos
    filtered_courses_df['priority'] = filtered_courses_df['course_id'].apply(
        lambda x: 1.5 if x in problematic_courses['course_id'].values else 1.0
    )

    # Combinar puntuaciones
    filtered_courses_df['hybrid_score'] = (
        weight_knn * filtered_courses_df['knn_score'] +
        weight_svd * filtered_courses_df['svd_score']
    ) * filtered_courses_df['priority']

    # Ordenar por puntuación híbrida
    recommended_courses = filtered_courses_df.sort_values('hybrid_score', ascending=False)
    return recommended_courses[['course_id', 'title', 'hybrid_score']]

def load_models():
    knn = joblib.load("./models/knn_model.pkl")
    svd = joblib.load("./models/svd_model.pkl")
    
    return knn, svd
