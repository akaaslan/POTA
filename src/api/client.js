// ─── POTA API Client ──────────────────────────────────────────────────────────
// Backend entegrasyon rehberi:
//   1. BASE_URL'i gerçek API adresiyle güncelleyin
//   2. MOCK_MODE'u false yapın
//   3. Tüm servis metodları otomatik olarak gerçek API'ye yönlenecektir
//   4. Servis metodlarındaki TODO yorumları hangi endpoint'in kullanılacağını gösterir
// ─────────────────────────────────────────────────────────────────────────────

var MOCK_MODE = true; // TODO: Backend hazır olduğunda false yap
var BASE_URL = 'https://api.pota.app/v1'; // TODO: Gerçek API endpoint'i

var _authToken = null;

export function setAuthToken(token) {
  _authToken = token;
}

export function clearAuthToken() {
  _authToken = null;
}

async function _request(method, path, body) {
  var headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (_authToken) {
    headers['Authorization'] = 'Bearer ' + _authToken;
  }
  var config = { method: method, headers: headers };
  if (body !== null && body !== undefined) {
    config.body = JSON.stringify(body);
  }
  var res = await fetch(BASE_URL + path, config);
  if (!res.ok) {
    var errorData = await res.json().catch(function() { return {}; });
    var msg = errorData.message || ('API Hatası ' + res.status + ': ' + path);
    var err = new Error(msg);
    err.status = res.status;
    err.data = errorData;
    throw err;
  }
  return res.json();
}

export var api = {
  isMock: function() { return MOCK_MODE; },
  get: function(path) { return _request('GET', path, null); },
  post: function(path, body) { return _request('POST', path, body); },
  put: function(path, body) { return _request('PUT', path, body); },
  patch: function(path, body) { return _request('PATCH', path, body); },
  del: function(path) { return _request('DELETE', path, null); },
};
