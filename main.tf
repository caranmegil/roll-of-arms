terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 2.13.0"
    }
  }
}

provider "docker" {}

resource "docker_image" "roll-of-arms" {
  name         = "roll-of-arms_roll-of-arms"
  keep_locally = true
}

resource "docker_container" "roll-of-arms" {
  image = docker_image.roll-of-arms.latest
  name  = "roll-of-arms"
  ports {
    internal = 8080
    external = 8080
  }
}