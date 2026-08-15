variable "aliases" {
  description = "Production domain aliases. Keep empty for the CloudFront staging deployment."
  type        = list(string)
  default     = []
}

variable "acm_certificate_arn" {
  description = "Validated us-east-1 ACM certificate for aliases. Keep null for staging."
  type        = string
  default     = null
  nullable    = true
}

check "custom_domain_certificate" {
  assert {
    condition     = (length(var.aliases) == 0) == (var.acm_certificate_arn == null)
    error_message = "aliases and acm_certificate_arn must be configured together."
  }
}
