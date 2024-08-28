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
