terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 2.13.0"
    }
  }
}

provider "docker" {
  host = "unix:///var/run/docker.sock"
}

resource "docker_image" "rollofarms" {
  name         = "rollofarms"
  keep_locally = true
}

resource "docker_container" "rollofarms" {
  image = docker_image.rollofarms.name
  name  = "rollofarms"
}