from sklearn.neighbors import NearestNeighbors
import pandas as pd

# Datos de cursos
courses_df = pd.DataFrame({
    'course_id': [1, 2, 3],
    'type': ['Data Science', 'Web Development', 'Data Science'],
    'difficulty': [1, 2, 3],
    'estimated_time': [10, 15, 20]
})

# Normalizar las características del curso (ejemplo)
X = courses_df[['difficulty', 'estimated_time']]

# Entrenar el modelo KNN
knn = NearestNeighbors(n_neighbors=3, metric='euclidean')
knn.fit(X)

# Encontrar cursos similares para un curso en particular
course_index = 0  # Por ejemplo, el curso 1
distances, indices = knn.kneighbors([X.iloc[course_index]])
recommended_courses = courses_df.iloc[indices[0]]
print(recommended_courses)
