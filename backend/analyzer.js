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

  const addAudit = (title, status, msg, fix = '') => {
    result.audits.push({ title, status, msg, fix });

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
        'Tốc độ tải',
        'warning',
        `Trang phản hồi ${loadTime}ms.`,
        'Cân nhắc CDN, nén ảnh.'
      );
    } else {
      addAudit('Tốc độ tải', 'passed', `${loadTime}ms`);
    }

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
