{{/* Build container image name */}}
{{- define "create-admin-user.containerImage" }}
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

{{/* Get the Image Pull Policy */}}
{{- define "create-admin-user.imagePullPolicy" }}
  {{- if .Values.global.imagePullPolicy }}
    {{- print .Values.global.imagePullPolicy }}
  {{- else }}
    {{- if eq .Values.global.imageTag "latest" }}
      {{- print "Always" }}
    {{- else }}
      {{- print "IfNotPresent" }}
    {{- end }}
  {{- end }}
{{- end }}
