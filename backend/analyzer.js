const axios = require('axios');
const cheerio = require('cheerio');

async function analyzeSEO(url) {
  if (!url.startsWith('http')) url = 'https://' + url;

  const result = {
    url,
    score: 100,
    summary: { passed: 0, warning: 0, critical: 0 },
    audits: []
  };

  try {
    const start = Date.now();
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VN-SEO-Bot/1.0)' },
      timeout: 10000
    });
    const loadTime = Date.now() - start;
    const $ = cheerio.load(data);

    const addAudit = (title, status, msg, fix) => {
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

    // 1. Title
    const title = $('title').text().trim();
    if (!title) {
      addAudit('Thẻ Tiêu đề (Title)', 'critical', 'Website chưa có tiêu đề.', 'Thêm thẻ <title> vào phần <head>.');
    } else if (title.length < 10 || title.length > 60) {
      addAudit('Độ dài Tiêu đề', 'warning', `Tiêu đề dài ${title.length} ký tự (Tốt nhất: 10-60).`, 'Viết lại tiêu đề ngắn gọn, chứa từ khóa chính.');
    } else {
      addAudit('Thẻ Tiêu đề (Title)', 'passed', `Tốt: "${title}"`, '');
    }

    // 2. Meta Description
    const metaDesc = $('meta[name="description"]').attr('content');
    if (!metaDesc) {
      addAudit('Mô tả (Meta Description)', 'critical', 'Google không biết nội dung tóm tắt.', 'Thêm thẻ <meta name="description"> dài khoảng 150 ký tự.');
    } else {
      addAudit('Mô tả (Meta Description)', 'passed', 'Đã có mô tả meta.', '');
    }

    // 3. H1
    const h1 = $('h1');
    if (h1.length === 0) {
      addAudit('Thẻ H1', 'critical', 'Không tìm thấy thẻ H1.', 'Thêm 1 thẻ <h1> chứa nội dung chính nhất.');
    } else if (h1.length > 1) {
      addAudit('Thẻ H1', 'warning', `Có tới ${h1.length} thẻ H1.`, 'Chỉ nên giữ 1 thẻ H1 duy nhất.');
    } else {
      addAudit('Thẻ H1', 'passed', 'Đã có 1 thẻ H1 chuẩn.', '');
    }

    // 4. Images Alt
    const imgs = $('img');
    let missingAlt = 0;
    imgs.each((i, el) => { if (!$(el).attr('alt')) missingAlt++; });
    if (missingAlt > 0) {
      addAudit('Alt ảnh', 'warning', `Có ${missingAlt} ảnh thiếu mô tả.`, 'Thêm thuộc tính alt="mô tả" cho ảnh.');
    } else {
      addAudit('Alt ảnh', 'passed', 'Tất cả ảnh đều có mô tả.', '');
    }

    // 5. Speed
    if (loadTime > 2000) {
      addAudit('Tốc độ', 'warning', `Phản hồi chậm (${loadTime}ms).`, 'Kiểm tra hosting hoặc nén ảnh.');
    } else {
      addAudit('Tốc độ', 'passed', `Tốt (${loadTime}ms).`, '');
    }

    result.score = Math.max(0, result.score);
    return result;

  } catch (e) {
    return { error: true, msg: 'Không thể truy cập website. Kiểm tra lại đường dẫn.' };
  }
}

module.exports = { analyzeSEO };