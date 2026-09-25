import http from 'k6/http';
import { check, fail } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const BASE_URL =
  __ENV.BASE_URL || 'http://host.docker.internal:8080';

const VUS = Number(__ENV.VUS || 1);
const ITERATIONS = Number(__ENV.ITERATIONS || 1);
const FILE_SIZE_KB = Number(__ENV.FILE_SIZE_KB || 100);

const uploadDuration = new Trend(
  'datashare_upload_duration',
  true
);

const downloadDuration = new Trend(
  'datashare_download_duration',
  true
);

const uploadFailures = new Rate(
  'datashare_upload_failed'
);

const downloadFailures = new Rate(
  'datashare_download_failed'
);

const FILE_CONTENT = 'A'.repeat(FILE_SIZE_KB * 1024);

export const options = {
  scenarios: {
    upload_download: {
      executor: 'shared-iterations',
      vus: VUS,
      iterations: ITERATIONS,
      maxDuration: '5m'
    }
  }
};

export function setup() {
  const email =
    `k6-${Date.now()}@datashare.test`;

  const password = 'DataShare123!';

  const jsonHeaders = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const registerResponse = http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify({
      email,
      password
    }),
    jsonHeaders
  );

  if (registerResponse.status !== 201) {
    fail(
      `Inscription impossible : HTTP ${registerResponse.status}`
    );
  }

  const loginResponse = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({
      email,
      password
    }),
    jsonHeaders
  );

  if (loginResponse.status !== 200) {
    fail(
      `Connexion impossible : HTTP ${loginResponse.status}`
    );
  }

  const token = loginResponse.json('token');

  if (!token) {
    fail('JWT absent de la réponse de connexion');
  }

  return { token };
}

export default function (data) {
  const fileName =
    `k6-${__VU}-${__ITER}-${Date.now()}.bin`;

  const uploadResponse = http.post(
    `${BASE_URL}/api/files`,
    {
      file: http.file(
        FILE_CONTENT,
        fileName,
        'application/octet-stream'
      )
    },
    {
      headers: {
        Authorization: `Bearer ${data.token}`
      },
      tags: {
        operation: 'upload'
      }
    }
  );

  uploadDuration.add(
    uploadResponse.timings.duration
  );

  const uploadOk = check(
    uploadResponse,
    {
      'upload HTTP 200/201': response =>
        response.status === 200 ||
        response.status === 201
    }
  );

  uploadFailures.add(!uploadOk);

  if (!uploadOk) {
    return;
  }

  const downloadToken =
    uploadResponse.json('downloadToken');

  const tokenOk = check(
    downloadToken,
    {
      'downloadToken présent': value =>
        typeof value === 'string' &&
        value.length > 0
    }
  );

  if (!tokenOk) {
    downloadFailures.add(true);
    return;
  }

  const downloadResponse = http.get(
    `${BASE_URL}/api/download/${encodeURIComponent(downloadToken)}/file`,
    {
      responseType: 'binary',
      tags: {
        operation: 'download'
      }
    }
  );

  downloadDuration.add(
    downloadResponse.timings.duration
  );

  const downloadOk = check(
    downloadResponse,
    {
      'download HTTP 200': response =>
        response.status === 200,

      'fichier téléchargé non vide': response =>
        response.body &&
        response.body.byteLength > 0
    }
  );

  downloadFailures.add(!downloadOk);
}