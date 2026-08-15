terraform {
  required_version = ">= 1.9.0"

  backend "s3" {
    bucket       = "lurking-walrus-applications-tofu-state-915275040938"
    key          = "github/portfolio-site-static.tfstate"
    region       = "us-west-2"
    encrypt      = true
    use_lockfile = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region              = "us-west-2"
  allowed_account_ids = ["915275040938"]

  default_tags {
    tags = {
      Environment = "production"
      ManagedBy   = "OpenTofu"
      Portfolio   = "Lurking-Walrus"
      Project     = "portfolio-site"
    }
  }
}
