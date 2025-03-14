#!/bin/bash

set -e

NAMESPACE="lm-app"
DEPLOY_TIMEOUT="180s"

echo "Deploying services..."
kubectl apply -f k8s/deployment.yaml &
kubectl apply -f k8s/redis.yaml &
wait

echo "Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=$DEPLOY_TIMEOUT deployment/backend -n $NAMESPACE &
kubectl wait --for=condition=available --timeout=$DEPLOY_TIMEOUT deployment/auth -n $NAMESPACE &
kubectl wait --for=condition=available --timeout=$DEPLOY_TIMEOUT deployment/frontend -n $NAMESPACE &
wait

if [ $? -ne 0 ]; then
  echo "Deployment failed, rolling back..."
  kubectl rollout undo deployment/backend -n $NAMESPACE
  kubectl rollout undo deployment/auth -n $NAMESPACE
  kubectl rollout undo deployment/frontend -n $NAMESPACE
  exit 1
fi

echo "Deployment completed successfully!"