from sqlalchemy.orm import Session
from database.models import User, UserRole
from database.database import SessionLocal
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin_user():
    db = SessionLocal()
    username = "admin"
    password = "admin_password"  # Cambia esto a algo seguro
    hashed_password = pwd_context.hash(password)
    admin_user = User(username=username, hashed_password=hashed_password, role=UserRole.admin)
    db.add(admin_user)
    db.commit()
    db.close()

create_admin_user()
