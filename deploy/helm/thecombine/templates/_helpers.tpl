{{/* Build container image name */}}
{{- define "thecombine.containerImage" -}}
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
