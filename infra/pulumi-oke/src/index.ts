// TypeScript 변환: OKE 클러스터 설정 (기존 Python 코드: cluster/oke.py)
import * as pulumi from '@pulumi/pulumi';
import * as oci from '@pulumi/oci';
import * as k8s from '@pulumi/kubernetes';
import {
  compartmentId,
  vcnId,
  subnetId,
  availabilityDomain,
  nodeShape,
  nodeShapeOcpus,
  nodeShapeMemoryInGbs,
  nodeCount,
  imageId,
  kubernetesVersion,
} from './config';

// OKE 클러스터 생성
const okeCluster = new oci.containerengine.Cluster('okeCluster', {
  compartmentId: compartmentId,
  vcnId: vcnId,
  kubernetesVersion: kubernetesVersion,
  name: 'oke-cluster',
  endpointConfig: {
    isPublicIpEnabled: false,
    subnetId: subnetId,
  },
  options: {
    serviceLbSubnetIds: [subnetId],
  },
});

// Worker Node를 위한 Subnet 생성
const workerSubnet = new oci.core.Subnet('workerSubnet', {
  compartmentId: compartmentId,
  vcnId: vcnId,
  cidrBlock: '10.0.2.0/24', // 기존 서브넷과 다른 범위 설정
  displayName: 'worker-subnet',
  prohibitPublicIpOnVnic: true, // Node Pool은 공인 IP를 가질 필요 없음
});

// Node Pool 추가
const nodePool = new oci.containerengine.NodePool('okeNodePool', {
  clusterId: okeCluster.id,
  compartmentId: compartmentId,
  name: 'oke-node-pool',
  nodeShape: nodeShape,
  nodeShapeConfig: {
    ocpus: Number(nodeShapeOcpus),
    memoryInGbs: Number(nodeShapeMemoryInGbs),
  },
  nodeConfigDetails: {
    placementConfigs: [
      {
        availabilityDomain: availabilityDomain, // 필요에 따라 동적으로 설정 가능
        subnetId: workerSubnet.id,
      },
    ],
    size: Number(nodeCount), // 원하는 노드 개수
  },
  nodeSourceDetails: {
    sourceType: 'image',
    imageId: imageId,
  },
  kubernetesVersion: kubernetesVersion,
});

export const clusterId = okeCluster.id;
export const nodePoolId = nodePool.id;

// Kubernetes Provider 설정
// const k8sProvider = new k8s.Provider('oke-k8s-provider', {
//   kubeconfig: process.env.KUBECONFIG_PATH,
// });

// // Kubeconfig 자동 생성 후 Helm Chart 배포
// nodePool.id.apply(async (id) => {
//   const { exec } = require('child_process');
//   const kubeconfigCmd = `oci ce cluster create-kubeconfig --cluster-id ${okeCluster.id} --file kubeconfig --region ap-chuncheon-1 --token-version 2.0.0`;

//   exec(kubeconfigCmd, (error: any, stdout: any, stderr: any) => {
//     if (error) {
//       console.error(`Kubeconfig 생성 실패: ${error.message}`);
//       return;
//     }
//     console.log(`Kubeconfig 생성 완료: ${stdout}`);

//     // Helm Chart로 Nginx Ingress 배포
//     new k8s.helm.v3.Chart(
//       'ingress-nginx',
//       {
//         chart: 'ingress-nginx',
//         version: '4.12.0',
//         namespace: 'ingress-nginx',
//         fetchOpts: {
//           repo: 'https://kubernetes.github.io/ingress-nginx',
//         },
//         values: {
//           controller: {
//             service: {
//               loadBalancerIP: '158.180.69.107', // 지정된 IP 추가
//               annotations: {
//                 'oci.oraclecloud.com/load-balancer-type': 'nlb',
//                 'oci-network-load-balancer.oraclecloud.com/security-list-management-mode': 'All',
//                 'oci.oraclecloud.com/health-checks-protocol': 'TCP',
//                 'oci.oraclecloud.com/health-checks-port': '80',
//                 'oci.oraclecloud.com/health-checks-path': '/healthz',
//                 'oci.oraclecloud.com/health-checks-interval-seconds': '10',
//                 'oci.oraclecloud.com/health-checks-timeout-seconds': '3',
//                 'oci.oraclecloud.com/health-checks-retries': '3',
//                 'oci.oraclecloud.com/health-checks-passes': '3',
//                 'oci.oraclecloud.com/health-checks-tls-skip-verify': 'true',
//                 'oci.oraclecloud.com/health-checks-tls-server-name': 'localhost',
//               },
//               externalTrafficPolicy: 'Local',
//             },
//           },
//         },
//       },
//       { provider: k8sProvider }
//     );
//   });
// });
