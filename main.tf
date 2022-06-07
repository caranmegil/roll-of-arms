resource "rollofarms_vpc" "primary_vpc" {
  name       = "Primary VPC"
  cidr_block = "0.0.0.0/1"
}

resource "rollofarms_server" "servers" {
  count = 1

  name = "Server ${count.index + 1}"
  type = "t2.micro"
  vpc  = rollofarms_vpc.primary_vpc.name
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