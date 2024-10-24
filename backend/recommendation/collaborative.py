from surprise import Dataset, Reader, SVD
from surprise.model_selection import train_test_split
from surprise import accuracy
import pandas as pd

# Crear dataframe de interacciones (user_id, course_id, time_spent como rating)
df = pd.DataFrame({
    'user_id': [1, 2, 1, 2, 3],
    'course_id': [1, 1, 2, 2, 3],
    'time_spent': [10, 15, 20, 25, 30]
})

# Crear el dataset de Surprise
reader = Reader(rating_scale=(0, 100))
data = Dataset.load_from_df(df[['user_id', 'course_id', 'time_spent']], reader)

# Dividir en conjuntos de entrenamiento y prueba
trainset, testset = train_test_split(data, test_size=0.25)

# Entrenar el modelo SVD
model = SVD()
model.fit(trainset)

# Evaluar el modelo
predictions = model.test(testset)
accuracy.rmse(predictions)

# Realizar predicciones
user_id = 1
course_ids = [1, 2, 3]
for course_id in course_ids:
    prediction = model.predict(user_id, course_id)
    print(f"Predicción para curso {course_id}: {prediction.est}")
