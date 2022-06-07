# The configuration for the `remote` backend.
terraform {
    resource "roll_of_arms_vpc" "primary_vpc" {
        name       = "Primary VPC"
        cidr_block = "0.0.0.0/1"
    }

    resource "roll_of_arms_server" "servers" {
        count = 1

        name = "Server ${count.index + 1}"
        type = "t2.micro"
        vpc  = roll_of_arms_vpc.primary_vpc.name
    }

    backend "remote" {
        organization = "Nerderium"

        workspaces {
            name = "roll-of-arms"
        }
    }

    required_version = ">= 0.13.0"
}