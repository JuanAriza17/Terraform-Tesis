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