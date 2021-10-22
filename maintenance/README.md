# K8s Worker container for The Combine

This Docker image is created to be deployed in a Kubernetes cluster.

It is designed to be the image that is used in Jobs, CronJobs, or Deployments to perform regular maintenance tasks. The
current supported tasks are:

- Backup _The Combine_ to AWS S3
- Restore _The Combine_ from a previous backup in AWS S3
- Monitor the NUC Certificates created by cert-manager.io and push them to AWS S3 (on a public server)
- Check the current certificate for newer versions on AWS S3 and update them (on the NUCs)
