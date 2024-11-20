from apscheduler.schedulers.background import BackgroundScheduler
from recommendation.recommendation import train_models
from database.database import get_db

def schedule_training():
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        func=lambda: train_models(next(get_db())),
        trigger="interval",
        hours=24
    )
    scheduler.start()
