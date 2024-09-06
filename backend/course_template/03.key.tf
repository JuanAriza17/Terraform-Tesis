
# ssh-keygen -t rsa -b 2048 -f "example.key"
resource "aws_key_pair" "example-ssh" {
  count = var.instance_count
  key_name   = "${var.server_name}-${count.index}"
  public_key = file("${var.server_name}.key.pub")
    tags = {
    Name = "${var.server_name}-${count.index}-ssh"
    Environment = var.enviroment
    Owner = "ja.arizag@uniandes.edu.co"
    Team = "Security"
    Project = "Tesis"
  }
}