
variable "ami_id" {
  description = "ID de la AMI"
  default = "ami-0440d3b780d96b29d"
}

variable "instance_type" {
  description = "Tipo de instancia EC2"
  default = "t3.micro"
}

variable "server_name" {
  description = "Nombre del servidor web"
  default = "example"
}

variable "enviroment" {
  description = "Ambiente de la aplicación"
  default = "test"
}

variable "courses" {
  description = "Lista de cursos"
  type = list(string)
  default     = ["default", "sql_injection_1"]
}

variable "curso" {
  description = "curso a ejecutar en la máquina"
  default     = "default"
}

variable "flags" {
  description = "Lista de flags"
  type = list(string)
  default     = ["flagDefault", "flagDefault"]
}

variable "flag" {
  description = "flag a encontrar en la máquina"
  default     = "flagDefault"
}

variable "instance_count" {
  description = "Número de instancias a crear"
  type = number
  default = 1
}
