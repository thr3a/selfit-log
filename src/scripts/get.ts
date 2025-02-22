import fs from 'node:fs/promises';
import path from 'node:path';

const API_ENDPOINT = 'https://beta-api.atomtech.co.jp/app/v1/service/aps/live_url/refresh';
const DATA_FILE = path.join(process.cwd(), 'data.csv'); //カレントディレクトリのdata.csv

interface ApiResponse {
  ts: number;
  code: string;
  msg: string;
  data: {
    interval_time: number;
    current_person: number;
    is_person_show: number;
    logo_url: string;
    title: string;
    body: string;
    back_ground_url: string;
    aps_live_url: string;
    instance_name: string;
    atom_logo_url: string;
    current_level: number;
    person_limit: number;
  };
}

async function fetchData(): Promise<number> {
  const headers = {
    accept: '*/*',
    'accept-language': 'ja',
    'content-type': 'application/json',
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36'
  };

  const body = JSON.stringify({
    app_ver: 'com.atom.web___1.0.0',
    sc: 'c0842abec54d43aab887463a1f453bec',
    sv: 'cdeefeef9f5e4d0c9600d3bdc44fe48d',
    ts: 1,
    phone_id:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
    instance_id: '1511'
  });

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: headers,
    body: body
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const data: ApiResponse = await response.json();
  return data.data.current_person;
}

async function appendToCSV(currentPerson: number): Promise<void> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  const timestamp = `${year}-${month}-${day} ${hours}:${minutes}`;
  const csvLine = `${timestamp},${currentPerson}\n`;

  try {
    await fs.appendFile(DATA_FILE, csvLine, 'utf8');
    console.log('Data appended to CSV successfully.');
  } catch (error) {
    console.error('Error appending to CSV:', error);
  }
}

async function main() {
  try {
    const currentPerson = await fetchData();
    await appendToCSV(currentPerson);
  } catch (error) {
    console.error('Error in main:', error);
  }
}

main();
// setInterval(main, 15 * 60 * 1000);
