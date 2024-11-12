import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from database.models import User, UserRole
from database.database import SessionLocal, engine, get_db
from sqlalchemy.orm import Session
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, status, Depends

load_dotenv()

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

# Hash contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

#JWT
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 120))

class UserCreate(BaseModel):
    username: str
    password: str
    role: UserRole = UserRole.estudiante

class Token(BaseModel):
    access_token: str
    token_type:str
    role:str

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

# Función para crear un estudiante
def create_user(db: Session, user: UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = User(username=user.username, hashed_password=hashed_password, role=user.role)
    db.add(db_user)
    db.commit()
    return "complete"

# Función para verificar el rol de admin
def verify_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verify_token(token)
    username = payload.get("sub")
    user = get_user_by_username(db, username=username)
    print(user.role)
    if not user or user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return user

# Función para verificar el rol de profesor o admin
def verify_teacher_or_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verify_token(token)
    username = payload.get("sub")
    user = get_user_by_username(db, username=username)
    if not user or user.role not in [UserRole.admin, UserRole.profesor]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return user


# Ruta para crear un profesor
@router.post("/create-professor", status_code=status.HTTP_201_CREATED)
def create_professor( user: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(verify_admin)):
    user.role = UserRole.profesor
    return create_user(db=db, user=user)

# Ruta para el registro de usuarios
@router.post("/", status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    user.role = UserRole.estudiante
    return create_user(db=db, user=user)

# Función para autenticar usuarios
def authenticate_user(username: str, password: str, db: Session):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False
    if not pwd_context.verify(password, user.hashed_password):
        return False
    return user

# Función para verificar el token
def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate user")
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate user")

# Función para crear el token de acceso
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc)+ expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

#Ruta para crear el token
@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session=Depends(get_db)):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

@router.get("/verify-token/{token}")
async def verify_user_token(token:str):
    verify_token(token=token)
    return {"message": "Token is valid"}

# Función para obtener todos los cursos
def get_all_users(db: Session):
    return db.query(User).all()

# Ruta para obtener todos los cursos
@router.get("/all")  # Usamos response_model para definir el formato de los datos
def read_courses(db: Session = Depends(get_db)):
    courses = get_all_users(db)
    return courses


