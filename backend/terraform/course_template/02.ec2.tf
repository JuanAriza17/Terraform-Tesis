resource "aws_instance" "example" {
  count = var.instance_count
  ami           = var.ami_id
  instance_type = var.instance_type

  user_data = data.template_file.init_script[count.index].rendered
  
  key_name = aws_key_pair.example-ssh[count.index].key_name

  subnet_id              = aws_subnet.public_subnet.id
  associate_public_ip_address = true  # Asegura que la instancia tenga IP pública
  vpc_security_group_ids = [
    aws_security_group.example-sg[count.index].id
  ]

  tags = {
    Name = "${var.server_name}-${count.index}"
    Environment = var.enviroment
    Owner = "ja.arizag@uniandes.edu.co"
    Team = "Security"
    Project = "Tesis"
  }
}