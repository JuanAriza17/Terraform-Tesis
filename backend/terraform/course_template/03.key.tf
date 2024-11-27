
# ssh-keygen -t rsa -b 2048 -f "default.key"
resource "aws_key_pair" "example-ssh" {
  count = var.instance_count
  key_name   = "${var.server_name}-${count.index}-${var.flags[count.index]}"
  public_key = file("/keys/${var.server_name}.key.pub")
    tags = {
    Name = "${var.server_name}-${var.flag}-ssh"
    Environment = var.enviroment
    Owner = "ja.arizag@uniandes.edu.co"
    Team = "Security"
    Project = "Tesis"
  }
}