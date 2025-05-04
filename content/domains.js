// content/domains.js
// Define the four search‐site configurations
window.MDPIFilterDomains = {

  // Google Web
  googleWeb: {
    host: 'www.google.com',
    path: /^\/search/,
    container: 'div.g',
    linkSelector: 'a[href*="mdpi.com"]'
  },

  // Google Scholar
  scholar: {
    host: 'scholar.google.com',
    container: 'div.gs_r',
    linkSelector: 'a[href*="mdpi.com"]'
  },

  // PubMed (no outbound links, only DOI in text)
  pubmed: {
    host: 'pubmed.ncbi.nlm.nih.gov',
    // Match both article and li elements with the full-docsum class
    itemSelector: 'article.full-docsum, li.full-docsum',
    doiPattern: '10.3390'
  },

  // Europe PMC (matches any subdomain of europepmc.org)
  europepmc: {
    hostRegex: /europepmc\.org$/,
    itemSelector: 'li.separated-list-item',
    htmlContains: '<b>MDPI</b>'
  }
};
