{{/* Build continer image name */}}
{{- define "backend.containerImage" -}}
  {{- $registry := .Values.global.imageRegistry }}
  {{- if contains "awsEcr" .Values.global.imageRegistry }}
    {{- $registry = printf "%s.dkr.ecr.%s.amazonaws.com" .Values.global.awsAccount .Values.global.awsDefaultRegion }}
  {{- end }}
  {{- printf "%s/%s:%s" $registry .Values.imageName .Values.global.imageTag }}
{{- end }}
