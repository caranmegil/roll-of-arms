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
}

resource "docker_container" "rollofarms" {
  image = docker_image.rollofarms.latest
  name  = "rollofarms"
  ports {
    internal = 8080
    external = 8080
  }
}