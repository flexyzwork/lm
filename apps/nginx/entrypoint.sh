#!/bin/sh

# 기본값 설정
: "${ACTIVE:=green}"

echo "🚀 Nginx 설정을 시작합니다."
echo "✅ ACTIVE: $ACTIVE"

# 최초 ssl 인증서 발급
CERT_PATH="/root/.acme.sh/lm.flexyz.work_ecc/fullchain.cer"

if [ ! -f "$CERT_PATH" ]; then
  echo "🚀 SSL 인증서 발급을 시작합니다."
  # 환경 변수 적용하여 nginx.conf 생성
  envsubst '$ACTIVE' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
  cd /root/
  curl https://get.acme.sh | sh
  source /root/.bashrc
  /root/.acme.sh/acme.sh --set-default-ca --server letsencrypt
  /root/.acme.sh/acme.sh --register-account -m flexyzwork@gmail.com
  /root/.acme.sh/acme.sh --issue -d lm.flexyz.work --nginx
  nginx -s reload
  echo "✅ SSL 인증서 발급 완료."
  /root/.acme.sh/acme.sh --upgrade --auto-upgrade
  /root/.acme.sh/acme.sh --cron --home "/root/.acme.sh" --post-hook "nginx -s reload"
  echo "✅ SSL 인증서 자동 갱신 설정 완료."
else
  echo "✅ SSL 인증서 발급이 이미 완료되었습니다."
  # 환경 변수 적용하여 nginx.conf 생성
  envsubst '$ACTIVE' < /etc/nginx/nginx.conf.template.ssl > /etc/nginx/nginx.conf
fi

# Nginx를 포그라운드에서 실행
echo "🚀 Nginx 최종 실행..."
exec nginx -g 'daemon off;'