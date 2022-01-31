{{/*
Expand the name of the chart.
*/}}
{{- define "cert-proxy-client.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "cert-proxy-client.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "cert-proxy-client.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "cert-proxy-client.labels" -}}
helm.sh/chart: {{ include "cert-proxy-client.chart" . }}
{{ include "cert-proxy-client.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "cert-proxy-client.selectorLabels" -}}
app.kubernetes.io/name: {{ include "cert-proxy-client.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Build continer image name
*/}}
{{- define "cert-proxy-client.containerImage" -}}
{{- $registry := "localhost:5000" }}
{{- if contains "awsEcr" .Values.global.imageRegistry }}
{{- $registry = printf "%s.dkr.ecr.%s.amazonaws.com" .Values.global.awsAccount .Values.global.awsDefaultRegion }}
{{- end }}
{{- printf "%s/%s:%s" $registry .Values.imageName .Values.global.imageTag }}
{{- end }}

{{/*
Build the SSL Certificate secret name
*/}}
{{- define "cert-proxy-client.certSecretName" -}}
{{- $locationString := replace "." "-" .Values.global.serverName }}
{{- print $locationString "-tls" }}
{{- end }}
