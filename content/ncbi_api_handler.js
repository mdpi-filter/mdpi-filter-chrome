'use strict';

(() => {
  if (window.MDPIFilterNcbiApiHandler) return;

  const ENDPOINT = 'https://www.ncbi.nlm.nih.gov/pmc/utils/idconv/v1.0/';
  const MDPI_DOI_PREFIX = '10.3390/';
  const BATCH_SIZE = 200;
  const MAX_IDS_PER_RUN = 1000;
  const REQUEST_TIMEOUT_MS = 15000;
  const TOOL_NAME = '%%NCBI_TOOL_NAME%%';
  const MAINTAINER_EMAIL = '%%NCBI_API_EMAIL%%';

  function normalizeId(id, idType) {
    if (typeof id !== 'string' && typeof id !== 'number') return null;
    const value = String(id).trim();

    if (idType === 'pmid') {
      return /^\d{1,20}$/.test(value) ? value : null;
    }
    if (idType === 'pmcid') {
      return /^PMC\d{1,20}$/i.test(value) ? value.toUpperCase() : null;
    }
    if (idType === 'doi') {
      const withoutFragment = value.split('#', 1)[0].split('?', 1)[0].trim();
      return /^10\.\d{4,9}\/[A-Z0-9._;()/:+-]+$/i.test(withoutFragment)
        ? withoutFragment.toLowerCase()
        : null;
    }
    return null;
  }

  function candidateRecordIds(record) {
    const versions = Array.isArray(record?.versions) ? record.versions : [];
    const candidates = [record, ...versions];
    const values = new Set();

    for (const candidate of candidates) {
      if (!candidate || typeof candidate !== 'object') continue;
      if (candidate.pmid) values.add(String(candidate.pmid));
      if (candidate.pmcid) values.add(String(candidate.pmcid).toUpperCase());
      if (candidate.doi) values.add(String(candidate.doi).toLowerCase());
    }
    return values;
  }

  function recordIsMdpi(record) {
    const versions = Array.isArray(record?.versions) ? record.versions : [];
    for (const candidate of [record, ...versions]) {
      const doi = typeof candidate?.doi === 'string' ? candidate.doi.toLowerCase() : '';
      if (doi.startsWith(MDPI_DOI_PREFIX)) return true;
    }
    return false;
  }

  function createRequestUrl(batch, idType) {
    const url = new URL(ENDPOINT);
    url.searchParams.set('ids', batch.join(','));
    url.searchParams.set('idtype', idType);
    url.searchParams.set('format', 'json');
    url.searchParams.set('versions', 'no');

    if (!TOOL_NAME.startsWith('%%')) url.searchParams.set('tool', TOOL_NAME);
    if (!MAINTAINER_EMAIL.startsWith('%%')) url.searchParams.set('email', MAINTAINER_EMAIL);
    return url.toString();
  }

  async function fetchBatch(batch, idType) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(createRequestUrl(batch, idType), {
        method: 'GET',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        signal: controller.signal
      });
      if (!response.ok) return null;

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.toLowerCase().includes('application/json')) return null;

      const data = await response.json();
      return Array.isArray(data?.records) ? data.records : [];
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  async function checkNcbiIdsForMdpi(ids, idType, runCache, ncbiApiCache) {
    if (window.MDPIFilterSettings?.ncbiApiEnabled === false) return false;
    if (!(runCache instanceof Map) || !(ncbiApiCache instanceof Map)) return false;
    if (!['pmid', 'pmcid', 'doi'].includes(idType) || !Array.isArray(ids)) return false;

    const normalizedIds = Array.from(new Set(
      ids.slice(0, MAX_IDS_PER_RUN)
        .map(id => normalizeId(id, idType))
        .filter(Boolean)
    ));
    if (!normalizedIds.length) return false;

    const uncachedIds = [];
    for (const id of normalizedIds) {
      if (ncbiApiCache.has(id)) {
        runCache.set(id, ncbiApiCache.get(id) === true);
      } else {
        uncachedIds.push(id);
      }
    }

    for (let offset = 0; offset < uncachedIds.length; offset += BATCH_SIZE) {
      const batch = uncachedIds.slice(offset, offset + BATCH_SIZE);
      const records = await fetchBatch(batch, idType);

      // Network or service failures are not negatively cached, so a later run can retry.
      if (records === null) {
        for (const id of batch) runCache.set(id, false);
        continue;
      }

      const results = new Map(batch.map(id => [id, false]));
      for (const record of records) {
        const isMdpi = recordIsMdpi(record);
        for (const candidateId of candidateRecordIds(record)) {
          if (results.has(candidateId)) results.set(candidateId, isMdpi);
        }
      }

      for (const [id, isMdpi] of results) {
        runCache.set(id, isMdpi);
        ncbiApiCache.set(id, isMdpi);
      }
    }

    return normalizedIds.some(id => runCache.get(id) === true);
  }

  window.MDPIFilterNcbiApiHandler = { checkNcbiIdsForMdpi };
})();
