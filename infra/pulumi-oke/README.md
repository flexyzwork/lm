# OKE 인프라 자동 구축 (TypeScript + Pulumi)

이 프로젝트는 **Oracle Kubernetes Engine (OKE)** 인프라를 **Pulumi TypeScript**를 사용하여 자동으로 구축하는 스크립트입니다. 
**Compartment ID**만 입력하면 자동으로 VCN, Subnet, OKE 클러스터, Node Pool을 생성합니다.
R
## 🛠️ **설치 및 실행 방법**

### 1️⃣ **Pulumi 설치**
Pulumi가 설치되어 있지 않다면 다음 명령어로 설치하세요.
```sh
curl -fsSL https://get.pulumi.com | sh
```
또는 Node 패키지로 설치 가능:
```sh
npm install -g @pulumi/pulumi
```

### 2️⃣ **프로젝트 설정**
```sh
pnpm install
```
환경 설정 파일 `.env`를 생성합니다.
```sh
cp .env.example .env
```

### 3️⃣ **Pulumi 환경 변수 설정**
OCI 자격 증명을 Pulumi 환경 변수로 설정해야 합니다.
```sh
export PULUMI_CONFIG_PASSPHRASE=""  # (선택 사항) 비밀번호 설정 없음
export OCI_CONFIG_FILE=~/.oci/config  # OCI 인증 정보 파일 경로
export KUBECONFIG_PATH="$HOME/.kube/config"
```

### 4️⃣ **OKE 인프라 구축**
```sh
pnpm infra:up
```
이 명령어를 실행하면 **VCN, 서브넷, OKE 클러스터, Node Pool**이 자동 생성됩니다.

## 📂 **프로젝트 구조**
```bash
oke-infra/
├── src/
│   ├── config.ts          # 환경 변수 및 네트워크 자동 생성
│   ├── cluster.ts         # OKE 클러스터 생성
│   ├── nodePool.ts        # Node Pool 설정
│   ├── index.ts           # 실행 엔트리 포인트
│
├── package.json           # 프로젝트 설정
├── pulumi.yaml            # Pulumi 프로젝트 설정
├── tsconfig.json          # TypeScript 설정
└── .gitignore             # Git 예외 파일 목록
```

## ✅ **OKE 인프라 자동 생성 항목**
- **VCN (Virtual Cloud Network)** → 자동 생성됨
- **서브넷 (Subnet)** → 자동 생성됨
- **OKE 클러스터 (Kubernetes Cluster)** → 자동 생성됨
- **Node Pool** → 자동 생성됨

## 🔥 **환경 변수 설정 (.env)**
Pulumi에서 OCI 설정을 불러오기 위해 `.env` 파일을 설정해야 합니다.
```ini
COMPARTMENT_ID=ocid1.compartment.oc1..xxxxx
AVAILABILITY_DOMAIN=Uocm:PHX-AD-1
NODE_SHAPE=VM.Standard.E3.Flex
NODE_COUNT=3
KUBERNETES_VERSION=v1.26.2
```

## 🛠️ **Pulumi 명령어 정리**
- **인프라 배포:**
  ```sh
  pnpm infra:up
  ```
- **인프라 삭제:**
  ```sh
  pnpm infra:destroy
  ```
- **Pulumi 상태 확인:**
  ```sh
  pulumi stack output
  ```

## 🎯 **결론**
이 프로젝트는 **OKE 인프라를 TypeScript + Pulumi로 자동 구축**할 수 있도록 설계되었습니다. 
**VCN, 서브넷, OKE 클러스터, Node Pool을 한 번에 생성**하며, 필요 시 Pulumi를 통해 인프라 상태를 쉽게 관리할 수 있습니다.

🚀 **기여 및 문의:** 개선 제안이나 피드백이 있다면 PR 또는 이슈를 등록해주세요!
