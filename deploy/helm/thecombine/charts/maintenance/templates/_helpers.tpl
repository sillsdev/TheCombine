{{/* Build continer image name */}}
{{- define "maintenance.containerImage" -}}
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

{{/* Build the backup location string */}}
{{- define "maintenance.backupNameFilter" -}}
  {{- $hostString := replace "." "-" .Values.global.serverName }}
  {{- print "/" $hostString "-" }}
{{- end }}
