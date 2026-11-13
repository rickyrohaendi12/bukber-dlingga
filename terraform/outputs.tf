output "kubeconfig_path" {
  description = "Path to the kubeconfig for the kind cluster (contains credentials, never commit)."
  value       = kind_cluster.this.kubeconfig_path
}

output "app_url" {
  description = "URL of the dev app once Argo CD has synced it."
  value       = "http://dlingga.localtest.me:${var.http_host_port}"
}
