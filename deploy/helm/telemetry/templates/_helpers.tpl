{{/* Build Honeycomb team header for OTEL_EXPORTER_OTLP_HEADERS */}}
{{- define "otel.honeycombTeamHeader" -}}
  {{- printf "x-honeycomb-team=%s" .Values.global.honeycombSecretKey }}
{{- end}}
