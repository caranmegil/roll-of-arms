resource "null_resource" "example" {
  triggers = {
    value = "A example resource that does nothing!"
  }
}

terraform {

  backend "remote" {
    organization = "Nerderium"

    workspaces {
      name = "rollofarms"
    }
  }

  required_version = ">= 0.13.0"
}