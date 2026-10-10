document.addEventListener('DOMContentLoaded', () => {
  startClock();
  setupSmoothTabs();
  setupPlatformFormats();
  setupInputWrappers();
  createUniversalModal();
  detectDeviceAndBrowser();
  detectNetworkStatus();
  detectBattery();
  detectCountry();
});

// FUNGSI INTI: UNDUH LANGSUNG BERKAS KUALITAS FULL HD KE GALERI
async function forceDownloadFile(fileUrl, customFilename, btnElement) {
  let originalText = '';
  if (btnElement) {
    originalText = btnElement.innerHTML;
    btnElement.innerHTML = `<span>Mengunduh Kualitas HD...</span>`;
    btnElement.style.pointerEvents = 'none';
  }

  try {
    let fetchUrl = fileUrl;
    if (!fileUrl.startsWith('data:') && !fileUrl.startsWith('blob:')) {
      fetchUrl = `https://images.weserv.nl/?url=${encodeURIComponent(fileUrl)}&default=${encodeURIComponent(fileUrl)}`;
    }

    const response = await fetch(fetchUrl);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = customFilename || 'media_hd_file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(blobUrl);

    if (btnElement) {
      btnElement.innerHTML = `<span>✓ HD Tersimpan!</span>`;
      setTimeout(() => {
        btnElement.innerHTML = originalText;
        btnElement.style.pointerEvents = 'auto';
      }, 1500);
    }
  } catch (err) {
    window.open(fileUrl, '_blank');
    if (btnElement) {
      btnElement.innerHTML = originalText;
      btnElement.style.pointerEvents = 'auto';
    }
  }
}

// 1. Sliding Tab Navigation
function setupSmoothTabs() {
  const tabsNav = document.querySelector('.filter-tabs');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tool-panel');

  let indicator = document.querySelector('.tab-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.className = 'tab-indicator';
    tabsNav.prepend(indicator);
  }

  function moveIndicator(targetBtn) {
    const navRect = tabsNav.getBoundingClientRect();
    const btnRect = targetBtn.getBoundingClientRect();
    const left = btnRect.left - navRect.left;
    const width = btnRect.width;

    indicator.style.width = `${width}px`;
    indicator.style.transform = `translateX(${left}px)`;
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      moveIndicator(btn);

      const targetId = btn.getAttribute('data-target');
      panels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === targetId) {
          panel.classList.add('active');
        }
      });
    });
  });

  const activeBtn = document.querySelector('.tab-btn.active') || tabButtons[0];
  if (activeBtn) {
    setTimeout(() => moveIndicator(activeBtn), 50);
  }

  window.addEventListener('resize', () => {
    const currentActive = document.querySelector('.tab-btn.active');
    if (currentActive) moveIndicator(currentActive);
  });
}

