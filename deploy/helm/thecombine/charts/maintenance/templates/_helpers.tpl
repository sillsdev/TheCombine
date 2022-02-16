{{/* Build continer image name */}}
{{- define "maintenance.containerImage" -}}
  {{- $registry := "localhost:5000" }}
  {{- if contains "awsEcr" .Values.global.imageRegistry }}
    {{- $registry = printf "%s.dkr.ecr.%s.amazonaws.com" .Values.global.awsAccount .Values.global.awsDefaultRegion }}
  {{- end }}
  {{- printf "%s/%s:%s" $registry .Values.imageName .Values.global.imageTag }}
{{- end }}

{{/* Build the backup location string */}}
{{- define "maintenance.backupNameFilter" -}}
  {{- $hostString := replace "." "-" .Values.global.serverName }}
  {{- print "/" $hostString "-" }}
{{- end }}
