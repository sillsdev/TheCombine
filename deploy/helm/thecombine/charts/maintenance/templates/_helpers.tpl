{{/*
Expand the name of the chart.
*/}}
{{- define "maintenance.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "maintenance.fullname" -}}
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
{{- define "maintenance.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "maintenance.labels" -}}
helm.sh/chart: {{ include "maintenance.chart" . }}
{{ include "maintenance.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "maintenance.selectorLabels" -}}
app.kubernetes.io/name: {{ include "maintenance.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Build continer image name
*/}}
{{- define "maintenance.containerImage" -}}
{{- $registry := "localhost:5000" }}
{{- if contains "awsEcr" .Values.global.imageRegistry }}
{{- $registry = printf "%s.dkr.ecr.%s.amazonaws.com" .Values.global.awsAccount .Values.global.awsDefaultRegion }}
{{- end }}
{{- printf "%s/%s:%s" $registry .Values.imageName .Values.global.imageTag }}
{{- end }}

{{/*
Build the backup location string
*/}}
{{- define "maintenance.backupNameFilter" -}}
{{- $locationString := replace "." "-" .Values.global.serverName }}
{{- printf "/" $locationString "-" }}
{{- end }}
