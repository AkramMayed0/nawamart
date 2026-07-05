const DEPRECATED_VERSIONS = {
  v1: { deprecated: false, sunsetDate: null },
};

const VERSION_PATTERN = /^v\d+$/;

function apiVersioning(req, res, next) {
  let version = req.headers['accept-version'] || 'v1';

  if (!VERSION_PATTERN.test(version)) {
    const match = req.path.match(/\/api\/(v\d+)\//);
    if (match) {
      version = match[1];
    } else {
      version = 'v1';
    }
  }

  const versionInfo = DEPRECATED_VERSIONS[version];

  if (!versionInfo) {
    return res.status(400).json({
      success: false,
      data: null,
      message: `إصدار API غير معروف: ${version}. الإصدارات المدعومة: ${Object.keys(DEPRECATED_VERSIONS).join(', ')}`,
    });
  }

  if (versionInfo.deprecated) {
    res.set('X-API-Warn', `API version ${version} is deprecated. Sunset date: ${versionInfo.sunsetDate || 'TBD'}`);
    res.set('X-API-Deprecated', 'true');
    res.set('X-API-Sunset', versionInfo.sunsetDate || '');
  }

  res.set('X-API-Version', version);

  req.apiVersion = version;

  if (versionInfo.deprecated && versionInfo.sunsetDate && new Date() > new Date(versionInfo.sunsetDate)) {
    return res.status(410).json({
      success: false,
      data: null,
      message: `إصدار API ${version} لم يعد مدعوماً. يرجى الترقية إلى أحدث إصدار`,
    });
  }

  next();
}

function deprecateVersion(version, sunsetDate) {
  DEPRECATED_VERSIONS[version] = { deprecated: true, sunsetDate };
}

module.exports = { apiVersioning, deprecateVersion };
