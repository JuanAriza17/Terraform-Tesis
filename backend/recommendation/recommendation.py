import pandas as pd
from sklearn.neighbors import NearestNeighbors
from surprise import SVD, Dataset, Reader
from database.models import Course, UserCourse
from sklearn.preprocessing import OneHotEncoder
import numpy as np
import joblib

def train_models(db):
    # Extraer datos de la base de datos
    courses = db.query(Course).all()
    user_courses = db.query(UserCourse).all()
    
    # Crear DataFrame de cursos
    courses_df = pd.DataFrame([{
        "course_id": course.id,
        "title": course.title,
        "difficulty": course.difficulty,
        "estimated_time": course.estimated_time,
        "type": course.type,
        "team": course.team.value
    } for course in courses])

    # Crear DataFrame de interacciones usuario-curso
    user_courses_df = pd.DataFrame([{
        "user_id": uc.user_id,
        "course_id": uc.course_id,
        "time_spent": uc.time_spent
    } for uc in user_courses])

    # --- Entrenamiento del modelo KNN ---
    # Usamos características de los cursos
    courses_features_df, encoder = preprocess_courses(courses_df)
    joblib.dump(encoder, "./models/onehot.joblib")
    
    X = courses_features_df.drop(columns=['course_id', 'title'])
    knn_model = NearestNeighbors(n_neighbors=4, metric='euclidean')
    knn_model.fit(X)

    # Guardar el modelo KNN
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

def preprocess_courses(courses_df, encoder=None):
    """
    Preprocesa el DataFrame de cursos, aplicando One-Hot Encoding a las columnas 'type' y 'team'.
    Si no se proporciona un encoder, se creará uno nuevo.
    """
    # Copiar para evitar modificaciones en el original
    courses_df = courses_df.copy()

    # Verificar si el encoder ya existe
    if encoder is None:
        encoder = OneHotEncoder(sparse_output=False)
        encoded_features = encoder.fit_transform(courses_df[['type', 'team']])
    else:
        encoded_features = encoder.transform(courses_df[['type', 'team']])

    # Crear un DataFrame con las columnas codificadas
    encoded_df = pd.DataFrame(
        encoded_features, 
        columns=encoder.get_feature_names_out(['type', 'team']),
        index=courses_df.index
    )

    # Concatenar características codificadas con las columnas originales
    processed_df = pd.concat([courses_df, encoded_df], axis=1).drop(columns=['type', 'team'])

    return processed_df, encoder

# Suponiendo que 'processed_courses_df' es el DataFrame codificado
def decode_onehot(processed_courses_df, encoder):
    # Seleccionar las columnas que fueron codificadas
    encoded_columns = encoder.get_feature_names_out(['type', 'team'])
    encoded_values = processed_courses_df[encoded_columns].values

    # Realizar la transformación inversa
    original_values = encoder.inverse_transform(encoded_values)

    # Crear un DataFrame con los valores originales
    decoded_df = pd.DataFrame(original_values, columns=['type', 'team'], index=processed_courses_df.index)
    return decoded_df


def hybrid_recommendations_filtered(user_id, knn_model, svd_model, courses_df, user_courses_df, encoder, weight_knn=0.6, weight_svd=0.4):
    # Preprocesar los datos de cursos
    courses_df, _ = preprocess_courses(courses_df, encoder)
    
    # Filtrar cursos completados
    if user_courses_df.empty:
        return pd.DataFrame([])
    
    completed_courses = user_courses_df[(user_courses_df['user_id'] == user_id) & (user_courses_df['completed'] == True)]

    if completed_courses.empty:
        # Manejo de usuarios sin historial
        filtered_courses_df = courses_df.copy()
        problematic_courses = user_courses_df[(user_courses_df['user_id'] == user_id) & (user_courses_df['completed'] == False)]

    else:
        # Unir completed_courses con estimated_time
        completed_courses = completed_courses.merge(
            courses_df[['course_id', 'estimated_time']], 
            on='course_id', 
            how='left'
        )

        # Identificar cursos problemáticos
        problematic_courses = completed_courses[
            (completed_courses['time_spent'] > completed_courses['estimated_time'])
        ]
        excluded_course_ids = set(completed_courses['course_id'])

        # Filtrar cursos no completados
        filtered_courses_df = courses_df[~courses_df['course_id'].isin(excluded_course_ids)].copy()
        
    unfinished_courses_df = user_courses_df[(user_courses_df['user_id'] == user_id) & (user_courses_df['completed'] == False)]        

    # Verificar si hay cursos para recomendar
    if filtered_courses_df.empty:
        return pd.DataFrame([])
    
    # Obtener cursos similares con KNN
    course_features = filtered_courses_df.drop(columns=['course_id', 'title', 'description'])
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
        lambda x: 1.5 if (x in problematic_courses['course_id'].values or x in unfinished_courses_df['course_id'].values) else 1.0
)


    # Combinar puntuaciones
    filtered_courses_df['hybrid_score'] = (
        weight_knn * filtered_courses_df['knn_score'] +
        weight_svd * filtered_courses_df['svd_score']
    ) * filtered_courses_df['priority']

    # Ordenar por puntuación híbrida
    recommended_courses = filtered_courses_df.sort_values('hybrid_score', ascending=False)
    return recommended_courses

def load_models():
    knn = joblib.load("./models/knn_model.pkl")
    svd = joblib.load("./models/svd_model.pkl")
    encoder = joblib.load("./models/onehot.joblib")
    return knn, svd, encoder
