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

{{/* Build string of certificates for ConfigMap data */}}
{{- define "cert-proxy-server.cert-proxy-list-config-data" -}}
  {{- $awsCertLoc := .Values.awsS3CertLoc }}
  {{- range .Values.combineCertProxyList -}}
    {{- printf "%s@%s/%s " .hostname .bucket $awsCertLoc -}}
  {{- end }}
{{- end }}
