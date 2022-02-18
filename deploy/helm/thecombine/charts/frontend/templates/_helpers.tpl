{{/* Build continer image name */}}
{{- define "frontend.containerImage" -}}
  {{- $registry := "localhost:5000" }}
  {{- if contains "awsEcr" .Values.global.imageRegistry }}
    {{- $registry = printf "%s.dkr.ecr.%s.amazonaws.com" .Values.global.awsAccount .Values.global.awsDefaultRegion }}
  {{- end }}
  {{- printf "%s/%s:%s" $registry .Values.imageName .Values.global.imageTag }}
{{- end }}
