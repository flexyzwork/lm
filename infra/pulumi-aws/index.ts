import * as aws from '@pulumi/aws';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// .env 파일 로드
dotenv.config();

// 환경 변수 설정
const instanceType = process.env.AWS_INSTANCE_TYPE || 't2.micro';
const sshKeyName = process.env.AWS_SSH_KEY_NAME || 'default-keypair';
const sshPublicKey = process.env.AWS_PUBLIC_SSH_KEY || '';
const gitRepoUrl = process.env.GIT_REPO_URL || 'https://github.com/flexyzwork/lm-turbo.git';
const branch = process.env.GIT_BRANCH || 'dev';
const dockerUsername = process.env.DOCKER_USERNAME || '';
const dockerPassword = process.env.DOCKER_PASSWORD || '';
const existingEipAllocId = process.env.EXISTING_EIP_ALLOC_ID || '';

// `.env` 파일 로드
const serverEnvPath = process.env.SERVER_ENV_PATH || '';
const serverEnv = serverEnvPath ? fs.readFileSync(serverEnvPath, 'utf-8') : '';
const clientEnvPath = process.env.CLIENT_ENV_PATH || '';
const clientEnv = clientEnvPath ? fs.readFileSync(clientEnvPath, 'utf-8') : '';

// 최신 Ubuntu AMI 가져오기
const ubuntuAmi = aws.ec2.getAmi({
  mostRecent: true,
  owners: ['099720109477'],
  filters: [
    {
      name: 'name',
      values: ['ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*'],
    },
  ],
});

// 기본 VPC 가져오기
const vpc = aws.ec2.getVpc({ default: true });

// 보안 그룹 생성 (SSH, HTTP, HTTPS 허용)
const securityGroup = new aws.ec2.SecurityGroup('ec2-security-group', {
  vpcId: vpc.then((v) => v.id),
  ingress: [
    { protocol: 'tcp', fromPort: 22, toPort: 22, cidrBlocks: ['0.0.0.0/0'] },
    { protocol: 'tcp', fromPort: 80, toPort: 80, cidrBlocks: ['0.0.0.0/0'] },
    { protocol: 'tcp', fromPort: 443, toPort: 443, cidrBlocks: ['0.0.0.0/0'] },
  ],
  egress: [{ protocol: '-1', fromPort: 0, toPort: 0, cidrBlocks: ['0.0.0.0/0'] }],
});

// SSH 키 페어 설정
const keyPair = new aws.ec2.KeyPair(sshKeyName, {
  publicKey: sshPublicKey,
});

// EC2 인스턴스 생성 (블루-그린 배포 고려)
const instance = new aws.ec2.Instance('app-server', {
  ami: ubuntuAmi.then((ami) => ami.id),
  instanceType: instanceType,
  vpcSecurityGroupIds: [securityGroup.id],
  keyName: keyPair.keyName,
  tags: { Name: 'Pulumi-App-Server' },
  userData: `#!/bin/bash
    LOGFILE=/home/ubuntu/user-data.log
    exec > >(tee -a $LOGFILE) 2>&1
    
    echo "==== START userData SCRIPT ===="
    date
    
    sudo apt update -y
    sudo apt upgrade -y
    sudo apt install -y git curl unzip docker.io unzip tar
    
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.33.1/docker-compose-linux-x86_64" -o /usr/bin/docker-compose
    sudo chmod +x /usr/bin/docker-compose

    echo "Docker 설치 완료"

    # Docker 실행 & 자동 시작 설정
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker ubuntu
    sudo chmod 666 /var/run/docker.sock

    echo "Docker 설정 완료"

    # 방화벽 설정 (UFW)
    sudo ufw --force enable
    sudo ufw reload
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw reload

    echo "방화벽 설정 완료"

    # Docker 로그인 (ubuntu 사용자 환경에서 실행)
    su - ubuntu -c "echo '${dockerPassword}' | docker login -u '${dockerUsername}' --password-stdin kix.ocir.io"

    echo "Docker 레지스트리 로그인 완료"

    # 로그인 정보가 저장되었는지 확인
    ls -la /home/ubuntu/.docker
    cat /home/ubuntu/.docker/config.json

    # 스왑 파일 생성
    sudo fallocate -l 1G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

    echo "스왑 파일 생성 완료"

    # 애플리케이션 코드 가져오기
    cd /home/ubuntu
    if [ ! -d "app" ]; then
        git clone -b ${branch} ${gitRepoUrl} app
    else
        cd app && sudo git pull
    fi

    echo "✅ 애플리케이션 코드 클론 완료"

    echo "${serverEnv}" > /home/ubuntu/app/apps/server/.env
    echo "${clientEnv}" > /home/ubuntu/app/apps/client/.env

    echo "✅ .env 파일 생성 완료"

    sudo chown -R ubuntu:ubuntu /home/ubuntu/app
    echo "✅ 애플리케이션 코드 권한 변경 완료"

    mkdir -pv .acme.sh
    echo "✅ .acme.sh 디렉토리 생성 완료"

    echo "🚀 배포 완료!"
  `,
});

// 탄력적 IP를 EC2 인스턴스에 연결
new aws.ec2.EipAssociation('elastic-ip-association', {
  instanceId: instance.id,
  allocationId: existingEipAllocId,
});

export const instancePublicIp = instance.publicIp;
export const instancePublicDns = instance.publicDns;