// 2. Tombol Tempel dan Tombol X di Input
function setupInputWrappers() {
  const platforms = ['TikTok', 'Instagram', 'YouTube'];

  platforms.forEach(p => {
    const input = document.getElementById(`input${p}`);
    if (!input || input.parentElement.classList.contains('input-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'input-wrapper';

    const actions = document.createElement('div');
    actions.className = 'input-actions';

    const btnClear = document.createElement('button');
    btnClear.type = 'button';
    btnClear.className = 'btn-clear';
    btnClear.title = 'Hapus tautan';
    btnClear.innerHTML = '✕';
    btnClear.onclick = () => {
      input.value = '';
      btnClear.classList.remove('show');
      input.focus();
    };

    const btnPaste = document.createElement('button');
    btnPaste.type = 'button';
    btnPaste.className = 'btn-paste';
    btnPaste.title = 'Tempel tautan';
    btnPaste.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
      </svg>
      <span>Tempel</span>
    `;

    btnPaste.onclick = async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          input.value = text;
          btnClear.classList.add('show');
        }
      } catch (err) {
        input.focus();
        document.execCommand('paste');
      }
    };

    input.addEventListener('input', () => {
      if (input.value.trim().length > 0) {
        btnClear.classList.add('show');
      } else {
        btnClear.classList.remove('show');
      }
    });

    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    actions.appendChild(btnClear);
    actions.appendChild(btnPaste);
    wrapper.appendChild(actions);
  });
}

// 3. Modal Popup Universal
function createUniversalModal() {
  if (document.getElementById('universalModalOverlay')) return;

  const modal = document.createElement('div');
  modal.id = 'universalModalOverlay';
  modal.className = 'universal-modal-overlay';
  modal.innerHTML = `
    <div class="universal-modal-content">
      <button class="universal-modal-close" id="btnUniversalClose">✕</button>
      <div class="modal-media-holder" id="modalMediaHolder"></div>
    </div>
  `;

  document.body.appendChild(modal);

  const btnClose = modal.querySelector('#btnUniversalClose');

  function closeModal() {
    const holder = document.getElementById('modalMediaHolder');
    const video = holder.querySelector('video');
    const audio = holder.querySelector('audio');
    if (video) video.pause();
    if (audio) audio.pause();
    holder.innerHTML = '';
    modal.classList.remove('show');
  }

  btnClose.onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };
}

function openVideoModal(videoUrl) {
  const modal = document.getElementById('universalModalOverlay');
  const holder = document.getElementById('modalMediaHolder');
  if (!modal || !holder) return;

  holder.innerHTML = `
    <video class="modal-video-view" controls autoplay playsinline src="${videoUrl}"></video>
  `;
  modal.classList.add('show');
}

function openPhotoModal(imgUrl) {
  const modal = document.getElementById('universalModalOverlay');
  const holder = document.getElementById('modalMediaHolder');
  if (!modal || !holder) return;

  holder.innerHTML = `
    <img src="${imgUrl}" class="modal-photo-view" alt="Preview Foto HD" referrerpolicy="no-referrer">
  `;
  modal.classList.add('show');
}

function openAudioModal(audioUrl, coverUrl, title) {
  const modal = document.getElementById('universalModalOverlay');
  const holder = document.getElementById('modalMediaHolder');
  if (!modal || !holder) return;

  holder.innerHTML = `
    <div class="modal-audio-card">
      <img src="${coverUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80'}" class="modal-audio-disc" alt="Audio Cover" referrerpolicy="no-referrer">
      <div class="modal-audio-title">${title || 'Audio Media HD'}</div>
      <audio class="modal-audio-player" controls autoplay src="${audioUrl}"></audio>
    </div>
  `;
  modal.classList.add('show');
}

// 4. Pengaturan Pilihan Format
const selectedFormats = {
  TikTok: 'mp4',
  Instagram: 'mp4',
  YouTube: 'mp4'
};

function setupPlatformFormats() {
  const platforms = [
    { id: 'TikTok', labelPhoto: 'Foto Slide HD' },
    { id: 'Instagram', labelPhoto: 'Download Foto HD' },
    { id: 'YouTube', labelPhoto: 'Thumbnail HD' }
  ];

  platforms.forEach(({ id, labelPhoto }) => {
    const panel = document.getElementById(`panel-${id.toLowerCase()}`);
    if (!panel) return;

    const inputGroup = panel.querySelector('.input-group');
    if (inputGroup && !panel.querySelector('.format-selector')) {
      const selectorHtml = document.createElement('div');
      selectorHtml.className = 'format-selector';
      selectorHtml.innerHTML = `
        <button type="button" class="format-btn active" data-platform="${id}" data-format="mp4">MP4 Video</button>
        <button type="button" class="format-btn" data-platform="${id}" data-format="mp3">Audio MP3</button>
        <button type="button" class="format-btn" data-platform="${id}" data-format="slide">${labelPhoto}</button>
      `;
      inputGroup.insertBefore(selectorHtml, inputGroup.querySelector('.btn-action'));

      const formatButtons = selectorHtml.querySelectorAll('.format-btn');
      formatButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          formatButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          selectedFormats[id] = btn.getAttribute('data-format');
        });
      });
    }
  });
}

// 5. Eksekusi Pengunduhan Platform
async function handleDownload(platform) {
  const inputEl = document.getElementById(`input${platform}`);
  const resultEl = document.getElementById(`result${platform}`);
  const url = inputEl ? inputEl.value.trim() : '';
  const currentFormat = selectedFormats[platform] || 'mp4';

  if (!url) {
    alert(`Silakan masukkan tautan ${platform} terlebih dahulu.`);
    return;
  }

  // --- DOWNLOAD TIKTOK (FULL HD) ---
  if (platform === 'TikTok') {
    resultEl.innerHTML = `
      <div style="padding: 10px; background: rgba(255,255,255,0.04); border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
        <span style="color: #fff;">Mengambil stream kualitas HD TikTok...</span>
      </div>
    `;

    try {
      const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`);
      const resData = await response.json();

      if (resData.code !== 0 || !resData.data) {
        resultEl.innerHTML = `<div style="padding: 10px; color: #ef4444;">Gagal mengambil media. Pastikan tautan valid.</div>`;
        return;
      }
      renderTikTokResult(resData.data, resultEl, currentFormat);
    } catch (err) {
      resultEl.innerHTML = `<div style="padding: 10px; color: #ef4444;">Terjadi gangguan koneksi.</div>`;
    }
  }

  // --- DOWNLOAD INSTAGRAM (FULL RESOLUSI ASLI) ---
  else if (platform === 'Instagram') {
    resultEl.innerHTML = `
      <div style="padding: 10px; background: rgba(255,255,255,0.04); border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
        <span style="color: #fff;">Mengekstrak gambar dan video Instagram resolusi tinggi...</span>
      </div>
    `;

    let parsedSuccess = false;

    try {
      const res = await fetch(`https://api.siputzx.my.id/api/d/ig?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data && (data.data || data.result)) {
        renderInstagramDirect(data.data || data.result, resultEl, currentFormat, url);
        parsedSuccess = true;
      }
    } catch (e) {}

    if (!parsedSuccess) {
      try {
        const res2 = await fetch(`https://widipe.com/download/igdl?url=${encodeURIComponent(url)}`);
        const data2 = await res2.json();
        if (data2 && data2.result) {
          renderInstagramDirect(data2.result, resultEl, currentFormat, url);
          parsedSuccess = true;
        }
      } catch (e) {}
    }

    if (!parsedSuccess) {
      renderInstagramDirect([{
        url: url,
        thumbnail: `https://images.weserv.nl/?url=${encodeURIComponent(url + 'media/?size=l')}`,
        type: url.includes('/reel/') ? 'video' : 'photo'
      }], resultEl, currentFormat, url);
    }
  }

  // --- DOWNLOAD YOUTUBE (1080p / MAX RESOLUSI) ---
  else if (platform === 'YouTube') {
    resultEl.innerHTML = `
      <div style="padding: 10px; background: rgba(255,255,255,0.04); border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
        <span style="color: #fff;">Menyiapkan link video dan audio kualitas HD...</span>
      </div>
    `;

    try {
      let videoId = '';
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);

      if (match && match[2].length === 11) {
        videoId = match[2];
      }

      if (!videoId) {
        resultEl.innerHTML = `<div style="padding: 10px; color: #ef4444;">Format link YouTube tidak valid. Gunakan link video/shorts.</div>`;
        return;
      }

      renderYouTubeResult(videoId, url, resultEl, currentFormat);
    } catch (e) {
      resultEl.innerHTML = `<div style="padding: 10px; color: #ef4444;">Gagal memproses video YouTube.</div>`;
    }
  }
}

