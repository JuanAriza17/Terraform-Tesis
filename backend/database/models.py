from sqlalchemy import Column, Integer, String, ForeignKey, Float, Boolean, Enum
from sqlalchemy.orm import relationship
from database.database import Base
import enum

# Define los posibles roles de usuario
class UserRole(enum.Enum):
    admin = "admin"
    profesor = "profesor"
    estudiante = "estudiante"

# Define los posibles roles de usuario
class CourseTeam(enum.Enum):
    red = "RED"
    blue = "BLUE"
    purple = "PURPLE"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(UserRole), default=UserRole.estudiante)

    # Relación con UserCourse
    courses = relationship("UserCourse", back_populates="user", lazy="select", cascade="all, delete-orphan")

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    type = Column(String)
    team = Column(Enum(CourseTeam))
    difficulty = Column(Integer) 
    estimated_time = Column(Float)  # Duración estimada en horas

    user_courses = relationship("UserCourse", back_populates="course", lazy="select", cascade="all, delete-orphan")

class UserCourse(Base):
    __tablename__ = "user_courses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    course_id = Column(Integer, ForeignKey('courses.id'))
    time_spent = Column(Float)  # Tiempo que le tomó al usuario completar el curso
    completed = Column(Boolean)  # Booleano para indicar si completó el curso

    user = relationship("User", back_populates="courses")
    course = relationship("Course", back_populates="user_courses")



