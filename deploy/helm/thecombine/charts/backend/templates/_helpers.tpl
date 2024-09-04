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

{{/* Build Honeycomb team header for OTEL_EXPORTER_OTLP_HEADERS */}}
{{- define "backend.honeycombTeamHeader" -}}
  {{- printf "x-honeycomb-team=%s" .Values.global.honeycombSecretKey }}
{{- end}}

{{/* Build OTEL service name based on target */}}
{{- define "backend.otelServiceName" -}}
  {{- if eq .Values.global.serverName "thecombine.localhost" }}
    {{- print "dev" }}
  {{- else }}
    {{- printf "%s" .Values.global.serverName}}
  {{- end }}
{{- end }}
