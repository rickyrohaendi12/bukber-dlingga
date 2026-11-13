variable "cluster_name" {
  description = "Name of the local kind cluster."
  type        = string
  default     = "bukber-dlingga"
}

variable "http_host_port" {
  description = "Host port mapped to Traefik (HTTP). Avoids privileged ports on Windows."
  type        = number
  default     = 8081
}

# Pin these after the first apply (see `helm list -A`) for reproducible builds.
variable "traefik_chart_version" {
  description = "Traefik Helm chart version (null = latest)."
  type        = string
  default     = null
}

variable "argocd_chart_version" {
  description = "Argo CD Helm chart version (null = latest)."
  type        = string
  default     = null
}
