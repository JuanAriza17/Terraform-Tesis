data "template_file" "init_script" {
  template = file("init_script.sh.tpl")

  vars = {
    curso = var.curso
  }
}
