output "server_public_ip" {
  description = "Dirección IP pública de la instancia EC2"
  value = aws_instance.example.*.public_ip
}

output "server_private_ip" {
  description = "Dirección IP privada de la instancia EC2"
  value = aws_instance.example.*.private_ip
}


output "server_id" {
  description = "DNS público de la instancia EC2"
  value = aws_instance.example.*.id
}