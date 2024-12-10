{{/* Build container image name */}}
{{- define "backend.containerImage" -}}
  {{- if .Values.global.imageRegistry }}
    {{- $registry := .Values.global.imageRegistry }}
    {{- if contains "awsEcr" .Values.global.imageRegistry }}
      {{- $registry = printf "%s.dkr.ecr.%s.amazonaws.com" .Values.global.awsAccount .Values.global.awsDefaultRegion }}
    {{- end }}
    {{- printf "%s/%s:%s" $registry .Values.imageName .Values.global.imageTag }}
  {{- else }}
    {{- printf "%s:%s" .Values.imageName .Values.global.imageTag }}
  {{- end }}
{{- end }}

{{/* Build OTEL service name based on target */}}
{{- define "backend.otelServiceName" -}}
  {{- if eq .Values.global.serverName "thecombine.localhost" }}
    {{- print "dev" }}
  {{- else if eq .Values.global.serverName "qa-kube.thecombine.app" }}
    {{- print "dev" }}
  {{- else if eq .Values.global.serverName "thecombine.app" }}
    {{- print "prod" }}
  {{- else }}
    {{- printf "%s" .Values.global.serverName}}
  {{- end }}
{{- end }}
