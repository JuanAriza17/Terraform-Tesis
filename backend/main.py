from fastapi import FastAPI, HTTPException, status, Depends, Query
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from database.database import engine, SessionLocal, Base, get_db
from sqlalchemy.orm import Session
from typing import Annotated, List
import json
import subprocess
import boto3
import uuid
import os
from routes import courses, users, user_course
import time

Base.metadata.create_all(bind=engine)

ec2 = boto3.client("ec2")

app = FastAPI()
app.include_router(users.router)
app.include_router(courses.router)
app.include_router(user_course.router)

origins = [
    "http://localhost:3000",
]

# Habilitar CORS para permitir solicitudes desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Puedes especificar dominios específicos en lugar de "*"
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos (POST, GET, etc.)
    allow_headers=["*"],  # Permitir todos los headers
)
        
#Dependencias

db_dependency = Annotated[Session, Depends(get_db)]
token_dependency = Annotated[dict, Depends(users.verify_token)]

# Modelo de datos que recibe desde el frontend
class DeploymentRequest(BaseModel):
    courses: list[str]
    flags: list[str]

class DestroyRequest(BaseModel):
    workspace: str

# Función para ejecutar comandos de Terraform
def run_terraform_command(command: list, workspace: str):
    result = subprocess.run(command, capture_output=True, text=True, cwd=os.getcwd(),
                            env={
                                **os.environ,
                                "TF_WORKSPACE": workspace
                            })
    if result.returncode != 0:
        raise Exception(result.stderr)
    return result.stdout

# Función para obtener un nombre único de workspace
def get_user_workspace(user_id):
    return f"user_{user_id}_{uuid.uuid4()}"

# Ruta para manejar el despliegue
@app.post("/deploy")
def deploy_vm(request: DeploymentRequest, token: token_dependency, db:db_dependency):
    try:
        
        # Identificar al usuario a partir del token o cualquier otro método de autenticación
        user_id = token.get("sub")
        
         # Generar un nombre de workspace único
        workspace_name = get_user_workspace(user_id)
        
        # Crear y seleccionar el workspace del usuario
        create_workspace_command = ["terraform", "-chdir=terraform/", "workspace", "new", workspace_name]

        # Intenta crear el workspace, si ya existe seleccionarlo
        run_terraform_command(create_workspace_command, workspace_name)
        
        
        # Inicializar Terraform con 'terraform init'
        init_command = ["terraform", "-chdir=terraform/", "init"]
        run_terraform_command(init_command, workspace_name)

        # Configurar las variables de Terraform desde los datos del request
        terraform_command = [
            "terraform",
            "-chdir=terraform/", 
            "apply", 
            "-auto-approve",
            f"-var=courses={json.dumps(request.courses)}",
            f"-var=instance_count={len(request.courses)}",
            f"-var=flags={json.dumps(request.flags)}"
        ]
        

        # Ejecutar Terraform con 'terraform apply'
        run_terraform_command(terraform_command, workspace_name)
        output_command = ["terraform","-chdir=terraform/", "output", "-json"]
        output_json = run_terraform_command(output_command, workspace_name)
        outputs = json.loads(output_json)
        default_ip = outputs["default_ip"]["value"]
        id = outputs["default_id"]["value"]

        return {"message": "Despliegue exitoso", "ip": default_ip, "workspace": workspace_name, "id": id}

    except Exception as e:
        print(e)
        destroy_command = ["terraform", "-chdir=terraform/", "destroy", "-auto-approve"]
        run_terraform_command(destroy_command, workspace_name)
        
        delete_workspace_command = ["terraform", "-chdir=terraform/", "workspace", "delete", "-force", workspace_name]
        run_terraform_command(delete_workspace_command, "default")
        raise HTTPException(status_code=500, detail=str(e))

# Ruta para manejar el despliegue
@app.post("/destroy")
def destroy_vm(request:DestroyRequest, token: token_dependency, db:db_dependency):
    try:
        workspace = request.workspace
        
        destroy_command = ["terraform", "-chdir=terraform/", "destroy", "-auto-approve"]
        destroy_output = run_terraform_command(destroy_command, workspace)
        
        delete_workspace_command = ["terraform", "-chdir=terraform/", "workspace", "delete", "-force", workspace]
        run_terraform_command(delete_workspace_command, "default")
        
        return {"message": "Finalización exitosa", "output": destroy_output}

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/check_instances")
async def check_instances(instance_ids: List[str] = Query(None)):
    all_initialized = False
    while not all_initialized:
        all_initialized = True
        for instance_id in instance_ids:
            response = ec2.describe_instance_status(InstanceIds=[instance_id])
            instance_status = response['InstanceStatuses'][0] if response['InstanceStatuses'] else None
            if instance_status:
                status = instance_status['InstanceState']['Name']
                checks = instance_status['InstanceStatus']['Status']
                if status != 'running' or checks != 'ok':
                    all_initialized = False
                    break  # Salir del loop si alguna instancia no está lista
        if not all_initialized:
            time.sleep(10)  # Espera 10 segundos antes de volver a comprobar

    return {"initialized": True} 