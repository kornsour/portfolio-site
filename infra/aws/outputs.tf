output "bucket_name" {
  description = "Private S3 bucket containing the exported site"
  value       = aws_s3_bucket.site.id
}

output "bucket_regional_domain_name" {
  description = "Regional S3 origin hostname used to verify public access is denied"
  value       = aws_s3_bucket.site.bucket_regional_domain_name
}

output "distribution_arn" {
  description = "CloudFront distribution ARN used by the OAC bucket policy"
  value       = aws_cloudfront_distribution.site.arn
}

output "distribution_domain_name" {
  description = "CloudFront staging hostname"
  value       = aws_cloudfront_distribution.site.domain_name
}

output "distribution_id" {
  description = "CloudFront distribution ID used for invalidations"
  value       = aws_cloudfront_distribution.site.id
}
