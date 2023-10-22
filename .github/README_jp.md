言語：　[English](./README.md)　|　**日本語**

# TabletClock
使用していないタブレットを便利な置時計にするWebアプリを提供する、Raspberry Pi上で動作させる事を想定したWebサーバーです。

（メイン画像は準備中です。）

## 経緯
机上を整理していたら思ったよりもスペースができ、ここに何かを置こうかと考えたところ、[Google Nest Hub](https://store.google.com/jp/product/nest_hub_2nd_gen)のようなものを置いてみてはどうだろうかと思い、商品ページ等を見て検討していました。しかし、Google Nest Hubの機能に過不足を感じる（部屋の温度と湿度の表示が欲しかった）上、自分でもそれっぽいものを作ってみたいという思いがありました。

そこで、代わりに（タッチ機能付きの）小型ディスプレイを置いてそこに[Raspberry Pi]((https://www.raspberrypi.com/))からインターフェースを表示させるという方法を検討しましたが、時計を表示させるためだけにディスプレイを新たに購入するのは高いと感じていました。それからも色々考えていたところ、ふと、（家では）あまり使用していないタブレットがある事を思い出し、これを有効活用すべく、これを作成する事になりました。

## 機能
### 実装済み
- 現在の日時を表示します。
- センサーから取得した現在の温度と湿度が表示します。
  - 過去24時間分の温度と湿度の変化を折れ線グラフで表示します。
  - 現在の[不快指数](https://ja.wikipedia.org/wiki/不快指数)を表示します。
- ダークモードに対応しています。
  - 現在の明るさに応じてライトモードとダークモードを切り替えます。

### 実装予定
- 現在の天気と天気予報を表示します。
- [Googleカレンダー](https://calendar.google.com)から今後の予定を表示します。
- 背景をお好みの画像に変更できます。

## 必要なもの
- [Raspberry Pi 4](https://www.raspberrypi.org/) x1
  - （過去のRaspberry Piでも動作しますが、新しいものの方がより動作が安定します。）
  - [AHT21B（温湿度センサー）](https://akizukidenshi.com/catalog/g/gK-17394/) x1
  - [MCP3208-CI/P（ADコンバータ）](https://akizukidenshi.com/catalog/g/gI-00238/) x1
  - [CdSセル（明るさセンサー）](https://akizukidenshi.com/catalog/g/gI-00110/) x1
  - [10kΩ抵抗器](https://akizukidenshi.com/catalog/g/gR-25103/) x1
  - 回路基板（[ブレッドボード](https://akizukidenshi.com/catalog/g/gP-05294/)、[ユニバーサル基板](https://akizukidenshi.com/catalog/g/gP-03229/)等）
  - ワイヤー（[ジャンパーワイヤー]((https://akizukidenshi.com/catalog/g/gC-05159/))等）
- 置時計デバイス
  - タブレット端末が推奨です。
  - iPadの場合はSafariを使用して下さい。
  - iPhoneは使用できません（フルスクリーンに移行しません）。

## 回路図
![回路図](./README_images/raspberry_pi_curcuit_diagram.drawio.svg)

## セットアップ
### Raspberry Piと回路のセットアップ
1. Raspberry Piをセットアップします。bashシェル（他のシェルも可）が使えるようにして下さい。
2. [回路図](#回路図)を参考に、回路を組んでください。

### システムのセットアップ
1. 以下のコマンドをシェルに入力して、[Node.js](https://nodejs.org)をインストールします（`$`はコマンドではありません）。
   ```sh
   $ sudo apt update
   $ sudo apt install nodejs npm
   ```

2. Node.jsのバージョン管理システム（n）をインストールします。
   ```sh
   $ sudo npm install n -g
   ```

3. Node.js v20をインストールします。
   ```sh
   $ sudo n 20
   ```

ここからは2通りのセットアップ方法があります。

#### A - npmからインストールする方法
4. システム用の新規ディレクトリを作成します。
   ```sh
   $ mkdir TabletClock
   ```

5. システムをインストールします。
   ```sh
   $ npm install @gakuto1112/tablet-clock
   ```

6. システムを実行します。
   ```sh
   $ npx tablet-clock
   ```

#### B - このレポジトリからインストールする方法
4. このレポジトリをクローンします。
   - お手持ちのRaspberry Piに[Git](https://git-scm.com/)インストールされていない場合は、インストールして下さい。
   ```sh
   $ git clone https://github.com/Gakuto1112/TabletClockServer.git
   ```

5. システムの依存パッケージをインストールします。
   ```sh
   $ npm install
   ```

6. システムのソースファイルを準備します。
   - 2つ目のコマンドを実行する際にエラーが表示される場合がありますが、問題ありません。
   ```sh
   $ cd ./src/npm
   $ ../../node_modules/.bin/tsc
   $ cd ../../
   $ npm run build
   ```

7. システムを実行します。
   ```sh
   $ npm start
   ```

---

8. システム実行後、ブラウザで`http://<システムのローカルip>:5000`からタブレットクロックのページにアクセスできます。

## 設定
[./config/](config)に各種設定ファイルが置いてあります。

### database
データベースに関する設定です。

| 項目 | 説明 | 有効な値 | 初期値 |
| - | - | - | - |
| `mysqlUser` | アプリケーションで使用するユーザ名です。 | `string` | "" |
| `mysqlPassword` | `mysqlUser`のパスワードです。 | `string` | "" |

### sensors
センサーの値取得に関する設定です。

| 項目 | 説明 | 有効な値 | 初期値 |
| - | - | - | - |
| `busNumber` | 使用するI2Cのバス番号です。 | `number` 自然数 | 1 |
| `temperatureHumiditySensorInterval` | 温湿度のデータを更新する頻度です。単位は「秒」です。 | `number` 0以上の整数 | 15 |
| `brightnessSensorInterval` | 明るさのデータを更新する頻度です。単位は「秒」です。 | `number` 0以上の整数 | 5 |
| `darkModeThreshold` | ダークモードに切り替える、明るさの閾値です。値を上げるとより明るい環境でもダークモードに切り替わります。 | `number` 0 - 1 | 0.1 |

### weather_forecast
天気APIから取得する際に必要なパラメータです。

| 項目 | 説明 | 有効な値 | 初期値 |
| - | - | - | - |
| `latitude` | 天気を取得する地点の緯度です。 | `number` -90 - 90 | 35.68 |
| `longitude` | 気を取得する地点の経度です。 | `number` -180 - 180 | 139.77 |

- 初期値の地点は東京駅です。

## 気が向いたらやるコト
- 背景のフォトアルバム化
- 音楽プレイヤー
- アラーム
- （設定するものがあれば）設定画面

## クレジット
- アイコン：ICOOON MONO（[https://icooon-mono.com](https://icooon-mono.com)、一部改変を含みます）
- 天気予報API：Open Meteo（[https://open-meteo.com](https://open-meteo.com)）
- 回路図作成：diagrams.net（[https://www.diagrams.net](https://www.diagrams.net)）

[^1]: 光量の減り具合は使用する端末によって変化します。
[^2]: 今までやった作業を思い出しながら書いたので、もしかしたら抜けている工程があるかもしれません。