
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