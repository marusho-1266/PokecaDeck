#!/bin/bash
# Chromeをインストールしてからサーバーを起動
echo "Chromeのインストールを確認中..."
npx puppeteer browsers install chrome || echo "Chromeのインストールに失敗しましたが、続行します..."
echo "サーバーを起動します..."
node server.js
