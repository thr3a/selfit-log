# ts実行

```bash
node --import tsx --env-file .env --watch ./src/scripts/hello.ts
```

特定のサイトを定期的に取得し、新規のチラシがあればそのURLをLINEAPIで送信するスクリプトを実装したい

具体的には
- nodeの純正fetchでhttps://ozeki.digimu.jp/sel_shop_DB/sel_shop.php?code=0012_0039へアクセスする
'user-agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36'
accept-language': 'ja',
取得したHTML例を./example.htmlに保存したので確認すること。
サイトはutf8ではなくShift_JISなので注意すること。example.htmlもShift_JISで保存してある。
その中から末尾が.pdfで終わるリンクを抽出する
LINEのAPIを使ってbroadcast送信する　curlによる送信例は以下でこれをnodeのfetchで叩く
messagesに複数入れられるが１つで　複数一気にある場合は改行で以下のように
ただこのままだと毎回送ってしまうので送ったPDFURLはozeki.txtに追記して
以降ozeki.txtを取得してそのURLにないものだけ通知
LINEbotのレート厳しいのでない場合は通知しない

メッセージ例

```
新規チラシが見つかりました
https://ozeki.digimu.jp/data/00022591/img/thum/a1.pdf
https://ozeki.digimu.jp/data/00022568/img/thum/a4.pdf
```

curl例

```bash
SECRET_TOKEN='gcdrW5iQUM6zkUBWhrw7NtKTjIVue/EdyZ5FQyADJhPGZHa2UchhIqOVnW14yezrBqL08UmnC8rLQbuxZYnLrgoU2Btpa3lE2X3/YWk5TQ7WzG3U+YstSHlw4HH2MKHYUlfrYwo5vR/WzzfAlrpH7gdB04t89/1O/w1cDnyilFU='
curl -v -X POST https://api.line.me/v2/bot/message/broadcast \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer {SECRET_TOKEN}' \
-d '{
    "messages":[
        {
            "type":"text",
            "text":"hello world"
        }
    ]
}'
```
