from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from database import Base

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    type = Column(String)
    difficulty = Column(Integer)  # Por ejemplo, 1=Principiante, 2=Intermedio, 3=Avanzado
    estimated_time = Column(Float)  # Duración estimada en horas

class UserCourse(Base):
    __tablename__ = "user_courses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    course_id = Column(Integer, ForeignKey('courses.id'))
    time_spent = Column(Float)  # Tiempo que le tomó al usuario completar el curso
    completed = Column(Integer)  # Un campo booleano (1=Sí, 0=No)
    feedback = Column(String)  # Opinión o comentarios del usuario

    user = relationship("User", back_populates="courses")
    course = relationship("Course")