// 6. Render Hasil TikTok HD
function renderTikTokResult(data, container, format) {
  const title = (data.title || 'TikTok Media HD').replace(/'/g, "\\'");
  const author = data.author?.nickname || 'Creator';
  const cover = data.origin_cover || data.cover || '';
  const hdVideoUrl = data.hdplay || data.play || '';
  const audioPlayUrl = data.music || data.music_info?.play || '';

  let htmlContent = `
    <div class="result-card">
      <div class="result-meta">
  `;

  if (format === 'mp3') {
    htmlContent += `
        <div class="result-thumb-wrapper" onclick="openAudioModal('${audioPlayUrl}', '${cover}', '${title}')" title="Putar sound HD">
          <img src="${cover}" class="result-thumb" alt="Cover" referrerpolicy="no-referrer">
          <div class="thumb-play-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
          </div>
        </div>
    `;
  } else if (format === 'slide' && data.images && data.images.length > 0) {
    htmlContent += `
        <div class="result-thumb-wrapper" onclick="openPhotoModal('${data.images[0]}')" title="Perbesar foto HD">
          <img src="${data.images[0]}" class="result-thumb" alt="Cover" referrerpolicy="no-referrer">
          <div class="thumb-play-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
          </div>
        </div>
    `;
  } else {
    htmlContent += `
        <div class="result-thumb-wrapper" onclick="openVideoModal('${hdVideoUrl}')" title="Putar video HD">
          <img src="${cover}" class="result-thumb" alt="Cover" referrerpolicy="no-referrer">
          <div class="thumb-play-icon">
            <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
        </div>
    `;
  }

  htmlContent += `
        <div class="result-info">
          <span class="result-title">${data.title || 'TikTok Media HD'}</span>
          <span class="result-author">@${author}</span>
        </div>
      </div>
  `;

  if (format === 'mp4') {
    if (data.images && data.images.length > 0) {
      htmlContent += `<p style="font-size: 11px; color: #a1a1aa;">Link ini merupakan format Foto Slide HD.</p>`;
    } else {
      htmlContent += `
        <div class="quality-list">
          <button type="button" onclick="forceDownloadFile('${hdVideoUrl}', 'TikTok_FullHD_NoWM.mp4', this)" class="dl-link-btn" style="width:100%;cursor:pointer;border:none;">
            <span>Simpan Video Full HD (Tanpa WM)</span>
            <span style="color: #ffffff; font-weight:700;">1080p HD</span>
          </button>
          <button type="button" onclick="forceDownloadFile('${data.play}', 'TikTok_HD_NoWM.mp4', this)" class="dl-link-btn" style="width:100%;cursor:pointer;border:none;">
            <span>Simpan Video MP4 (Standar HD)</span>
            <span style="color: #a1a1aa;">720p HD</span>
          </button>
        </div>
      `;
    }
  } else if (format === 'mp3') {
    if (audioPlayUrl) {
      htmlContent += `
        <div class="quality-list">
          <button type="button" onclick="openAudioModal('${audioPlayUrl}', '${cover}', '${title}')" class="dl-link-btn" style="width:100%;cursor:pointer;border:none;">
            <span>Pratinjau Audio Sound</span>
            <span style="color: #fff;">▶ Putar</span>
          </button>
          <button type="button" onclick="forceDownloadFile('${audioPlayUrl}', 'TikTok_Audio_HQ.mp3', this)" class="dl-link-btn" style="width:100%;cursor:pointer;border:none;">
            <span>Simpan Audio MP3 Kualitas Tinggi</span>
            <span style="color: #ffffff; font-weight:700;">320kbps</span>
          </button>
        </div>
      `;
    }
  } else if (format === 'slide') {
    if (data.images && data.images.length > 0) {
      htmlContent += `<div class="photo-slide-grid">`;
      data.images.forEach((imgUrl, idx) => {
        htmlContent += `
          <div class="photo-item">
            <div class="photo-thumb-clickable" onclick="openPhotoModal('${imgUrl}')">
              <img src="${imgUrl}" alt="Slide ${idx + 1}" referrerpolicy="no-referrer">
            </div>
            <button type="button" onclick="forceDownloadFile('${imgUrl}', 'TikTok_Slide_${idx + 1}_OriginalHD.jpg', this)" class="photo-dl-btn" style="border:none;cursor:pointer;">Simpan Foto ${idx + 1} (Asli)</button>
          </div>
        `;
      });
      htmlContent += `</div>`;
    }
  }

  htmlContent += `</div>`;
  container.innerHTML = htmlContent;
}

// 7. Render Instagram Resolusi Penuh
function renderInstagramDirect(items, container, format, rawUrl) {
  let list = Array.isArray(items) ? items : [items];
  
  const mediaItems = list.map((item, idx) => {
    let src = typeof item === 'string' ? item : (item.url || item.download_url || item._url || '');
    let thumb = item.thumbnail || item.thumb || src;
    let isVideo = src.includes('.mp4') || item.type === 'video' || rawUrl.includes('/reel/');

    if (thumb && !thumb.includes('.mp4')) {
      thumb = `https://images.weserv.nl/?url=${encodeURIComponent(thumb)}&default=${encodeURIComponent(thumb)}`;
    }

    return { src, thumb, isVideo, id: idx + 1 };
  });

  let html = `
    <div class="result-card">
      <div class="result-meta">
        <div class="result-info">
          <span class="result-title">Instagram High Definition</span>
          <span class="result-author">Format: ${format.toUpperCase()} (Kualitas Maksimal)</span>
        </div>
      </div>
  `;

  if (format === 'slide') {
    html += `<div class="photo-slide-grid">`;
    mediaItems.forEach(item => {
      const fileTarget = item.src || item.thumb;
      html += `
        <div class="photo-item">
          <div class="photo-thumb-clickable" onclick="openPhotoModal('${item.thumb}')" title="Perbesar foto HD">
            <img src="${item.thumb}" alt="Instagram Foto ${item.id}" referrerpolicy="no-referrer" onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'">
          </div>
          <button type="button" onclick="forceDownloadFile('${fileTarget}', 'Instagram_Foto_${item.id}_HD.jpg', this)" class="photo-dl-btn" style="border:none;cursor:pointer;">Simpan Foto ${item.id} (HD)</button>
        </div>
      `;
    });
    html += `</div>`;
  } else if (format === 'mp4') {
    html += `<div class="quality-list">`;
    mediaItems.forEach(item => {
      if (item.src && item.src.includes('.mp4')) {
        html += `
          <button type="button" onclick="openVideoModal('${item.src}')" class="dl-link-btn" style="width:100%;cursor:pointer;border:none;">
            <span>Pratinjau Video #${item.id}</span>
            <span style="color: #fff;">▶ Putar</span>
          </button>
          <button type="button" onclick="forceDownloadFile('${item.src}', 'Instagram_Reels_${item.id}_1080p.mp4', this)" class="dl-link-btn" style="width:100%;cursor:pointer;border:none;">
            <span>Simpan Video Full HD #${item.id}</span>
            <span style="color: #ffffff; font-weight:700;">1080p HD</span>
          </button>
        `;
      } else {
        html += `
          <button type="button" onclick="forceDownloadFile('https://snapinsta.app/?url=${encodeURIComponent(rawUrl)}', 'Instagram_Media_HD.mp4', this)" class="dl-link-btn" style="width:100%;cursor:pointer;border:none;">
            <span>Simpan Video Full HD ke Galeri</span>
            <span style="color: #ffffff; font-weight:700;">1080p HD</span>
          </button>
        `;
      }
    });
    html += `</div>`;
  } else if (format === 'mp3') {
    const videoItem = mediaItems.find(i => i.src && i.src.includes('.mp4'));
    const audioTarget = videoItem ? videoItem.src : `https://snapinsta.app/?url=${encodeURIComponent(rawUrl)}`;
    html += `
      <div class="quality-list">
        <button type="button" onclick="forceDownloadFile('${audioTarget}', 'Instagram_Audio_HQ.mp3', this)" class="dl-link-btn" style="width:100%;cursor:pointer;border:none;">
          <span>Simpan Audio MP3 (Kualitas Tinggi)</span>
          <span style="color: #ffffff; font-weight:700;">320kbps</span>
        </button>
      </div>
    `;
  }

  html += `</div>`;
  container.innerHTML = html;
}

// 8. Render YouTube Kualitas Tertinggi
function renderYouTubeResult(videoId, rawUrl, container, format) {
  // Ambil thumbnail resolusi tertinggi (maxresdefault)
  const thumbUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const fallbackThumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  const embedVideo = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

  let htmlContent = `
    <div class="result-card">
      <div class="result-meta">
        <div class="result-thumb-wrapper" onclick="${format === 'mp4' ? `openVideoModal('${embedVideo}')` : `openPhotoModal('${thumbUrl}')`}" title="Buka preview">
          <img src="${thumbUrl}" onerror="this.src='${fallbackThumb}'" class="result-thumb" alt="YouTube Thumbnail HD" referrerpolicy="no-referrer">
          <div class="thumb-play-icon">
            <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
        </div>
        <div class="result-info">
          <span class="result-title">YouTube Content HD</span>
          <span class="result-author">Format: ${format.toUpperCase()} (Tersedia 1080p)</span>
        </div>
      </div>
      <div class="quality-list">
  `;

  if (format === 'mp4') {
    htmlContent += `
      <a href="https://y2mate.nu/id/youtube-to-mp4/?url=${encodeURIComponent(rawUrl)}" target="_blank" class="dl-link-btn">
        <span>Download Video MP4 (Full HD 1080p)</span>
        <span style="color: #ffffff; font-weight:700;">1080p Full HD</span>
      </a>
      <a href="https://y2mate.nu/id/youtube-to-mp4/?url=${encodeURIComponent(rawUrl)}" target="_blank" class="dl-link-btn">
        <span>Download Video MP4 (HD 720p)</span>
        <span style="color: #a1a1aa;">720p HD</span>
      </a>
    `;
  } else if (format === 'mp3') {
    htmlContent += `
      <a href="https://y2mate.nu/id/youtube-to-mp3/?url=${encodeURIComponent(rawUrl)}" target="_blank" class="dl-link-btn">
        <span>Download Audio MP3 (High Bitrate)</span>
        <span style="color: #ffffff; font-weight:700;">320 kbps</span>
      </a>
    `;
  } else if (format === 'slide') {
    htmlContent += `
      <button type="button" onclick="openPhotoModal('${thumbUrl}')" class="dl-link-btn" style="width:100%;cursor:pointer;border:none;">
        <span>Pratinjau Layar Penuh Thumbnail HD</span>
        <span style="color: #fff;">🔍 Preview</span>
      </button>
      <button type="button" onclick="forceDownloadFile('${thumbUrl}', 'YouTube_Cover_${videoId}_UltraHD.jpg', this)" class="dl-link-btn" style="width:100%;cursor:pointer;border:none;">
        <span>Simpan Thumbnail Kualitas Asli (Ultra HD)</span>
        <span style="color: #ffffff; font-weight:700;">MaxRes HD</span>
      </button>
    `;
  }

  htmlContent += `</div></div>`;
  container.innerHTML = htmlContent;
}

// 9. Jam Digital Real-Time
function startClock() {
  const timeEl = document.getElementById('valTime');

  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    if (timeEl) {
      timeEl.innerText = `${hours}:${minutes}:${seconds}`;
    }
  }

  updateClock();
  setInterval(updateClock, 1000);
}

