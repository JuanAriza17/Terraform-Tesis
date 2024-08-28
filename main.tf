provider "aws" {
  region = "us-east-1"
}

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

resource "aws_instance" "example" {
  ami           = var.ami_id
  instance_type = var.instance_type

  user_data = <<-EOF
              #!/bin/bash
              sudo yum install -y nginx
              sudo systemctl enable nginx
              sudo systemctl start nginx
              EOF
  
  key_name = aws_key_pair.example-ssh.key_name

  vpc_security_group_ids = [
    aws_security_group.example-sg.id
  ]

  tags = {
    Name = var.server_name
    Environment = var.enviroment
    Owner = "ja.arizag@uniandes.edu.co"
    Team = "Security"
    Project = "Tesis"
  }
}

# ssh-keygen -t rsa -b 2048 -f "example.key"
resource "aws_key_pair" "example-ssh" {
  key_name   = var.server_name
  public_key = file("${var.server_name}.key.pub")
    tags = {
    Name = "${var.server_name}-ssh"
    Environment = var.enviroment
    Owner = "ja.arizag@uniandes.edu.co"
    Team = "Security"
    Project = "Tesis"
  }
}

resource "aws_security_group" "example-sg" {
  name = "${var.server_name}-sg"
  description = "Security gruop allowing SSH and HTTP access"

  ingress {
    from_port = 22
    to_port = 22
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port = 80
    to_port = 80
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port = 0
    to_port = 0
    protocol = -1
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Name = "${var.server_name}-sg"
    Environment = var.enviroment
    Owner = "ja.arizag@uniandes.edu.co"
    Team = "Security"
    Project = "Tesis"
  }

}

output "server_public_ip" {
  description = "Dirección IP pública de la instancia EC2"
  value = aws_instance.example.public_ip
}

output "server_public_dns" {
  description = "DNS público de la instancia EC2"
  value = aws_instance.example.public_dns
}