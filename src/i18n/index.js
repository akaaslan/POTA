import strings from './tr.json';

/**
 * Translate a dot-notation key, optionally interpolating {{param}} placeholders.
 *
 * Examples:
 *   t('common.loading')                        => "YÜKLENİYOR"
 *   t('matchDetail.fee_alert_msg', { fee: 30 }) => "30 ₺ katılım ücreti ..."
 *   t('profileEdit.positions')                 => ["Oyun Kurucu", ...]
 */
export function t(key, params) {
  var parts = key.split('.');
  var value = strings;
  for (var i = 0; i < parts.length; i++) {
    if (value == null) return key;
    value = value[parts[i]];
  }
  if (value == null) return key;
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return key;
  if (params) {
    var result = value;
    Object.keys(params).forEach(function(k) {
      result = result.split('{{' + k + '}}').join(String(params[k]));
    });
    return result;
  }
  return value;
}

export default strings;
