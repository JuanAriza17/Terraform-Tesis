from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import json
import subprocess
import os

app = FastAPI()

# Habilitar CORS para permitir solicitudes desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Puedes especificar dominios específicos en lugar de "*"
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos (POST, GET, etc.)
    allow_headers=["*"],  # Permitir todos los headers
)
# Modelo de datos que recibe desde el frontend
class DeploymentRequest(BaseModel):
    courses: list[str]
    instance_count: int

# Función para ejecutar comandos de Terraform
def run_terraform_command(command: list):
    result = subprocess.run(command, capture_output=True, text=True, cwd=os.getcwd())
    if result.returncode != 0:
        raise Exception(result.stderr)
    return result.stdout

# Ruta para manejar el despliegue
@app.post("/deploy")
def deploy_vm(request: DeploymentRequest):
    try:
        # Inicializar Terraform con 'terraform init'
        init_command = ["terraform", "init"]
        run_terraform_command(init_command)
        print(request.courses)
        print(request.instance_count)
        
        # Configurar las variables de Terraform desde los datos del request
        terraform_command = [
            "terraform", "apply", "-auto-approve",
            f"-var=courses={json.dumps(request.courses)}",
            f"-var=instance_count={request.instance_count}"
        ]
        

        # Ejecutar Terraform con 'terraform apply'
        apply_output = run_terraform_command(terraform_command)
        print(apply_output)
        output_command = ["terraform", "output", "-json"]
        output_json = run_terraform_command(output_command)
        outputs = json.loads(output_json)
        default_ip = outputs["default_ip"]["value"]

        return {"message": "Despliegue exitoso", "ip": default_ip}

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

# Ruta para manejar el despliegue
@app.post("/destroy")
def destroy_vm():
    try:
        destroy_command = ["terraform", "destroy", "-auto-approve"]
        destroy_output = run_terraform_command(destroy_command)
        print(destroy_output)
        return {"message": "Finalización exitosa", "output": destroy_output}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))