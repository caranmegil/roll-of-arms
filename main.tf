terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 2.13.0"
    }
  }
}

provider "docker" {}

resource "docker_image" "rollofarms" {
  name         = "rollofarms"
  keep_locally = true
  state        = "present"
}

resource "docker_container" "rollofarms" {
  image = docker_image.rollofarms.name
  name  = "rollofarms"
}