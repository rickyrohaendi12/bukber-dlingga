resource "kind_cluster" "this" {
  name           = var.cluster_name
  wait_for_ready = true

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"

    node {
      role = "control-plane"

      # Traefik is exposed as a NodePort (30080); map it to a port on the host.
      extra_port_mappings {
        container_port = 30080
        host_port      = var.http_host_port
        protocol       = "TCP"
      }
    }
  }
}

provider "helm" {
  kubernetes = {
    host                   = kind_cluster.this.endpoint
    cluster_ca_certificate = kind_cluster.this.cluster_ca_certificate
    client_certificate     = kind_cluster.this.client_certificate
    client_key             = kind_cluster.this.client_key
  }
}

resource "helm_release" "traefik" {
  name             = "traefik"
  repository       = "https://traefik.github.io/charts"
  chart            = "traefik"
  version          = var.traefik_chart_version
  namespace        = "traefik"
  create_namespace = true
  wait             = true

  set = [
    { name = "service.type", value = "NodePort" },
    { name = "ports.web.nodePort", value = "30080" },
  ]

  depends_on = [kind_cluster.this]
}

resource "helm_release" "argocd" {
  name             = "argocd"
  repository       = "https://argoproj.github.io/argo-helm"
  chart            = "argo-cd"
  version          = var.argocd_chart_version
  namespace        = "argocd"
  create_namespace = true
  wait             = true

  # Serve plain HTTP so a local port-forward works without TLS warnings.
  set = [
    { name = "configs.params.server.insecure", value = "true" },
  ]

  depends_on = [kind_cluster.this]
}
