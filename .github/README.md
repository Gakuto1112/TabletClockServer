Language: 　**English**　|　[日本語](./README_jp.md)

# TabletClock
This web-based system transforms your unused tablet devices into used table clocks.

(The main image is currently preparing. I'm sorry!)

## Background
When I cleaned up on my desk and I found that I made more free space than I expected on it. Then, I thought that I put something like [Google Nest Hub](https://store.google.com/product/nest_hub_2nd_gen) and saw its product page. However, I realized that its functions are not enough for me (I want to know the temperature and humidity in my room), and I came to want to make a similar system by my self.

Instead of Google Nest Hub, I considered that I get a small display device (with touch function) and show the screen from [Raspberry Pi](https://www.raspberrypi.com/). However, I thought that it was expensive to purchase a new display device just to show the clock. After thinking about it a lot, I remembered that I have a tablet device that I don't use very often (at home) and decided to create this system to make it more effective.

## Features
### Already implemented
- Shows current date and time.
- Shows temperature and humidity from sensors.
  - Shows temperature and humidity changes over the last 24 hours with line graph.
  - Shows current discomfort index.
- Supports dark mode.
  - Changes light or dark mode depending on current brightness.

### Plan to be implemented
- Shows current wether and wether forecast.
- Shows upcoming schedules from [Google Calendar](https://calendar.google.com).
- Changes the background into your favorite images.

## Things needed
- [Raspberry Pi 4](https://www.raspberrypi.com/products/raspberry-pi-4-model-b/) x1
  - (Works on older Raspberry Pi, but newer ones are more stable.)
  - [AHT21B (temperature and humidity sensor)](https://akizukidenshi.com/catalog/g/gK-17394/) x1
  - [MCP3208-CI/P (A/D converter)](https://akizukidenshi.com/catalog/g/gI-00238/) x1
  - [CdS cell (brightness sensor)](https://akizukidenshi.com/catalog/g/gI-00110/) x1
  - [10kΩ resistor](https://akizukidenshi.com/catalog/g/gR-25103/) x1
  - Circuit board ([bread board](https://akizukidenshi.com/catalog/g/gP-05294/), [universal circuit board](https://akizukidenshi.com/catalog/g/gP-03229/), etc.)
  - Wire ([jumper wire](https://akizukidenshi.com/catalog/g/gC-05159/), etc.)
- A device to show clock
  - Recommended to use tablet devices.
  - For iPad, use [Safari](https://www.apple.com/safari/).
  - Cannot use iPhone (will not go to full screen).

## Schematic
![schematic](./README_images/raspberry_pi_curcuit_diagram.drawio.svg)

## セットアップ
概要だけ説明します。詳しい手順は省きます[^2]。

1. [回路図](#回路図)を参考に、回路を組んでください。
2. Raspberry Piに[Node.js](https://nodejs.org/)と[MariaDB](https://mariadb.org/)（MySQLサーバー）をインストールします。
   - Node.jsは初期から入っているかと思います。必要に応じてNode.jsのアップデートを行ってください。
3. 必要に応じて、このアプリケーション専用のMySQLユーザを作成して下さい。
   - グローバルに`CREATE`、`tabletclock_temphumid.temp_humid`に`INSERT`と`SELECT`の権限を与えて下さい。
4. このレポジトリをクローンして下さい。
5. 作業ディレクトリをクロックしたレポジトリのルートに設定し、`npm install`を実行して必要なモジュール群をインストールして下さい。
6. 4.でダウンロードしたOAuthクライアントのjsonファイルを`credentials.json`に名前変更して、[./config/google_calendar/](./config/google_calendar/)に置いて下さい。
7. [各種設定ファイル](config/)を編集し、[設定](#設定)を行って下さい。
8. `ts-node TabletClockServer.ts`を実行してアプリケーションを実行して下さい。
   - `ts-node`が使用出来ない場合、`node_modules/.bin/ts-node TabletClockServer.ts`でも実行できます。
9. 置時計にするデバイスで`http://<サーバーのローカルip>:5000`にアクセスすると置時計のUIが表示されます。
   - サーバーと置時計デバイスは同じネットワークに接続して下さい。
   - 置時計デバイスの自動スリープを無効にするのがおすすめです。
10. 左上のフルスクリーンボタンを押してフルスクリーンに切り替えて下さい。
11. サーバーと切断した場合は、右上に再接続ボタンが表示されますので、押してサーバーと再接続して下さい。

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