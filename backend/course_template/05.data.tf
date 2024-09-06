data "template_file" "init_script" {
  count = var.instance_count
  template = file("init_script.sh.tpl")

  vars = {
    curso = var.courses[count.index]
  }
}
