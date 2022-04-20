{{/* Build container image name */}}
{{- define "cert-proxy-server.containerImage" -}}
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
{{- define "cert-proxy-server.imagePullPolicy" }}
  {{- if .Values.imagePullPolicy }}
    {{- print .Values.imagePullPolicy }}
  {{- else }}
    {{- if eq .Values.global.imageTag "latest" }}
      {{- print "Always" }}
    {{- else }}
      {{- print "IfNotPresent" }}
    {{- end }}
  {{- end }}
{{- end }}

{{/* Trim brackets from beginning/end of string */}}
{{- define "cert-proxy-server.toString" }}
  {{- $returnString := "" }}
  {{- range . }}
    {{- $returnString = printf "%s %s" $returnString . }}
  {{- end }}
  {{- $returnString = trim $returnString }}
  {{- printf "\"%s\"" $returnString }}
{{- end }}