// TypeScript 변환: OKE 환경 설정 관리 (기존 Python 코드: config_manager.py)
import * as pulumi from '@pulumi/pulumi';
import * as dotenv from 'dotenv';
import * as oci from '@pulumi/oci';

// const config = new pulumi.Config();
dotenv.config();

// 필수 환경 변수 로드
export const compartmentId = process.env.compartmentId || '';

// VCN 생성
const vcn = new oci.core.Vcn('okeVcn', {
  compartmentId,
  cidrBlock: '10.0.0.0/16',
  displayName: 'oke-vcn',
  dnsLabel: 'okevcn',
});

// 서브넷 생성
const subnet = new oci.core.Subnet(
  'okeSubnet',
  {
    compartmentId: compartmentId,
    vcnId: vcn.id,
    cidrBlock: '10.0.1.0/24',
    displayName: 'oke-subnet',
    dnsLabel: 'okesubnet',
  },
  { ignoreChanges: ['vnicAttachment'] }
); // ✅ VNIC 변경 무시

// NLB 생성 및 Nginx Ingress 추가
// const nlb = new oci.networkloadbalancer.NetworkLoadBalancer('okeNlb', {
//   compartmentId: compartmentId,
//   displayName: 'oke-nlb',
//   subnetId: subnet.id,
//   isPrivate: false,
// });

// 기본 설정
export const availabilityDomain = process.env.availabilityDomain || 'bCac:AP-CHUNCHEON-1-AD-1';
export const vcnId = vcn.id;
export const subnetId = subnet.id;
export const nodeCount = process.env.nodeCount || 2;
export const nodeShape = process.env.nodeShape || 'VM.Standard.A1.Flex';
export const nodeShapeOcpus = process.env.nodeShapeOcpus || 2;
export const nodeShapeMemoryInGbs = process.env.nodeShapeMemoryInGbs || 12;
export const imageId = process.env.imageId || '';
export const kubernetesVersion = process.env.kubernetesVersion || 'v1.31.1';

// 환경 변수 정보 출력
export const envConfig = {
  compartmentId,
  vcnId: vcn.id,
  subnetId: subnet.id,
  availabilityDomain,
  nodeShape,
  nodeCount,
  imageId,
  kubernetesVersion,
//   nlbIp: nlb.assignedPrivateIpv4,
};

console.log('✔ OKE 환경 설정 및 네트워크 자동 생성 완료:', envConfig);
