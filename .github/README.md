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

## Setup
### Setup Raspberry Pi and circuit
1. Setup your Raspberry Pi. You need to make the bash shell (or other shells) available.
2. Make the circuit refer to the [schematic](#schematic).
2. Setup your Raspberry Pi.

### Setup the system
1. Install [Node.js](https://nodejs.org) by typing following commands on the shell (`$` is not part of the commands).
   ```sh
   $ sudo apt update
   $ sudo apt install nodejs npm
   ```

2. Install Node.js version manager (n).
   ```sh
   $ sudo npm install n -g
   ```

3. Install Node.js v20.
   ```sh
   $ sudo n 20
   ```

From here, there are 2 ways to install.

#### A - The way to install from npm
4. Create a new directory for the system.
   ```sh
   $ mkdir TabletClock
   ```

5. Install the system.
   ```sh
   $ npm install @gakuto1112/tablet-clock
   ```

6. Run the system.
   ```sh
   $ npx tablet-clock
   ```

#### B - The way to install from this repository
4. Clone this repository.
   - If your Raspberry Pi doesn't have [Git](https://git-scm.com/) system, you need to install it.
   ```sh
   $ git clone https://github.com/Gakuto1112/TabletClockServer.git
   ```

5. Install dependencies of the system.
   ```sh
   $ npm install
   ```

6. Prepare source files of the system.
   - You may see some errors when executing the second command, but there is no problem.
   ```sh
   $ cd ./src/npm
   $ ../../node_modules/.bin/tsc
   $ cd ../../
   $ npm run build
   ```

7. Run the system.
   ```sh
   $ npm start
   ```

---

8. After running the system, you can access the tablet clock page on your browser at `http://<system_local_ip>:5000`.

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