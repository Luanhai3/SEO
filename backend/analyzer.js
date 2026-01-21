const axios = require('axios');
const cheerio = require('cheerio');

async function analyzeSEO(inputUrl) {
  let url = inputUrl.trim();
  if (!url.startsWith('http')) url = 'https://' + url;

  const result = {
    url,
    score: 100,
    summary: { passed: 0, warning: 0, critical: 0 },
    audits: []
  };

  const addAudit = (title, status, msg, fix = '', isPro = false) => {
    result.audits.push({ title, status, msg, fix, isPro });

    if (status === 'critical') {
      result.score -= 15;
      result.summary.critical++;
    } else if (status === 'warning') {
      result.score -= 5;
      result.summary.warning++;
    } else {
      result.summary.passed++;
    }
  };

  try {
    const start = Date.now();

    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8'
      }
    });

    const loadTime = Date.now() - start;
    const $ = cheerio.load(response.data);

    // Title
    const title = $('title').text().trim();
    if (!title) {
      addAudit(
        'Thẻ Title',
        'critical',
        'Trang không có thẻ <title>.',
        'Thêm <title> mô tả nội dung trang.'
      );
    } else if (title.length < 10 || title.length > 60) {
      addAudit(
        'Độ dài Title',
        'warning',
        `Title dài ${title.length} ký tự.`,
        'Nên giữ trong khoảng 10–60 ký tự.'
      );
    } else {
      addAudit('Thẻ Title', 'passed', `"${title}"`);
    }

    // Meta description
    const metaDesc = $('meta[name="description"]').attr('content');
    if (!metaDesc) {
      addAudit(
        'Meta Description',
        'critical',
        'Thiếu mô tả meta.',
        'Thêm <meta name="description"> khoảng 140–160 ký tự.'
      );
    } else {
      addAudit('Meta Description', 'passed', 'Đã tồn tại.');
    }

    // H1
    const h1 = $('h1');
    if (h1.length === 0) {
      addAudit('Thẻ H1', 'critical', 'Không có thẻ H1.');
    } else if (h1.length > 1) {
      addAudit(
        'Thẻ H1',
        'warning',
        `Có ${h1.length} thẻ H1.`,
        'Chỉ nên có 1 H1.'
      );
    } else {
      addAudit('Thẻ H1', 'passed', 'Chuẩn.');
    }

    // Image alt
    const imgs = $('img');
    let missingAlt = 0;
    imgs.each((_, img) => {
      if (!$(img).attr('alt')) missingAlt++;
    });

    if (missingAlt > 0) {
      addAudit(
        'Alt ảnh',
        'warning',
        `${missingAlt} ảnh thiếu alt.`,
        'Thêm alt cho ảnh để tối ưu SEO & accessibility.'
      );
    } else {
      addAudit('Alt ảnh', 'passed', 'Đầy đủ.');
    }

    // Speed
    if (loadTime > 2000) {
      addAudit(
        'Phản hồi Server',
        'warning',
        `Trang phản hồi ${loadTime}ms.`,
        'Cân nhắc CDN, nén ảnh.'
      );
    } else {
      addAudit('Phản hồi Server', 'passed', `${loadTime}ms`);
    }

    // --- NEW CHECKS ---

    // URL Friendly (Basic)
    if (url.includes('_')) {
      addAudit('URL Thân thiện', 'warning', 'URL chứa dấu gạch dưới (_).', 'Nên dùng dấu gạch ngang (-) trong URL.');
    } else if (url.length > 100) {
      addAudit('URL Thân thiện', 'warning', 'URL quá dài.', 'Tối ưu URL ngắn gọn hơn.');
    } else {
      addAudit('URL Thân thiện', 'passed', 'URL chuẩn SEO.');
    }

    // Mobile Viewport (Basic)
    const viewport = $('meta[name="viewport"]').attr('content');
    if (viewport && viewport.includes('width=device-width')) {
      addAudit('Mobile Viewport', 'passed', 'Đã tối ưu hiển thị di động.');
    } else {
      addAudit('Mobile Viewport', 'critical', 'Thiếu thẻ Viewport.', 'Thêm <meta name="viewport" content="width=device-width, initial-scale=1">.');
    }

    // --- PRO FEATURES ---

    // Canonical (Pro)
    const canonical = $('link[rel="canonical"]').attr('href');
    if (canonical) {
      addAudit('Canonical Tag', 'passed', `Đã thiết lập: ${canonical}`, '', true);
    } else {
      addAudit('Canonical Tag', 'warning', 'Thiếu thẻ Canonical.', 'Thêm <link rel="canonical" href="..." /> để tránh trùng lặp nội dung.', true);
    }

    // Heading Structure H2/H3 (Pro)
    const h2 = $('h2').length;
    const h3 = $('h3').length;
    if (h2 > 0 || h3 > 0) {
      addAudit('Cấu trúc Heading', 'passed', `Tìm thấy ${h2} thẻ H2 và ${h3} thẻ H3.`, '', true);
    } else {
      addAudit('Cấu trúc Heading', 'warning', 'Thiếu thẻ H2/H3.', 'Sử dụng H2, H3 để phân chia nội dung bài viết.', true);
    }

    // Robots.txt & Sitemap (Async Pro Checks)
    const domain = new URL(url).origin;
    
    const checkRobots = axios.get(`${domain}/robots.txt`, { timeout: 3000 })
      .then(() => addAudit('Robots.txt', 'passed', 'File robots.txt tồn tại.', '', true))
      .catch(() => addAudit('Robots.txt', 'warning', 'Không tìm thấy robots.txt.', 'Tạo file robots.txt để hướng dẫn bot tìm kiếm.', true));

    const checkSitemap = axios.get(`${domain}/sitemap.xml`, { timeout: 3000 })
      .then(() => addAudit('Sitemap XML', 'passed', 'File sitemap.xml tồn tại.', '', true))
      .catch(() => addAudit('Sitemap XML', 'warning', 'Không tìm thấy sitemap.xml.', 'Tạo sitemap.xml và khai báo trong Google Search Console.', true));

    // Broken Links (Async Pro Check)
    const links = [];
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        try {
          const fullUrl = new URL(href, url).href;
          if (fullUrl.startsWith('http')) links.push(fullUrl);
        } catch (e) {}
      }
    });

    const uniqueLinks = [...new Set(links)].slice(0, 10); // Check max 10 links
    
    const checkLinks = Promise.all(uniqueLinks.map(link => 
      axios.get(link, { timeout: 3000, headers: { 'User-Agent': 'SEO-Audit-Bot' } })
        .then(() => null)
        .catch(err => {
           if (err.response && err.response.status >= 400) return link;
           return null;
        })
    )).then((results) => {
      const brokenLinks = results.filter(l => l);
      if (brokenLinks.length > 0) {
        addAudit('Broken Links', 'warning', `Phát hiện ${brokenLinks.length} link lỗi: ${brokenLinks.join(', ')}`, 'Kiểm tra và sửa các liên kết 404.', true);
      } else {
        addAudit('Broken Links', 'passed', `Đã kiểm tra ${uniqueLinks.length} link mẫu: Không có lỗi.`, '', true);
      }
    });

    // PageSpeed Insights (Async Pro Check)
    const psiKey = process.env.GOOGLE_API_KEY ? `&key=${process.env.GOOGLE_API_KEY}` : '';
    const checkPageSpeed = axios.get(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=PERFORMANCE&strategy=MOBILE${psiKey}`, { timeout: 25000 })
      .then(response => {
        const { lighthouseResult } = response.data;
        const fcp = lighthouseResult.audits['first-contentful-paint'];
        const lcp = lighthouseResult.audits['largest-contentful-paint'];
        const score = lighthouseResult.categories.performance.score * 100;

        addAudit('Performance (Mobile)', score >= 90 ? 'passed' : score >= 50 ? 'warning' : 'critical', `${Math.round(score)}/100`, 'Tối ưu tổng thể website theo đề xuất của Google.', true);
        addAudit('FCP (First Contentful Paint)', fcp.score >= 0.9 ? 'passed' : fcp.score >= 0.5 ? 'warning' : 'critical', fcp.displayValue, 'Giảm thời gian phản hồi máy chủ và loại bỏ chặn hiển thị.', true);
        addAudit('LCP (Largest Contentful Paint)', lcp.score >= 0.9 ? 'passed' : lcp.score >= 0.5 ? 'warning' : 'critical', lcp.displayValue, 'Tối ưu thời gian tải tài nguyên lớn nhất (ảnh/video).', true);
      })
      .catch(err => {
        addAudit('PageSpeed Insights', 'warning', 'Không thể lấy dữ liệu LCP/FCP.', 'Đảm bảo Google Bot có thể truy cập website hoặc thử lại sau.', true);
      });

    await Promise.allSettled([checkRobots, checkSitemap, checkLinks, checkPageSpeed]);

    result.score = Math.max(0, result.score);
    return result;

  } catch (err) {
    return {
      error: true,
      msg: 'Không thể truy cập website hoặc bị chặn.',
      detail: err.message
    };
  }
}

module.exports = { analyzeSEO };