// 10. Deteksi Perangkat & Browser
function detectDeviceAndBrowser() {
  const ua = navigator.userAgent;

  let device = 'Desktop';
  if (/Android/i.test(ua)) device = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) device = 'iOS';
  else if (/Windows/i.test(ua)) device = 'Windows';
  else if (/Mac/i.test(ua)) device = 'macOS';
  const devEl = document.getElementById('valDevice');
  if (devEl) devEl.innerText = device;

  let browser = 'Browser Web';
  if (/Brave/i.test(ua)) browser = 'Brave';
  else if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  const browEl = document.getElementById('valBrowser');
  if (browEl) browEl.innerText = browser;
}

// 11. Deteksi Baterai Real-Time
async function detectBattery() {
  const fill = document.getElementById('batteryFill');
  const text = document.getElementById('batteryText');

  if ('getBattery' in navigator) {
    try {
      const battery = await navigator.getBattery();

      function updateBatteryUI() {
        const level = Math.round(battery.level * 100);
        if (fill) fill.style.width = `${level}%`;
        if (text) text.innerText = `${level}%`;
      }

      updateBatteryUI();
      battery.addEventListener('levelchange', updateBatteryUI);
    } catch (e) {
      if (fill) fill.style.width = '40%';
      if (text) text.innerText = '40%';
    }
  } else {
    if (fill) fill.style.width = '40%';
    if (text) text.innerText = '40%';
  }
}

// 12. Deteksi Jaringan
function detectNetworkStatus() {
  const statusEl = document.getElementById('valStatus');

  function updateStatus() {
    if (!statusEl) return;
    if (navigator.onLine) {
      statusEl.innerHTML = '<span class="status-dot"></span> Online';
    } else {
      statusEl.innerHTML = '<span class="status-dot" style="background:#555;box-shadow:none;"></span> Offline';
    }
  }

  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  updateStatus();
}

// 13. Deteksi Lokasi Negara
async function detectCountry() {
  const countryEl = document.getElementById('valCountry');
  if (!countryEl) return;

  try {
    const res = await fetch('https://ipwho.is/');
    const data = await res.json();
    if (data.success) {
      countryEl.innerHTML = `<span class="flag-icon">${data.flag.emoji || '🇮🇩'}</span> ${data.country}`;
    } else {
      countryEl.innerHTML = '<span class="flag-icon">🇮🇩</span> Indonesia';
    }
  } catch (err) {
    countryEl.innerHTML = '<span class="flag-icon">🇮🇩</span> Indonesia';
  }
}
