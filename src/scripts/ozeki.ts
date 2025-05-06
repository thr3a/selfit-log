import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';

const BASE_URL = 'https://ozeki.digimu.jp/sel_shop_DB/';

/**
 * サイトからHTMLを取得する関数
 */
async function fetchHtml(): Promise<string> {
  const url = 'https://ozeki.digimu.jp/sel_shop_DB/sel_shop.php?code=0012_0039';
  const res = await fetch(url, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
      'accept-language': 'ja'
    }
  });
  const arrayBuffer = await res.arrayBuffer();
  // Shift_JISデコード
  return iconv.decode(Buffer.from(arrayBuffer), 'shift_jis');
}

/**
 * HTMLからPDFリンクを抽出する関数
 */
function extractPdfLinks(html: string): string[] {
  const $ = cheerio.load(html);
  const pdfLinks: string[] = [];
  $('a').each((_, el) => {
    const href = $(el).attr('href')?.trim();
    if (href?.toLowerCase().endsWith('.pdf')) {
      // 相対パスの場合は絶対URLに変換
      let url = href;
      if (href.startsWith('http')) {
        url = href;
      } else if (href.startsWith('../')) {
        // ../data/... の場合
        url = `https://ozeki.digimu.jp/${href.replace(/^\.\.\//, '')}`;
      } else if (href.startsWith('/')) {
        url = `${BASE_URL.replace(/\/$/, '')}${href}`;
      } else {
        // その他の相対パス
        url = `${BASE_URL}${href}`;
      }
      pdfLinks.push(url);
    }
  });
  return pdfLinks;
}

/**
 * ozeki.txtから既通知URLリストを取得
 */
function getNotifiedSet(): Set<string> {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const TXT_PATH = path.resolve(__dirname, '../../ozeki.txt');
  if (!fs.existsSync(TXT_PATH)) return new Set();
  const txt = fs.readFileSync(TXT_PATH, 'utf8');
  return new Set(
    txt
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l)
  );
}

/**
 * 新規URLをozeki.txtに追記
 */
function appendNewLinks(newLinks: string[]) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const TXT_PATH = path.resolve(__dirname, '../../ozeki.txt');
  fs.appendFileSync(TXT_PATH, newLinks.map((l) => `${l}\n`).join(''), 'utf8');
}

/**
 * LINE通知送信（本番時のみ有効、テスト時はコメントアウト）
 */
async function sendLineNotify(message: string) {
  await fetch('https://api.line.me/v2/bot/message/broadcast', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN || 'dummy'}`
    },
    body: JSON.stringify({
      messages: [
        {
          type: 'text',
          text: message
        }
      ]
    })
  });
}

async function main() {
  const html = await fetchHtml();

  const pdfLinks = extractPdfLinks(html);
  const notified = getNotifiedSet();
  const newLinks = pdfLinks.filter((url) => !notified.has(url));

  if (newLinks.length > 0) {
    const message = `新規チラシが見つかりました\n${newLinks.join('\n\n')}`;
    console.log(message);
    appendNewLinks(newLinks);
    // await sendLineNotify(message); // 開発時はコメントアウト推奨
  } else {
    console.log('新規チラシはありません');
  }
}

main();
