provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "example" {
  ami           = "ami-0440d3b780d96b29d"
  instance_type = "t3.micro"

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
    Name = "example"
    Environment = "test"
    Owner = "ja.arizag@uniandes.edu.co"
    Team = "Security"
    Project = "Tesis"
  }
}

resource "aws_key_pair" "example-ssh" {
  key_name   = "example"
  public_key = file("example.key.pub")
    tags = {
    Name = "example-ssh"
    Environment = "test"
    Owner = "ja.arizag@uniandes.edu.co"
    Team = "Security"
    Project = "Tesis"
  }
}

resource "aws_security_group" "example-sg" {
  name = "example-sg"
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
    Name = "example-sg"
    Environment = "test"
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