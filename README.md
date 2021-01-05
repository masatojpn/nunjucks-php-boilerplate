# nunjucks-php-boilerplate


## プロジェクトのセットアップ

**docker**<br>
```
$ docker-compose build
```

**nodeパッケージインストール**<br>
```
$ npm install
```

## 開発時の手順

**Dockerコンテナーを起動**<br>
```
$ docker-compose up -d
```

**Gulpタスクの実行**<br>
```
$ npx gulp
```

**ブラウザで確認**<br>
```
localhost:3000
```

## コーディングチェック
開発時のコーディングチェックには `_test.scss` を読み込みます。

## フォルダ構成

```
root/
  ├ html/ 納品フォルダ
  │ src/ 開発フォルダ
  │  ├ assets/
  │  │  ├ font/ フォントファイル用
  │  │  ├ css/ Scssファイル用
  │  │  ├ images/ 画像ファイル用
  │  │  └ js/ スクリプトファイル用
  │  └ template/
  │     ├ data/ 各ページの設定（json）
  │     ├ layout/ レイアウト用
  │     ├ page/ ページ別
  │     └ partial/ コンポーネント
  ├ nginx/
  └ php/
```

## Gulpタスク
**nunjucks**<br>
開発フォルダ内の `.njk` ファイルから `.html` ファイルを生成します。

**php**<br>
開発フォルダ内の `_php.njk` ファイルから `.php` ファイルを生成します。

**scss**<br>
開発フォルダ内の `.scss` ファイルから `.css` `.min.css` を生成します。
ファイル名の頭に `_(アンダースコア)` がついたファイルはコンパイルしません。

**js**<br>
開発フォルダ内の `.es6` ファイルから `.min.js` を生成します。
ファイル名の頭に `_(アンダースコア)` がついたファイルはコンパイルしません。

**images**<br>
開発フォルダ内の画像ファイルを圧縮し、納品フォルダにコピーします。

**serve**<br>
ローカルサーバーを起動します。ローカルサーバーの設定ファイルは `/conf.js` に記載します。

**reload**<br>
ブラウザのオートリロードを実行します。

**filewatch**<br>
ファイルの変更を監視します。変更があった際にGulpタスクを再実行します。
