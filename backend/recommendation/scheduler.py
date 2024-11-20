import schedule
import time
from threading import Thread
from recommendation.recommendation import train_models
from database.database import get_db

first_run = True

def train_job():
    print("Training models...")
    train_models(next(get_db()))  # Llama a tu función de entrenamiento
    print("Models trained successfully.")

def run_scheduler():
    schedule.every().day.at("00:00").do(train_job)  # Programa el entrenamiento diario a medianoche
    while True:
        schedule.run_pending()
        time.sleep(1)

def schedule_training():
    global first_run
    if first_run:
        print("Performing initial training...")
        train_job()  # Entrenamiento inmediato
        first_run = False  # Marca el primer entrenamiento como realizado
        
    # Corre el scheduler en un hilo separado
    print("Starting scheduler...")
    scheduler_thread = Thread(target=run_scheduler)
    scheduler_thread.daemon = True
    scheduler_thread.start()

